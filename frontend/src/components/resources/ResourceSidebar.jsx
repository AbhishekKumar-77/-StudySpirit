import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, GraduationCap, Star, History, Zap, TrendingUp
} from 'lucide-react';

export default function ResourceSidebar({ activeTab, setActiveTab, semester = 5 }) {
    const navigate = useNavigate();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'library', label: 'Library', icon: BookOpen },
        { id: 'courses', label: 'My Courses', icon: GraduationCap },
        { id: 'saved', label: 'Saved', icon: Star },
        { id: 'recent', label: 'Recent', icon: History },
        { id: 'exam-prep', label: 'Exam Prep', icon: Zap }
    ];

    return (
        <aside className="w-64 bg-white text-slate-700 flex flex-col justify-between p-4 min-h-screen border-r border-slate-200 shadow-xs shrink-0 select-none">
            <div>
                {/* Original StudySpirit Brand Logo */}
                <div
                    className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-100 cursor-pointer hover:opacity-90 transition"
                    onClick={() => navigate('/dashboard')}
                >
                    <img
                        src="/logo-icon.png"
                        alt="StudySpirit Logo"
                        className="w-10 h-10 object-contain shrink-0"
                    />
                    <div className="flex flex-col">
                        <span className="text-[18px] font-extrabold tracking-tight leading-tight">
                            <span className="text-slate-800">Study</span><span className="text-[#e07b00] font-black">Spirit</span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 tracking-wider">Learn • Practice • Grow</span>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="mb-6">
                    <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Resource Catalog</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        isActive
                                            ? 'bg-orange-50/90 text-[#ff5733] font-extrabold shadow-xs border-l-4 border-[#ff5733]'
                                            : 'hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 font-semibold'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#ff5733]' : 'text-slate-400'}`} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Bottom Semester Widget in Light Mode */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mt-6">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-500 font-medium">B.Tech CSE · Sem {semester}</span>
                    <span className="text-xs font-extrabold text-[#ff5733]">LPU</span>
                </div>
                <div className="text-[10px] text-slate-400 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span>Verified Academic Library</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full w-[68%]" />
                </div>
            </div>
        </aside>
    );
}
