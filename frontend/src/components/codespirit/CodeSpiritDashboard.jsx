import React from 'react';
import { 
    Flame, Shield, Clock, Target, CheckCircle2, ArrowRight, Zap, 
    Sparkles, ChevronRight, Layers, Award, Code2, Play, 
    BookOpen, Trophy, TrendingUp
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
        userRank: 1,
        totalStudents: 1,
        problemsSolved: 0,
        accuracy: 0,
        currentStreak: 0,
        rating: 1200,
        userXP: 0,
        todayAttempts: 0
    };

    const subjectStats = dashboardData?.subjectStats || {
        python: { mastery: 0, solved: 0, total: 50 },
        c: { mastery: 0, solved: 0, total: 48 },
        cpp: { mastery: 0, solved: 0, total: 80 },
        java: { mastery: 0, solved: 0, total: 50 },
        javascript: { mastery: 0, solved: 0, total: 52 },
        dsa: { mastery: 0, solved: 0, total: 110 },
        sql: { mastery: 0, solved: 0, total: 26 }
    };

    const subjectsList = [
        { id: 'python', name: 'Python', icon: '🐍' },
        { id: 'c', name: 'C', icon: '⚡' },
        { id: 'cpp', name: 'C++', icon: '🔷' },
        { id: 'java', name: 'Java', icon: '☕' },
        { id: 'javascript', name: 'JavaScript', icon: '🟨' },
        { id: 'dsa', name: 'DSA', icon: '🌳' },
        { id: 'sql', name: 'SQL', icon: '🗄️' }
    ];

    const heatmap = dashboardData?.heatmap || Array.from({ length: 14 }, (_, i) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(new Date().getDay() - (13 - i) + 700) % 7],
        dateStr: new Date(Date.now() - (13 - i) * 86400000).toDateString(),
        attempts: 0,
        week: i >= 7 ? "Previous" : "Current"
    }));

    const getHeatmapColor = (attempts) => {
        if (attempts === 0) return "bg-slate-100 border-slate-200 text-slate-400";
        if (attempts < 3) return "bg-emerald-200 border-emerald-300 text-emerald-900 font-bold";
        if (attempts < 7) return "bg-emerald-400 border-emerald-500 text-white font-bold";
        if (attempts < 12) return "bg-emerald-600 border-emerald-700 text-white font-bold";
        return "bg-emerald-700 border-emerald-800 text-white font-black";
    };

    return (
        <div className="space-y-8 pb-12">
            {/* ================= 1. TOP STATISTICS (4 Real Dynamic Cards) ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Problems Solved */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Problems Solved</span>
                        <div className="text-2xl font-black text-gray-900 mt-1">{stats.problemsSolved}</div>
                        <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
                            <TrendingUp size={13} />
                            <span>{stats.problemsSolved > 0 ? `${stats.problemsSolved} completed` : 'Start practicing'}</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                        <Layers size={22} />
                    </div>
                </div>

                {/* Accuracy */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Accuracy</span>
                        <div className="text-2xl font-black text-gray-900 mt-1">{stats.accuracy}%</div>
                        <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
                            <Target size={13} />
                            <span>Real practice accuracy</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                        <Target size={22} />
                    </div>
                </div>

                {/* Leaderboard Position / Rank (Replaces Coding Mastery 68%) */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coding Rank</span>
                        <div className="text-2xl font-black text-indigo-600 mt-1">Rank #{stats.userRank}</div>
                        <div className="text-xs font-medium text-gray-500 mt-1">
                            Out of {stats.totalStudents} {stats.totalStudents === 1 ? 'Student' : 'Students'}
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                        <Trophy size={22} />
                    </div>
                </div>

                {/* Current Streak */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Streak</span>
                        <div className="text-2xl font-black text-gray-900 mt-1">{stats.currentStreak} <span className="text-xs font-normal text-gray-500">days</span></div>
                        <div className="text-xs font-medium text-orange-600 mt-1 flex items-center gap-1">
                            <Flame size={13} className="fill-orange-500" /> Daily coding streak
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center">
                        <Flame size={22} className="fill-orange-500" />
                    </div>
                </div>
            </div>

            {/* ================= 2. CODING SUBJECTS PROGRESS ================= */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Coding Subjects</h2>
                        <p className="text-xs text-gray-500">Your practice progress in core subjects</p>
                    </div>
                    <button 
                        onClick={() => setActiveTab('topics')}
                        className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                        <span>View All Subjects</span>
                        <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {subjectsList.map(s => {
                        const st = subjectStats[s.id] || { mastery: 0, solved: 0 };
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
                                    <span>{st.mastery}% Mastery</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                                        style={{ width: `${st.mastery}%` }}
                                    />
                                </div>

                                <div className="text-[11px] text-gray-500 font-medium mb-3">{st.solved} solved</div>

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

            {/* ================= 3. MAIN CONTENT GRID (Left 8 cols, Right 4 cols) ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT/CENTER COLUMN (8 COLS) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* SMART PRACTICE BANNER */}
                    <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-purple-950/20 border border-purple-800/30">
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                            <div className="lg:col-span-8 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 backdrop-blur-md">
                                        <Zap size={16} />
                                    </span>
                                    <h3 className="text-xs font-bold tracking-wide text-purple-200 uppercase">Recommended Practice</h3>
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-white">
                                    Practice {selectedSubject.toUpperCase()} Coding Session
                                </h2>
                                <p className="text-xs text-purple-200/80">
                                    Improve your algorithmic problem-solving speed with instant AI code evaluation.
                                </p>
                                <button
                                    onClick={() => onStartPractice(selectedSubject, 'Functions & Recursion')}
                                    className="mt-3 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-purple-500/30 transition-all transform hover:scale-[1.02]"
                                >
                                    <Zap size={15} className="fill-white" />
                                    <span>Start Practice Session</span>
                                </button>
                            </div>
                            <div className="lg:col-span-4 flex justify-end">
                                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-4xl shadow-inner">
                                    ⚡
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR WIDGETS (4 COLS) — QUIZ-STYLE HEATMAP & DAILY CHALLENGE */}
                <div className="lg:col-span-4 space-y-6">
                    {/* QUIZ-STYLE 14-DAY PERFORMANCE HEATMAP (Replaces Bar Chart) */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Performance Heatmap</h4>
                                <p className="text-[11px] text-gray-500 font-medium">Daily coding submissions logged</p>
                            </div>
                            <button onClick={() => setActiveTab('analytics')} className="text-xs font-bold text-purple-600 hover:underline">
                                View all →
                            </button>
                        </div>

                        {/* Heatmap Grid */}
                        <div className="space-y-4">
                            {/* Previous Week */}
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Previous Week</p>
                                <div className="grid grid-cols-7 gap-1.5">
                                    {heatmap.slice(0, 7).map((item, idx) => (
                                        <div key={idx} className="text-center">
                                            <div 
                                                title={`${item.attempts} submissions on ${item.day} (${item.dateStr})`}
                                                className={`h-9 rounded-lg border flex items-center justify-center text-[10px] cursor-pointer transition-transform hover:scale-110 ${getHeatmapColor(item.attempts)}`}
                                            >
                                                {item.attempts > 0 ? item.attempts : '-'}
                                            </div>
                                            <span className="text-[9px] font-semibold text-gray-400 mt-1 block">{item.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Current Week */}
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Current Week</p>
                                <div className="grid grid-cols-7 gap-1.5">
                                    {heatmap.slice(7, 14).map((item, idx) => (
                                        <div key={idx} className="text-center">
                                            <div 
                                                title={`${item.attempts} submissions on ${item.day} (${item.dateStr})`}
                                                className={`h-9 rounded-lg border flex items-center justify-center text-[10px] cursor-pointer transition-transform hover:scale-110 ${getHeatmapColor(item.attempts)}`}
                                            >
                                                {item.attempts > 0 ? item.attempts : '-'}
                                            </div>
                                            <span className="text-[9px] font-semibold text-gray-400 mt-1 block">{item.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold pt-2 border-t border-gray-100">
                            <span>Less</span>
                            <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></span>
                                <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300"></span>
                                <span className="w-3 h-3 rounded bg-emerald-400 border border-emerald-500"></span>
                                <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-700"></span>
                            </div>
                            <span>More</span>
                        </div>
                    </div>

                    {/* Daily Challenge Card */}
                    <div className="bg-emerald-50/80 border border-emerald-100 p-5 rounded-3xl relative overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Daily Challenge</span>
                            <span className="text-[10px] text-emerald-600 font-medium">New challenge daily</span>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-emerald-100 mb-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-xs text-gray-900">
                                    Competitive Daily Challenge
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                                    ACTIVE
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 mt-2">
                                <span className="flex items-center gap-1 text-emerald-600"><Zap size={13} /> +50 XP</span>
                                <span className="flex items-center gap-1 text-orange-600"><Flame size={13} /> +1 streak</span>
                            </div>
                        </div>

                        <button
                            onClick={onSolveChallenge}
                            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                        >
                            <Play size={15} className="fill-white" />
                            <span>Solve Daily Challenge</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
