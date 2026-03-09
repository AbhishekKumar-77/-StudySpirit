import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, FileCheck, ClipboardCheck, Code, Clock, Users, Trophy,
    PlusCircle, Search, Filter, ChevronRight, Calendar, Shield,
    Star, Zap, BookOpen, BarChart3, Lock, Unlock
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Exams() {
    const navigate = useNavigate();
    const { user } = useApp();
    const [activeTab, setActiveTab] = useState("upcoming");

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
            {/* Navbar */}
            <nav className="border-b border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-xl font-bold flex items-center gap-2">
                        <FileCheck className="text-red-500" />
                        Exams <span className="opacity-50 font-normal hidden sm:inline">| Assessment Center</span>
                    </div>
                </div>

                <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-color)]">
                    {['upcoming', 'live', 'history'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all capitalize flex items-center gap-2 ${activeTab === tab
                                    ? 'bg-red-500 text-white shadow'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {tab === 'upcoming' && <Calendar size={14} />}
                            {tab === 'live' && <Zap size={14} />}
                            {tab === 'history' && <BarChart3 size={14} />}
                            {tab}
                        </button>
                    ))}
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-6">

                {/* Hero Section */}
                <div className="mb-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-8">
                    <div className="flex items-center gap-5 flex-wrap">
                        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center">
                            <FileCheck className="text-red-500" size={32} />
                        </div>
                        <div className="flex-1 min-w-[250px]">
                            <h1 className="text-3xl font-black mb-2">Exam Center</h1>
                            <p className="text-[var(--text-secondary)]">Take quiz exams and coding exams created by your teachers. Proctored, timed, and auto-graded.</p>
                        </div>
                    </div>
                </div>

                {/* Exam Type Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    {/* Quiz Exam Card */}
                    <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-amber-500/50 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center">
                                <ClipboardCheck className="text-amber-500" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Quiz Exam</h3>
                                <p className="text-sm text-[var(--text-muted)]">MCQs, True/False, Short Answer</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold">Auto-graded</span>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold">Timed</span>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold">Teacher Created</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">Theory-based exams with multiple question types. Results are instant with detailed analytics.</p>
                    </div>

                    {/* Coding Exam Card */}
                    <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-cyan-500/50 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-cyan-500/15 rounded-xl flex items-center justify-center">
                                <Code className="text-cyan-500" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Coding Exam</h3>
                                <p className="text-sm text-[var(--text-muted)]">Solve problems, auto-verified with test cases</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-500 text-xs font-bold">Real Execution</span>
                            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-500 text-xs font-bold">Test Cases</span>
                            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-500 text-xs font-bold">Multi-language</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">Code is executed and verified against test cases in real-time. Supports Python, C, C++, Java, JavaScript.</p>
                    </div>
                </div>

                {/* Join Exam Section */}
                <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Unlock size={18} className="text-emerald-500" /> Join an Exam</h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Enter exam code from your teacher..."
                            className="flex-1 px-5 py-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-red-500 font-mono text-lg tracking-widest uppercase"
                        />
                        <button className="bg-red-500 hover:bg-red-400 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-red-500/25 flex items-center gap-2">
                            <Zap size={18} /> Join
                        </button>
                    </div>
                </div>

                {/* Empty State */}
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-16 text-center">
                    <div className="w-20 h-20 bg-[var(--border-color)] rounded-full flex items-center justify-center mx-auto mb-5 opacity-40">
                        <FileCheck size={36} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Exams Yet</h3>
                    <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">
                        {activeTab === 'upcoming'
                            ? 'No upcoming exams scheduled. Your teacher will share an exam code when one is available.'
                            : activeTab === 'live'
                                ? 'No live exams right now. Check back during exam time or enter an exam code above.'
                                : 'No past exams found. Your exam history will appear here after you take your first exam.'}
                    </p>
                    <div className="flex items-center justify-center gap-3 text-sm text-[var(--text-muted)]">
                        <Shield size={14} /> <span>Exams are proctored, timed, and auto-graded</span>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                    <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-5">
                        <Clock size={20} className="text-amber-500 mb-3" />
                        <h4 className="font-bold text-sm mb-1">Timed Exams</h4>
                        <p className="text-xs text-[var(--text-muted)]">Each exam has a time limit. Timer starts when you begin and auto-submits when time runs out.</p>
                    </div>
                    <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-5">
                        <Shield size={20} className="text-red-500 mb-3" />
                        <h4 className="font-bold text-sm mb-1">Proctored</h4>
                        <p className="text-xs text-[var(--text-muted)]">Tab-switch detection, full-screen mode, and copy-paste restrictions to ensure fair exams.</p>
                    </div>
                    <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-5">
                        <BarChart3 size={20} className="text-emerald-500 mb-3" />
                        <h4 className="font-bold text-sm mb-1">Instant Results</h4>
                        <p className="text-xs text-[var(--text-muted)]">Auto-graded with detailed analytics. See your score, rank, and question-wise breakdown instantly.</p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .max-w-6xl > * { animation: fade-in 0.4s ease-out; }
            `}</style>
        </div>
    );
}
