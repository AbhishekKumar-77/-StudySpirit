/**
 * AIProviderService — Resilient AI provider wrapper with failover and circuit breaker.
 * 
 * Attempts to use the primary provider (Groq Llama-3.3) for generating interview
 * questions, feedback, and scoring. If the primary provider fails, rate limits out,
 * or is misconfigured, it automatically fails over to the QuestionBankService.
 */

const questionBankService = require('./questionBankService');

// Circuit Breaker state
let groqFailuresCount = 0;
let groqDisabledUntil = null;
const FAILURE_THRESHOLD = 3;
const DISABLE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

class AIProviderService {
    constructor() {
        this.primaryApiKey = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;
    }

    /**
     * Check if Groq provider is currently enabled (circuit breaker and config check).
     */
    isGroqEnabled() {
        if (!this.primaryApiKey || this.primaryApiKey === 'your_groq_api_key_here') {
            return false;
        }
        if (groqDisabledUntil && Date.now() < groqDisabledUntil) {
            console.warn(`[AIProviderService] Groq temporarily disabled due to circuit breaker until ${new Date(groqDisabledUntil).toISOString()}`);
            return false;
        }
        return true;
    }

    /**
     * Report a success or failure to the circuit breaker.
     */
    reportStatus(success) {
        if (success) {
            groqFailuresCount = 0;
            groqDisabledUntil = null;
        } else {
            groqFailuresCount++;
            console.warn(`[AIProviderService] Groq failure count: ${groqFailuresCount}/${FAILURE_THRESHOLD}`);
            if (groqFailuresCount >= FAILURE_THRESHOLD) {
                groqDisabledUntil = Date.now() + DISABLE_DURATION_MS;
                console.error(`[AIProviderService] Circuit breaker tripped! Disabling Groq for ${DISABLE_DURATION_MS / 1000}s`);
            }
        }
    }

    /**
     * Start/Continue an interview session.
     */
    async generateInterviewResponse(options) {
        const {
            message,
            mode,
            context,
            resumeText,
            totalQuestions,
            questionNumber,
            role,
            company,
            customQuestionsList = []
        } = options;

        if (this.isGroqEnabled()) {
            try {
                console.log("[AIProviderService] Attempting to fetch response from Groq...");
                const response = await this._callGroq(options, customQuestionsList);
                this.reportStatus(true);
                return response;
            } catch (error) {
                console.error("[AIProviderService] Groq API call failed:", error.message);
                this.reportStatus(false);
                // Fall through to question bank fallback
            }
        }

        console.log("[AIProviderService] Using QuestionBank fallback engine...");
        
        // Extract already asked questions from the context
        const askedQuestions = [];
        if (context && Array.isArray(context)) {
            context.forEach(m => {
                if (m.role === 'assistant') {
                    askedQuestions.push(m.content);
                }
            });
        }

        // Determine previous question/answer for scoring
        let previousQuestion = "";
        let previousAnswer = "";
        if (context && context.length >= 2) {
            previousQuestion = context[context.length - 2]?.content || "";
            previousAnswer = context[context.length - 1]?.content || "";
        }

        if (questionNumber === 1 && !message) {
            return questionBankService.getIntroduction(mode, role, company);
        }

        return questionBankService.getQuestion({
            mode,
            role,
            questionNumber,
            totalQuestions,
            askedQuestions,
            previousAnswer: message || previousAnswer,
            previousQuestion
        });
    }

    /**
     * End interview and generate final report.
     */
    async generateFinalReport(session, exchanges, avgScore) {
        if (this.isGroqEnabled()) {
            try {
                console.log("[AIProviderService] Attempting to generate report using Groq...");
                const report = await this._callGroqReport(session, exchanges, avgScore);
                this.reportStatus(true);
                return report;
            } catch (error) {
                console.error("[AIProviderService] Groq API report generation failed:", error.message);
                this.reportStatus(false);
                // Fall through to fallback
            }
        }

        console.log("[AIProviderService] Using static fallback report generator...");
        return questionBankService.generateReport(exchanges, session.mode);
    }

    // ─── Private AI Call Implementations ────────────────────────────────

    async _callGroq(options, customQuestionsList) {
        const { message, mode, context, resumeText, totalQuestions, questionNumber, role, company } = options;
        const qNum = parseInt(questionNumber) || 1;
        const qTotal = parseInt(totalQuestions) || 5;

        let systemPrompt = "You are a professional technical interviewer.";

        const commonRules = `
            CRITICAL CONVERSATIONAL RULES:
            1. **BE NATURAL & HUMAN**: You are "Aria", a personal HR interviewer — warm, friendly, but professional. Talk like two people having a real conversation.
            2. **REACT TO ANSWERS**: Always acknowledge what they said before moving on. If they gave a great answer, be genuinely impressed. If it was weak, gently correct them.
            3. **IMMEDIATE CORRECTION**: If the user's answer is wrong or weak, correct them naturally — like a mentor.
            4. **⚠️ STRICTLY ONE QUESTION ONLY ⚠️**: This is the MOST IMPORTANT rule. You MUST ask exactly ONE question per response. NEVER two, NEVER three. Your entire "spokenText" should contain only ONE question mark at the very end. Do NOT ask follow-ups. ONLY ONE question.
            5. **SPOKEN FORMAT**: Write "spokenText" as you would SAY it out loud. Use contractions, natural flow.
            6. **SHORT & FOCUSED**: Keep responses concise — 2-4 sentences of reaction/feedback, then ONE question.
            7. **ROLE AND COMPANY**: You are interviewing the candidate for the role of "${role || 'Software Engineer'}" at ${company === 'Startup' ? 'a High-Growth Startup' : company === 'General Tech' ? 'a tech company' : company || 'General Tech'}. Frame questions contextually based on this role and company.${customQuestionsList.length > 0 ? `
            
            ⚠️ TEACHER'S MANDATORY QUESTIONS:
            The teacher has explicitly requested you to ask the following questions during this interview:
            ${customQuestionsList.map((q, i) => `${i + 1}. ${q}`).join('\n')}
            You must prioritize asking these specific questions early in the conversation.` : ''}
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
            YOUR TASK: Introduce yourself and ask "Tell me about yourself."
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

        const messages = [{ role: 'system', content: systemPrompt }];
        if (context && Array.isArray(context)) {
            // Keep dynamic context to a manageable depth
            messages.push(...context.slice(-10));
        }
        if (message) {
            messages.push({ role: 'user', content: message });
        }
        if ((qNum === 1) && !message) {
            messages.push({ role: 'user', content: "Hi Aria! Let's start." });
        }

        const candidateModels = [
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'openai/gpt-oss-20b'
        ];

        let lastError = null;

        for (const modelName of candidateModels) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 12000);

                const fetchResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.primaryApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: modelName,
                        messages: messages,
                        temperature: 0.7,
                        max_tokens: 2000,
                        response_format: { type: "json_object" }
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!fetchResponse.ok) {
                    throw new Error(`HTTP ${fetchResponse.status} from Groq API (${modelName})`);
                }

                const data = await fetchResponse.json();
                if (data.choices && data.choices[0]?.message?.content) {
                    const rawContent = data.choices[0].message.content.trim();
                    const cleanedContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(cleanedContent);
                    return {
                        response: parsed.spokenText || parsed.question,
                        parsedResponse: parsed,
                        source: `groq-${modelName}`
                    };
                }
            } catch (err) {
                console.warn(`[AIProviderService] Attempt with model ${modelName} failed:`, err.message);
                lastError = err;
            }
        }

        throw lastError || new Error("All Groq candidate models failed");
    }

    async _callGroqReport(session, exchanges, avgScore) {
        const exchangeSummary = exchanges.map(e => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');

        const reportPrompt = `You are a Senior Executive Talent Evaluator. 
        Analyze the following ${session.mode} interview session and generate a PREMIUM 7-dimension report with an actionable StudySpirit Improvement Plan.
        
        MODE: ${session.mode}
        USER ROLE: ${session.targetRole}
        COMPANY: ${session.targetCompany}
        
        INTERVIEW EXCHANGES:
        ${exchangeSummary}
        
        Return ONLY valid JSON with this exact structure:
        {
            "overallScore": <number 0-100>,
            "dimensionScores": {
                "answerQuality": <0-100>,
                "technicalDepth": <0-100>,
                "problemSolving": <0-100>,
                "communication": <0-100>,
                "confidence": <0-100>,
                "structure": <0-100>,
                "pacing": <0-100>
            },
            "starEvaluation": {
                "situation": <0-100>,
                "task": <0-100>,
                "action": <0-100>,
                "result": <0-100>,
                "missingElements": ["Result missing in Q2", "Action needs more metrics"]
            },
            "strengths": ["Explained project clearly", "Strong technical reasoning", "Good confidence"],
            "improvements": ["Answers were too long", "Weak STAR structure", "Frequent filler words"],
            "overallFeedback": "Professional assessment (3-4 sentences)",
            "gdMetrics": {
                "logic": <0-100>,
                "communication": <0-100>,
                "teamwork": <0-100>,
                "confidence": <0-100>,
                "listening": <0-100>,
                "relevance": <0-100>,
                "leadership": <0-100>
            },
            "improvementPlan": [
                {
                    "title": "System Design",
                    "priority": "High Priority",
                    "category": "Architecture",
                    "actionUrl": "/resources",
                    "actionText": "Practice",
                    "completed": false
                },
                {
                    "title": "STAR Responses",
                    "priority": "Medium Priority",
                    "category": "Behavioral",
                    "actionUrl": "/soft-skills",
                    "actionText": "Practice",
                    "completed": false
                },
                {
                    "title": "Filler Words",
                    "priority": "Medium Priority",
                    "category": "Communication",
                    "actionUrl": "/soft-skills",
                    "actionText": "Speaking Drill",
                    "completed": false
                },
                {
                    "title": "Graph Algorithms",
                    "priority": "High Priority",
                    "category": "Coding",
                    "actionUrl": "/codespirit",
                    "actionText": "Practice in CodeSpirit",
                    "completed": false
                }
            ]
        }`;

        const candidateModels = [
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'openai/gpt-oss-20b'
        ];

        let lastError = null;

        for (const modelName of candidateModels) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                const fetchResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.primaryApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: modelName,
                        messages: [
                            { role: 'system', content: 'You are an interview performance evaluator. Return ONLY valid JSON.' },
                            { role: 'user', content: reportPrompt }
                        ],
                        response_format: { type: "json_object" }
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!fetchResponse.ok) {
                    throw new Error(`HTTP ${fetchResponse.status} from Groq API for report (${modelName})`);
                }

                const data = await fetchResponse.json();
                if (data.choices && data.choices[0]?.message?.content) {
                    const rawContent = data.choices[0].message.content.trim();
                    const cleanedContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(cleanedContent);
                    return {
                        ...parsed,
                        source: `groq-${modelName}`
                    };
                }
            } catch (err) {
                console.warn(`[AIProviderService] Report generation attempt with model ${modelName} failed:`, err.message);
                lastError = err;
            }
        }

        throw lastError || new Error("All Groq candidate models failed for report generation");
    }

}

module.exports = new AIProviderService();
