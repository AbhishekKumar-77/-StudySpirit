const EnglishProfile = require('../models/EnglishProfile');
const EnglishSession = require('../models/EnglishSession');
const User = require('../models/User');

const getUserId = (req) => {
    if (req.user) return req.user._id || req.user.id;
    return null;
};

// GET /api/english/profile — get or create learner profile
exports.getProfile = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        let profile = await EnglishProfile.findOne({ user: userId });
        if (!profile) {
            profile = new EnglishProfile({
                user: userId,
                cefrLevel: 'B1',
                scores: {
                    speakingScore: 68,
                    pronunciationScore: 61,
                    grammarScore: 72,
                    vocabularyScore: 58,
                    fluencyScore: 64,
                    confidenceScore: 70,
                    overallConfidence: 64
                },
                weakAreas: ['Vocabulary', 'Pronunciation /r/'],
                recurringMistakes: [
                    {
                        pattern: 'Subject-Verb Agreement',
                        wrongExample: 'Yesterday I go university',
                        correctExample: 'Yesterday I went to university',
                        explanation: 'Use past tense "went" for completed past actions.',
                        category: 'grammar',
                        occurrences: 7,
                        masteryScore: 42,
                        status: 'Needs Practice'
                    },
                    {
                        pattern: 'Preposition of Duration',
                        wrongExample: 'I am studying here since two years',
                        correctExample: 'I have been studying here for two years',
                        explanation: 'Use "for" with durations and Present Perfect Continuous.',
                        category: 'grammar',
                        occurrences: 4,
                        masteryScore: 60,
                        status: 'Needs Practice'
                    }
                ],
                savedVocabulary: [
                    { word: 'Collaborate', meaning: 'Work jointly on an activity', usage: 'We collaborated on the group project.', context: 'Workplace', status: 'Learning' },
                    { word: 'Articulate', meaning: 'Express ideas clearly', usage: 'She articulated her thoughts well.', context: 'Professional', status: 'Practicing' }
                ]
            });
            await profile.save();
        }

        res.json({ success: true, profile });
    } catch (error) {
        console.error('getProfile Error:', error);
        res.status(500).json({ message: 'Failed to fetch English profile' });
    }
};

// POST /api/english/assessment — diagnostic level test submission
exports.submitAssessment = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const { answers, speakingSampleScore } = req.body;

        // Calculate score from diagnostic test
        let totalScore = speakingSampleScore || 70;
        if (answers && Array.isArray(answers)) {
            const correct = answers.filter(a => a.isCorrect).length;
            totalScore = Math.round((correct / answers.length) * 100);
        }

        // Map score to CEFR level
        const level = totalScore >= 90 ? 'C2' : totalScore >= 78 ? 'C1' : totalScore >= 62 ? 'B2' : totalScore >= 45 ? 'B1' : totalScore >= 28 ? 'A2' : 'A1';

        let profile = await EnglishProfile.findOne({ user: userId });
        if (!profile) profile = new EnglishProfile({ user: userId });

        profile.cefrLevel = level;
        profile.assessmentCompleted = true;
        profile.scores.overallConfidence = totalScore;
        profile.scores.grammarScore = Math.min(100, totalScore + 5);
        profile.scores.vocabularyScore = Math.min(100, totalScore - 4);
        profile.scores.speakingScore = totalScore;

        await profile.save();

        res.json({ success: true, cefrLevel: level, score: totalScore, profile });
    } catch (error) {
        console.error('submitAssessment Error:', error);
        res.status(500).json({ message: 'Assessment failed' });
    }
};

// GET /api/english/recommendations — dynamic 15-min practice plan & activity recommendations
exports.getRecommendations = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const profile = await EnglishProfile.findOne({ user: userId });
        const scores = profile?.scores || { fluencyScore: 64, pronunciationScore: 61, vocabularyScore: 58, grammarScore: 72 };

        // Generate weakness-targeted 15-minute practice plan
        const plan = [
            { type: 'Speak', minutes: 5, title: 'Free Talk', desc: 'Speak for 5 mins to improve fluency pace' },
            { type: 'Pronunciation', minutes: 3, title: 'Sound Practice', desc: 'Focus on /r/ and /th/ sound clarity' },
            { type: 'Vocabulary', minutes: 3, title: '5 New Words', desc: 'Master key professional terms' },
            { type: 'Conversation', minutes: 4, title: 'Talk with Aria', desc: 'Real-time conversation with gentle feedback' }
        ];

        // Target lowest metric for recommended activities
        const recommendations = [];
        if (scores.vocabularyScore < 65) {
            recommendations.push({ title: 'Vocabulary Builder', category: 'Vocabulary', desc: 'Learn 5 essential interview words', action: 'vocab' });
        }
        if (scores.pronunciationScore < 65) {
            recommendations.push({ title: 'Pronunciation Coach', category: 'Pronunciation', desc: 'Practice sound /r/ and /th/', action: 'pronunciation' });
        }
        if (scores.fluencyScore < 65) {
            recommendations.push({ title: 'Fluency Drill', category: 'Fluency', desc: 'Reduce long pauses and filler words', action: 'fluency' });
        }
        if (scores.grammarScore < 75) {
            recommendations.push({ title: 'Grammar Coach', category: 'Grammar', desc: 'Fix subject-verb agreement patterns', action: 'grammar' });
        }

        res.json({ success: true, practicePlan: plan, recommendations });
    } catch (error) {
        console.error('getRecommendations Error:', error);
        res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
};

// POST /api/english/session — save practice session & update profile
exports.saveSession = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const { type, topic, transcript, durationSeconds, wpm, fillerCount, scores, grammarErrors, pronunciationErrors, fillerWords, aiFeedback } = req.body;

        const session = new EnglishSession({
            user: userId,
            type: type || 'conversation',
            topic: topic || 'General Practice',
            transcript: transcript || '',
            durationSeconds: durationSeconds || 0,
            wpm: wpm || 0,
            fillerCount: fillerCount || 0,
            scores: scores || { fluency: 70, pronunciation: 70, grammar: 70, vocabulary: 70, confidence: 70, overall: 70 },
            grammarErrors: grammarErrors || [],
            pronunciationErrors: pronunciationErrors || [],
            fillerWords: fillerWords || [],
            aiFeedback: aiFeedback || { strengths: ['Good structure'], improvements: ['Reduce pauses'], overallSummary: 'Solid attempt' }
        });

        await session.save();

        // Update EnglishProfile with rolling average score
        let profile = await EnglishProfile.findOne({ user: userId });
        if (profile && scores) {
            const blend = (oldS, newS) => Math.min(100, Math.round((oldS || 60) * 0.8 + (newS || 70) * 0.2));
            if (scores.fluency) profile.scores.fluencyScore = blend(profile.scores.fluencyScore, scores.fluency);
            if (scores.pronunciation) profile.scores.pronunciationScore = blend(profile.scores.pronunciationScore, scores.pronunciation);
            if (scores.grammar) profile.scores.grammarScore = blend(profile.scores.grammarScore, scores.grammar);
            if (scores.vocabulary) profile.scores.vocabularyScore = blend(profile.scores.vocabularyScore, scores.vocabulary);
            if (scores.confidence) profile.scores.confidenceScore = blend(profile.scores.confidenceScore, scores.confidence);

            // Recompute overall
            const s = profile.scores;
            profile.scores.overallConfidence = Math.round((s.speakingScore + s.pronunciationScore + s.grammarScore + s.vocabularyScore + s.fluencyScore + s.confidenceScore) / 6);
            profile.practiceMinutes += Math.round((durationSeconds || 60) / 60);

            // Add grammar errors to recurring mistakes
            if (grammarErrors && Array.isArray(grammarErrors)) {
                grammarErrors.forEach(err => {
                    const existing = profile.recurringMistakes.find(m => m.pattern.toLowerCase() === (err.reason || '').toLowerCase());
                    if (existing) {
                        existing.occurrences += 1;
                        existing.lastOccurred = new Date();
                    } else if (err.wrong && err.better) {
                        profile.recurringMistakes.push({
                            pattern: err.reason || 'Grammar Usage',
                            wrongExample: err.wrong,
                            correctExample: err.better,
                            explanation: err.reason || 'Check tense or preposition agreement.',
                            category: 'grammar',
                            occurrences: 1,
                            masteryScore: 35,
                            status: 'Needs Practice'
                        });
                    }
                });
            }

            await profile.save();
        }

        res.json({ success: true, session, profile });
    } catch (error) {
        console.error('saveSession Error:', error);
        res.status(500).json({ message: 'Failed to save session' });
    }
};

// GET /api/english/sessions/history — fetch user practice session history
exports.getSessionHistory = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const sessions = await EnglishSession.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ success: true, sessions });
    } catch (error) {
        console.error('getSessionHistory Error:', error);
        res.status(500).json({ message: 'Failed to fetch history' });
    }
};

// POST /api/english/vocabulary/save — save word to personal vocab bank
exports.saveWordToBank = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const { word, meaning, usage, context } = req.body;
        if (!word) return res.status(400).json({ message: 'Word is required' });

        let profile = await EnglishProfile.findOne({ user: userId });
        if (!profile) profile = new EnglishProfile({ user: userId });

        const exists = profile.savedVocabulary.some(w => w.word.toLowerCase() === word.toLowerCase());
        if (!exists) {
            profile.savedVocabulary.push({
                word,
                meaning: meaning || '',
                usage: usage || '',
                context: context || 'General',
                status: 'Learning'
            });
            await profile.save();
        }

        res.json({ success: true, savedVocabulary: profile.savedVocabulary });
    } catch (error) {
        console.error('saveWordToBank Error:', error);
        res.status(500).json({ message: 'Failed to save word' });
    }
};

// GET /api/english/vocabulary/bank — get personal vocabulary bank
exports.getVocabBank = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const profile = await EnglishProfile.findOne({ user: userId });
        res.json({ success: true, vocabulary: profile?.savedVocabulary || [] });
    } catch (error) {
        console.error('getVocabBank Error:', error);
        res.status(500).json({ message: 'Failed to fetch vocabulary bank' });
    }
};
