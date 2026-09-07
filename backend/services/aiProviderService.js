/**
 * AIProviderService — Resilient AI provider wrapper with failover and circuit breaker.
 * 
 * Attempts to use the primary provider (Groq Llama-3.3) for generating interview
 * questions, feedback, and scoring. If the primary provider fails, rate limits out,
 * or is misconfigured, it automatically fails over to the QuestionBankService.
 */

const questionBankService = require('./questionBankService');
const fetch = typeof globalThis.fetch === 'function' ? globalThis.fetch : require('node-fetch');

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
            There are two other AI participants: Alex (Analytical, critical) and Sarah (Creative, visionary).
            The User is the candidate participant.
            
            GD TOPIC: "${role && role !== 'Software Engineer' ? role : 'The Impact of Generative AI & Automation on Future Software Engineering Careers'}"
            CURRENT TURN: ${qNum} / ${qTotal}
            
            GD RULES:
            1. Simulate a realistic, energetic group discussion.
            2. Break down output into realistic lines spoken by Alex, Sarah, or Aria.
            3. On turn 1, Aria introduces the topic with an opening provocation. On later turns, Alex or Sarah debate or build upon the candidate's points.
            4. Conclude each turn with one direct question or prompt to the candidate to challenge their logic.
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
        } else if (mode === 'behavioral' || mode === 'hr') {
            if (qNum === 1) {
                systemPrompt = `You are "Aria", a Senior HR & Talent Acquisition Leader at ${company || 'Top Tech Company'}.
                Target Role: "${role || 'Software Engineer'}".
                CANDIDATE'S RESUME: ${resumeText ? resumeText.substring(0, 3000) : "No resume provided."}
                
                YOUR TASK (Question 1 - HR Round):
                Warmly introduce yourself as Aria, welcome the candidate to their ${role} HR & Behavioral interview at ${company}, and ask them to briefly introduce their background, key passions, and what motivates them to apply for this role.
                ${commonRules}
                ${jsonFormat}
                Set score to 0.`;
            } else {
                systemPrompt = `You are "Aria", Senior HR Interviewer at ${company || 'Top Tech Company'} evaluating a candidate for "${role || 'Software Engineer'}".
                CURRENT QUESTION: ${qNum} of ${qTotal}.
                MODE: HR & Behavioral (STAR Method).
                
                HR QUESTION PROGRESSION MATRIX:
                - Q2: Conflict resolution / Handling disagreement with a manager, teammate, or stakeholder.
                - Q3: Dealing with failure, missed deadlines, or high pressure situations.
                - Q4: Team leadership, ownership, and taking initiative beyond assigned scope.
                - Q5: Career goals, strengths, one critical weakness they are actively overcoming, and why ${company}.
                
                YOUR TASK:
                1. React naturally to the candidate's last answer (grade it from 1-10 on structure, self-awareness, and clarity).
                2. If the answer lacked concrete examples (Situation, Task, Action, Result), gently coach them on how to strengthen it.
                3. Ask the next HR/Behavioral question according to the progression matrix.
                ${commonRules}
                ${jsonFormat}`;
            }
        } else if (mode === 'technical' || mode === 'full-mock') {
            if (qNum === 1) {
                systemPrompt = `You are "Aria", a Principal Software Architect & Technical Interviewer at ${company || 'Top Tech Company'} conducting a Technical Interview for the "${role || 'Backend Developer'}" role.
                CANDIDATE'S RESUME: ${resumeText ? resumeText.substring(0, 3000) : "No resume provided."}
                
                YOUR TASK (Question 1 - Technical Round):
                Introduce yourself as Aria, welcome the candidate to their ${role} technical interview at ${company}, and ask them to briefly introduce themselves with a focus on the core technologies, programming languages, and systems they specialize in.
                ${commonRules}
                ${jsonFormat}
                Set score to 0.`;
            } else if (qNum === 2) {
                systemPrompt = `You are "Aria", Principal Technical Interviewer at ${company} for the "${role || 'Backend Developer'}" role.
                CURRENT QUESTION: ${qNum} (Project Architecture Deep-Dive).
                
                YOUR TASK:
                1. React with insightful technical commentary to their intro.
                2. Ask them to deep-dive into the most complex project they have engineered: explain the high-level architecture, key trade-offs (e.g. database choice, API paradigm, caching), and the hardest technical hurdle they personally solved.
                ${commonRules}
                ${jsonFormat}`;
            } else {
                systemPrompt = `You are "Aria", Principal Technical Interviewer at ${company} evaluating a candidate for the "${role || 'Backend Developer'}" role.
                CURRENT QUESTION: ${qNum} of ${qTotal}.
                
                ROLE-SPECIFIC TECHNICAL FOCUS FOR "${role}":
                - If Backend/Node/Java/Python: Concurrency, REST vs gRPC/GraphQL, Database Indexing (B-Trees), Caching (Redis), Distributed Locks, Microservices, ACID vs BASE transactions.
                - If Frontend/React: Virtual DOM reconciliation, React Fiber, State Management, Core Web Vitals, Bundle optimization, SSR vs CSR, CSS layout reflows.
                - If Full Stack: End-to-end data flow, API design, Auth (JWT/OAuth), Database schemas & migrations, Security (XSS, CSRF, Injection), Cloud deployment.
                - If DSA/Algorithms: Time/space trade-offs, Dynamic Programming, Graphs (BFS/DFS), Heaps, Trees, Hash collisions.
                - If System Design (Q >= 6): High-level system design (URL shortener, Live Chat, Rate Limiter, Notification Service) focusing on scalability, partitioning, and fault tolerance.
                
                YOUR TASK:
                1. Evaluate their previous answer with sharp engineering rigor (score 1-10, identify precise technical strengths and missing edge cases).
                2. Ask the next technical question targeted specifically to the "${role}" domain and previous answer context.
                ${commonRules}
                ${jsonFormat}`;
            }
        } else {
            // General / Resume mode
            systemPrompt = `You are "Aria", Senior Interviewer at ${company} evaluating a "${role}" candidate.
            CANDIDATE'S RESUME: ${resumeText ? resumeText.substring(0, 3000) : "No resume provided."}
            CURRENT QUESTION: ${qNum} of ${qTotal}.
            MODE: ${mode}.
            
            YOUR TASK:
            Evaluate previous answer and ask an in-depth question based on their resume projects, technical claims, and role requirements.
            ${commonRules}
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
            'mixtral-8x7b-32768'
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
            'mixtral-8x7b-32768'
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
