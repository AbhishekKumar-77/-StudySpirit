const User = require('../models/User');
const InterviewSession = require('../models/InterviewSession');
const pdfParse = require('pdf-parse');

// AI Interview - Mock Interviewer with Scoring & History
exports.interviewWithAI = async (req, res) => {
    console.log("🎤 AI Interview Request Received");

    try {
        let { message, mode, context, resumeText, sessionId, totalQuestions, questionNumber, role, company } = req.body;
        const user = req.user ? await User.findById(req.user.id) : null;
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

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
        if (user) {
            if (sessionId) {
                session = await InterviewSession.findById(sessionId);
            }
            if (!session && (!context || context.length === 0)) {
                session = await InterviewSession.create({
                    userId: user._id,
                    mode: mode || 'technical',
                    targetRole: role || 'Software Engineer',
                    targetCompany: company || 'General Tech',
                    totalQuestions: qTotal,
                    resumeText: resumeText ? resumeText.substring(0, 5000) : '',
                    status: 'in-progress'
                });
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

        if (qNum === 1) {
            // FIRST MESSAGE: Always introduce as Aria, Personal HR Interviewer, and ask "Tell me about yourself"
            systemPrompt = `You are "Aria", a Personal HR Interviewer. 
            
            CANDIDATE'S RESUME (if any):
            ${resumeText ? resumeText.substring(0, 4000) : "No resume provided."}
            
            YOUR TASK FOR THIS FIRST MESSAGE:
            Introduce yourself: "Hi, I am Aria, your personal HR interviewer."
            Then, ask exactly ONE question: "Tell me about yourself." (or variation of tell me about yourself/background).
            If they uploaded a resume, you can briefly acknowledge it, but keep the question to "tell me about yourself".
            
            ${commonRules}
            
            ${jsonFormat}
            Set score to 0.`;
        } else {
            // SUBSEQUENT MESSAGES: ONE question only
            systemPrompt = `You are "Aria", a Personal ${mode === 'technical' ? 'Technical' : 'HR'} Interviewer.
            
            CANDIDATE'S RESUME: ${resumeText ? resumeText.substring(0, 3000) : "No resume provided."}
            
            CURRENT QUESTION NUMBER: ${qNum}
            MODE: ${mode}
            
            ${commonRules}
            
            YOUR TASK:
            1. React to their previous answer in 1-3 sentences (good? bad? correct them if needed)
            2. Then ask exactly ONE follow-up question.
${mode === 'technical'
                    ? '               - IMPORTANT: Scrutinize the resume for specific programming languages, frameworks (e.g., React, Node.js), and tools. Ask deeply technical, challenging questions about how those specific technologies work under the hood, or how they applied them. (e.g. "I see you used React, how does the Virtual DOM work?" or "Explain the time complexity of the algorithm you wrote for XYZ project").'
                    : '               - IMPORTANT: Start by asking deep questions about specific PROJECTS and details mentioned in their resume.'}
               - After covering the resume, or if no resume was provided, ask other real-world interview questions relevant to the ${mode} mode.
            
            KEEP IT SHORT. React briefly, then ONE question.
            
            ${jsonFormat}`;
        }

        if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.status(500).json({ response: "AI service not configured. Set GROQ_API_KEY." });
        }

        const messages = [{ role: 'system', content: systemPrompt }];

        if (context && Array.isArray(context)) {
            messages.push(...context.slice(-12));
        }

        if (message) {
            messages.push({ role: 'user', content: message });
        }

        if (isNewResumeSession && !message) {
            messages.push({ role: 'user', content: "Hi Aria! Let's start the interview." });
        } else if (messages.length === 1 && !message) {
            messages.push({ role: 'user', content: "Hey Aria! I'm ready for the interview. Let's do this!" });
        }

        const groqResponse = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 2000,
                    response_format: { type: "json_object" }
                })
            }
        );

        const data = await groqResponse.json();
        let aiResponse = "";
        let parsedResponse = null;

        if (data.choices && data.choices[0]?.message?.content) {
            const raw = data.choices[0].message.content;
            try {
                parsedResponse = JSON.parse(raw.replace(/```json/g, '').replace(/```/g, '').trim());
            } catch (e) {
                // Fallback if not valid JSON
                parsedResponse = {
                    question: raw,
                    feedback: "",
                    idealAnswer: "",
                    score: 0,
                    spokenText: raw
                };
            }
            aiResponse = parsedResponse.spokenText || parsedResponse.question || raw;
        } else {
            console.error('❌ Groq Error:', JSON.stringify(data));
            aiResponse = "I encountered an error. Let's continue.";
            parsedResponse = { question: aiResponse, feedback: "", idealAnswer: "", score: 0, spokenText: aiResponse };
        }

        // Save exchange to session
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
            response: aiResponse,
            parsedResponse,
            sessionId: session?._id,
            resumeTextParsed: isNewResumeSession ? resumeText : undefined,
            questionNumber: qNum,
            totalQuestions: qTotal
        });

    } catch (error) {
        console.error('❌ Interview Error:', error);
        res.status(500).json({ message: "Error processing interview: " + error.message });
    }
};

// End Interview & Generate Final Report
exports.endInterview = async (req, res) => {
    try {
        const { sessionId, lastAnswer, lastQuestion, lastQuestionNumber } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        const session = await InterviewSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Save last exchange if provided
        if (lastAnswer && lastQuestionNumber) {
            session.exchanges.push({
                questionNumber: lastQuestionNumber,
                question: lastQuestion || '',
                answer: lastAnswer,
                score: 0,
                feedback: ''
            });
        }

        // Calculate scores from exchanges
        const scores = session.exchanges.filter(e => e.score > 0).map(e => e.score);
        const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;

        // Generate final report using AI
        const exchangeSummary = session.exchanges.map(e =>
            `Q${e.questionNumber}: ${e.question}\nAnswer: ${e.answer}\nScore: ${e.score}/10\nFeedback: ${e.feedback}`
        ).join('\n\n');

        let finalReport = { strengths: [], improvements: [], overallFeedback: '', overallScore: avgScore };

        if (GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here' && session.exchanges.length > 0) {
            try {
                const reportPrompt = `Analyze this interview performance and generate a detailed feedback report.

INTERVIEW EXCHANGES:
${exchangeSummary}

MODE: ${session.mode}
QUESTIONS ASKED: ${session.exchanges.length}

Return ONLY valid JSON:
{
    "overallScore": <number 1-10>,
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "improvements": ["improvement 1", "improvement 2", "improvement 3"],
    "overallFeedback": "2-3 sentence overall assessment"
}`;

                const groqResponse = await fetch(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${GROQ_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: 'llama-3.3-70b-versatile',
                            messages: [
                                { role: 'system', content: 'You are an interview performance evaluator. Return ONLY valid JSON.' },
                                { role: 'user', content: reportPrompt }
                            ],
                            temperature: 0.5,
                            max_tokens: 1000,
                            response_format: { type: "json_object" }
                        })
                    }
                );

                const reportData = await groqResponse.json();
                if (reportData.choices && reportData.choices[0]?.message?.content) {
                    finalReport = JSON.parse(reportData.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim());
                }
            } catch (e) {
                console.error('Report generation error:', e);
            }
        }

        // Update session
        session.status = 'completed';
        session.overallScore = finalReport.overallScore || avgScore;
        session.strengths = finalReport.strengths || [];
        session.improvements = finalReport.improvements || [];
        session.finalFeedback = finalReport.overallFeedback || '';
        session.completedAt = new Date();
        session.duration = Math.floor((new Date() - session.startedAt) / 1000);
        await session.save();

        res.json({
            success: true,
            report: {
                overallScore: session.overallScore,
                strengths: session.strengths,
                improvements: session.improvements,
                finalFeedback: session.finalFeedback,
                totalQuestions: session.exchanges.length,
                duration: session.duration,
                exchanges: session.exchanges,
                mode: session.mode
            }
        });

    } catch (error) {
        console.error('End Interview Error:', error);
        res.status(500).json({ message: "Error generating report: " + error.message });
    }
};

// Get Interview History
exports.getInterviewHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await InterviewSession.find({ userId })
            .sort({ startedAt: -1 })
            .limit(20)
            .select('-resumeText -exchanges.answer');

        res.json({ success: true, sessions });
    } catch (error) {
        console.error('Interview History Error:', error);
        res.status(500).json({ message: "Error fetching history" });
    }
};

// Get Single Interview Session Detail
exports.getInterviewSession = async (req, res) => {
    try {
        const session = await InterviewSession.findById(req.params.sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        res.json({ success: true, session });
    } catch (error) {
        console.error('Get Session Error:', error);
        res.status(500).json({ message: "Error fetching session" });
    }
};

// Update study time (Heartbeat)
exports.logHeartbeat = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const today = new Date().toISOString().split('T')[0];

        // Ensure stats exist
        if (!user.stats) {
            user.stats = { totalStudyTime: 0, xp: 0, level: 1 };
        }

        // Update total study time (add 60 seconds)
        user.stats.totalStudyTime = (user.stats.totalStudyTime || 0) + 60;

        // Update today's activity log
        let todayLog = user.activityLog.find(log => log.date === today);
        if (!todayLog) {
            todayLog = {
                date: today,
                problemsSolved: 0,
                studyTime: 0,
                xpEarned: 0,
                focusSessions: 0
            };
            user.activityLog.push(todayLog);
        }

        todayLog.studyTime += 60;

        // Award XP for study time (e.g., 5 XP per minute)
        const xpGain = 5;
        user.stats.xp += xpGain;
        todayLog.xpEarned += xpGain;

        // Level Up Logic (Simple: Level = 1 + floor(XP / 1000))
        const newLevel = 1 + Math.floor(user.stats.xp / 1000);
        if (newLevel > user.stats.level) {
            user.stats.level = newLevel;
            // Could add a notification here or return a flag
        }

        await user.save();

        res.json({
            success: true,
            totalStudyTime: user.stats.totalStudyTime,
            todayStudyTime: todayLog.studyTime,
            xp: user.stats.xp,
            level: user.stats.level
        });

    } catch (error) {
        console.error("Heartbeat Error:", error);
        res.status(500).json({ message: "Error updating study time" });
    }
};

// Soft Skills AI Conversation - Real-time correction
exports.softSkillsAI = async (req, res) => {
    try {
        const { message, previousMessages = [] } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: "Message is required" });
        }

        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.json({ response: "AI configuration missing. Please check API key." });
        }

        // Limit history to last 6 messages
        const context = previousMessages.map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.text
        }));

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are a wise, supportive English soft skills mentor. 
                        
                        YOUR GOAL: 
                        1. Correct the user's grammar/speech ONLY if there is a mistake.
                        2. Answer their question or continue the conversation naturally.

                        OUTPUT FORMAT:
                        You MUST respond in valid JSON format ONLY:
                        {
                            "correction": "The correction string starting with 'Not like this...' OR null if speech was perfect",
                            "reply": "Your conversational response to the user's content (answer their question thoroughly)"
                        }

                        EXAMPLES:
                        User: "I go store yesterday."
                        AI: { "correction": "Not like this, correct is: 'I went to the store yesterday.' (Past tense)", "reply": "Did you buy anything interesting?" }

                        User: "What is the difference between affect and effect?"
                        AI: { "correction": null, "reply": "'Affect' is usually a verb (to influence), while 'Effect' is usually a noun (the result). For example: The rain affected the game. The effect was a delay." }`
                    },
                    ...context,
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 300,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        let aiResponse = { correction: null, reply: "I'm having trouble understanding. Please try again." };

        if (data.choices && data.choices[0]?.message?.content) {
            try {
                aiResponse = JSON.parse(data.choices[0].message.content);
            } catch (e) {
                // Fallback if AI didn't return strict JSON
                aiResponse = { correction: null, reply: data.choices[0].message.content };
            }
        }

        res.json(aiResponse);

    } catch (error) {
        console.error('Soft Skills AI Error:', error);
        res.status(500).json({ message: "Error processing conversation" });
    }
};

// Generate Vocabulary List (50 Words)
exports.generateVocabulary = async (req, res) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.json({ words: [] });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert linguist. Generate exactly 50 distinct, advanced, and useful English vocabulary words for professional and academic improvement.
                        
                        OUTPUT FORMAT:
                        Strictly return a valid JSON Array of objects. No markdown formatting, no intro/outro text.
                        Example:
                        [
                            {
                                "word": "Obfuscate",
                                "meaning": "To render obscure, unclear, or unintelligible.",
                                "usage": "The politician tried to obfuscate the truth with misleading statistics.",
                                "context": "Professional/Academic"
                            }
                        ]`
                    },
                    { role: 'user', content: "Generate 50 words now." }
                ],
                temperature: 0.8,
                max_tokens: 3000,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        let words = [];

        if (data.choices && data.choices[0]?.message?.content) {
            try {
                // The model might return object with a key like "words": [...] because we requested json_object
                const parsed = JSON.parse(data.choices[0].message.content);
                if (Array.isArray(parsed)) {
                    words = parsed;
                } else if (parsed.words && Array.isArray(parsed.words)) {
                    words = parsed.words;
                } else if (parsed.vocabulary && Array.isArray(parsed.vocabulary)) {
                    words = parsed.vocabulary;
                } else {
                    // unexpected format, try to find array in values
                    const values = Object.values(parsed);
                    const foundArray = values.find(v => Array.isArray(v));
                    if (foundArray) words = foundArray;
                }
            } catch (e) {
                console.error("JSON Parse Error for Vocabulary:", e);
            }
        }

        res.json({ words });

    } catch (error) {
        console.error('Vocabulary Generation Error:', error);
        res.status(500).json({ message: "Error generating vocabulary" });
    }
};

// Generate Writing Topic
exports.generateWritingTopic = async (req, res) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) return res.status(500).json({ message: "API Key missing" });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: "Generate 1 thought-provoking writing prompt related to Soft Skills, Leadership, or Workplace Ethics. Return ONLY the prompt text, no quotes or labels."
                    },
                    { role: 'user', content: "Give me a writing topic." }
                ],
                temperature: 0.9,
                max_tokens: 100
            })
        });

        const data = await response.json();
        const topic = data.choices?.[0]?.message?.content || "Explain the importance of active listening in conflict resolution.";
        res.json({ topic });

    } catch (error) {
        console.error('Writing Topic Error:', error);
        res.status(500).json({ message: "Error generating topic" });
    }
};

// Evaluate Writing
exports.evaluateWriting = async (req, res) => {
    try {
        const { topic, essay } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!essay || essay.trim().length < 10) {
            return res.status(400).json({ message: "Essay is too short." });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `Evaluate the user's essay on the topic: "${topic}".
                        
                        OUTPUT JSON FORMAT:
                        {
                            "score": number (0-100),
                            "feedback": "Concise summary of strengths and weaknesses (2-3 sentences).",
                            "improvements": ["Specific bullet point 1", "Specific bullet point 2", "Specific bullet point 3"]
                        }
                        
                        Strictly return valid JSON.`
                    },
                    { role: 'user', content: essay }
                ],
                temperature: 0.5,
                max_tokens: 500,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        let evaluation = { score: 0, feedback: "Error parsing evaluation", improvements: [] };

        if (data.choices && data.choices[0]?.message?.content) {
            try {
                evaluation = JSON.parse(data.choices[0].message.content);
            } catch (e) {
                console.error("JSON Parse Error for Writing Eval:", e);
                evaluation.feedback = data.choices[0].message.content;
            }
        }

        res.json(evaluation);

    } catch (error) {
        console.error('Writing Evaluation Error:', error);
        res.status(500).json({ message: "Error evaluating writing" });
    }
};

// Generate Speaking Topic (Engineering/Pressure Context)
exports.generateSpeakingTopic = async (req, res) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) return res.status(500).json({ message: "API Key missing" });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: "Generate 1 engaging impromptu speech topic specifically for an Engineering Student or Tech Professional. Themes: Handling High-Pressure Situations, The Future of AI, Engineering Ethics, or Leadership in Tech. Return ONLY the topic string, no quotes."
                    },
                    { role: 'user', content: "Give me a speech topic." }
                ],
                temperature: 0.9,
                max_tokens: 60
            })
        });

        const data = await response.json();
        const topic = data.choices?.[0]?.message?.content || "How AI will change the role of software engineers in the next 5 years.";
        res.json({ topic });

    } catch (error) {
        console.error('Speaking Topic Error:', error);
        res.status(500).json({ message: "Error generating topic" });
    }
};

// Evaluate Speaking
exports.evaluateSpeech = async (req, res) => {
    try {
        const { topic, transcript } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!transcript || transcript.trim().length < 10) {
            return res.status(400).json({ message: "Speech is too short to evaluate." });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `Evaluate the user's speech transcript on the topic: "${topic}".
                        Assess their Communication Skills, content relevance, and flow.
                        
                        OUTPUT JSON FORMAT:
                        {
                            "score": number (0-100),
                            "feedback": "Constructive feedback on their delivery and content (2-3 sentences).",
                            "improvements": ["Specific improvement 1", "Specific improvement 2", "Specific improvement 3"]
                        }
                        
                        Strictly return valid JSON.`
                    },
                    { role: 'user', content: transcript }
                ],
                temperature: 0.6,
                max_tokens: 500,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        let evaluation = { score: 0, feedback: "Error parsing evaluation", improvements: [] };

        if (data.choices && data.choices[0]?.message?.content) {
            try {
                evaluation = JSON.parse(data.choices[0].message.content);
            } catch (e) {
                console.error("JSON Parse Error for Speech Eval:", e);
                evaluation.feedback = data.choices[0].message.content;
            }
        }

        res.json(evaluation);

    } catch (error) {
        console.error('Speech Evaluation Error:', error);
        res.status(500).json({ message: "Error evaluating speech" });
    }
};

// AI Resume Generator
// ATS Resume Checker
exports.checkATSScore = async (req, res) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) return res.status(500).json({ message: "API Key missing" });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: "Generate 1 thought-provoking writing prompt related to Soft Skills, Leadership, or Workplace Ethics. Return ONLY the prompt text, no quotes or labels."
                    },
                    { role: 'user', content: "Give me a writing topic." }
                ],
                temperature: 0.9,
                max_tokens: 100
            })
        });

        const data = await response.json();
        const topic = data.choices?.[0]?.message?.content || "Explain the importance of active listening in conflict resolution.";
        res.json({ topic });

    } catch (error) {
        console.error('Writing Topic Error:', error);
        res.status(500).json({ message: "Error generating topic" });
    }
};

// Evaluate Writing
exports.evaluateWriting = async (req, res) => {
    try {
        const { topic, essay } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!essay || essay.trim().length < 10) {
            return res.status(400).json({ message: "Essay is too short." });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `Evaluate the user's essay on the topic: "${topic}".
                        
                        OUTPUT JSON FORMAT:
                        {
                            "score": number (0-100),
                            "feedback": "Concise summary of strengths and weaknesses (2-3 sentences).",
                            "improvements": ["Specific bullet point 1", "Specific bullet point 2", "Specific bullet point 3"]
                        }
                        
                        Strictly return valid JSON.`
                    },
                    { role: 'user', content: essay }
                ],
                temperature: 0.5,
                max_tokens: 500,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        let evaluation = { score: 0, feedback: "Error parsing evaluation", improvements: [] };

        if (data.choices && data.choices[0]?.message?.content) {
            try {
                evaluation = JSON.parse(data.choices[0].message.content);
            } catch (e) {
                console.error("JSON Parse Error for Writing Eval:", e);
                evaluation.feedback = data.choices[0].message.content;
            }
        }

        res.json(evaluation);

    } catch (error) {
        console.error('Writing Evaluation Error:', error);
        res.status(500).json({ message: "Error evaluating writing" });
    }
};

// Generate Speaking Topic (Engineering/Pressure Context)
exports.generateSpeakingTopic = async (req, res) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) return res.status(500).json({ message: "API Key missing" });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: "Generate 1 engaging impromptu speech topic specifically for an Engineering Student or Tech Professional. Themes: Handling High-Pressure Situations, The Future of AI, Engineering Ethics, or Leadership in Tech. Return ONLY the topic string, no quotes."
                    },
                    { role: 'user', content: "Give me a speech topic." }
                ],
                temperature: 0.9,
                max_tokens: 60
            })
        });

        const data = await response.json();
        const topic = data.choices?.[0]?.message?.content || "How AI will change the role of software engineers in the next 5 years.";
        res.json({ topic });

    } catch (error) {
        console.error('Speaking Topic Error:', error);
        res.status(500).json({ message: "Error generating topic" });
    }
};

// Evaluate Speaking
exports.evaluateSpeech = async (req, res) => {
    try {
        const { topic, transcript } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!transcript || transcript.trim().length < 10) {
            return res.status(400).json({ message: "Speech is too short to evaluate." });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `Evaluate the user's speech transcript on the topic: "${topic}".
                        Assess their Communication Skills, content relevance, and flow.
                        
                        OUTPUT JSON FORMAT:
                        {
                            "score": number (0-100),
                            "feedback": "Constructive feedback on their delivery and content (2-3 sentences).",
                            "improvements": ["Specific improvement 1", "Specific improvement 2", "Specific improvement 3"]
                        }
                        
                        Strictly return valid JSON.`
                    },
                    { role: 'user', content: transcript }
                ],
                temperature: 0.6,
                max_tokens: 500,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        let evaluation = { score: 0, feedback: "Error parsing evaluation", improvements: [] };

        if (data.choices && data.choices[0]?.message?.content) {
            try {
                evaluation = JSON.parse(data.choices[0].message.content);
            } catch (e) {
                console.error("JSON Parse Error for Speech Eval:", e);
                evaluation.feedback = data.choices[0].message.content;
            }
        }

        res.json(evaluation);

    } catch (error) {
        console.error('Speech Evaluation Error:', error);
        res.status(500).json({ message: "Error evaluating speech" });
    }
};

// AI Resume Generator
// ATS Resume Checker
exports.checkATSScore = async (req, res) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        const { jobDescription } = req.body;

        if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.status(500).json({ message: "Groq API Key missing" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No resume PDF provided." });
        }

        let resumeText = "";
        try {
            const data = await pdfParse(req.file.buffer);
            resumeText = data.text.replace(/\s+/g, ' ').trim();
        } catch (err) {
            console.error('PDF Parse Error:', err);
            return res.status(400).json({ message: "Failed to read the resume PDF." });
        }

        const prompt = `
        You are an elite Applicant Tracking System (ATS) Expert and Technical Recruiter.
        Analyze the following resume text. If a Job Description is provided, evaluate the resume specifically against it.
        
        **Resume Text:**
        ${resumeText.substring(0, 6000)}
        
        **Target Job Description (Optional):**
        ${jobDescription ? jobDescription.substring(0, 4000) : "No Job Description provided. Perform a general industry-standard ATS evaluation."}
        
        **Instructions:**
        1. Evaluate the resume with strict ATS logic. Be highly critical.
        2. Assign an "overallScore" (0-100).
        3. If there is a Job Description, compute a "matchRate" (0-100%). If not, estimate matchRate vs general tech roles.
        4. Provide sub-scores out of 100 for: "formatting", "impactMetrics", "readability", and "keywordDensity".
        5. Provide a succinct "summary" of your findings.
        6. Extract arrays of:
           - "strengths" (what they did well)
           - "weaknesses" (what is missing or bad)
           - "improvements" (actionable steps)
           - "missingKeywords" (crucial skills/tech missing compared to JD or standard roles)
           - "strongVerbsFound" (good action verbs used)
        7. Ensure return is STRICTLY a JSON object matching this schema EXACTLY:
        
        {
          "overallScore": 0,
          "matchRate": 0,
          "subScores": { "formatting": 0, "impactMetrics": 0, "readability": 0, "keywordDensity": 0 },
          "summary": "...",
          "strengths": ["..."],
          "weaknesses": ["..."],
          "improvements": ["..."],
          "missingKeywords": ["..."],
          "strongVerbsFound": ["..."]
        }
        `;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 2000,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        let atsResult;
        try {
            atsResult = JSON.parse(data.choices[0].message.content);
        } catch (e) {
            console.error("Failed to parse ATS JSON:", data.choices[0]?.message);
            return res.status(500).json({ message: "Failed to evaluate ATS score." });
        }

        res.json({ result: atsResult });

    } catch (error) {
        console.error("ATS Checker Error:", error);
        res.status(500).json({ message: "Error evaluating resume" });
    }
};
