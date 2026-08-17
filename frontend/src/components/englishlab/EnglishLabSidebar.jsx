import React from 'react';
import {
    LayoutDashboard, BookOpen, MessageSquare, Mic, FileText,
    BarChart3, Volume2, Globe, Flame, Award, Sparkles, Headphones,
    PenTool, Zap, ShieldCheck
} from 'lucide-react';

export default function EnglishLabSidebar({ activeTab, setActiveTab }) {
    const navSections = [
        {
            title: 'MAIN',
            items: [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard }
            ]
        },
        {
            title: 'LEARN',
            items: [
                { id: 'grammar', label: 'Grammar Coach', icon: PenTool },
                { id: 'vocabulary', label: 'Vocabulary Builder', icon: BookOpen },
                { id: 'pronunciation', label: 'Pronunciation Coach', icon: Volume2 }
            ]
        },
        {
            title: 'SPEAK',
            items: [
                { id: 'conversation', label: 'AI Conversation', icon: MessageSquare },
                { id: 'situations', label: 'Real Situations', icon: Globe }
            ]
        },
        {
            title: 'PRACTICE',
            items: [
                { id: 'extempore', label: 'Extempore Speaking', icon: Mic },
                { id: 'writing', label: 'Writing Lab', icon: FileText }
            ]
        },
        {
            title: 'PROGRESS',
            items: [
                { id: 'progress', label: 'Reports & Vocab Bank', icon: BarChart3 }
            ]
        }
    ];

    return (
        <aside className="w-60 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 shadow-2xs z-30 flex-shrink-0">
            <div className="overflow-y-auto flex-1">
                {/* Logo & Subtitle */}
                <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm shadow-purple-600/30 flex-shrink-0">
                        <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 text-sm leading-tight tracking-tight">English & Comm. Lab</h1>
                        <p className="text-[11px] text-purple-700 font-semibold">Communicate Like a Pro</p>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="px-3 py-4 space-y-4">
                    {navSections.map((section, idx) => (
                        <div key={idx}>
                            <h2 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                {section.title}
                            </h2>
                            <div className="space-y-0.5">
                                {section.items.map(item => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                                                    ? 'bg-purple-50 text-purple-700 font-bold'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                                                <span>{item.label}</span>
                                            </div>
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Bottom Card: Target CEFR Level */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">Current Level</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px]">B1 Intermediate</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: '64%' }} />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">64% progress towards B2 Upper-Intermediate</p>
                </div>
            </div>
        </aside>
    );
}
