import React from 'react';
import { ArrowUpRight, Sparkles, ArrowRight, Zap, Code, FileText, MessageSquare, UserCheck, Layers } from 'lucide-react';

export default function CareerReadinessWidget({ readinessData = {}, onSeeRecommendations }) {
    const overallScore = readinessData.overall || 72;
    const readinessBreakdown = [
        { label: 'Skills', score: readinessData.skills || 82, color: 'bg-emerald-500', icon: Zap },
        { label: 'Projects', score: readinessData.projects || 76, color: 'bg-cyan-500', icon: Layers },
        { label: 'Resume', score: readinessData.resume || 68, color: 'bg-purple-500', icon: FileText },
        { label: 'Communication', score: readinessData.communication || 71, color: 'bg-pink-500', icon: MessageSquare },
        { label: 'Interview', score: readinessData.interview || 64, color: 'bg-amber-500', icon: UserCheck },
        { label: 'Coding', score: readinessData.coding || 81, color: 'bg-blue-500', icon: Code }
    ];

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            {/* Widget Title */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Career Readiness</h3>
                <button className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                    <span>View Report</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
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
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mt-1">Good Progress</p>
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
            <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 text-center space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-1">
                    <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-extrabold text-purple-950">Improve Your Readiness</h4>
                <p className="text-[11px] text-slate-600 leading-tight">
                    Focus on weak areas to get better job matches.
                </p>

                <button
                    onClick={onSeeRecommendations}
                    className="w-full bg-white border border-purple-200 hover:bg-purple-600 hover:text-white text-purple-700 font-bold text-xs py-2 rounded-xl transition shadow-2xs mt-2"
                >
                    See Recommendations
                </button>
            </div>
        </div>
    );
}
