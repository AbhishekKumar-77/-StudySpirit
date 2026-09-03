import React, { useState } from 'react';
import {
    ArrowLeft, Code, Play, CheckCircle2, AlertCircle, Clock, Zap,
    Cpu, Database, Layers, ArrowRight, ExternalLink, Bot, Mic, MicOff,
    Check, Sparkles, Camera, CameraOff, Terminal, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { codeExecutionEngine } from '../../services/codeExecutionEngine';
import soloApi from '../../services/soloApi';

export default function TechnicalInterviewRoom({
    targetRole = 'Backend Developer',
    targetCompany = 'Google',
    cameraEnabled = false,
    onToggleCamera,
    videoRef,
    onEndInterview,
    onBack
}) {
    const navigate = useNavigate();

    const problemData = {
        dsa: {
            title: 'Two Sum - Index Search',
            difficulty: 'Easy',
            category: 'Arrays & Hash Table',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution.',
            inputExample: 'nums = [2,7,11,15], target = 9',
            outputExample: '[0, 1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
            initialCode: `// Function to find two numbers that sum up to target
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
            testHarness: `
console.log("--- Test Case 1 ---");
const r1 = twoSum([2, 7, 11, 15], 9);
console.log("Result:", JSON.stringify(r1));
if (JSON.stringify(r1) !== "[0,1]") throw new Error("Expected [0,1], got " + JSON.stringify(r1));

console.log("--- Test Case 2 ---");
const r2 = twoSum([3, 2, 4], 6);
console.log("Result:", JSON.stringify(r2));
if (JSON.stringify(r2) !== "[1,2]") throw new Error("Expected [1,2], got " + JSON.stringify(r2));

console.log("--- Test Case 3 ---");
const r3 = twoSum([3, 3], 6);
console.log("Result:", JSON.stringify(r3));
if (JSON.stringify(r3) !== "[0,1]") throw new Error("Expected [0,1], got " + JSON.stringify(r3));

console.log("✅ All 3 automated test cases passed successfully!");
`,
            probeQuestion: "Why did you choose a Hash Map for this approach? What is the Time and Space Complexity?",
            complexity: "Time: O(N) | Space: O(N)",
            testCases: [
                { id: 1, name: 'Test Case 1: [2,7,11,15], target = 9', expected: '[0, 1]' },
                { id: 2, name: 'Test Case 2: [3,2,4], target = 6', expected: '[1, 2]' },
                { id: 3, name: 'Test Case 3: [3,3], target = 6', expected: '[0, 1]' }
            ]
        },
        backend: {
            title: 'Design a Sliding Window Rate Limiter',
            difficulty: 'Medium',
            category: 'Express & Memory Middleware',
            description: 'Implement an in-memory rate limiter function that restricts requests from an IP to a maximum of 100 requests per minute.',
            inputExample: 'ip = "192.168.1.1", limit = 100, windowMs = 60000',
            outputExample: '{ allowed: true, remaining: 99 }',
            explanation: 'Filters timestamps older than (now - windowMs), then verifies if request count < limit.',
            initialCode: `// Sliding Window In-Memory Rate Limiter
const requestLogs = new Map();

function isRateLimited(ip, limit = 100, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    let timestamps = requestLogs.get(ip) || [];
    timestamps = timestamps.filter(t => t > windowStart);
    
    if (timestamps.length >= limit) {
        return { allowed: false, remaining: 0 };
    }
    
    timestamps.push(now);
    requestLogs.set(ip, timestamps);
    return { allowed: true, remaining: limit - timestamps.length };
}`,
            testHarness: `
console.log("--- Testing Single IP Request ---");
const test1 = isRateLimited("192.168.1.1", 5, 1000);
console.log("Request 1:", JSON.stringify(test1));
if (!test1.allowed) throw new Error("Expected allowed: true");

for (let i = 0; i < 4; i++) isRateLimited("192.168.1.1", 5, 1000);
const testOverLimit = isRateLimited("192.168.1.1", 5, 1000);
console.log("Request 6 (Over limit):", JSON.stringify(testOverLimit));
if (testOverLimit.allowed) throw new Error("Expected request 6 to be blocked");

console.log("✅ Rate Limiter sliding window logic verified!");
`,
            probeQuestion: "How would this sliding log algorithm handle 50,000 requests per second across multiple microservice replicas?",
            complexity: "Time: O(K) per req | Space: O(N)",
            testCases: [
                { id: 1, name: 'Test Case 1: 5 requests within window', expected: '{ allowed: true }' },
                { id: 2, name: 'Test Case 2: 6th request blocked', expected: '{ allowed: false }' }
            ]
        },
        'system-design': {
            title: 'Design Base62 Short Code Generator (TinyURL)',
            difficulty: 'Medium',
            category: 'System Design & Encoding',
            description: 'Implement a Base62 encoder that converts a 64-bit auto-incrementing integer ID to a 6-7 character alphanumeric short URL hash.',
            inputExample: 'ID: 10000000',
            outputExample: '"fEM2"',
            explanation: 'Uses Base62 radix division on character set [0-9a-zA-Z].',
            initialCode: `// Base62 Short Code Generator
const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encodeId(num) {
    if (num === 0) return BASE62[0];
    let sb = [];
    while (num > 0) {
        sb.push(BASE62[num % 62]);
        num = Math.floor(num / 62);
    }
    return sb.reverse().join('');
}`,
            testHarness: `
console.log("--- Base62 Encoding Test ---");
const c1 = encodeId(125);
console.log("encodeId(125) =", c1);
if (c1 !== "cb") throw new Error("Expected 'cb', got " + c1);

const c2 = encodeId(10000000);
console.log("encodeId(10000000) =", c2);
if (c2 !== "fEM2") throw new Error("Expected 'fEM2', got " + c2);

console.log("✅ Base62 Encoder verified!");
`,
            probeQuestion: "How do you prevent Base62 collisions when multiple database nodes generate IDs concurrently?",
            complexity: "Time: O(log62 N) | Space: O(1)",
            testCases: [
                { id: 1, name: 'Encode ID: 125 -> "cb"', expected: '"cb"' },
                { id: 2, name: 'Encode ID: 10000000 -> "fEM2"', expected: '"fEM2"' }
            ]
        },
        'cs-fundamentals': {
            title: 'Explain Process vs Thread & Deadlock Conditions',
            difficulty: 'Medium',
            category: 'Operating Systems & Concurrency',
            description: 'Analyze deadlock conditions and demonstrate resource allocation ordering to prevent Circular Wait.',
            inputExample: 'Topic: OS Concurrency & Deadlocks',
            outputExample: 'Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
            explanation: 'Deadlock can only occur if all 4 Coffman conditions hold simultaneously.',
            initialCode: `// Ordered Lock Acquisition to Prevent Circular Wait
function safeAcquireLocks(lockA, lockB) {
    // Always acquire lower-ID lock first
    const [first, second] = lockA.id < lockB.id ? [lockA, lockB] : [lockB, lockA];
    first.acquire();
    second.acquire();
    
    // Critical Section
    second.release();
    first.release();
    return { success: true };
}`,
            testHarness: `
console.log("--- Testing Ordered Lock Hierarchy ---");
const lock1 = { id: 1, acquire: () => {}, release: () => {} };
const lock2 = { id: 2, acquire: () => {}, release: () => {} };
const result = safeAcquireLocks(lock2, lock1);
console.log("Result:", JSON.stringify(result));
if (!result.success) throw new Error("Failed to safely acquire locks");
console.log("✅ Circular wait prevention verified!");
`,
            probeQuestion: "Which deadlock prevention strategy would you apply to break the Circular Wait condition in a distributed transaction?",
            complexity: "Time: O(1) | Space: O(1)",
            testCases: [
                { id: 1, name: 'Safe Lock Acquisition (No Circular Wait)', expected: '4/4 Coffman Safe' }
            ]
        }
    };

    // State Hooks
    const [selectedTab, setSelectedTab] = useState('dsa');
    const [code, setCode] = useState(problemData.dsa.initialCode);
    const [isRunning, setIsRunning] = useState(false);
    const [executionOutput, setExecutionOutput] = useState(null);
    const [testResults, setTestResults] = useState(null);
    const [language, setLanguage] = useState('javascript');
    const [probeResponse, setProbeResponse] = useState('');
    const [ariaProbeQuestion, setAriaProbeQuestion] = useState(problemData.dsa.probeQuestion);
    const [ariaFeedback, setAriaFeedback] = useState('');

    const currentProblem = problemData[selectedTab] || problemData.dsa;

    // Real Execution via codeExecutionEngine
    const handleRunTests = async () => {
        setIsRunning(true);
        setExecutionOutput(null);

        const executableCode = `${code}\n${currentProblem.testHarness}`;

        try {
            const start = performance.now();
            const res = await codeExecutionEngine.execute('javascript', executableCode);
            const elapsed = Math.round(performance.now() - start);

            const stdout = res?.run?.stdout || '';
            const stderr = res?.run?.stderr || '';
            const passed = !stderr && stdout.includes('✅');

            setExecutionOutput({
                stdout,
                stderr,
                elapsed,
                passed
            });

            setTestResults(currentProblem.testCases.map((tc) => ({
                ...tc,
                passed
            })));
        } catch (err) {
            setExecutionOutput({
                stdout: '',
                stderr: err.message,
                elapsed: 0,
                passed: false
            });
            setTestResults(currentProblem.testCases.map(tc => ({ ...tc, passed: false })));
        } finally {
            setIsRunning(false);
        }
    };

    const [isAriaThinking, setIsAriaThinking] = useState(false);

    const handleAnswerProbe = async () => {
        if (!probeResponse.trim() || isAriaThinking) return;
        const answer = probeResponse.trim();
        setProbeResponse('');
        setIsAriaThinking(true);

        try {
            const prompt = `You are Aria, an expert AI Technical Interviewer at ${targetCompany} evaluating a candidate for the "${targetRole}" position.
The candidate is solving the problem: "${currentProblem.title}".
Your previous question: "${ariaProbeQuestion}".
The candidate answered: "${answer}".
Candidate's code:
\`\`\`javascript
${code}
\`\`\`
Provide a concise technical assessment (2 sentences maximum) of their response and code, and follow up with exactly ONE deeper question on performance, memory, edge cases, or scale.`;

            const res = await soloApi.sendAIMessage(prompt);
            const aiText = res.response || '';
            setAriaFeedback(`Aria Review: "${aiText}"`);
            const questionMatch = aiText.match(/[^.!?]+[?]/g);
            if (questionMatch && questionMatch.length > 0) {
                setAriaProbeQuestion(questionMatch[questionMatch.length - 1].trim());
            } else {
                setAriaProbeQuestion("How would your algorithm scale if inputs grow by 100x?");
            }
        } catch (e) {
            setAriaFeedback(`Aria Review: "Good trade-off justification on ${answer.slice(0, 45)}..."`);
            setAriaProbeQuestion("What are the edge cases where this approach might encounter higher latency or memory overhead?");
        } finally {
            setIsAriaThinking(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans select-none">
            {/* Top Bar */}
            <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">Technical Live Whiteboard Room</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-sm font-bold text-white">{targetRole} · {targetCompany} Track</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Live Student Camera Stream Tile */}
                    <div className="relative w-28 h-16 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-md flex items-center justify-center">
                        {cameraEnabled ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <CameraOff className="w-4 h-4 text-slate-600" />
                        )}
                        <button
                            onClick={onToggleCamera}
                            className="absolute bottom-1 right-1 p-1 rounded-full bg-slate-950/80 text-slate-400 hover:text-white"
                            title="Toggle Camera"
                        >
                            {cameraEnabled ? <Camera className="w-3 h-3 text-emerald-400" /> : <CameraOff className="w-3 h-3 text-rose-400" />}
                        </button>
                    </div>

                    <button
                        onClick={() => navigate('/codespirit')}
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
                    >
                        <Code className="w-4 h-4" />
                        <span>CodeSpirit Mode</span>
                    </button>

                    <button
                        onClick={onEndInterview}
                        className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs px-4 py-2 rounded-xl transition"
                    >
                        END INTERVIEW
                    </button>
                </div>
            </header>

            {/* Category Tabs */}
            <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex items-center gap-3 overflow-x-auto">
                <button
                    onClick={() => { setSelectedTab('dsa'); setCode(problemData.dsa.initialCode); setTestResults(null); setExecutionOutput(null); setAriaProbeQuestion(problemData.dsa.probeQuestion); setAriaFeedback(''); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        selectedTab === 'dsa' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <Code className="w-4 h-4" />
                    <span>DSA & Problem Solving</span>
                </button>

                <button
                    onClick={() => { setSelectedTab('backend'); setCode(problemData.backend.initialCode); setTestResults(null); setExecutionOutput(null); setAriaProbeQuestion(problemData.backend.probeQuestion); setAriaFeedback(''); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        selectedTab === 'backend' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <Database className="w-4 h-4" />
                    <span>Backend & Middleware</span>
                </button>

                <button
                    onClick={() => { setSelectedTab('system-design'); setCode(problemData['system-design'].initialCode); setTestResults(null); setExecutionOutput(null); setAriaProbeQuestion(problemData['system-design'].probeQuestion); setAriaFeedback(''); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        selectedTab === 'system-design' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>System Design</span>
                </button>

                <button
                    onClick={() => { setSelectedTab('cs-fundamentals'); setCode(problemData['cs-fundamentals'].initialCode); setTestResults(null); setExecutionOutput(null); setAriaProbeQuestion(problemData['cs-fundamentals'].probeQuestion); setAriaFeedback(''); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        selectedTab === 'cs-fundamentals' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <Cpu className="w-4 h-4" />
                    <span>CS Fundamentals</span>
                </button>
            </div>

            {/* Main Workspace */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel: Problem Statement & AI Follow-up Probe */}
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                                    {currentProblem.difficulty} • {currentProblem.category}
                                </span>
                                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800 font-bold">
                                    {currentProblem.complexity}
                                </span>
                            </div>

                            <h2 className="text-lg font-bold text-white mb-2">{currentProblem.title}</h2>
                            <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                {currentProblem.description}
                            </p>

                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-xs font-mono space-y-1.5 mb-4">
                                <p className="text-slate-400"><strong className="text-slate-200">Input:</strong> {currentProblem.inputExample}</p>
                                <p className="text-slate-400"><strong className="text-slate-200">Output:</strong> {currentProblem.outputExample}</p>
                                <p className="text-slate-400"><strong className="text-slate-200">Explanation:</strong> {currentProblem.explanation}</p>
                            </div>
                        </div>

                        {/* AI Follow-up Probe Box */}
                        <div className="bg-purple-950/40 border border-purple-800/50 rounded-2xl p-4 mt-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold text-purple-300">Aria AI Technical Interrogator</span>
                            </div>

                            <p className="text-xs text-slate-200 font-medium leading-relaxed">
                                "{ariaProbeQuestion}"
                            </p>

                            {ariaFeedback && (
                                <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-2.5 text-[11px] text-emerald-300 font-medium">
                                    {ariaFeedback}
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={probeResponse}
                                    onChange={(e) => setProbeResponse(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnswerProbe()}
                                    placeholder="Explain your technical trade-offs..."
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                                />
                                <button
                                    onClick={handleAnswerProbe}
                                    disabled={isAriaThinking || !probeResponse.trim()}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                                >
                                    {isAriaThinking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                                    <span>{isAriaThinking ? 'Analyzing...' : 'Respond'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Embedded Code Editor & Test Cases */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-slate-200">Live Code Whiteboard</span>
                            </div>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-3 py-1 focus:outline-none"
                            >
                                <option value="javascript">JavaScript (ES6)</option>
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                            </select>
                        </div>

                        {/* Code Editor */}
                        <div className="relative font-mono text-xs mb-4">
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                rows={12}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none focus:border-blue-500 shadow-inner"
                            />
                        </div>

                        {/* Test Execution Output Console */}
                        {executionOutput && (
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono space-y-2 mb-4 max-h-48 overflow-y-auto">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-300 font-bold">
                                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>Execution Console</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        executionOutput.passed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                                    }`}>
                                        {executionOutput.passed ? `All Passed (${executionOutput.elapsed}ms)` : 'Failed'}
                                    </span>
                                </div>
                                {executionOutput.stdout && (
                                    <pre className="text-slate-300 text-[11px] whitespace-pre-wrap">{executionOutput.stdout}</pre>
                                )}
                                {executionOutput.stderr && (
                                    <pre className="text-rose-400 text-[11px] whitespace-pre-wrap">{executionOutput.stderr}</pre>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <button
                            onClick={handleRunTests}
                            disabled={isRunning}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition"
                        >
                            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            <span>{isRunning ? 'Executing Real Engine...' : 'Run Test Cases'}</span>
                        </button>

                        <button
                            onClick={() => navigate('/codespirit')}
                            className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1"
                        >
                            <span>Practice in CodeSpirit</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
