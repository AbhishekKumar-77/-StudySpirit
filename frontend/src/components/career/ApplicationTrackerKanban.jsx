import React, { useState } from 'react';
import {
    ArrowRight, CheckCircle2, Clock, AlertTriangle, Building, X,
    FileText, UserCheck, Code, Sparkles, Plus, Trash2, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ApplicationTrackerKanban({ applications = [], onMoveStage, onSelectApp }) {
    const navigate = useNavigate();
    const [selectedAppModal, setSelectedAppModal] = useState(null);

    const pipelineColumns = [
        { id: 'saved', label: 'Saved', color: 'border-slate-300 bg-slate-50', badgeColor: 'bg-slate-200 text-slate-700' },
        { id: 'preparing', label: 'Preparing', color: 'border-amber-300 bg-amber-50/40', badgeColor: 'bg-amber-100 text-amber-800' },
        { id: 'applied', label: 'Applied', color: 'border-blue-300 bg-blue-50/40', badgeColor: 'bg-blue-100 text-blue-800' },
        { id: 'assessment', label: 'Assessment', color: 'border-purple-300 bg-purple-50/40', badgeColor: 'bg-purple-100 text-purple-800' },
        { id: 'interview', label: 'Interview', color: 'border-cyan-300 bg-cyan-50/40', badgeColor: 'bg-cyan-100 text-cyan-800' },
        { id: 'offer', label: 'Offer', color: 'border-emerald-300 bg-emerald-50/40', badgeColor: 'bg-emerald-100 text-emerald-800' },
        { id: 'rejected', label: 'Rejected', color: 'border-rose-200 bg-rose-50/30', badgeColor: 'bg-rose-100 text-rose-800' },
        { id: 'withdrawn', label: 'Withdrawn', color: 'border-slate-200 bg-slate-50/30', badgeColor: 'bg-slate-100 text-slate-600' }
    ];

    const defaultApps = [
        { id: 'app-1', company: 'Google Cloud', role: 'Backend Developer Intern', stage: 'preparing', date: 'Applied Aug 15', nextAction: 'Prepare technical round', logo: 'https://logo.clearbit.com/google.com' },
        { id: 'app-2', company: 'Amazon', role: 'SDE Intern', stage: 'saved', date: 'Saved 2 days ago', nextAction: 'Review requirements', logo: 'https://logo.clearbit.com/amazon.com' },
        { id: 'app-3', company: 'Zoho Corporation', role: 'Full Stack Developer Intern', stage: 'applied', date: 'Applied 2 days ago', nextAction: 'Awaiting response', logo: 'https://logo.clearbit.com/zoho.com' },
        { id: 'app-4', company: 'Microsoft', role: 'Software Engineer Intern', stage: 'preparing', date: 'Applied 1 week ago', nextAction: 'System design prep', logo: 'https://logo.clearbit.com/microsoft.com' },
        { id: 'app-5', company: 'Adobe', role: 'Backend Intern', stage: 'saved', date: 'Saved 3 days ago', nextAction: 'Tailor resume', logo: 'https://logo.clearbit.com/adobe.com' },
        { id: 'app-6', company: 'Flipkart', role: 'Backend Intern', stage: 'applied', date: 'Applied 1 week ago', nextAction: 'Track status', logo: 'https://logo.clearbit.com/flipkart.com' },
        { id: 'app-7', company: 'Deloitte', role: 'Analyst Intern', stage: 'offer', date: 'Offer received', nextAction: 'Review offer letter', logo: 'https://logo.clearbit.com/deloitte.com' },
        { id: 'app-8', company: 'Amazon', role: 'Technical Interview Round 1', stage: 'interview', date: 'Scheduled Aug 20', nextAction: 'HR Interview tomorrow', logo: 'https://logo.clearbit.com/amazon.com' }
    ];

    const displayApps = applications.length > 0 ? applications : defaultApps;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Application Tracker</h2>
                    <p className="text-xs font-semibold text-slate-500">Track and manage your opportunity pipeline</p>
                </div>
            </div>

            {/* Kanban Columns Horizontal Overflow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3 overflow-x-auto pb-4">
                {pipelineColumns.map((col) => {
                    const appsInCol = displayApps.filter((a) => a.stage === col.id);

                    return (
                        <div key={col.id} className={`rounded-3xl p-3 border ${col.color} flex flex-col justify-between min-h-[360px]`}>
                            {/* Column Header */}
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60">
                                <span className="text-xs font-black text-slate-900">{col.label}</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                                    {appsInCol.length}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
                                {appsInCol.map((app) => (
                                    <div
                                        key={app.id}
                                        onClick={() => setSelectedAppModal(app)}
                                        className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs hover:border-cyan-400 hover:shadow-xs transition cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="w-6 h-6 rounded-lg bg-slate-100 p-1 shrink-0 flex items-center justify-center">
                                                {app.logo ? (
                                                    <img src={app.logo} alt={app.company} className="w-full h-full object-contain" />
                                                ) : (
                                                    <Building className="w-3.5 h-3.5 text-slate-400" />
                                                )}
                                            </div>
                                            <h4 className="text-xs font-extrabold text-slate-900 truncate">{app.company}</h4>
                                        </div>

                                        <p className="text-[11px] font-bold text-slate-700 leading-snug line-clamp-1 mb-1">
                                            {app.role}
                                        </p>

                                        <p className="text-[10px] font-semibold text-slate-400 mb-2">{app.date}</p>

                                        {app.nextAction && (
                                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-[9px] font-bold text-slate-600 truncate">
                                                {app.nextAction}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {appsInCol.length === 0 && (
                                    <div className="text-center py-12 text-[10px] text-slate-400 font-bold border border-dashed border-slate-200 rounded-2xl">
                                        Empty
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Application Detail Modal */}
            {selectedAppModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative">
                        <button
                            onClick={() => setSelectedAppModal(null)}
                            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border p-2 flex items-center justify-center">
                                <img src={selectedAppModal.logo} alt={selectedAppModal.company} className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <span className="text-xs font-extrabold text-slate-500">{selectedAppModal.company}</span>
                                <h3 className="text-lg font-black text-slate-900">{selectedAppModal.role}</h3>
                            </div>
                        </div>

                        {/* Pipeline Stage Timeline */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6">
                            <h4 className="text-xs font-extrabold text-slate-900 mb-3">Application Pipeline Stage</h4>
                            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 overflow-x-auto pb-1">
                                {['Saved', 'Preparing', 'Applied', 'Assessment', 'Interview', 'Offer'].map((st, i) => {
                                    const isCurrent = selectedAppModal.stage === st.toLowerCase();
                                    return (
                                        <div key={st} className="flex items-center gap-1 shrink-0">
                                            <span className={`px-2 py-1 rounded-md ${isCurrent ? 'bg-cyan-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'}`}>
                                                {st}
                                            </span>
                                            {i < 5 && <ArrowRight className="w-3 h-3 text-slate-300" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Application Checklist */}
                        <div className="space-y-2 mb-6">
                            <h4 className="text-xs font-extrabold text-slate-900">Application Readiness Checklist</h4>
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Resume submitted</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Portfolio attached</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>GitHub profile attached</span>
                                </div>
                                <div className="flex items-center gap-2 text-amber-800 font-extrabold">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    <span>Assessment pending</span>
                                </div>
                                <div className="flex items-center gap-2 text-amber-800 font-extrabold">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    <span>Interview preparation recommended</span>
                                </div>
                            </div>
                        </div>

                        {/* Direct Action Buttons to Interview Prep */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setSelectedAppModal(null);
                                    navigate('/interview-prep');
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
                            >
                                <Code className="w-4 h-4" />
                                <span>Practice Technical</span>
                            </button>

                            <button
                                onClick={() => {
                                    setSelectedAppModal(null);
                                    navigate('/interview-prep');
                                }}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20"
                            >
                                <UserCheck className="w-4 h-4" />
                                <span>Practice HR Interview</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
