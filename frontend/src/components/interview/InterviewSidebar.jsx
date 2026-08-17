import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, History, PlayCircle, BookOpen, BarChart3, FileText,
    Code, Brain, Settings, Sparkles, TrendingUp, Compass
} from 'lucide-react';

export default function InterviewSidebar({ activeTab, setActiveTab, readinessScore = 76 }) {
    const navigate = useNavigate();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'interviews', label: 'My Interviews', icon: History },
        { id: 'practice', label: 'Practice', icon: PlayCircle },
        { id: 'question-bank', label: 'Question Bank', icon: BookOpen },
        { id: 'reports', label: 'Reports', icon: BarChart3 },
        { id: 'ats', label: 'Resume & ATS', icon: FileText }
    ];

    const studySpiritItems = [
        { label: 'CareerSprint', path: '/career', icon: Compass },
        { label: 'CodeSpirit', path: '/codespirit', icon: Code },
        { label: 'Skill Analyzer', path: '/soft-skills', icon: Brain },
        { label: 'Settings', path: '/planner', icon: Settings }
    ];

    return (
        <aside className="w-64 bg-[#0b1329] text-slate-300 flex flex-col justify-between p-4 min-h-screen border-r border-slate-800 shadow-xl shrink-0 select-none">
            <div>
                {/* Brand Logo */}
                <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/80">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white leading-tight tracking-tight">StudySpirit</h2>
                        <span className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase">Interview Prep</span>
                    </div>
                </div>

                {/* Main Prep Navigation */}
                <div className="mb-6">
                    <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Preparation</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                                        isActive
                                            ? 'bg-purple-600/90 text-white shadow-md shadow-purple-900/40 font-semibold'
                                            : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Main StudySpirit Navigation */}
                <div>
                    <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">StudySpirit Hub</p>
                    <nav className="space-y-1">
                        {studySpiritItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => navigate(item.path)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-all"
                                >
                                    <Icon className="w-4 h-4 text-slate-400" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Bottom Readiness Widget */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 mt-6">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-400 font-medium">Interview Readiness</span>
                    <span className="text-sm font-extrabold text-cyan-400">{readinessScore}%</span>
                </div>
                <div className="text-[10px] text-slate-400 mb-3 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>Good Progress!</span>
                </div>
                {/* Mini Sparkline SVG */}
                <div className="h-9 w-full bg-slate-950/60 rounded-lg flex items-end px-2 py-1 gap-1 border border-slate-800">
                    <div className="w-1/6 bg-purple-500/40 rounded-t h-[40%]" />
                    <div className="w-1/6 bg-purple-500/60 rounded-t h-[55%]" />
                    <div className="w-1/6 bg-purple-500/80 rounded-t h-[70%]" />
                    <div className="w-1/6 bg-cyan-400 rounded-t h-[65%]" />
                    <div className="w-1/6 bg-cyan-400 rounded-t h-[85%]" />
                    <div className="w-1/6 bg-emerald-400 rounded-t h-[100%]" />
                </div>
            </div>
        </aside>
    );
}
