import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import projectApi from '../services/projectApi';
import {
    ArrowLeft, Star, GitFork, Eye, ExternalLink, Github,
    Globe, Lock, Edit3, Trash2, Code, Smartphone, Brain,
    Server, Layers, Cloud, Gamepad2, Box, FolderGit2,
    CheckCircle, Loader, Copy, Sparkles, Plus, X,
    FileText, Save, Building2, Tag, Calendar, RefreshCw,
    ChevronRight, BookOpen, AlertCircle
} from 'lucide-react';

const categoryColors = {
    'web': 'from-blue-500 to-cyan-500',
    'mobile': 'from-green-500 to-emerald-500',
    'ai-ml': 'from-purple-500 to-pink-500',
    'backend': 'from-orange-500 to-red-500',
    'fullstack': 'from-indigo-500 to-violet-500',
    'devops': 'from-teal-500 to-cyan-500',
    'blockchain': 'from-yellow-500 to-orange-500',
    'game': 'from-pink-500 to-rose-500',
    'other': 'from-slate-500 to-gray-500'
};
const categoryIcons = {
    'web': Code, 'mobile': Smartphone, 'ai-ml': Brain,
    'backend': Server, 'fullstack': Layers, 'devops': Cloud,
    'blockchain': Box, 'game': Gamepad2, 'other': FolderGit2
};
const statusConfig = {
    'in-progress': { label: 'In Progress', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    'completed': { label: 'Completed', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    'archived': { label: 'Archived', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

// ── Simple Markdown Renderer ──────────────────────────────────────────────────
function MarkdownView({ content }) {
    const render = (text) => {
        const lines = text.split('\n');
        const elements = [];
        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            if (line.startsWith('# ')) {
                elements.push(<h1 key={i} className="text-3xl font-black text-white mt-6 mb-3">{line.slice(2)}</h1>);
            } else if (line.startsWith('## ')) {
                elements.push(<h2 key={i} className="text-xl font-black text-emerald-400 mt-6 mb-2 flex items-center gap-2">{line.slice(3)}</h2>);
            } else if (line.startsWith('### ')) {
                elements.push(<h3 key={i} className="text-base font-bold text-white mt-4 mb-1">{line.slice(4)}</h3>);
            } else if (line.startsWith('```')) {
                const lang = line.slice(3).trim();
                const codeLines = [];
                i++;
                while (i < lines.length && !lines[i].startsWith('```')) {
                    codeLines.push(lines[i]);
                    i++;
                }
                elements.push(
                    <pre key={i} className="bg-black/40 border border-white/10 rounded-xl p-4 overflow-x-auto my-3 text-sm">
                        <code className="text-emerald-300 font-mono">{codeLines.join('\n')}</code>
                    </pre>
                );
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                const items = [];
                while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
                    items.push(<li key={i} className="text-slate-300 text-sm ml-4 mb-1 flex items-start gap-2"><span className="text-emerald-400 mt-1 flex-shrink-0">▸</span>{inlineFormat(lines[i].slice(2))}</li>);
                    i++;
                }
                elements.push(<ul key={`ul-${i}`} className="my-2 space-y-0.5">{items}</ul>);
                continue;
            } else if (/^\d+\.\s/.test(line)) {
                const items = [];
                let num = 0;
                while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                    num++;
                    items.push(<li key={i} className="text-slate-300 text-sm mb-1 flex items-start gap-2"><span className="text-cyan-400 font-bold flex-shrink-0 w-5">{num}.</span>{inlineFormat(lines[i].replace(/^\d+\.\s/, ''))}</li>);
                    i++;
                }
                elements.push(<ol key={`ol-${i}`} className="my-2 space-y-0.5">{items}</ol>);
                continue;
            } else if (line.startsWith('---') || line.startsWith('___')) {
                elements.push(<hr key={i} className="border-white/10 my-4" />);
            } else if (line.startsWith('> ')) {
                elements.push(<blockquote key={i} className="border-l-4 border-emerald-500 pl-4 py-1 my-2 text-slate-400 text-sm italic">{line.slice(2)}</blockquote>);
            } else if (line.startsWith('|')) {
                // Simple table
                const rows = [];
                while (i < lines.length && lines[i].startsWith('|')) {
                    if (!lines[i].match(/^[\|\s\-:]+$/)) {
                        const cells = lines[i].split('|').filter(c => c.trim());
                        rows.push(cells);
                    }
                    i++;
                }
                elements.push(
                    <div key={`tbl-${i}`} className="overflow-x-auto my-3">
                        <table className="w-full text-sm border-collapse">
                            <tbody>
                                {rows.map((r, ri) => (
                                    <tr key={ri} className={ri === 0 ? 'bg-white/10 font-bold' : 'hover:bg-white/5'}>
                                        {r.map((c, ci) => (
                                            <td key={ci} className="border border-white/10 px-3 py-2 text-slate-300">{c.trim()}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
                continue;
            } else if (line.trim() === '') {
                elements.push(<div key={i} className="h-2" />);
            } else {
                elements.push(<p key={i} className="text-slate-300 text-sm leading-relaxed mb-1">{inlineFormat(line)}</p>);
            }
            i++;
        }
        return elements;
    };

    const inlineFormat = (text) => {
        // Bold, italic, code, links handled simply
        const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="bg-black/40 text-emerald-300 px-1.5 py-0.5 rounded text-[12px] font-mono">{part.slice(1, -1)}</code>;
            if (part.match(/^\[[^\]]+\]\([^)]+\)$/)) {
                const label = part.match(/\[([^\]]+)\]/)?.[1];
                const href = part.match(/\(([^)]+)\)/)?.[1];
                return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{label}</a>;
            }
            // Shields.io badges
            if (part.match(/!\[.*?\]\(https?:\/\/img\.shields\.io[^)]+\)/)) {
                const alt = part.match(/\[([^\]]+)\]/)?.[1];
                const src = part.match(/\(([^)]+)\)/)?.[1];
                return <img key={i} src={src} alt={alt} className="inline h-5 mr-1" onError={e => e.target.style.display = 'none'} />;
            }
            return part;
        });
    };

    return <div className="prose-custom leading-relaxed">{render(content)}</div>;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProjectDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useApp();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('readme'); // readme | files | info
    const [editingReadme, setEditingReadme] = useState(false);
    const [readmeDraft, setReadmeDraft] = useState('');
    const [savingReadme, setSavingReadme] = useState(false);
    const [generatingReadme, setGeneratingReadme] = useState(false);
    const [copied, setCopied] = useState(false);

    // New file form
    const [showAddFile, setShowAddFile] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFileContent, setNewFileContent] = useState('');
    const [newFileLang, setNewFileLang] = useState('javascript');
    const [addingFile, setAddingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const isOwner = project && (project.owner?._id === user?._id || project.owner?._id?.toString() === user?._id?.toString());

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await projectApi.getProject(projectId);
            setProject(data.project);
            setReadmeDraft(data.project.readme || '');
        } catch (e) {
            setError(e.message || 'Failed to load project');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { load(); }, [load]);

    const handleToggleStar = async () => {
        try {
            const res = await projectApi.toggleStar(projectId);
            setProject(prev => ({ ...prev, starCount: res.starCount, starred: res.starred }));
        } catch { }
    };

    const handleFork = async () => {
        try {
            await projectApi.forkProject(projectId);
            navigate('/project-lab');
        } catch (e) { alert('Fork failed: ' + e.message); }
    };

    const handleSaveReadme = async () => {
        setSavingReadme(true);
        try {
            await projectApi.updateProject(projectId, { readme: readmeDraft });
            setProject(prev => ({ ...prev, readme: readmeDraft }));
            setEditingReadme(false);
        } catch (e) { alert('Save failed'); }
        finally { setSavingReadme(false); }
    };

    const handleGenerateReadme = async () => {
        setGeneratingReadme(true);
        try {
            const res = await projectApi.generateReadme(projectId);
            setReadmeDraft(res.readme);
            setProject(prev => ({ ...prev, readme: res.readme }));
            setEditingReadme(false);
        } catch (e) { alert('AI generation failed'); }
        finally { setGeneratingReadme(false); }
    };

    const handleAddFile = async () => {
        if (!newFileName.trim()) return;
        setAddingFile(true);
        try {
            await projectApi.addFile(projectId, {
                name: newFileName.trim(),
                path: newFileName.trim(),
                content: newFileContent,
                language: newFileLang
            });
            await load();
            setShowAddFile(false);
            setNewFileName('');
            setNewFileContent('');
        } catch (e) { alert('Failed to add file'); }
        finally { setAddingFile(false); }
    };

    const handleDeleteFile = async (filePath) => {
        if (!confirm('Delete this file?')) return;
        try {
            await projectApi.deleteFile(projectId, filePath);
            await load();
            if (selectedFile?.path === filePath) setSelectedFile(null);
        } catch { alert('Delete failed'); }
    };

    const handleDeleteProject = async () => {
        if (!confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) return;
        try {
            await projectApi.deleteProject(projectId);
            navigate('/project-lab');
        } catch { alert('Delete failed'); }
    };

    const copyReadme = () => {
        navigator.clipboard.writeText(project?.readme || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <Loader className="w-10 h-10 animate-spin text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Loading project...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-white font-bold mb-2">Failed to load project</p>
                <p className="text-slate-400 text-sm mb-4">{error}</p>
                <button onClick={() => navigate('/project-lab')}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all">
                    ← Back to Projects
                </button>
            </div>
        </div>
    );

    if (!project) return null;

    const CategoryIcon = categoryIcons[project.category] || FolderGit2;
    const gradColor = categoryColors[project.category] || categoryColors.other;
    const statusCfg = statusConfig[project.status] || statusConfig['in-progress'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            {/* BG blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => navigate('/project-lab')}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all flex-shrink-0">
                            <ArrowLeft size={18} className="text-slate-400" />
                        </button>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-sm min-w-0">
                            <span className="text-slate-500 hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/project-lab')}>Project Lab</span>
                            <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
                            <span className="text-white font-bold truncate">{project.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Star */}
                        <button onClick={handleToggleStar}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border ${project.starred ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-yellow-400'}`}>
                            <Star size={14} fill={project.starred ? 'currentColor' : 'none'} />
                            {project.starCount || 0}
                        </button>
                        {/* Fork */}
                        {!isOwner && (
                            <button onClick={handleFork}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
                                <GitFork size={14} /> Fork
                            </button>
                        )}
                        {/* GitHub */}
                        {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
                                <Github size={18} />
                            </a>
                        )}
                        {/* Live */}
                        {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90 transition-all">
                                <ExternalLink size={14} /> Live Demo
                            </a>
                        )}
                        {/* Delete (owner only) */}
                        {isOwner && (
                            <button onClick={handleDeleteProject}
                                className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row gap-6 mb-8">
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradColor} flex items-center justify-center flex-shrink-0 shadow-2xl`}>
                        <CategoryIcon size={36} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-black text-white">{project.name}</h1>
                            {project.visibility === 'private' && (
                                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400">
                                    <Lock size={11} /> Private
                                </span>
                            )}
                            <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${statusCfg.cls}`}>{statusCfg.label}</span>
                        </div>
                        <p className="text-slate-400 mb-3 leading-relaxed">{project.description || 'No description provided.'}</p>

                        {/* Tech Stack */}
                        {project.techStack?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {project.techStack.map(t => (
                                    <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-medium">{t}</span>
                                ))}
                            </div>
                        )}

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Eye size={12} /> {project.views || 0} views</span>
                            <span className="flex items-center gap-1"><Star size={12} /> {project.starCount || 0} stars</span>
                            <span className="flex items-center gap-1"><GitFork size={12} /> {project.forkCount || 0} forks</span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {project.owner?.name && (
                                <span className="flex items-center gap-1">
                                    <span className="text-lg">{project.owner.avatar || '👨‍💻'}</span>
                                    {project.owner.name}
                                </span>
                            )}
                            {project.forkedFrom && (
                                <span className="flex items-center gap-1 text-yellow-500">
                                    <GitFork size={12} /> Forked project
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-6 w-fit">
                    {[
                        { id: 'readme', label: 'README', icon: BookOpen },
                        { id: 'files', label: `Files (${project.files?.length || 0})`, icon: FileText },
                        { id: 'info', label: 'Info', icon: Tag },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── README TAB ── */}
                {activeTab === 'readme' && (
                    <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
                        {/* README Actions */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                                <BookOpen size={15} className="text-emerald-400" /> README.md
                            </div>
                            <div className="flex items-center gap-2">
                                {isOwner && !editingReadme && (
                                    <>
                                        <button onClick={handleGenerateReadme} disabled={generatingReadme}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 hover:border-purple-500/50 transition-all disabled:opacity-50">
                                            {generatingReadme ? <><Loader size={11} className="animate-spin" /> Generating...</> : <><Sparkles size={11} /> AI Generate</>}
                                        </button>
                                        <button onClick={() => { setReadmeDraft(project.readme || ''); setEditingReadme(true); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 border border-white/20 text-slate-300 hover:text-white transition-all">
                                            <Edit3 size={11} /> Edit
                                        </button>
                                    </>
                                )}
                                {!editingReadme && (
                                    <button onClick={copyReadme}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 border border-white/20 text-slate-400 hover:text-white'}`}>
                                        {copied ? <><CheckCircle size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* README Content */}
                        <div className="p-6">
                            {editingReadme ? (
                                <div className="space-y-3">
                                    <textarea value={readmeDraft} onChange={e => setReadmeDraft(e.target.value)}
                                        className="w-full h-[500px] bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-slate-200 font-mono leading-relaxed resize-none focus:border-emerald-500/40 focus:outline-none" />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setEditingReadme(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-all">Cancel</button>
                                        <button onClick={handleSaveReadme} disabled={savingReadme}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold disabled:opacity-50">
                                            {savingReadme ? <><Loader size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save README</>}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="min-h-[200px]">
                                    {project.readme ? <MarkdownView content={project.readme} /> : (
                                        <div className="text-center py-16">
                                            <BookOpen size={40} className="mx-auto mb-4 text-slate-700" />
                                            <p className="text-slate-500 mb-2">No README yet</p>
                                            {isOwner && (
                                                <button onClick={handleGenerateReadme} disabled={generatingReadme}
                                                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50">
                                                    {generatingReadme ? <><Loader size={14} className="animate-spin" /> Generating with AI...</> : <><Sparkles size={14} /> Generate with AI</>}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── FILES TAB ── */}
                {activeTab === 'files' && (
                    <div className="space-y-4">
                        {/* File Explorer */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ minHeight: 400 }}>
                            {/* File List */}
                            <div className="md:col-span-1 bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
                                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                                    <span className="text-sm font-bold text-slate-300 flex items-center gap-2"><FolderGit2 size={14} className="text-emerald-400" /> Files</span>
                                    {isOwner && (
                                        <button onClick={() => setShowAddFile(true)}
                                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all">
                                            <Plus size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="p-2">
                                    {project.files?.length > 0 ? project.files.map(f => (
                                        <div key={f.path} onClick={() => setSelectedFile(f)}
                                            className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all text-sm ${selectedFile?.path === f.path ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Code size={13} className={selectedFile?.path === f.path ? 'text-emerald-400' : 'text-slate-600'} />
                                                <span className="truncate font-mono text-xs">{f.name}</span>
                                            </div>
                                            {isOwner && (
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.path); }}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 transition-all flex-shrink-0">
                                                    <Trash2 size={11} className="text-red-400" />
                                                </button>
                                            )}
                                        </div>
                                    )) : (
                                        <p className="text-slate-600 text-xs text-center py-8">No files yet</p>
                                    )}
                                </div>
                            </div>

                            {/* File Content */}
                            <div className="md:col-span-2 bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
                                {selectedFile ? (
                                    <>
                                        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-white/5">
                                            <Code size={14} className="text-emerald-400" />
                                            <span className="text-sm font-mono text-slate-300">{selectedFile.name}</span>
                                            <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded text-slate-500">{selectedFile.language}</span>
                                        </div>
                                        <pre className="p-4 text-xs font-mono text-emerald-300 overflow-auto max-h-[500px] leading-relaxed">
                                            <code>{selectedFile.content || '// Empty file'}</code>
                                        </pre>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                                        <Code size={40} className="text-slate-700 mb-3" />
                                        <p className="text-slate-500 text-sm">Select a file to view</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add File Form */}
                        {showAddFile && (
                            <div className="bg-white/3 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-white text-sm flex items-center gap-2"><Plus size={14} className="text-emerald-400" /> Add New File</h3>
                                    <button onClick={() => setShowAddFile(false)} className="p-1 hover:bg-white/10 rounded"><X size={16} className="text-slate-400" /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input value={newFileName} onChange={e => setNewFileName(e.target.value)}
                                        placeholder="filename.js" className="px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white font-mono focus:border-emerald-500/40 focus:outline-none" />
                                    <select value={newFileLang} onChange={e => setNewFileLang(e.target.value)}
                                        className="px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:border-emerald-500/40 focus:outline-none">
                                        {['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust', 'html', 'css', 'sql', 'markdown', 'bash', 'text'].map(l => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                                <textarea value={newFileContent} onChange={e => setNewFileContent(e.target.value)}
                                    placeholder="// Paste your code here..."
                                    rows={8}
                                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-emerald-300 font-mono resize-none focus:border-emerald-500/40 focus:outline-none" />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setShowAddFile(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
                                    <button onClick={handleAddFile} disabled={addingFile || !newFileName.trim()}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold disabled:opacity-50">
                                        {addingFile ? <><Loader size={14} className="animate-spin" /> Adding...</> : <><Plus size={14} /> Add File</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── INFO TAB ── */}
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/3 border border-white/10 rounded-2xl p-5 space-y-4">
                            <h3 className="font-black text-white text-sm flex items-center gap-2"><Tag size={14} className="text-emerald-400" /> Project Details</h3>
                            {[
                                { label: 'Category', value: project.category?.toUpperCase() },
                                { label: 'Status', value: statusCfg.label },
                                { label: 'Visibility', value: project.visibility === 'public' ? '🌐 Public' : '🔒 Private' },
                                { label: 'Created', value: new Date(project.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
                                { label: 'Last Updated', value: new Date(project.updatedAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
                                { label: 'Files', value: project.files?.length || 0 },
                                { label: 'Collaborators', value: project.collaborators?.length || 0 },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                                    <span className="text-slate-500">{item.label}</span>
                                    <span className="text-white font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {/* Tech stack */}
                            <div className="bg-white/3 border border-white/10 rounded-2xl p-5">
                                <h3 className="font-black text-white text-sm mb-3 flex items-center gap-2"><Code size={14} className="text-cyan-400" /> Tech Stack</h3>
                                {project.techStack?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {project.techStack.map(t => (
                                            <span key={t} className="text-sm px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">{t}</span>
                                        ))}
                                    </div>
                                ) : <p className="text-slate-600 text-sm">No tech stack defined</p>}
                            </div>

                            {/* Links */}
                            <div className="bg-white/3 border border-white/10 rounded-2xl p-5">
                                <h3 className="font-black text-white text-sm mb-3 flex items-center gap-2"><Globe size={14} className="text-emerald-400" /> Links</h3>
                                <div className="space-y-2">
                                    {project.githubUrl ? (
                                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all">
                                            <Github size={14} /> {project.githubUrl}
                                        </a>
                                    ) : <p className="text-slate-600 text-xs">No GitHub URL</p>}
                                    {project.liveUrl && (
                                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-all">
                                            <ExternalLink size={14} /> {project.liveUrl}
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="bg-white/3 border border-white/10 rounded-2xl p-5">
                                <h3 className="font-black text-white text-sm mb-3">📊 Stats</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { icon: Star, label: 'Stars', val: project.starCount || 0, color: 'text-yellow-400' },
                                        { icon: GitFork, label: 'Forks', val: project.forkCount || 0, color: 'text-cyan-400' },
                                        { icon: Eye, label: 'Views', val: project.views || 0, color: 'text-purple-400' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                                            <s.icon size={18} className={`${s.color} mx-auto mb-1`} />
                                            <div className={`text-xl font-black ${s.color}`}>{s.val}</div>
                                            <div className="text-[10px] text-slate-600 uppercase tracking-wider">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
