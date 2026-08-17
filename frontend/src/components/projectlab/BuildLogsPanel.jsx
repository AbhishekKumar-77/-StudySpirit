import React, { useState } from 'react';
import { Layers, Plus, CheckCircle2, Clock, Calendar, GitCommit, ExternalLink, Loader2 } from 'lucide-react';
import projectApi from '../../services/projectApi';

export default function BuildLogsPanel({ projects = [], onRefresh }) {
    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?._id || '');
    const [showAddLog, setShowAddLog] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [newLog, setNewLog] = useState({
        title: '',
        description: '',
        commitUrl: '',
        mediaUrl: ''
    });

    const activeProject = projects.find(p => p._id === selectedProjectId) || projects[0];
    const buildLogs = activeProject?.buildLogs || [];

    const handleAddLog = async () => {
        if (!newLog.title.trim() || !activeProject) return;
        setSubmitting(true);
        try {
            await projectApi.addBuildLog(activeProject._id, newLog);
            if (onRefresh) onRefresh();
            setShowAddLog(false);
            setNewLog({ title: '', description: '', commitUrl: '', mediaUrl: '' });
        } catch (e) {
            alert('Failed to add build update');
        } finally {
            setSubmitting(false);
        }
    };

    const journeyStages = [
        { label: 'Idea', status: 'completed' },
        { label: 'Planning', status: 'completed' },
        { label: 'Development', status: 'in-progress' },
        { label: 'Testing', status: 'pending' },
        { label: 'Deployment', status: activeProject?.liveUrl ? 'completed' : 'pending' }
    ];

    return (
        <div className="space-y-6">
            {/* Header + Project Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-emerald-600" />
                        Project Build Logs & Development Timeline
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Build updates demonstrate how you construct software over time, not just the final outcome.
                    </p>
                </div>

                {projects.length > 0 && (
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                        >
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowAddLog(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add Build Update
                        </button>
                    </div>
                )}
            </div>

            {activeProject ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left 2 Cols: Timeline */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Development Journey Stages */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                                Development Stage Journey
                            </h3>
                            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                                {journeyStages.map((stage, idx) => (
                                    <div key={idx} className="flex items-center gap-2 flex-1 min-w-[100px]">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${stage.status === 'completed'
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                : stage.status === 'in-progress'
                                                    ? 'bg-amber-100 text-amber-700 border border-amber-300 animate-pulse'
                                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                            }`}>
                                            {stage.status === 'completed' ? '✓' : idx + 1}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-800">{stage.label}</div>
                                            <div className="text-[10px] text-slate-400 capitalize">{stage.status.replace('-', ' ')}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Logs Timeline */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                            <h3 className="font-bold text-slate-900 text-sm">Update History</h3>

                            {buildLogs.length > 0 ? (
                                <div className="space-y-6 relative pl-4 border-l-2 border-slate-100 ml-2">
                                    {buildLogs.map((log, idx) => (
                                        <div key={idx} className="relative group">
                                            <div className="absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-4 ring-slate-50" />
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-slate-900 text-sm">{log.title}</h4>
                                                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(log.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                {log.description && (
                                                    <p className="text-xs text-slate-600 leading-relaxed">{log.description}</p>
                                                )}
                                                {log.commitUrl && (
                                                    <a
                                                        href={log.commitUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                                                    >
                                                        <GitCommit className="w-3 h-3" /> View Commit
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                                    <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                                    <p className="text-xs font-semibold text-slate-600">No build updates logged yet</p>
                                    <p className="text-[11px] text-slate-400">Record architectural decisions, commit highlights, and deployment milestones.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Add Log Modal/Form */}
                    {showAddLog && (
                        <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-md space-y-4">
                            <h3 className="font-bold text-slate-900 text-sm">Add Build Update</h3>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Update Title *</label>
                                <input
                                    type="text"
                                    value={newLog.title}
                                    onChange={(e) => setNewLog({ ...newLog, title: e.target.value })}
                                    placeholder="e.g. Implemented JWT Authentication"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={newLog.description}
                                    onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                                    placeholder="What was built or changed in this update..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Commit / Demo URL (Optional)</label>
                                <input
                                    type="url"
                                    value={newLog.commitUrl}
                                    onChange={(e) => setNewLog({ ...newLog, commitUrl: e.target.value })}
                                    placeholder="https://github.com/org/repo/commit/..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <button
                                    onClick={() => setShowAddLog(false)}
                                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddLog}
                                    disabled={submitting || !newLog.title.trim()}
                                    className="px-4 py-1.5 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
                                >
                                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Update'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-500">No projects available for build logs.</p>
                </div>
            )}
        </div>
    );
}
