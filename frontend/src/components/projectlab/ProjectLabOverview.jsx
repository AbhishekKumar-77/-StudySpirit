import React from 'react';
import {
    Plus, Github, FolderGit2, Globe, Code, Star, ShieldCheck,
    ArrowUpRight, Sparkles, Layers, Activity, CheckCircle2, ChevronRight
} from 'lucide-react';
import ProjectCard from './ProjectCard';
import ProjectStrengthMeter from './ProjectStrengthMeter';
import AriaCoach from './AriaCoach';

export default function ProjectLabOverview({
    user = {},
    stats = {},
    projects = [],
    onOpenBuilder,
    onOpenGithubImport,
    onToggleFeatured,
    onDeleteProject,
    onNavigateTab
}) {
    const studentName = user?.name || 'Abhishek';

    const featuredProjects = projects.filter(p => p.featured);
    const otherProjects = projects.filter(p => !p.featured);

    const statCards = [
        { label: 'Total Projects', value: stats.totalProjects || projects.length, sub: `${stats.published || 0} Published`, color: 'text-slate-900', bg: 'bg-white' },
        { label: 'Live Demos', value: stats.liveDemos || 0, sub: 'Online & Verifiable', color: 'text-emerald-700', bg: 'bg-emerald-50/50 border-emerald-200/60' },
        { label: 'Technologies', value: stats.totalTechnologies || 0, sub: 'Across All Projects', color: 'text-cyan-700', bg: 'bg-cyan-50/50 border-cyan-200/60' },
        { label: 'Featured Projects', value: stats.featuredCount || featuredProjects.length, sub: 'High Recruiter Visibility', color: 'text-amber-700', bg: 'bg-amber-50/50 border-amber-200/60' },
        { label: 'Portfolio Strength', value: `${stats.avgStrength || 82}%`, sub: 'Great Evidence Quality', color: 'text-purple-700', bg: 'bg-purple-50/50 border-purple-200/60' }
    ];

    const suggestedTips = [
        { title: 'Add Architecture Diagram', desc: 'Visual system diagrams boost recruiter comprehension by 40%.', action: 'Add Diagram' },
        { title: 'Deploy to Production', desc: 'Making your live demo accessible proves real-world deployment skills.', action: 'Add Live URL' },
        { title: 'Write Technical Documentation', desc: 'Share API specs and README details to demonstrate documentation clarity.', action: 'Improve Docs' }
    ];

    return (
        <div className="space-y-6">
            {/* Top Greeting Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Good evening, {studentName} 👋
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Build amazing projects. Showcase your skills. Get discovered by recruiters.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenGithubImport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-all"
                    >
                        <Github className="w-4 h-4 text-slate-900" />
                        Import from GitHub
                    </button>
                    <button
                        onClick={onOpenBuilder}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-600/20 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                </div>
            </div>

            {/* Portfolio Statistics 5 Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((card, idx) => (
                    <div key={idx} className={`rounded-2xl border p-4 shadow-sm ${card.bg || 'bg-white border-slate-200'}`}>
                        <div className="text-xs font-bold text-slate-500 mb-1">{card.label}</div>
                        <div className={`text-2xl font-black ${card.color}`}>{card.value}</div>
                        <div className="text-[11px] font-medium text-slate-400 mt-1">{card.sub}</div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid: Left 2 Cols (Featured + Projects) | Right 1 Col (AI Coach + Stats) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-6">

                    {/* Featured Projects Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                                <h2 className="font-bold text-slate-900 text-base">Featured Projects</h2>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">Selected for portfolio showcase</span>
                        </div>

                        {featuredProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {featuredProjects.map(project => (
                                    <ProjectCard
                                        key={project._id}
                                        project={project}
                                        isOwner={true}
                                        onToggleFeatured={onToggleFeatured}
                                        onDelete={onDeleteProject}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                                <p className="text-xs font-semibold text-slate-600">No projects featured yet</p>
                                <p className="text-[11px] text-slate-400">Click the star icon on any project card to highlight it as a featured project on your public portfolio.</p>
                            </div>
                        )}
                    </div>

                    {/* All Projects / My Projects */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-900 text-base">All Projects ({projects.length})</h2>
                            <button
                                onClick={() => onNavigateTab && onNavigateTab('my-projects')}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                            >
                                View All <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.slice(0, 4).map(project => (
                                    <ProjectCard
                                        key={project._id}
                                        project={project}
                                        isOwner={true}
                                        onToggleFeatured={onToggleFeatured}
                                        onDelete={onDeleteProject}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
                                <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto" />
                                <h3 className="font-bold text-slate-800 text-sm">No Projects in Workspace</h3>
                                <p className="text-xs text-slate-500">Create your first project or import a repo from GitHub to get started.</p>
                                <button
                                    onClick={onOpenBuilder}
                                    className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-emerald-700"
                                >
                                    + Create First Project
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Suggested for You */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            Suggested for You
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {suggestedTips.map((tip, idx) => (
                                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-xs">{tip.title}</h4>
                                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">{tip.desc}</p>
                                    </div>
                                    <button
                                        onClick={onOpenBuilder}
                                        className="mt-3 text-[11px] font-bold text-emerald-700 hover:underline text-left flex items-center gap-1"
                                    >
                                        {tip.action} →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: AI Coach + Strength Meter + Top Tech */}
                <div className="space-y-6">

                    {/* AI Coach */}
                    <AriaCoach
                        project={featuredProjects[0] || projects[0] || {}}
                        onOpenSection={() => onOpenBuilder && onOpenBuilder()}
                    />

                    {/* Project Strength Meter */}
                    <ProjectStrengthMeter
                        project={featuredProjects[0] || projects[0] || {}}
                    />

                    {/* Top Technologies */}
                    {stats.topTechnologies && stats.topTechnologies.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <Code className="w-4 h-4 text-cyan-600" />
                                Top Technologies Used
                            </h3>
                            <div className="space-y-2">
                                {stats.topTechnologies.map((tech, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className="text-slate-800">{tech.name}</span>
                                            <span className="text-slate-500">{tech.count} project{tech.count > 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-cyan-500 rounded-full"
                                                style={{ width: `${Math.min(100, (tech.count / Math.max(1, projects.length)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
