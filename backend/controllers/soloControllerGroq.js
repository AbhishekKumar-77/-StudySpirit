const User = require('../models/User');
const platformService = require('../services/platformService');

// Simple rate limiter to prevent quota exceeded errors
let lastApiCallTime = 0;
const MIN_TIME_BETWEEN_CALLS = 1000; // 1 second for Groq (it's faster)

// AI Chat - Using Groq API (Fast & Free)
exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const user = await User.findById(req.user.id);

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: "Message is required" });
        }

        user.chatHistory.push({ role: 'user', message });

        let aiResponse = "";
        const GROQ_API_KEY = process.env.GROQ_API_KEY_SOLOMODE || process.env.GROQ_API_KEY || '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';

        // Check if API Key is configured
        if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
            const warningMsg = `⚠️ **AI Brain Missing!**

To answer your questions, I need a **Groq API Key** (free & unlimited!).

**Get it in 30 seconds:**
1. Visit: https://console.groq.com/keys
2. Sign up (free, no credit card)
3. Click "Create API Key"
4. Copy the key (starts with gsk_...)
5. Add to backend/.env: GROQ_API_KEY=gsk_...
6. Restart backend

Groq is FREE, FAST, and has NO rate limits! 🚀`;

            user.chatHistory.push({ role: 'ai', message: warningMsg });
            await user.save();
            return res.json({ response: warningMsg });
        }

        // Build conversation history
        const recentHistory = user.chatHistory.slice(-4).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.message
        }));

        // Try Groq API
        try {
            // Rate limiting
            const now = Date.now();
            const timeSinceLastCall = now - lastApiCallTime;
            if (timeSinceLastCall < MIN_TIME_BETWEEN_CALLS) {
                const waitTime = MIN_TIME_BETWEEN_CALLS - timeSinceLastCall;
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            lastApiCallTime = Date.now();

            console.log('🚀 Calling Groq API...');

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
                            {
                                role: 'system',
                                content: 'You are an expert study mentor. Answer questions clearly with examples. Be concise but helpful.'
                            },
                            ...recentHistory,
                            {
                                role: 'user',
                                content: message
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 1000,
                        top_p: 1,
                        stream: false
                    })
                }
            );

            const data = await groqResponse.json();

            if (data.choices && data.choices[0]?.message?.content) {
                aiResponse = data.choices[0].message.content;
                console.log('✅ Groq Response received');
            } else if (data.error) {
                console.error('❌ Groq API Error:', data.error);
                aiResponse = `**API Error:** ${data.error.message}`;
            } else {
                aiResponse = "**Error:** Unexpected response format.";
            }
        } catch (apiError) {
            console.error('❌ Groq Exception:', apiError.message);
            aiResponse = `**Network Error:** ${apiError.message}`;
        }

        // Safety check
        if (!aiResponse) {
            aiResponse = "I'm offline. Please try again.";
        }

        user.chatHistory.push({ role: 'ai', message: aiResponse });

        if (user.chatHistory.length > 50) {
            user.chatHistory = user.chatHistory.slice(-50);
        }

        await user.save();
        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ message: "Error processing chat" });
    }
};
