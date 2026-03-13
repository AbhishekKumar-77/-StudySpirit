const User = require('../models/User');
const InterviewSession = require('../models/InterviewSession');
const InterviewSubmission = require('../models/InterviewSubmission');
const pdfParse = require('pdf-parse');

// AI Interview - Mock Interviewer with Scoring & History
exports.interviewWithAI = async (req, res) => {
    console.log("🎤 AI Interview Request Received");

    try {
        let { message, mode, context, resumeText, sessionId, totalQuestions, questionNumber, role, company, submissionId } = req.body;
        const user = req.user ? await User.findById(req.user.id) : null;
        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;

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

        // Build system prompt with conversational & correction focus
        let systemPrompt = "You are a professional technical interviewer.";

        const commonRules = `
            CRITICAL CONVERSATIONAL RULES:
            1. **BE NATURAL & HUMAN**: You are "Aria", a personal HR interviewer — warm, friendly, but professional. Talk like two people having a real conversation.
            2. **REACT TO ANSWERS**: Always acknowledge what they said before moving on. If they gave a great answer, be genuinely impressed. If it was weak, gently correct them.
            3. **IMMEDIATE CORRECTION**: If the user's answer is wrong or weak, correct them naturally — like a mentor.
            4. **⚠️ STRICTLY ONE QUESTION ONLY ⚠️**: This is the MOST IMPORTANT rule. You MUST ask exactly ONE question per response. NEVER two, NEVER three. Your entire "spokenText" should contain only ONE question mark at the very end. Do NOT ask follow-ups. ONLY ONE question.
            5. **SPOKEN FORMAT**: Write "spokenText" as you would SAY it out loud. Use contractions, natural flow.
            6. **SHORT & FOCUSED**: Keep responses concise — 2-4 sentences of reaction/feedback, then ONE question.
            7. **ROLE AND COMPANY**: You are interviewing the candidate for the role of "${role || 'Software Engineer'}" at ${company === 'Startup' ? 'a High-Growth Startup' : company === 'General Tech' ? 'a tech company' : company || 'General Tech'}. Frame questions contextually based on this role and company.
        `;

        const jsonFormat = `
            RESPONSE FORMAT (strict JSON):
            {
                "question": "The single follow-up question being asked",
                "feedback": "Internal notes about their previous answer",
                "idealAnswer": "A short, bulleted 1-2 sentence example of an ideal, perfect answer to the PREVIOUS question you asked them.",
                "score": 0-10,
                "spokenText": "Your natural response. MUST end with exactly ONE question. No more."
            }
            
            ⚠️ HARD RULE: The "spokenText" must contain EXACTLY ONE question mark (?). If you put more than one ?, you are violating the rules.`;

        if (mode === 'gd') {
            systemPrompt = `You are Aria, the moderator of a Virtual Group Discussion (GD). 
            There are two other AI participants: Alex (Analytical, critical) and Sarah (Creative, enthusiastic).
            The User is the 4th participant.
            
            GD TOPIC: ${role && role !== 'Software Engineer' ? role : 'The Impact of AI on Future Jobs'}
            CURRENT TURN: ${qNum}
            
            GD RULES:
            1. You must simulate a fast-paced group discussion. 
            2. Do NOT write one giant wall of text. Break it down into lines spoken by Alex, Sarah, or Aria.
            3. On turn 1, Aria introduces the topic. On later turns, Alex or Sarah react to the User's previous answer.
            4. Always end with Aria or another AI asking the User a direct question to keep them engaged.
            5. Return STRICT JSON with a "speakers" array.

            RESPONSE FORMAT (strict JSON):
            {
                "speakers": [
                    { "name": "Alex", "text": "Dialogue here..." },
                    { "name": "Aria", "text": "Dialogue here..." }
                ],
                "question": "The final question asked to the user",
                "feedback": "Internal notes on the user's participation quality",
                "idealAnswer": "What a strong GD participant would say next",
                "score": 0-10,
                "spokenText": "Combined text of all speakers (fallback)"
            }
            `;
        } else if (qNum === 1) {
            systemPrompt = `You are "Aria", a Personal HR Interviewer. 
            CANDIDATE'S RESUME: ${resumeText ? resumeText.substring(0, 4000) : "No resume provided."}
            TASK: Introduce yourself and ask "Tell me about yourself."
            ${commonRules}
            ${jsonFormat}
            Set score to 0.`;
        } else {
            systemPrompt = `You are "Aria", a Personal ${mode === 'technical' ? 'Technical' : 'HR'} Interviewer.
            CANDIDATE'S RESUME: ${resumeText ? resumeText.substring(0, 3000) : "No resume provided."}
            CURRENT QUESTION NUMBER: ${qNum}
            MODE: ${mode}
            ${commonRules}
            YOUR TASK: React to previous answer and ask exactly ONE follow-up question.
            ${jsonFormat}`;
        }

        if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.status(500).json({ response: "AI service not configured." });
        }

        const messages = [{ role: 'system', content: systemPrompt }];
        if (context && Array.isArray(context)) messages.push(...context.slice(-12));
        if (message) messages.push({ role: 'user', content: message });
        if (isNewResumeSession && !message) messages.push({ role: 'user', content: "Hi Aria! Let's start." });

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: "json_object" }
            })
        });

        const data = await groqResponse.json();
        let parsedResponse = null;

        if (data.choices && data.choices[0]?.message?.content) {
            const raw = data.choices[0].message.content;
            try {
                parsedResponse = JSON.parse(raw.replace(/```json/g, '').replace(/```/g, '').trim());
            } catch (e) {
                console.error("JSON parse error:", raw);
                parsedResponse = {
                    question: raw, feedback: "", idealAnswer: "", score: 0, spokenText: raw,
                    speakers: [{name: "Aria", text: raw}]
                };
            }
        } else {
            console.error("Groq API error response:", data);
            parsedResponse = { question: "Error.", feedback: "", idealAnswer: "", score: 0, spokenText: "Error.", speakers: [{name: "Aria", text: "Error."}] };
        }

        if (session && message && qNum > 1) {
            session.exchanges.push({
                questionNumber: qNum - 1,
                question: context && context.length > 0 ? context[context.length - 2]?.content || '' : '',
                answer: message,
                score: parsedResponse.score || 0,
                feedback: parsedResponse.feedback || '',
                idealAnswer: parsedResponse.idealAnswer || ''
            });
            session.questionsAsked = qNum - 1;
            await session.save();
        }

        res.json({
            response: parsedResponse.spokenText || parsedResponse.question,
            parsedResponse,
            sessionId: session?._id,
            resumeTextParsed: isNewResumeSession ? resumeText : undefined,
            questionNumber: qNum,
            totalQuestions: qTotal
        });

    } catch (error) {
        console.error('❌ Interview Error:', error);
        res.status(500).json({ message: "Error processing interview" });
    }
};

// End Interview & Generate Final Report
exports.endInterview = async (req, res) => {
    try {
        const { sessionId, lastAnswer, lastQuestion, lastQuestionNumber } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;

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
        const exchangeSummary = session.exchanges.map(e => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');

        let finalReport = { strengths: [], improvements: [], overallFeedback: '', overallScore: avgScore };

        if (GROQ_API_KEY && session.exchanges.length > 0) {
            try {
                const evalFocus = session.mode === 'gd' 
                    ? "Evaluate leadership, debate quality, logical reasoning, and collaborative engagement. Also check if the candidate stayed on topic." 
                    : "Evaluate technical accuracy, communication, and professional confidence.";

                const reportPrompt = `You are a Senior Executive Talent Evaluator. 
Analyze the following ${session.mode} session performance and generate a PREMIUM, HIGHLY CRITICAL feedback report.

MODE: ${session.mode}
USER ROLE: ${session.targetRole}
COMPANY: ${session.targetCompany}

INTERVIEW EXCHANGES:
${exchangeSummary}

Return ONLY valid JSON with this structure:
{
    "overallScore": <number 1-10>,
    "strengths": ["string", "string", "string"],
    "improvements": ["string", "string", "string"],
    "overallFeedback": "Professional assessment (3-4 sentences)",
    "gdMetrics": {
        "logic": 0-10,
        "communication": 0-10,
        "teamwork": 0-10,
        "confidence": 0-10
    }
}`;
                const gRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            { role: 'system', content: 'You are an interview performance evaluator. Return ONLY valid JSON.' },
                            { role: 'user', content: reportPrompt }
                        ],
                        response_format: { type: "json_object" }
                    })
                });
                const rData = await gRes.json();
                if (rData.choices?.[0]?.message?.content) {
                    finalReport = JSON.parse(rData.choices[0].message.content);
                }
            } catch (e) { console.error(e); }
        }

        session.status = 'completed';
        session.overallScore = finalReport.overallScore || avgScore;
        session.strengths = finalReport.strengths || [];
        session.improvements = finalReport.improvements || [];
        session.finalFeedback = finalReport.overallFeedback || '';
        if (finalReport.gdMetrics) {
            session.gdMetrics = finalReport.gdMetrics;
        }
        session.completedAt = new Date();
        session.duration = Math.floor((new Date() - session.startedAt) / 1000);
        await session.save();

        res.json({ success: true, report: session });
    } catch (error) { res.status(500).json({ message: error.message }); }
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
        const GROQ_API_KEY = process.env.GROQ_API_KEY_SOFTSKILLS || process.env.GROQ_API_KEY;
        const context = previousMessages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'Wise mentor. Return JSON: {correction, reply}' },
                    ...context,
                    { role: 'user', content: message }
                ],
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));
    } catch (error) { res.status(500).json({ message: "Error" }); }
};

// Generate Vocabulary List
exports.generateVocabulary = async (req, res) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: 'Generate 50 vocab words in JSON array format.' }],
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));
    } catch (error) { res.status(500).json({ message: "Error" }); }
};

// Generate Writing Topic
exports.generateWritingTopic = async (req, res) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: 'Generate 1 writing topic.' }]
            })
        });
        const data = await response.json();
        res.json({ topic: data.choices[0].message.content });
    } catch (error) { res.status(500).json({ message: "Error" }); }
};

// Evaluate Writing
exports.evaluateWriting = async (req, res) => {
    try {
        const { topic, essay } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: `Eval essay on ${topic}. Return JSON.` }],
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));
    } catch (error) { res.status(500).json({ message: "Error" }); }
};

// Generate Speaking Topic
exports.generateSpeakingTopic = async (req, res) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: 'Generate 1 tech speaking topic.' }]
            })
        });
        const data = await response.json();
        res.json({ topic: data.choices[0].message.content });
    } catch (error) { res.status(500).json({ message: "Error" }); }
};

// Evaluate Speaking
exports.evaluateSpeech = async (req, res) => {
    try {
        const { topic, transcript } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: `Eval speech on ${topic}. Return JSON.` }],
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));
    } catch (error) { res.status(500).json({ message: "Error" }); }
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
                model: 'llama-3.3-70b-versatile',
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
