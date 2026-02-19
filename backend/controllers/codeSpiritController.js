// Using global fetch (Node 18+)

const GROQ_API_KEY = process.env.GROQ_API_KEY;

exports.generateDailyChallenge = async (req, res) => {
    try {
        const { topic, difficulty, count } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, message: "Topic is required" });
        }

        const diff = difficulty || "medium";
        const questionCount = Math.min(Math.max(parseInt(count) || 1, 1), 15); // Clamp 1-15

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
                    "description": "Detailed problem statement explaining the task clearly...",
                    "language": "python",
                    "starterCode": "def solve():\\n    pass",
                    "testCases": [
                        { "input": "...", "output": "..." },
                        { "input": "...", "output": "..." }
                    ],
                    "hints": ["hint 1", "hint 2"],
                    "difficulty": "${diff}"
                }
            ]
            
            Rules:
            - Generate exactly ${questionCount} problems, each different from the others.
            - Each problem should have 2-3 test cases.
            - Each problem should have 1-2 hints.
            - Choose Python or JavaScript as the language (whichever fits best for the topic).
            - Make sure each starterCode is valid and runnable.
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
                    { role: "system", content: "You are a coding contest platform generator. You output purely valid JSON arrays of coding problems. Never output markdown or extra text." },
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

        // Clean up markdown if present
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        let challenges;
        try {
            challenges = JSON.parse(content);
        } catch (e) {
            console.error("JSON Parse Error:", content);
            return res.status(500).json({ success: false, message: "AI generated invalid format. Try again." });
        }

        // Ensure it's an array
        if (!Array.isArray(challenges)) {
            challenges = [challenges];
        }

        // Add IDs to each challenge
        challenges = challenges.map((ch, index) => ({
            ...ch,
            id: `challenge_${Date.now()}_${index}`
        }));

        res.json({
            success: true,
            challenges,
            totalCount: challenges.length
        });

    } catch (error) {
        console.error("Generate Challenge Error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============== CODE EXECUTION (replaces Piston API) ==============
exports.executeCode = async (req, res) => {
    try {
        const { language, code, stdin } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ success: false, message: "Code is required" });
        }

        const apiKey = GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            return res.status(500).json({ success: false, message: "AI service not configured. Add GROQ_API_KEY to .env" });
        }

        const supportedLangs = ['python', 'java', 'cpp', 'c', 'c++', 'typescript', 'javascript'];
        const lang = (language || 'python').toLowerCase();

        if (!supportedLangs.includes(lang)) {
            return res.status(400).json({ success: false, message: `Language '${lang}' is not supported for execution.` });
        }

        const prompt = `You are a code execution engine. Execute the following ${lang} code mentally and return ONLY the exact output the program would produce.

CODE:
\`\`\`${lang}
${code}
\`\`\`

${stdin ? `STDIN INPUT:\n${stdin}\n` : ''}

RULES:
- Return ONLY the program's stdout output, nothing else.
- If the code has errors, return the error message in this exact format: "ERROR: <error description>"
- Do NOT explain, do NOT add commentary.
- Do NOT wrap in code blocks or quotes.
- If the program produces no output, return exactly: "(no output)"
- Execute the code exactly as a real compiler/interpreter would.
- Handle edge cases: infinite loops should return "ERROR: Execution timeout - possible infinite loop"
- For print/console.log/cout/printf/System.out.println, show each output on its own line exactly as it would appear.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: "system", content: "You are a precise code execution simulator. You output ONLY the exact stdout a program would produce. No explanations, no markdown, no extra text. Just the raw output." },
                    { role: "user", content: prompt }
                ],
                temperature: 0,
                max_tokens: 2000
            })
        });

        const data = await response.json();
        const output = data.choices?.[0]?.message?.content;

        if (!output) {
            return res.status(500).json({ success: false, message: "AI returned no output." });
        }

        // Check if it's an error
        const isError = output.trim().startsWith("ERROR:");

        res.json({
            success: true,
            run: {
                stdout: isError ? "" : output.trim(),
                stderr: isError ? output.trim().replace("ERROR: ", "") : "",
                exitCode: isError ? 1 : 0
            }
        });

    } catch (error) {
        console.error("Code Execution Error:", error);
        res.status(500).json({ success: false, message: "Execution failed", error: error.message });
    }
};
