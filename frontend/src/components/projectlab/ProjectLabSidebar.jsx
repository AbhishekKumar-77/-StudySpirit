import React from 'react';
import {
    FolderGit2, LayoutDashboard, Plus, Github, Compass, Sparkles,
    Trophy, ShieldCheck, FileText, FolderPlus, Settings, Share2,
    Layers, Award, CheckCircle2, ChevronRight, Eye, Code, Zap
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
                { id: 'build-logs', label: 'Build Logs', icon: Layers },
                { id: 'portfolio', label: 'Portfolio', icon: ShieldCheck }
            ]
        },
        {
            title: 'DISCOVER',
            items: [
                { id: 'explore', label: 'Explore Projects', icon: Compass },
                { id: 'recommended', label: 'Recommended', icon: Sparkles },
                { id: 'challenges', label: 'Challenges', icon: Trophy }
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
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shadow-sm z-30">
            <div>
                {/* Header / Branding */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                            <FolderGit2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900 text-base leading-snug">Project Lab</h1>
                            <p className="text-[11px] text-slate-500 font-medium">Build. Document. Showcase.</p>
                        </div>
                    </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="p-4 space-y-2">
                    <button
                        onClick={onOpenBuilder}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all hover:shadow-md hover:shadow-emerald-600/20 active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                    <button
                        onClick={onOpenGithubImport}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-all border border-slate-200/60"
                    >
                        <Github className="w-3.5 h-3.5 text-slate-800" />
                        Import from GitHub
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="px-3 py-2 space-y-5 overflow-y-auto max-h-[calc(100vh-230px)]">
                    {navSections.map((section, idx) => (
                        <div key={idx}>
                            <h2 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
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
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive
                                                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
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

            {/* Bottom Status / Recruiter Signal */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Portfolio Status</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                    Your evidence-backed portfolio is visible to 24 recruiters.
                </p>
            </div>
        </aside>
    );
}
