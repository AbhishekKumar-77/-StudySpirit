/**
 * Judge0 Execution Service Adapter
 * Interacts with Judge0 API (Self-Hosted or RapidAPI/Public Endpoint)
 * Supports Base64 payload encoding, microsecond timing, RAM profiling, and status mapping.
 */

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://ce.judge0.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || process.env.RAPIDAPI_KEY || '';
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

// Judge0 Language ID Mappings
const JUDGE0_LANGUAGE_IDS = {
    'python': 71,       // Python (3.8.1)
    'javascript': 63,   // JavaScript (Node.js 12.14.0)
    'typescript': 74,   // TypeScript (3.7.4)
    'cpp': 54,          // C++ (GCC 9.2.0)
    'c++': 54,
    'c': 50,            // C (GCC 9.2.0)
    'java': 62,         // Java (OpenJDK 13.0.1)
    'sql': 82           // SQL (SQLite 3.27.2)
};

// Helper: Safe Base64 encoding
function toBase64(str) {
    return Buffer.from(str || '', 'utf-8').toString('base64');
}

// Helper: Safe Base64 decoding
function fromBase64(str) {
    if (!str) return '';
    try {
        return Buffer.from(str, 'base64').toString('utf-8');
    } catch (e) {
        return str;
    }
}

/**
 * Execute code via Judge0 API
 */
async function executeCode(language, code, stdin = '', expectedOutput = '') {
    const langKey = (language || '').toLowerCase();
    const languageId = JUDGE0_LANGUAGE_IDS[langKey];

    if (!languageId) {
        throw new Error(`Unsupported language for Judge0: ${language}. Supported: ${Object.keys(JUDGE0_LANGUAGE_IDS).join(', ')}`);
    }

    const headers = {
        'Content-Type': 'application/json'
    };

    if (JUDGE0_API_KEY) {
        headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
        headers['X-RapidAPI-Host'] = JUDGE0_API_HOST;
    }

    const payload = {
        language_id: languageId,
        source_code: toBase64(code),
        stdin: toBase64(stdin),
        expected_output: expectedOutput ? toBase64(expectedOutput) : undefined,
        cpu_time_limit: 2.0,      // 2.0s TLE
        memory_limit: 256000      // 256MB MLE
    };

    const endpoint = `${JUDGE0_URL.replace(/\/$/, '')}/submissions?wait=true&base64_encoded=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s overall HTTP timeout limit

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            signal: controller.signal,
            body: JSON.stringify(payload)
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            throw new Error(`Judge0 API error (${response.status}): ${errText}`);
        }

        const data = await response.json();

        // Decode Judge0 response payloads
        const stdout = fromBase64(data.stdout);
        const stderr = fromBase64(data.stderr);
        const compileOutput = fromBase64(data.compile_output);
        const message = fromBase64(data.message);

        const runtimeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : 0;
        const memoryKb = data.memory || 0;
        const statusId = data.status?.id || 3;
        const statusDescription = data.status?.description || 'Accepted';

        const exitCode = (statusId === 3) ? 0 : 1;
        const combinedError = (stderr || compileOutput || message || (statusId !== 3 ? statusDescription : '')).trim();

        return {
            success: true,
            run: {
                stdout: stdout || '',
                stderr: combinedError,
                exitCode: exitCode,
                runtimeMs: runtimeMs,
                memoryKb: memoryKb,
                statusId: statusId,
                statusDescription: statusDescription
            }
        };

    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error("Time Limit Exceeded - Judge0 API Request Timeout.");
        }
        throw err;
    }
}

module.exports = {
    executeCode,
    JUDGE0_LANGUAGE_IDS
};
