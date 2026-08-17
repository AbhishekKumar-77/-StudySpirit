import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, GraduationCap, Star, History, Zap, Compass, Code, Brain, Settings, Sparkles, TrendingUp
} from 'lucide-react';

export default function ResourceSidebar({ activeTab, setActiveTab, semester = 5 }) {
    const navigate = useNavigate();

    const navItems = [
        { id: 'library', label: 'Library', icon: BookOpen },
        { id: 'courses', label: 'My Courses', icon: GraduationCap },
        { id: 'saved', label: 'Saved', icon: Star },
        { id: 'recent', label: 'Recent', icon: History },
        { id: 'exam-prep', label: 'Exam Prep', icon: Zap }
    ];

    const studyHubItems = [
        { label: 'Interview Prep', path: '/interview', icon: Compass },
        { label: 'CodeSpirit', path: '/codespirit', icon: Code },
        { label: 'Skill Analyzer', path: '/soft-skills', icon: Brain },
        { label: 'Planner', path: '/planner', icon: Settings }
    ];

    return (
        <aside className="w-64 bg-[#0b1329] text-slate-300 flex flex-col justify-between p-4 min-h-screen border-r border-slate-800 shadow-xl shrink-0 select-none">
            <div>
                {/* Brand Logo */}
                <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/80">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white leading-tight tracking-tight">StudySpirit</h2>
                        <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">Resource Hub</span>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="mb-6">
                    <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Resource Catalog</p>
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
                                            ? 'bg-cyan-600/90 text-white shadow-md shadow-cyan-900/40 font-semibold'
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

                {/* Hub Shortcuts */}
                <div>
                    <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">StudySpirit Hub</p>
                    <nav className="space-y-1">
                        {studyHubItems.map((item) => {
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

            {/* Bottom Semester Widget */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 mt-6">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-400 font-medium">B.Tech CSE · Sem {semester}</span>
                    <span className="text-sm font-extrabold text-cyan-400">LPU</span>
                </div>
                <div className="text-[10px] text-slate-400 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>Verified Academic Library</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full w-[68%]" />
                </div>
            </div>
        </aside>
    );
}
