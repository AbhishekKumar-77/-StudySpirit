const Quiz = require('../models/Quiz');
const User = require('../models/User');

// AI Question Generation
exports.generateAIQuestions = async (req, res) => {
    try {
        const { topic, difficulty, mcqCount = 5, codingCount = 0 } = req.body;
        const apiKey = "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"; // User provided key

        if (!topic) return res.status(400).json({ success: false, message: "Topic is required" });

        const prompt = `Generate an exam about "${topic}" for ${difficulty || 'medium'} level students.
        Include exactly ${mcqCount} multiple choice questions and ${codingCount} coding problems.
        Return a strictly valid JSON array of objects combining both types.
        IMPORTANT: For MCQ questions, vary the correct answer position randomly across 0, 1, 2, and 3.
        Do not output any markdown, just raw JSON array.

        Structure for MCQ questions:
        {
            "type": "mcq",
            "question": "Question text",
            "options": ["A", "B", "C", "D"],
            "correct": 0,
            "difficulty": "${difficulty || 'medium'}"
        }

        Structure for coding questions (output these only if coding problems requested):
        {
            "type": "coding",
            "question": "Detailed problem statement (e.g., Return the sum of two numbers)",
            "starterCode": "function solve() { \\n\\n}",
            "testCases": [
                { "input": "1 2", "expectedOutput": "3" },
                { "input": "5 5", "expectedOutput": "10" }
            ],
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
                    { role: 'system', content: 'You are an educational AI assistant. Output strictly valid JSON arrays only. No markdown formatting.' },
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

        // Add IDs + shuffle options to prevent AI bias (LLMs tend to put correct answer at C)
        questions = questions.map((q, i) => {
            const opts = q.options || ["True", "False"];
            const correctIdx = typeof q.correct === 'number' ? q.correct : 0;
            const correctAnswer = opts[correctIdx]; // Save the correct answer text

            // Fisher-Yates shuffle
            const shuffled = [...opts];
            for (let j = shuffled.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
            }

            // Find new position of the correct answer after shuffle
            const newCorrectIdx = shuffled.indexOf(correctAnswer);

            return {
                ...q,
                id: Date.now() + i,
                options: shuffled,
                correct: newCorrectIdx >= 0 ? newCorrectIdx : 0
            };
        });

        res.json({ success: true, questions });

    } catch (error) {
        console.error("AI Gen Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate questions. " + error.message });
    }
};

// Create Quiz (Save to DB)
exports.createQuiz = async (req, res) => {
    try {
        const { title, questions, settings, creatorName, status } = req.body;
        const creatorId = req.user ? req.user.id : null;

        // Generate simple code: e.g. SPZ9X2
        const code = "SP" + Math.random().toString(36).substring(2, 6).toUpperCase();

        const quiz = await Quiz.create({
            title,
            code,
            questions,
            settings,
            creatorName,
            creatorId,
            status: status || 'published'
        });

        res.status(201).json({ success: true, quizCode: code, message: "Quiz created successfully!" });
    } catch (error) {
        console.error("Create Quiz Error:", error);
        res.status(500).json({ success: false, message: "Failed to create quiz" });
    }
};

// Get My Quizzes/Drafts
exports.getMyQuizzes = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized. Please login." });
        const quizzes = await Quiz.find({ creatorId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, quizzes });
    } catch (error) {
        console.error("Fetch My Quizzes Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch quizzes" });
    }
};

// Publish a Draft
exports.publishDraft = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized. Please login." });

        const { code } = req.params;
        const quiz = await Quiz.findOneAndUpdate(
            { code, creatorId: req.user.id },
            { status: 'published' },
            { new: true }
        );

        if (!quiz) {
            return res.status(404).json({ success: false, message: "Draft not found or unauthorized to publish." });
        }

        res.json({ success: true, message: "Quiz published successfully!", quizCode: quiz.code });
    } catch (error) {
        console.error("Publish Draft Error:", error);
        res.status(500).json({ success: false, message: "Failed to publish draft" });
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

        if (quiz.status === 'draft') {
            // Only creator can get draft details directly
            if (!req.user || req.user.id.toString() !== (quiz.creatorId ? quiz.creatorId.toString() : '')) {
                return res.status(403).json({ success: false, message: "This quiz is not published yet." });
            }
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

        const percentage = req.body.percentage !== undefined
            ? req.body.percentage
            : Math.round((score / totalQuestions) * 100);

        // Save Submission
        const QuizSubmission = require('../models/QuizSubmission');
        if (req.body.quizCode) {
            await QuizSubmission.create({
                quizCode: req.body.quizCode,
                studentId: userId,
                studentName: user.name,
                registrationNumber: req.body.registrationNumber || '',
                score: score,
                totalQuestions: totalQuestions,
                percentage: percentage,
                timeTaken: timeTaken
            });
        }

        // Update Stats
        user.quizStats.quizzesTaken += 1;
        user.quizStats.totalScore += percentage; // Sum of percentages? Or raw points? Let's use avg percentage.
        // Actually, let's track total XP or points.
        // But for leaderboard "score%" is common.
        // Let's store sum of percentages to calculate average easily.

        user.quizStats.averageScore = Math.round(user.quizStats.totalScore / user.quizStats.quizzesTaken);
        user.quizStats.highestScore = Math.max(user.quizStats.highestScore, percentage);

        // Track best time (lowest time taken wins for same or better score)
        if (timeTaken > 0) {
            if (!user.quizStats.bestTime || timeTaken < user.quizStats.bestTime) {
                user.quizStats.bestTime = timeTaken;
            }
        }

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
            // Format best time as mm:ss
            const bt = u.quizStats.bestTime;
            let timeStr = 'N/A';
            if (bt && bt > 0) {
                const m = Math.floor(bt / 60);
                const s = bt % 60;
                timeStr = `${m}m ${s}s`;
            }
            return {
                id: u._id,
                rank: index + 1,
                name: u.name,
                score: u.quizStats.highestScore || 0,
                time: timeStr,
                streak: u.stats?.streak || 0,
                isYou: req.user ? (u._id.toString() === req.user.id) : false,
                avatar: u.avatar || '👨‍🎓',
                quizzesTaken: u.quizStats.quizzesTaken || 0,
                averageScore: u.quizStats.averageScore || 0
            };
        });

        res.json({ success: true, leaderboard: formatted });

    } catch (error) {
        console.error("Get Leaderboard Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
    }
};

// Delete a Quiz
exports.deleteQuiz = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized." });

        const quiz = await Quiz.findOne({ code: req.params.code });
        if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

        if (quiz.creatorId && quiz.creatorId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this quiz" });
        }

        await Quiz.deleteOne({ code: req.params.code });
        await require('../models/QuizSubmission').deleteMany({ quizCode: req.params.code });

        res.json({ success: true, message: "Quiz deleted successfully" });
    } catch (error) {
        console.error("Delete Quiz Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete quiz" });
    }
};

// Get Leaderboard for a Specific Quiz
exports.getSpecificLeaderboard = async (req, res) => {
    try {
        const { code } = req.params;
        const QuizSubmission = require('../models/QuizSubmission');

        const submissions = await QuizSubmission.find({ quizCode: code })
            .sort({ percentage: -1, timeTaken: 1 });

        const leaderboard = submissions.map((sub, idx) => {
            let timeStr = 'N/A';
            if (sub.timeTaken > 0) {
                timeStr = `${Math.floor(sub.timeTaken / 60)}m ${sub.timeTaken % 60}s`;
            }
            return {
                id: sub._id,
                rank: idx + 1,
                name: sub.studentName || 'Student',
                registrationNumber: sub.registrationNumber || '',
                score: sub.percentage || 0,
                marks: sub.score || 0,
                totalMarks: sub.totalQuestions || 0,
                time: timeStr,
                isYou: req.user ? (sub.studentId?.toString() === req.user.id) : false
            };
        });

        res.json({ success: true, leaderboard });
    } catch (error) {
        console.error("Get Specific Leaderboard Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch specific leaderboard" });
    }
};
