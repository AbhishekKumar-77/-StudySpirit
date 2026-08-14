import React from 'react';
import { 
    Brain, BookOpen, AlertCircle, Target, RefreshCw, Flame, ArrowUpRight,
    TrendingUp, CheckCircle, ChevronRight, Sparkles, Bot, Clock
} from 'lucide-react';

export default function StudentDashboardView({ dashboardData, setActiveTab, onStartPractice }) {
    const summary = dashboardData?.summaryCards || {
        overallMastery: { value: 68, changeThisWeek: "+12%" },
        questionsSolved: { value: 247, changeThisWeek: "+32" },
        averageAccuracy: { value: 78, changeThisWeek: "+8%" },
        currentStreak: { value: 8, best: 12 }
    };

    const studentName = dashboardData?.userProfile?.name || "Abhishek";

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
            {/* Greeting Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    Good evening, {studentName}! <span className="animate-bounce inline-block">👋</span>
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    Let's continue your learning journey today.
                </p>
            </div>

            {/* 4 Performance Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Overall Mastery */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Mastery</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{summary.overallMastery.value}%</h3>
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {summary.overallMastery.changeThisWeek} this week
                        </p>
                    </div>
                    {/* SVG Circular Progress Indicator */}
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-14 h-14 transform -rotate-90">
                            <circle cx="28" cy="28" r="22" stroke="#e2e8f0" strokeWidth="5" fill="transparent" />
                            <circle 
                                cx="28" cy="28" r="22" 
                                stroke="#6366f1" strokeWidth="5" 
                                strokeDasharray={138} 
                                strokeDashoffset={138 - (138 * summary.overallMastery.value) / 100}
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
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{summary.questionsSolved.value}</h3>
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {summary.questionsSolved.changeThisWeek} this week
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
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{summary.averageAccuracy.value}%</h3>
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {summary.averageAccuracy.changeThisWeek} this week
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <Target className="w-6 h-6" />
                    </div>
                </div>

                {/* Card 4: Current Streak */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Streak</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1 flex items-center gap-1.5">
                            <Flame className="w-6 h-6 fill-orange-500 text-orange-500" />
                            {summary.currentStreak.value} Days
                        </h3>
                        <p className="text-xs font-medium text-slate-400 mt-1">
                            Best: {summary.currentStreak.best} days
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                        <Flame className="w-6 h-6 fill-orange-500 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Main Content Grid: Left 2 cols, Right Insights 1 col */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Continue Learning & Recommended Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Large Continue Learning Card */}
                        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 p-6 rounded-2xl border border-indigo-100/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg">
                                        Continue Learning
                                    </span>
                                    <span className="text-2xl">🐍</span>
                                </div>
                                <h2 className="text-xl font-black text-slate-900">Python → OOP</h2>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Object Oriented Programming</p>

                                <div className="mt-6 space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-indigo-600">68% Mastery</span>
                                        <span className="text-slate-500">12/20 Topics Completed</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-[68%]"></div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setActiveTab('smart_practice')}
                                className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.01]"
                            >
                                Continue Practice
                            </button>
                        </div>

                        {/* Recommended For You List */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-800">Recommended for You</h3>
                                <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                            </div>

                            <div className="space-y-3">
                                {/* Item 1 */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 font-bold text-xs flex items-center justify-center">
                                            &lt;&gt;
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-slate-800">OOP Concepts</p>
                                                <span className="px-1.5 py-0.5 bg-pink-100 text-pink-600 text-[10px] font-extrabold rounded">Weak Area</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400">Based on your recent performance</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setActiveTab('mistake_practice')}
                                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-indigo-600 text-xs font-bold rounded-lg shadow-2xs transition-all"
                                    >
                                        Practice
                                    </button>
                                </div>

                                {/* Item 2 */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 font-bold text-xs flex items-center justify-center">
                                            🛢️
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-slate-800">DBMS</p>
                                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-extrabold rounded">Due for Revision</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400">Review before you forget</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setActiveTab('revision')}
                                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-indigo-600 text-xs font-bold rounded-lg shadow-2xs transition-all"
                                    >
                                        Revise
                                    </button>
                                </div>

                                {/* Item 3 */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center">
                                            🌳
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-slate-800">Data Structures</p>
                                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded">Strong</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400">Keep it up!</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setActiveTab('challenges')}
                                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-indigo-600 text-xs font-bold rounded-lg shadow-2xs transition-all"
                                    >
                                        Challenge
                                    </button>
                                </div>

                                {/* Item 4 */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 font-bold text-xs flex items-center justify-center">
                                            🌐
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-slate-800">Computer Networks</p>
                                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-extrabold rounded">New Topic</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400">Start your learning</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setActiveTab('topic_practice')}
                                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-indigo-600 text-xs font-bold rounded-lg shadow-2xs transition-all"
                                    >
                                        Start
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dedicated Practice Modes Cards Section */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Practice Modes</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                            {/* Smart Practice */}
                            <div 
                                onClick={() => setActiveTab('smart_practice')}
                                className="bg-white p-4 rounded-2xl border border-indigo-200/80 hover:border-indigo-500 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Brain className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800">Smart Practice</h4>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">AI selects questions based on weak areas.</p>
                                </div>
                                <span className="mt-4 inline-block text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md text-center">
                                    Best for you
                                </span>
                            </div>

                            {/* Topic Practice */}
                            <div 
                                onClick={() => setActiveTab('topic_practice')}
                                className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-500 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800">Topic Practice</h4>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">Practice questions by specific topics.</p>
                                </div>
                                <span className="mt-4 inline-block text-[11px] font-bold text-indigo-600 text-center">
                                    Choose topic
                                </span>
                            </div>

                            {/* Mistake Practice */}
                            <div 
                                onClick={() => setActiveTab('mistake_practice')}
                                className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-500 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800">Mistake Practice</h4>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">Practice questions you got wrong.</p>
                                </div>
                                <span className="mt-4 inline-block text-[11px] font-bold text-rose-600 text-center">
                                    27 Questions
                                </span>
                            </div>

                            {/* Daily Challenge */}
                            <div 
                                onClick={() => setActiveTab('daily_challenge')}
                                className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-500 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800">Daily Challenge</h4>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">10 questions every day.</p>
                                </div>
                                <span className="mt-4 inline-block text-[11px] font-bold text-orange-600 text-center">
                                    Keep your streak
                                </span>
                            </div>

                            {/* Revision */}
                            <div 
                                onClick={() => setActiveTab('revision')}
                                className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-500 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <RefreshCw className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800">Revision</h4>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">Spaced repetition for better retention.</p>
                                </div>
                                <span className="mt-4 inline-block text-[11px] font-bold text-emerald-600 text-center">
                                    5 Topics Due
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Insights Column */}
                <div className="space-y-6">
                    {/* Today's Goal Widget */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-800">Today's Goal</h4>
                            <button className="text-xs text-indigo-600 font-bold hover:underline">Edit</button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg className="w-16 h-16 transform -rotate-90">
                                    <circle cx="32" cy="32" r="26" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                                    <circle 
                                        cx="32" cy="32" r="26" 
                                        stroke="#6366f1" strokeWidth="6" 
                                        strokeDasharray={163} 
                                        strokeDashoffset={163 - (163 * 60) / 100}
                                        strokeLinecap="round"
                                        fill="transparent" 
                                    />
                                </svg>
                                <span className="absolute text-xs font-black text-slate-800">60%</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">Practice 20 Questions</p>
                                <p className="text-[11px] font-medium text-slate-500 mt-0.5">12 / 20 Completed</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setActiveTab('daily_challenge')}
                            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition-colors"
                        >
                            Continue Goal
                        </button>
                    </div>

                    {/* Performance This Week */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-800">Performance This Week</h4>
                            <button 
                                onClick={() => setActiveTab('analytics')}
                                className="text-xs text-indigo-600 font-bold hover:underline"
                            >
                                View Analytics
                            </button>
                        </div>

                        {/* Sparkline Visual Placeholder */}
                        <div className="h-24 bg-slate-50 rounded-xl p-3 flex items-end justify-between gap-1 border border-slate-100">
                            {[40, 55, 60, 78, 65, 70, 85].map((val, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                    <div 
                                        style={{ height: `${val}%` }} 
                                        className={`w-full rounded-t ${idx === 3 ? 'bg-indigo-600' : 'bg-indigo-200'}`} 
                                    />
                                    <span className="text-[9px] text-slate-400 font-medium">
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium">Accuracy</p>
                                <p className="text-xs font-black text-slate-800">78%</p>
                                <span className="text-[10px] text-emerald-600 font-bold">↑ 12%</span>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium">Questions</p>
                                <p className="text-xs font-black text-slate-800">86</p>
                                <span className="text-[10px] text-emerald-600 font-bold">↑ 24</span>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-medium">Improvement</p>
                                <p className="text-xs font-black text-slate-800">14%</p>
                                <span className="text-[10px] text-emerald-600 font-bold">↑ 8%</span>
                            </div>
                        </div>
                    </div>

                    {/* Due for Revision List */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-800">Due for Revision</h4>
                            <button 
                                onClick={() => setActiveTab('revision')}
                                className="text-xs text-indigo-600 font-bold hover:underline"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                <span className="font-bold text-slate-700">Functions in Python</span>
                                <span className="text-[10px] font-bold text-orange-600">Due Tomorrow</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                <span className="font-bold text-slate-700">SQL Joins</span>
                                <span className="text-[10px] font-bold text-slate-500">Due in 2 days</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                <span className="font-bold text-slate-700">Exception Handling</span>
                                <span className="text-[10px] font-bold text-slate-500">Due in 4 days</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Tutor Promo Widget */}
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-5 rounded-2xl shadow-md relative overflow-hidden space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                                AI Tutor
                            </span>
                            <Sparkles className="w-4 h-4 text-purple-200 animate-spin" />
                        </div>
                        <h4 className="text-sm font-bold">Need help with concepts?</h4>
                        <p className="text-xs text-purple-100 leading-snug">
                            Get instant explanations, hints & custom mini-lessons.
                        </p>
                        <button 
                            onClick={() => onStartPractice({ mode: 'ai_tutor' })}
                            className="w-full py-2 bg-white text-indigo-700 font-bold text-xs rounded-xl shadow hover:bg-purple-50 transition-colors"
                        >
                            Ask AI Tutor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
