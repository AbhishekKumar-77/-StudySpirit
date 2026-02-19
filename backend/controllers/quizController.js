const Quiz = require('../models/Quiz');
const User = require('../models/User');

// AI Question Generation
exports.generateAIQuestions = async (req, res) => {
    try {
        const { topic, difficulty, type, count } = req.body;
        const apiKey = "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"; // User provided key

        if (!topic) return res.status(400).json({ success: false, message: "Topic is required" });

        const prompt = `Generate ${count || 5} multiple choice questions about "${topic}" for ${difficulty || 'medium'} level students.
        Each question must have 4 options.
        Return a strictly valid JSON array of objects.
        Do not output any markdown code blocks, just the raw JSON.
        Structure per object:
        {
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct": 0, // Index of correct answer (0-3)
            "type": "${type || 'mcq'}",
            "difficulty": "${difficulty || 'medium'}"
        }`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are an educational AI assistant. Output strictly valid JSON arrays only. No markdown.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 6000
            })
        });

        const data = await response.json();

        if (!data.choices || !data.choices[0]?.message?.content) {
            throw new Error("Invalid response from AI provider");
        }

        let questions = [];
        const content = data.choices[0].message.content;

        try {
            questions = JSON.parse(content);
        } catch (e) {
            // Fallback cleaning and repair
            let cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                questions = JSON.parse(cleaned);
            } catch (e2) {
                // If parsing fails (e.g. truncation), try to extract complete objects
                // Regex to find JSON objects: starts with { and ends with } 
                // This simple regex assumes no nested braces in question text, which is risky but often works for this structure
                // Better: rely on the fact that these are specific question objects
                const objectMatches = cleaned.match(/\{[\s\S]*?\}(?=\s*,|\s*\])/g);

                if (objectMatches) {
                    questions = objectMatches.map(str => {
                        try { return JSON.parse(str); } catch { return null; }
                    }).filter(q => q !== null);
                } else {
                    // Try to find the last valid closing brace and append ]
                    const lastBrace = cleaned.lastIndexOf('}');
                    if (lastBrace !== -1) {
                        const repaired = cleaned.substring(0, lastBrace + 1) + ']';
                        try {
                            questions = JSON.parse(repaired);
                        } catch (e3) {
                            throw new Error("Failed to parse AI response. Try reducing the question count.");
                        }
                    } else {
                        throw e;
                    }
                }
            }
        }

        // Must be array
        if (!Array.isArray(questions)) {
            // If object returned wrapped in something?
            if (questions.questions) questions = questions.questions;
            else throw new Error("AI did not return an array");
        }

        // Add IDs
        questions = questions.map((q, i) => ({
            ...q,
            id: Date.now() + i,
            options: q.options || ["True", "False"], // Safety fallback
            correct: typeof q.correct === 'number' ? q.correct : 0
        }));

        res.json({ success: true, questions });

    } catch (error) {
        console.error("AI Gen Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate questions. " + error.message });
    }
};

// Create Quiz (Save to DB)
exports.createQuiz = async (req, res) => {
    try {
        const { title, questions, settings, creatorName } = req.body;

        // Generate simple code: e.g. SPZ9X2
        const code = "SP" + Math.random().toString(36).substring(2, 6).toUpperCase();

        const quiz = await Quiz.create({
            title,
            code,
            questions,
            settings,
            creatorName
        });

        res.status(201).json({ success: true, quizCode: code, message: "Quiz created successfully!" });
    } catch (error) {
        console.error("Create Quiz Error:", error);
        res.status(500).json({ success: false, message: "Failed to create quiz" });
    }
};

// Get Quiz by Code
exports.getQuiz = async (req, res) => {
    try {
        const { code } = req.params;
        const quiz = await Quiz.findOne({ code });

        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found with code: " + code });
        }

        res.json({ success: true, quiz });
    } catch (error) {
        console.error("Get Quiz Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching quiz" });
    }
};

// Submit Quiz Result (Update User Stats)
exports.submitResult = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized. Please login." });

        const { score, totalQuestions, timeTaken } = req.body;
        const userId = req.user.id; // Or req.user._id

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Initialize quizStats if missing (migration)
        if (!user.quizStats) {
            user.quizStats = { totalScore: 0, quizzesTaken: 0, averageScore: 0, highestScore: 0 };
        }

        // Percentage score for this quiz
        const percentage = Math.round((score / totalQuestions) * 100);

        // Update Stats
        user.quizStats.quizzesTaken += 1;
        user.quizStats.totalScore += percentage; // Sum of percentages? Or raw points? Let's use avg percentage.
        // Actually, let's track total XP or points.
        // But for leaderboard "score%" is common.
        // Let's store sum of percentages to calculate average easily.

        user.quizStats.averageScore = Math.round(user.quizStats.totalScore / user.quizStats.quizzesTaken);
        user.quizStats.highestScore = Math.max(user.quizStats.highestScore, percentage);

        // Update Global Stats (XP, problems)
        if (!user.stats) user.stats = {};
        user.stats.totalProblems = (user.stats.totalProblems || 0) + totalQuestions;
        user.stats.completionRate = (user.stats.completionRate || 0) + percentage; // Rough approximation
        user.stats.xp = (user.stats.xp || 0) + (score * 10) + 50; // 10 XP per correct + 50 bonus

        // Streak logic (simplified)
        // If last login was yesterday/today, maintain streak. logic elsewhere.
        // Just increment for activity.

        await user.save();

        res.json({ success: true, message: "Result submitted successfully!", newStats: user.quizStats });

    } catch (error) {
        console.error("Submit Result Error:", error);
        res.status(500).json({ success: false, message: "Failed to submit result" });
    }
};

// Get Global Leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        // Fetch top 50 users by highest score or average score?
        // Let's sort by XP (overall engagement) or Highest Quiz Score.
        // User wants "Leaderboard" for quizzes.
        // Let's use `quizStats.highestScore` primarily, then `quizStats.averageScore`.

        const leaderboard = await User.find({ 'quizStats.quizzesTaken': { $gt: 0 } })
            .sort({ 'quizStats.highestScore': -1, 'quizStats.averageScore': -1 })
            .limit(50)
            .select('name avatar quizStats stats');

        // Transform for frontend
        const formatted = leaderboard.map((u, index) => {
            return {
                id: u._id,
                rank: index + 1,
                name: u.name,
                score: u.quizStats.highestScore || 0, // Show highest score as main metric
                time: "10m", // Mock time or store it
                streak: u.stats?.streak || 0,
                isYou: req.user ? (u._id.toString() === req.user.id) : false,
                avatar: u.avatar || '👨‍🎓'
            };
        });

        res.json({ success: true, leaderboard: formatted });

    } catch (error) {
        console.error("Get Leaderboard Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
    }
};
