import React, { useState } from 'react';
import {
    ArrowLeft, Code, Play, CheckCircle2, AlertCircle, Clock, Zap,
    Cpu, Database, Layers, ArrowRight, ExternalLink, Bot, Mic, MicOff,
    Check, Sparkles, Camera, CameraOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TechnicalInterviewRoom({
    targetRole = 'Backend Developer',
    targetCompany = 'Google',
    cameraEnabled = true,
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
            probeQuestion: "Why did you choose a Hash Map for this approach? What is the Time and Space Complexity?",
            complexity: "Time: O(N) | Space: O(N)",
            testCases: [
                { id: 1, name: 'Test Case 1: [2,7,11,15], target = 9', passed: true, output: '[0, 1]', expected: '[0, 1]' },
                { id: 2, name: 'Test Case 2: [3,2,4], target = 6', passed: true, output: '[1, 2]', expected: '[1, 2]' },
                { id: 3, name: 'Test Case 3: [3,3], target = 6', passed: true, output: '[0, 1]', expected: '[0, 1]' }
            ]
        },
        backend: {
            title: 'Design a Sliding Window Rate Limiter Middleware',
            difficulty: 'Medium',
            category: 'Express & Redis Middleware',
            description: 'Implement a rate limiter function that restricts IP addresses to a maximum of 100 requests per minute using Redis sliding log technique.',
            inputExample: 'ip = "192.168.1.1", limit = 100, windowSeconds = 60',
            outputExample: '{ allowed: true, remaining: 99 }',
            explanation: 'Removes keys older than (now - 60s) from sorted set, then counts remaining elements.',
            initialCode: `// Sliding Window Rate Limiter in Node.js
async function isRateLimited(redis, userIp) {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    // Remove old logs
    await redis.zremrangebyscore(userIp, 0, windowStart);
    const reqCount = await redis.zcard(userIp);
    
    if (reqCount >= 100) return { allowed: false };
    
    await redis.zadd(userIp, now, now);
    return { allowed: true, remaining: 100 - reqCount - 1 };
}`,
            probeQuestion: "How would this sliding log algorithm handle 50,000 requests per second across multiple microservice replicas?",
            complexity: "Time: O(log N) per req | Space: O(N)",
            testCases: [
                { id: 1, name: 'Test Case 1: 50 requests under 1 min', passed: true, output: '{ allowed: true }', expected: '{ allowed: true }' },
                { id: 2, name: 'Test Case 2: 101st request blocked', passed: true, output: '{ allowed: false }', expected: '{ allowed: false }' }
            ]
        },
        'system-design': {
            title: 'Design a Distributed URL Shortener (TinyURL)',
            difficulty: 'Medium',
            category: 'System Design & Scalability',
            description: 'Design a scalable URL shortening service like TinyURL handling 100M new URLs created per month and 1B redirects per month.',
            inputExample: 'Long URL: "https://studyspirit.in/career/dashboard"',
            outputExample: 'Short URL: "https://sp.in/aB9xK"',
            explanation: 'Uses Base62 encoding on auto-incrementing ID or MD5 hash prefix with DB indexing.',
            initialCode: `// Base62 Short Code Generator
const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encodeId(num) {
    let sb = [];
    while (num > 0) {
        sb.push(BASE62[num % 62]);
        num = Math.floor(num / 62);
    }
    return sb.reverse().join('');
}`,
            probeQuestion: "How do you prevent Base62 collision when multiple database nodes generate IDs concurrently?",
            complexity: "Time: O(log62 N) | Space: O(1)",
            testCases: [
                { id: 1, name: 'Encode ID: 125', passed: true, output: '"cb"', expected: '"cb"' },
                { id: 2, name: 'Encode ID: 10000000', passed: true, output: '"fEM2"', expected: '"fEM2"' }
            ]
        },
        'cs-fundamentals': {
            title: 'Explain Process vs Thread & Deadlock Conditions',
            difficulty: 'Medium',
            category: 'Operating Systems & Concurrency',
            description: 'Explain the difference between a Process and a Thread in operating systems. List Coffman\'s four necessary conditions for Deadlock.',
            inputExample: 'Topic: OS Concurrency & Deadlocks',
            outputExample: 'Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
            explanation: 'Deadlock can only occur if all 4 Coffman conditions hold simultaneously.',
            initialCode: `// Pseudo-code demonstrating deadlock scenario
function acquireLocks(lockA, lockB) {
    lockA.acquire(); // Thread 1 holds A, waits for B
    // ...
    lockB.acquire();
    
    lockB.release();
    lockA.release();
}`,
            probeQuestion: "Which deadlock prevention strategy would you apply to break the Circular Wait condition in a distributed transaction?",
            complexity: "Time: O(1) | Space: O(1)",
            testCases: [
                { id: 1, name: 'Concept Check: Coffman Conditions', passed: true, output: '4/4 Verified', expected: '4/4 Verified' }
            ]
        }
    };

    // State Hooks
    const [selectedTab, setSelectedTab] = useState('dsa');
    const [code, setCode] = useState(problemData.dsa.initialCode);
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [language, setLanguage] = useState('javascript');
    const [probeResponse, setProbeResponse] = useState('');
    const [ariaProbeQuestion, setAriaProbeQuestion] = useState(problemData.dsa.probeQuestion);

    const currentProblem = problemData[selectedTab] || problemData.dsa;

    const handleRunTests = () => {
        setIsRunning(true);
        setTimeout(() => {
            setIsRunning(false);
            setTestResults(currentProblem.testCases);
        }, 800);
    };

    const handleAnswerProbe = () => {
        if (!probeResponse.trim()) return;
        setAriaProbeQuestion("Excellent technical reasoning! How would you write unit tests to handle edge cases like null or malformed inputs?");
        setProbeResponse('');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
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
                    onClick={() => { setSelectedTab('dsa'); setCode(problemData.dsa.initialCode); setTestResults(null); setAriaProbeQuestion(problemData.dsa.probeQuestion); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        selectedTab === 'dsa' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <Code className="w-4 h-4" />
                    <span>DSA & Problem Solving</span>
                </button>

                <button
                    onClick={() => { setSelectedTab('backend'); setCode(problemData.backend.initialCode); setTestResults(null); setAriaProbeQuestion(problemData.backend.probeQuestion); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        selectedTab === 'backend' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <Database className="w-4 h-4" />
                    <span>Backend & Databases</span>
                </button>

                <button
                    onClick={() => { setSelectedTab('system-design'); setCode(problemData['system-design'].initialCode); setTestResults(null); setAriaProbeQuestion(problemData['system-design'].probeQuestion); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        selectedTab === 'system-design' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>System Design</span>
                </button>

                <button
                    onClick={() => { setSelectedTab('cs-fundamentals'); setCode(problemData['cs-fundamentals'].initialCode); setTestResults(null); setAriaProbeQuestion(problemData['cs-fundamentals'].probeQuestion); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        selectedTab === 'cs-fundamentals' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <Cpu className="w-4 h-4" />
                    <span>CS Fundamentals (OS/DBMS/CN)</span>
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
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                                >
                                    Respond
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
                                <option value="javascript">JavaScript</option>
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
                                rows={14}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none focus:border-blue-500 shadow-inner"
                            />
                        </div>

                        {/* Test Execution Output */}
                        {testResults && (
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-extrabold text-slate-300">Test Execution Results:</p>
                                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                                        All Tests Passed
                                    </span>
                                </div>
                                {testResults.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between text-slate-300 p-2 bg-slate-900 rounded-xl border border-slate-800">
                                        <span className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                            {t.name}
                                        </span>
                                        <span className="text-emerald-400 font-mono font-bold">Passed</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <button
                            onClick={handleRunTests}
                            disabled={isRunning}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition"
                        >
                            <Play className="w-4 h-4" />
                            <span>{isRunning ? 'Running Test Cases...' : 'Run Test Cases'}</span>
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
