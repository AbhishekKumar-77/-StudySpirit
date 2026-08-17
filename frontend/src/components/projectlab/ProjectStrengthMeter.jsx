import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

export default function ProjectStrengthMeter({ project = {}, onImproveField }) {
    // Breakdown calculation based on actual project fields
    const breakdown = [
        {
            key: 'problem',
            label: 'Problem clarity',
            weight: 90,
            status: (project.story?.problem && project.story.problem.length > 20) ? 'good' : 'missing'
        },
        {
            key: 'tech',
            label: 'Technical depth',
            weight: 84,
            status: (project.technologies?.length > 0 || project.techStack?.length > 0) ? 'good' : 'missing'
        },
        {
            key: 'github',
            label: 'GitHub',
            weight: 100,
            status: project.githubUrl ? 'good' : 'missing'
        },
        {
            key: 'demo',
            label: 'Live Demo',
            weight: 90,
            status: project.liveUrl ? 'good' : 'missing'
        },
        {
            key: 'docs',
            label: 'Documentation',
            weight: 71,
            status: project.evidence?.documentationUrl ? 'good' : 'missing'
        },
        {
            key: 'shots',
            label: 'Screenshots',
            weight: 70,
            status: (project.evidence?.screenshots?.length || 0) >= 2 ? 'good' : 'missing'
        },
        {
            key: 'impact',
            label: 'Impact',
            weight: 62,
            status: (project.story?.impact && project.story.impact.length > 20) ? 'good' : 'missing'
        }
    ];

    const score = project.strengthScore || 82;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Project Evidence Score</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    Recruiter Ready
                </span>
            </div>

            {/* Score Ring / Bar */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-slate-200"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="text-emerald-500 transition-all duration-1000"
                            strokeDasharray={`${score}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <span className="absolute text-sm font-black text-slate-900">{score}%</span>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-sm">Portfolio Evidence Score</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                        High strength scores give your project 3.4x higher visibility to recruiters.
                    </p>
                </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 pt-1">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Breakdown</h4>
                <div className="space-y-1.5">
                    {breakdown.map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
                            <div className="flex items-center gap-2">
                                {item.status === 'good' ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                ) : (
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                )}
                                <span className={item.status === 'good' ? 'text-slate-700 font-medium' : 'text-slate-500'}>
                                    {item.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`font-semibold ${item.status === 'good' ? 'text-emerald-700' : 'text-amber-600'}`}>
                                    {item.status === 'good' ? `${item.weight}%` : 'Missing'}
                                </span>
                                {item.status !== 'good' && onImproveField && (
                                    <button
                                        onClick={() => onImproveField(item.key)}
                                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
                                    >
                                        Improve <ArrowRight className="w-2.5 h-2.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
