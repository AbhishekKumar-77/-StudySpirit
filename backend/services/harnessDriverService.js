/**
 * Harness Driver Service
 * Generates language-specific harness wrapper code to execute function-signature solutions
 * directly against test case inputs and evaluate pass/fail, microsecond runtime, and outputs.
 */

function generatePythonHarness(userCode, functionName, testCases) {
    const safeTestCases = JSON.stringify(testCases || []);
    const safeFuncName = functionName || 'solution';

    return `${userCode}

# ================= AUTOMATED LEETCODE HARNESS RUNNER =================
import json, sys, time, inspect

_test_cases = ${safeTestCases}
_results = []

def _normalize(val):
    if val is None:
        return None
    if isinstance(val, (list, tuple)):
        return [_normalize(x) for x in val]
    if isinstance(val, dict):
        return {str(k): _normalize(v) for k, v in val.items()}
    return val

_sol_class = globals().get('Solution')
_sol_obj = _sol_class() if _sol_class and inspect.isclass(_sol_class) else None

for _idx, _tc in enumerate(_test_cases):
    _start = time.perf_counter()
    _err = None
    _actual = None
    try:
        _args = _tc.get("input", [])
        if not isinstance(_args, list):
            _args = [_args]
        
        if _sol_obj and hasattr(_sol_obj, "${safeFuncName}"):
            _actual = getattr(_sol_obj, "${safeFuncName}")(*_args)
        elif "${safeFuncName}" in globals() and callable(globals()["${safeFuncName}"]):
            _actual = globals()["${safeFuncName}"](*_args)
        elif _sol_class and hasattr(_sol_class, "${safeFuncName}"):
            _actual = getattr(_sol_class, "${safeFuncName}")(*_args)
        else:
            # Fallback: pick the first non-private function defined
            _funcs = [v for k, v in globals().items() if callable(v) and not k.startswith('_') and k != '_normalize']
            if _funcs:
                _actual = _funcs[-1](*_args)
            else:
                raise Exception("Target function '${safeFuncName}' not found in Solution class.")
    except Exception as _e:
        _err = str(_e)

    _elapsed_ms = round((time.perf_counter() - _start) * 1000, 3)
    _expected = _tc.get("output")
    _norm_actual = _normalize(_actual)
    _norm_expected = _normalize(_expected)

    _passed = (_err is None) and (json.dumps(_norm_actual, sort_keys=True) == json.dumps(_norm_expected, sort_keys=True))

    _results.append({
        "testCase": _idx + 1,
        "input": _tc.get("input"),
        "expectedOutput": _expected,
        "actualOutput": _actual,
        "stderr": _err or "",
        "passed": _passed,
        "runtimeMs": _elapsed_ms
    })

print("___HARNESS_RESULTS___" + json.dumps(_results))
`;
}

function generateJSHarness(userCode, functionName, testCases) {
    const safeTestCases = JSON.stringify(testCases || []);
    const safeFuncName = functionName || 'solution';

    return `${userCode}

// ================= AUTOMATED LEETCODE HARNESS RUNNER =================
(async () => {
    const testCases = ${safeTestCases};
    const results = [];

    const normalize = (val) => {
        if (val === undefined || val === null) return null;
        if (typeof val === 'object') return JSON.parse(JSON.stringify(val));
        return val;
    };

    let solObj = typeof Solution !== 'undefined' ? new Solution() : null;
    let targetFn = null;

    if (solObj && typeof solObj['${safeFuncName}'] === 'function') {
        targetFn = solObj['${safeFuncName}'].bind(solObj);
    } else if (typeof globalThis['${safeFuncName}'] === 'function') {
        targetFn = globalThis['${safeFuncName}'];
    } else if (typeof ${safeFuncName} === 'function') {
        targetFn = ${safeFuncName};
    } else {
        // Fallback: look for solution function
        if (typeof solution === 'function') targetFn = solution;
    }

    if (!targetFn) {
        console.log("___HARNESS_RESULTS___" + JSON.stringify([{
            testCase: 1,
            input: null,
            expectedOutput: null,
            actualOutput: null,
            stderr: "Target function '${safeFuncName}' not found in Solution or global scope.",
            passed: false,
            runtimeMs: 0
        }]));
        return;
    }

    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        let args = Array.isArray(tc.input) ? tc.input : [tc.input];
        let start = performance.now();
        let actual = null;
        let err = null;
        try {
            actual = await targetFn(...args);
        } catch (e) {
            err = e.message || String(e);
        }
        let elapsedMs = Math.round((performance.now() - start) * 1000) / 1000;
        let expected = tc.output;

        let normActual = normalize(actual);
        let normExpected = normalize(expected);
        let passed = !err && (JSON.stringify(normActual) === JSON.stringify(normExpected) || String(actual).trim() === String(expected).trim());

        results.push({
            testCase: i + 1,
            input: tc.input,
            expectedOutput: expected,
            actualOutput: actual,
            stderr: err || "",
            passed: passed,
            runtimeMs: elapsedMs
        });
    }

    console.log("___HARNESS_RESULTS___" + JSON.stringify(results));
})();
`;
}

function wrapUserCodeWithHarness(language, userCode, functionName, testCases) {
    const lang = (language || 'python').toLowerCase();

    if (lang === 'python') {
        return generatePythonHarness(userCode, functionName, testCases);
    } else if (lang === 'javascript' || lang === 'typescript') {
        return generateJSHarness(userCode, functionName, testCases);
    }

    // For C++/Java/C fallback, return user code as-is
    return userCode;
}

module.exports = {
    generatePythonHarness,
    generateJSHarness,
    wrapUserCodeWithHarness
};
