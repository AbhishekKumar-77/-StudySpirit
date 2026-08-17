import React from 'react';
import {
    FolderGit2, LayoutDashboard, Plus, Github, Compass, Sparkles,
    Trophy, ShieldCheck, FileText, FolderPlus, Settings, Share2,
    Layers, Award, CheckCircle2, ChevronRight, Eye, Code, Zap,
    Edit3, Target
} from 'lucide-react';

export default function ProjectLabSidebar({
    activeTab,
    setActiveTab,
    onOpenBuilder,
    onOpenGithubImport
}) {
    const navSections = [
        {
            title: 'WORKSPACE',
            items: [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'my-projects', label: 'My Projects', icon: FolderGit2 },
                { id: 'project-builder', label: 'Project Builder', icon: Edit3 },
                { id: 'build-logs', label: 'Build Logs', icon: Layers },
                { id: 'portfolio', label: 'Portfolio', icon: ShieldCheck }
            ]
        },
        {
            title: 'DISCOVER',
            items: [
                { id: 'explore', label: 'Explore Projects', icon: Compass },
                { id: 'challenges', label: 'Challenges', icon: Target }
            ]
        },
        {
            title: 'EVIDENCE',
            items: [
                { id: 'github', label: 'GitHub Integrations', icon: Github },
                { id: 'documentation', label: 'Documentation', icon: FileText },
                { id: 'media', label: 'Media Library', icon: FolderPlus }
            ]
        },
        {
            title: 'SETTINGS',
            items: [
                { id: 'settings', label: 'Project Settings', icon: Settings },
                { id: 'sharing', label: 'Visibility & Sharing', icon: Share2 }
            ]
        }
    ];

    return (
        <aside className="w-60 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 shadow-2xs z-30 flex-shrink-0">
            <div className="overflow-y-auto flex-1">
                {/* Logo & Subtitle Header */}
                <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/30 flex-shrink-0">
                        <FolderGit2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight">Project Lab</h1>
                        <p className="text-[11px] text-slate-400 font-medium">Build. Document. Showcase.</p>
                    </div>
                </div>

                {/* Navigation Sections */}
                <nav className="px-3 py-4 space-y-5">
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
                                                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                                                <span>{item.label}</span>
                                            </div>
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Bottom Card: Portfolio Strength Gauge */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs text-center space-y-2">
                    <h3 className="font-bold text-slate-900 text-xs">Portfolio Strength</h3>

                    {/* Circular SVG Gauge */}
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-100"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-emerald-500"
                                strokeDasharray="82, 100"
                                strokeWidth="3"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-xs font-black text-slate-900 leading-none">82%</span>
                            <span className="block text-[8px] font-medium text-slate-400">Great job!</span>
                        </div>
                    </div>

                    <button
                        onClick={onOpenBuilder}
                        className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-[11px] rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1"
                    >
                        Improve Portfolio →
                    </button>
                </div>
            </div>
        </aside>
    );
}
