const User = require('../models/User');
const InterviewSession = require('../models/InterviewSession');
const InterviewSubmission = require('../models/InterviewSubmission');
const InterviewExam = require('../models/InterviewExam');
const CareerProfile = require('../models/CareerProfile');
const pdfParse = require('pdf-parse');
const aiProviderService = require('../services/aiProviderService');

// ── Single source of truth for API keys — set these in your .env / Render dashboard ──
const GROQ_KEY_INTERVIEW  = process.env.GROQ_API_KEY_INTERVIEW  || process.env.GROQ_API_KEY;
const GROQ_KEY_SOFTSKILLS = process.env.GROQ_API_KEY_SOFTSKILLS || process.env.GROQ_API_KEY;

if (!GROQ_KEY_INTERVIEW)  console.warn('⚠️  GROQ_API_KEY_INTERVIEW not set — AI Interview features will failover to offline bank.');
if (!GROQ_KEY_SOFTSKILLS) console.warn('⚠️  GROQ_API_KEY_SOFTSKILLS not set — Soft Skills features will fail.');

// ── Resilient JSON parser — strips markdown fences, extracts JSON from LLM output ──
function cleanAndParseJSON(rawText) {
    if (!rawText || typeof rawText !== 'string') throw new Error('Empty AI response');
    // Strip markdown code fences
    let cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    // Try direct parse first
    try {
        return JSON.parse(cleaned);
    } catch (_) {
        // Fallback: extract the first { ... } or [ ... ] block
        const objMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objMatch) return JSON.parse(objMatch[0]);
        const arrMatch = cleaned.match(/\[[\s\S]*\]/);
        if (arrMatch) return JSON.parse(arrMatch[0]);
        throw new Error('Could not extract valid JSON from AI response');
    }
}

// ── Helper: Update CareerProfile soft skills scores after evaluation ──
async function updateSoftSkillsProfile(userId, newScore, type) {
    try {
        if (!userId) return;
        let profile = await CareerProfile.findOne({ user: userId });
        if (!profile) profile = new CareerProfile({ user: userId });
        if (!profile.softSkillsProfile) {
            profile.softSkillsProfile = { communicationScore: 0, confidenceScore: 0, vocabularyLevel: 'A1', overallRating: 0 };
        }

        // Rolling average: blend old score with new (70% old, 30% new for smoothing)
        const oldComm = profile.softSkillsProfile.communicationScore || 0;
        const blended = oldComm === 0 ? newScore : Math.round(oldComm * 0.7 + newScore * 0.3);
        profile.softSkillsProfile.communicationScore = Math.min(100, blended);

        // Map 0-100 score to CEFR-like level
        const level = blended >= 90 ? 'C2' : blended >= 75 ? 'C1' : blended >= 60 ? 'B2' : blended >= 45 ? 'B1' : blended >= 25 ? 'A2' : 'A1';
        profile.softSkillsProfile.vocabularyLevel = level;
        profile.softSkillsProfile.overallRating = Math.round(blended / 10);
        profile.softSkillsProfile.confidenceScore = Math.min(100, Math.round((profile.softSkillsProfile.confidenceScore || 0) * 0.8 + (newScore * 0.2)));

        profile.updatedAt = new Date();
        await profile.save();
        console.log(`✅ Updated CareerProfile softSkillsProfile for user ${userId} (${type}: ${newScore})`);
    } catch (err) {
        console.error('⚠️ CareerProfile update failed (non-blocking):', err.message);
    }
}

// AI Interview - Mock Interviewer with Scoring & History
exports.interviewWithAI = async (req, res) => {
    console.log("🎤 AI Interview Request Received");

    try {
        let { message, mode, context, resumeText, sessionId, totalQuestions, questionNumber, role, company, submissionId, examCode } = req.body;
        const user = req.user ? await User.findById(req.user.id) : null;

        // Parse context if string
        if (typeof context === 'string') {
            try { context = JSON.parse(context); } catch (e) { context = []; }
        }

        // Handle uploaded Resume PDF
        if (req.file) {
            try {
                const data = await pdfParse(req.file.buffer);
                resumeText = data.text.replace(/\s+/g, ' ').trim();
                console.log("✅ PDF Parsed. Length:", resumeText.length);
            } catch (err) {
                console.error('❌ PDF Parse Error:', err);
                return res.status(400).json({ message: "Failed to parse resume PDF." });
            }
        }

        if (!message && !mode && !resumeText) {
            return res.status(400).json({ message: "Message, mode, or resume is required" });
        }

        const isNewResumeSession = !!resumeText && (!context || context.length === 0);
        const qTotal = Math.min(Math.max(parseInt(totalQuestions) || 5, 3), 20);
        const qNum = parseInt(questionNumber) || 1;

        // Create or fetch session
        let session = null;
        if (sessionId) {
            session = await InterviewSession.findById(sessionId);
        }
        
        if (!session && (!context || context.length === 0)) {
            session = await InterviewSession.create({
                userId: user ? user._id : null,
                mode: mode || 'technical',
                targetRole: role || 'Software Engineer',
                targetCompany: company || 'General Tech',
                totalQuestions: qTotal,
                resumeText: resumeText ? resumeText.substring(0, 5000) : '',
                status: 'in-progress'
            });

            // Link to submission if this is an exam
            if (submissionId) {
                await InterviewSubmission.findByIdAndUpdate(submissionId, { sessionId: session._id });
                console.log(`🔗 Linked session ${session._id} to submission ${submissionId}`);
            }
        }

        // Fetch custom questions from exam if active
        let customQuestionsList = [];
        if (examCode) {
            const exam = await InterviewExam.findOne({ code: examCode });
            if (exam && exam.customQuestions && exam.customQuestions.get(mode)) {
                customQuestionsList = exam.customQuestions.get(mode);
            }
        }

        // Delegate execution to our resilient provider service
        const aiResponse = await aiProviderService.generateInterviewResponse({
            message,
            mode,
            context,
            resumeText: session ? session.resumeText : resumeText,
            totalQuestions: qTotal,
            questionNumber: qNum,
            role: role || (session ? session.targetRole : 'Software Engineer'),
            company: company || (session ? session.targetCompany : 'General Tech'),
            customQuestionsList
        });

        // Save exchange to database if not the first greeting
        if (session && message && qNum > 1) {
            session.exchanges.push({
                questionNumber: qNum - 1,
                question: context && context.length > 0 ? context[context.length - 2]?.content || '' : '',
                answer: message,
                score: aiResponse.parsedResponse?.score || aiResponse.score || 0,
                feedback: aiResponse.parsedResponse?.feedback || aiResponse.feedback || '',
                idealAnswer: aiResponse.parsedResponse?.idealAnswer || aiResponse.idealAnswer || ''
            });
            session.questionsAsked = qNum - 1;
            await session.save();
        }

        res.json({
            response: aiResponse.response || aiResponse.spokenText,
            parsedResponse: aiResponse.parsedResponse || {
                question: aiResponse.question,
                feedback: aiResponse.feedback,
                idealAnswer: aiResponse.idealAnswer,
                score: aiResponse.score,
                spokenText: aiResponse.spokenText,
                speakers: aiResponse.speakers
            },
            sessionId: session?._id,
            resumeTextParsed: isNewResumeSession ? resumeText : undefined,
            questionNumber: qNum,
            totalQuestions: qTotal,
            source: aiResponse.source
        });

    } catch (error) {
        console.error('❌ Interview Error:', error);
        res.status(500).json({ message: "Error processing interview session" });
    }
};

// End Interview & Generate Final Report
exports.endInterview = async (req, res) => {
    try {
        const { sessionId, lastAnswer, lastQuestion, lastQuestionNumber } = req.body;

        if (!sessionId) return res.status(400).json({ message: "Session ID is required" });
        const session = await InterviewSession.findById(sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });

        if (lastAnswer && lastQuestionNumber) {
            session.exchanges.push({
                questionNumber: lastQuestionNumber,
                question: lastQuestion || '',
                answer: lastAnswer,
                score: 0,
                feedback: ''
            });
        }

        const scores = session.exchanges.filter(e => e.score > 0).map(e => e.score);
        const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;

        // Generate report via resilient service
        const finalReport = await aiProviderService.generateFinalReport(session, session.exchanges, avgScore);

        session.status = 'completed';
        session.overallScore = finalReport.overallScore || avgScore;
        session.strengths = finalReport.strengths || [];
        session.improvements = finalReport.improvements || [];
        session.finalFeedback = finalReport.overallFeedback || finalReport.finalFeedback || '';
        if (finalReport.gdMetrics) {
            session.gdMetrics = finalReport.gdMetrics;
        }
        session.completedAt = new Date();
        session.duration = Math.floor((new Date() - session.startedAt) / 1000);
        await session.save();

        res.json({ success: true, report: session, source: finalReport.source });
    } catch (error) { 
        console.error("❌ End Interview Error:", error);
        res.status(500).json({ message: error.message }); 
    }
};

// Get Interview History
exports.getInterviewHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await InterviewSession.find({ userId }).sort({ startedAt: -1 }).limit(20).select('-resumeText -exchanges.answer');
        res.json({ success: true, sessions });
    } catch (error) { res.status(500).json({ message: "Error" }); }
};

// Get Single Interview Session Detail
exports.getInterviewSession = async (req, res) => {
    try {
        const session = await InterviewSession.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.json({ success: true, session });
    } catch (error) { res.status(500).json({ message: "Error" }); }
};

// Update study time (Heartbeat)
exports.logHeartbeat = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const today = new Date().toISOString().split('T')[0];
        if (!user.stats) user.stats = { totalStudyTime: 0, xp: 0, level: 1 };
        user.stats.totalStudyTime += 60;
        let todayLog = user.activityLog.find(log => log.date === today);
        if (!todayLog) {
            todayLog = { date: today, problemsSolved: 0, studyTime: 0, xpEarned: 0, focusSessions: 0 };
            user.activityLog.push(todayLog);
        }
        todayLog.studyTime += 60;
        user.stats.xp += 5;
        todayLog.xpEarned += 5;
        user.stats.level = 1 + Math.floor(user.stats.xp / 1000);
        await user.save();
        res.json({ success: true, stats: user.stats });
    } catch (error) { res.status(500).json({ message: "Error" }); }
};

// Soft Skills AI Conversation
exports.softSkillsAI = async (req, res) => {
    try {
        const { message, previousMessages = [] } = req.body;
        const GROQ_API_KEY = GROQ_KEY_SOFTSKILLS;
        if (!GROQ_API_KEY) return res.status(503).json({ message: 'AI service not configured. Add GROQ_API_KEY to environment variables.' });

        const context = previousMessages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));

        const systemPrompt = `You are "Aria", a warm and encouraging English communication coach.
Your goals:
1. Have a natural, friendly conversation in English to build the student's confidence.
2. If the student makes a grammar or vocabulary mistake, GENTLY correct it at the end of your reply — never interrupt the flow.
3. Keep your replies concise — 2-3 sentences max.
4. Ask a follow-up question to keep the conversation going.
5. Topics: daily life, career goals, college experiences, opinions on technology, current events.

ALWAYS return valid JSON in this exact format:
{
  "correction": "<grammar/vocab correction if any, or null if speech was perfect>",
  "reply": "<your conversational response + one follow-up question>"
}`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...context,
                    { role: 'user', content: message }
                ],
                temperature: 0.75,
                max_tokens: 400,
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        if (!data.choices?.[0]?.message?.content) {
            return res.status(500).json({ message: 'AI response error', reply: 'Sorry, I had trouble responding. Please try again.' });
        }
        res.json(cleanAndParseJSON(data.choices[0].message.content));
    } catch (error) {
        console.error('SoftSkills AI Error:', error);
        res.status(500).json({ correction: null, reply: 'Sorry, I encountered an error. Please try again.' });
    }
};

// Generate Vocabulary List
exports.generateVocabulary = async (req, res) => {
    try {
        const GROQ_API_KEY = GROQ_KEY_SOFTSKILLS;
        if (!GROQ_API_KEY) return res.status(503).json({ message: 'AI service not configured.' });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [{
                    role: 'system',
                    content: `Generate a list of exactly 50 advanced English vocabulary words useful for professional and academic communication.
Return ONLY valid JSON in this exact format:
{
  "words": [
    { "word": "Articulate", "meaning": "Able to express ideas clearly and effectively", "usage": "She articulated her concerns with great precision during the meeting.", "context": "Professional" },
    ... (50 total)
  ]
}`
                }],
                temperature: 0.6,
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        if (!data.choices?.[0]?.message?.content) return res.status(500).json({ message: 'AI error' });
        res.json(cleanAndParseJSON(data.choices[0].message.content));
    } catch (error) {
        console.error('Vocabulary Error:', error);
        res.status(500).json({ message: 'Error generating vocabulary' });
    }
};

// Generate Writing Topic
exports.generateWritingTopic = async (req, res) => {
    try {
        const GROQ_API_KEY = GROQ_KEY_SOFTSKILLS;
        if (!GROQ_API_KEY) return res.status(503).json({ message: 'AI service not configured.' });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [{
                    role: 'system',
                    content: `Generate 1 professional writing topic suitable for a 5-minute essay by an engineering/tech student.
The topic should be thought-provoking and relevant to technology, career, or society.
Return ONLY the topic as a single clean sentence — no numbering, no quotes, no explanation.`
                }],
                temperature: 0.8,
                max_tokens: 80
            })
        });
        const data = await response.json();
        if (!data.choices?.[0]?.message?.content) return res.status(500).json({ message: 'AI error' });
        res.json({ topic: data.choices[0].message.content.trim() });
    } catch (error) {
        console.error('Writing Topic Error:', error);
        res.status(500).json({ message: 'Error generating topic' });
    }
};

// Evaluate Writing
exports.evaluateWriting = async (req, res) => {
    try {
        const { topic, essay } = req.body;
        if (!essay || essay.length < 10) return res.status(400).json({ message: 'Essay is too short to evaluate.' });
        const GROQ_API_KEY = GROQ_KEY_SOFTSKILLS;
        if (!GROQ_API_KEY) return res.status(503).json({ message: 'AI service not configured.' });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [{
                    role: 'system',
                    content: `You are an expert English writing evaluator. Evaluate the following student essay.

WRITING TOPIC: ${topic}

STUDENT ESSAY:
${essay}

Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "feedback": "<2-3 sentence overall assessment of the essay quality, coherence, and relevance to topic>",
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}`
                }],
                temperature: 0.4,
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        if (!data.choices?.[0]?.message?.content) return res.status(500).json({ message: 'AI evaluation error' });
        const result = cleanAndParseJSON(data.choices[0].message.content);

        // Sync score to CareerProfile (non-blocking)
        if (req.user && req.user.id && result.score != null) {
            updateSoftSkillsProfile(req.user.id, result.score, 'writing');
        }

        res.json(result);
    } catch (error) {
        console.error('Writing Evaluate Error:', error);
        res.status(500).json({ message: 'Error evaluating essay' });
    }
};

// Generate Speaking Topic
exports.generateSpeakingTopic = async (req, res) => {
    try {
        const GROQ_API_KEY = GROQ_KEY_SOFTSKILLS;
        if (!GROQ_API_KEY) return res.status(503).json({ message: 'AI service not configured.' });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [{
                    role: 'system',
                    content: `Generate 1 extempore speaking topic for an engineering or tech student (2 minute talk).
The topic should be engaging, relevant to technology or society, and suitable for a confident impromptu speech.
Return ONLY the topic as a single clean sentence — no numbering, no quotes, no extra text.`
                }],
                temperature: 0.9,
                max_tokens: 80
            })
        });
        const data = await response.json();
        if (!data.choices?.[0]?.message?.content) return res.status(500).json({ message: 'AI error' });
        res.json({ topic: data.choices[0].message.content.trim() });
    } catch (error) {
        console.error('Speaking Topic Error:', error);
        res.status(500).json({ message: 'Error generating topic' });
    }
};

// Evaluate Speaking
exports.evaluateSpeech = async (req, res) => {
    try {
        const { topic, transcript } = req.body;
        if (!transcript || transcript.trim().length < 20) return res.status(400).json({ message: 'Transcript is too short to evaluate. Please speak more.' });
        const GROQ_API_KEY = GROQ_KEY_SOFTSKILLS;
        if (!GROQ_API_KEY) return res.status(503).json({ message: 'AI service not configured.' });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [{
                    role: 'system',
                    content: `You are an expert public speaking coach. Evaluate the following student's extempore speech.

SPEAKING TOPIC: ${topic}

STUDENT'S SPEECH TRANSCRIPT:
${transcript}

Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "feedback": "<2-3 sentence assessment covering relevance, fluency, content depth, and structure>",
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}`
                }],
                temperature: 0.4,
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        if (!data.choices?.[0]?.message?.content) return res.status(500).json({ message: 'AI evaluation error' });
        const result = cleanAndParseJSON(data.choices[0].message.content);

        // Sync score to CareerProfile (non-blocking)
        if (req.user && req.user.id && result.score != null) {
            updateSoftSkillsProfile(req.user.id, result.score, 'speaking');
        }

        res.json(result);
    } catch (error) {
        console.error('Speech Evaluate Error:', error);
        res.status(500).json({ message: 'Error evaluating speech' });
    }
};

exports.checkATSScore = async (req, res) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;
        const { jobDescription } = req.body;

        if (!GROQ_API_KEY) return res.status(500).json({ message: "Groq API Key missing" });
        if (!req.file) return res.status(400).json({ message: "No resume PDF provided." });

        let resumeText = "";
        try {
            const data = await pdfParse(req.file.buffer);
            resumeText = data.text.replace(/\s+/g, ' ').trim();
        } catch (err) {
            return res.status(400).json({ message: "Failed to read the resume PDF." });
        }

        const prompt = `
        Analyze the following resume text as an elite ATS Expert.
        
        **Resume Text:**
        ${resumeText.substring(0, 6000)}
        
        **Target Job Description (Optional):**
        ${jobDescription ? jobDescription.substring(0, 4000) : "Perform a general industry-standard evaluation."}
        
        Return STRICTLY a JSON object:
        {
          "overallScore": 0-100,
          "matchRate": 0-100,
          "subScores": { "formatting": 0-100, "impactMetrics": 0-100, "readability": 0-100, "keywordDensity": 0-100 },
          "summary": "Short professional summary",
          "strengths": ["..."],
          "weaknesses": ["..."],
          "improvements": ["..."],
          "missingKeywords": ["..."],
          "strongVerbsFound": ["..."]
        }`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        res.json({ result: JSON.parse(data.choices[0].message.content) });

    } catch (error) {
        console.error("ATS Checker Error:", error);
        res.status(500).json({ message: "Error evaluating resume" });
    }
};
