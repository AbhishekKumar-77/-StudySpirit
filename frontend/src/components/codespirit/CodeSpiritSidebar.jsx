import React from 'react';
import { 
    Home, Zap, ListFilter, BookOpen, AlertTriangle, Calendar, 
    Code, Award, Shield, Trophy, BarChart2, History, Bookmark, 
    Bot, ChevronRight, Sparkles 
} from 'lucide-react';

export default function CodeSpiritSidebar({ 
    activeTab, 
    setActiveTab, 
    selectedSubject, 
    setSelectedSubject, 
    onOpenAITutor 
}) {
    const subjects = [
        { id: 'python', name: 'Python', icon: '🐍' },
        { id: 'c', name: 'C', icon: '⚡' },
        { id: 'cpp', name: 'C++', icon: '🔷' },
        { id: 'java', name: 'Java', icon: '☕' },
        { id: 'dsa', name: 'DSA', icon: '🌳' }
    ];

    const mainNav = [
        { id: 'home', label: 'Home', icon: Home }
    ];

    const practiceNav = [
        { id: 'smart-practice', label: 'Smart Practice', icon: Zap },
        { id: 'problems', label: 'Problems', icon: ListFilter },
        { id: 'mistakes', label: 'My Mistakes', icon: AlertTriangle },
        { id: 'daily-challenge', label: 'Daily Challenge', icon: Calendar }
    ];

    const interviewNav = [
        { id: 'company-prep', label: 'Company Prep', icon: Code },
        { id: 'interview-problems', label: 'Interview Problems', icon: Award },
        { id: 'mock-interview', label: 'AI Mock Interview', icon: Sparkles }
    ];

    const competeNav = [
        { id: 'contests', label: 'Contests', icon: Trophy },
        { id: 'leaderboard', label: 'Leaderboard', icon: Shield }
    ];

    const progressNav = [
        { id: 'skill-tree', label: 'Skill Tree', icon: BarChart2 },
        { id: 'history', label: 'History', icon: History },
        { id: 'saved-problems', label: 'Saved Problems', icon: Bookmark }
    ];

    const renderNavItem = (item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
            <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                        ? 'bg-purple-600/10 text-purple-600 font-semibold border-r-4 border-purple-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                }`}
            >
                <Icon size={18} className={isActive ? 'text-purple-600' : 'text-gray-400'} />
                <span>{item.label}</span>
            </button>
        );
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between h-screen sticky top-0 overflow-y-auto p-4 select-none shadow-sm z-20">
            <div>
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-2 py-3 mb-4 cursor-pointer" onClick={() => setActiveTab('home')}>
                    <img
                        src="/logo-icon.png"
                        alt="StudySpirit Logo"
                        className="w-9 h-9 object-contain"
                    />
                    <div>
                        <div className="flex items-center font-black text-lg tracking-tight leading-none">
                            <span className="text-indigo-600">Study</span>
                            <span className="text-slate-800">Spirit</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5">
                            Code • Practice • Grow
                        </p>
                    </div>
                </div>

                {/* Navigation Sections */}
                <div className="space-y-6">
                    {/* Main */}
                    <div>
                        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Main</p>
                        {mainNav.map(renderNavItem)}
                    </div>

                    {/* Practice */}
                    <div>
                        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Practice</p>
                        {practiceNav.map(renderNavItem)}
                    </div>

                    {/* Coding Subjects */}
                    <div>
                        <div className="flex items-center justify-between px-3 mb-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Coding Subjects</p>
                        </div>
                        <div className="space-y-1">
                            {subjects.map(s => {
                                const isSelected = selectedSubject?.toLowerCase() === s.id && activeTab === 'subject-detail';
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setSelectedSubject(s.id);
                                            setActiveTab('subject-detail');
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                                            isSelected 
                                                ? 'bg-indigo-50/80 text-indigo-700 font-semibold border-l-4 border-indigo-600 shadow-sm' 
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-base">{s.icon}</span>
                                            <span>{s.name}</span>
                                        </div>
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Interview */}
                    <div>
                        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Interview</p>
                        {interviewNav.map(renderNavItem)}
                    </div>

                    {/* Compete */}
                    <div>
                        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Compete</p>
                        {competeNav.map(renderNavItem)}
                    </div>

                    {/* Progress */}
                    <div>
                        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Progress</p>
                        {progressNav.map(renderNavItem)}
                    </div>
                </div>
            </div>

            {/* AI Tutor Card Widget */}
            <div className="mt-8 pt-4">
                <button
                    onClick={onOpenAITutor}
                    className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-700 text-white shadow-lg shadow-purple-500/25 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm leading-tight">AI Coding Tutor</h4>
                            <p className="text-[11px] text-purple-200">Ask, learn, code, improve</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-semibold bg-white/15 px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur-sm">
                        <span>Ask anything...</span>
                        <Sparkles size={13} className="text-yellow-300 animate-pulse" />
                    </div>
                </button>
            </div>
        </aside>
    );
}
