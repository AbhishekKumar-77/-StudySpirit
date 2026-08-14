import React from 'react';
import { BarChart2, TrendingUp, AlertTriangle, CheckCircle, Clock, Flame, Brain } from 'lucide-react';

export default function LearningAnalyticsView({ analyticsData }) {
    const data = analyticsData || {
        overall: { mastery: 68, accuracy: 78, questionsSolved: 247, timeSpentHours: 14.5, streak: 8 },
        topicBreakdown: [
            { subject: "Python Programming", mastery: 82, accuracy: 88, status: "strong" },
            { subject: "Database Systems (DBMS)", mastery: 68, accuracy: 74, status: "due_for_revision" },
            { subject: "Data Structures & Algorithms", mastery: 74, accuracy: 80, status: "strong" },
            { subject: "Operating Systems", mastery: 61, accuracy: 65, status: "weak" },
            { subject: "Computer Networks", mastery: 79, accuracy: 83, status: "strong" }
        ],
        weakAreas: [
            { topic: "OOP — Polymorphism & MRO", mastery: 58, reason: "Low accuracy on last 3 attempts" },
            { topic: "Deadlock Detection & Semaphores", mastery: 42, reason: "Multiple unresolved mistakes" }
        ],
        strongAreas: [
            { topic: "Variables & Functions in Python", mastery: 96, reason: "Consistent 95%+ accuracy" },
            { topic: "SQL Basic Queries & Aggregations", mastery: 92, reason: "Mastered" }
        ]
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-xl font-black text-slate-800">My Learning Analytics</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                    AI-powered insights into your mastery, accuracy, weak areas, and progress trends.
                </p>
            </div>

            {/* Overall Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Mastery</p>
                    <h3 className="text-xl font-black text-indigo-600 mt-1">{data.overall.mastery}%</h3>
                    <span className="text-[10px] text-emerald-600 font-bold">↑ +12% this week</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Accuracy</p>
                    <h3 className="text-xl font-black text-blue-600 mt-1">{data.overall.accuracy}%</h3>
                    <span className="text-[10px] text-emerald-600 font-bold">↑ +8% this week</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Solved</p>
                    <h3 className="text-xl font-black text-slate-800 mt-1">{data.overall.questionsSolved}</h3>
                    <span className="text-[10px] text-emerald-600 font-bold">↑ +32 questions</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Time Spent</p>
                    <h3 className="text-xl font-black text-purple-600 mt-1">{data.overall.timeSpentHours} hrs</h3>
                    <span className="text-[10px] text-slate-400 font-medium">This month</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Streak</p>
                    <h3 className="text-xl font-black text-orange-600 mt-1 flex items-center gap-1">
                        <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
                        {data.overall.streak} Days
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">Best: 12 days</span>
                </div>
            </div>

            {/* Topic Performance Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Topic Performance & Mastery</h3>

                <div className="space-y-4">
                    {data.topicBreakdown.map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-800">{item.subject}</span>
                                <span className="text-indigo-600">{item.mastery}% Mastery</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    style={{ width: `${item.mastery}%` }} 
                                    className={`h-full rounded-full transition-all ${
                                        item.mastery >= 75 ? 'bg-indigo-600' : item.mastery >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weak & Strong Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weak Areas */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        Weak Areas (Requires Attention)
                    </h3>
                    <div className="space-y-3">
                        {data.weakAreas.map((item, idx) => (
                            <div key={idx} className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl text-xs">
                                <div className="flex justify-between font-bold text-slate-800">
                                    <span>{item.topic}</span>
                                    <span className="text-rose-600">{item.mastery}%</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">{item.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strong Areas */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        Strong Areas (Mastered)
                    </h3>
                    <div className="space-y-3">
                        {data.strongAreas.map((item, idx) => (
                            <div key={idx} className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs">
                                <div className="flex justify-between font-bold text-slate-800">
                                    <span>{item.topic}</span>
                                    <span className="text-emerald-600">{item.mastery}%</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">{item.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
