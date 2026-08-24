import React, { useState } from 'react';
import {
    BookOpen, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Lightbulb,
    Terminal, Play, Copy, Check, Shield, Layers, HelpCircle, Flame, Zap,
    Cpu, Code2, Globe, Database, FileCode, Clock, Award, Star
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
        <div className="max-w-6xl mx-auto space-y-8 font-sans text-slate-800 pb-10">
            {/* Header Hero Banner */}
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
            {/* MODULE 1: INTRODUCTION TO PROGRAMMING */}
            {/* ======================================================== */}
            {isModule1 && (
                <div className="space-y-8">
                    {/* Section 1: Before You Write Code */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#ff5733] flex items-center justify-center font-black text-lg">
                                🧠
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    1. Before You Write Code: Think Like a Programmer
                                </h2>
                                <p className="text-xs text-slate-500">Programming is not about memorizing syntax—it's about problem-solving logic.</p>
                            </div>
                        </div>

                        {/* Workflow Pipeline */}
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-extrabold">
                            {['Understand', 'Break Down', 'Decide', 'Write Steps', 'Test', 'Improve'].map((step, idx) => (
                                <div key={idx} className="bg-orange-50/80 border border-orange-200/80 p-3 rounded-2xl text-[#ff5733] flex flex-col items-center justify-center gap-1 shadow-2xs">
                                    <span className="text-[10px] text-orange-400 font-black">Step {idx + 1}</span>
                                    <span>{step}</span>
                                </div>
                            ))}
                        </div>

                        {/* Making Tea Real-world Analogy */}
                        <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Lightbulb className="w-4 h-4" /> Real-World Analogy: Making Tea
                                </span>
                                <span className="text-[10px] bg-slate-800 px-2.5 py-0.5 rounded text-slate-400 font-mono">Sequential Instructions</span>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-300">
                                A human understands: <span className="text-white font-bold">"Make me a cup of tea."</span> A computer cannot. You must provide exact sequential steps:
                            </p>
                            
                            {/* Step Flowchart */}
                            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-cyan-300 pt-1">
                                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Start</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Boil Water</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Add Tea & Milk</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Add Sugar</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">Mix & Serve</span>
                            </div>
                        </div>

                        {/* Mindset Callout */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs space-y-2 text-amber-900">
                            <h4 className="font-extrabold flex items-center gap-2 text-amber-800 text-sm">
                                💡 Programmer's Mindset Questions:
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-amber-800 font-medium">
                                <li>• What is the problem?</li>
                                <li>• What information do I have?</li>
                                <li>• What result do I want?</li>
                                <li>• In what order should steps happen?</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 2 & 3: What is Programming & Why Python */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <span className="text-lg">📌</span> What Is Programming?
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Creating instructions that tell a computer what to do and how to do it.
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">🧮 Calculate values</div>
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">💾 Store information</div>
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">⚖️ Make decisions</div>
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">⚡ Automate tasks</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <span className="text-lg">🐍</span> Why Was Python Created?
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Guido van Rossum created Python (1989-1991) to emphasize readability, simplicity, and clear syntax.
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-purple-900">
                                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">Readable & Simple</div>
                                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">Beginner Friendly</div>
                                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">Productive Syntax</div>
                                <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">Huge Ecosystem</div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: History & Timeline */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                            <span>🗓️</span> 4. History of Python Timeline
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                                <span className="text-xs font-black text-[#ff5733]">Late 1980s</span>
                                <h4 className="text-xs font-bold text-slate-800 mt-1">Guido van Rossum</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">Began development at CWI</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                                <span className="text-xs font-black text-[#ff5733]">1991</span>
                                <h4 className="text-xs font-bold text-slate-800 mt-1">First Public Release</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">Python 0.9.0 released</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                                <span className="text-xs font-black text-[#ff5733]">2000</span>
                                <h4 className="text-xs font-bold text-slate-800 mt-1">Python 2 Family</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">Reached End-of-Life 2020</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl">
                                <span className="text-xs font-black text-[#ff5733]">Modern</span>
                                <h4 className="text-xs font-bold text-slate-900 mt-1">Python 3.x Family</h4>
                                <p className="text-[11px] text-orange-700 mt-0.5">Current active standard</p>
                            </div>
                        </div>

                        {/* Exam Point Box */}
                        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-5 text-xs flex items-center justify-between gap-4 shadow-md">
                            <div>
                                <span className="font-black text-amber-300 text-xs uppercase tracking-wider">⭐ EXAM POINT REVISION</span>
                                <p className="mt-1 font-semibold text-slate-200">
                                    Creator: Guido van Rossum · First Release: 1991 · Modern Version: Python 3.x
                                </p>
                            </div>
                            <span className="bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs shrink-0">
                                Important!
                            </span>
                        </div>
                    </div>

                    {/* Section 7: Python vs C vs Java Table */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                            <span>⚔️</span> 7. Language Comparison: Python vs C vs Java
                        </h3>
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
                                        <td className="p-3 font-bold text-slate-900">Syntax</td>
                                        <td className="p-3 text-slate-700 font-bold">Concise & Clear</td>
                                        <td className="p-3 text-slate-600">Detailed</td>
                                        <td className="p-3 text-slate-600">Verbose</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-slate-900">Memory</td>
                                        <td className="p-3 text-slate-700">Automatic Garbage Collection</td>
                                        <td className="p-3 text-slate-600">Manual Control</td>
                                        <td className="p-3 text-slate-600">Automatic (JVM)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-slate-900">Execution</td>
                                        <td className="p-3 text-slate-700 font-bold">CPython Bytecode / PVM</td>
                                        <td className="p-3 text-slate-600">Compiled Native Code</td>
                                        <td className="p-3 text-slate-600">JVM Bytecode</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-bold text-slate-900">Main Strength</td>
                                        <td className="p-3 text-[#ff5733] font-black">AI, Data Science, Scripting</td>
                                        <td className="p-3 text-blue-700 font-bold">System Programming</td>
                                        <td className="p-3 text-purple-700 font-bold">Enterprise Software</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 10: CPython Bytecode Pipeline */}
                    <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl space-y-6">
                        <div>
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">CPython Execution Model</span>
                            <h3 className="text-lg font-extrabold text-white mt-1">
                                🧩 10. The Python Trap: "Python Is Only Interpreted"
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                CPython first compiles source code into Bytecode (.pyc) before executing it via the Python Virtual Machine (PVM).
                            </p>
                        </div>

                        {/* Interactive Execution Pipeline */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
                                <span className="text-[10px] text-slate-400 font-bold">Step 1</span>
                                <h4 className="font-extrabold text-white mt-0.5">Source Code</h4>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">hello.py</p>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
                                <span className="text-[10px] text-orange-400 font-bold">Step 2</span>
                                <h4 className="font-extrabold text-orange-400 mt-0.5">Compilation</h4>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">Bytecode (.pyc)</p>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
                                <span className="text-[10px] text-purple-400 font-bold">Step 3</span>
                                <h4 className="font-extrabold text-purple-300 mt-0.5">PVM</h4>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">Virtual Machine</p>
                            </div>
                            <div className="bg-emerald-950 border border-emerald-800 p-4 rounded-2xl">
                                <span className="text-[10px] text-emerald-400 font-bold">Step 4</span>
                                <h4 className="font-extrabold text-emerald-300 mt-0.5">Execution</h4>
                                <p className="text-[10px] text-emerald-400 font-mono mt-1">Machine Output</p>
                            </div>
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

                        {/* Terminal Code Box */}
                        <div className="bg-black p-5 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 leading-relaxed shadow-inner">
                            <p className="text-slate-500 mb-2"># hello_studyspirit.py</p>
                            <p>print("================================")</p>
                            <p>print("       STUDYSPIRIT")</p>
                            <p>print("================================")</p>
                            <p>print("Welcome to Programming")</p>
                            <p>print("Learn Python Step by Step")</p>
                            <p>print("Start Coding Today!")</p>
                            <p>print("================================")</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODULE 2: VARIABLES & MEMORY MODEL */}
            {/* ======================================================== */}
            {isModule2 && (
                <div className="space-y-8">
                    {/* Section 1: Memory Model Card */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-lg">
                                🧠
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    1. What Is a Variable in Python?
                                </h2>
                                <p className="text-xs text-slate-500">A variable is a name/label that refers to an object in memory—not a physical box!</p>
                            </div>
                        </div>

                        {/* Reference Diagram */}
                        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 font-mono text-xs space-y-4">
                            <div className="text-orange-400 font-bold text-xs uppercase tracking-wider">Memory Reference Model</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <span className="text-slate-400">Variable Name</span>
                                    <h4 className="text-white text-sm font-bold mt-1">name ──→ "Abhishek"</h4>
                                    <p className="text-[10px] text-cyan-400 mt-1">Refers to String Object</p>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <span className="text-slate-400">Variable Name</span>
                                    <h4 className="text-white text-sm font-bold mt-1">age ──────→ 21</h4>
                                    <p className="text-[10px] text-purple-400 mt-1">Refers to Integer Object</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Variable Naming Rules */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                            <span>🏷️</span> 4. Variable Naming Rules & Conventions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-2">
                                <h4 className="font-extrabold text-emerald-900 flex items-center gap-1.5 text-sm">
                                    ✅ Valid Variable Names
                                </h4>
                                <ul className="space-y-1 font-mono text-emerald-800">
                                    <li>• student_name = "Rahul"</li>
                                    <li>• age = 21</li>
                                    <li>• _marks = 95</li>
                                    <li>• roll_number_101 = True</li>
                                </ul>
                            </div>

                            <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl space-y-2">
                                <h4 className="font-extrabold text-rose-900 flex items-center gap-1.5 text-sm">
                                    ❌ Invalid Variable Names
                                </h4>
                                <ul className="space-y-1 font-mono text-rose-800">
                                    <li>• 2name = "Rahul" <span className="text-slate-500 font-sans text-[10px]">(Starts with number)</span></li>
                                    <li>• student-name = "Rahul" <span className="text-slate-500 font-sans text-[10px]">(Contains hyphen)</span></li>
                                    <li>• student name = "Rahul" <span className="text-slate-500 font-sans text-[10px]">(Contains space)</span></li>
                                    <li>• class = "CSE" <span className="text-slate-500 font-sans text-[10px]">(Python keyword)</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Swapping & Equality (== vs is) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Tuple Unpacking</span>
                            <h3 className="text-base font-extrabold text-white">🔄 Swapping Variables (No Temp Var)</h3>
                            <div className="bg-black p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300">
                                <p>a = 10</p>
                                <p>b = 20</p>
                                <p className="text-orange-400 font-bold mt-1">a, b = b, a  # Swapped!</p>
                                <p className="text-slate-500 mt-1"># Now a = 20, b = 10</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
                            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Comparison Operators</span>
                            <h3 className="text-base font-extrabold text-white">🔍 Value vs Identity (== vs is)</h3>
                            <div className="space-y-2 text-xs font-mono">
                                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                                    <span>[1, 2] == [1, 2]</span>
                                    <span className="text-emerald-400 font-bold">True (Same Value)</span>
                                </div>
                                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                                    <span>[1, 2] is [1, 2]</span>
                                    <span className="text-rose-400 font-bold">False (Different Objects)</span>
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
            {/* MODULE 3: DATA TYPES & COLLECTIONS */}
            {/* ======================================================== */}
            {isModule3 && (
                <div className="space-y-8">
                    {/* Data Types Grid */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-lg">
                                🔢
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    1. Python Core Data Types Overview
                                </h2>
                                <p className="text-xs text-slate-500">Every object in Python belongs to a specific data type defining its behavior.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
                        </div>
                    </div>

                    {/* Python Collections Matrix */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                            <span>📦</span> 4. Core Python Collections Comparison Matrix
                        </h3>

                        {/* Memory Tricks Pills */}
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

                    {/* Input Warning Alert */}
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-2 text-xs text-amber-900">
                        <h4 className="font-extrabold text-amber-800 text-sm flex items-center gap-2">
                            ⚠️ Common Trap: input() ALWAYS Returns a String!
                        </h4>
                        <p className="font-medium leading-relaxed">
                            Even if the student types <span className="font-bold font-mono">21</span>, <span className="font-mono">input("Enter age: ")</span> produces string <span className="font-mono text-amber-950 font-bold">"21"</span>. Always convert using <span className="font-mono font-bold">int(input(...))</span> or <span className="font-mono font-bold">float(input(...))</span>!
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
        </div>
    );
}
