const User = require('../models/User');
const QuestionAttempt = require('../models/QuestionAttempt');
const TopicMastery = require('../models/TopicMastery');
const SavedQuestion = require('../models/SavedQuestion');
const QuizSubmission = require('../models/QuizSubmission');
const Quiz = require('../models/Quiz');

const GROQ_API_KEY = process.env.GROQ_API_KEY_QUIZ || process.env.GROQ_API_KEY;

// ── GET /api/practice/dashboard ──────────────────────────────────────────────
exports.getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;

        let userProfile = {
            name: req.user ? req.user.name : "Student",
            avatar: req.user ? (req.user.avatar || '👨‍🎓') : '👨‍🎓',
            streak: 0,
            bestStreak: 0
        };

        if (userId) {
            const u = await User.findById(userId).select('name avatar stats quizStats');
            if (u) {
                userProfile.name = u.name;
                userProfile.avatar = u.avatar || '👨‍🎓';
                userProfile.streak = u.stats?.streak || 0;
                userProfile.bestStreak = u.stats?.streak || 0;
            }
        }

        // Fetch aggregate mastery & attempts data
        let totalSolved = 0;
        let avgAccuracy = 0;

        if (userId) {
            totalSolved = await QuestionAttempt.countDocuments({ userId });
            if (totalSolved > 0) {
                const correctCount = await QuestionAttempt.countDocuments({ userId, isCorrect: true });
                avgAccuracy = Math.round((correctCount / totalSolved) * 100);
            }
        }

        // Target 1st Semester Subjects
        const targetSubjects = [
            "Python Programming",
            "HTML & CSS",
            "JavaScript Fundamentals",
            "Basics of Computers",
            "Digital Logic & Systems"
        ];

        const topicMasteryList = [];
        let totalMasterySum = 0;
        let attemptedSubjectsCount = 0;

        for (const subName of targetSubjects) {
            let mastery = 0;
            let totalAtt = 0;
            let correctAtt = 0;

            if (userId) {
                const regex = new RegExp(subName.split(' ')[0], 'i');
                totalAtt = await QuestionAttempt.countDocuments({ userId, subject: { $regex: regex } });
                if (totalAtt > 0) {
                    correctAtt = await QuestionAttempt.countDocuments({ userId, subject: { $regex: regex }, isCorrect: true });
                    const acc = (correctAtt / totalAtt) * 100;
                    mastery = Math.min(100, Math.round(acc * 0.8 + Math.min(20, totalAtt * 2)));
                    totalMasterySum += mastery;
                    attemptedSubjectsCount++;
                }
            }

            topicMasteryList.push({
                name: subName,
                mastery: mastery,
                totalAttempts: totalAtt,
                correctAttempts: correctAtt
            });
        }

        const overallMastery = attemptedSubjectsCount > 0 ? Math.round(totalMasterySum / attemptedSubjectsCount) : 0;

        // Calculate Today's attempts
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        let todayAttempts = 0;
        if (userId) {
            todayAttempts = await QuestionAttempt.countDocuments({
                userId,
                createdAt: { $gte: startOfToday }
            });
        }

        // Summary stats cards
        const summaryCards = {
            overallMastery: { value: overallMastery },
            questionsSolved: { value: totalSolved },
            averageAccuracy: { value: avgAccuracy }
        };

        res.json({
            success: true,
            userProfile,
            summaryCards,
            topicMasteryList,
            todayAttempts,
            totalSolved,
            avgAccuracy,
            overallMastery
        });
    } catch (error) {
        console.error("Practice Dashboard Summary Error:", error);
        res.status(500).json({ success: false, message: "Failed to load practice dashboard" });
    }
};

// ── POST /api/practice/attempt ────────────────────────────────────────────────
exports.submitQuestionAttempt = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const {
            questionId,
            questionText,
            options,
            selectedAnswer,
            correctAnswer,
            isCorrect,
            subject = 'General Programming',
            topic = 'General',
            difficulty = 'medium',
            timeTaken = 0,
            confidence = 'none',
            explanationGiven = '',
            keyConcept = ''
        } = req.body;

        const isMistake = !isCorrect;

        let attempt = null;
        if (userId) {
            attempt = await QuestionAttempt.create({
                userId,
                questionId: String(questionId || Date.now()),
                questionText: questionText || 'Question',
                options: options || [],
                selectedAnswer,
                correctAnswer,
                isCorrect,
                subject,
                topic,
                difficulty,
                timeTaken,
                confidence,
                explanationGiven,
                keyConcept,
                isMistake,
                resolved: isCorrect
            });

            // Update Topic Mastery
            let tm = await TopicMastery.findOne({ userId, subject, topic });
            if (!tm) {
                tm = new TopicMastery({
                    userId,
                    subject,
                    topic,
                    masteryPercentage: isCorrect ? 35 : 10,
                    accuracy: isCorrect ? 100 : 0,
                    totalAttempted: 1,
                    correctCount: isCorrect ? 1 : 0,
                    mistakeCount: isMistake ? 1 : 0
                });
            } else {
                tm.totalAttempted += 1;
                if (isCorrect) tm.correctCount += 1;
                else tm.mistakeCount += 1;

                tm.accuracy = Math.round((tm.correctCount / tm.totalAttempted) * 100);

                // Weight formula: Accuracy (60%) + Consistency/Attempts (40%)
                const weight = difficulty === 'hard' ? 1.2 : difficulty === 'medium' ? 1.0 : 0.8;
                let calculatedMastery = Math.min(100, Math.round(tm.accuracy * weight));
                tm.masteryPercentage = calculatedMastery;
                tm.lastPracticedAt = new Date();

                if (tm.masteryPercentage >= 85) tm.status = 'mastered';
                else if (isMistake) tm.status = 'weak';
                else tm.status = 'strong';
            }
            await tm.save();

            // Update User Stats & Streak
            const u = await User.findById(userId);
            if (u) {
                if (!u.stats) u.stats = {};
                u.stats.totalProblems = (u.stats.totalProblems || 0) + 1;
                u.stats.xp = (u.stats.xp || 0) + (isCorrect ? 15 : 5);
                await u.save();
            }
        }

        // Misconception warning flag: Wrong answer + High confidence
        const isMisconception = !isCorrect && (confidence === 'very_confident' || confidence === 'fairly_sure');

        res.json({
            success: true,
            attempt,
            isMisconception,
            feedbackMessage: isCorrect
                ? "✓ Correct! Mastery updated."
                : isMisconception
                ? "✕ High confidence misconception detected. Review explanation carefully."
                : "✕ Incorrect answer. Practice this topic again."
        });

    } catch (error) {
        console.error("Submit Question Attempt Error:", error);
        res.status(500).json({ success: false, message: "Failed to record question attempt" });
    }
};

// ── GET /api/practice/smart ───────────────────────────────────────────────────
exports.getSmartPractice = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;

        let targetTopic = "OOP — Runtime Polymorphism";
        let targetSubject = "Python";
        let reason = "You have struggled with this concept in your last 3 attempts.";

        if (userId) {
            const weakTM = await TopicMastery.findOne({ userId, status: 'weak' }).sort({ masteryPercentage: 1 });
            if (weakTM) {
                targetTopic = weakTM.topic;
                targetSubject = weakTM.subject;
                reason = `Your current mastery in ${weakTM.topic} is ${weakTM.masteryPercentage}%. Practice to reach mastery!`;
            }
        }

        const sampleQuestions = [
            {
                id: 'sp-1',
                subject: targetSubject,
                topic: targetTopic,
                type: 'mcq',
                difficulty: 'medium',
                question: 'Which principle of OOP allows a subclass to provide a specific implementation of a method already defined in its superclass?',
                options: [
                    'Method Overloading',
                    'Method Overriding (Runtime Polymorphism)',
                    'Abstraction',
                    'Encapsulation'
                ],
                correct: 1,
                explanation: 'Method overriding is runtime polymorphism where the call to an overridden method is resolved dynamically at runtime based on the actual object instance.',
                keyConcept: 'Runtime Polymorphism allows object-specific method execution dynamically.'
            },
            {
                id: 'sp-2',
                subject: targetSubject,
                topic: targetTopic,
                type: 'mcq',
                difficulty: 'hard',
                question: 'In Python, how is method resolution order (MRO) determined in multiple inheritance?',
                options: [
                    'Depth-First Search',
                    'C3 Linearization Algorithm',
                    'Breadth-First Search',
                    'Random order'
                ],
                correct: 1,
                explanation: 'Python uses the C3 Linearization algorithm to build the Method Resolution Order (MRO), ensuring class hierarchy ordering and monotonicity.',
                keyConcept: 'C3 Linearization guarantees consistent multiple inheritance resolution.'
            }
        ];

        res.json({
            success: true,
            recommendation: {
                subject: targetSubject,
                topic: targetTopic,
                questionCount: 10,
                estimatedTimeMinutes: 8,
                difficultyMode: 'Adaptive',
                reason
            },
            questions: sampleQuestions
        });

    } catch (error) {
        console.error("Get Smart Practice Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate smart practice session" });
    }
};

// ── GET /api/practice/mistakes ────────────────────────────────────────────────
exports.getMistakes = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;

        let groupedMistakes = [
            {
                subject: "Python",
                topics: [
                    { topic: "OOP Concepts", mistakeCount: 8 },
                    { topic: "Exception Handling", mistakeCount: 5 }
                ]
            },
            {
                subject: "DBMS",
                topics: [
                    { topic: "SQL Joins", mistakeCount: 6 }
                ]
            },
            {
                subject: "Operating Systems",
                topics: [
                    { topic: "Deadlock & Semaphore", mistakeCount: 4 }
                ]
            }
        ];

        if (userId) {
            const attempts = await QuestionAttempt.find({ userId, isMistake: true, resolved: false });
            if (attempts.length > 0) {
                const map = {};
                attempts.forEach(a => {
                    if (!map[a.subject]) map[a.subject] = {};
                    if (!map[a.subject][a.topic]) map[a.subject][a.topic] = 0;
                    map[a.subject][a.topic]++;
                });

                groupedMistakes = Object.keys(map).map(sub => ({
                    subject: sub,
                    topics: Object.keys(map[sub]).map(top => ({
                        topic: top,
                        mistakeCount: map[sub][top]
                    }))
                }));
            }
        }

        res.json({ success: true, mistakes: groupedMistakes });

    } catch (error) {
        console.error("Get Mistakes Error:", error);
        res.status(500).json({ success: false, message: "Failed to load mistake practice" });
    }
};

// ── GET /api/practice/topics ──────────────────────────────────────────────────
exports.getTopicTree = async (req, res) => {
    try {
        const topicTree = [
            {
                course: "Computer Science Core",
                subjects: [
                    {
                        name: "Python Programming",
                        chapters: [
                            {
                                name: "Basics & Fundamentals",
                                topics: ["Variables & Data Types", "Control Flow", "Functions & Scope"]
                            },
                            {
                                name: "Object Oriented Programming (OOP)",
                                topics: ["Classes & Objects", "Inheritance", "Polymorphism", "Encapsulation & Abstraction"]
                            },
                            {
                                name: "Advanced Python",
                                topics: ["Exception Handling", "Decorators & Generators", "List Comprehensions"]
                            }
                        ]
                    },
                    {
                        name: "Database Management Systems (DBMS)",
                        chapters: [
                            {
                                name: "Relational Databases",
                                topics: ["ER Diagrams", "Relational Schema", "Normal Forms (1NF to BCNF)"]
                            },
                            {
                                name: "SQL Querying",
                                topics: ["Basic Queries & Aggregations", "SQL Joins (Inner, Left, Right, Outer)", "Subqueries & Indexing"]
                            }
                        ]
                    },
                    {
                        name: "Data Structures & Algorithms",
                        chapters: [
                            {
                                name: "Linear Structures",
                                topics: ["Arrays & HashMaps", "Linked Lists", "Stacks & Queues"]
                            },
                            {
                                name: "Trees & Graphs",
                                topics: ["Binary Search Trees (BST)", "Heaps & Priority Queues", "Graph Traversals (BFS/DFS)"]
                            }
                        ]
                    }
                ]
            }
        ];

        res.json({ success: true, topicTree });
    } catch (error) {
        console.error("Get Topic Tree Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch topic hierarchy" });
    }
};

// ── GET /api/practice/analytics ───────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;

        const topicBreakdown = [
            { subject: "Python", mastery: 82, accuracy: 88, status: "strong" },
            { subject: "DBMS", mastery: 68, accuracy: 74, status: "due_for_revision" },
            { subject: "DSA", mastery: 74, accuracy: 80, status: "strong" },
            { subject: "Operating Systems", mastery: 61, accuracy: 65, status: "weak" },
            { subject: "Computer Networks", mastery: 79, accuracy: 83, status: "strong" }
        ];

        const weakAreas = [
            { topic: "OOP — Polymorphism", mastery: 58, reason: "Low accuracy on last 3 attempts" },
            { topic: "Deadlock Detection", mastery: 42, reason: "Multiple unresolved mistakes" }
        ];

        const strongAreas = [
            { topic: "Variables & Functions", mastery: 96, reason: "Consistent 95%+ accuracy" },
            { topic: "SQL Basic Queries", mastery: 92, reason: "Mastered" }
        ];

        res.json({
            success: true,
            overall: {
                mastery: 68,
                accuracy: 78,
                questionsSolved: 247,
                timeSpentHours: 14.5,
                streak: 8
            },
            topicBreakdown,
            weakAreas,
            strongAreas
        });

    } catch (error) {
        console.error("Get Practice Analytics Error:", error);
        res.status(500).json({ success: false, message: "Failed to load learning analytics" });
    }
};

// ── GET /api/practice/question-bank ──────────────────────────────────────────
exports.getQuestionBank = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const { category = 'saved', subject, search } = req.query;

        let questions = [];
        if (userId) {
            const query = { userId };
            if (category !== 'all') query.category = category;
            if (subject) query.subject = subject;
            if (search) query.questionText = { $regex: search, $options: 'i' };

            questions = await SavedQuestion.find(query).sort({ savedAt: -1 });
        }

        // Demo fallbacks if empty
        if (questions.length === 0) {
            questions = [
                {
                    _id: 'qb-1',
                    questionText: 'What is the primary difference between process and thread in OS?',
                    options: ['Process shares memory, thread has isolated memory', 'Thread shares memory space of parent process', 'They are identical', 'Process runs faster'],
                    correctIndex: 1,
                    explanation: 'Threads within the same process share execution context and memory space, making switching faster than inter-process context switching.',
                    keyConcept: 'Thread memory sharing vs Process isolation.',
                    subject: 'Operating Systems',
                    topic: 'Process Management',
                    difficulty: 'medium',
                    category: 'saved'
                },
                {
                    _id: 'qb-2',
                    questionText: 'Which normal form eliminates partial dependency in RDBMS?',
                    options: ['1NF', '2NF', '3NF', 'BCNF'],
                    correctIndex: 1,
                    explanation: 'Second Normal Form (2NF) requires 1NF and ensures every non-prime attribute is fully functionally dependent on the prime key.',
                    keyConcept: '2NF removes partial functional dependencies.',
                    subject: 'DBMS',
                    topic: 'Normalization',
                    difficulty: 'hard',
                    category: 'difficult'
                }
            ];
        }

        res.json({ success: true, questions });
    } catch (error) {
        console.error("Get Question Bank Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch question bank" });
    }
};

// ── POST /api/practice/save-question ─────────────────────────────────────────
exports.saveQuestion = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Please login to save questions" });

        const { questionText, options, correctIndex, explanation, keyConcept, subject, topic, difficulty, category } = req.body;

        const saved = await SavedQuestion.create({
            userId: req.user.id,
            questionText,
            options: options || [],
            correctIndex: correctIndex || 0,
            explanation: explanation || '',
            keyConcept: keyConcept || '',
            subject: subject || 'General',
            topic: topic || 'General',
            difficulty: difficulty || 'medium',
            category: category || 'saved'
        });

        res.json({ success: true, message: "Question saved to Question Bank!", saved });

    } catch (error) {
        console.error("Save Question Error:", error);
        res.status(500).json({ success: false, message: "Failed to save question" });
    }
};

// ── DELETE /api/practice/save-question/:id ────────────────────────────────────
exports.removeSavedQuestion = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

        await SavedQuestion.deleteOne({ _id: req.params.id, userId: req.user.id });
        res.json({ success: true, message: "Question removed from Question Bank" });
    } catch (error) {
        console.error("Remove Saved Question Error:", error);
        res.status(500).json({ success: false, message: "Failed to remove question" });
    }
};

// ── POST /api/practice/ai-studio/generate ────────────────────────────────────
exports.generateAIStudioQuestions = async (req, res) => {
    try {
        const {
            sourceType = 'topic', // 'topic' | 'text' | 'notes'
            sourceContent,
            topic,
            questionTypes = ['mcq'],
            cognitiveLevel = 'Understand',
            difficulty = 'medium',
            count = 10
        } = req.body;

        const apiKey = GROQ_API_KEY;
        if (!apiKey) {
            return res.status(503).json({ success: false, message: "AI key not configured" });
        }

        const prompt = `You are an expert AI Assessment Author & Pedagogical Validator.
Target Topic / Content: "${sourceContent || topic || 'Computer Science'}"
Cognitive Bloom Level: ${cognitiveLevel}
Target Difficulty: ${difficulty.toUpperCase()}
Requested Question Count: ${count}

Generate EXACTLY ${count} questions matching these question types: ${questionTypes.join(', ')}.

CRITICAL RULES:
- Output ONLY a JSON object containing a "questions" array.
- Validate that every option is unique, correct answer is valid, explanation is thorough, and key takeaway concept is provided.

JSON format required:
{
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Question text here",
      "options": ["Opt 1", "Opt 2", "Opt 3", "Opt 4"],
      "correct": 0,
      "explanation": "Detailed step by step explanation.",
      "keyConcept": "Short core concept takeaway.",
      "validationStatus": "ready" // 'ready' or 'needs_review'
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
                model: 'qwen/qwen3.6-27b',
                messages: [{ role: 'system', content: 'Output strictly valid JSON.' }, { role: 'user', content: prompt }],
                temperature: 0.5,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        let content = data.choices[0]?.message?.content;
        let parsed = JSON.parse(content);
        let questions = parsed.questions || parsed.quiz || [];

        // Auto validation status check
        let readyCount = 0;
        let reviewCount = 0;

        questions = questions.map((q, idx) => {
            const isMalformed = !q.question || !q.options || q.options.length < 2 || q.correct === undefined;
            const validationStatus = isMalformed ? 'needs_review' : 'ready';
            if (validationStatus === 'ready') readyCount++; else reviewCount++;

            return {
                ...q,
                id: Date.now() + idx,
                validationStatus
            };
        });

        res.json({
            success: true,
            summary: {
                totalGenerated: questions.length,
                readyCount,
                reviewCount
            },
            questions
        });

    } catch (error) {
        console.error("AI Studio Generate Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate AI Studio questions: " + error.message });
    }
};
