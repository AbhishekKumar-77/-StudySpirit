import React, { useState } from 'react';
import { MapPin, DollarSign, Clock, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, ExternalLink, Sparkles, Building } from 'lucide-react';

export default function OpportunityCard({ opportunity, onOpenDetail, onApply, onPracticeForJob }) {
    const [showWhyRecommended, setShowWhyRecommended] = useState(false);

    const matchPercent = opportunity.matchScore || opportunity.matchPercent || 91;

    // Match color styling
    const matchStyle =
        matchPercent >= 90
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : matchPercent >= 80
            ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
            : 'bg-amber-50 text-amber-700 border-amber-200';

    return (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition flex flex-col justify-between space-y-4">
            <div>
                {/* Header: Company + Title + Match Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 p-2 flex items-center justify-center shrink-0">
                            {opportunity.logo ? (
                                <img
                                    src={opportunity.logo}
                                    alt={opportunity.company}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <Building className="w-6 h-6 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-slate-500">{opportunity.company || 'Google Cloud'}</span>
                            <h3 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-1">
                                {opportunity.title || 'Backend Developer Intern'}
                            </h3>
                        </div>
                    </div>

                    {/* Match Score Badge */}
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${matchStyle}`}>
                        {matchPercent}% MATCH
                    </span>
                </div>

                {/* Location + Work Mode + Salary */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {opportunity.location || 'Bangalore, India'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {opportunity.workMode || 'Hybrid'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-700 font-extrabold">
                        {opportunity.salary || '₹35K–₹50K / month'}
                    </span>
                </div>

                {/* Relevant Skills Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {(opportunity.skills || opportunity.tags || ['Node.js', 'MongoDB', 'REST API', 'Git']).slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-[10px] font-extrabold bg-slate-50 border border-slate-200/80 text-slate-700 px-2.5 py-1 rounded-lg">
                            ✓ {skill}
                        </span>
                    ))}
                    {(opportunity.skills || opportunity.tags || []).length > 3 && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                            +{(opportunity.skills || opportunity.tags).length - 3}
                        </span>
                    )}
                </div>

                {/* Posted Date & Source */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {opportunity.posted || 'Posted 2 days ago'}
                    </span>
                    {opportunity.source && (
                        <span className="text-[10px] font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                            Source: {opportunity.source}
                        </span>
                    )}
                </div>
            </div>

            <div>
                {/* Expandable Why Recommended Drawer */}
                <div className="border-t border-slate-100 pt-2 mb-3">
                    <button
                        onClick={() => setShowWhyRecommended(!showWhyRecommended)}
                        className="w-full flex items-center justify-between text-[11px] font-bold text-purple-700 hover:text-purple-800 transition py-1"
                    >
                        <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            Why recommended?
                        </span>
                        {showWhyRecommended ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showWhyRecommended && (
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs space-y-2 mt-2">
                            <div className="space-y-1">
                                <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Matched Evidence:</p>
                                {(opportunity.matchedSkills || ['Node.js', 'MongoDB', 'REST APIs', 'Git', '3 Project Lab projects', 'Career goal matches']).map((m, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-slate-700 text-[11px] font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span>{m}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 space-y-1">
                                <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">Missing Skill Gap:</p>
                                {(opportunity.missingSkills || ['Docker']).map((m, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-amber-900 text-[11px] font-semibold">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <span>{m}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onOpenDetail(opportunity)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2.5 rounded-xl transition text-center shadow-2xs"
                    >
                        View Details
                    </button>
                    <button
                        onClick={() => onApply(opportunity)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition text-center shadow-md shadow-emerald-600/20"
                    >
                        Apply Now
                    </button>
                </div>
            </div>
        </div>
    );
}
