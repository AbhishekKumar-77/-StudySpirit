import React from 'react';
import {
    LayoutDashboard, BookOpen, MessageSquare, Mic, FileText,
    BarChart3, Volume2, Globe, Flame, Award, Sparkles, Headphones,
    PenTool, Zap, ShieldCheck, Presentation, Bookmark, CheckCircle2
} from 'lucide-react';

export default function EnglishLabSidebar({ activeTab, setActiveTab }) {
    const modules = [
        {
            moduleId: 'main',
            title: 'DASHBOARD',
            items: [
                { id: 'overview', label: 'Overview & Goals', icon: LayoutDashboard, badge: null }
            ]
        },
        {
            moduleId: 'spoken',
            title: 'MODULE 1: SPOKEN FLUENCY',
            items: [
                { id: 'conversation', label: 'AI Spoken Coach (Aria)', icon: MessageSquare, badge: 'Live Voice' },
                { id: 'pronunciation', label: 'Pronunciation & Phonetics', icon: Volume2, badge: 'IPA' },
                { id: 'extempore', label: 'Extempore Impromptu Talk', icon: Mic, badge: '2-Min' }
            ]
        },
        {
            moduleId: 'professional',
            title: 'MODULE 2: CAREER & WORKPLACE',
            items: [
                { id: 'situations', label: 'Real-Life Roleplay', icon: Globe, badge: 'Scenarios' },
                { id: 'writing', label: 'Professional Writing Lab', icon: FileText, badge: 'Tone AI' },
                { id: 'presentation', label: 'Presentation & Body Language', icon: Presentation, badge: 'New' }
            ]
        },
        {
            moduleId: 'mechanics',
            title: 'MODULE 3: LANGUAGE MECHANICS',
            items: [
                { id: 'grammar', label: 'Targeted Grammar Coach', icon: PenTool, badge: 'Mistakes' },
                { id: 'vocabulary', label: 'Vocabulary & Idiom Builder', icon: BookOpen, badge: 'Flashcards' }
            ]
        },
        {
            moduleId: 'analytics',
            title: 'MODULE 4: REPORTS & BANK',
            items: [
                { id: 'progress', label: 'Skills Radar & Mistake Bank', icon: BarChart3, badge: null }
            ]
        }
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 shadow-2xs z-30 flex-shrink-0">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                {/* Logo & Subtitle */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 flex-shrink-0">
                        <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-black text-slate-900 text-sm leading-tight tracking-tight">Soft Skills & Comm.</h1>
                        <p className="text-[11px] text-purple-700 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-600" /> Mastery Lab
                        </p>
                    </div>
                </div>

                {/* Nav Modules & Submodules */}
                <nav className="px-3 py-4 space-y-4">
                    {modules.map((mod, idx) => (
                        <div key={idx} className="space-y-1">
                            <h2 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                <span>{mod.title}</span>
                            </h2>
                            <div className="space-y-0.5">
                                {mod.items.map(item => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                                isActive
                                                    ? 'bg-purple-600 text-white font-bold shadow-sm shadow-purple-600/30'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                                <span className="truncate">{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider flex-shrink-0 ${
                                                    isActive ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Bottom Card: Target CEFR Level */}
            <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">Current Level</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold">B1 Intermediate</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full" style={{ width: '68%' }} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">68% progress towards B2 Proficiency</p>
                </div>
            </div>
        </aside>
    );
}
