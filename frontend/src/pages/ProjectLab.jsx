import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import projectApi from '../services/projectApi';

import ProjectLabSidebar from '../components/projectlab/ProjectLabSidebar';
import ProjectLabHeader from '../components/projectlab/ProjectLabHeader';
import ProjectLabOverview from '../components/projectlab/ProjectLabOverview';
import ProjectCard from '../components/projectlab/ProjectCard';
import ProjectBuilder from '../components/projectlab/ProjectBuilder';
import BuildLogsPanel from '../components/projectlab/BuildLogsPanel';
import PortfolioPanel from '../components/projectlab/PortfolioPanel';
import ExplorePanel from '../components/projectlab/ExplorePanel';

import { Github, Loader2, X, FolderGit2, Plus, Search, Filter } from 'lucide-react';

export default function ProjectLab() {
    const { user } = useApp();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Full-page builder mode
    const [showBuilder, setShowBuilder] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    // GitHub import modal
    const [showGithubModal, setShowGithubModal] = useState(false);
    const [importGithubUrl, setImportGithubUrl] = useState('');
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [projRes, statsRes] = await Promise.all([
                projectApi.getMyProjects(),
                projectApi.getProjectStats().catch(() => ({ stats: {} }))
            ]);
            setProjects(projRes.projects || []);
            setStats(statsRes.stats || {});
        } catch (e) {
            console.error('Failed to load Project Lab data:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeatured = async (projectId) => {
        try {
            const res = await projectApi.toggleFeatured(projectId);
            setProjects(prev => prev.map(p => p._id === projectId ? { ...p, featured: res.featured } : p));
        } catch (e) {
            alert(e.message || 'Failed to toggle featured status');
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await projectApi.deleteProject(projectId);
            setProjects(prev => prev.filter(p => p._id !== projectId));
        } catch (e) {
            alert('Failed to delete project');
        }
    };

    const handleGithubImportSubmit = async () => {
        if (!importGithubUrl.trim()) return;
        setImporting(true);
        try {
            const res = await projectApi.importGithub('preview', importGithubUrl.trim());
            setShowGithubModal(false);
            setImportGithubUrl('');
            setEditingProject({
                name: res.meta?.name || 'GitHub Imported Project',
                description: res.meta?.description || '',
                githubUrl: importGithubUrl.trim(),
                techStack: Object.keys(res.meta?.languages || {})
            });
            setShowBuilder(true);
        } catch (e) {
            alert('GitHub import failed: ' + e.message);
        } finally {
            setImporting(false);
        }
    };

    if (showBuilder) {
        return (
            <ProjectBuilder
                projectData={editingProject}
                onCancel={() => { setShowBuilder(false); setEditingProject(null); }}
                onSuccess={(savedProject) => {
                    setShowBuilder(false);
                    setEditingProject(null);
                    loadData();
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
            {/* Left Sidebar */}
            <ProjectLabSidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    if (tab === 'project-builder') {
                        setEditingProject(null);
                        setShowBuilder(true);
                    } else {
                        setActiveTab(tab);
                    }
                }}
                onOpenBuilder={() => { setEditingProject(null); setShowBuilder(true); }}
                onOpenGithubImport={() => setShowGithubModal(true)}
            />

            {/* Right Main Container (Header + Dashboard) */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                {/* Global Search & User Profile Header Bar */}
                <ProjectLabHeader
                    user={user}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* Tab View Container */}
                <main className="p-6 md:p-8 max-w-[1400px] w-full mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-96">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <ProjectLabOverview
                                    user={user}
                                    stats={stats}
                                    projects={projects}
                                    onOpenBuilder={() => { setEditingProject(null); setShowBuilder(true); }}
                                    onOpenGithubImport={() => setShowGithubModal(true)}
                                    onToggleFeatured={handleToggleFeatured}
                                    onDeleteProject={handleDeleteProject}
                                    onNavigateTab={setActiveTab}
                                />
                            )}

                            {activeTab === 'my-projects' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex items-center justify-between">
                                        <div>
                                            <h1 className="text-xl font-bold text-slate-900">My Projects</h1>
                                            <p className="text-xs text-slate-500">Manage, edit, and organize your technical projects.</p>
                                        </div>
                                        <button
                                            onClick={() => { setEditingProject(null); setShowBuilder(true); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs"
                                        >
                                            <Plus className="w-4 h-4" /> New Project
                                        </button>
                                    </div>

                                    {projects.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {projects.map(project => (
                                                <ProjectCard
                                                    key={project._id}
                                                    project={project}
                                                    isOwner={true}
                                                    onToggleFeatured={handleToggleFeatured}
                                                    onDelete={handleDeleteProject}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
                                            <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <h3 className="font-bold text-slate-800 text-sm">No Projects Created Yet</h3>
                                            <p className="text-xs text-slate-500 mb-4">Start documenting your first project to build your verified portfolio.</p>
                                            <button
                                                onClick={() => { setEditingProject(null); setShowBuilder(true); }}
                                                className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                                            >
                                                + Create New Project
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'build-logs' && (
                                <BuildLogsPanel
                                    projects={projects}
                                    onRefresh={loadData}
                                />
                            )}

                            {activeTab === 'portfolio' && (
                                <PortfolioPanel
                                    user={user}
                                    projects={projects}
                                    onToggleFeatured={handleToggleFeatured}
                                />
                            )}

                            {activeTab === 'explore' && (
                                <ExplorePanel />
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* GitHub Import Modal */}
            {showGithubModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                <Github className="w-5 h-5 text-slate-900" />
                                Import Project from GitHub
                            </h3>
                            <button onClick={() => setShowGithubModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed">
                            Enter any public GitHub repository URL. StudySpirit will automatically extract title, README, languages, and metadata.
                        </p>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Repository URL</label>
                            <input
                                type="url"
                                value={importGithubUrl}
                                onChange={(e) => setImportGithubUrl(e.target.value)}
                                placeholder="https://github.com/username/repo-name"
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setShowGithubModal(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGithubImportSubmit}
                                disabled={importing || !importGithubUrl.trim()}
                                className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Fetch Repository'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
