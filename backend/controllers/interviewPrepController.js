const User = require('../models/User');
const InterviewSession = require('../models/InterviewSession');
const InterviewProfile = require('../models/InterviewProfile');
const QuestionBank = require('../models/QuestionBank');
const pdfParse = require('pdf-parse');

const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;

// 1. Get Interview Prep Dashboard Data
exports.getDashboardOverview = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        let profile = null;
        let recentSessions = [];

        if (userId) {
            profile = await InterviewProfile.findOne({ userId });
            recentSessions = await InterviewSession.find({ userId, status: 'completed' })
                .sort({ completedAt: -1 })
                .limit(5);
        }

        if (!profile) {
            // Default baseline profile if first time
            profile = {
                targetRole: 'Backend Developer',
                targetCompany: 'Google',
                readiness: {
                    technical: 81,
                    communication: 72,
                    behavioral: 78,
                    confidence: 74,
                    problemSolving: 76
                },
                codeSpiritWeakAreas: [
                    { topic: 'Graphs', score: 42 },
                    { topic: 'Dynamic Programming', score: 58 }
                ],
                upcomingInterviews: [
                    { company: 'Google', role: 'Backend Developer', roundType: 'Technical', scheduledDate: new Date(Date.now() + 86400000 * 3) },
                    { company: 'Microsoft', role: 'Software Engineer', roundType: 'HR Round', scheduledDate: new Date(Date.now() + 86400000 * 6) },
                    { company: 'Amazon', role: 'SDE Intern', roundType: 'Mock Interview', scheduledDate: new Date(Date.now() + 86400000 * 8) }
                ],
                weeklyGoal: { completed: 3, target: 5 }
            };
        }

        // Calculate dynamic preparation percentage from actual session scores if available
        let activePrepPercentage = 78;
        if (recentSessions.length > 0) {
            const validScores = recentSessions.map(s => s.overallScore).filter(s => s > 0);
            if (validScores.length > 0) {
                activePrepPercentage = Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
            }
        }

        // Dynamic readiness derived from recent sessions
        const readiness = { ...profile.readiness };
        if (recentSessions.length > 0) {
            const techScores = recentSessions.map(s => s.dimensionScores?.technicalDepth || s.overallScore).filter(Boolean);
            const commScores = recentSessions.map(s => s.dimensionScores?.communication || s.overallScore).filter(Boolean);
            const behScores = recentSessions.map(s => s.dimensionScores?.structure || s.overallScore).filter(Boolean);
            const confScores = recentSessions.map(s => s.dimensionScores?.confidence || s.overallScore).filter(Boolean);
            const psScores = recentSessions.map(s => s.dimensionScores?.problemSolving || s.overallScore).filter(Boolean);

            if (techScores.length) readiness.technical = Math.round(techScores.reduce((a, b) => a + b, 0) / techScores.length);
            if (commScores.length) readiness.communication = Math.round(commScores.reduce((a, b) => a + b, 0) / commScores.length);
            if (behScores.length) readiness.behavioral = Math.round(behScores.reduce((a, b) => a + b, 0) / behScores.length);
            if (confScores.length) readiness.confidence = Math.round(confScores.reduce((a, b) => a + b, 0) / confScores.length);
            if (psScores.length) readiness.problemSolving = Math.round(psScores.reduce((a, b) => a + b, 0) / psScores.length);
        }

        // CodeSpirit Skill Profile Mock / Actual sync
        const codeSpiritProfile = {
            Arrays: 91,
            Trees: 81,
            Graphs: 42,
            'Dynamic Programming': 58
        };

        // Latest session for Recent Interview Report card
        const latestSession = recentSessions[0] || null;

        res.json({
            success: true,
            profile: {
                targetRole: profile.targetRole || 'Backend Developer',
                targetCompany: profile.targetCompany || 'Google',
                preparationPercentage: activePrepPercentage,
                readiness,
                codeSpiritProfile,
                upcomingInterviews: profile.upcomingInterviews || [],
                weeklyGoal: profile.weeklyGoal || { completed: 3, target: 5 }
            },
            latestSession,
            recommendations: [
                { title: 'Practice System Design', priority: 'High Priority', actionUrl: '/resources', actionText: 'Practice' },
                { title: 'Improve STAR Responses', priority: 'Medium Priority', actionUrl: '/soft-skills', actionText: 'Practice' },
                { title: 'Reduce Filler Words', priority: 'Medium Priority', actionUrl: '/soft-skills', actionText: 'Speaking Drill' },
                { title: 'Revise Graph Algorithms', priority: 'High Priority', actionUrl: '/codespirit', actionText: 'Practice in CodeSpirit' }
            ]
        });

    } catch (error) {
        console.error('Dashboard Overview Error:', error);
        res.status(500).json({ message: 'Error fetching interview dashboard data' });
    }
};

// 2. Analyze Job Description & Resume
exports.analyzeJobContext = async (req, res) => {
    try {
        let { role, company, jobDescription, resumeText } = req.body;

        if (req.file) {
            try {
                const pdfData = await pdfParse(req.file.buffer);
                resumeText = pdfData.text.replace(/\s+/g, ' ').trim();
            } catch (err) {
                console.error("PDF Parsing error:", err);
            }
        }

        if (!role) role = 'Software Engineer';
        if (!company) company = 'Tech Industry';

        let detectedSkills = ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'DSA', 'System Design'];
        let recommendedRound = 'Technical Interview';
        let explanation = 'High relevance to this job based on technical backend stack requirements.';

        if (GROQ_API_KEY) {
            try {
                const prompt = `You are an expert AI Technical Recruiter for StudySpirit.
Analyze the target role: "${role}", company: "${company}", and Job Description:
${jobDescription ? jobDescription.substring(0, 3000) : "General Software Engineering Role"}

Resume Context:
${resumeText ? resumeText.substring(0, 2000) : "No resume uploaded."}

Return ONLY a valid JSON object in this exact format:
{
  "detectedSkills": ["Node.js", "Express", "MongoDB", "REST APIs", "DSA", "System Design"],
  "recommendedRound": "Technical",
  "explanation": "High relevance to this job description",
  "likelyStages": ["Technical", "System Design", "Behavioral"]
}`;

                const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'openai/gpt-oss-20b',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.3,
                        response_format: { type: "json_object" }
                    })
                });

                const data = await aiRes.json();
                if (data.choices?.[0]?.message?.content) {
                    const parsed = JSON.parse(data.choices[0].message.content);
                    detectedSkills = parsed.detectedSkills || detectedSkills;
                    recommendedRound = parsed.recommendedRound || recommendedRound;
                    explanation = parsed.explanation || explanation;
                }
            } catch (aiErr) {
                console.error("Groq AI JD Analysis Error (using fallback):", aiErr.message);
            }
        }

        res.json({
            success: true,
            role,
            company,
            detectedSkills,
            recommendedRound,
            explanation,
            likelyStages: ['Technical', 'System Design', 'Behavioral']
        });

    } catch (error) {
        console.error('Job Analysis Error:', error);
        res.status(500).json({ message: 'Error analyzing job context' });
    }
};

// 3. Question Bank Search & Categories
exports.getQuestionBank = async (req, res) => {
    try {
        const { category, difficulty, search } = req.query;

        let query = {};
        if (category && category !== 'All') query.category = category;
        if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { questionText: { $regex: search, $options: 'i' } }
            ];
        }

        let questions = await QuestionBank.find(query).limit(50);

        // Fallback curated questions if database has none seeded
        if (questions.length === 0) {
            questions = [
                {
                    _id: 'q1',
                    title: 'Reverse a Linked List in O(n) Time',
                    category: 'DSA',
                    difficulty: 'Easy',
                    role: 'Backend Developer',
                    questionText: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
                    sampleAnswer: 'Use three pointers: prev, current, next. Iterate through the list, reassigning current.next = prev.',
                    keyConcepts: ['Linked List', 'Two Pointers'],
                    companyTags: ['Amazon', 'Google', 'Microsoft']
                },
                {
                    _id: 'q2',
                    title: 'Design a Rate Limiter System Architecture',
                    category: 'System Design',
                    difficulty: 'Medium',
                    role: 'Backend Developer',
                    questionText: 'How would you design a distributed rate-limiting API service handling 100k requests per second?',
                    sampleAnswer: 'Use Redis Token Bucket or Leaky Bucket algorithm. Implement distributed lock and sliding window logs.',
                    keyConcepts: ['Redis', 'Token Bucket', 'Scalability'],
                    companyTags: ['Uber', 'Google', 'Meta']
                },
                {
                    _id: 'q3',
                    title: 'Tell me about a time you had a technical disagreement',
                    category: 'Behavioral',
                    difficulty: 'Medium',
                    role: 'General Tech',
                    questionText: 'Describe a situation where you disagreed with a senior developer or teammate on architecture. How did you resolve it?',
                    sampleAnswer: 'Focus on STAR methodology: Situation, Task, Action (data-backed benchmarks, polite communication), Result.',
                    keyConcepts: ['Conflict Resolution', 'STAR Methodology'],
                    companyTags: ['Amazon', 'Microsoft']
                },
                {
                    _id: 'q4',
                    title: 'Explain Database Indexing & B-Trees vs Hash Index',
                    category: 'DBMS',
                    difficulty: 'Medium',
                    role: 'Backend Developer',
                    questionText: 'What is a database index? Why are B-Trees preferred over Hash tables for range queries in SQL databases?',
                    sampleAnswer: 'B-Trees maintain ordered keys enabling O(log n) range searches. Hash indexes only support O(1) exact equality lookup.',
                    keyConcepts: ['Indexing', 'B-Tree', 'Database Performance'],
                    companyTags: ['Oracle', 'Google', 'Amazon']
                },
                {
                    _id: 'q5',
                    title: 'Group Anagrams using Hash Maps',
                    category: 'DSA',
                    difficulty: 'Medium',
                    role: 'Software Engineer',
                    questionText: 'Given an array of strings, group the anagrams together in any order.',
                    sampleAnswer: 'Use a hash map where key is sorted string or character count tuple, and value is array of anagrams.',
                    keyConcepts: ['Strings', 'Hash Map'],
                    companyTags: ['Facebook', 'Amazon']
                }
            ];

            if (category && category !== 'All') {
                questions = questions.filter(q => q.category === category);
            }
        }

        res.json({
            success: true,
            total: questions.length,
            questions
        });
    } catch (error) {
        console.error('Question Bank Error:', error);
        res.status(500).json({ message: 'Error fetching question bank' });
    }
};
