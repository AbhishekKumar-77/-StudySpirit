import React from 'react';
import {
    Star, GitFork, Eye, ExternalLink, Github, ShieldCheck,
    CheckCircle2, Globe, Lock, Edit3, Trash2, Code, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectCard({
    project = {},
    isOwner = false,
    onStar,
    onDelete,
    onToggleFeatured
}) {
    const navigate = useNavigate();

    const techList = [
        ...(project.techStack || []),
        ...(project.technologies || []).flatMap(g => g.items || [])
    ];
    const uniqueTechs = [...new Set(techList)];

    const score = project.strengthScore || 80;

    return (
        <div
            onClick={() => navigate(`/project-lab/${project._id}`)}
            className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer relative flex flex-col justify-between"
        >
            {/* Top row: Badges + Action Buttons */}
            <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                            {project.category || project.domain || 'Project'}
                        </span>
                        {project.featured && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-200 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Featured
                            </span>
                        )}
                        {project.visibility === 'private' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Private
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {isOwner && onToggleFeatured && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleFeatured(project._id); }}
                                title={project.featured ? "Unfeature project" : "Feature on portfolio"}
                                className={`p-1.5 rounded-lg border transition-all ${project.featured
                                        ? 'bg-amber-50 border-amber-200 text-amber-600'
                                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500'
                                    }`}
                            >
                                <Star className={`w-3.5 h-3.5 ${project.featured ? 'fill-amber-400' : ''}`} />
                            </button>
                        )}
                        {isOwner && onDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(project._id); }}
                                title="Delete project"
                                className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Project Title + Description */}
                <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1 flex items-center gap-1.5">
                    {project.name}
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-4 leading-relaxed">
                    {project.description || project.story?.problem || 'No description provided.'}
                </p>

                {/* Tech Stack Pills */}
                {uniqueTechs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {uniqueTechs.slice(0, 4).map((tech, idx) => (
                            <span
                                key={idx}
                                className="text-[11px] font-medium px-2 py-0.5 bg-slate-50 text-slate-700 rounded-md border border-slate-200/80"
                            >
                                {tech}
                            </span>
                        ))}
                        {uniqueTechs.length > 4 && (
                            <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                                +{uniqueTechs.length - 4}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Row: Evidence Strength + Stats + Links */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {/* Strength score */}
                <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800 text-xs">{score}/100</span>
                    <span className="text-[10px] text-slate-400">Strength</span>
                </div>

                {/* Evidence badges */}
                <div className="flex items-center gap-2 text-slate-400">
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="GitHub Repository"
                            className="hover:text-slate-900 transition-colors flex items-center gap-0.5 text-[11px]"
                        >
                            <Github className="w-3.5 h-3.5" />
                        </a>
                    )}
                    {project.liveUrl && (
                        <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Live Demo"
                            className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors flex items-center gap-0.5 text-[11px]"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                    {onStar && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onStar(project._id); }}
                            className="flex items-center gap-1 text-slate-500 hover:text-amber-500 transition-colors ml-1"
                        >
                            <Star className={`w-3.5 h-3.5 ${project.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                            <span className="text-[11px] font-semibold">{project.starCount || 0}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
