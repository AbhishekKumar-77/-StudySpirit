import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AriaCoach({ project = {}, onOpenSection }) {
    // Generate actual contextual tips from project data
    const tips = [];

    if (!project.story?.problem || project.story.problem.length < 20) {
        tips.push({ key: 'problem', title: 'Write problem statement', impact: '+8% score', section: 'story' });
    }
    if (!project.story?.impact || project.story.impact.length < 20) {
        tips.push({ key: 'impact', title: 'Explain project outcome & impact', impact: '+7% score', section: 'story' });
    }
    if (!project.githubUrl) {
        tips.push({ key: 'github', title: 'Connect GitHub repository', impact: '+15% score', section: 'evidence' });
    }
    if (!project.liveUrl) {
        tips.push({ key: 'demo', title: 'Add live demo URL', impact: '+15% score', section: 'evidence' });
    }
    if (!project.evidence?.screenshots || project.evidence.screenshots.length < 2) {
        tips.push({ key: 'screenshots', title: 'Upload at least 2 screenshots', impact: '+10% score', section: 'evidence' });
    }
    if (!project.evidence?.documentationUrl) {
        tips.push({ key: 'docs', title: 'Add architecture / API documentation URL', impact: '+5% score', section: 'evidence' });
    }

    return (
        <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-400/20 border border-purple-300/30 flex items-center justify-center text-purple-200">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-white">AI Project Coach — Aria</h3>
                        <p className="text-[11px] text-purple-200">Actionable recommendations from real evidence analysis</p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-purple-100/90 mb-4 leading-relaxed relative z-10">
                "{project.name ? `"${project.name}" has strong core technical depth.` : 'Your project has solid technical potential.'} Completing missing evidence items will maximize recruiter discovery matching."
            </p>

            <div className="space-y-2 relative z-10">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-purple-200/70">
                    Project Completion Tips ({tips.length} remaining)
                </h4>
                {tips.length > 0 ? (
                    <div className="space-y-1.5">
                        {tips.slice(0, 4).map((tip, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 bg-white/10 rounded-xl border border-white/10 text-xs backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                                    <span className="font-medium text-white">{tip.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-400/20 text-emerald-300 rounded-full border border-emerald-300/30">
                                        {tip.impact}
                                    </span>
                                    {onOpenSection && (
                                        <button
                                            onClick={() => onOpenSection(tip.section)}
                                            className="p-1 hover:bg-white/20 rounded transition-colors text-white"
                                        >
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-xs text-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>All evidence items completed! Your project strength is at 100%.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
