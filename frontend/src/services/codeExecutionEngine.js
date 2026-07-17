import { API_BASE } from "../config";

// Singleton Pyodide instance
let pyodideInstance = null;

// Helper to load script dynamically
const loadScript = (url, globalName) => {
    return new Promise((resolve, reject) => {
        if (window[globalName]) {
            resolve(window[globalName]);
            return;
        }
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = () => resolve(window[globalName]);
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.body.appendChild(script);
    });
};

/**
 * Strips TypeScript types using simple regular expressions for client-side execution.
 */
function transpileTS(code) {
    let clean = code;
    
    // Remove interfaces
    clean = clean.replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '');
    // Remove type aliases
    clean = clean.replace(/type\s+\w+\s*=\s*[\s\S]*?;/g, '');
    
    // Remove type annotations in variable declarations and parameter lists
    // const x: number = 5; -> const x = 5;
    // function greet(name: string): void -> function greet(name)
    clean = clean.replace(/(const|let|var|function|class)\s+(\w+)\s*:\s*(string|number|boolean|any|void|object|never|unknown|BigInt|symbol|(\w+))(\[\])?(?=\s*=|;|,|\)|\{|\n)/g, '$1 $2');
    clean = clean.replace(/(\(|,)\s*(\w+)\s*:\s*(string|number|boolean|any|void|object|never|unknown|BigInt|symbol|(\w+))(\[\])?(?=\s*\)|,)/g, '$1$2');
    
    // Remove return type annotations
    clean = clean.replace(/(\)\s*:\s*(string|number|boolean|any|void|object|never|unknown|BigInt|symbol|(\w+))(\[\])?\s*)(\{)/g, ' $5');
    
    // Remove generic markers
    clean = clean.replace(/<\s*(string|number|boolean|any|void|object|unknown|(\w+))\s*>/g, '');
    
    return clean;
}

/**
 * Transpiles standard competitive programming Java code to JavaScript.
 */
function transpileJavaToJS(code, stdin) {
    let clean = code;

    // Remove comments
    // clean = clean.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

    // Remove packages and imports
    clean = clean.replace(/package\s+[\w.]+;/g, '');
    clean = clean.replace(/import\s+[\w.+*]+;/g, '');

    // Replace System.out.println and System.out.print
    clean = clean.replace(/System\.out\.println\s*\(([\s\S]*?)\);/g, 'console.log($1);');
    clean = clean.replace(/System\.out\.print\s*\(([\s\S]*?)\);/g, 'process.stdout.write($1);');
    clean = clean.replace(/System\.out\.printf\s*\(([\s\S]*?)\);/g, 'process.stdout.write($1);');

    // Replace Scanner instantiation
    clean = clean.replace(/Scanner\s+(\w+)\s*=\s*new\s+Scanner\s*\(System\.in\);/g, 'const $1 = new JavaScanner(stdin);');
    
    // NormalizeScanner methods calls
    clean = clean.replace(/(\w+)\.nextInt\s*\(\)/g, '$1.nextInt()');
    clean = clean.replace(/(\w+)\.nextDouble\s*\(\)/g, '$1.nextDouble()');
    clean = clean.replace(/(\w+)\.next\s*\(\)/g, '$1.next()');
    clean = clean.replace(/(\w+)\.nextLine\s*\(\)/g, '$1.nextLine()');
    clean = clean.replace(/(\w+)\.hasNext\s*\(\)/g, '$1.hasNext()');
    clean = clean.replace(/(\w+)\.hasNextInt\s*\(\)/g, '$1.hasNextInt()');

    // Remove standard variable type specifiers (int a = 5; -> let a = 5;)
    clean = clean.replace(/(?:^|;|\n|\(|\{)\s*(int|double|float|char|String|boolean|long|short)\s+(\w+)(?=\s*=|;|,|\)|\n)/g, (match, type, varName) => {
        return match.replace(type, 'let');
    });

    // Replace array creations: int[] arr = new int[n]; -> let arr = new Array(n).fill(0);
    clean = clean.replace(/(int|double|float|char|String|boolean|long|short)\[\]\s+(\w+)\s*=\s*new\s+\1\[(.*?)\]\s*;/g, (match, type, varName, size) => {
        let fillVal = '0';
        if (type === 'String') fillVal = '""';
        if (type === 'boolean') fillVal = 'false';
        return `let ${varName} = new Array(${size}).fill(${fillVal});`;
    });

    // Extract main method content
    const mainStart = clean.search(/public\s+static\s+void\s+main\s*\(\s*String/);
    if (mainStart !== -1) {
        const firstOpenBracket = clean.indexOf('{', mainStart);
        if (firstOpenBracket !== -1) {
            let bracesCount = 1;
            let ptr = firstOpenBracket + 1;
            let mainCode = "";
            while (ptr < clean.length && bracesCount > 0) {
                const char = clean[ptr];
                if (char === '{') bracesCount++;
                else if (char === '}') bracesCount--;
                
                if (bracesCount > 0) {
                    mainCode += char;
                }
                ptr++;
            }
            clean = mainCode;
        }
    }

    // Scanner implementation header
    const scannerHeader = `
class JavaScanner {
    constructor(input) {
        this.tokens = (input || "").trim().split(/\\s+/).filter(Boolean);
        this.ptr = 0;
    }
    next() {
        if (!this.hasNext()) throw new Error("NoSuchElementException: Scanner empty");
        return this.tokens[this.ptr++];
    }
    nextInt() {
        return parseInt(this.next(), 10);
    }
    nextDouble() {
        return parseFloat(this.next());
    }
    nextLine() {
        if (!this.hasNext()) return "";
        const rem = this.tokens.slice(this.ptr).join(' ');
        this.ptr = this.tokens.length;
        return rem;
    }
    hasNext() {
        return this.ptr < this.tokens.length;
    }
    hasNextInt() {
        if (!this.hasNext()) return false;
        return !isNaN(parseInt(this.tokens[this.ptr], 10));
    }
}
const stdin = \`${stdin.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
`;
    return scannerHeader + clean;
}

/**
 * Execute JS/TS inside a Web Worker. Supports inputs and intercepts stdout.
 */
function executeJSInWorker(code, stdin) {
    return new Promise((resolve) => {
        const workerCode = `
            self.onmessage = function(e) {
                const { code, stdin } = e.data;
                let output = '';
                let error = '';

                // ── stdout/stderr capture ──────────────────────────────
                const fmt = (args) => args.map(a => (typeof a === 'object' && a !== null) ? JSON.stringify(a) : String(a)).join(' ');
                console.log = (...a) => { output += fmt(a) + '\\n'; };
                console.info = (...a) => { output += fmt(a) + '\\n'; };
                console.error = (...a) => { error += fmt(a) + '\\n'; };
                console.warn  = (...a) => { error += fmt(a) + '\\n'; };

                // ── process mock ───────────────────────────────────────
                self.process = {
                    stdout: { write: (s) => { output += String(s); } },
                    stderr: { write: (s) => { error  += String(s); } },
                    stdin:  { on: (ev, cb) => { if (ev === 'data') cb(stdin); } },
                    argv: ['node', 'script.js'],
                    env: {}
                };

                // ── fs mock ────────────────────────────────────────────
                self.fs = {
                    readFileSync: (fd, enc) => {
                        if (fd === 0 || fd === '0' || fd === '/dev/stdin') return stdin;
                        throw new Error('Cannot read files other than stdin in browser sandbox');
                    }
                };

                // ── readline mock — synchronously flushes after await ──
                let _readlineResolve = null;
                let _readlinePromise = null;
                let _activeRl = null;

                self.readline = {
                    createInterface: function() {
                        const rawLines = (stdin || '').replace(/\\r\\n/g, '\\n').split('\\n');
                        // Remove last empty entry from split
                        if (rawLines.length && rawLines[rawLines.length - 1] === '') rawLines.pop();

                        let lineCallbacks  = [];
                        let closeCallbacks = [];
                        let flushed = false;

                        _readlinePromise = new Promise(r => { _readlineResolve = r; });

                        function flush() {
                            if (flushed) return;
                            flushed = true;
                            try {
                                for (let i = 0; i < rawLines.length; i++) {
                                    lineCallbacks.forEach(cb => cb(rawLines[i]));
                                }
                                closeCallbacks.forEach(cb => cb());
                            } catch(ex) {
                                error += (ex.stack || ex.message) + '\\n';
                            } finally {
                                if (_readlineResolve) _readlineResolve();
                            }
                        }

                        const rl = {
                            on(event, cb) {
                                if (event === 'line')  lineCallbacks.push(cb);
                                if (event === 'close') closeCallbacks.push(cb);
                                return this;
                            },
                            close() { flush(); },
                            _flush: flush
                        };
                        _activeRl = rl;
                        return rl;
                    }
                };

                // ── require mock ───────────────────────────────────────
                self.require = function(mod) {
                    if (mod === 'readline') return self.readline;
                    if (mod === 'fs') return self.fs;
                    if (mod === 'path') return { join: (...p) => p.join('/'), resolve: (...p) => p.join('/') };
                    throw new Error("Module '" + mod + "' is not supported in browser sandbox");
                };

                // ── Run with AsyncFunction so await works inside user code ─
                // This also allows us to properly await readline completion
                // BEFORE calling postMessage, fixing the "only Hello World prints" bug.
                const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

                (async () => {
                    try {
                        const fn = new AsyncFunction(code);
                        await fn();

                        // If readline was used, flush remaining lines now (idempotent)
                        // and await its completion promise so output is fully captured
                        if (_activeRl) {
                            _activeRl._flush();
                            await _readlinePromise;
                        }

                        self.postMessage({ success: true, stdout: output, stderr: error });
                    } catch (err) {
                        self.postMessage({ success: false, stdout: output, stderr: err.stack || err.message || String(err) });
                    }
                })();
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        const timeoutId = setTimeout(() => {
            worker.terminate();
            resolve({
                success: false,
                message: "Execution Time Limit Exceeded (5s timeout) - Possible Infinite Loop."
            });
        }, 5000);

        worker.onmessage = (e) => {
            clearTimeout(timeoutId);
            worker.terminate();
            const data = e.data;
            if (data.success) {
                resolve({
                    success: true,
                    run: {
                        stdout: data.stdout || '',
                        stderr: data.stderr || '',
                        exitCode: (data.stderr && data.stderr.trim()) ? 1 : 0
                    }
                });
            } else {
                resolve({
                    success: true,
                    run: {
                        stdout: data.stdout || '',
                        stderr: data.stderr || '',
                        exitCode: 1
                    }
                });
            }
        };

        worker.onerror = (e) => {
            clearTimeout(timeoutId);
            worker.terminate();
            resolve({
                success: true,
                run: {
                    stdout: '',
                    stderr: `Worker Error: ${e.message || 'Unknown error'}`,
                    exitCode: 1
                }
            });
        };

        worker.postMessage({ code, stdin });
    });
}

/**
 * Execute C/C++ inside a Web Worker using JSCPP.
 */
function executeCPPInWorker(code, stdin) {
    return new Promise((resolve) => {
        const cppWorkerCode = `
            self.onmessage = function(e) {
                const { code, stdin, libUrl } = e.data;
                try {
                    importScripts(libUrl);
                    let stdout = "";
                    const config = {
                        stdio: {
                            write: function(str) {
                                stdout += str;
                            }
                        }
                    };
                    const exitCode = self.JSCPP.run(code, stdin, config);
                    self.postMessage({ success: true, stdout: stdout, stderr: "", exitCode: exitCode });
                } catch (err) {
                    self.postMessage({ success: false, stdout: "", stderr: err.message || String(err), exitCode: 1 });
                }
            };
        `;

        const blob = new Blob([cppWorkerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        const timeoutId = setTimeout(() => {
            worker.terminate();
            resolve({
                success: false,
                message: "Execution Time Limit Exceeded (5s timeout) - Possible Infinite Loop."
            });
        }, 5000);

        worker.onmessage = (e) => {
            clearTimeout(timeoutId);
            worker.terminate();
            const data = e.data;
            resolve({
                success: data.success !== false,
                run: {
                    stdout: data.stdout || '',
                    stderr: data.stderr || '',
                    exitCode: data.exitCode != null ? data.exitCode : (data.stderr ? 1 : 0)
                }
            });
        };

        worker.onerror = (e) => {
            clearTimeout(timeoutId);
            worker.terminate();
            resolve({
                success: true,
                run: {
                    stdout: '',
                    stderr: `Worker Error: ${e.message || 'Unknown error'}`,
                    exitCode: 1
                }
            });
        };

        worker.postMessage({
            code,
            stdin,
            libUrl: "https://cdn.jsdelivr.net/npm/jscpp@0.0.9/dist/JSCPP.es5.min.js"
        });
    });
}

/**
 * Execution methods mapping
 */
const runLocally = {
    javascript: async (code, stdin) => {
        return executeJSInWorker(code, stdin);
    },
    typescript: async (code, stdin) => {
        const transpiled = transpileTS(code);
        return executeJSInWorker(transpiled, stdin);
    },
    python: async (code, stdin, options) => {
        if (!pyodideInstance) {
            if (options.onLoadStart) options.onLoadStart("Loading Python Engine...");
            await loadScript("https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js", "loadPyodide");
            if (options.onLoadProgress) options.onLoadProgress("Initializing Python WASM environment...");
            pyodideInstance = await window.loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"
            });
            if (options.onLoadEnd) options.onLoadEnd();
        }

        let stdout = "";
        let stderr = "";

        pyodideInstance.setStdout({
            batched: (str) => { stdout += str + "\n"; }
        });
        pyodideInstance.setStderr({
            batched: (str) => { stderr += str + "\n"; }
        });

        // Run python code with stdin loaded via StringIO
        const escapedStdin = stdin.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        const runnerCode = `
import sys
import io
sys.stdin = io.StringIO("${escapedStdin}")
sys.argv = ['main.py']

try:
    code_obj = compile(${JSON.stringify(code)}, 'main.py', 'exec')
    exec(code_obj, {})
except Exception as e:
    import traceback
    sys.stderr.write(traceback.format_exc())
`;
        try {
            await pyodideInstance.runPythonAsync(runnerCode);
            return {
                success: true,
                run: {
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    exitCode: stderr.trim() ? 1 : 0
                }
            };
        } catch (err) {
            return {
                success: true,
                run: {
                    stdout: stdout.trim(),
                    stderr: stderr.trim() || err.message,
                    exitCode: 1
                }
            };
        }
    },
    cpp: async (code, stdin, options) => {
        if (options.onLoadStart) options.onLoadStart("Initializing C++ Engine...");
        // Pre-cache script in DOM, though Web Worker will load it natively
        await loadScript("https://cdn.jsdelivr.net/npm/jscpp@0.0.9/dist/JSCPP.es5.min.js", "JSCPP");
        if (options.onLoadEnd) options.onLoadEnd();
        
        return executeCPPInWorker(code, stdin);
    },
    c: async (code, stdin, options) => {
        // C is treated exactly as C++ for JSCPP
        if (options.onLoadStart) options.onLoadStart("Initializing C Engine...");
        await loadScript("https://cdn.jsdelivr.net/npm/jscpp@0.0.9/dist/JSCPP.es5.min.js", "JSCPP");
        if (options.onLoadEnd) options.onLoadEnd();
        
        return executeCPPInWorker(code, stdin);
    },
    java: async (code, stdin) => {
        const transpiled = transpileJavaToJS(code, stdin);
        return executeJSInWorker(transpiled, stdin);
    }
};

/**
 * Primary API interface
 */
export const codeExecutionEngine = {
    /**
     * Executes the given code.
     */
    execute: async (language, code, stdin = "", options = {}) => {
        const mode = options.mode || "local";
        const lang = (language || "").toLowerCase();

        if (mode === "local" && runLocally[lang]) {
            try {
                return await runLocally[lang](code, stdin, options);
            } catch (err) {
                console.warn(`Local execution failed for ${language}. Falling back to Cloud API.`, err);
                // Fallback to cloud
            }
        }

        // Cloud execution (Fallback or explicit)
        try {
            const res = await fetch(`${API_BASE}/codespirit/execute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ language, code, stdin })
            });
            return await res.json();
        } catch (err) {
            return {
                success: false,
                message: `API Error: ${err.message}. Check your network or backend server.`
            };
        }
    },

    /**
     * Verifies the code against a list of test cases.
     */
    verify: async (language, code, testCases = [], options = {}) => {
        const mode = options.mode || "local";
        const lang = (language || "").toLowerCase();

        if (mode === "local" && runLocally[lang]) {
            try {
                const results = await Promise.all(testCases.map(async (tc, index) => {
                    const result = await runLocally[lang](code, tc.input || "", options);
                    const run = result.run || {};
                    
                    const normalizeOutput = (str) => {
                        return (str || '')
                            .replace(/\r\n/g, '\n')
                            .replace(/\r/g, '\n')
                            .trim()
                            .split('\n')
                            .map(line => line.trim())
                            .join('\n');
                    };

                    const actual = normalizeOutput(run.stdout);
                    const expected = normalizeOutput(tc.output);
                    // Only fail on stderr if there's a real runtime error (not just warnings)
                    const hasRealError = run.stderr && run.stderr.trim().length > 0 && run.exitCode !== 0;
                    const passed = actual === expected && !hasRealError;

                    return {
                        testCase: index + 1,
                        input: tc.input,
                        expectedOutput: expected,
                        actualOutput: actual,
                        stderr: run.stderr || "",
                        passed,
                        exitCode: run.exitCode || 0
                    };
                }));

                const allPassed = results.every(r => r.passed);
                return {
                    success: true,
                    results,
                    allPassed,
                    message: allPassed ? "🎉 All test cases passed!" : `${results.filter(r => r.passed).length}/${results.length} test cases passed`
                };
            } catch (err) {
                console.warn("Local verification failed. Falling back to Cloud API.", err);
            }
        }

        // Cloud verification (Fallback or explicit)
        try {
            const res = await fetch(`${API_BASE}/codespirit/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    sessionId: options.sessionId,
                    challengeId: options.challengeId,
                    code,
                    language
                })
            });
            return await res.json();
        } catch (err) {
            return {
                success: false,
                message: `Network verification failed: ${err.message}`
            };
        }
    }
};
