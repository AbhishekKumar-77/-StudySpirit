// AI-Powered Study Planner using Groq
exports.getStudySuggestions = async (req, res) => {
    try {
        const { topics, chapters, daysAvailable, hoursPerDay, difficulty } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY_PLANNER || process.env.GROQ_API_KEY;

        if (!daysAvailable || daysAvailable < 1) {
            return res.status(400).json({ message: "Days available is required" });
        }

        if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.status(500).json({ message: "AI service not configured" });
        }

        // Build the prompt for AI
        const topicsList = topics || chapters || "General Study Topics";
        const hours = hoursPerDay || 4;
        const level = difficulty || "intermediate";

        const prompt = `Create a detailed study plan:

Topics/Chapters: ${topicsList}
Days Available: ${daysAvailable}
Hours per Day: ${hours}
Difficulty: ${level}

Generate a day-by-day study plan with:
- Daily topics and tasks
- Study techniques to use
- Practice problems/exercises
- Revision schedule
- Motivational tips

Make it practical and achievable.`;

        // Call Groq API
        try {
            const groqResponse = await fetch(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama3-70b-8192',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are an expert study planner. Create detailed, practical study schedules.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 2000
                    })
                }
            );

            const data = await groqResponse.json();

            if (data.choices && data.choices[0]?.message?.content) {
                const aiPlan = data.choices[0].message.content;

                res.json({
                    success: true,
                    plan: aiPlan,
                    summary: {
                        totalDays: daysAvailable,
                        totalHours: daysAvailable * hours,
                        topics: topicsList
                    }
                });
            } else {
                throw new Error("No response from AI");
            }
        } catch (apiError) {
            console.error('Groq API Error:', apiError);
            res.status(500).json({ message: "Error generating study plan" });
        }
    } catch (error) {
        console.error('Study Suggestions Error:', error);
        res.status(500).json({ message: "Error processing request" });
    }
};
