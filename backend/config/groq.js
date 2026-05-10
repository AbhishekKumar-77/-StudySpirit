/**
 * Centralized Groq API Key resolver.
 * All controllers must use getGroqKey() — NO hardcoded fallbacks allowed.
 */
const getGroqKey = (specific) => {
    const key = specific || process.env.GROQ_API_KEY;
    if (!key) {
        throw new Error('Groq API key not configured. Set GROQ_API_KEY in your environment variables.');
    }
    return key;
};

module.exports = {
    getGroqKey,
    GROQ_KEYS: {
        interview: () => getGroqKey(process.env.GROQ_API_KEY_INTERVIEW),
        codespirit: () => getGroqKey(process.env.GROQ_API_KEY_CODESPIRIT),
        solomode: () => getGroqKey(process.env.GROQ_API_KEY_SOLOMODE),
        planner: () => getGroqKey(process.env.GROQ_API_KEY_PLANNER),
        resource: () => getGroqKey(process.env.GROQ_API_KEY_RESOURCE),
    }
};
