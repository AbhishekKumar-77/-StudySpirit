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
 * Transpiles standard competitive programming C/C++ code to JavaScript.
 * Handles: printf/scanf, cin/cout, for/while/if, arrays, basic types,
 * string functions, math operations, and common patterns.
 * 
 * NOTE: This replaces the dead JSCPP library (removed from all CDNs/npm).
 * Complex C/C++ code (pointers, structs, templates) should use Cloud API.
 */
function transpileCToJS(code, stdin) {
    let clean = code;

    // Remove single-line and multi-line comments
    clean = clean.replace(/\/\/.*$/gm, '');
    clean = clean.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove #include directives
    clean = clean.replace(/^\s*#include\s*[<"][^>"]*[>"]\s*$/gm, '');

    // Remove using namespace std;
    clean = clean.replace(/using\s+namespace\s+\w+\s*;/g, '');

    // Remove #define constants (simple ones)
    const defines = {};
    clean = clean.replace(/^\s*#define\s+(\w+)\s+(.+)$/gm, (_, name, value) => {
        defines[name] = value.trim();
        return '';
    });
    // Apply #define substitutions
    for (const [name, value] of Object.entries(defines)) {
        clean = clean.replace(new RegExp(`\\b${name}\\b`, 'g'), value);
    }

    // Replace cout << ... << endl;
    clean = clean.replace(/cout\s*<<\s*([\s\S]*?)\s*;/g, (match, content) => {
        const parts = content.split(/\s*<<\s*/).map(p => p.trim()).filter(Boolean);
        let printParts = [];
        let endsWithNewline = false;
        for (let part of parts) {
            if (part === 'endl' || part === '"\\n"' || part === "'\\n'") {
                endsWithNewline = true;
            } else {
                printParts.push(part);
            }
        }
        if (printParts.length === 0) {
            return endsWithNewline ? '__output += "\\n";' : '';
        }
        const joined = printParts.join(' + ');
        return `__output += ${joined}${endsWithNewline ? ' + "\\n"' : ''};`;
    });

    // Replace cin >> var1 >> var2;
    clean = clean.replace(/cin\s*>>\s*([\s\S]*?)\s*;/g, (match, content) => {
        const vars = content.split(/\s*>>\s*/).map(v => v.trim()).filter(Boolean);
        return vars.map(v => `${v} = __scanner.next();`).join('\n');
    });

    // Replace printf("format", args)
    clean = clean.replace(/printf\s*\(\s*"([^"]*)"\s*(?:,\s*([\s\S]*?))?\)/g, (match, fmt, argsStr) => {
        const args = argsStr ? argsStr.split(/\s*,\s*/).filter(Boolean) : [];
        let argIdx = 0;
        let result = fmt;
        // Replace format specifiers
        result = result.replace(/%(-?\d*\.?\d*)?([difs%lLuUxXoc])/g, (m, flags, spec) => {
            if (spec === '%') return '%';
            const arg = args[argIdx++] || '""';
            return `" + (${arg}) + "`;
        });
        result = result.replace(/\\n/g, '\n');
        result = result.replace(/\\t/g, '\t');
        return `__output += "${result}"`;
    });

    // Replace scanf("format", &var1, &var2)
    clean = clean.replace(/scanf\s*\(\s*"([^"]*)"\s*,\s*([\s\S]*?)\)/g, (match, fmt, argsStr) => {
        const args = argsStr.split(/\s*,\s*/).map(a => a.trim().replace(/^&/, '')).filter(Boolean);
        return args.map(v => `${v} = __scanner.nextTyped("${fmt.includes('%d') || fmt.includes('%ld') ? 'int' : fmt.includes('%f') || fmt.includes('%lf') ? 'float' : 'str'}")`).join(';\n');
    });

    // Replace puts(str) 
    clean = clean.replace(/\bputs\s*\(([\s\S]*?)\)\s*;/g, '__output += ($1) + "\\n";');

    // Replace gets(var) - deprecated but common in CP
    clean = clean.replace(/\bgets\s*\((\w+)\)\s*;/g, '$1 = __scanner.nextLine();');

    // Type declarations: int/float/double/char/long long/bool/string
    // Handle array declarations: int arr[N] or int arr[N] = {1,2,3}
    clean = clean.replace(/(?:^|(?<=;|\{|\})\s*)\b(int|long\s+long|long|float|double|char|bool|string|short|unsigned\s+int|unsigned)\s+(\w+)\s*\[(.*?)\]\s*(?:=\s*\{([^}]*)\})?\s*;/gm, (match, type, name, size, init) => {
        if (init) {
            return `let ${name} = [${init}];`;
        }
        const fillVal = (type === 'char' || type === 'string') ? '""' : type === 'bool' ? 'false' : '0';
        return `let ${name} = new Array(${size || 0}).fill(${fillVal});`;
    });

    // Variable declarations with initialization: int a = 5, b = 3;
    clean = clean.replace(/\b(int|long\s+long|long|float|double|char|bool|string|short|unsigned\s+int|unsigned)\s+((?:\w+\s*(?:=\s*[^,;]+)?\s*,\s*)*\w+\s*(?:=\s*[^;]+)?)\s*;/g, (match, type, vars) => {
        const parts = vars.split(/\s*,\s*/).map(v => v.trim());
        return parts.map(v => {
            if (v.includes('=')) {
                return `let ${v};`;
            }
            const fillVal = (type === 'char' || type === 'string') ? '""' : type === 'bool' ? 'false' : '0';
            return `let ${v} = ${fillVal};`;
        }).join('\n');
    });

    // Replace void/int return type on functions (but not main)
    clean = clean.replace(/\b(int|void|float|double|long|char|bool|string)\s+(\w+)\s*\(([^)]*)\)\s*\{/g, (match, retType, name, params) => {
        // Strip parameter types
        const cleanParams = params.split(',').map(p => {
            return p.trim().replace(/^(const\s+)?\b(int|long\s+long|long|float|double|char|bool|string|short|unsigned\s+int|unsigned|void)(\s*[&*])?\s+(\w+).*$/, '$4').trim();
        }).filter(Boolean).join(', ');
        return `function ${name}(${cleanParams}) {`;
    });

    // Replace main() - extract body
    const mainMatch = clean.match(/function\s+main\s*\([^)]*\)\s*\{/);
    if (mainMatch) {
        const mainStart = clean.indexOf(mainMatch[0]);
        const bodyStart = clean.indexOf('{', mainStart);
        let braces = 1, ptr = bodyStart + 1;
        while (ptr < clean.length && braces > 0) {
            if (clean[ptr] === '{') braces++;
            if (clean[ptr] === '}') braces--;
            ptr++;
        }
        const beforeMain = clean.substring(0, mainStart).trim();
        const mainBody = clean.substring(bodyStart + 1, ptr - 1).trim();
        const afterMain = clean.substring(ptr).trim();
        clean = beforeMain + '\n' + mainBody + '\n' + afterMain;
    }

    // Replace return 0; at end (common in C main)
    clean = clean.replace(/\breturn\s+0\s*;\s*$/gm, '');

    // Replace common C string functions
    clean = clean.replace(/\bstrlen\s*\(([^)]+)\)/g, '($1).length');
    clean = clean.replace(/\bstrcmp\s*\(([^,]+),\s*([^)]+)\)/g, '(($1) === ($2) ? 0 : ($1) < ($2) ? -1 : 1)');
    clean = clean.replace(/\babs\s*\(([^)]+)\)/g, 'Math.abs($1)');
    clean = clean.replace(/\bsqrt\s*\(([^)]+)\)/g, 'Math.sqrt($1)');
    clean = clean.replace(/\bpow\s*\(([^,]+),\s*([^)]+)\)/g, 'Math.pow($1, $2)');
    clean = clean.replace(/\bfloor\s*\(([^)]+)\)/g, 'Math.floor($1)');
    clean = clean.replace(/\bceil\s*\(([^)]+)\)/g, 'Math.ceil($1)');
    clean = clean.replace(/\bmax\s*\(([^,]+),\s*([^)]+)\)/g, 'Math.max($1, $2)');
    clean = clean.replace(/\bmin\s*\(([^,]+),\s*([^)]+)\)/g, 'Math.min($1, $2)');

    // Replace swap(a, b) - common in CP
    clean = clean.replace(/\bswap\s*\(([^,]+),\s*([^)]+)\)/g, '[($1), ($2)] = [($2), ($1)]');

    // Replace sort(arr, arr+n) or sort(v.begin(), v.end())
    clean = clean.replace(/\bsort\s*\(\s*\w+\s*,\s*\w+\s*\+\s*(\w+)\s*\)/g, (_, size) => {
        return `.sort((a, b) => a - b)`;
    });
    clean = clean.replace(/\bsort\s*\((\w+)\.begin\(\)\s*,\s*\1\.end\(\)\)/g, '$1.sort((a, b) => a - b)');

    // Replace vector<type> name or vector<type> name(n, val)
    clean = clean.replace(/\bvector\s*<[^>]+>\s+(\w+)\s*\(\s*(\w+)\s*,\s*([^)]+)\s*\)\s*;/g, 'let $1 = new Array($2).fill($3);');
    clean = clean.replace(/\bvector\s*<[^>]+>\s+(\w+)\s*;/g, 'let $1 = [];');

    // Replace .push_back() -> .push()
    clean = clean.replace(/\.push_back\s*\(/g, '.push(');
    // Replace .size() -> .length
    clean = clean.replace(/\.size\s*\(\)/g, '.length');
    // Replace .empty() -> (.length === 0)
    clean = clean.replace(/\.empty\s*\(\)/g, '.length === 0');

    // Replace to_string(x)
    clean = clean.replace(/\bto_string\s*\(([^)]+)\)/g, 'String($1)');
    // Replace stoi(x)
    clean = clean.replace(/\bstoi\s*\(([^)]+)\)/g, 'parseInt($1, 10)');
    // Replace stod(x)
    clean = clean.replace(/\bstod\s*\(([^)]+)\)/g, 'parseFloat($1)');

    // Build the runnable JavaScript with scanner and output capture
    const header = `
let __output = '';
const __scanner = (function(input) {
    const tokens = (input || '').split(/\\s+/).filter(Boolean);
    const lines = (input || '').split(/\\n/);
    let tPtr = 0, lPtr = 0;
    return {
        next() {
            if (tPtr >= tokens.length) return '';
            return tokens[tPtr++];
        },
        nextTyped(type) {
            const val = this.next();
            if (type === 'int') return parseInt(val, 10) || 0;
            if (type === 'float') return parseFloat(val) || 0;
            return val;
        },
        nextLine() {
            if (lPtr >= lines.length) return '';
            return lines[lPtr++];
        },
        hasNext() { return tPtr < tokens.length; }
    };
})(\`${stdin.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
`;
    const footer = `\nconsole.log(__output.replace(/\\n$/, ''));`;
    return header + clean + footer;
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
import json
import ast
import inspect

sys.stdin = io.StringIO("${escapedStdin}")
sys.argv = ['main.py']

_captured_out = io.StringIO()
_orig_stdout = sys.stdout

class _TeeStdout:
    def __init__(self, target1, target2):
        self.t1 = target1
        self.t2 = target2
    def write(self, s):
        self.t1.write(s)
        self.t2.write(s)
    def flush(self):
        if hasattr(self.t1, 'flush'): self.t1.flush()
        if hasattr(self.t2, 'flush'): self.t2.flush()

sys.stdout = _TeeStdout(_orig_stdout, _captured_out)
_user_globals = {}

try:
    code_obj = compile(${JSON.stringify(code)}, 'main.py', 'exec')
    exec(code_obj, _user_globals)

    # If user code didn't print anything, try auto-invoking user-defined function with stdin
    if not _captured_out.getvalue().strip():
        _user_funcs = [v for k, v in _user_globals.items() if callable(v) and not k.startswith('__')]
        if _user_funcs:
            func = _user_funcs[-1]
            raw_in = "${escapedStdin}".strip()
            if raw_in:
                res = None
                parsed_in = None
                try:
                    parsed_in = json.loads(raw_in)
                except Exception:
                    try:
                        parsed_in = ast.literal_eval(raw_in)
                    except Exception:
                        parsed_in = raw_in

                if isinstance(parsed_in, dict):
                    sig = inspect.signature(func)
                    params = list(sig.parameters.keys())
                    if len(params) == 1 and params[0] in parsed_in:
                        res = func(parsed_in[params[0]])
                    else:
                        try:
                            res = func(**parsed_in)
                        except Exception:
                            res = func(parsed_in)
                elif isinstance(parsed_in, list):
                    try:
                        res = func(*parsed_in)
                    except Exception:
                        res = func(parsed_in)
                else:
                    res = func(parsed_in)

                if res is not None:
                    if isinstance(res, (dict, list)):
                        print(json.dumps(res))
                    else:
                        print(res)
except Exception as e:
    import traceback
    sys.stderr.write(traceback.format_exc())
finally:
    sys.stdout = _orig_stdout
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
        if (options.onLoadStart) options.onLoadStart("Transpiling C++ → JS...");
        const transpiled = transpileCToJS(code, stdin);
        if (options.onLoadEnd) options.onLoadEnd();
        return executeJSInWorker(transpiled, stdin);
    },
    c: async (code, stdin, options) => {
        if (options.onLoadStart) options.onLoadStart("Transpiling C → JS...");
        const transpiled = transpileCToJS(code, stdin);
        if (options.onLoadEnd) options.onLoadEnd();
        return executeJSInWorker(transpiled, stdin);
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
                console.warn(`Local execution failed for ${language}. Trying Cloud API...`, err);
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
            const data = await res.json();
            if (data.success && data.run) {
                return {
                    ...data,
                    engine: data.engine || 'judge0'
                };
            }

            // If Cloud API failed or returned 401 whitelist error, fall back to local in-browser execution automatically!
            if (runLocally[lang]) {
                console.warn(`Cloud API returned error (${data.message}). Seamlessly executing via local engine...`);
                return await runLocally[lang](code, stdin, options);
            }
            return data;
        } catch (err) {
            if (runLocally[lang]) {
                console.warn(`Cloud network error (${err.message}). Seamlessly executing via local engine...`);
                return await runLocally[lang](code, stdin, options);
            }
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

        const runLocalVerification = async () => {
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
        };

        if (mode === "local" && runLocally[lang]) {
            try {
                return await runLocalVerification();
            } catch (err) {
                console.warn("Local verification failed. Trying Cloud API...", err);
            }
        }

        // Cloud verification
        try {
            const res = await fetch(`${API_BASE}/codespirit/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    sessionId: options.sessionId,
                    challengeId: options.challengeId,
                    code,
                    language,
                    functionName: options.functionName || 'solution'
                })
            });
            const data = await res.json();
            if (data.success) {
                return data;
            }
            if (runLocally[lang]) {
                console.warn(`Cloud verification error (${data.message}). Falling back to local verification engine...`);
                return await runLocalVerification();
            }
            return data;
        } catch (err) {
            if (runLocally[lang]) {
                console.warn(`Cloud verification network error (${err.message}). Falling back to local verification engine...`);
                return await runLocalVerification();
            }
            return {
                success: false,
                message: `Network verification failed: ${err.message}`
            };
        }
    }
};
