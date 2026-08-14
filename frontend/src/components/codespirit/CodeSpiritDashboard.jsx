import React from 'react';
import { 
    Flame, Shield, Clock, Target, CheckCircle2, ArrowRight, Zap, 
    Sparkles, ChevronRight, Layers, Award, Terminal, Code2, Play, 
    BookOpen, BarChart3, TrendingUp, AlertCircle, CheckCircle, Trophy 
} from 'lucide-react';

export default function CodeSpiritDashboard({ 
    dashboardData, 
    selectedSubject, 
    setSelectedSubject, 
    onStartPractice, 
    onSolveChallenge, 
    onOpenProblem, 
    setActiveTab 
}) {
    const stats = dashboardData?.stats || {
        problemsSolved: 428,
        problemsSolvedWeeklyDelta: "+34 this week",
        accuracy: 74,
        accuracyWeeklyDelta: "+6% this week",
        codingMastery: 68,
        codingMasteryStatus: "Improving",
        timeSpent: "56h 20m",
        timeSpentWeeklyDelta: "+8h this week",
        currentStreak: 12,
        bestStreak: 31,
        rating: 1428
    };

    const subjectStats = dashboardData?.subjectStats || {
        python: { mastery: 82, solved: 42, total: 50 },
        c: { mastery: 74, solved: 36, total: 48 },
        cpp: { mastery: 71, solved: 58, total: 80 },
        java: { mastery: 58, solved: 29, total: 50 },
        javascript: { mastery: 46, solved: 24, total: 52 },
        dsa: { mastery: 64, solved: 71, total: 110 },
        sql: { mastery: 69, solved: 18, total: 26 }
    };

    const subjectsList = [
        { id: 'python', name: 'Python', icon: '🐍', color: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
        { id: 'c', name: 'C', icon: '⚡', color: '#6366f1', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600' },
        { id: 'cpp', name: 'C++', icon: '🔷', color: '#2563eb', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' },
        { id: 'java', name: 'Java', icon: '☕', color: '#ea580c', bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600' },
        { id: 'javascript', name: 'JavaScript', icon: '🟨', color: '#eab308', bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-700' },
        { id: 'dsa', name: 'DSA', icon: '🌳', color: '#8b5cf6', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600' },
        { id: 'sql', name: 'SQL', icon: '🗄️', color: '#0284c7', bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-600' }
    ];

    const continueLearningList = dashboardData?.continueLearning || [
        { id: '1', topic: 'Binary Search', difficulty: 'Medium', solved: 12, total: 20, progress: 60, subject: 'dsa', iconColor: 'text-purple-500 bg-purple-50' },
        { id: '2', topic: 'Trees', difficulty: 'Hard', solved: 8, total: 20, progress: 40, subject: 'dsa', iconColor: 'text-emerald-500 bg-emerald-50' },
        { id: '3', topic: 'Dynamic Programming', difficulty: 'Hard', solved: 4, total: 20, progress: 20, subject: 'dsa', iconColor: 'text-rose-500 bg-rose-50' },
        { id: '4', topic: 'Hashing', difficulty: 'Medium', solved: 10, total: 20, progress: 50, subject: 'python', iconColor: 'text-blue-500 bg-blue-50' }
    ];

    const recommendedList = dashboardData?.recommendedProblems || [
        { id: 'rec_1', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', matchScore: 92, subject: 'python' },
        { id: 'rec_2', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', matchScore: 94, subject: 'python' },
        { id: 'rec_3', title: 'Merge Intervals', difficulty: 'Medium', topic: 'Arrays', matchScore: 89, subject: 'cpp' },
        { id: 'rec_4', title: 'Kth Largest Element', difficulty: 'Medium', topic: 'Heap', matchScore: 91, subject: 'java' },
        { id: 'rec_5', title: 'Clone Graph', difficulty: 'Hard', topic: 'Graphs', matchScore: 75, subject: 'dsa' }
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* ================= 1. TOP STATISTICS (5 Cards with Sparklines) ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Problems Solved */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Problems Solved</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Layers size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.problemsSolved}</div>
                    <div className="flex items-center gap-1 mt-1 text-xs font-medium text-emerald-600">
                        <TrendingUp size={13} />
                        <span>{stats.problemsSolvedWeeklyDelta}</span>
                    </div>
                    {/* SVG Sparkline */}
                    <div className="mt-3">
                        <svg className="w-full h-8 stroke-purple-500 fill-none" viewBox="0 0 100 25">
                            <path d="M0,20 Q20,15 40,18 T80,8 T100,5" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                {/* Accuracy */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Accuracy</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Target size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.accuracy}%</div>
                    <div className="flex items-center gap-1 mt-1 text-xs font-medium text-emerald-600">
                        <TrendingUp size={13} />
                        <span>{stats.accuracyWeeklyDelta}</span>
                    </div>
                    {/* SVG Sparkline */}
                    <div className="mt-3">
                        <svg className="w-full h-8 stroke-emerald-500 fill-none" viewBox="0 0 100 25">
                            <path d="M0,22 Q25,18 50,12 T80,10 T100,4" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                {/* Coding Mastery */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coding Mastery</span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Award size={16} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats.codingMastery}%</div>
                            <div className="text-xs font-medium text-indigo-600 mt-1">{stats.codingMasteryStatus}</div>
                        </div>
                        {/* Circle Donut SVG */}
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-12 h-12 transform -rotate-90">
                                <circle cx="24" cy="24" r="18" stroke="#e0e7ff" strokeWidth="4" fill="none" />
                                <circle cx="24" cy="24" r="18" stroke="#4f46e5" strokeWidth="4" fill="none" strokeDasharray="113" strokeDashoffset={113 - (113 * stats.codingMastery) / 100} strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Time Spent */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time Spent</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.timeSpent}</div>
                    <div className="flex items-center gap-1 mt-1 text-xs font-medium text-amber-600">
                        <TrendingUp size={13} />
                        <span>{stats.timeSpentWeeklyDelta}</span>
                    </div>
                    {/* SVG Sparkline */}
                    <div className="mt-3">
                        <svg className="w-full h-8 stroke-amber-500 fill-none" viewBox="0 0 100 25">
                            <path d="M0,18 Q30,22 60,10 T100,6" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                {/* Current Streak */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Streak</span>
                        <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Flame size={16} className="fill-orange-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.currentStreak} <span className="text-xs font-normal text-gray-500">days</span></div>
                    <div className="text-xs font-medium text-gray-500 mt-1">Best: {stats.bestStreak} days</div>
                    {/* SVG Sparkline */}
                    <div className="mt-3">
                        <svg className="w-full h-8 stroke-orange-500 fill-none" viewBox="0 0 100 25">
                            <path d="M0,20 Q20,10 50,15 T100,5" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* ================= 2. CODING SUBJECTS HORIZONTAL SCROLL CARDS ================= */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Coding Subjects</h2>
                        <p className="text-xs text-gray-500">Your progress in all coding subjects</p>
                    </div>
                    <button 
                        onClick={() => setActiveTab('topics')}
                        className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                        <span>View All</span>
                        <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {subjectsList.map(s => {
                        const st = subjectStats[s.id] || { mastery: 60, solved: 25 };
                        const isCurrentActive = selectedSubject?.toLowerCase() === s.id;
                        return (
                            <div
                                key={s.id}
                                onClick={() => setSelectedSubject(s.id)}
                                className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.03] hover:shadow-lg ${
                                    isCurrentActive 
                                        ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md' 
                                        : 'border-gray-100 hover:border-purple-200'
                                }`}
                            >
                                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-xl mb-3 shadow-inner">
                                    {s.icon}
                                </div>
                                <h3 className="font-bold text-sm text-gray-900 group-hover:text-purple-600 transition-colors">{s.name}</h3>
                                
                                <div className="flex items-center justify-between text-xs font-medium text-gray-500 mt-2 mb-1">
                                    <span>{st.mastery}%</span>
                                    <span className="text-[10px] text-gray-400">{st.mastery}%</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                                        style={{ width: `${st.mastery}%` }}
                                    />
                                </div>

                                <div className="text-[11px] text-gray-500 font-medium mb-3">{st.solved} problems</div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSubject(s.id);
                                        onStartPractice(s.id);
                                    }}
                                    className="w-full text-xs font-bold py-1.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-1"
                                >
                                    <span>Practice</span>
                                    <ArrowRight size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ================= 3. SMART PRACTICE BANNER ("What should I practice today?") ================= */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-purple-950/20 border border-purple-800/30">
                {/* Background decorative glow */}
                <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute left-1/3 -top-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Recommendation info */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 backdrop-blur-md">
                                <Zap size={16} />
                            </span>
                            <h3 className="text-sm font-bold tracking-wide text-purple-200 uppercase">What should I practice today?</h3>
                        </div>

                        <p className="text-xs text-purple-300/80">Based on your recent performance, CodeSpirit recommends:</p>

                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                            <div className="inline-block px-2.5 py-1 rounded-md bg-purple-500/30 text-purple-200 text-xs font-semibold mb-2">
                                {selectedSubject.toUpperCase()}
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-white">Functions & Recursion</h2>
                            
                            <div className="flex items-center gap-3 mt-3 text-xs font-medium text-purple-200">
                                <span className="bg-white/10 px-2.5 py-1 rounded-lg">5 Problems</span>
                                <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg font-bold">Medium</span>
                                <span className="bg-white/10 px-2.5 py-1 rounded-lg">~30 min</span>
                            </div>

                            <button
                                onClick={() => onStartPractice(selectedSubject, 'Functions & Recursion')}
                                className="mt-5 w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                            >
                                <Zap size={16} className="fill-white" />
                                <span>Start Smart Practice</span>
                            </button>
                        </div>
                    </div>

                    {/* Why this recommendation */}
                    <div className="lg:col-span-6 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md space-y-3">
                        <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">Why this recommendation?</h4>
                        
                        <div className="flex items-start gap-3">
                            <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-purple-100">You are strong in Basics and Loops</p>
                        </div>

                        <div className="flex items-start gap-3">
                            <Target size={16} className="text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-purple-100">Your recursion skills need improvement</p>
                        </div>

                        <div className="flex items-start gap-3">
                            <Sparkles size={16} className="text-purple-300 mt-0.5 shrink-0" />
                            <p className="text-xs text-purple-100">Practice will increase your mastery by ~8%</p>
                        </div>

                        {/* 3D Bullseye Target Illustration */}
                        <div className="pt-2 flex justify-end">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
                                🎯
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= 4. MIDDLE GRID & RIGHT SIDEBAR WIDGETS ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT/CENTER COLUMN (8 COLS) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Continue Learning */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-900">Continue Learning</h3>
                            <button 
                                onClick={() => setActiveTab('topics')}
                                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                                <span>View All Topics</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {continueLearningList.map(item => (
                                <div 
                                    key={item.id}
                                    onClick={() => onStartPractice(item.subject, item.topic)}
                                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${item.iconColor}`}>
                                            <BookOpen size={16} />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                            {item.difficulty}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-xs text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                                        {item.topic}
                                    </h4>

                                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
                                        <span>{item.solved}/{item.total}</span>
                                        <span>{item.progress}%</span>
                                    </div>

                                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-purple-600 rounded-full"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommended for You */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Recommended for You</h3>
                                <p className="text-xs text-gray-500">Handpicked problems to boost your skills</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                            {recommendedList.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => onOpenProblem(p)}
                                    className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                p.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                                                p.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                                                'bg-rose-50 text-rose-600'
                                            }`}>
                                                {p.difficulty}
                                            </span>
                                            <span className="text-[10px] font-medium text-gray-400">{p.topic}</span>
                                        </div>

                                        <h4 className="font-bold text-xs text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1 mb-2">
                                            {p.title}
                                        </h4>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-50">
                                        <span className="flex items-center gap-1 font-semibold text-purple-600">
                                            <Sparkles size={12} /> {p.matchScore}%
                                        </span>
                                        <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <button
                                onClick={() => setActiveTab('problems')}
                                className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 hover:bg-purple-100/70 transition-all text-left group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center mb-2 shadow-md shadow-purple-500/20">
                                    <BookOpen size={16} />
                                </div>
                                <h4 className="font-bold text-xs text-purple-900">Browse Problems</h4>
                                <p className="text-[10px] text-purple-600">Explore all problems</p>
                            </button>

                            <button
                                onClick={() => setActiveTab('smart-practice')}
                                className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 hover:bg-indigo-100/70 transition-all text-left group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center mb-2 shadow-md shadow-indigo-500/20">
                                    <Sparkles size={16} />
                                </div>
                                <h4 className="font-bold text-xs text-indigo-900">AI Problem Studio</h4>
                                <p className="text-[10px] text-indigo-600">Generate custom problems</p>
                            </button>

                            <button
                                onClick={() => setActiveTab('company-prep')}
                                className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 hover:bg-blue-100/70 transition-all text-left group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-2 shadow-md shadow-blue-500/20">
                                    <Award size={16} />
                                </div>
                                <h4 className="font-bold text-xs text-blue-900">Company Prep</h4>
                                <p className="text-[10px] text-blue-600">Prepare for interviews</p>
                            </button>

                            <button
                                onClick={() => setActiveTab('smart-practice')}
                                className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 hover:bg-emerald-100/70 transition-all text-left group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-md shadow-emerald-500/20">
                                    <Code2 size={16} />
                                </div>
                                <h4 className="font-bold text-xs text-emerald-900">Build & Fix</h4>
                                <p className="text-[10px] text-emerald-600">Real-world tasks</p>
                            </button>

                            <button
                                onClick={() => setActiveTab('contests')}
                                className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 hover:bg-amber-100/70 transition-all text-left group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-2 shadow-md shadow-amber-500/20">
                                    <Trophy size={16} />
                                </div>
                                <h4 className="font-bold text-xs text-amber-900">Contests</h4>
                                <p className="text-[10px] text-amber-600">Compete with others</p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR WIDGETS (4 COLS) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Daily Challenge Card */}
                    <div className="bg-emerald-50/80 border border-emerald-100 p-5 rounded-3xl relative overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Daily Challenge</span>
                            <span className="text-[10px] text-emerald-600 font-medium">New challenge every day!</span>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-emerald-100 mb-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-sm text-gray-900 line-clamp-2">
                                    Longest Substring Without Repeating Characters
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 shrink-0 ml-2">
                                    MEDIUM
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 mt-3">
                                <span className="flex items-center gap-1"><Clock size={13} /> 20 min</span>
                                <span className="flex items-center gap-1 text-emerald-600"><Zap size={13} /> +50 XP</span>
                                <span className="flex items-center gap-1 text-orange-600"><Flame size={13} /> +1 streak</span>
                            </div>
                        </div>

                        <button
                            onClick={onSolveChallenge}
                            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                        >
                            <Play size={16} className="fill-white" />
                            <span>Solve Challenge</span>
                        </button>

                        <button 
                            onClick={() => setActiveTab('daily-challenge')}
                            className="w-full text-center text-xs font-bold text-emerald-700 hover:underline mt-3"
                        >
                            View all challenges →
                        </button>
                    </div>

                    {/* Your Skill Tree Card */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm text-gray-900">Your Skill Tree</h3>
                            <button 
                                onClick={() => setActiveTab('skill-tree')}
                                className="text-xs font-bold text-purple-600 hover:underline"
                            >
                                View full →
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            {/* Active selected subject tree */}
                            <div className="border border-purple-100 rounded-2xl p-3 bg-purple-50/40">
                                <div className="flex items-center justify-between font-bold text-purple-900 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span>🐍</span>
                                        <span>Python</span>
                                    </div>
                                    <span>82%</span>
                                </div>

                                <div className="pl-4 border-l-2 border-purple-200 space-y-2 mt-2 font-medium">
                                    <div className="flex items-center justify-between text-gray-700">
                                        <span>Basics</span>
                                        <span className="text-emerald-600 font-bold">90%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-700">
                                        <span>Functions</span>
                                        <span className="text-purple-600 font-bold">76%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-700">
                                        <span>OOP</span>
                                        <span className="text-indigo-600 font-bold">64%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-700">
                                        <span>Exceptions</span>
                                        <span className="text-amber-600 font-bold">48%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Other Subjects list */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 font-semibold text-gray-700">
                                <span className="flex items-center gap-2">🔷 C++</span>
                                <span>71%</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 font-semibold text-gray-700">
                                <span className="flex items-center gap-2">🌳 DSA</span>
                                <span>64%</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 font-semibold text-gray-700">
                                <span className="flex items-center gap-2">☕ Java</span>
                                <span>58%</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 font-semibold text-gray-700">
                                <span className="flex items-center gap-2">🗄️ SQL</span>
                                <span>69%</span>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Progress Card */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-gray-900">Weekly Progress</h3>
                            <button 
                                onClick={() => setActiveTab('analytics')}
                                className="text-xs font-bold text-purple-600 hover:underline"
                            >
                                View all →
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="text-2xl font-black text-gray-900">34</div>
                            <div className="text-xs text-gray-500 font-medium">Problems Solved</div>
                        </div>

                        {/* Bar Chart */}
                        <div className="flex items-end justify-between h-28 pt-4 pb-2 border-b border-gray-100 gap-2">
                            {[
                                { day: 'Mon', h: '30%', count: 2 },
                                { day: 'Tue', h: '50%', count: 4 },
                                { day: 'Wed', h: '90%', count: 8 },
                                { day: 'Thu', h: '70%', count: 6 },
                                { day: 'Fri', h: '50%', count: 4 },
                                { day: 'Sat', h: '50%', count: 4 },
                                { day: 'Sun', h: '40%', count: 3 }
                            ].map((b, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                    <span className="text-[9px] font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">{b.count}</span>
                                    <div className="w-full bg-gray-100 rounded-t-lg h-full relative overflow-hidden flex items-end">
                                        <div 
                                            className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-lg transition-all duration-500 group-hover:from-purple-500 group-hover:to-indigo-400"
                                            style={{ height: b.h }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-400">{b.day}</span>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-4 text-center">
                            <div>
                                <div className="text-[10px] text-gray-400 font-semibold uppercase">Total Time</div>
                                <div className="text-xs font-bold text-gray-900 mt-0.5">6h 20m</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 font-semibold uppercase">Accuracy</div>
                                <div className="text-xs font-bold text-emerald-600 mt-0.5">74%</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 font-semibold uppercase">Goal Ring</div>
                                <div className="text-xs font-bold text-indigo-600 mt-0.5">86%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
