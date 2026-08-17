import React, { useState } from 'react';
import {
    ArrowLeft, Code, Play, CheckCircle2, AlertCircle, Clock, Zap,
    Cpu, Database, Layers, ArrowRight, ExternalLink, Bot, Mic, MicOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TechnicalInterviewRoom({
    targetRole = 'Backend Developer',
    targetCompany = 'Google',
    onEndInterview,
    onBack
}) {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('dsa'); // 'dsa', 'backend', 'system-design', 'cs-fundamentals'
    const [language, setLanguage] = useState('javascript');
    
    // DSA Code State
    const [code, setCode] = useState(`// Function to find two numbers that sum up to target
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
}`);

    const [testResults, setTestResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [probeResponse, setProbeResponse] = useState('');
    const [ariaProbeQuestion, setAriaProbeQuestion] = useState(
        "Why did you choose a Hash Map for this approach? What is the Time and Space Complexity?"
    );

    const handleRunTests = () => {
        setIsRunning(true);
        setTimeout(() => {
            setIsRunning(false);
            setTestResults([
                { id: 1, name: 'Test Case 1: [2,7,11,15], target = 9', passed: true, output: '[0, 1]', expected: '[0, 1]' },
                { id: 2, name: 'Test Case 2: [3,2,4], target = 6', passed: true, output: '[1, 2]', expected: '[1, 2]' },
                { id: 3, name: 'Test Case 3: [3,3], target = 6', passed: true, output: '[0, 1]', expected: '[0, 1]' }
            ]);
        }, 1200);
    };

    const handleAnswerProbe = () => {
        if (!probeResponse.trim()) return;
        setAriaProbeQuestion("Excellent explanation! O(n) time and O(n) space. How would your code handle 10 million incoming elements at scale?");
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
                            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">Technical Interview</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-sm font-bold text-white">{targetRole} · {targetCompany}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
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
            <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex items-center gap-3">
                <button
                    onClick={() => setSelectedTab('dsa')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        selectedTab === 'dsa' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <Code className="w-4 h-4" />
                    <span>DSA & Problem Solving</span>
                </button>

                <button
                    onClick={() => setSelectedTab('backend')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        selectedTab === 'backend' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <Database className="w-4 h-4" />
                    <span>Backend & Databases</span>
                </button>

                <button
                    onClick={() => setSelectedTab('system-design')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        selectedTab === 'system-design' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>System Design</span>
                </button>

                <button
                    onClick={() => setSelectedTab('cs-fundamentals')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        selectedTab === 'cs-fundamentals' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                >
                    <Cpu className="w-4 h-4" />
                    <span>CS Fundamentals (OS/DBMS/CN)</span>
                </button>
            </div>

            {/* Main Workspace */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel: Problem Statement & Aria Probe Question */}
                <div className="flex flex-col gap-4">
                    {/* Problem Description */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                                    Easy • Two Sum
                                </span>
                                <span className="text-xs text-slate-400">Arrays & Hash Table</span>
                            </div>

                            <h2 className="text-lg font-bold text-white mb-2">Two Sum - Index Search</h2>
                            <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                Given an array of integers <code className="text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded">nums</code> and an integer <code className="text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded">target</code>, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.
                            </p>

                            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs font-mono space-y-1 mb-4">
                                <p className="text-slate-400"><strong className="text-slate-200">Input:</strong> nums = [2,7,11,15], target = 9</p>
                                <p className="text-slate-400"><strong className="text-slate-200">Output:</strong> [0,1]</p>
                                <p className="text-slate-400"><strong className="text-slate-200">Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</p>
                            </div>
                        </div>

                        {/* Aria AI Follow-up Probe Box */}
                        <div className="bg-purple-950/40 border border-purple-800/50 rounded-2xl p-4 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Bot className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold text-purple-300">Aria Technical Follow-up</span>
                            </div>

                            <p className="text-xs text-slate-200 font-medium mb-3">
                                "{ariaProbeQuestion}"
                            </p>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={probeResponse}
                                    onChange={(e) => setProbeResponse(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnswerProbe()}
                                    placeholder="Explain your complexity approach..."
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
                                <span className="text-xs font-bold text-slate-200">Code Editor</span>
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

                        {/* Textarea Code Editor */}
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
                                <p className="font-extrabold text-slate-300 mb-2">Test Execution Results:</p>
                                {testResults.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between text-slate-300">
                                        <span className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                            {t.name}
                                        </span>
                                        <span className="text-emerald-400 font-bold">Passed</span>
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
                            <span>Practice Weak Graph Concepts in CodeSpirit</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
