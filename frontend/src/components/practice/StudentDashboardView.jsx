import React, { useState, useEffect } from 'react';
import { 
    Brain, BookOpen, Target, TrendingUp, CheckCircle, ChevronRight,
    Sparkles, Calendar, Layers, Code, Laptop, Cpu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function StudentDashboardView({ dashboardData, setActiveTab, onStartPractice }) {
    const { user } = useApp();

    // State for local & API aggregated practice metrics
    const [realStats, setRealStats] = useState({
        totalSolved: 0,
        avgAccuracy: 0,
        overallMastery: 0,
        todayAttempts: 0,
        topicMasteries: [],
        heatmap: []
    });

    // 1st Semester Registered Subjects (Shared across Recommended & Topic Performance)
    const firstSemSubjects = [
        { id: 'python', name: "Python Programming", icon: "🐍", tag: "1st Semester Core", bg: "bg-emerald-50 text-emerald-600 border-emerald-200" },
        { id: 'html_css', name: "HTML & CSS", icon: "🌐", tag: "1st Semester Web", bg: "bg-orange-50 text-orange-600 border-orange-200" },
        { id: 'javascript', name: "JavaScript Fundamentals", icon: "⚡", tag: "1st Semester Web", bg: "bg-amber-50 text-amber-600 border-amber-200" },
        { id: 'basics_computer', name: "Basics of Computers", icon: "💻", tag: "1st Semester Core", bg: "bg-blue-50 text-blue-600 border-blue-200" },
        { id: 'digital_logic', name: "Digital Logic & Systems", icon: "🔢", tag: "1st Semester Hardware", bg: "bg-purple-50 text-purple-600 border-purple-200" }
    ];

    useEffect(() => {
        // Read local attempt logs from localStorage
        let localAttempts = [];
        try {
            localAttempts = JSON.parse(localStorage.getItem('study_spirit_practice_attempts') || '[]');
        } catch (e) {
            console.error("Error reading local attempts:", e);
        }

        // Aggregate stats
        const dbTotal = dashboardData?.totalSolved || dashboardData?.summaryCards?.questionsSolved?.value || 0;
        const totalSolved = Math.max(dbTotal, localAttempts.length);

        let totalCorrect = 0;
        if (localAttempts.length > 0) {
            totalCorrect = localAttempts.filter(a => a.isCorrect).length;
        } else if (dashboardData?.avgAccuracy) {
            totalCorrect = Math.round((dashboardData.avgAccuracy / 100) * dbTotal);
        }

        const avgAccuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

        // Calculate mastery per 1st semester subject
        let totalMasterySum = 0;
        let attemptedSubjectsCount = 0;

        const topicMasteries = firstSemSubjects.map(sub => {
            const apiMasteryObj = dashboardData?.topicMasteryList?.find(
                t => t.name.toLowerCase().includes(sub.name.split(' ')[0].toLowerCase())
            );

            const subAttempts = localAttempts.filter(a => 
                a.subject && a.subject.toLowerCase().includes(sub.name.split(' ')[0].toLowerCase())
            );

            let mastery = 0;
            let attCount = subAttempts.length;

            if (attCount > 0) {
                const correctCount = subAttempts.filter(a => a.isCorrect).length;
                const acc = (correctCount / attCount) * 100;
                mastery = Math.min(100, Math.round(acc * 0.8 + Math.min(20, attCount * 2)));
            } else if (apiMasteryObj && apiMasteryObj.mastery > 0) {
                mastery = apiMasteryObj.mastery;
                attCount = apiMasteryObj.totalAttempts || 0;
            }

            if (mastery > 0 || attCount > 0) {
                totalMasterySum += mastery;
                attemptedSubjectsCount++;
            }

            let barColor = "bg-indigo-600 text-indigo-600";
            if (mastery < 65 && mastery > 0) barColor = "bg-rose-500 text-rose-500";
            else if (mastery < 80 && mastery > 0) barColor = "bg-amber-500 text-amber-500";

            return {
                name: sub.name,
                mastery,
                totalAttempts: attCount,
                color: barColor
            };
        });

        const overallMastery = attemptedSubjectsCount > 0 ? Math.round(totalMasterySum / attemptedSubjectsCount) : 0;

        // Calculate Today's attempts
        const todayStr = new Date().toDateString();
        const todayCount = localAttempts.filter(a => new Date(a.timestamp || Date.now()).toDateString() === todayStr).length;
        const apiToday = dashboardData?.todayAttempts || 0;
        const todayAttempts = Math.max(apiToday, todayCount);

        // Build 14-day Heatmap (Previous Week & Current Week)
        const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const now = new Date();
        const heatmap = [];

        // Build last 14 days
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dStr = d.toDateString();
            const count = localAttempts.filter(a => new Date(a.timestamp || Date.now()).toDateString() === dStr).length;

            heatmap.push({
                day: daysMap[d.getDay()],
                dateStr: dStr,
                attempts: count,
                week: i >= 7 ? "Previous" : "Current"
            });
        }

        setRealStats({
            totalSolved,
            avgAccuracy,
            overallMastery,
            todayAttempts,
            topicMasteries,
            heatmap
        });
    }, [dashboardData]);

    const getHeatmapColor = (attempts) => {
        if (attempts === 0) return "bg-slate-100 border-slate-200 text-slate-400";
        if (attempts < 3) return "bg-emerald-200 border-emerald-300 text-emerald-900 font-bold";
        if (attempts < 7) return "bg-emerald-400 border-emerald-500 text-white font-bold";
        if (attempts < 12) return "bg-emerald-600 border-emerald-700 text-white font-bold";
        return "bg-emerald-700 border-emerald-800 text-white font-black";
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
            {/* 3 Real Performance Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Card 1: Overall Mastery */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Mastery</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{realStats.overallMastery}%</h3>
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {realStats.totalSolved > 0 ? 'Calculated from practice' : 'Start practicing to score'}
                        </p>
                    </div>
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-14 h-14 transform -rotate-90">
                            <circle cx="28" cy="28" r="22" stroke="#e2e8f0" strokeWidth="5" fill="transparent" />
                            <circle 
                                cx="28" cy="28" r="22" 
                                stroke="#6366f1" strokeWidth="5" 
                                strokeDasharray={138} 
                                strokeDashoffset={138 - (138 * realStats.overallMastery) / 100}
                                strokeLinecap="round"
                                fill="transparent" 
                            />
                        </svg>
                    </div>
                </div>

                {/* Card 2: Questions Solved */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Questions Solved</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{realStats.totalSolved}</h3>
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Total attempts logged
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                        <BookOpen className="w-6 h-6" />
                    </div>
                </div>

                {/* Card 3: Average Accuracy */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Accuracy</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{realStats.avgAccuracy}%</h3>
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Real practice accuracy
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <Target className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Main Content Grid: Left 2 cols, Right 1 col */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Topic Performance & Mastery Section */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                                    Topic Performance & Mastery
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">Real-time mastery across registered 1st semester subjects</p>
                            </div>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                Semester Overview
                            </span>
                        </div>

                        <div className="space-y-5">
                            {realStats.topicMasteries.map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-800">{item.name}</span>
                                        <span className={item.color.split(' ')[1]}>
                                            {item.mastery > 0 ? `${item.mastery}% Mastery` : '0% Mastery'}
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${item.color.split(' ')[0]}`} 
                                            style={{ width: `${item.mastery}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommended for You — 1st Semester Subjects */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Recommended for You</h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    First semester registered subjects available for practice
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {firstSemSubjects.map((sub) => (
                                <div 
                                    key={sub.id} 
                                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-sm">
                                            {sub.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{sub.name}</p>
                                            <span className={`inline-block mt-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded border ${sub.bg}`}>
                                                {sub.tag}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onStartPractice({ mode: 'topic', topic: sub.name })}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02]"
                                    >
                                        Practice
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Insights Column — Weekly Heatmap */}
                <div className="space-y-6">
                    {/* Performance This Week — Heatmap */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Performance Heatmap</h4>
                                <p className="text-[11px] text-slate-500 font-medium">Questions attempted in practice</p>
                            </div>
                        </div>

                        {/* Heatmap Grid */}
                        <div className="space-y-4">
                            {/* Previous Week */}
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Previous Week</p>
                                <div className="grid grid-cols-7 gap-1.5">
                                    {realStats.heatmap.slice(0, 7).map((item, idx) => (
                                        <div key={idx} className="text-center">
                                            <div 
                                                title={`${item.attempts} questions attempted on ${item.day} (${item.dateStr})`}
                                                className={`h-9 rounded-lg border flex items-center justify-center text-[10px] cursor-pointer transition-transform hover:scale-110 ${getHeatmapColor(item.attempts)}`}
                                            >
                                                {item.attempts > 0 ? item.attempts : '-'}
                                            </div>
                                            <span className="text-[9px] font-semibold text-slate-400 mt-1 block">{item.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Current Week */}
                            <div>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Current Week</p>
                                <div className="grid grid-cols-7 gap-1.5">
                                    {realStats.heatmap.slice(7, 14).map((item, idx) => (
                                        <div key={idx} className="text-center">
                                            <div 
                                                title={`${item.attempts} questions attempted on ${item.day} (${item.dateStr})`}
                                                className={`h-9 rounded-lg border flex items-center justify-center text-[10px] cursor-pointer transition-transform hover:scale-110 ${getHeatmapColor(item.attempts)}`}
                                            >
                                                {item.attempts > 0 ? item.attempts : '-'}
                                            </div>
                                            <span className="text-[9px] font-semibold text-slate-400 mt-1 block">{item.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-2 border-t border-slate-100">
                            <span>Less attempts</span>
                            <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></span>
                                <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300"></span>
                                <span className="w-3 h-3 rounded bg-emerald-400 border border-emerald-500"></span>
                                <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-700"></span>
                            </div>
                            <span>More attempts</span>
                        </div>
                    </div>

                    {/* Today's Practice Goal */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-800">Daily Practice Goal</h4>
                            <span className="text-xs font-bold text-indigo-600">
                                {Math.min(100, Math.round((realStats.todayAttempts / 20) * 100))}%
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-slate-600">
                                <span>{realStats.todayAttempts} / 20 Questions Attempted</span>
                                <span>{Math.max(0, 20 - realStats.todayAttempts)} Remaining</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, Math.round((realStats.todayAttempts / 20) * 100))}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

