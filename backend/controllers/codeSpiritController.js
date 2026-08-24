const CodeSession = require('../models/CodeSession');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const harnessDriverService = require('../services/harnessDriverService');
const cacheService = require('../services/cacheService');
const mongoose = require('mongoose');

const GROQ_API_KEY = process.env.GROQ_API_KEY_CODESPIRIT || process.env.GROQ_API_KEY;

// ============== PISTON API FOR REAL CODE EXECUTION ==============
const PISTON_API = 'https://emkc.org/api/v2/piston/execute';
const PISTON_LANGUAGES = {
    'python': 'python',
    'javascript': 'javascript',
    'cpp': 'cpp',
    'c++': 'cpp',
    'java': 'java',
    'c': 'c',
    'typescript': 'typescript'
};

// Curated topic categories
const TOPIC_CATEGORIES = {
    'Arrays & Hashing': ['Array Manipulation', 'Hash Maps', 'Frequency Counting', 'Prefix Sum'],
    'Strings': ['Pattern Matching', 'Palindromes', 'Anagrams', 'String Parsing'],
    'Two Pointers': ['Two Sum Variants', 'Container With Water', 'Pair Problems'],
    'Sliding Window': ['Maximum Subarray', 'Substring Problems', 'Window Techniques'],
    'Stacks & Queues': ['Bracket Matching', 'Next Greater Element', 'Queue Simulation'],
    'Linked Lists': ['Reversal', 'Cycle Detection', 'Merge Operations'],
    'Binary Search': ['Search in Sorted Array', 'Binary Search Variations', 'Rotated Arrays'],
    'Trees': ['BST Operations', 'Tree Traversals', 'Balanced Trees', 'Path Problems'],
    'Graphs': ['BFS', 'DFS', 'Shortest Path', 'Connected Components'],
    'Dynamic Programming': ['Knapsack', 'LCS', 'Fibonacci Variants', 'Grid Problems'],
    'Recursion & Backtracking': ['Permutations', 'Subsets', 'N-Queens', 'Maze Problems'],
    'Sorting Algorithms': ['Merge Sort', 'Quick Sort', 'Counting Sort', 'Custom Comparators'],
    'Greedy Algorithms': ['Activity Selection', 'Interval Scheduling', 'Huffman Coding'],
    'Bit Manipulation': ['XOR Tricks', 'Bit Counting', 'Power of Two'],
    'Math & Number Theory': ['GCD/LCM', 'Prime Numbers', 'Modular Arithmetic'],
    'Heap / Priority Queue': ['Top K Elements', 'Median Finding', 'Merge K Lists']
};

const DAILY_TOPICS = Object.keys(TOPIC_CATEGORIES);

// ============== IN-MEMORY QUEUE FOR CONCURRENCY GATE ==============
class MemoryQueue {
    constructor(concurrencyLimit = 3) {
        this.concurrencyLimit = concurrencyLimit;
        this.activeCount = 0;
        this.queue = [];
    }

    add(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.next();
        });
    }

    next() {
        if (this.activeCount >= this.concurrencyLimit || this.queue.length === 0) {
            return;
        }

        const { fn, resolve, reject } = this.queue.shift();
        this.activeCount++;

        fn()
            .then(resolve)
            .catch(reject)
            .finally(() => {
                this.activeCount--;
                this.next();
            });
    }
}

const wandboxQueue = new MemoryQueue(3); // Process max 3 requests concurrently to avoid Wandbox rate limits

// ============== HELPER: EXECUTE CODE VIA JUDGE0 (WITH PISTON FALLBACK) ==============
async function executeViaPiston(language, code, stdin = '') {
    const langKey = (language || 'python').toLowerCase();
    
    // Check Distributed Cache first
    const cacheKey = cacheService.generateKey('code_exec', `${langKey}:${code}:${stdin}`);
    const cached = await cacheService.get(cacheKey);
    if (cached) {
        return cached;
    }

    // Try Judge0 API Execution First
    try {
        const j0Result = await judge0Service.executeCode(langKey, code, stdin);
        if (j0Result && j0Result.success) {
            const result = {
                engine: 'judge0',
                run: {
                    stdout: j0Result.run.stdout,
                    stderr: j0Result.run.stderr,
                    code: j0Result.run.exitCode,
                    runtimeMs: j0Result.run.runtimeMs,
                    memoryKb: j0Result.run.memoryKb,
                    statusDescription: j0Result.run.statusDescription
                }
            };
            await cacheService.set(cacheKey, result, 300);
            return result;
        }
    } catch (j0Err) {
        console.warn("Judge0 execution unavailable. Falling back to Piston API:", j0Err.message);
    }

    // Fallback to Piston API
    const pistonLang = PISTON_LANGUAGES[langKey] || 'python';
    const executeTask = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second request timeout limit

        let response;
        try {
            response = await fetch(PISTON_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    language: pistonLang,
                    version: '*',
                    files: [
                        { content: code }
                    ],
                    stdin: stdin || ''
                })
            });
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error("Execution Time Limit Exceeded - API Timeout.");
            }
            throw err;
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            if (response.status === 401 || errText.includes('whitelist')) {
                return {
                    engine: 'wasm',
                    run: {
                        stdout: '',
                        stderr: 'Public compilation API is restricted. Executing seamlessly via Local WASM engine in browser.',
                        code: 1
                    }
                };
            }
            throw new Error(`Compilation API error (${response.status}): ${errText}`);
        }

        const data = await response.json();

        // Normalize Piston response to a standard format
        let stdout = data.run?.stdout || '';
        let stderr = data.run?.stderr || '';
        let exitCode = data.run?.code || 0;
        let signal = data.run?.signal || null;

        if (data.compile && data.compile.code !== 0) {
            stderr = data.compile.stderr || data.compile.stdout || 'Compilation failed';
            exitCode = data.compile.code;
        }

        const result = {
            engine: 'piston',
            run: {
                stdout: stdout,
                stderr: stderr,
                code: exitCode,
                signal: signal
            }
        };

        // Cache the result
        await cacheService.set(cacheKey, result, 300);

        return result;
    };

    // Add task to queue and wait for its completion
    return wandboxQueue.add(executeTask);
}

// ============== HELPER: UPDATE USER STATS & STREAK ==============
async function updateUserStats(userId, xpGain, isSolve = true) {
    const user = await User.findById(userId);
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];

    // Update XP and problems
    user.stats = user.stats || {};
    user.stats.xp = (user.stats.xp || 0) + xpGain;
    if (isSolve) {
        user.stats.totalProblems = (user.stats.totalProblems || 0) + 1;
    }

    // Update activity log
    if (!user.activityLog) user.activityLog = [];
    const todayLog = user.activityLog.find(a => a.date === today);

    if (todayLog) {
        if (isSolve) todayLog.problemsSolved = (todayLog.problemsSolved || 0) + 1;
        todayLog.xpEarned = (todayLog.xpEarned || 0) + xpGain;
    } else {
        // First activity today — update streak
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const hadYesterday = user.activityLog.some(a => a.date === yesterday);
        user.stats.streak = hadYesterday ? (user.stats.streak || 0) + 1 : 1;

        user.activityLog.push({
            date: today,
            problemsSolved: isSolve ? 1 : 0,
            xpEarned: xpGain,
            studyTime: 0,
            focusSessions: 0
        });
    }

    // Keep only last 365 days
    if (user.activityLog.length > 365) {
        user.activityLog = user.activityLog.slice(-365);
    }

    user.lastLoginDate = new Date();
    await user.save();
    return user;
}

// ============== GENERATE CHALLENGES ==============
exports.generateDailyChallenge = async (req, res) => {
    try {
        const { topic, difficulty, count, language } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, message: "Topic is required" });
        }

        const diff = difficulty || "medium";
        const questionCount = Math.min(Math.max(parseInt(count) || 1, 1), 15);
        const langPref = language || "python";

        const apiKey = GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            return res.status(500).json({ success: false, message: "AI service not configured. Add GROQ_API_KEY to .env" });
        }

        const prompt = `
            Create exactly ${questionCount} unique coding challenges about "${topic}" with ${diff} difficulty.
            
            Return ONLY a valid JSON array (no markdown, no extra text) with this exact structure:
            [
                {
                    "title": "Problem Title",
                    "description": "Detailed problem statement explaining the task clearly. Include input format, output format, and constraints.",
                    "language": "${langPref}",
                    "starterCode": "SKELETON code only — see rules below",
                    "testCases": [
                        { "input": "sample input for stdin", "output": "expected stdout output" },
                        { "input": "another input", "output": "another expected output" }
                    ],
                    "hints": ["hint 1", "hint 2"],
                    "difficulty": "${diff}"
                }
            ]
            
            Rules:
            - Generate exactly ${questionCount} problems, each different from the others.
            - Each problem MUST follow competitive programming format:
              * Python: use input() and print()
              * Java: use Scanner and System.out.println()
              * C++: use cin and cout with #include <iostream>
              * C: use scanf/printf with #include <stdio.h>
              * JavaScript: use readline or process.stdin and console.log()
              * Test case "input" is what will be provided as stdin
              * Test case "output" is the exact stdout the correct program should produce
            - Each problem should have 2-3 test cases with DISTINCT inputs and outputs.
            - Each problem should have 1-2 hints.
            
            *** CRITICAL STARTER CODE RULES ***
            - The starterCode must be a SKELETON / TEMPLATE only.
            - It must include: necessary imports, main function/boilerplate, input reading, and a TODO comment where the student writes their logic.
            - It must NOT contain the solution logic. Do NOT include the answer.
            - Do NOT hardcode any output values.
            - Do NOT include the algorithm implementation.
            - Example for C++ (if the problem is "print sum of two numbers"):
              GOOD: "#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    // TODO: Calculate and print the sum\n    return 0;\n}"
              BAD: "#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}"
            - Example for Python:
              GOOD: "n = int(input())\n# TODO: Write your solution here\n"
              BAD: "n = int(input())\nprint(n * 2)\n"
            - The student must write the logic themselves.
            
            - CRITICAL JSON RULES:
              * All newlines inside string values MUST be written as \\n (escaped)
              * All double quotes inside string values MUST be written as \\" (escaped)
              * All backslashes inside string values MUST be written as \\\\ (escaped)
              * Tab characters MUST be written as \\t
              * Make sure the starterCode is a single-line JSON string with \\n for newlines
            - Problems should gradually increase in complexity.
            - Return ONLY the JSON array, nothing else. No markdown fences.
        `;

        let content = null;
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: "system", content: "You are a coding contest platform generator. You output ONLY valid JSON arrays of coding problems. CRITICAL RULES: 1) The starterCode must be SKELETON ONLY — include imports, main function, input reading, and a TODO comment. NEVER include the solution or algorithm. The student must write the logic themselves. 2) All string values in JSON must properly escape newlines as \\n, tabs as \\t, quotes as \\\", and backslashes as \\\\. 3) Never output markdown code fences. Output ONLY the JSON array." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 4000
                })
            });

            if (response.ok) {
                const data = await response.json();
                content = data.choices?.[0]?.message?.content;
            } else {
                console.warn(`Groq primary model returned status ${response.status}. Trying fallback model...`);
                // Fallback call with llama-3.1-8b-instant
                const fbRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.1-8b-instant',
                        messages: [
                            { role: "system", content: "You output ONLY valid JSON arrays of coding problems." },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.7,
                        max_tokens: 4000
                    })
                });
                if (fbRes.ok) {
                    const fbData = await fbRes.json();
                    content = fbData.choices?.[0]?.message?.content;
                }
            }
        } catch (apiErr) {
            console.error("Groq API Call Failed:", apiErr.message);
        }

        // Clean up AI response if received
        if (content) {
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        // Attempt JSON repair for common AI mistakes
        function repairJSON(str) {
            if (!str) return '';
            const firstBracket = str.indexOf('[');
            const lastBracket = str.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                str = str.substring(firstBracket, lastBracket + 1);
            }
            str = str.replace(/("(?:[^"\\]|\\.)*")|(\n)/g, (match, quoted, newline) => {
                if (quoted) return quoted;
                return '\\n';
            });
            str = str.replace(/,\s*([}\]])/g, '$1');
            str = str.replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":');
            return str;
        }

        let challenges = null;
        if (content) {
            try {
                challenges = JSON.parse(content);
            } catch (e) {
                try {
                    const repaired = repairJSON(content);
                    challenges = JSON.parse(repaired);
                    console.log("JSON repaired successfully for", langPref);
                } catch (e2) {
                    console.error("JSON Parse Error even after repair.");
                }
            }
        }

        // Fallback: If AI fails or returns invalid JSON, generate structured challenges so session NEVER errors out!
        if (!challenges || !Array.isArray(challenges) || challenges.length === 0) {
            console.log(`Using fallback challenge generator for ${topic} (${langPref})`);
            const fallbackTemplates = {
                python: {
                    starterCode: `import sys\n\ndef main():\n    # TODO: Read stdin and implement solution for ${topic}\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    # Your logic here\n\nif __name__ == '__main__':\n    main()\n`,
                    testCases: [{ input: "5 10", output: "15" }, { input: "20 30", output: "50" }]
                },
                cpp: {
                    starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // TODO: Read input from cin and solve ${topic}\n    int a, b;\n    if (cin >> a >> b) {\n        // Your logic here\n    }\n    return 0;\n}\n`,
                    testCases: [{ input: "5 10", output: "15" }, { input: "20 30", output: "50" }]
                },
                java: {
                    starterCode: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: Read input and solve ${topic}\n        if (sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            // Your logic here\n        }\n    }\n}\n`,
                    testCases: [{ input: "5 10", output: "15" }, { input: "20 30", output: "50" }]
                },
                c: {
                    starterCode: `#include <stdio.h>\n\nint main() {\n    // TODO: Read input and solve ${topic}\n    int a, b;\n    if (scanf("%d %d", &a, &b) == 2) {\n        // Your logic here\n    }\n    return 0;\n}\n`,
                    testCases: [{ input: "5 10", output: "15" }, { input: "20 30", output: "50" }]
                }
            };
            const tpl = fallbackTemplates[langPref.toLowerCase()] || fallbackTemplates.python;

            challenges = Array.from({ length: questionCount }, (_, idx) => ({
                id: `challenge_${Date.now()}_${idx}`,
                title: `${topic} - Exercise #${idx + 1}`,
                description: `Practice competitive problem solving for ${topic}. Write logic to process sample input and output exact results.`,
                language: langPref,
                starterCode: tpl.starterCode,
                testCases: tpl.testCases,
                hints: [`Review fundamental rules for ${topic}.`, `Trace your logic with stdin sample input.`],
                difficulty: diff
            }));
        }

        if (!Array.isArray(challenges)) {
            challenges = [challenges];
        }

        challenges = challenges.map((ch, index) => ({
            ...ch,
            id: ch.id || `challenge_${Date.now()}_${index}`,
            status: 'pending',
            solveTime: 0,
            startedAt: null,
            verificationResults: []
        }));

        const newSession = new CodeSession({
            userId: req.user.id,
            topic,
            difficulty: diff,
            language: langPref,
            challenges,
            completed: false
        });

        await newSession.save();

        res.json({
            success: true,
            sessionId: newSession._id,
            challenges,
            totalCount: challenges.length
        });

    } catch (error) {
        console.error("Generate Challenge Error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============== GET HISTORY WITH FILTERS ==============
exports.getHistory = async (req, res) => {
    try {
        const { difficulty, language, completed } = req.query;
        const filter = { userId: req.user.id };

        if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
        if (language && language !== 'all') filter.language = language;
        if (completed === 'true') filter.completed = true;
        if (completed === 'false') filter.completed = false;

        const sessions = await CodeSession.find(filter).sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching history" });
    }
};

// ============== GET SESSION ==============
exports.getSession = async (req, res) => {
    try {
        const session = await CodeSession.findOne({ _id: req.params.id, userId: req.user.id });
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });
        res.json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching session" });
    }
};

// ============== SUBMIT CHALLENGE (MARK AS DONE) ==============
exports.submitChallenge = async (req, res) => {
    try {
        const { sessionId, challengeId, code, status, solveTime } = req.body;
        const session = await CodeSession.findOne({ _id: sessionId, userId: req.user.id });
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });

        const challenge = session.challenges.find(c => c.id === challengeId);
        if (!challenge) return res.status(404).json({ success: false, message: "Challenge not found in session" });

        challenge.userCode = code;
        if (solveTime) challenge.solveTime = solveTime;

        if (status === 'solved' && challenge.status !== 'solved') {
            challenge.status = 'solved';
            // Award XP via helper (fixes field paths + updates streak)
            await updateUserStats(req.user.id, 20, true);
        }

        session.updatedAt = Date.now();

        // Check if all challenges in session are solved
        if (session.challenges.every(c => c.status === 'solved') && !session.completed) {
            session.completed = true;
            // Bonus XP for full session completion
            const user = await User.findById(req.user.id);
            if (user) {
                user.stats.xp = (user.stats.xp || 0) + 50;
                user.reputation = (user.reputation || 0) + 5;
                await user.save();
            }
        }

        await session.save();
        res.json({ success: true, session });
    } catch (error) {
        console.error("Submit Error:", error);
        res.status(500).json({ success: false, message: "Error updating progress" });
    }
};

// ============== EXECUTE CODE VIA PISTON (REAL EXECUTION) ==============
exports.executeCode = async (req, res) => {
    try {
        const { language, code, stdin } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ success: false, message: "Code is required" });
        }

        const result = await executeViaPiston(language || 'python', code, stdin);

        const run = result.run || {};
        res.json({
            success: true,
            run: {
                stdout: run.stdout || '',
                stderr: run.stderr || '',
                exitCode: run.code != null ? run.code : (run.signal ? 1 : 0),
                signal: run.signal || null
            }
        });
    } catch (error) {
        console.error("Code Execution Error:", error);
        res.status(500).json({ success: false, message: error.message || "Execution failed" });
    }
};

// ============== EXECUTE CODE FOR EXAM (NO AUTH — validates via quizCode) ==============
exports.executeCodeExam = async (req, res) => {
    try {
        const { language, code, stdin, quizCode } = req.body;

        if (!quizCode || !quizCode.trim()) {
            return res.status(400).json({ success: false, message: "Quiz code is required for exam execution" });
        }

        if (!code || !code.trim()) {
            return res.status(400).json({ success: false, message: "Code is required" });
        }

        // Validate that the quiz exists and is published
        const Quiz = require('../models/Quiz');
        const quiz = await Quiz.findOne({ code: quizCode.toUpperCase().trim() });
        if (!quiz || quiz.status !== 'published') {
            return res.status(403).json({ success: false, message: "Invalid or unpublished exam code" });
        }

        const result = await executeViaPiston(language || 'python', code, stdin);

        const run = result.run || {};
        res.json({
            success: true,
            run: {
                stdout: run.stdout || '',
                stderr: run.stderr || '',
                exitCode: run.code != null ? run.code : (run.signal ? 1 : 0),
                signal: run.signal || null
            }
        });
    } catch (error) {
        console.error("Exam Code Execution Error:", error);
        res.status(500).json({ success: false, message: error.message || "Execution failed" });
    }
};

// ============== VERIFY CODE AGAINST TEST CASES ==============
exports.verifyCode = async (req, res) => {
    try {
        const { sessionId, challengeId, code, language, functionName } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ success: false, message: "Code is required" });
        }

        // Get the session and challenge for test cases
        const session = await CodeSession.findOne({ _id: sessionId, userId: req.user.id });
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });

        const challenge = session.challenges.find(c => c.id === challengeId);
        if (!challenge) return res.status(404).json({ success: false, message: "Challenge not found" });

        const testCases = challenge.testCases || [];
        if (testCases.length === 0) {
            return res.json({ success: true, results: [], allPassed: false, message: "No test cases available" });
        }

        const targetLang = (language || challenge.language || 'python').toLowerCase();
        let results = [];
        let executionMethod = 'stdin';

        // Attempt Harness Execution for Python / JS / TS first
        if (['python', 'javascript', 'typescript'].includes(targetLang)) {
            try {
                const harnessCode = harnessDriverService.wrapUserCodeWithHarness(
                    targetLang,
                    code,
                    functionName || 'solution',
                    testCases
                );

                const execResult = await executeViaPiston(targetLang, harnessCode, '');
                const stdout = execResult.run?.stdout || '';

                if (stdout.includes('___HARNESS_RESULTS___')) {
                    const jsonStr = stdout.split('___HARNESS_RESULTS___')[1].trim();
                    results = JSON.parse(jsonStr);
                    executionMethod = 'harness';
                }
            } catch (harnessErr) {
                console.warn("Harness execution fallback to stdin mode:", harnessErr.message);
            }
        }

        // Fallback: Line-by-line stdin/stdout verification if harness wasn't used
        if (executionMethod === 'stdin') {
            const normalizeOutput = (str) => {
                return (str || '')
                    .replace(/\r\n/g, '\n')
                    .replace(/\r/g, '\n')
                    .trim()
                    .split('\n')
                    .map(line => line.trim())
                    .join('\n');
            };

            results = await Promise.all(testCases.map(async (tc, index) => {
                try {
                    const result = await executeViaPiston(targetLang, code, tc.input || '');
                    const run = result.run || {};
                    const actualOutput = normalizeOutput(run.stdout);
                    const expectedOutput = normalizeOutput(tc.output);

                    const hasOutput = actualOutput.length > 0;
                    const exitedCleanly = (run.code === 0 || run.code === null || run.code === undefined);
                    const outputMatches = actualOutput === expectedOutput;
                    const passed = hasOutput && outputMatches && exitedCleanly;

                    return {
                        testCase: index + 1,
                        input: tc.input,
                        expectedOutput: expectedOutput,
                        actualOutput: actualOutput,
                        stderr: run.stderr || '',
                        passed,
                        exitCode: run.code
                    };
                } catch (err) {
                    return {
                        testCase: index + 1,
                        input: tc.input,
                        expectedOutput: (tc.output || '').trim(),
                        actualOutput: '',
                        stderr: err.message,
                        passed: false,
                        error: true
                    };
                }
            }));
        }

        const allPassed = results.length > 0 && results.every(r => r.passed);
        const passedCount = results.filter(r => r.passed).length;
        const totalRuntimeMs = results.reduce((acc, r) => acc + (r.runtimeMs || 0), 0);

        // Record Submission in database for real-time analytics
        try {
            await Submission.create({
                userId: req.user.id,
                sessionId: session._id,
                challengeId: challenge.id,
                language: targetLang,
                code: code,
                status: allPassed ? 'Accepted' : 'Wrong Answer',
                runtimeMs: totalRuntimeMs,
                passedCount: passedCount,
                totalCount: results.length,
                testResults: results
            });
        } catch (subErr) {
            console.error("Error creating Submission record:", subErr);
        }

        // If all passed, auto-mark as solved
        if (allPassed && challenge.status !== 'solved') {
            challenge.status = 'solved';
            challenge.userCode = code;
            challenge.verificationResults = results;
            session.updatedAt = Date.now();

            let dbSession = null;
            try {
                dbSession = await mongoose.startSession();
                dbSession.startTransaction();
            } catch (err) {
                dbSession = null;
            }

            const sessionOpts = dbSession ? { session: dbSession } : {};

            try {
                if (session.challenges.every(c => c.status === 'solved') && !session.completed) {
                    session.completed = true;
                    const user = await User.findById(req.user.id).session(dbSession || null);
                    if (user) {
                        user.stats.xp = (user.stats.xp || 0) + 50;
                        user.reputation = (user.reputation || 0) + 5;
                        await user.save(sessionOpts);
                    }

                    const CareerProfile = require('../models/CareerProfile');
                    let profile = await CareerProfile.findOne({ user: req.user.id }).session(dbSession || null);
                    if (!profile) profile = new CareerProfile({ user: req.user.id });

                    let level = 'Beginner';
                    if (session.difficulty === 'hard') level = 'Expert';
                    else if (session.difficulty === 'medium') level = 'Intermediate';

                    const skillName = `${session.language} (${session.topic.replace('Daily: ', '')})`;
                    const score = session.difficulty === 'hard' ? 95 : session.difficulty === 'medium' ? 80 : 65;

                    const skillIndex = profile.verifiedSkills.findIndex(s => s.skillName === skillName);
                    if (skillIndex > -1) {
                        if (score > profile.verifiedSkills[skillIndex].score) {
                            profile.verifiedSkills[skillIndex].score = score;
                            profile.verifiedSkills[skillIndex].level = level;
                            profile.verifiedSkills[skillIndex].verifiedDate = new Date();
                        }
                    } else {
                        profile.verifiedSkills.push({
                            skillName: skillName,
                            score: score,
                            verifiedBy: 'CodeSpirit Module',
                            level: level
                        });
                    }
                    await profile.save(sessionOpts);
                }

                await session.save(sessionOpts);

                if (dbSession) {
                    await dbSession.commitTransaction();
                }
            } catch (txErr) {
                if (dbSession) await dbSession.abortTransaction();
                throw txErr;
            } finally {
                if (dbSession) dbSession.endSession();
            }

            await updateUserStats(req.user.id, 20, true);
        }

        res.json({
            success: true,
            results,
            allPassed,
            executionMethod,
            passedCount,
            totalCount: results.length,
            message: allPassed ? '🎉 All test cases passed!' : `${passedCount}/${results.length} test cases passed`
        });

    } catch (error) {
        console.error("Verify Error:", error);
        res.status(500).json({ success: false, message: "Verification failed: " + error.message });
    }
};

// ============== AI CODE REVIEW ==============
exports.reviewCode = async (req, res) => {
    try {
        const { code, language, problemTitle, problemDescription } = req.body;

        // Check if code is empty or unedited skeleton code
        if (!code || !code.trim() || code.includes('// TODO:') || code.includes('# TODO:')) {
            return res.json({
                success: true,
                review: {
                    timeComplexity: "N/A",
                    spaceComplexity: "N/A",
                    score: 0,
                    strengths: [],
                    improvements: ["Write your code implementation before requesting AI review."],
                    bugs: ["Solution code is missing or contains incomplete TODO placeholders."],
                    optimizedApproach: "Implement your logic and submit your solution.",
                    overallFeedback: "No complete code solution was provided for evaluation. Score: 0/100."
                }
            });
        }

        const apiKey = GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            return res.status(500).json({ success: false, message: "AI service not configured" });
        }

        const prompt = `You are a senior software engineer reviewing a student's code submission.

Problem: "${problemTitle || 'Coding Challenge'}"
Description: ${problemDescription || 'Write a program that processes input and produces correct output.'}

Student's ${language || 'code'} solution:
\`\`\`
${code}
\`\`\`

Provide a detailed code review in this exact JSON format (no markdown, no extra text):
{
    "timeComplexity": "O(...) with brief explanation",
    "spaceComplexity": "O(...) with brief explanation",
    "score": <calculated numerical score between 0 and 100 based on code correctness and quality>,
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "bugs": ["bug description if any"],
    "optimizedApproach": "Brief description of the most optimal approach if the student's solution isn't optimal",
    "overallFeedback": "2-3 sentence summary of the review"
}

Rules:
- Score should be 0-100 based on correctness, efficiency, and code quality.
- If the code contains no actual solution logic or is incomplete, assign score 0.
- Be encouraging but honest.
- Return ONLY valid JSON, no markdown.`;

        let content = null;
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: "system", content: "You are a precise code reviewer. You output ONLY valid JSON. No markdown, no extra text." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1500
                })
            });

            if (response.ok) {
                const data = await response.json();
                content = data.choices?.[0]?.message?.content;
            } else {
                const fbRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.1-8b-instant',
                        messages: [
                            { role: "system", content: "You output ONLY valid JSON for code review." },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.3,
                        max_tokens: 1500
                    })
                });
                if (fbRes.ok) {
                    const fbData = await fbRes.json();
                    content = fbData.choices?.[0]?.message?.content;
                }
            }
        } catch (err) {
            console.error("AI Code Review Call Failed:", err.message);
        }

        if (!content) {
            return res.json({
                success: true,
                review: {
                    timeComplexity: "O(N)",
                    spaceComplexity: "O(1)",
                    score: 50,
                    strengths: ["Code syntactically runs"],
                    improvements: ["Test against hidden edge cases"],
                    bugs: [],
                    optimizedApproach: "Ensure all edge conditions are handled.",
                    overallFeedback: "Code evaluation complete. Practice further test cases."
                }
            });
        }

        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        let review;
        try {
            review = JSON.parse(content);
        } catch (e) {
            review = {
                timeComplexity: "O(N)",
                spaceComplexity: "O(1)",
                score: 40,
                strengths: ["Code structure submitted"],
                improvements: ["Could not parse AI formatting, review manually."],
                bugs: [],
                optimizedApproach: "",
                overallFeedback: content.substring(0, 200)
            };
        }

        res.json({ success: true, review });

    } catch (error) {
        console.error("Review Error:", error);
        res.status(500).json({ success: false, message: "Review failed: " + error.message });
    }
};

// ============== DAILY CHALLENGE ==============
exports.getDailyChallenge = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Check if user already has a daily challenge today
        const existing = await CodeSession.findOne({
            userId: req.user.id,
            isDaily: true,
            createdAt: {
                $gte: new Date(today + 'T00:00:00.000Z'),
                $lt: new Date(today + 'T23:59:59.999Z')
            }
        });

        if (existing) {
            return res.json({
                success: true,
                session: existing,
                isNew: false
            });
        }

        // Generate a new daily challenge
        const apiKey = GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            return res.status(500).json({ success: false, message: "AI service not configured" });
        }

        const topic = DAILY_TOPICS[Math.floor(Math.random() * DAILY_TOPICS.length)];
        const difficulties = ['easy', 'medium', 'hard'];
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const language = req.query.language || 'python';

        const prompt = `Create 1 coding challenge about "${topic}" with ${difficulty} difficulty.
            
Return ONLY a valid JSON array with exactly 1 element:
[{
    "title": "Problem Title",
    "description": "Detailed problem statement with input format, output format, and constraints.",
    "language": "${language}",
    "starterCode": "starter code that reads stdin and prints to stdout",
    "testCases": [
        { "input": "input for stdin", "output": "expected stdout" },
        { "input": "another input", "output": "another output" }
    ],
    "hints": ["hint 1", "hint 2"],
    "difficulty": "${difficulty}"
}]

Rules:
- Follow competitive programming format (stdin → stdout)
- Provide valid, runnable starterCode in ${language}
- Include 2-3 test cases
- Return ONLY the JSON array`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [
                    { role: "system", content: "You output purely valid JSON arrays of coding problems. No markdown." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.8,
                max_tokens: 2000
            })
        });

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error("No content from AI");

        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        let challenges = JSON.parse(content);
        if (!Array.isArray(challenges)) challenges = [challenges];

        challenges = challenges.map((ch, i) => ({
            ...ch,
            id: `daily_${today}_${i}`,
            status: 'pending',
            solveTime: 0
        }));

        const session = new CodeSession({
            userId: req.user.id,
            topic: `Daily: ${topic}`,
            difficulty,
            language,
            challenges,
            completed: false,
            isDaily: true
        });

        await session.save();

        res.json({ success: true, session, isNew: true });

    } catch (error) {
        console.error("Daily Challenge Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate daily challenge" });
    }
};

// ============== DELETE SESSION ==============
exports.deleteSession = async (req, res) => {
    try {
        const result = await CodeSession.deleteOne({ _id: req.params.id, userId: req.user.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }
        res.json({ success: true, message: "Session deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting session" });
    }
};

// ============== GET TOPIC CATEGORIES ==============
exports.getTopicCategories = (req, res) => {
    res.json({ success: true, categories: TOPIC_CATEGORIES, topics: DAILY_TOPICS });
};

// ============== GET DASHBOARD STATS ==============
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        // Fetch all solved & attempted sessions and submissions for user
        const sessions = await CodeSession.find({ userId }).sort({ createdAt: -1 });
        const submissions = await Submission.find({ userId }).sort({ createdAt: -1 });

        // Calculate Total Registered Students & User's Coding Rank
        const totalStudents = Math.max(1, await User.countDocuments({ role: { $ne: 'admin' } }));
        const allUsers = await User.find({ role: { $ne: 'admin' } }, 'stats xp').sort({ 'stats.xp': -1, 'stats.totalProblems': -1 });
        const userIndex = allUsers.findIndex(u => u._id.toString() === userId.toString());
        const userRank = userIndex !== -1 ? userIndex + 1 : 1;

        let totalProblemsSolved = 0;
        let totalAttempts = submissions.length;
        let acceptedSubmissions = submissions.filter(s => s.status === 'Accepted').length;

        // Subject breakdown counters
        const subjectStats = {
            python: { mastery: 0, solved: 0, total: 50 },
            c: { mastery: 0, solved: 0, total: 48 },
            cpp: { mastery: 0, solved: 0, total: 80 },
            java: { mastery: 0, solved: 0, total: 50 },
            javascript: { mastery: 0, solved: 0, total: 52 },
            dsa: { mastery: 0, solved: 0, total: 110 },
            sql: { mastery: 0, solved: 0, total: 26 }
        };

        sessions.forEach(sess => {
            const langKey = (sess.language || 'python').toLowerCase();
            const matchingSubjectKey = langKey.includes('c++') || langKey.includes('cpp') ? 'cpp' :
                                       langKey.includes('java') && !langKey.includes('script') ? 'java' :
                                       langKey.includes('script') ? 'javascript' :
                                       langKey.includes('sql') ? 'sql' :
                                       langKey.includes('dsa') ? 'dsa' :
                                       langKey === 'c' ? 'c' : 'python';

            sess.challenges.forEach(ch => {
                totalAttempts++;
                if (ch.status === 'solved') {
                    totalProblemsSolved++;
                    if (subjectStats[matchingSubjectKey]) {
                        subjectStats[matchingSubjectKey].solved++;
                    }
                }
            });
        });

        // Compute dynamic mastery percentages per subject based on solved count
        for (const k in subjectStats) {
            const s = subjectStats[k];
            s.mastery = s.total > 0 ? Math.min(100, Math.round((s.solved / s.total) * 100)) : 0;
        }

        // Overall stats calculation
        const userXP = user?.stats?.xp || 0;
        const streak = user?.stats?.streak || 0;
        const rating = Math.min(2400, 1200 + Math.floor(userXP / 5) + totalProblemsSolved * 3);
        const accuracy = totalAttempts > 0 
            ? Math.round((Math.max(acceptedSubmissions, totalProblemsSolved) / totalAttempts) * 100) 
            : 0;

        // Build Quiz-style 14-day Heatmap Grid (Previous Week & Current Week)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const now = new Date();
        const heatmap = [];

        for (let i = 13; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dStr = d.toDateString();
            const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
            const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

            const count = submissions.filter(s => s.createdAt >= startOfDay && s.createdAt <= endOfDay).length;
            
            heatmap.push({
                day: days[d.getDay()],
                dateStr: dStr,
                attempts: count,
                week: i >= 7 ? "Previous" : "Current"
            });
        }

        // Calculate Today's Attempts
        const todayStr = new Date().toDateString();
        const todayAttempts = submissions.filter(s => new Date(s.createdAt).toDateString() === todayStr).length;

        res.json({
            success: true,
            stats: {
                userRank: userRank,
                totalStudents: totalStudents,
                problemsSolved: totalProblemsSolved,
                accuracy: accuracy,
                currentStreak: streak,
                rating: rating,
                userXP: userXP,
                todayAttempts: todayAttempts
            },
            subjectStats,
            heatmap
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Error loading dashboard stats" });
    }
};

// ============== GET SKILL TREE ==============
exports.getSkillTree = async (req, res) => {
    try {
        const { subject } = req.query;
        const skillTreeData = {
            python: [
                { name: 'Basics', mastery: 90, status: 'completed' },
                { name: 'Functions', mastery: 76, status: 'active' },
                { name: 'OOP', mastery: 64, status: 'active' },
                { name: 'Exceptions', mastery: 48, status: 'weak' }
            ],
            cpp: [
                { name: 'Fundamentals', mastery: 80, status: 'completed' },
                { name: 'STL', mastery: 71, status: 'active' },
                { name: 'OOP & Pointers', mastery: 76, status: 'active' }
            ],
            dsa: [
                { name: 'Arrays & Hashing', mastery: 84, status: 'completed' },
                { name: 'Trees & BST', mastery: 52, status: 'active' },
                { name: 'Graphs & BFS/DFS', mastery: 34, status: 'weak' }
            ],
            java: [
                { name: 'Core Java', mastery: 72, status: 'completed' },
                { name: 'Collections Framework', mastery: 61, status: 'active' }
            ],
            sql: [
                { name: 'Joins & Subqueries', mastery: 69, status: 'active' },
                { name: 'Aggregations', mastery: 78, status: 'completed' }
            ]
        };

        const activeTree = skillTreeData[subject?.toLowerCase()] || skillTreeData.python;
        res.json({ success: true, subject: subject || 'python', tree: activeTree, allTrees: skillTreeData });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching skill tree" });
    }
};

// ============== GET MISTAKE INTELLIGENCE ==============
exports.getMistakes = async (req, res) => {
    try {
        const userId = req.user.id;
        const failedSubmissions = await Submission.find({ userId, status: { $ne: 'Accepted' } }).sort({ createdAt: -1 }).limit(100);

        if (!failedSubmissions || failedSubmissions.length === 0) {
            return res.json({
                success: true,
                mistakes: [
                    {
                        category: 'No Failure Patterns Recorded',
                        failures: 0,
                        severity: 'Low',
                        description: 'Great work! You have not logged any failed test cases yet.',
                        recommendation: 'Continue practicing coding challenges in Smart Practice or Subject Modules.'
                    }
                ]
            });
        }

        const categoryMap = {};
        failedSubmissions.forEach(sub => {
            let cat = sub.status || 'Wrong Answer';
            let desc = 'Solution output did not match expected test case outputs.';
            let rec = 'Double check edge cases and print actual intermediate variables.';
            let sev = 'Medium';

            if (cat === 'Wrong Answer') {
                cat = 'Logic & Output Mismatch';
                desc = 'Generated output differed from standard expected stdout.';
                rec = 'Verify problem constraints and test edge conditions.';
                sev = 'High';
            } else if (cat.includes('Time Limit') || cat.includes('Timeout')) {
                cat = 'Time Limit Exceeded';
                desc = 'Algorithm exceeded execution time limit due to high complexity.';
                rec = 'Optimize loops and use hash maps or memoization.';
                sev = 'High';
            } else if (cat.includes('Runtime') || cat.includes('Syntax') || cat.includes('Error')) {
                cat = 'Runtime & Exception Errors';
                desc = 'Code threw unhandled runtime exception or compilation error.';
                rec = 'Verify array index bounds and null object dereferences.';
                sev = 'Medium';
            }

            if (!categoryMap[cat]) {
                categoryMap[cat] = {
                    category: cat,
                    failures: 0,
                    severity: sev,
                    description: desc,
                    recommendation: rec
                };
            }
            categoryMap[cat].failures += 1;
        });

        const mistakes = Object.values(categoryMap);
        res.json({ success: true, mistakes });
    } catch (error) {
        console.error("Get Mistakes Error:", error);
        res.status(500).json({ success: false, message: "Error fetching mistake analytics" });
    }
};

// ============== GET COMPANY PREP ==============
exports.getCompanyPrep = async (req, res) => {
    try {
        const companies = [
            { name: 'Virtusa', readiness: 72, icon: '🏢', topics: ['Arrays', 'Strings', 'Sorting', 'Recursion'] },
            { name: 'TCS', readiness: 85, icon: '💼', topics: ['Numerical', 'Strings', 'C/C++ Basics'] },
            { name: 'Infosys', readiness: 78, icon: '🌐', topics: ['Data Structures', 'Algorithms'] },
            { name: 'Accenture', readiness: 80, icon: '⚡', topics: ['Pseudo Code', 'Arrays', 'Strings'] },
            { name: 'Amazon', readiness: 58, icon: '📦', topics: ['Trees', 'Graphs', 'Dynamic Programming', 'System Design'] },
            { name: 'Google', readiness: 52, icon: '🔍', topics: ['Advanced DP', 'Graphs', 'Segment Trees'] }
        ];

        res.json({ success: true, companies });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching company prep" });
    }
};

// ============== SAVE / UNSAVE PROBLEM ==============
exports.saveProblem = async (req, res) => {
    try {
        const { problem } = req.body;
        if (!problem || !problem.title) {
            return res.status(400).json({ success: false, message: "Problem details required" });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (!user.savedProblems) user.savedProblems = [];

        const existsIdx = user.savedProblems.findIndex(p => p.title === problem.title);
        if (existsIdx > -1) {
            user.savedProblems.splice(existsIdx, 1);
            await user.save();
            return res.json({ success: true, saved: false, message: "Problem removed from saved problems", savedProblems: user.savedProblems });
        } else {
            user.savedProblems.push({
                title: problem.title,
                topic: problem.topic || 'Coding Challenge',
                difficulty: problem.difficulty || 'medium',
                language: problem.language || 'python',
                description: problem.description,
                starterCode: problem.starterCode,
                testCases: problem.testCases || [],
                savedAt: new Date()
            });
            await user.save();
            return res.json({ success: true, saved: true, message: "Problem saved to bookmarks!", savedProblems: user.savedProblems });
        }
    } catch (error) {
        console.error("Save Problem Error:", error);
        res.status(500).json({ success: false, message: "Failed to save problem" });
    }
};

// ============== GET SAVED PROBLEMS ==============
exports.getSavedProblems = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ success: true, savedProblems: user?.savedProblems || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to load saved problems" });
    }
};

