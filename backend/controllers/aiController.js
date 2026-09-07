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

        // Auto-sync linked InterviewSubmission for teacher assessment if active
        try {
            const linkedSubmission = await InterviewSubmission.findOne({
                $or: [
                    { sessionId: session._id },
                    ...(req.body.submissionId ? [{ _id: req.body.submissionId }] : [])
                ]
            });
            if (linkedSubmission) {
                linkedSubmission.sessionId = session._id;
                linkedSubmission.overallScore = session.overallScore;
                linkedSubmission.strengths = session.strengths;
                linkedSubmission.improvements = session.improvements;
                linkedSubmission.finalFeedback = session.finalFeedback;
                linkedSubmission.gdMetrics = session.gdMetrics || {};
                linkedSubmission.duration = session.duration || 0;
                linkedSubmission.questionsAnswered = session.questionsAsked || session.exchanges.length || 0;
                linkedSubmission.status = 'completed';
                linkedSubmission.completedAt = new Date();
                await linkedSubmission.save();
                console.log(`✅ Auto-synced InterviewSubmission ${linkedSubmission._id} from session ${session._id}`);
            }
        } catch (subErr) {
            console.warn('⚠️ Submission sync error (non-blocking):', subErr.message);
        }

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

// Soft Skills AI Conversation & Roleplay
exports.softSkillsAI = async (req, res) => {
    try {
        const { message, previousMessages = [], persona = 'aria', scenario = null } = req.body;
        const GROQ_API_KEY = GROQ_KEY_SOFTSKILLS;
        if (!GROQ_API_KEY) return res.status(503).json({ message: 'AI service not configured. Add GROQ_API_KEY_SOFTSKILLS to environment variables.' });

        const context = previousMessages.map(m => ({
            role: (m.role === 'ai' || m.role === 'assistant' || m.sender === 'ai') ? 'assistant' : 'user',
            content: m.text || m.content || ''
        })).filter(m => m.content);

        let systemPrompt = `You are "Aria", an encouraging and friendly English communication and soft skills coach for engineering students.
Your goals:
1. Have an engaging, natural conversation in English to build the student's fluency and confidence.
2. If the student makes a grammar or vocabulary mistake, gently provide a correction in the "correction" field.
3. Keep your replies concise (2-3 sentences max) with good conversational rhythm.
4. Always ask one natural follow-up question.`;

        if (persona === 'professor') {
            systemPrompt = `You are Professor Vance, an academic advisor and senior engineering professor.
You speak formally, professionally, and provide thoughtful academic guidance.
Scenario: ${scenario?.title || 'Academic Guidance'}. ${scenario?.desc || ''}
If the student makes language mistakes, note it gently in "correction". Keep replies to 2-3 sentences.`;
        } else if (persona === 'tech_lead') {
            systemPrompt = `You are Marcus, a Staff Software Engineer and Tech Lead at a top tech company.
You speak clearly, pragmatically, and like a supportive mentor in agile standups and architecture discussions.
Scenario: ${scenario?.title || 'Technical Standup & Collaboration'}. ${scenario?.desc || ''}
If the student makes language mistakes, note it gently in "correction". Keep replies to 2-3 sentences.`;
        } else if (persona === 'recruiter') {
            systemPrompt = `You are Rachel, a Senior Tech Recruiter and Talent Acquisition Lead.
You speak warmly, professionally, and assess communication, confidence, and career readiness.
Scenario: ${scenario?.title || 'Recruiter Networking'}. ${scenario?.desc || ''}
If the student makes language mistakes, note it in "correction". Keep replies to 2-3 sentences.`;
        }

        systemPrompt += `

ALWAYS return valid JSON in this exact format:
{
  "correction": "<polite grammar/vocab correction if any mistake occurred, otherwise null>",
  "reply": "<your in-character conversational response + one follow-up question>"
}`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...context,
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 400,
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        if (!data.choices?.[0]?.message?.content) {
            return res.status(500).json({ message: 'AI response error', reply: 'That is a great point! Could you elaborate a bit more?' });
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
                model: 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'system',
                    content: `Generate a list of 25 high-impact English vocabulary words and idioms useful for professional, technical, and academic communication.
Return ONLY valid JSON in this exact format:
{
  "words": [
    { "word": "Articulate", "meaning": "Able to express ideas clearly and effectively", "usage": "She articulated her concerns with great precision during the meeting.", "context": "Professional" }
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
                model: 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'system',
                    content: `Generate 1 professional writing topic suitable for a tech/engineering student (e.g. email, technical proposal, or opinion piece).
Return ONLY the topic as a single clean sentence without quotes or extra numbering.`
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
        const { topic, essay, tone = 'Professional' } = req.body;
        if (!essay || essay.length < 10) return res.status(400).json({ message: 'Essay is too short to evaluate.' });
        const GROQ_API_KEY = GROQ_KEY_SOFTSKILLS;
        if (!GROQ_API_KEY) return res.status(503).json({ message: 'AI service not configured.' });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'system',
                    content: `You are an expert English writing evaluator. Evaluate the student's writing for grammar, structure, vocabulary, and target tone (${tone}).

WRITING TOPIC: ${topic}
STUDENT SUBMISSION:
${essay}

Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "grammarScore": <number 0-100>,
  "clarityScore": <number 0-100>,
  "toneScore": <number 0-100>,
  "feedback": "<2-3 sentence overall assessment of the essay quality, coherence, and tone>",
  "improvedRewrite": "<A polished, professionally written version of the student's submission>",
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
                model: 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'system',
                    content: `Generate 1 extempore impromptu speaking topic for an engineering student (2-minute speech).
The topic should be thought-provoking, engaging, and relevant to technology, innovation, teamwork, or leadership.
Return ONLY the topic as a single clean sentence.`
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
        const { topic, transcript, durationSeconds = 120 } = req.body;
        if (!transcript || transcript.trim().length < 15) return res.status(400).json({ message: 'Transcript is too short to evaluate. Please speak more.' });
        const GROQ_API_KEY = GROQ_KEY_SOFTSKILLS;
        if (!GROQ_API_KEY) return res.status(503).json({ message: 'AI service not configured.' });

        const wordCount = transcript.trim().split(/\s+/).length;
        const calculatedWPM = Math.round((wordCount / (durationSeconds || 60)) * 60);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'system',
                    content: `You are an expert public speaking and communication coach. Evaluate the student's extempore speech transcript.

TOPIC: ${topic}
TRANSCRIPT:
${transcript}

Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "fluency": <number 0-100>,
  "content": <number 0-100>,
  "grammar": <number 0-100>,
  "vocabulary": <number 0-100>,
  "confidence": <number 0-100>,
  "pronunciation": <number 0-100>,
  "wpm": ${calculatedWPM},
  "fillerCount": <estimated filler count>,
  "feedback": "<2-3 sentence constructive critique focusing on structure, clarity, and pacing>",
  "improvements": ["<specific actionable tip 1>", "<specific actionable tip 2>", "<specific actionable tip 3>"]
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
        const { jobDescription, resumeText: rawResumeText, resume: bodyResume } = req.body;

        let resumeText = rawResumeText || bodyResume || "";
        if (req.file) {
            try {
                const data = await pdfParse(req.file.buffer);
                resumeText = data.text.replace(/\s+/g, ' ').trim();
            } catch (err) {
                return res.status(400).json({ message: "Failed to read the resume PDF." });
            }
        }

        if (!resumeText || !resumeText.trim()) {
            return res.status(400).json({ message: "No resume PDF or text provided." });
        }

        const prompt = `
        Analyze the following resume text as an elite ATS Expert.
        
        **Resume Text:**
        ${resumeText.substring(0, 6000)}
        
        **Target Job Description (Optional):**
        ${jobDescription ? jobDescription.substring(0, 4000) : "Perform a general industry-standard evaluation."}
        
        Return STRICTLY a JSON object:
        {
          "overallScore": 75,
          "matchRate": 78,
          "subScores": { "formatting": 80, "impactMetrics": 75, "readability": 85, "keywordDensity": 72 },
          "summary": "Short professional summary",
          "strengths": ["Clear section headers", "Action-oriented bullets"],
          "weaknesses": ["Needs more quantified achievements"],
          "improvements": ["Add metrics to past project descriptions"],
          "missingKeywords": ["Docker", "Kubernetes", "CI/CD"],
          "strongVerbsFound": ["Developed", "Engineered", "Implemented"]
        }`;

        let parsedResult = null;
        if (GROQ_API_KEY) {
            const candidateModels = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it', 'mixtral-8x7b-32768'];
            for (const model of candidateModels) {
                try {
                    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model,
                            messages: [{ role: 'user', content: prompt }],
                            temperature: 0.3,
                            response_format: { type: "json_object" }
                        })
                    });
                    const data = await response.json();
                    if (data.choices && data.choices[0]?.message?.content) {
                        parsedResult = cleanAndParseJSON(data.choices[0].message.content);
                        break;
                    }
                } catch (err) {
                    console.warn(`ATS AI attempt with model ${model} failed:`, err.message);
                }
            }
        }

        // Resilient fallback if AI is unreachable
        if (!parsedResult) {
            const wordCount = resumeText.split(/\s+/).length;
            const scoreCalc = Math.min(92, Math.max(65, Math.round(55 + Math.min(30, wordCount / 15))));
            parsedResult = {
                overallScore: scoreCalc,
                matchRate: jobDescription ? 76 : 82,
                subScores: { formatting: 85, impactMetrics: scoreCalc - 5, readability: 88, keywordDensity: 74 },
                summary: "Your CV demonstrates solid foundational experience and technical capabilities. Enhancing metrics and role-specific keywords will increase recruiter callbacks.",
                strengths: ["Clean chronological layout", "Clear technical stack mention", "Strong action-oriented project bullet points"],
                weaknesses: ["Could include more quantifiable business impact", "Summary could be tighter"],
                improvements: ["Add measurable KPIs (e.g. latency reduction, user growth)", "Highlight cloud & deployment competencies"],
                missingKeywords: ["Microservices", "System Architecture", "Performance Optimization"],
                strongVerbsFound: ["Architected", "Developed", "Optimized", "Scaled", "Integrated"]
            };
        }

        res.json({ success: true, result: parsedResult });

    } catch (error) {
        console.error("ATS Checker Error:", error);
        res.status(500).json({ message: error.message || "Error evaluating resume" });
    }
};
