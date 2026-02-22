import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import projectApi from '../services/projectApi';
import {
    FolderGit2, Plus, Star, GitFork, Eye, ExternalLink, Github,
    Search, Filter, Grid, List, Trash2, Edit, Globe, Lock,
    Code, Smartphone, Brain, Server, Layers, Cloud, Gamepad2, Box,
    ArrowLeft, Loader, Calendar, Tag, MoreVertical, X, Check
} from 'lucide-react';

const categoryIcons = {
    'web': Code,
    'mobile': Smartphone,
    'ai-ml': Brain,
    'backend': Server,
    'fullstack': Layers,
    'devops': Cloud,
    'blockchain': Box,
    'game': Gamepad2,
    'other': FolderGit2
};

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

export default function ProjectLab() {
    const { user } = useApp();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my'); // my, explore
    const [viewMode, setViewMode] = useState('grid'); // grid, list
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    // New project form
    const [newProject, setNewProject] = useState({
        name: '',
        description: '',
        category: 'web',
        visibility: 'public',
        techStack: [],
        githubUrl: '',
        liveUrl: ''
    });
    const [techInput, setTechInput] = useState('');

    useEffect(() => {
        loadProjects();
    }, [activeTab, categoryFilter]);

    const loadProjects = async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === 'my') {
                response = await projectApi.getMyProjects();
            } else {
                response = await projectApi.exploreProjects({
                    category: categoryFilter !== 'all' ? categoryFilter : undefined
                });
            }
            setProjects(response.projects || []);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!newProject.name.trim()) return;

        setCreating(true);
        try {
            const response = await projectApi.createProject(newProject);
            setProjects(prev => [response.project, ...prev]);
            setShowCreateModal(false);
            setNewProject({
                name: '',
                description: '',
                category: 'web',
                visibility: 'public',
                techStack: [],
                githubUrl: '',
                liveUrl: ''
            });
        } catch (error) {
            console.error('Failed to create project:', error);
            alert('Failed to create project');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            await projectApi.deleteProject(projectId);
            setProjects(prev => prev.filter(p => p._id !== projectId));
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    const handleToggleStar = async (projectId) => {
        try {
            const response = await projectApi.toggleStar(projectId);
            setProjects(prev => prev.map(p =>
                p._id === projectId
                    ? { ...p, starCount: response.starCount, starred: response.starred }
                    : p
            ));
        } catch (error) {
            console.error('Failed to toggle star:', error);
        }
    };

    const addTechStack = () => {
        if (techInput.trim() && !newProject.techStack.includes(techInput.trim())) {
            setNewProject(prev => ({
                ...prev,
                techStack: [...prev.techStack, techInput.trim()]
            }));
            setTechInput('');
        }
    };

    const removeTechStack = (tech) => {
        setNewProject(prev => ({
            ...prev,
            techStack: prev.techStack.filter(t => t !== tech)
        }));
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const ProjectCard = ({ project }) => {
        const CategoryIcon = categoryIcons[project.category] || FolderGit2;
        const isOwner = project.owner?._id === user?._id || project.owner === user?._id;

        return (
            <div className={`bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] overflow-hidden hover:border-cyan-500/30 transition-all group ${viewMode === 'list' ? 'flex items-center' : ''}`}>
                {/* Thumbnail / Header */}
                <div className={`bg-gradient-to-br ${categoryColors[project.category]} p-4 ${viewMode === 'list' ? 'w-20 h-20 flex-shrink-0' : 'h-32'} flex items-center justify-center relative`}>
                    <CategoryIcon className={`text-[var(--text-primary)]/80 ${viewMode === 'list' ? 'w-8 h-8' : 'w-12 h-12'}`} />
                    {project.visibility === 'private' && (
                        <div className="absolute top-2 right-2 bg-[var(--bg-secondary)]lack/30 p-1 rounded">
                            <Lock className="w-3 h-3 text-[var(--text-primary)]" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex items-center justify-between' : ''}`}>
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-cyan- transition-colors line-clamp-1">
                                {project.name}
                            </h3>
                            {isOwner && viewMode !== 'list' && (
                                <div className="flex gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/project-lab/${project._id}/edit`); }}
                                        className="p-1 hover:bg-white/10 rounded"
                                    >
                                        <Edit className="w-4 h-4 text-[var(--text-secondary)]" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(project._id); }}
                                        className="p-1 hover:bg-red-500/20 rounded"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {viewMode !== 'list' && (
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
                                {project.description || 'No description'}
                            </p>
                        )}

                        {/* Tech Stack */}
                        {viewMode !== 'list' && project.techStack?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {project.techStack.slice(0, 3).map((tech, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-cyan-/20 text-violet-300 text-xs rounded-full">
                                        {tech}
                                    </span>
                                ))}
                                {project.techStack.length > 3 && (
                                    <span className="px-2 py-0.5 bg-white/10 text-[var(--text-secondary)] text-xs rounded-full">
                                        +{project.techStack.length - 3}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className={`flex items-center gap-4 text-xs text-[var(--text-muted)] ${viewMode === 'list' ? 'ml-4' : 'mt-3 pt-3 border-t border-[var(--border-color)]'}`}>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleToggleStar(project._id); }}
                            className="flex items-center gap-1 hover:text-yellow-400 transition-colors"
                        >
                            <Star className={`w-4 h-4 ${project.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            {project.starCount || 0}
                        </button>
                        <span className="flex items-center gap-1">
                            <GitFork className="w-4 h-4" />
                            {project.forkCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {project.views || 0}
                        </span>
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-[var(--text-primary)]"
                            >
                                <Github className="w-4 h-4" />
                            </a>
                        )}
                        {project.liveUrl && (
                            <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-[var(--text-primary)]"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-emerald-500/20 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-2 rounded-lg">
                                <FolderGit2 className="w-6 h-6 text-[var(--text-primary)]" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                    Project Lab
                                </h1>
                                <p className="text-xs text-[var(--text-secondary)]">Your Personal Project Portfolio</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6">
                {/* Tabs & Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'my'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                                }`}
                        >
                            My Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('explore')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'explore'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                                }`}
                        >
                            Explore
                        </button>
                    </div>

                    {/* Search & View */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search projects..."
                                className="pl-10 pr-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none w-64"
                            />
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none"
                        >
                            <option value="all">All Categories</option>
                            <option value="web">Web</option>
                            <option value="mobile">Mobile</option>
                            <option value="ai-ml">AI/ML</option>
                            <option value="backend">Backend</option>
                            <option value="fullstack">Fullstack</option>
                            <option value="devops">DevOps</option>
                            <option value="blockchain">Blockchain</option>
                            <option value="game">Game</option>
                            <option value="other">Other</option>
                        </select>

                        <div className="flex bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-[var(--text-secondary)] hover:bg-white/10'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-emerald-500/20 text-emerald-400' : 'text-[var(--text-secondary)] hover:bg-white/10'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Projects Grid/List */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader className="w-8 h-8 animate-spin text-emerald-400" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <FolderGit2 className="w-16 h-16 text-[var(--text-primary)] mb-4" />
                        <h3 className="text-xl font-semibold text-[var(--text-secondary)] mb-2">No Projects Yet</h3>
                        <p className="text-[var(--text-muted)] mb-4">
                            {activeTab === 'my'
                                ? "Create your first project to showcase your work!"
                                : "No public projects found. Be the first to share!"}
                        </p>
                        {activeTab === 'my' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Create Project
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'flex flex-col gap-3'
                    }>
                        {filteredProjects.map(project => (
                            <div
                                key={project._id}
                                onClick={() => navigate(`/project-lab/${project._id}`)}
                                className="cursor-pointer"
                            >
                                <ProjectCard project={project} />
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-[var(--bg-secondary)]lack/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Create New Project</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg"
                            >
                                <X className="w-5 h-5 text-[var(--text-secondary)]" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Project Name */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Project Name *</label>
                                <input
                                    type="text"
                                    value={newProject.name}
                                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="My Awesome Project"
                                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="A brief description of your project..."
                                    rows={3}
                                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none resize-none"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category</label>
                                <select
                                    value={newProject.category}
                                    onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-emerald-500/50 focus:outline-none"
                                >
                                    <option value="web">Web Development</option>
                                    <option value="mobile">Mobile App</option>
                                    <option value="ai-ml">AI / Machine Learning</option>
                                    <option value="backend">Backend / API</option>
                                    <option value="fullstack">Full Stack</option>
                                    <option value="devops">DevOps / Cloud</option>
                                    <option value="blockchain">Blockchain / Web3</option>
                                    <option value="game">Game Development</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Visibility</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setNewProject(prev => ({ ...prev, visibility: 'public' }))}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${newProject.visibility === 'public'
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5'
                                            }`}
                                    >
                                        <Globe className="w-4 h-4" />
                                        Public
                                    </button>
                                    <button
                                        onClick={() => setNewProject(prev => ({ ...prev, visibility: 'private' }))}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${newProject.visibility === 'private'
                                                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5'
                                            }`}
                                    >
                                        <Lock className="w-4 h-4" />
                                        Private
                                    </button>
                                </div>
                            </div>

                            {/* Tech Stack */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tech Stack</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={techInput}
                                        onChange={(e) => setTechInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
                                        placeholder="e.g. React, Node.js"
                                        className="flex-1 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
                                    />
                                    <button
                                        onClick={addTechStack}
                                        className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
                                    >
                                        Add
                                    </button>
                                </div>
                                {newProject.techStack.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newProject.techStack.map((tech, idx) => (
                                            <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-cyan-/20 text-violet-300 text-sm rounded-full">
                                                {tech}
                                                <button onClick={() => removeTechStack(tech)} className="hover:text-red-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* GitHub URL */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">GitHub URL (optional)</label>
                                <input
                                    type="url"
                                    value={newProject.githubUrl}
                                    onChange={(e) => setNewProject(prev => ({ ...prev, githubUrl: e.target.value }))}
                                    placeholder="https://github.com/username/repo"
                                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
                                />
                            </div>

                            {/* Live URL */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Live Demo URL (optional)</label>
                                <input
                                    type="url"
                                    value={newProject.liveUrl}
                                    onChange={(e) => setNewProject(prev => ({ ...prev, liveUrl: e.target.value }))}
                                    placeholder="https://myproject.vercel.app"
                                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-[var(--border-color)] flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateProject}
                                disabled={!newProject.name.trim() || creating}
                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creating ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
