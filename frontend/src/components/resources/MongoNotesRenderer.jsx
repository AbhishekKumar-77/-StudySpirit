import React, { useState } from 'react';
import {
    BookOpen, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Lightbulb,
    Terminal, Play, Copy, Check, Shield, Layers, HelpCircle, Flame, Zap,
    Cpu, Code2, Globe, Database, FileCode, Clock, Award, Star, Info,
    XCircle, CheckCircle, Server, Network, BarChart3, Binary, Braces
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MongoNotesRenderer({ moduleData, onStartQuiz, onOpenCertificate }) {
    const [copiedSnippet, setCopiedSnippet] = useState(null);
    const [selectedTab, setSelectedTab] = useState('notes'); // 'notes', 'practicals', 'architecture'

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedSnippet(id);
        setTimeout(() => setCopiedSnippet(null), 2000);
    };

    if (!moduleData) return null;

    const modNum = moduleData.moduleNumber || 1;

    return (
        <div className="max-w-6xl mx-auto space-y-8 font-sans text-slate-800 pb-16">
            
            {/* ======================================================== */}
            {/* HERO MODULE HEADER */}
            {/* ======================================================== */}
            <div className="relative bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 md:p-8 border border-emerald-900/60 shadow-2xl overflow-hidden text-white">
                <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-emerald-600 text-white px-3 py-1 rounded-full font-black tracking-wider uppercase">
                            {moduleData.courseCode || 'INT252'} · {moduleData.unit || 'Unit I'}
                        </span>
                        <span className="bg-slate-800/90 text-emerald-300 px-3 py-1 rounded-full font-bold border border-slate-700">
                            ⏱️ {moduleData.readTime || '45 min read'}
                        </span>
                        <span className="bg-teal-950 text-teal-300 border border-teal-800 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 16 Hours Academic Curriculum
                        </span>
                    </div>

                    <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                        {moduleData.title}
                    </h1>

                    {moduleData.goal && (
                        <div className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-700/50 px-4 py-2 rounded-2xl text-xs md:text-sm text-emerald-200 font-semibold">
                            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{moduleData.goal}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ======================================================== */}
            {/* VISUAL ARCHITECTURE INTERACTIVE SHOWCASE */}
            {/* ======================================================== */}
            {modNum === 1 && (
                <div className="space-y-6">
                    {/* SQL vs NoSQL Comparison Card */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
                                ⚖️
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                    Visual Architecture: Relational (SQL) vs Document (NoSQL)
                                </h2>
                                <p className="text-xs text-slate-500">How data storage fundamentally differs between tables and hierarchical BSON collections</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* SQL Card */}
                            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                        <Database className="w-4 h-4 text-blue-600" /> Relational Database (SQL)
                                    </span>
                                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">Rigid DDL Schema</span>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    Data is normalized across multiple rigid tables. Accessing related information requires computationally expensive multi-table <code>JOIN</code> operations.
                                </p>
                                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed">
                                    <p className="text-blue-400">-- Multi-table relational query</p>
                                    <p><span className="text-purple-400">SELECT</span> s.name, e.grade</p>
                                    <p><span className="text-purple-400">FROM</span> students s</p>
                                    <p><span className="text-purple-400">JOIN</span> enrollments e <span className="text-purple-400">ON</span> s.id = e.student_id;</p>
                                </div>
                            </div>

                            {/* NoSQL Card */}
                            <div className="bg-emerald-50/60 border border-emerald-200 p-5 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                                    <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-emerald-600" /> Document Database (MongoDB)
                                    </span>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Dynamic BSON Documents</span>
                                </div>
                                <p className="text-emerald-900 leading-relaxed">
                                    Data that is accessed together is stored together. Documents contain nested subdocuments and arrays, retrieved in a single microsecond read.
                                </p>
                                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed">
                                    <p className="text-emerald-400">// Single document read with embedded data</p>
                                    <p>db.students.find(&#123; rollNo: <span className="text-amber-300">"ST101"</span> &#125;, &#123;</p>
                                    <p>&nbsp;&nbsp;name: 1, courses: 1, _id: 0</p>
                                    <p>&#125;);</p>
                                </div>
                            </div>
                        </div>

                        {/* CAP Theorem Visual */}
                        <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Network className="w-4 h-4" /> The CAP Theorem Matrix
                                </span>
                                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded font-mono font-bold">
                                    MongoDB = CP System
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                In the presence of an inevitable network partition <strong>(P)</strong> between distributed server nodes, a system must choose between guaranteeing immediate consistency <strong>(C)</strong> or high availability <strong>(A)</strong>. MongoDB prioritizes <strong>Consistency & Partition Tolerance (CP)</strong> to prevent dirty reads.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-1">
                                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                                    <strong className="text-emerald-400 block font-sans">Consistency (C)</strong>
                                    <span className="text-[11px] text-slate-400">All clients read the identical most recent write simultaneously.</span>
                                </div>
                                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                                    <strong className="text-blue-400 block font-sans">Availability (A)</strong>
                                    <span className="text-[11px] text-slate-400">Every non-failing request returns a response, even if stale.</span>
                                </div>
                                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                                    <strong className="text-amber-400 block font-sans">Partition Tolerance (P)</strong>
                                    <span className="text-[11px] text-slate-400">Cluster survives packet drops and network disconnects.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BSON & CRUD Visual (Module 4) */}
            {modNum === 4 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-lg">
                            <Binary className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                12-Byte ObjectId Internal Structure
                            </h2>
                            <p className="text-xs text-slate-500">How MongoDB ensures globally unique primary keys without central locking</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                            <span className="font-mono text-sm font-black text-blue-700 block">4 Bytes</span>
                            <strong className="text-xs text-blue-950 block mt-1">Unix Timestamp</strong>
                            <p className="text-[11px] text-blue-800 mt-1">Seconds since Jan 1, 1970. Enables natural chronologic ordering.</p>
                        </div>
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                            <span className="font-mono text-sm font-black text-emerald-700 block">5 Bytes</span>
                            <strong className="text-xs text-emerald-950 block mt-1">Random Machine/Process ID</strong>
                            <p className="text-[11px] text-emerald-800 mt-1">Unique identifier generated per host and server process.</p>
                        </div>
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                            <span className="font-mono text-sm font-black text-amber-700 block">3 Bytes</span>
                            <strong className="text-xs text-amber-950 block mt-1">Incrementing Counter</strong>
                            <p className="text-[11px] text-amber-800 mt-1">Monotonically increasing sequence initialized to random value.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Aggregation Pipeline Visual (Module 9) */}
            {modNum === 9 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                                Aggregation Pipeline Stage Flow
                            </h2>
                            <p className="text-xs text-slate-500">Assembly-line transformation of documents through analytical pipeline stages</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs font-bold text-white">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-xs text-center min-w-[120px]">
                            <span>$match</span>
                            <span className="text-[9px] block text-blue-100 font-sans">Filter records</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="p-3 bg-purple-600 rounded-xl shadow-xs text-center min-w-[120px]">
                            <span>$group</span>
                            <span className="text-[9px] block text-purple-100 font-sans">Aggregate & metrics</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="p-3 bg-amber-600 rounded-xl shadow-xs text-center min-w-[120px]">
                            <span>$sort</span>
                            <span className="text-[9px] block text-amber-100 font-sans">Rank output</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="p-3 bg-emerald-600 rounded-xl shadow-xs text-center min-w-[120px]">
                            <span>$project</span>
                            <span className="text-[9px] block text-emerald-100 font-sans">Shape schema</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* FULL MODULE TEXTBOOK NOTES (MARKDOWN RENDERED) */}
            {/* ======================================================== */}
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 text-slate-700">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span className="font-extrabold text-slate-900 text-sm">Official Academic Notes & Code Walkthrough</span>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                        INT252 Curriculum
                    </span>
                </div>

                {/* Markdown Notes Body */}
                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-lg prose-h3:text-base prose-code:text-emerald-700 prose-pre:bg-slate-900 prose-pre:text-slate-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {moduleData.fullNotes}
                    </ReactMarkdown>
                </div>
            </div>

            {/* ======================================================== */}
            {/* BOTTOM INTERACTIVE ACTION BAR */}
            {/* ======================================================== */}
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xl shrink-0">
                        🏆
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-white">
                            Ready to assess your mastery of {moduleData.unit}?
                        </h3>
                        <p className="text-xs text-slate-400">
                            Take the module practice quiz or complete the 16-Hour Final Assessment to generate your certificate.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {onStartQuiz && (
                        <button
                            onClick={onStartQuiz}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md transition"
                        >
                            <Zap className="w-4 h-4 fill-white" />
                            <span>Take Quiz</span>
                        </button>
                    )}

                    {onOpenCertificate && (
                        <button
                            onClick={onOpenCertificate}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md transition"
                        >
                            <Award className="w-4 h-4" />
                            <span>Claim Certificate</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
