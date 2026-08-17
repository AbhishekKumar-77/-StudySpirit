import React, { useState } from 'react';
import { ShieldCheck, Share2, Copy, CheckCircle2, Globe, Lock, ExternalLink, Star, Code } from 'lucide-react';
import ProjectCard from './ProjectCard';

export default function PortfolioPanel({ user = {}, projects = [], onToggleFeatured }) {
    const [copied, setCopied] = useState(false);

    const studentName = user?.name || 'Abhishek Kumar';
    const publicUrl = `${window.location.origin}/profile/${user?._id || 'user'}`;

    const featuredProjects = projects.filter(p => p.featured && (p.visibility === 'public' || p.visibility === 'recruiter-only'));
    const publicProjects = projects.filter(p => p.visibility === 'public' || p.visibility === 'recruiter-only');

    const copyShareLink = () => {
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Portfolio Share Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <h1 className="text-xl font-bold text-white">Public Student Portfolio</h1>
                    </div>
                    <p className="text-xs text-slate-300">
                        Generated automatically from your verified Project Lab evidence. Share with recruiters & hiring managers.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={copyShareLink}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
                    >
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Link Copied!' : 'Copy Shareable Portfolio URL'}
                    </button>
                </div>
            </div>

            {/* Portfolio Preview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-md">
                        {studentName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{studentName}</h2>
                        <p className="text-xs font-semibold text-emerald-700">Full Stack Developer & AI Systems Engineer</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {['React', 'Node.js', 'MongoDB', 'AI Integration', 'Python'].map(s => (
                                <span key={s} className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Featured Projects Preview */}
                <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                        Featured Portfolio Projects ({featuredProjects.length})
                    </h3>

                    {featuredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {featuredProjects.map(project => (
                                <ProjectCard
                                    key={project._id}
                                    project={project}
                                    isOwner={true}
                                    onToggleFeatured={onToggleFeatured}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl text-center">
                            No featured projects selected. Select "Feature Project" on any project card to showcase it at the top of your portfolio.
                        </p>
                    )}
                </div>

                {/* All Public Projects */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-600" />
                        All Public Projects ({publicProjects.length})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {publicProjects.map(project => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                isOwner={true}
                                onToggleFeatured={onToggleFeatured}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
