const CodeSession = require('../models/CodeSession');
const User = require('../models/User');

const GROQ_API_KEY = process.env.GROQ_API_KEY_CODESPIRIT || process.env.GROQ_API_KEY || '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';

// ============== WANDBOX API FOR REAL CODE EXECUTION ==============
const WANDBOX_API = 'https://wandbox.org/api/compile.json';
const WANDBOX_COMPILERS = {
    'python': 'cpython-3.12.7',
    'javascript': 'nodejs-20.17.0',
    'cpp': 'gcc-13.2.0',
    'c++': 'gcc-13.2.0',
    'java': 'openjdk-jdk-22+36',
    'c': 'gcc-13.2.0-c',
    'typescript': 'nodejs-20.17.0'
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

// ============== HELPER: EXECUTE CODE VIA WANDBOX API ==============
async function executeViaWandbox(language, code, stdin = '') {
    const langKey = language.toLowerCase();
    const compiler = WANDBOX_COMPILERS[langKey];
    if (!compiler) {
        throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(WANDBOX_COMPILERS).join(', ')}`);
    }

    // TypeScript needs transpilation hint — run as JS via Node
    let finalCode = code;
    if (langKey === 'typescript') {
        // Strip type annotations for basic TS execution via Node
        finalCode = code.replace(/:\s*(string|number|boolean|any|void|object|never|unknown)(\[\])?/g, '')
            .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
            .replace(/<[^>]+>/g, '');
    }

    // For C language, use C-specific options
    let options = '';
    if (langKey === 'c') {
        options = '-lm'; // Link math library for C
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second execution timeout limit

    let response;
    try {
        response = await fetch(WANDBOX_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                code: finalCode,
                compiler: compiler,
                stdin: stdin || '',
                options: options,
                'compiler-option-raw': langKey === 'c' ? '-std=c17' : (langKey === 'cpp' || langKey === 'c++') ? '-std=c++20' : ''
            })
        });
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new Error("Execution Time Limit Exceeded (8s timeout) - Possible Infinite Loop.");
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Wandbox API error (${response.status}): ${errText}`);
    }

    const data = await response.json();

    // Normalize Wandbox response to a standard format
    return {
        run: {
            stdout: data.program_output || '',
            stderr: data.program_error || data.compiler_error || '',
            code: parseInt(data.status) || 0,
            signal: data.signal || null
        }
    };
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

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("No content from AI");
        }

        // Clean up AI response
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        // Attempt JSON repair for common AI mistakes
        function repairJSON(str) {
            // Remove any leading/trailing non-JSON text
            const firstBracket = str.indexOf('[');
            const lastBracket = str.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                str = str.substring(firstBracket, lastBracket + 1);
            }

            // Fix unescaped newlines inside JSON string values
            // This regex finds content between quotes and escapes real newlines
            str = str.replace(/("(?:[^"\\]|\\.)*")|(\n)/g, (match, quoted, newline) => {
                if (quoted) return quoted; // leave properly quoted strings alone
                return '\\n'; // escape bare newlines
            });

            // Fix trailing commas before ] or }
            str = str.replace(/,\s*([}\]])/g, '$1');

            // Fix single quotes used instead of double quotes for keys
            str = str.replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":');

            return str;
        }

        let challenges;
        try {
            challenges = JSON.parse(content);
        } catch (e) {
            // Try repairing the JSON
            try {
                const repaired = repairJSON(content);
                challenges = JSON.parse(repaired);
                console.log("JSON repaired successfully for", langPref);
            } catch (e2) {
                console.error("JSON Parse Error (even after repair):", content.substring(0, 500));
                return res.status(500).json({ success: false, message: "AI generated invalid format. Try again." });
            }
        }

        if (!Array.isArray(challenges)) {
            challenges = [challenges];
        }

        challenges = challenges.map((ch, index) => ({
            ...ch,
            id: `challenge_${Date.now()}_${index}`,
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

        const result = await executeViaWandbox(language || 'python', code, stdin);

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

        const result = await executeViaWandbox(language || 'python', code, stdin);

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
        const { sessionId, challengeId, code, language } = req.body;

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

        // Normalize output for comparison (trim, normalize line endings, remove trailing newlines)
        const normalizeOutput = (str) => {
            return (str || '')
                .replace(/\r\n/g, '\n')  // Windows line endings
                .replace(/\r/g, '\n')    // Old Mac line endings
                .trim()                   // Remove leading/trailing whitespace
                .split('\n')             // Split into lines
                .map(line => line.trim()) // Trim each line
                .join('\n');             // Rejoin
        };

        // Run code against each test case sequentially to avoid Wandbox rate limiting (HTTP 429)
        const results = [];
        for (let index = 0; index < testCases.length; index++) {
            const tc = testCases[index];
            try {
                const result = await executeViaWandbox(language || challenge.language || 'python', code, tc.input || '');
                const run = result.run || {};
                const actualOutput = normalizeOutput(run.stdout);
                const expectedOutput = normalizeOutput(tc.output);

                // Strict comparison: must have actual output AND match expected
                const hasOutput = actualOutput.length > 0;
                const noErrors = !run.stderr || run.stderr.trim().length === 0;
                const exitedCleanly = (run.code === 0 || run.code === null || run.code === undefined);
                const outputMatches = actualOutput === expectedOutput;
                const passed = hasOutput && outputMatches && exitedCleanly;

                results.push({
                    testCase: index + 1,
                    input: tc.input,
                    expectedOutput: expectedOutput,
                    actualOutput: actualOutput,
                    stderr: run.stderr || '',
                    passed,
                    exitCode: run.code
                });
            } catch (err) {
                results.push({
                    testCase: index + 1,
                    input: tc.input,
                    expectedOutput: (tc.output || '').trim(),
                    actualOutput: '',
                    stderr: err.message,
                    passed: false,
                    error: true
                });
            }
        }
        const allPassed = results.every(r => r.passed);

        // If all passed, auto-mark as solved
        if (allPassed && challenge.status !== 'solved') {
            challenge.status = 'solved';
            challenge.userCode = code;
            challenge.verificationResults = results;
            session.updatedAt = Date.now();

            // Check full session completion
            if (session.challenges.every(c => c.status === 'solved') && !session.completed) {
                session.completed = true;
                const user = await User.findById(req.user.id);
                if (user) {
                    user.stats.xp = (user.stats.xp || 0) + 50;
                    user.reputation = (user.reputation || 0) + 5;
                    await user.save();
                }

                // --- Update CareerProfile Skill Passport ---
                const CareerProfile = require('../models/CareerProfile');
                let profile = await CareerProfile.findOne({ user: req.user.id });
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
                await profile.save();
                // -----------------------------------------
            }

            await session.save();
            await updateUserStats(req.user.id, 20, true);
        }

        res.json({
            success: true,
            results,
            allPassed,
            message: allPassed ? '🎉 All test cases passed!' : `${results.filter(r => r.passed).length}/${results.length} test cases passed`
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

        const apiKey = GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            return res.status(500).json({ success: false, message: "AI service not configured" });
        }

        const prompt = `You are a senior software engineer reviewing a student's code submission.

Problem: "${problemTitle}"
Description: ${problemDescription}

Student's ${language || 'code'} solution:
\`\`\`
${code}
\`\`\`

Provide a detailed code review in this exact JSON format (no markdown, no extra text):
{
    "timeComplexity": "O(...) with brief explanation",
    "spaceComplexity": "O(...) with brief explanation",
    "score": 85,
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "bugs": ["bug description if any"],
    "optimizedApproach": "Brief description of the most optimal approach if the student's solution isn't optimal",
    "overallFeedback": "2-3 sentence summary of the review"
}

Rules:
- Score should be 0-100 based on correctness, efficiency, and code quality
- Be encouraging but honest
- If code is empty or just starter code, score should be low
- Return ONLY valid JSON, no markdown`;

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

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content;

        if (!content) {
            return res.status(500).json({ success: false, message: "AI returned no review" });
        }

        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        let review;
        try {
            review = JSON.parse(content);
        } catch (e) {
            review = {
                timeComplexity: "Unable to analyze",
                spaceComplexity: "Unable to analyze",
                score: 0,
                strengths: [],
                improvements: ["Could not parse AI review. Try again."],
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
                model: 'llama-3.3-70b-versatile',
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
