const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Task = require('../models/Task');
const BadgeVerification = require('../models/BadgeVerification');
const crypto = require('crypto');

// Single API key — set GROQ_API_KEY or GROQ_API_KEY_QUIZ in your .env / Render env vars
const GROQ_API_KEY = process.env.GROQ_API_KEY_QUIZ || process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    console.warn('⚠️  WARNING: GROQ_API_KEY is not set. AI quiz features will not work until you add it to your environment variables.');
}

// Helper: ensures API key is present before making AI calls
const requireApiKey = (res) => {
    if (!GROQ_API_KEY) {
        res.status(503).json({ success: false, message: 'AI service is not configured. Please add GROQ_API_KEY to the server environment variables.' });
        return false;
    }
    return true;
};


// ── Generate MCQ Questions FROM an Image (Vision AI) ──────────────────────────
exports.generateFromImage = async (req, res) => {
    try {
        const { imageBase64, mimeType = 'image/jpeg', count = 5, difficulty = 'medium' } = req.body;
        const apiKey = GROQ_API_KEY;

        if (!imageBase64) {
            return res.status(400).json({ success: false, message: "Image data is required" });
        }

        const difficultyGuide = {
            easy: "Generate EASY questions — basic recall, definitions, simple facts visible in the image.",
            medium: "Generate MEDIUM questions — require understanding of the content, not just recall.",
            hard: "Generate HARD questions — require deep analysis, application, or inference from the content."
        }[difficulty] || "Generate MEDIUM difficulty questions.";

        const prompt = `You are an expert teacher. Look at this image carefully — it may be a textbook page, diagram, handwritten notes, or any educational content.

${difficultyGuide}

Generate EXACTLY ${count} multiple choice questions (MCQs) based ONLY on the content visible in this image.

CRITICAL RULES:
- Return ONLY a raw JSON array. No markdown, no explanation, no extra text.
- Each question must be directly answerable from the image content.
- Vary the correct answer position randomly (don't always put correct at index 0).
- Each question must have exactly 4 options.

JSON structure:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "difficulty": "${difficulty}"
    }
  ]
}

Output the JSON object now:`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mimeType};base64,${imageBase64}`
                                }
                            },
                            {
                                type: 'text',
                                text: prompt
                            }
                        ]
                    }
                ],
                temperature: 0.5,
                max_tokens: 4000,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();

        if (!data.choices || !data.choices[0]?.message?.content) {
            console.error("GROQ Vision API Error:", JSON.stringify(data, null, 2));
            throw new Error(data.error?.message || "Invalid response from Vision AI provider");
        }

        let questions = [];
        const content = data.choices[0].message.content;

        try {
            questions = JSON.parse(content);
        } catch {
            let cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                questions = JSON.parse(cleaned);
            } catch {
                const lastBrace = cleaned.lastIndexOf('}');
                if (lastBrace !== -1) {
                    try { questions = JSON.parse(cleaned.substring(0, lastBrace + 1) + ']'); }
                    catch { throw new Error("Failed to parse AI response from image."); }
                } else {
                    throw new Error("AI returned no parseable questions from the image.");
                }
            }
        }

        // Handle response_format wrapper
        if (questions && typeof questions === 'object' && !Array.isArray(questions)) {
            if (questions.questions) questions = questions.questions;
            else if (questions.quiz) questions = questions.quiz;
            else throw new Error("AI did not return a valid questions array inside the JSON object.");
        }

        if (!Array.isArray(questions)) {
            throw new Error("AI did not return a valid question array.");
        }

        // Add IDs and shuffle options
        questions = questions.map((q, i) => {
            const opts = q.options || [];
            const correctIdx = typeof q.correct === 'number' ? q.correct : 0;
            const correctAnswer = opts[correctIdx];
            const shuffled = [...opts];
            for (let j = shuffled.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
            }
            const newCorrectIdx = shuffled.indexOf(correctAnswer);
            return {
                ...q,
                id: Date.now() + i,
                type: 'mcq',
                options: shuffled,
                correct: newCorrectIdx >= 0 ? newCorrectIdx : 0
            };
        });

        res.json({ success: true, questions });

    } catch (error) {
        console.error("Vision AI Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate questions from image: " + error.message });
    }
};


// AI Question Generation
exports.generateAIQuestions = async (req, res) => {
    try {
        if (!requireApiKey(res)) return;
        const { topic, difficulty, count, mcqCount = count || 5, codingCount = 0 } = req.body;
        const apiKey = GROQ_API_KEY;

        if (!topic) return res.status(400).json({ success: false, message: "Topic is required" });

        const difficultyInstructions = {
            easy: `DIFFICULTY: EASY — Questions must be basic and beginner-friendly.
        - Focus on definitions, simple recall, fundamental concepts, and basic terminology.
        - Questions should be answerable by someone who just started learning the topic.
        - Use straightforward language. No tricks, no edge cases.
        - Wrong answer options should be clearly distinct from the correct answer.
        - Example style: "What does HTML stand for?", "Which keyword is used to declare a variable in JavaScript?"`,
            medium: `DIFFICULTY: MEDIUM — Questions must require understanding and application of concepts.
        - Focus on applying knowledge, understanding how things work, and basic problem-solving.
        - Questions should test comprehension beyond simple recall — the student must understand the "why" and "how".
        - Include some plausible-but-wrong distractors.
        - Example style: "What is the output of this code snippet?", "Which of the following correctly implements X pattern?"`,
            hard: `DIFFICULTY: HARD — Questions must be challenging and require deep knowledge or analysis.
        - Focus on complex scenarios, edge cases, advanced concepts, performance trade-offs, and tricky gotchas.
        - Questions should challenge even experienced practitioners.
        - All 4 options should be plausible — the differences between right and wrong should be subtle.
        - Example style: "What happens when...", "In which scenario would X fail?", "What is the time complexity and why?"`
        };

        const selectedDifficultyGuide = difficultyInstructions[difficulty] || difficultyInstructions.medium;

        const prompt = `You are generating quiz questions about "${topic}".

        ${selectedDifficultyGuide}

        YOU MUST GENERATE EXACTLY ${mcqCount} MULTIPLE CHOICE QUESTIONS. Not fewer, not more — EXACTLY ${mcqCount}.${codingCount > 0 ? ` Also generate EXACTLY ${codingCount} coding problems.` : ''}
        ALL questions MUST match the ${(difficulty || 'medium').toUpperCase()} difficulty level described above.
        
        CRITICAL RULES:
        - Return ONLY a JSON object with a "questions" array containing EXACTLY ${mcqCount} objects.
        - The "questions" array MUST have a length of ${mcqCount}. This is mandatory.
        - For MCQ questions: vary the correct answer position randomly — do NOT always put the correct answer at index 0 or 2.
        - Each question MUST be strongly relevant to the topic "${topic}".
        - Difficulty MUST be strictly enforced as described above.
        - Keep explanations concise (1-2 sentences max) to save space.

        Each object in the "questions" array must follow this structure:
        {
            "type": "mcq",
            "question": "Question text here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct": 0,
            "explanation": "Brief explanation of why the correct option is right.",
            "keyConcept": "Key concept",
            "difficulty": "${difficulty || 'medium'}"
        }
        ${codingCount > 0 ? `
        Structure for coding questions:
        {
            "type": "coding",
            "question": "Detailed problem statement",
            "starterCode": "function solve() { \\n\\n}",
            "testCases": [
                { "input": "1 2", "expectedOutput": "3" },
                { "input": "5 5", "expectedOutput": "10" }
            ],
            "difficulty": "${difficulty || 'medium'}"
        }` : ''}
        
        REMEMBER: The "questions" array MUST contain EXACTLY ${mcqCount} items. Output the JSON object now:`;

        const safeMaxTokens = Math.min(4000, Math.max(1500, Number(mcqCount) * 250 + 500));

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [
                    { role: 'system', content: `You are an educational AI assistant. You MUST output a strictly valid JSON object containing a "questions" array with EXACTLY ${mcqCount} questions. No markdown, no extra text. Do not output fewer than ${mcqCount} questions under any circumstances.` },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: safeMaxTokens,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();

        if (!data.choices || !data.choices[0]?.message?.content) {
            console.error("GROQ API ERROR RESPONSE:", JSON.stringify(data, null, 2));
            throw new Error(data.error?.message || "Invalid response from AI provider");
        }

        let questions = [];
        const content = data.choices[0].message.content;

        try {
            questions = JSON.parse(content);
        } catch (e) {
            let cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            // Remove any potential text before or after the JSON array
            const firstBracket = cleaned.indexOf('[');
            const lastBracket = cleaned.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                cleaned = cleaned.substring(firstBracket, lastBracket + 1);
            }

            try {
                questions = JSON.parse(cleaned);
            } catch (e2) {
                console.error("Failed to parse cleaned content:", cleaned);
                const objectMatches = cleaned.match(/\{[\s\S]*?\}(?=\s*,|\s*\]|\s*\})/g);
                if (objectMatches) {
                    questions = objectMatches.map(str => {
                        try { return JSON.parse(str); } catch { return null; }
                    }).filter(q => q !== null);
                }
                
                if (!questions || questions.length === 0) {
                    const lastBrace = cleaned.lastIndexOf('}');
                    if (lastBrace !== -1) {
                        const repaired = cleaned.substring(0, lastBrace + 1) + ']';
                        try { questions = JSON.parse(repaired); }
                        catch (e3) { throw new Error("Failed to parse AI response. Try a shorter topic or fewer questions."); }
                    } else { throw new Error("Could not find any parseable JSON in AI response."); }
                }
            }
        }

        // Unwrap top level object if present
        if (questions && typeof questions === 'object' && !Array.isArray(questions)) {
            if (questions.questions) questions = questions.questions;
            else if (questions.quiz) questions = questions.quiz;
            else throw new Error("AI did not return a valid questions array inside the JSON object.");
        }

        if (!Array.isArray(questions)) {
            throw new Error("AI did not return an array");
        }

        questions = questions.map((q, i) => {
            const opts = q.options || ["True", "False"];
            let correctIdx = 0;
            if (typeof q.correct === 'number') {
                correctIdx = (q.correct >= 0 && q.correct < opts.length) ? q.correct : 0;
            } else if (typeof q.correct === 'string') {
                const foundIdx = opts.findIndex(o => String(o).toLowerCase().trim() === String(q.correct).toLowerCase().trim());
                if (foundIdx >= 0) correctIdx = foundIdx;
            }
            const correctAnswer = opts[correctIdx] || opts[0];
            const shuffled = [...opts];
            for (let j = shuffled.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
            }
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

// Get Quiz by Code (with schedule enforcement)
exports.getQuiz = async (req, res) => {
    try {
        const { code } = req.params;
        const quiz = await Quiz.findOne({ code });

        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found with code: " + code });
        }

        if (quiz.status === 'draft') {
            if (!req.user || req.user.id.toString() !== (quiz.creatorId ? quiz.creatorId.toString() : '')) {
                return res.status(403).json({ success: false, message: "This quiz is not published yet." });
            }
        }

        // Schedule enforcement: check if quiz is within the allowed time window
        const now = new Date();
        const isTeacher = req.user && quiz.creatorId && req.user.id.toString() === quiz.creatorId.toString();

        if (!isTeacher) {
            if (quiz.settings.scheduledStart && now < new Date(quiz.settings.scheduledStart)) {
                const startTime = new Date(quiz.settings.scheduledStart).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
                return res.status(403).json({ success: false, message: `This quiz hasn't started yet. It opens at ${startTime}.` });
            }
            if (quiz.settings.scheduledEnd && now > new Date(quiz.settings.scheduledEnd)) {
                return res.status(403).json({ success: false, message: "This quiz has ended and is no longer accepting submissions." });
            }
        }

        res.json({ success: true, quiz });
    } catch (error) {
        console.error("Get Quiz Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching quiz" });
    }
};

// Check Re-Attempt: returns whether a reg number already submitted this quiz
exports.checkReAttempt = async (req, res) => {
    try {
        const { code } = req.params;
        const { registrationNumber } = req.query;

        if (!registrationNumber) {
            return res.json({ success: true, alreadySubmitted: false });
        }

        const QuizSubmission = require('../models/QuizSubmission');
        const quiz = await Quiz.findOne({ code: code.toUpperCase() });
        const maxAttempts = quiz?.maxAttempts || 1;

        const count = await QuizSubmission.countDocuments({
            quizCode: code.toUpperCase(),
            registrationNumber: registrationNumber.trim().toUpperCase()
        });

        res.json({
            success: true,
            alreadySubmitted: count >= maxAttempts,
            attemptsUsed: count,
            maxAttempts
        });
    } catch (error) {
        console.error("Check Re-Attempt Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Submit Quiz Result
exports.submitResult = async (req, res) => {
    try {
        const { score, totalQuestions, timeTaken, userAnswers, studentName } = req.body;
        console.log("RECEIVING USER ANSWERS:", userAnswers);
        
        const percentage = req.body.percentage !== undefined
            ? req.body.percentage
            : Math.round((score / totalQuestions) * 100);

        let user = null;
        let userId = null;
        let displayName = studentName || "Guest Student";

        // If user is logged in, fetch their details to update their stats
        if (req.user) {
            userId = req.user.id;
            user = await User.findById(userId);
            if (user) {
                displayName = user.name;
            }
        }

        // Save Submission (with re-attempt prevention)
        const QuizSubmission = require('../models/QuizSubmission');
        if (req.body.quizCode) {
            const regNo = (req.body.registrationNumber || '').trim().toUpperCase();

            // Block submissions if exam is closed
            const examCheck = await Quiz.findOne({ code: req.body.quizCode.toUpperCase() }).select('isClosed title maxAttempts');
            if (examCheck?.isClosed) {
                return res.status(403).json({ success: false, message: "This exam has been closed by the teacher." });
            }
            req.examTitle = examCheck?.title || 'General Quiz';
            const maxAttempts = examCheck?.maxAttempts || 1;

            // Block re-attempt: if same regNo has reached maxAttempts
            if (regNo) {
                const submissionCount = await QuizSubmission.countDocuments({
                    quizCode: req.body.quizCode.toUpperCase(),
                    registrationNumber: regNo
                });
                if (submissionCount >= maxAttempts) {
                    // Still update the career passport for logged-in users on re-attempts
                    if (req.user) {
                        const CareerProfile = require('../models/CareerProfile');
                        const userId2 = req.user.id;
                        let profile2 = await CareerProfile.findOne({ user: userId2 });
                        if (!profile2) profile2 = new CareerProfile({ user: userId2 });
                        const pct = req.body.percentage || 0;
                        if (pct > 0) {
                            let lvl = 'Beginner';
                            if (pct >= 90) lvl = 'Pro';
                            else if (pct >= 75) lvl = 'Advanced';
                            else if (pct >= 60) lvl = 'Intermediate';
                            const titleKey = req.examTitle || req.body.quizCode;
                            const idx2 = profile2.verifiedSkills.findIndex(s => s.skillName === titleKey);
                            if (idx2 > -1) {
                                if (pct > profile2.verifiedSkills[idx2].score) {
                                    profile2.verifiedSkills[idx2].score = pct;
                                    profile2.verifiedSkills[idx2].level = lvl;
                                    profile2.verifiedSkills[idx2].lastTestedAt = new Date();
                                }
                            } else {
                                profile2.verifiedSkills.push({ skillName: titleKey, score: pct, verifiedBy: 'Quiz Module', level: lvl, lastTestedAt: new Date() });
                            }
                            await profile2.save();
                            console.log(`[Passport] Updated on re-attempt for userId=${userId2}`);
                        }
                    }
                    return res.status(409).json({
                        success: false,
                        message: `Maximum allowed attempts (${maxAttempts}) reached for registration number "${regNo}".`,
                        alreadySubmitted: true
                    });
                }
            }

        await QuizSubmission.create({
                quizCode: req.body.quizCode,
                studentId: userId,
                studentName: displayName,
                registrationNumber: regNo,
                score: score,
                totalQuestions: totalQuestions,
                percentage: percentage,
                timeTaken: timeTaken,
                userAnswers: userAnswers || {},
                codingSubmissions: req.body.codingSubmissions || [] // coding question code
            });
        }

        // Update Stats ONLY if the student is logged in
        if (user) {
            if (!user.quizStats) {
                user.quizStats = { totalScore: 0, quizzesTaken: 0, averageScore: 0, highestScore: 0 };
            }

            user.quizStats.quizzesTaken += 1;
            user.quizStats.totalScore += percentage;
            user.quizStats.averageScore = Math.round(user.quizStats.totalScore / user.quizStats.quizzesTaken);
            user.quizStats.highestScore = Math.max(user.quizStats.highestScore, percentage);

            if (timeTaken > 0) {
                if (!user.quizStats.bestTime || timeTaken < user.quizStats.bestTime) {
                    user.quizStats.bestTime = timeTaken;
                }
            }

            if (!user.stats) user.stats = {};
            user.stats.totalProblems = (user.stats.totalProblems || 0) + totalQuestions;
            user.stats.completionRate = (user.stats.completionRate || 0) + percentage;
            user.stats.xp = (user.stats.xp || 0) + (score * 10) + 50;

            await user.save();

            // --- Update CareerProfile Skill Passport ---
            try {
                const CareerProfile = require('../models/CareerProfile');
                let profile = await CareerProfile.findOne({ user: userId });
                if (!profile) profile = new CareerProfile({ user: userId });
                
                // Determine level based on percentage
                let level = 'Beginner';
                if (percentage >= 90) level = 'Pro';
                else if (percentage >= 75) level = 'Advanced';
                else if (percentage >= 60) level = 'Intermediate';
                
                const examTitle = req.examTitle || req.body.quizCode || 'General Quiz';
                console.log(`[Passport] Updating skill: "${examTitle}" score=${percentage} level=${level} userId=${userId}`);

                // Update or add the skill
                const skillIndex = profile.verifiedSkills.findIndex(s => s.skillName === examTitle);
                if (skillIndex > -1) {
                    // Only update if the new score is better
                    if (percentage > profile.verifiedSkills[skillIndex].score) {
                        profile.verifiedSkills[skillIndex].score = percentage;
                        profile.verifiedSkills[skillIndex].level = level;
                        profile.verifiedSkills[skillIndex].lastTestedAt = new Date();
                    }
                } else if (percentage > 0) {
                    // Add skill as long as score > 0
                    profile.verifiedSkills.push({
                        skillName: examTitle,
                        score: percentage,
                        verifiedBy: 'Quiz Module',
                        level: level,
                        lastTestedAt: new Date()
                    });
                }
                await profile.save();
                console.log(`[Passport] Saved successfully for userId=${userId}`);

                // --- Verify & Issue Digital Badge ---
                if (percentage >= 85) {
                    const quizCode = req.body.quizCode?.toUpperCase() || 'GENERAL';
                    const verificationCode = `SS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
                    
                    const newBadge = new BadgeVerification({
                        badgeId: `${quizCode}-ADV`,
                        name: `${examTitle} Specialist`,
                        icon: '🎓',
                        student: userId,
                        score: percentage,
                        totalScore: 100,
                        verificationCode: verificationCode,
                        verifiedBy: 'StudySpirit Proctored Exam',
                        metadata: {
                            examType: 'Quiz',
                            quizCode: quizCode,
                            examId: req.body.quizId || null
                        }
                    });
                    await newBadge.save();
                    
                    if (!user.badges) user.badges = [];
                    user.badges.push({
                        name: newBadge.name,
                        icon: newBadge.icon,
                        earnedAt: new Date(),
                        description: `Scored ${percentage}% in ${examTitle}`,
                        verificationCode: verificationCode
                    });
                    await user.save();
                    console.log(`[Badge] Issued digital badge: ${verificationCode}`);
                }
            } catch (passportErr) {
                console.error('[Passport] Failed to update Skill Passport:', passportErr);
            }
            // -----------------------------------------

            // --- Sync with Planner Task ---
            try {
                const pendingQuizTasks = await Task.find({
                    user: userId,
                    status: { $ne: 'completed' },
                    title: { $regex: /quiz/i }
                });
                
                for (let t of pendingQuizTasks) {
                    t.status = 'completed';
                    t.completedAt = new Date();
                    await t.save();
                }
            } catch (taskErr) {
                console.error('[Planner] Failed to sync Quiz Task:', taskErr);
            }
            // -----------------------------------------
        }

        res.json({ 
            success: true, 
            message: "Result submitted successfully!", 
            newStats: user ? user.quizStats : null 
        });

    } catch (error) {
        console.error("Submit Result Error:", error);
        res.status(500).json({ success: false, message: "Failed to submit result" });
    }
};

// Get Global Leaderboard with Pagination
exports.getLeaderboard = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const leaderboard = await User.find({ 'quizStats.quizzesTaken': { $gt: 0 } })
            .sort({ 'quizStats.highestScore': -1, 'quizStats.averageScore': -1 })
            .skip(skip)
            .limit(limit)
            .select('name avatar quizStats stats');

        const totalUsers = await User.countDocuments({ 'quizStats.quizzesTaken': { $gt: 0 } });

        const formatted = leaderboard.map((u, index) => {
            const bt = u.quizStats.bestTime;
            let timeStr = 'N/A';
            if (bt && bt > 0) {
                const m = Math.floor(bt / 60);
                const s = bt % 60;
                timeStr = `${m}m ${s}s`;
            }
            return {
                id: u._id,
                rank: skip + index + 1,
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

        res.json({ success: true, leaderboard: formatted, total: totalUsers, page, limit });
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
                submissionId: sub._id.toString(), // For teacher "View Code" feature
                rank: idx + 1,
                name: sub.studentName || 'Student',
                registrationNumber: sub.registrationNumber || '',
                score: sub.percentage || 0,
                marks: sub.score || 0,
                totalMarks: sub.totalQuestions || 0,
                time: timeStr,
                hasCodingSubmissions: (sub.codingSubmissions || []).length > 0,
                isYou: req.user ? (sub.studentId?.toString() === req.user.id) : false
            };
        });

        res.json({ success: true, leaderboard });
    } catch (error) {
        console.error("Get Specific Leaderboard Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch specific leaderboard" });
    }
};

// Get Question-Level Analytics for a Quiz (Teacher Only)
exports.getQuizAnalytics = async (req, res) => {
    try {
        const { code } = req.params;
        const QuizSubmission = require('../models/QuizSubmission');

        // Fetch quiz to get correct answers
        const quiz = await Quiz.findOne({ code });
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        // Fetch all submissions for this quiz
        const submissions = await QuizSubmission.find({ quizCode: code });

        if (submissions.length === 0) {
            return res.json({ success: true, analytics: [], totalSubmissions: 0 });
        }

        // Build analytics per question
        const analytics = quiz.questions.map((q, idx) => {
            const qId = String(q._id || q.id);
            let correctCount = 0;
            let wrongCount = 0;
            let skippedCount = 0;
            const optionCounts = new Array(q.options.length).fill(0);

            submissions.forEach(sub => {
                const answered = sub.userAnswers ? sub.userAnswers[qId] : undefined;
                if (answered === undefined || answered === null) {
                    skippedCount++;
                } else {
                    const answerIdx = Number(answered);
                    if (answerIdx === q.correct) {
                        correctCount++;
                    } else {
                        wrongCount++;
                    }
                    if (answerIdx >= 0 && answerIdx < optionCounts.length) {
                        optionCounts[answerIdx]++;
                    }
                }
            });

            const total = submissions.length;
            return {
                questionIndex: idx,
                questionId: qId,
                question: q.question,
                imageUrl: q.imageUrl || '',
                options: q.options,
                correctOptionIndex: q.correct,
                correctCount,
                wrongCount,
                skippedCount,
                totalAttempts: total,
                successRate: total > 0 ? Math.round((correctCount / total) * 100) : 0,
                optionCounts, // How many students picked each option
                difficulty: q.difficulty || 'medium'
            };
        });

        // Sort by successRate ascending (hardest questions first)
        const sortedByDifficulty = [...analytics].sort((a, b) => a.successRate - b.successRate);

        res.json({
            success: true,
            quizTitle: quiz.title,
            totalSubmissions: submissions.length,
            analytics,
            hardestQuestions: sortedByDifficulty.slice(0, 5) // Top 5 hardest
        });
    } catch (error) {
        console.error("Quiz Analytics Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch quiz analytics" });
    }
};

// ── Toggle Exam Open/Closed ──────────────────────────────────────────────────
exports.toggleCloseExam = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
        const { code } = req.params;
        const quiz = await Quiz.findOne({ code, creatorId: req.user.id });
        if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found or unauthorized" });

        quiz.isClosed = !quiz.isClosed;
        await quiz.save();

        res.json({ success: true, isClosed: quiz.isClosed, message: quiz.isClosed ? "Exam closed — students can no longer submit." : "Exam reopened — students can now submit." });
    } catch (error) {
        console.error("Toggle Close Exam Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Get a specific student's submitted code (Teacher Only) ───────────────────
exports.getStudentCode = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
        const { code, submissionId } = req.params;

        const quiz = await Quiz.findOne({ code, creatorId: req.user.id });
        if (!quiz) return res.status(403).json({ success: false, message: "Not authorized to view this exam's data" });

        const QuizSubmission = require('../models/QuizSubmission');
        const submission = await QuizSubmission.findById(submissionId);
        if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
        if (submission.quizCode !== code) return res.status(403).json({ success: false, message: "Submission does not belong to this quiz" });

        res.json({ success: true, submission: {
            studentName: submission.studentName,
            registrationNumber: submission.registrationNumber,
            percentage: submission.percentage,
            timeTaken: submission.timeTaken,
            submittedAt: submission.submittedAt,
            codingSubmissions: submission.codingSubmissions || [],
            userAnswers: submission.userAnswers || {}
        }});
    } catch (error) {
        console.error("Get Student Code Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ── Execute code during an exam (no auth required, uses quizCode validation) ─
exports.executeCodeExam = async (req, res) => {
    try {
        const { quizCode, language, code, stdin } = req.body;
        if (!quizCode || !language || !code) {
            return res.status(400).json({ success: false, message: "quizCode, language and code are required" });
        }

        // Verify quiz exists and is not closed
        const quiz = await Quiz.findOne({ code: quizCode.toUpperCase() });
        if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
        if (quiz.isClosed) return res.status(403).json({ success: false, message: "This exam is closed" });

        // Reuse Wandbox execution from codeSpiritController
        const codeSpiritController = require('./codeSpiritController');
        // Forward to the same execute endpoint logic
        req.body.language = language;
        req.body.code = code;
        req.body.stdin = stdin || '';
        return codeSpiritController.executeCode(req, res);
    } catch (error) {
        console.error("Execute Code Exam Error:", error);
        res.status(500).json({ success: false, message: "Execution failed: " + error.message });
    }
};

// ── NEW: AI Grade Subjective Answers ─────────────────────────────────────────
exports.gradeSubjective = async (req, res) => {
    try {
        const { question, rubric, studentAnswer } = req.body;
        const apiKey = GROQ_API_KEY;

        if (!studentAnswer || !question) return res.status(400).json({ success: false, message: "Missing answer or question parameters" });

        const prompt = `You are an expert Teacher evaluating a short-answer test.
        Question: "${question}"
        Teacher's Grading Rubric constraint: "${rubric || 'Evaluate for correctness and understanding of core concepts.'}"
        Student Answer: "${studentAnswer}"

        Score the answer out of 10.
        Format your response EXACTLY as this JSON object:
        {
          "score": 8,
          "feedback": "A short, constructive sentence explaining the score and what the student missed."
        }`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [{ role: 'system', content: 'You evaluate student answers strictly based on the rubric.' }, { role: 'user', content: prompt }],
                temperature: 0.2, // Low temp for consistent grading
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        const grading = JSON.parse(content);
        
        res.json({ success: true, grading });

    } catch (error) {
        console.error("AI Grading Error:", error);
        res.status(500).json({ success: false, message: "Failed to grade answer" });
    }
};

// ── NEW: Post Exam Doubt Resolution ──────────────────────────────────────────
exports.explainAnswer = async (req, res) => {
    try {
        const { question, options, studentAnswer, correctAnswer } = req.body;
        const apiKey = GROQ_API_KEY;

        const prompt = `You are a helpful AI Tutor assisting a student who got a multiple-choice question wrong on an exam.
        Question: "${question}"
        The student selected: "${studentAnswer}"
        The correct answer is: "${correctAnswer}"

        Explain concisely (2-3 sentences max):
        1. Why their answer was incorrect.
        2. Why the correct answer is the right one.
        Make it encouraging and educational. Do not output anything except the explanation text.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5
            })
        });

        const data = await response.json();
        res.json({ success: true, explanation: data.choices[0].message.content });

    } catch (error) {
        console.error("AI Explanation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate explanation" });
    }
};

// ── NEW: Adaptive AI Practice (CAT) ──────────────────────────────────────────
exports.adaptivePractice = async (req, res) => {
    try {
        const { topic, currentDifficulty, wasCorrect } = req.body; // wasCorrect is nullable if first question
        const apiKey = GROQ_API_KEY;

        let newDifficulty = currentDifficulty || "medium";
        
        // Computerized Adaptive Testing Logic
        if (wasCorrect === true) {
            if (currentDifficulty === "easy") newDifficulty = "medium";
            else if (currentDifficulty === "medium") newDifficulty = "hard";
        } else if (wasCorrect === false) {
            if (currentDifficulty === "hard") newDifficulty = "medium";
            else if (currentDifficulty === "medium") newDifficulty = "easy";
        }

        const prompt = `You are generating exactly ONE adaptive quiz question about "${topic}".
        The difficulty level must strictly be: ${newDifficulty.toUpperCase()}.

        Output ONLY a JSON object containing a "questions" array with exactly 1 element.
        {
          "questions": [{
            "type": "mcq",
            "question": "Question text here",
            "options": ["Opt A", "Opt B", "Opt C", "Opt D"],
            "correct": 0,
            "difficulty": "${newDifficulty}"
          }]
        }`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [{ role: 'system', content: 'Output strictly a raw JSON object.' }, { role: 'user', content: prompt }],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        let content = data.choices[0].message.content;
        let parsed = JSON.parse(content);

        // Handle variations in "questions" wrapper
        let questions = parsed.questions || parsed.quiz || parsed;
        if (!Array.isArray(questions) && questions.question) questions = [questions];

        res.json({ success: true, newDifficulty, question: questions[0] });

    } catch (error) {
        console.error("Adaptive AI Gen Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate adaptive question" });
    }
};

// ── AI Remedial Quiz Generation ─────────────────────────────
exports.generateRemedialQuiz = async (req, res) => {
    try {
        if (!requireApiKey(res)) return;
        const { missedQuestions } = req.body;
        const apiKey = GROQ_API_KEY;

        if (!missedQuestions || !Array.isArray(missedQuestions) || missedQuestions.length === 0) {
            return res.status(400).json({ success: false, message: "Missed questions array is required" });
        }

        const prompt = `You are a personalized AI Tutor. A student recently took a quiz and answered the following questions incorrectly:
${missedQuestions.map((m, i) => `${i+1}. Question: "${m.question}" (Student chose: "${m.studentAnswer}", Correct: "${m.correctAnswer}")`).join('\n')}

Generate EXACTLY 5 targeted remedial practice questions that focus specifically on helping the student master the underlying concepts they got wrong above.

Return ONLY a JSON object containing a "questions" array:
{
  "questions": [
    {
      "type": "mcq",
      "question": "Clear remedial question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "difficulty": "medium",
      "explanation": "Short explanation of why this answer is correct."
    }
  ]
}`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [
                    { role: 'system', content: 'Output format must be a strictly valid JSON object.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        let parsed = JSON.parse(content);
        let questions = parsed.questions || parsed.quiz || parsed;

        if (!Array.isArray(questions)) {
            throw new Error("AI did not return a valid questions array");
        }

        questions = questions.map((q, i) => ({
            ...q,
            id: Date.now() + i,
            type: q.type || 'mcq'
        }));

        res.json({ success: true, questions });
    } catch (error) {
        console.error("Generate Remedial Quiz Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate remedial quiz: " + error.message });
    }
};

// ── Export Quiz HTML (Printable Question Paper & Answer Key) ────────
exports.exportQuizHTML = async (req, res) => {
    try {
        const { code } = req.params;
        const includeAnswers = req.query.answers === 'true';
        const quiz = await Quiz.findOne({ code: code.toUpperCase() });
        if (!quiz) return res.status(404).send("<h1>Quiz Not Found</h1>");

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>${quiz.title} - Question Paper</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; }
        .title { font-size: 24px; font-weight: bold; color: #0f172a; }
        .meta { font-size: 14px; color: #64748b; margin-top: 5px; }
        .q-card { margin-bottom: 25px; padding: 18px; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid; }
        .q-num { font-weight: bold; color: #2563eb; }
        .q-text { font-size: 16px; margin-bottom: 12px; font-weight: 600; }
        .options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-left: 20px; }
        .option { font-size: 14px; padding: 6px; }
        .answer-badge { display: inline-block; margin-top: 10px; padding: 4px 10px; background: #dcfce7; color: #166534; font-weight: bold; border-radius: 4px; font-size: 13px; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">🖨️ Print Question Paper</button>
    </div>
    <div class="header">
        <div>
            <div class="title">${quiz.title}</div>
            <div class="meta">Quiz Code: <strong>${quiz.code}</strong> | Total Questions: ${quiz.questions.length} | Time Limit: ${quiz.settings.timeLimit} mins</div>
        </div>
        <div style="text-align: right;">
            <div class="meta">Student Name: _______________________</div>
            <div class="meta">Reg No: _____________________________</div>
        </div>
    </div>
    ${quiz.questions.map((q, idx) => `
        <div class="q-card">
            <div class="q-text"><span class="q-num">Q${idx + 1}.</span> ${q.question}</div>
            ${q.type === 'mcq' || q.type === 'msq' ? `
                <div class="options">
                    ${(q.options || []).map((opt, oIdx) => `
                        <div class="option">(${String.fromCharCode(65 + oIdx)}) ${opt}</div>
                    `).join('')}
                </div>
            ` : ''}
            ${q.type === 'fill-blanks' ? `<div style="margin-top: 10px;">Answer: _______________________________</div>` : ''}
            ${q.type === 'subjective' ? `<div style="margin-top: 10px; height: 80px; border: 1px dashed #cbd5e1; border-radius: 4px;"></div>` : ''}
            ${includeAnswers ? `
                <div class="answer-badge">
                    Correct Answer: ${
                        q.type === 'mcq' ? `(${String.fromCharCode(65 + Number(q.correct))}) ${q.options?.[q.correct] || ''}` :
                        q.type === 'fill-blanks' ? q.blankAnswer :
                        q.correct
                    }
                </div>
            ` : ''}
        </div>
    `).join('')}
</body>
</html>
        `;
        res.send(html);
    } catch (error) {
        console.error("Export Quiz HTML Error:", error);
        res.status(500).send("Failed to generate printable paper.");
    }
};



