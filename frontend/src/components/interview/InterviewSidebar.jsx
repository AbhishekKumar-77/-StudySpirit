import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, History, PlayCircle, BookOpen, BarChart3, FileText, Sparkles
} from 'lucide-react';

export default function InterviewSidebar({ activeTab, setActiveTab }) {
    const navigate = useNavigate();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'interviews', label: 'My Interviews', icon: History },
        { id: 'practice', label: 'Practice Sessions', icon: PlayCircle },
        { id: 'question-bank', label: 'Question Bank', icon: BookOpen },
        { id: 'reports', label: 'Performance Reports', icon: BarChart3 },
        { id: 'ats', label: 'Resume & ATS Score', icon: FileText }
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
                        <span className="text-[10px] font-bold text-orange-500 tracking-wider uppercase">AI Interview Prep</span>
                    </div>
                </div>

                {/* Navigation Items */}
                <div>
                    <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Interview Hub</p>
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

            {/* Subtle Footer */}
            <div className="pt-4 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400 font-semibold">StudySpirit AI Studio v2.4</span>
            </div>
        </aside>
    );
}
