import React, { useState, useMemo } from 'react';
import {
    ArrowRight, CheckCircle2, Clock, AlertTriangle, Building, X,
    FileText, UserCheck, Code, Sparkles, Plus, Trash2, ExternalLink,
    Search, Filter, LayoutGrid, List, ChevronRight, MoreVertical,
    Calendar, DollarSign, MapPin, Briefcase, TrendingUp, Check, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ApplicationTrackerKanban({ applications = [], onMoveStage, onSelectApp }) {
    const navigate = useNavigate();

    // Local State
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
    const [stageFilter, setStageFilter] = useState('all'); // 'all' | 'active' | stageId
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAppModal, setSelectedAppModal] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTabNotes, setActiveTabNotes] = useState('');

    // Local Applications Data state (if parent passes initial list)
    const [localApps, setLocalApps] = useState(() => {
        return applications.length > 0 ? applications : defaultApps;
    });

    // Sync if applications prop updates
    React.useEffect(() => {
        if (applications && applications.length > 0) {
            setLocalApps(applications);
        }
    }, [applications]);

    // New Application Form State
    const [newAppForm, setNewAppForm] = useState({
        company: '',
        role: '',
        stage: 'applied',
        location: 'Remote / India',
        salary: '₹12–20 LPA',
        link: '',
        notes: ''
    });

    // Pipeline Columns Definition
    const pipelineColumns = [
        { id: 'saved', label: 'Saved', color: 'border-slate-200 bg-slate-50/70', badgeColor: 'bg-slate-200 text-slate-700', headerBg: 'from-slate-600 to-slate-800' },
        { id: 'preparing', label: 'Preparing', color: 'border-amber-200 bg-amber-50/30', badgeColor: 'bg-amber-100 text-amber-800', headerBg: 'from-amber-500 to-amber-600' },
        { id: 'applied', label: 'Applied', color: 'border-blue-200 bg-blue-50/30', badgeColor: 'bg-blue-100 text-blue-800', headerBg: 'from-blue-600 to-cyan-600' },
        { id: 'assessment', label: 'Assessment', color: 'border-purple-200 bg-purple-50/30', badgeColor: 'bg-purple-100 text-purple-800', headerBg: 'from-purple-600 to-indigo-600' },
        { id: 'interview', label: 'Interview', color: 'border-cyan-200 bg-cyan-50/30', badgeColor: 'bg-cyan-100 text-cyan-800', headerBg: 'from-cyan-600 to-teal-600' },
        { id: 'offer', label: 'Offer', color: 'border-emerald-200 bg-emerald-50/30', badgeColor: 'bg-emerald-100 text-emerald-800', headerBg: 'from-emerald-600 to-teal-600' },
        { id: 'rejected', label: 'Rejected', color: 'border-rose-200 bg-rose-50/30', badgeColor: 'bg-rose-100 text-rose-800', headerBg: 'from-rose-500 to-red-600' },
        { id: 'withdrawn', label: 'Withdrawn', color: 'border-slate-200 bg-slate-50/30', badgeColor: 'bg-slate-100 text-slate-600', headerBg: 'from-slate-400 to-slate-500' }
    ];

    // Filter applications
    const filteredApps = useMemo(() => {
        return localApps.filter(app => {
            if (stageFilter === 'active' && ['rejected', 'withdrawn'].includes(app.stage)) return false;
            if (stageFilter !== 'all' && stageFilter !== 'active' && app.stage !== stageFilter) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const comp = (app.company || '').toLowerCase();
                const role = (app.role || '').toLowerCase();
                const loc = (app.location || '').toLowerCase();
                if (!comp.includes(q) && !role.includes(q) && !loc.includes(q)) return false;
            }
            return true;
        });
    }, [localApps, stageFilter, searchQuery]);

    // Analytics Calculation
    const analytics = useMemo(() => {
        const total = localApps.length;
        const active = localApps.filter(a => !['rejected', 'withdrawn'].includes(a.stage)).length;
        const interviews = localApps.filter(a => a.stage === 'interview').length;
        const offers = localApps.filter(a => a.stage === 'offer').length;
        const conversion = total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0;
        return { total, active, interviews, offers, conversion };
    }, [localApps]);

    // Stage Change Handler
    const handleMoveStage = (appId, newStage) => {
        setLocalApps(prev => prev.map(a => a.id === appId ? { ...a, stage: newStage } : a));
        if (selectedAppModal && selectedAppModal.id === appId) {
            setSelectedAppModal(prev => ({ ...prev, stage: newStage }));
        }
    };

    // Delete Application
    const handleDeleteApp = (appId, e) => {
        if (e) e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this application?')) {
            setLocalApps(prev => prev.filter(a => a.id !== appId));
            if (selectedAppModal && selectedAppModal.id === appId) {
                setSelectedAppModal(null);
            }
        }
    };

    // Add Application Handler
    const handleAddApplication = (e) => {
        e.preventDefault();
        if (!newAppForm.company || !newAppForm.role) return;

        const newApp = {
            id: `app_${Date.now()}`,
            company: newAppForm.company,
            role: newAppForm.role,
            stage: newAppForm.stage,
            location: newAppForm.location || 'Remote',
            salary: newAppForm.salary || 'Competitive',
            date: 'Applied today',
            nextAction: newAppForm.stage === 'applied' ? 'Awaiting recruiter review' : 'Prepare next round',
            logo: `https://logo.clearbit.com/${newAppForm.company.toLowerCase().replace(/\s/g, '')}.com`,
            link: newAppForm.link,
            notes: newAppForm.notes
        };

        setLocalApps(prev => [newApp, ...prev]);
        setShowAddModal(false);
        setNewAppForm({
            company: '', role: '', stage: 'applied',
            location: 'Remote / India', salary: '₹12–20 LPA', link: '', notes: ''
        });
    };

    return (
        <div className="space-y-6 select-none font-sans text-slate-800">
            {/* Header & Pipeline Analytics Bar */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-50 text-cyan-700 px-2.5 py-0.5 rounded-full border border-cyan-100">
                                Opportunity Pipeline
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                                Real-Time Application Tracking
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                            Application Tracker & Stage Manager
                        </h2>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md shadow-cyan-600/20 transition flex items-center justify-center gap-2 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Application</span>
                    </button>
                </div>

                {/* 4 Analytics Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Total Applications</span>
                        <span className="text-2xl font-black text-slate-900 mt-0.5 block">{analytics.total}</span>
                    </div>

                    <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 text-center">
                        <span className="text-[10px] font-extrabold text-blue-700 uppercase block">Active Pipeline</span>
                        <span className="text-2xl font-black text-blue-600 mt-0.5 block">{analytics.active}</span>
                    </div>

                    <div className="bg-cyan-50/60 border border-cyan-100 rounded-2xl p-3.5 text-center">
                        <span className="text-[10px] font-extrabold text-cyan-700 uppercase block">Interviews</span>
                        <span className="text-2xl font-black text-cyan-600 mt-0.5 block">{analytics.interviews}</span>
                    </div>

                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 text-center">
                        <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">Offers</span>
                        <span className="text-2xl font-black text-emerald-600 mt-0.5 block">{analytics.offers}</span>
                    </div>

                    <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-3.5 text-center col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-extrabold text-purple-700 uppercase block">Conversion Index</span>
                        <span className="text-2xl font-black text-purple-600 mt-0.5 block">{analytics.conversion}%</span>
                    </div>
                </div>
            </div>

            {/* Filter & Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search company, role, or location..."
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-slate-800"
                    />
                </div>

                {/* Stage Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-bold">
                    <button
                        onClick={() => setStageFilter('all')}
                        className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                            stageFilter === 'all'
                                ? 'bg-slate-900 text-white font-extrabold shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        All ({localApps.length})
                    </button>
                    <button
                        onClick={() => setStageFilter('active')}
                        className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                            stageFilter === 'active'
                                ? 'bg-cyan-600 text-white font-extrabold shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Active Pipeline ({analytics.active})
                    </button>
                    {pipelineColumns.map(col => {
                        const count = localApps.filter(a => a.stage === col.id).length;
                        return (
                            <button
                                key={col.id}
                                onClick={() => setStageFilter(col.id)}
                                className={`px-2.5 py-1.5 rounded-xl transition shrink-0 ${
                                    stageFilter === col.id
                                        ? 'bg-cyan-600 text-white font-extrabold shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {col.label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* View Switcher: Board vs Table */}
                <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold shrink-0">
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                            viewMode === 'kanban'
                                ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                                : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Board</span>
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                            viewMode === 'table'
                                ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                                : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <List className="w-3.5 h-3.5" />
                        <span>Table View</span>
                    </button>
                </div>
            </div>

            {/* VIEW 1: KANBAN BOARD (Spacious Horizontal Scroll) */}
            {viewMode === 'kanban' ? (
                <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-thin scrollbar-thumb-slate-300">
                    {pipelineColumns
                        .filter(col => stageFilter === 'all' || stageFilter === 'active' || stageFilter === col.id)
                        .map((col) => {
                            const appsInCol = filteredApps.filter(a => a.stage === col.id);

                            return (
                                <div
                                    key={col.id}
                                    className={`w-72 shrink-0 rounded-3xl p-4 border ${col.color} flex flex-col justify-between min-h-[460px] shadow-2xs`}
                                >
                                    {/* Column Header */}
                                    <div className="pb-3 mb-3 border-b border-slate-200/80">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${col.headerBg}`} />
                                                <span className="text-sm font-black text-slate-900">{col.label}</span>
                                            </div>
                                            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${col.badgeColor}`}>
                                                {appsInCol.length}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Application Cards Container */}
                                    <div className="space-y-3 flex-1 overflow-y-auto pr-0.5 max-h-[600px]">
                                        {appsInCol.map((app) => (
                                            <div
                                                key={app.id}
                                                onClick={() => setSelectedAppModal(app)}
                                                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-cyan-400 hover:shadow-md transition cursor-pointer space-y-3 group"
                                            >
                                                {/* Company Logo + Name + Actions */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 p-1.5 shrink-0 flex items-center justify-center font-bold text-slate-700 text-xs">
                                                            {app.logo ? (
                                                                <img
                                                                    src={app.logo}
                                                                    alt={app.company}
                                                                    className="w-full h-full object-contain"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <span style={{ display: app.logo ? 'none' : 'flex' }}>
                                                                {(app.company || 'C').charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-xs font-extrabold text-slate-900 leading-tight truncate">
                                                                {app.company}
                                                            </h4>
                                                            <span className="text-[10px] font-semibold text-slate-400">
                                                                {app.date || 'Applied recently'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={(e) => handleDeleteApp(app.id, e)}
                                                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition p-1"
                                                        title="Delete application"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Role Title (Full wrapping, NO truncation) */}
                                                <h3 className="text-xs font-black text-slate-800 leading-snug">
                                                    {app.role}
                                                </h3>

                                                {/* Tags: Location & Salary */}
                                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                                        {app.location || 'Remote'}
                                                    </span>
                                                    {app.salary && (
                                                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-extrabold">
                                                            {app.salary}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Next Action Badge */}
                                                {app.nextAction && (
                                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-cyan-600 shrink-0" />
                                                        <span className="truncate">{app.nextAction}</span>
                                                    </div>
                                                )}

                                                {/* Card Bottom: Quick Stage Switcher */}
                                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
                                                    <select
                                                        value={app.stage}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => handleMoveStage(app.id, e.target.value)}
                                                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 text-[10px] font-extrabold focus:outline-none cursor-pointer"
                                                    >
                                                        {pipelineColumns.map(c => (
                                                            <option key={c.id} value={c.id}>
                                                                Move to: {c.label}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <span className="text-cyan-600 hover:text-cyan-700 font-black flex items-center gap-0.5">
                                                        Details <ChevronRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {appsInCol.length === 0 && (
                                            <div className="text-center py-16 text-xs text-slate-400 font-bold border-2 border-dashed border-slate-200/80 rounded-2xl space-y-1">
                                                <Building className="w-6 h-6 mx-auto text-slate-300" />
                                                <p>No applications</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            ) : (
                /* VIEW 2: TABLE LIST VIEW */
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-semibold">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                                <tr>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Role Title</th>
                                    <th className="px-6 py-4">Stage</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Salary</th>
                                    <th className="px-6 py-4">Next Action</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {filteredApps.map((app) => {
                                    const colInfo = pipelineColumns.find(c => c.id === app.stage) || pipelineColumns[0];
                                    return (
                                        <tr key={app.id} className="hover:bg-slate-50/80 transition cursor-pointer" onClick={() => setSelectedAppModal(app)}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 border p-1 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                                                        {app.company.charAt(0)}
                                                    </div>
                                                    <span className="font-extrabold text-slate-900">{app.company}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 font-bold text-slate-900">{app.role}</td>

                                            <td className="px-6 py-4">
                                                <select
                                                    value={app.stage}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => handleMoveStage(app.id, e.target.value)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border cursor-pointer ${colInfo.badgeColor}`}
                                                >
                                                    {pipelineColumns.map(c => (
                                                        <option key={c.id} value={c.id}>{c.label}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            <td className="px-6 py-4 text-slate-600">{app.location || 'Remote'}</td>
                                            <td className="px-6 py-4 text-emerald-700 font-extrabold">{app.salary || '—'}</td>
                                            <td className="px-6 py-4 text-slate-600">{app.nextAction || '—'}</td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => navigate('/interview')}
                                                        className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-2.5 py-1 rounded-lg text-[10px] font-extrabold"
                                                    >
                                                        Practice Mock
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteApp(app.id, e)}
                                                        className="text-slate-400 hover:text-rose-600 p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredApps.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold">
                                            No applications match the selected filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL 1: ADD APPLICATION MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-slate-200 shadow-2xl relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-black text-slate-900 mb-1">Track New Application</h3>
                        <p className="text-xs font-semibold text-slate-500 mb-6">Manually record an external job application</p>

                        <form onSubmit={handleAddApplication} className="space-y-4 text-xs font-bold">
                            <div>
                                <label className="block text-slate-700 mb-1">Company Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newAppForm.company}
                                    onChange={(e) => setNewAppForm({ ...newAppForm, company: e.target.value })}
                                    placeholder="e.g. Google, Lemonade, Microsoft"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 mb-1">Job Role Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newAppForm.role}
                                    onChange={(e) => setNewAppForm({ ...newAppForm, role: e.target.value })}
                                    placeholder="e.g. Senior QA Automation Engineer"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 mb-1">Pipeline Stage</label>
                                    <select
                                        value={newAppForm.stage}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, stage: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none font-bold"
                                    >
                                        {pipelineColumns.map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 mb-1">Location / Mode</label>
                                    <input
                                        type="text"
                                        value={newAppForm.location}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, location: e.target.value })}
                                        placeholder="e.g. Bangalore (Hybrid)"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 mb-1">Salary Range</label>
                                    <input
                                        type="text"
                                        value={newAppForm.salary}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, salary: e.target.value })}
                                        placeholder="e.g. ₹15–25 LPA or ₹50K/mo"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 mb-1">Job URL / Link</label>
                                    <input
                                        type="url"
                                        value={newAppForm.link}
                                        onChange={(e) => setNewAppForm({ ...newAppForm, link: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 mb-1">Notes / Next Steps</label>
                                <textarea
                                    rows={2}
                                    value={newAppForm.notes}
                                    onChange={(e) => setNewAppForm({ ...newAppForm, notes: e.target.value })}
                                    placeholder="Jot down recruiter contacts or interview schedules..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md shadow-cyan-600/20 transition"
                                >
                                    Save Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: APPLICATION DETAILS & TIMELINE MODAL */}
            {selectedAppModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 border border-slate-200 shadow-2xl relative">
                        <button
                            onClick={() => setSelectedAppModal(null)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Company & Role */}
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 border p-2 flex items-center justify-center shrink-0 text-slate-800 font-black text-xl">
                                {selectedAppModal.company.charAt(0)}
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-500">{selectedAppModal.company}</span>
                                <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedAppModal.role}</h3>
                                <p className="text-xs text-emerald-700 font-extrabold mt-1">
                                    {selectedAppModal.salary || 'Salary Not Disclosed'} • {selectedAppModal.location || 'Remote'}
                                </p>
                            </div>
                        </div>

                        {/* Pipeline Stage Timeline */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                Click to Update Stage:
                            </h4>
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                                {['Saved', 'Preparing', 'Applied', 'Assessment', 'Interview', 'Offer'].map((st) => {
                                    const stId = st.toLowerCase();
                                    const isCurrent = selectedAppModal.stage === stId;

                                    return (
                                        <button
                                            key={st}
                                            onClick={() => handleMoveStage(selectedAppModal.id, stId)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition shrink-0 flex items-center gap-1 ${
                                                isCurrent
                                                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            {isCurrent && <Check className="w-3.5 h-3.5" />}
                                            <span>{st}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Application Checklist */}
                        <div className="space-y-3 mb-6">
                            <h4 className="text-xs font-extrabold text-slate-900">Application Readiness Checklist</h4>
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs font-bold">
                                <div className="flex items-center gap-2 text-emerald-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Resume & Skill Passport Attached</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Project Lab Repositories Verified</span>
                                </div>
                                <div className="flex items-center gap-2 text-amber-800 font-extrabold">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    <span>AI Technical Interview Practice Recommended</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setSelectedAppModal(null);
                                    navigate('/interview');
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
                            >
                                <Code className="w-4 h-4" />
                                <span>Practice Technical</span>
                            </button>

                            <button
                                onClick={() => {
                                    setSelectedAppModal(null);
                                    navigate('/interview');
                                }}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20"
                            >
                                <UserCheck className="w-4 h-4" />
                                <span>Practice HR Mock</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const defaultApps = [
    {
        id: 'app-1',
        company: 'Lemonade Inc.',
        role: 'Senior QA Automation Engineer',
        stage: 'applied',
        date: 'Applied 2 days ago',
        nextAction: 'Awaiting recruiter review',
        location: 'Remote (India)',
        salary: '₹18–28 LPA',
        logo: 'https://logo.clearbit.com/lemonade.com'
    },
    {
        id: 'app-2',
        company: 'Google Cloud',
        role: 'Backend Developer Intern',
        stage: 'preparing',
        date: 'Applied Aug 15',
        nextAction: 'Prepare technical round',
        location: 'Bangalore (Hybrid)',
        salary: '₹50K / month',
        logo: 'https://logo.clearbit.com/google.com'
    },
    {
        id: 'app-3',
        company: 'Microsoft',
        role: 'Software Engineer Intern',
        stage: 'interview',
        date: 'Scheduled for tomorrow',
        nextAction: 'Round 1 Technical Interview',
        location: 'Hyderabad',
        salary: '₹70K / month',
        logo: 'https://logo.clearbit.com/microsoft.com'
    },
    {
        id: 'app-4',
        company: 'Razorpay',
        role: 'Backend Engineer (Node.js)',
        stage: 'offer',
        date: 'Offer received',
        nextAction: 'Review offer details',
        location: 'Bengaluru',
        salary: '₹22 LPA',
        logo: 'https://logo.clearbit.com/razorpay.com'
    }
];
