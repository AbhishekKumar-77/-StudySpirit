import React from 'react';
import { X, CheckCircle2, AlertTriangle, Building, MapPin, DollarSign, ExternalLink, Sparkles, BookOpen, UserCheck, Layers, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OpportunityDetailModal({ opportunity, onClose, onApply }) {
    const navigate = useNavigate();

    if (!opportunity) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border p-2 flex items-center justify-center shrink-0">
                        {opportunity.logo ? (
                            <img src={opportunity.logo} alt={opportunity.company} className="w-full h-full object-contain" />
                        ) : (
                            <Building className="w-8 h-8 text-slate-400" />
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">{opportunity.company || 'Google Cloud'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-extrabold text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-100">
                                {opportunity.matchScore || 91}% MATCH
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5">{opportunity.title || 'Backend Developer Intern'}</h2>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 mt-2">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {opportunity.location || 'Bangalore, India'} ({opportunity.workMode || 'Hybrid'})
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-emerald-700 font-extrabold">{opportunity.salary || '₹35K–₹50K / month'}</span>
                        </div>
                    </div>
                </div>

                {/* Why You're A Match */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Why you're a match
                    </h3>

                    <div className="space-y-1.5">
                        {(opportunity.matchedSkills || ['Node.js', 'MongoDB', 'REST API', 'Git', '3 Project Lab projects verified', 'Career preferences match']).map((m, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{m}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Missing Skill Gap:</span>
                        {(opportunity.missingSkills || ['Docker']).map((m, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-amber-900">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>{m}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Relevant Projects & Learning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4">
                        <h4 className="text-xs font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-cyan-600" />
                            Relevant Projects (Project Lab)
                        </h4>
                        <div className="space-y-1.5 text-xs font-bold text-slate-700">
                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                                <span>StudySpirit Platform</span>
                                <span className="text-[10px] text-cyan-600">Node.js · MongoDB</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                                <span>CodeSpirit Editor</span>
                                <span className="text-[10px] text-cyan-600">React · REST APIs</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-4">
                        <h4 className="text-xs font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-purple-600" />
                            Relevant Learning Courses
                        </h4>
                        <div className="space-y-1.5 text-xs font-bold text-slate-700">
                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                                <span>Database Systems (CSE101)</span>
                                <span className="text-[10px] text-emerald-600">Completed 68%</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                                <span>Node.js Backend Masterclass</span>
                                <span className="text-[10px] text-emerald-600">Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prepare Before Applying */}
                <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 mb-6">
                    <h4 className="text-xs font-extrabold text-purple-950 mb-2 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-purple-600" />
                        Prepare before applying (Boost Readiness)
                    </h4>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 bg-white border border-purple-100 rounded-xl text-xs font-bold">
                            <div>
                                <span className="text-slate-900 block">Docker Basics</span>
                                <span className="text-[10px] text-slate-500 font-normal">30 min course module</span>
                            </div>
                            <button
                                onClick={() => navigate('/resources')}
                                className="bg-purple-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg hover:bg-purple-700"
                            >
                                Start Learning
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-2.5 bg-white border border-purple-100 rounded-xl text-xs font-bold">
                            <div>
                                <span className="text-slate-900 block">Backend Interview Preparation</span>
                                <span className="text-[10px] text-slate-500 font-normal">20 min mock with Aria</span>
                            </div>
                            <button
                                onClick={() => navigate('/interview')}
                                className="bg-cyan-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg hover:bg-cyan-700"
                            >
                                Practice Interview
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-2xl transition"
                    >
                        Close
                    </button>

                    <button
                        onClick={() => {
                            onClose();
                            onApply(opportunity);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition shadow-md shadow-emerald-600/20"
                    >
                        Apply Now
                    </button>
                </div>
            </div>
        </div>
    );
}
