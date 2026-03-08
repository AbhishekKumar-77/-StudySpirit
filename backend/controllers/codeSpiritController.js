const CodeSession = require('../models/CodeSession');
const User = require('../models/User');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ============== PISTON API FOR REAL CODE EXECUTION ==============
const PISTON_API = 'https://emkc.org/api/v2/piston/execute';
const PISTON_LANGS = {
    'python': { language: 'python', version: '3.10.0' },
    'javascript': { language: 'javascript', version: '18.15.0' },
    'cpp': { language: 'c++', version: '10.2.0' },
    'java': { language: 'java', version: '15.0.2' },
    'c': { language: 'c', version: '10.2.0' },
    'typescript': { language: 'typescript', version: '5.0.3' }
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

// ============== HELPER: EXECUTE CODE VIA PISTON API ==============
async function executeViaPiston(language, code, stdin = '') {
    const langKey = language.toLowerCase();
    const langConfig = PISTON_LANGS[langKey];
    if (!langConfig) {
        throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(PISTON_LANGS).join(', ')}`);
    }

    const response = await fetch(PISTON_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            language: langConfig.language,
            version: langConfig.version,
            files: [{ content: code }],
            stdin: stdin || '',
            run_timeout: 10000,
            compile_timeout: 10000
        })
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Piston API error (${response.status}): ${errText}`);
    }

    return await response.json();
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
                    "starterCode": "language specific starter code that reads from stdin and prints to stdout",
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
              * The starterCode MUST read input from stdin (input() in Python, Scanner in Java, cin in C++, readline in JS)
              * The starterCode MUST print output to stdout (print in Python, System.out.println in Java, cout in C++, console.log in JS)
              * Test case "input" is what will be provided as stdin
              * Test case "output" is the exact stdout the correct program should produce
            - Each problem should have 2-3 test cases.
            - Each problem should have 1-2 hints.
            - Provide the starterCode in ${langPref}. Make sure it is valid and runnable.
            - IMPORTANT: Preserve proper newlines (\\n) and indentation in starterCode.
            - Problems should gradually increase in complexity.
            - Return ONLY the JSON array, nothing else.
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
                    { role: "system", content: "You are a coding contest platform generator. You output purely valid JSON arrays of coding problems in competitive programming format (stdin/stdout). Never output markdown or extra text." },
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

        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        let challenges;
        try {
            challenges = JSON.parse(content);
        } catch (e) {
            console.error("JSON Parse Error:", content);
            return res.status(500).json({ success: false, message: "AI generated invalid format. Try again." });
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

        // Run code against each test case in parallel
        const results = await Promise.all(testCases.map(async (tc, index) => {
            try {
                const result = await executeViaPiston(language || challenge.language || 'python', code, tc.input || '');
                const run = result.run || {};
                const actualOutput = (run.stdout || '').trim();
                const expectedOutput = (tc.output || '').trim();
                const passed = actualOutput === expectedOutput;

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
