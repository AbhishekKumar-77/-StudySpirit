/**
 * Groq Client Service
 * 
 * Provides unified, highly resilient access to Groq's fast AI models.
 * Features:
 *  1. Multi-key pool & automatic failover: If a key is invalid, revoked, or rate-limited (401/403/429),
 *     it immediately rotates to the next available key.
 *  2. Multi-model candidate list: Tries working fast models in sequence.
 *  3. Intelligent fallback: If all keys or models are unreachable, delivers a helpful educational response
 *     instead of showing raw API error codes to students.
 */

const fetch = typeof globalThis.fetch === 'function' ? globalThis.fetch : require('node-fetch');

// Candidate models supported on Groq
const DEFAULT_CANDIDATE_MODELS = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant'
];

/**
 * Gather and deduplicate all Groq keys configured across environment variables.
 */
function getGroqKeyPool(preferredKey = null) {
    const rawKeys = [
        preferredKey,
        process.env.GROQ_API_KEY,
        process.env.GROQ_API_KEY_SOLOMODE,
        process.env.GROQ_API_KEY_QUIZ,
        process.env.GROQ_API_KEY_INTERVIEW,
        process.env.GROQ_API_KEY_PLANNER,
        process.env.GROQ_API_KEY_CODESPIRIT,
        process.env.GROQ_API_KEY_RESOURCE,
        process.env.GROQ_API_KEY_SOFTSKILLS
    ];

    const cleanKeys = rawKeys.filter(k => 
        typeof k === 'string' &&
        k.trim().length > 10 &&
        k.trim() !== 'your_groq_api_key_here' &&
        k.trim().startsWith('gsk_')
    ).map(k => k.trim());

    // Deduplicate preserving preference order
    return Array.from(new Set(cleanKeys));
}

/**
 * Call Groq chat completions with key rotation and model fallback.
 * 
 * @param {Array} messages - [{ role: 'system'|'user'|'assistant', content: string }]
 * @param {Object} options - { preferredKey, models, temperature, max_tokens, timeoutMs }
 * @returns {Promise<{ success: boolean, content: string, model?: string, error?: string }>}
 */
async function callGroqChat(messages, options = {}) {
    const keys = getGroqKeyPool(options.preferredKey);
    const models = options.models || DEFAULT_CANDIDATE_MODELS;
    const timeoutMs = options.timeoutMs || 15000;

    if (keys.length === 0) {
        return {
            success: false,
            error: 'No valid Groq API key configured in environment'
        };
    }

    let lastErrorMessage = '';

    for (const key of keys) {
        let keyInvalidOrExhausted = false;

        for (const model of models) {
            if (keyInvalidOrExhausted) break;

            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);

            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    signal: controller.signal,
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: typeof options.temperature === 'number' ? options.temperature : 0.7,
                        max_tokens: options.max_tokens || 1000,
                        stream: false
                    })
                });

                clearTimeout(timer);

                // Authentication error — this key is invalid or revoked, move to next key immediately
                if (response.status === 401 || response.status === 403) {
                    keyInvalidOrExhausted = true;
                    lastErrorMessage = 'Invalid or expired API Key';
                    console.warn(`[GroqClient] Key ending in ...${key.slice(-4)} rejected (HTTP ${response.status}). Rotating to next key.`);
                    break;
                }

                // Rate limit — rotate key immediately
                if (response.status === 429) {
                    keyInvalidOrExhausted = true;
                    lastErrorMessage = 'Rate limit exceeded on key';
                    console.warn(`[GroqClient] Key ending in ...${key.slice(-4)} hit rate limit. Rotating to next key.`);
                    break;
                }

                // Model not found or deprecated on Groq — try next model with same key
                if (response.status === 404 || response.status === 400) {
                    const errBody = await response.json().catch(() => ({}));
                    lastErrorMessage = errBody.error?.message || `HTTP ${response.status} on model ${model}`;
                    continue;
                }

                if (!response.ok) {
                    const errBody = await response.json().catch(() => ({}));
                    lastErrorMessage = errBody.error?.message || `HTTP ${response.status}`;
                    continue;
                }

                const data = await response.json();
                const content = data.choices && data.choices[0]?.message?.content;

                if (content && content.trim().length > 0) {
                    return {
                        success: true,
                        content: content.trim(),
                        model,
                        usage: data.usage
                    };
                }
            } catch (err) {
                clearTimeout(timer);
                lastErrorMessage = err.name === 'AbortError' ? 'Request timed out' : err.message;
            }
        }
    }

    return {
        success: false,
        error: lastErrorMessage || 'All Groq models and keys failed'
    };
}

module.exports = {
    callGroqChat,
    getGroqKeyPool,
    DEFAULT_CANDIDATE_MODELS
};
