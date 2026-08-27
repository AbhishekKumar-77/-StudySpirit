import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Bell, Bot, Calendar as CalendarIcon, ArrowRight, CheckCircle2,
    AlertCircle, Award, Sparkles, BookOpen, FileCheck, History, ExternalLink,
    Code, Users, MessageSquare, Briefcase, ChevronRight, Zap
} from 'lucide-react';

export default function InterviewDashboard({
    user,
    dashboardData,
    onStartNewInterview,
    onSelectQuickAction,
    onOpenATS,
    onOpenQuestionBank,
    onOpenHistory,
    onOpenReport
}) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const profile = dashboardData?.profile || {
        targetRole: 'Software Engineer',
        targetCompany: 'Target Company',
        preparationPercentage: 70,
        readiness: {
            technical: 75,
            communication: 70,
            behavioral: 75,
            confidence: 70,
            problemSolving: 75
        },
        upcomingInterviews: [],
        weeklyGoal: { completed: 0, target: 5 }
    };

    const readiness = profile.readiness;
    const prepPercent = profile.preparationPercentage;

    return (
        <div className="flex-1 bg-slate-50 text-slate-800 p-6 md:p-8 min-h-screen overflow-y-auto">
            {/* Top Navigation Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Interview Prep Studio</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Prepare. Practice. Improve. Get Hired.</p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs w-44 md:w-56 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-700 shadow-xs"
                        />
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition shadow-xs">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                    </button>

                    {/* Aria Profile */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-xs">
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-bold text-slate-900 leading-tight">Aria</p>
                            <p className="text-[10px] text-slate-500">AI Interviewer</p>
                        </div>
                    </div>

                    {/* Student Profile Pill */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-xs">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                            {user?.name ? user.name.charAt(0) : 'A'}
                        </div>
                        <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                            {user?.name || 'Student Candidate'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Grid Row 1: Continue Preparation & Upcoming Interviews */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Continue Preparation Hero Card */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                                Active Interview Target
                            </span>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-3">{profile.targetRole}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-base font-extrabold text-[#ff5733]">{profile.targetCompany}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                    <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                                    Technical & STAR Round
                                </span>
                                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                    <CalendarIcon className="w-3.5 h-3.5 text-cyan-500" />
                                    Live Session Ready
                                </span>
                            </div>
                        </div>

                        {/* Circular Prep Gauge */}
                        <div className="relative w-28 h-28 flex items-center justify-center shrink-0 self-center sm:self-auto">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-slate-100"
                                    strokeWidth="3.5"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-gradient-purple"
                                    strokeDasharray={`${prepPercent}, 100`}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    stroke="url(#gradient)"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#7c3aed" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute text-center">
                                <span className="text-xl font-black text-slate-900">{prepPercent}%</span>
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter">Readiness</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                            onClick={() => onStartNewInterview('specific-job')}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
                        >
                            <span>Launch Interview Practice</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Upcoming / Session History Overview Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900">Recent & Scheduled Sessions</h3>
                            <button onClick={onOpenHistory} className="text-xs font-bold text-purple-600 hover:underline">View History</button>
                        </div>

                        {profile.upcomingInterviews && profile.upcomingInterviews.length > 0 ? (
                            <div className="space-y-3">
                                {profile.upcomingInterviews.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-800 shadow-2xs">
                                                {item.company.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900">{item.company}</h4>
                                                <p className="text-[10px] text-slate-500 font-medium">{item.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                                {item.roundType}
                                            </span>
                                            <p className="text-[10px] text-slate-400 mt-1 font-medium">{item.scheduledDate}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-2">
                                <Award className="w-8 h-8 text-slate-300 mx-auto" />
                                <p className="text-xs font-bold text-slate-700">No scheduled sessions</p>
                                <p className="text-[11px] text-slate-500">Start an AI mock interview anytime!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid Row 2: Your Progress & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Your Progress / Overall Readiness */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="mb-4">
                            <h3 className="text-base font-bold text-slate-900">Skill Progress Radar</h3>
                            <p className="text-xs text-slate-500">Evaluated across live practice rounds</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                            {/* Bar Metrics */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-600">Technical Skills</span>
                                        <span className="text-purple-600">{readiness.technical}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${readiness.technical}%` }} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-600">Communication</span>
                                        <span className="text-cyan-600">{readiness.communication}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${readiness.communication}%` }} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-600">Behavioral</span>
                                        <span className="text-pink-600">{readiness.behavioral}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-pink-500 rounded-full" style={{ width: `${readiness.behavioral}%` }} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-600">Confidence</span>
                                        <span className="text-emerald-600">{readiness.confidence}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${readiness.confidence}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* SVG Radar Chart Visualization */}
                            <div className="flex flex-col items-center justify-center p-2">
                                <svg className="w-48 h-48" viewBox="0 0 200 200">
                                    <polygon points="100,20 176,55 147,145 53,145 24,55" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                                    <polygon points="100,45 152,69 133,130 67,130 48,69" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                                    <polygon points="100,70 128,83 118,115 82,115 72,83" fill="none" stroke="#f8fafc" strokeWidth="1" />

                                    <line x1="100" y1="100" x2="100" y2="20" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />
                                    <line x1="100" y1="100" x2="176" y2="55" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />
                                    <line x1="100" y1="100" x2="147" y2="145" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />
                                    <line x1="100" y1="100" x2="53" y2="145" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />
                                    <line x1="100" y1="100" x2="24" y2="55" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2" />

                                    <polygon
                                        points="100,35 160,65 135,135 60,135 38,62"
                                        fill="rgba(124, 58, 237, 0.15)"
                                        stroke="#7c3aed"
                                        strokeWidth="2.5"
                                    />

                                    <text x="100" y="14" textAnchor="middle" className="text-[9px] font-extrabold fill-slate-700">Technical</text>
                                    <text x="180" y="55" textAnchor="start" className="text-[9px] font-extrabold fill-slate-700">Communication</text>
                                    <text x="145" y="158" textAnchor="middle" className="text-[9px] font-extrabold fill-slate-700">Behavioral</text>
                                    <text x="53" y="158" textAnchor="middle" className="text-[9px] font-extrabold fill-slate-700">Confidence</text>
                                    <text x="20" y="55" textAnchor="end" className="text-[9px] font-extrabold fill-slate-700">Problem Solving</text>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions (Four Practice Cards) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Card 1: AI Mock Interview */}
                            <button
                                onClick={() => onSelectQuickAction('aria')}
                                className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 hover:border-purple-300 text-left transition transform hover:-translate-y-0.5 flex flex-col justify-between group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-extrabold text-slate-900">AI Mock Interview</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Practice with Aria</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-purple-500 self-end mt-2 group-hover:translate-x-1 transition" />
                            </button>

                            {/* Card 2: Technical Interview */}
                            <button
                                onClick={() => onSelectQuickAction('technical')}
                                className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 hover:border-blue-300 text-left transition transform hover:-translate-y-0.5 flex flex-col justify-between group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                                    <Code className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-extrabold text-slate-900">Technical Whiteboard</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">DSA, Coding & CS</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-blue-500 self-end mt-2 group-hover:translate-x-1 transition" />
                            </button>

                            {/* Card 3: HR & Behavioral */}
                            <button
                                onClick={() => onSelectQuickAction('behavioral')}
                                className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100 hover:border-pink-300 text-left transition transform hover:-translate-y-0.5 flex flex-col justify-between group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-extrabold text-slate-900">HR & Behavioral</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Soft Skills & STAR</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-pink-500 self-end mt-2 group-hover:translate-x-1 transition" />
                            </button>

                            {/* Card 4: Group Discussion */}
                            <button
                                onClick={() => onSelectQuickAction('gd')}
                                className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 hover:border-emerald-300 text-left transition transform hover:-translate-y-0.5 flex flex-col justify-between group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-extrabold text-slate-900">Group Discussion</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Practice with AI Panel</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-emerald-500 self-end mt-2 group-hover:translate-x-1 transition" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Row 3: Tools & Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* AI Insights Banner */}
                <div className="lg:col-span-2 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white border border-purple-800/50 shadow-lg relative overflow-hidden flex flex-col justify-between">
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">AI Preparation Studio</span>
                            </div>
                            <h3 className="text-base font-bold text-white">
                                Welcome, {user?.name ? user.name.split(' ')[0] : 'Candidate'}! 👋
                            </h3>
                            <p className="text-xs text-purple-200/90 mt-1 max-w-md">
                                Launch dynamic mock interviews tailored to your exact target role and company.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tools & Resources */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 mb-4">Tools & Resources</h3>
                        <div className="space-y-3">
                            <button
                                onClick={onOpenATS}
                                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                        <FileCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900">ATS Resume Checker</h4>
                                        <p className="text-[10px] text-slate-500">Analyze your resume score</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>

                            <button
                                onClick={onOpenQuestionBank}
                                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900">Question Bank</h4>
                                        <p className="text-[10px] text-slate-500">10,000+ curated questions</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>

                            <button
                                onClick={onOpenHistory}
                                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                                        <History className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900">Interview History</h4>
                                        <p className="text-[10px] text-slate-500">View past sessions & reports</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
