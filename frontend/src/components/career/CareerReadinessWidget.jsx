import React from 'react';
import { ArrowUpRight, Sparkles, ArrowRight, Zap, Code, FileText, MessageSquare, UserCheck, Layers } from 'lucide-react';

export default function CareerReadinessWidget({ readinessData = {}, onSeeRecommendations, onViewReport }) {
    const overallScore = readinessData.overall || 84;
    const readinessBreakdown = [
        { label: 'Coding Activity', score: readinessData.coding || 88, color: 'bg-blue-500', icon: Code },
        { label: 'Project Lab', score: readinessData.projects || 85, color: 'bg-cyan-500', icon: Layers },
        { label: 'Verified Skills', score: readinessData.skills || 82, color: 'bg-emerald-500', icon: Zap },
        { label: 'Communication', score: readinessData.communication || 78, color: 'bg-pink-500', icon: MessageSquare },
        { label: 'Interview Prep', score: readinessData.interview || 80, color: 'bg-amber-500', icon: UserCheck }
    ];

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            {/* Widget Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Career Readiness</h3>
                    <p className="text-[11px] font-semibold text-slate-400">Verified StudySpirit Index</p>
                </div>
                {onViewReport && (
                    <button 
                        onClick={onViewReport}
                        className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                    >
                        <span>View Resume</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Circular Gauge */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className="text-emerald-500"
                        strokeDasharray={`${overallScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <div className="absolute text-center">
                    <span className="text-3xl font-black text-slate-900 leading-none">{overallScore}%</span>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mt-1">
                        {overallScore >= 80 ? 'Top Tier' : overallScore >= 65 ? 'Good Progress' : 'In Progress'}
                    </p>
                </div>
            </div>

            {/* Sub-Score Breakdown Bars */}
            <div className="space-y-3 pt-2">
                {readinessBreakdown.map((item) => {
                    const IconComp = item.icon;
                    return (
                        <div key={item.label} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <IconComp className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{item.label}</span>
                                </div>
                                <span className="text-slate-900 font-extrabold">{item.score}%</span>
                            </div>

                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                                    style={{ width: `${item.score}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Callout Banner */}
            <div className="bg-cyan-50/70 border border-cyan-100 rounded-2xl p-4 text-center space-y-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mx-auto mb-1">
                    <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-extrabold text-cyan-950">Boost Career Readiness</h4>
                <p className="text-[11px] text-slate-600 leading-tight">
                    Solve more problems in CodeSpirit & build projects to increase matching score.
                </p>

                <button
                    onClick={onSeeRecommendations}
                    className="w-full bg-white border border-cyan-200 hover:bg-cyan-600 hover:text-white text-cyan-700 font-bold text-xs py-2 rounded-xl transition shadow-2xs mt-2"
                >
                    Explore Job Matches
                </button>
            </div>
        </div>
    );
}
