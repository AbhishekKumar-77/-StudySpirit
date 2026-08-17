import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import projectApi from '../services/projectApi';

import ProjectStrengthMeter from '../components/projectlab/ProjectStrengthMeter';
import AriaCoach from '../components/projectlab/AriaCoach';

import {
    ArrowLeft, Star, GitFork, Eye, ExternalLink, Github,
    Globe, Lock, Edit3, Trash2, Code, ShieldCheck,
    CheckCircle2, Loader2, Copy, Sparkles, Plus, X,
    FileText, Save, Tag, Calendar, ChevronRight, BookOpen,
    Users, AlertCircle, Layers
} from 'lucide-react';

export default function ProjectDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useApp();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState('overview'); // overview | story | evidence | readme | build-logs
    const [aiSummary, setAiSummary] = useState('');
    const [aiSkills, setAiSkills] = useState([]);
    const [generatingSummary, setGeneratingSummary] = useState(false);

    const isOwner = project && (project.owner?._id === user?._id || project.owner?._id?.toString() === user?._id?.toString());

    const loadProject = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await projectApi.getProject(projectId);
            setProject(res.project);
            if (res.project.aiSummary) setAiSummary(res.project.aiSummary);
        } catch (e) {
            setError(e.message || 'Failed to load project');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadProject();
    }, [loadProject]);

    const handleGenerateAiSummary = async () => {
        setGeneratingSummary(true);
        try {
            const res = await projectApi.generateProjectSummary(projectId);
            setAiSummary(res.summary);
            setAiSkills(res.skills || []);
        } catch (e) {
            alert('AI Summary generation failed');
        } finally {
            setGeneratingSummary(false);
        }
    };

    const handleToggleStar = async () => {
        try {
            const res = await projectApi.toggleStar(projectId);
            setProject(prev => ({ ...prev, starCount: res.starCount, starred: res.starred }));
        } catch (e) { }
    };

    const handleDeleteProject = async () => {
        if (!confirm(`Are you sure you want to delete "${project.name}"?`)) return;
        try {
            await projectApi.deleteProject(projectId);
            navigate('/project-lab');
        } catch (e) { alert('Delete failed'); }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
    );

    if (error || !project) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Project Not Found</h3>
                <p className="text-xs text-slate-500 mb-4">{error || 'The requested project could not be loaded.'}</p>
                <button
                    onClick={() => navigate('/project-lab')}
                    className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl"
                >
                    ← Back to Project Lab
                </button>
            </div>
        </div>
    );

    const score = project.strengthScore || 85;
    const ownerName = project.owner?.name || 'Abhishek Kumar';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Top Header */}
            <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/project-lab')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => navigate('/project-lab')}>Project Lab</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            <span className="font-bold text-slate-900">{project.name}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleToggleStar}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border ${project.starred ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Star className={`w-3.5 h-3.5 ${project.starred ? 'fill-amber-400' : ''}`} />
                            {project.starCount || 0}
                        </button>

                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800"
                            >
                                <Github className="w-3.5 h-3.5" /> Repository
                            </a>
                        )}

                        {project.liveUrl && (
                            <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-emerald-700"
                            >
                                <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                            </a>
                        )}

                        {isOwner && (
                            <button
                                onClick={handleDeleteProject}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto p-6 space-y-6">

                {/* Hero Banner */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                                    {project.projectType || 'Personal'} • {project.domain || 'Web'}
                                </span>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Evidence Score: {score}/100
                                </span>
                            </div>

                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.name}</h1>
                            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                                {project.description || project.story?.problem || 'No description provided.'}
                            </p>
                        </div>

                        {/* Built by Author Badge */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 min-w-[200px]">
                            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                                {ownerName.charAt(0)}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900">{ownerName}</div>
                                <div className="text-[10px] text-slate-500">Student Developer</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-1 border-t border-slate-100 pt-3">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'story', label: 'Project Story' },
                            { id: 'evidence', label: 'Technical Evidence' },
                            { id: 'readme', label: 'README.md' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeTab === t.id
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Views */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        <div className="lg:col-span-2 space-y-6">

                            {/* Recruiter AI Summary Card */}
                            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-2xl p-6 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-300" />
                                        <h3 className="font-bold text-sm text-white">AI Project Summary for Recruiters</h3>
                                    </div>
                                    {isOwner && (
                                        <button
                                            onClick={handleGenerateAiSummary}
                                            disabled={generatingSummary}
                                            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] rounded-lg border border-white/20 flex items-center gap-1"
                                        >
                                            {generatingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            {aiSummary ? 'Regenerate' : 'Generate Summary'}
                                        </button>
                                    )}
                                </div>

                                <p className="text-xs text-purple-100 leading-relaxed">
                                    {aiSummary || 'Generate an AI technical summary to provide recruiters with a concise 3-sentence signal of your engineering capability based on real project evidence.'}
                                </p>

                                {aiSkills.length > 0 && (
                                    <div className="pt-2 border-t border-purple-800/60">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Skills Demonstrated:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {aiSkills.map((s, idx) => (
                                                <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 bg-white/10 text-purple-200 rounded-md">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Story Highlights */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-900 text-sm">Project Story Highlights</h3>

                                <div className="space-y-4 text-xs">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-xs mb-1 text-emerald-700">Problem</h4>
                                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            {project.story?.problem || 'No problem statement provided.'}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-slate-800 text-xs mb-1 text-cyan-700">Solution</h4>
                                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            {project.story?.solution || 'No solution description provided.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Col */}
                        <div className="space-y-6">
                            <ProjectStrengthMeter project={project} />
                        </div>
                    </div>
                )}

                {/* README TAB */}
                {activeTab === 'readme' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {project.readme || 'No README content available.'}
                        </pre>
                    </div>
                )}
            </main>
        </div>
    );
}
