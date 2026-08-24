import React, { useState } from 'react';
import {
    BookOpen, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Lightbulb,
    Terminal, Play, Copy, Check, Shield, Layers, HelpCircle, Flame, Zap,
    Cpu, Code2, Globe, Database, FileCode, Clock, Award, Star, Info,
    XCircle, CheckCircle, Smartphone, Server, Cpu as CpuIcon
} from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function RichNotesRenderer({ moduleData, onStartQuiz }) {
    const [copiedSnippet, setCopiedSnippet] = useState(null);

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedSnippet(id);
        setTimeout(() => setCopiedSnippet(null), 2000);
    };

    if (!moduleData) return null;

    const isModule1 = moduleData.unit === 'Module 1' || moduleData.id === 'py-mod-1';
    const isModule2 = moduleData.unit === 'Module 2' || moduleData.id === 'py-mod-2';
    const isModule3 = moduleData.unit === 'Module 3' || moduleData.id === 'py-mod-3';

    return (
        <div className="max-w-6xl mx-auto space-y-8 font-sans text-slate-800 pb-12">
            
            {/* ======================================================== */}
            {/* HERO MODULE HEADER */}
            {/* ======================================================== */}
            <div className="relative bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl overflow-hidden text-white">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-[#ff5733] text-white px-3 py-1 rounded-full font-black tracking-wider uppercase">
                            {moduleData.courseCode} · {moduleData.unit}
                        </span>
                        <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold border border-slate-700">
                            ⏱️ {moduleData.readTime}
                        </span>
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Official Curriculum
                        </span>
                    </div>

                    <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                        {moduleData.title}
                    </h1>

                    {moduleData.goal && (
                        <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-2xl text-xs md:text-sm text-orange-300 font-semibold">
                            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{moduleData.goal}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ======================================================== */}
            {/* MODULE 1: COMPLETE ALL 14 SECTIONS + MINI PROJECT */}
            {/* ======================================================== */}
            {isModule1 && (
                <div className="space-y-8">
                    
                    {/* SECTION 1: Before You Write Code */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#ff5733] flex items-center justify-center font-black text-lg">
                                🧠
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    1. Before You Write Code: Think Like a Programmer
                                </h2>
                                <p className="text-xs text-slate-500">Programming is not primarily about remembering syntax.</p>
                            </div>
                        </div>

                        <div className="bg-orange-50 border border-orange-200/80 p-4 rounded-2xl text-xs text-orange-950 space-y-2">
                            <p className="font-bold text-sm">A programmer's real job is:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center font-black text-xs pt-1">
                                {['Understand', 'Break Down', 'Decide', 'Write Steps', 'Test', 'Improve'].map((step, idx) => (
                                    <div key={idx} className="bg-white border border-orange-300 p-2.5 rounded-xl text-[#ff5733] shadow-2xs">
                                        <span className="text-[10px] text-slate-400 block font-bold">0{idx + 1}</span>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Making Tea Analogy */}
                        <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Lightbulb className="w-4 h-4" /> Real-World Analogy: Making Tea
                                </span>
                                <span className="text-[10px] bg-slate-800 px-2.5 py-0.5 rounded text-slate-400 font-mono">Sequential Instructions</span>
                            </div>
                            <p className="text-xs text-slate-300">
                                A human understands <span className="text-white font-bold">"Make me a cup of tea."</span> A computer cannot. You must break it into exact instructions:
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-cyan-300 pt-1">
                                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Start</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Boil water</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Add tea</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Add milk</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Add sugar</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Mix & Serve</span>
                            </div>
                        </div>

                        {/* Mindset */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs space-y-2 text-amber-900">
                            <h4 className="font-extrabold flex items-center gap-2 text-amber-800 text-sm">
                                💡 Programmer's Mindset — Before writing code, ask:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium text-amber-900 pt-1">
                                <div>• What is the problem?</div>
                                <div>• What information do I have?</div>
                                <div>• What result do I want?</div>
                                <div>• What steps are required?</div>
                                <div className="sm:col-span-2">• In what order should those steps happen?</div>
                            </div>
                            <p className="font-bold text-amber-950 pt-2 border-t border-amber-200/80">
                                Programming = converting a problem into instructions a computer can execute.
                            </p>
                        </div>
                    </div>

                    {/* SECTION 2: What Is Programming? */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg">
                                📌
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    2. What Is Programming?
                                </h2>
                                <p className="text-xs text-slate-500">Creating a set of instructions that tells a computer what to do and how to do it.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-700">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">🧮 Calculate something</div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">💾 Store information</div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">📊 Process data</div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">⚖️ Make decisions</div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">🔁 Repeat tasks</div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">💬 Communicate with users</div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">🎛️ Control systems</div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">⚡ Automate work</div>
                        </div>

                        {/* Real World Example */}
                        <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                            <h4 className="font-bold text-orange-400 text-sm">Real-World Example: StudySpirit Average Marks</h4>
                            <p className="text-slate-300">
                                <span className="text-white font-bold">Human thinks:</span> Take marks → Add marks → Divide by number of subjects → Show average.
                                <br />
                                <span className="text-white font-bold">Programmer converts:</span> This clear thinking into executable code logic.
                            </p>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-900 space-y-1">
                            <h4 className="font-extrabold flex items-center gap-1.5 text-rose-800">
                                ⚠️ Important Rule:
                            </h4>
                            <p className="font-medium">
                                A computer does not understand your intention. It follows the exact instructions you provide. Good programming starts with clear thinking, not typing.
                            </p>
                        </div>
                    </div>

                    {/* SECTION 3: Why Was Python Created? */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg">
                                🐍
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    3. Why Was Python Created?
                                </h2>
                                <p className="text-xs text-slate-500">Created by Guido van Rossum (late 1980s, released 1991) at CWI Netherlands.</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            Before Python, programmers worked with languages that required complex, detailed syntax. Guido van Rossum wanted a language that emphasized:
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-emerald-950">
                            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">📖 Readability</div>
                            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">✨ Simplicity</div>
                            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">🚀 Productivity</div>
                            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">🎯 Clear Syntax</div>
                        </div>
                    </div>

                    {/* SECTION 4: History Timeline */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-lg">
                                🗓️
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    4. History of Python — Remember the Timeline
                                </h2>
                                <p className="text-xs text-slate-500">Influenced by ABC programming language at Centrum Wiskunde & Informatica.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-center font-medium">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <span className="font-black text-[#ff5733] text-sm">Late 1980s</span>
                                <p className="text-slate-800 font-bold mt-1">Development Begins</p>
                                <p className="text-[11px] text-slate-500">Guido van Rossum at CWI</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <span className="font-black text-[#ff5733] text-sm">1991</span>
                                <p className="text-slate-800 font-bold mt-1">First Public Release</p>
                                <p className="text-[11px] text-slate-500">Python 0.9.0 released</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <span className="font-black text-[#ff5733] text-sm">2000</span>
                                <p className="text-slate-800 font-bold mt-1">Python 2 Released</p>
                                <p className="text-[11px] text-slate-500">End of Life: Jan 1, 2020</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
                                <span className="font-black text-[#ff5733] text-sm">Modern</span>
                                <p className="text-slate-900 font-bold mt-1">Python 3.x Family</p>
                                <p className="text-[11px] text-orange-700 font-semibold">Active Modern Standard</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-5 text-xs flex items-center justify-between gap-4">
                            <div>
                                <span className="font-black text-amber-300 text-xs uppercase tracking-wider">⭐ EXAM POINT: MUST REMEMBER</span>
                                <p className="mt-1 font-semibold text-slate-200">
                                    • Creator: Guido van Rossum &nbsp;|&nbsp; • First Public Release: 1991 &nbsp;|&nbsp; • Modern Major Version: Python 3.x
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: Why Python? */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg">
                                ⭐
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    5. Why Python? Syntax Simplicity & Strengths
                                </h2>
                                <p className="text-xs text-slate-500">Allows programmers to express ideas with minimal boilerplate code.</p>
                            </div>
                        </div>

                        {/* Code Comparison */}
                        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-xs font-mono space-y-2">
                            <span className="text-slate-400 font-sans text-xs">Python syntax simplicity:</span>
                            <div className="p-3 bg-black rounded-xl text-emerald-400 font-bold border border-slate-800">
                                print("Hello")
                            </div>
                            <p className="text-slate-400 font-sans text-[11px]">The code is immediately readable without class declarations or main function wrappers.</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Python's 7 Major Strengths:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-semibold text-slate-700">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">📖 Readable & clean syntax</div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">🌱 Beginner-friendly starting point</div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">⚡ Productive with less code</div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">🌐 Versatile across domains</div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">📦 Large library ecosystem</div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">🖥️ Cross-platform compatibility</div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2 md:col-span-1">👥 Massive global community</div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900">
                            <p className="font-bold">⚠️ Python is not automatically the best language for everything:</p>
                            <ul className="mt-1 space-y-1 font-medium text-amber-850">
                                <li>• <strong>C</strong> is essential for system-level, kernel, and hardware control.</li>
                                <li>• <strong>Java</strong> is widely used in high-concurrency enterprise backends.</li>
                                <li>• <strong>Python</strong> dominates AI, Data Science, Automation, and Rapid Development.</li>
                            </ul>
                        </div>
                    </div>

                    {/* SECTION 6: Where Is Python Used? */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
                                🌐
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    6. Where Is Python Used Professionally?
                                </h2>
                                <p className="text-xs text-slate-500">Major industry application domains.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-1">
                                <h4 className="font-bold text-purple-900 text-sm">🤖 AI & Machine Learning</h4>
                                <p className="text-purple-800 text-[11px]">NumPy, Pandas, Scikit-learn, PyTorch, TensorFlow</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-1">
                                <h4 className="font-bold text-blue-900 text-sm">📊 Data Science</h4>
                                <p className="text-blue-800 text-[11px]">Collect → Clean → Analyze → Visualize → Insights</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
                                <h4 className="font-bold text-emerald-900 text-sm">🌐 Web Development</h4>
                                <p className="text-emerald-800 text-[11px]">Django, Flask, FastAPI</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 space-y-1">
                                <h4 className="font-bold text-orange-900 text-sm">⚙️ Automation & Scripting</h4>
                                <p className="text-orange-800 text-[11px]">File processing, Report generation, Web scraping</p>
                            </div>
                            <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 space-y-1 sm:col-span-2 md:col-span-2">
                                <h4 className="font-bold text-cyan-900 text-sm">🔬 Scientific Computing</h4>
                                <p className="text-cyan-800 text-[11px]">Academic research, Physics simulations, Mathematics</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 7: Python vs C vs Java */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-lg">
                                ⚔️
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    7. Python vs C vs Java Comparison Matrix
                                </h2>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-extrabold">
                                        <th className="p-3 rounded-l-xl">Feature</th>
                                        <th className="p-3 text-[#ff5733]">Python</th>
                                        <th className="p-3 text-blue-600">C</th>
                                        <th className="p-3 text-purple-600 rounded-r-xl">Java</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    <tr>
                                        <td className="p-3 font-bold text-slate-900">Level</td>
                                        <td className="p-3 text-slate-700 font-bold">High-level</td>
                                        <td className="p-3 text-slate-600">Lower-level control</td>
                                        <td className="p-3 text-slate-600">High-level</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-slate-900">Syntax</td>
                                        <td className="p-3 text-[#ff5733] font-black">Concise</td>
                                        <td className="p-3 text-slate-600">More detailed</td>
                                        <td className="p-3 text-slate-600">More verbose</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-slate-900">Memory</td>
                                        <td className="p-3 text-slate-700">Automatic</td>
                                        <td className="p-3 text-slate-600">Manual control</td>
                                        <td className="p-3 text-slate-600">Automatic (GC)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-slate-900">Execution</td>
                                        <td className="p-3 text-slate-700 font-bold">Runtime / PVM</td>
                                        <td className="p-3 text-slate-600">Compiled to native</td>
                                        <td className="p-3 text-slate-600">JVM-based</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-slate-900">Learning</td>
                                        <td className="p-3 text-emerald-600 font-bold">Beginner</td>
                                        <td className="p-3 text-slate-600">Moderate</td>
                                        <td className="p-3 text-slate-600">Moderate</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-slate-900">Main Strength</td>
                                        <td className="p-3 text-[#ff5733] font-black">Productivity & AI</td>
                                        <td className="p-3 text-blue-700 font-bold">System-level control</td>
                                        <td className="p-3 text-purple-700 font-bold">Enterprise</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 8, 9, 10, 11: Versions, Compiler/Interpreter, CPython */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <span>🔢</span> 8. Python Versions & End of Life
                            </h3>
                            <div className="space-y-2 text-xs">
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                                    <strong>Python 2:</strong> Reached End of Life on Jan 1, 2020.
                                </div>
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                                    <strong>Python 3:</strong> Modern standard (3.10, 3.11, 3.12, 3.13). Always use Python 3.
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <span>⚙️</span> 9. Interpreter vs Compiler
                            </h3>
                            <div className="space-y-2 text-xs text-slate-700">
                                <p><strong>Compiler:</strong> Translates full source code into machine code before execution.</p>
                                <p><strong>Interpreter:</strong> Executes instructions line-by-line via runtime process.</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 10 & 11: CPython & Bytecode */}
                    <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl space-y-6">
                        <div>
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Execution Architecture</span>
                            <h3 className="text-lg font-extrabold text-white mt-1">
                                🧩 10. The Python Trap & 11. What Is CPython?
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                CPython compiles source code into Bytecode (.pyc) first, then executes it via the Python Virtual Machine (PVM).
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
                                <span className="text-[10px] text-slate-400">Step 1</span>
                                <h4 className="font-bold text-white mt-0.5">Source Code (.py)</h4>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
                                <span className="text-[10px] text-orange-400">Step 2</span>
                                <h4 className="font-bold text-orange-400 mt-0.5">Bytecode (.pyc)</h4>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
                                <span className="text-[10px] text-purple-400">Step 3</span>
                                <h4 className="font-bold text-purple-300 mt-0.5">PVM Engine</h4>
                            </div>
                            <div className="bg-emerald-950 border border-emerald-800 p-4 rounded-2xl">
                                <span className="text-[10px] text-emerald-400">Step 4</span>
                                <h4 className="font-bold text-emerald-300 mt-0.5">Execution Output</h4>
                            </div>
                        </div>

                        <p className="text-xs text-slate-400">
                            <strong>CPython:</strong> Standard C-implemented Python engine. Other implementations: PyPy (JIT execution), Jython (Java platform), IronPython (.NET platform).
                        </p>
                    </div>

                    {/* SECTION 12, 13, 14: Running Python & Common Mistakes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
                            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                                🛠️ 12. Installing & Running
                            </h3>
                            <p className="text-xs text-slate-600">Verify version in terminal:</p>
                            <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl">
                                python --version
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
                            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                                ▶️ 13. Execution Flow
                            </h3>
                            <p className="text-xs text-slate-600">Python executes statements sequentially from top to bottom.</p>
                            <div className="p-3 bg-slate-900 text-cyan-300 font-mono text-[11px] rounded-xl">
                                print("Hello StudySpirit")
                            </div>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 space-y-2 text-xs text-rose-950">
                            <h3 className="text-sm font-extrabold text-rose-900 flex items-center gap-1.5">
                                ❌ 14. 4 Beginner Mistakes
                            </h3>
                            <ol className="list-decimal list-inside space-y-1 font-medium text-[11px]">
                                <li>Thinking programming = syntax</li>
                                <li>Memorizing code blindly</li>
                                <li>Not predicting expected output</li>
                                <li>Confusing language with CPython</li>
                            </ol>
                        </div>
                    </div>

                    {/* MINI PROJECT 1 CARD */}
                    <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 text-white shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#ff5733] text-white flex items-center justify-center font-black">
                                    🚀
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-black text-white">MINI PROJECT — Hello StudySpirit</h3>
                                    <p className="text-xs text-slate-400">Write your first complete Python script</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCopy(`print("================")\nprint("  STUDYSPIRIT")\nprint("================")\nprint("Welcome to Programming")\nprint("Start Coding Today!")`, 'm1')}
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 font-bold flex items-center gap-1.5"
                            >
                                {copiedSnippet === 'm1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedSnippet === 'm1' ? 'Copied' : 'Copy Code'}</span>
                            </button>
                        </div>

                        <div className="bg-black p-5 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 leading-relaxed shadow-inner">
                            <p className="text-slate-500 mb-2"># hello_studyspirit.py</p>
                            <p>print("==============================")</p>
                            <p>print("       STUDYSPIRIT")</p>
                            <p>print("==============================")</p>
                            <p>print("Welcome to Programming")</p>
                            <p>print("Learn Python Step by Step")</p>
                            <p>print("Start Coding Today!")</p>
                            <p>print("==============================")</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODULE 2: COMPLETE VARIABLES & OBJECTS */}
            {/* ======================================================== */}
            {isModule2 && (
                <div className="space-y-8">
                    {/* SECTION 1: What Is a Variable? */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg">
                                🧠
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    1. What Is a Variable?
                                </h2>
                                <p className="text-xs text-slate-500">A variable is a name that refers to a value/object in a Python program (a label, not a physical box).</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 font-mono text-xs space-y-4">
                            <div className="text-orange-400 font-bold text-xs uppercase tracking-wider">Memory Pointer Reference</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <span className="text-slate-400">Variable Name</span>
                                    <h4 className="text-white text-sm font-bold mt-1">name ───────→ "Abhishek"</h4>
                                    <p className="text-[10px] text-cyan-400 mt-1">str object in memory</p>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <span className="text-slate-400">Variable Name</span>
                                    <h4 className="text-white text-sm font-bold mt-1">age  ───────→ 21</h4>
                                    <p className="text-[10px] text-purple-400 mt-1">int object in memory</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-[11px] font-sans">In Python: Variable → Reference → Object.</p>
                        </div>
                    </div>

                    {/* SECTION 2 & 3: Dynamic Typing & Objects */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                📝 2. Dynamic Typing
                            </h3>
                            <p className="text-xs text-slate-600">Python determines the type automatically from the assigned object:</p>
                            <div className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-cyan-300 space-y-1">
                                <p>name = "Abhishek"  <span className="text-slate-500"># str</span></p>
                                <p>age = 21           <span className="text-slate-500"># int</span></p>
                                <p>marks = 85.5       <span className="text-slate-500"># float</span></p>
                                <p className="text-orange-400 mt-1">type(age)  <span className="text-slate-500"># &lt;class 'int'&gt;</span></p>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                🧩 3. Objects & Memory Attributes
                            </h3>
                            <p className="text-xs text-slate-600">Every object in Python has 3 core attributes:</p>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">Value (100)</div>
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">Type (int)</div>
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">Identity id(x)</div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4 & 5: Naming Rules & Keywords */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                            <span>🏷️</span> 4. Naming Rules & 5. Reserved Keywords
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-2">
                                <h4 className="font-extrabold text-emerald-900 flex items-center gap-1.5 text-sm">
                                    ✅ Valid Variable Names
                                </h4>
                                <ul className="space-y-1 font-mono text-emerald-800">
                                    <li>• name, age, student_name, _marks</li>
                                </ul>
                            </div>

                            <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl space-y-2">
                                <h4 className="font-extrabold text-rose-900 flex items-center gap-1.5 text-sm">
                                    ❌ Invalid Variable Names
                                </h4>
                                <ul className="space-y-1 font-mono text-rose-800">
                                    <li>• 2name (starts with number)</li>
                                    <li>• student-name (hyphen)</li>
                                    <li>• student name (space)</li>
                                    <li>• class (reserved keyword)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                            <strong className="text-slate-900">Python Reserved Keywords:</strong> if, else, for, while, def, class, return, import, True, False, None.
                            <div className="p-2 bg-slate-900 text-cyan-300 font-mono rounded-lg text-[11px] mt-1">
                                import keyword &nbsp;|&nbsp; print(keyword.kwlist)
                            </div>
                        </div>
                    </div>

                    {/* SECTION 6 & 7: Swapping & Equality */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Multiple Assignment</span>
                            <h3 className="text-base font-extrabold text-white">🔄 6. Swapping Variables</h3>
                            <div className="bg-black p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 space-y-1">
                                <p>name, age, marks = "Abhishek", 21, 85</p>
                                <p>a = b = c = 0</p>
                                <p className="text-orange-400 font-bold mt-2">a, b = b, a  # Swapped without temp var!</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Identity vs Value</span>
                            <h3 className="text-base font-extrabold text-white">🔍 7. == vs is Comparison</h3>
                            <div className="space-y-2 text-xs font-mono">
                                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                                    <span>[1, 2] == [1, 2]</span>
                                    <span className="text-emerald-400 font-bold">True (Value)</span>
                                </div>
                                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                                    <span>[1, 2] is [1, 2]</span>
                                    <span className="text-rose-400 font-bold">False (Identity)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MINI PROJECT 2 CARD */}
                    <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 text-white shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black">
                                    🚀
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-black text-white">MINI PROJECT — Student Information System</h3>
                                    <p className="text-xs text-slate-400">Store and display student profile using variables</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCopy(`student_name = "Abhishek"\nroll_number = 101\nage = 21\ncourse = "B.Tech CSE"\n\nprint(f"Name: {student_name}, Roll: {roll_number}")`, 'm2')}
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 font-bold flex items-center gap-1.5"
                            >
                                {copiedSnippet === 'm2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedSnippet === 'm2' ? 'Copied' : 'Copy Code'}</span>
                            </button>
                        </div>

                        <div className="bg-black p-5 rounded-2xl border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed shadow-inner">
                            <p>student_name = "Abhishek"</p>
                            <p>roll_number = 101</p>
                            <p>age = 21</p>
                            <p>course = "B.Tech CSE"</p>
                            <p>university = "LPU"</p>
                            <p>marks = 85</p>
                            <br />
                            <p className="text-emerald-400">print(f"Name       : {student_name}")</p>
                            <p className="text-emerald-400">print(f"Roll No.   : {roll_number}")</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODULE 3: COMPLETE DATA TYPES & COLLECTIONS */}
            {/* ======================================================== */}
            {isModule3 && (
                <div className="space-y-8">
                    {/* SECTION 1 & 2: Numbers & Special Types */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-lg">
                                🔢
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    1. What Is a Data Type? & 2. Numbers & Special Types
                                </h2>
                                <p className="text-xs text-slate-500">Defines what operations can be performed on a value.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                                <span className="font-black text-[#ff5733]">int</span>
                                <p className="text-[11px] text-slate-600">Whole numbers (21, -5)</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                                <span className="font-black text-blue-600">float</span>
                                <p className="text-[11px] text-slate-600">Decimals (99.50, -2.5)</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                                <span className="font-black text-purple-600">complex</span>
                                <p className="text-[11px] text-slate-600">Real + Imaginary (3 + 4j)</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                                <span className="font-black text-emerald-600">bool</span>
                                <p className="text-[11px] text-slate-600">True or False</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 col-span-2 sm:col-span-1">
                                <span className="font-black text-rose-600">None</span>
                                <p className="text-[11px] text-slate-600">Absence of value</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Strings */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
                        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            🔤 3. Strings (str) — Indexing, Slicing & Immutability
                        </h3>
                        <div className="bg-slate-900 text-white p-4 rounded-2xl font-mono text-xs space-y-2">
                            <p>word = "Python"</p>
                            <p className="text-cyan-300">word[0] ──→ 'P' (positive index) &nbsp;|&nbsp; word[-1] ──→ 'n' (negative index)</p>
                            <p className="text-orange-300">word[0:3] ──→ 'Pyt' (slicing)</p>
                            <p className="text-rose-400 font-bold">Strings are IMMUTABLE (word[0] = 'J' raises TypeError).</p>
                        </div>
                    </div>

                    {/* SECTION 4: Core Python Collections */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                            <span>📦</span> 4. Core Python Collections Comparison
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                            <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1.5 rounded-xl">LIST [ ] → Changeable</span>
                            <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl">TUPLE ( ) → Fixed</span>
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl">SET &#123; &#125; → Unique Elements</span>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl">DICT &#123;k:v&#125; → Labelled Pairs</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-extrabold">
                                        <th className="p-3 rounded-l-xl">Type</th>
                                        <th className="p-3">Ordered</th>
                                        <th className="p-3">Mutable</th>
                                        <th className="p-3">Duplicates</th>
                                        <th className="p-3 rounded-r-xl">Access Method</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    <tr>
                                        <td className="p-3 font-bold text-cyan-600">List [ ]</td>
                                        <td className="p-3 text-emerald-600 font-bold">Yes</td>
                                        <td className="p-3 text-emerald-600 font-bold">Yes</td>
                                        <td className="p-3 text-slate-600">Allows</td>
                                        <td className="p-3 text-slate-700 font-mono">Index [0]</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-purple-600">Tuple ( )</td>
                                        <td className="p-3 text-emerald-600 font-bold">Yes</td>
                                        <td className="p-3 text-rose-600 font-bold">No (Fixed)</td>
                                        <td className="p-3 text-slate-600">Allows</td>
                                        <td className="p-3 text-slate-700 font-mono">Index (0)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-amber-600">Set &#123; &#125;</td>
                                        <td className="p-3 text-slate-400">Unordered</td>
                                        <td className="p-3 text-emerald-600 font-bold">Yes</td>
                                        <td className="p-3 text-rose-600 font-bold">Unique Only</td>
                                        <td className="p-3 text-slate-500">No indexing</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-emerald-600">Dict &#123;k:v&#125;</td>
                                        <td className="p-3 text-emerald-600 font-bold">Yes</td>
                                        <td className="p-3 text-emerald-600 font-bold">Yes</td>
                                        <td className="p-3 text-slate-600">Unique Keys</td>
                                        <td className="p-3 text-slate-700 font-mono">Key ["name"]</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 5: Type Conversion & User Input */}
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-3 text-xs text-amber-900">
                        <h4 className="font-extrabold text-amber-800 text-sm flex items-center gap-2">
                            ⚠️ 5. Type Conversion & User Input Rule: input() ALWAYS Returns a String!
                        </h4>
                        <p className="font-medium leading-relaxed">
                            Even if the user types <span className="font-mono font-bold">21</span>, <span className="font-mono">input("Enter age: ")</span> returns string <span className="font-mono text-amber-950 font-bold">"21"</span>. Always convert using <span className="font-mono font-bold">int(input(...))</span>!
                        </p>
                    </div>

                    {/* MINI PROJECT 3 CARD */}
                    <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 text-white shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black">
                                    🚀
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-black text-white">MINI PROJECT — Student Registration Form</h3>
                                    <p className="text-xs text-slate-400">Combines input, type conversion, dicts & formatted output</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCopy(`name = input("Name: ")\nage = int(input("Age: "))\nsubjects = ["Python", "DBMS", "DSA"]`, 'm3')}
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 font-bold flex items-center gap-1.5"
                            >
                                {copiedSnippet === 'm3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedSnippet === 'm3' ? 'Copied' : 'Copy Code'}</span>
                            </button>
                        </div>

                        <div className="bg-black p-5 rounded-2xl border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed shadow-inner">
                            <p>name = input("Enter your name: ")</p>
                            <p>age = int(input("Enter your age: "))</p>
                            <p>subjects = ["Python", "DBMS", "DSA"]</p>
                            <br />
                            <p className="text-slate-400">student = &#123; "name": name, "age": age, "subjects": subjects &#125;</p>
                            <p className="text-emerald-400 mt-2">print(f"Name: &#123;student['name']&#125;, Age: &#123;student['age']&#125;")</p>
                        </div>
                    </div>
                </div>
            )}

            {/* FALLBACK FOR OTHER GENERAL NOTES */}
            {!isModule1 && !isModule2 && !isModule3 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-700 font-bold text-sm">
                        <BookOpen className="w-4 h-4 text-orange-500" />
                        <span>Curriculum Notes</span>
                    </div>
                    <div className="whitespace-pre-wrap font-sans text-xs md:text-sm text-slate-700 leading-relaxed">
                        {moduleData.fullNotes}
                    </div>
                </div>
            )}
        </div>
    );
}
