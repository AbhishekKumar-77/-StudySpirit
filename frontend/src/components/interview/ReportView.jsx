import React from 'react';
import { 
    CheckCircle, AlertCircle, Trophy, Brain, MessageSquare, Users, Zap, FileText, Mic, User, ChevronRight 
} from 'lucide-react';

export default function ReportView({
    sessionReport,
    isJourneyMode,
    journeyStep,
    nextJourneyStep,
    resetSessionState,
    setMode,
    setView
}) {
    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">Interview Analysis</h2>
                <p className="text-[var(--text-secondary)]">Here's how you performed with Aria.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Score Card */}
                <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[160px]">
                    <div className="absolute inset-0 bg-cyan-500/10 blur-xl" />
                    <div className="relative">
                        <div className="text-5xl font-black text-[var(--text-primary)] mb-2">
                            {sessionReport.overallScore}
                            <span className="text-xl text-[var(--text-muted)]">/10</span>
                        </div>
                        <div className="text-sm px-3 py-1 rounded-full bg-cyan-500/20 text-violet-300 inline-block font-semibold">Overall Readiness</div>
                    </div>
                </div>

                {/* Strengths */}
                <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] relative md:col-span-2">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-emerald-400"><CheckCircle className="w-5 h-5" /> Key Strengths</h3>
                    <ul className="space-y-2">
                        {sessionReport.strengths && sessionReport.strengths.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" /> {s}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Improvements */}
                <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] relative">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-amber-400"><AlertCircle className="w-5 h-5" /> Areas for Improvement</h3>
                    <ul className="space-y-2">
                        {sessionReport.improvements && sessionReport.improvements.map((s, i) => (
                            <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" /> {s}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Final Feedback */}
                <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] relative">
                    <h3 className="flex items-center gap-2 font-bold mb-4 text-cyan-500"><Trophy className="w-5 h-5" /> Executive Assessment</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
                        "{sessionReport.finalFeedback}"
                    </p>
                </div>
            </div>

            {/* GD SPECIFIC METRICS */}
            {sessionReport.mode === 'gd' && sessionReport.gdMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Logic & Reasoning', key: 'logic', icon: <Brain className="w-5 h-5 text-blue-400" /> },
                        { label: 'Communication', key: 'communication', icon: <MessageSquare className="w-5 h-5 text-cyan-400" /> },
                        { label: 'Team Collaboration', key: 'teamwork', icon: <Users className="w-5 h-5 text-emerald-400" /> },
                        { label: 'Confidence', key: 'confidence', icon: <Zap className="w-5 h-5 text-amber-400" /> }
                    ].map(metric => (
                        <div key={metric.key} className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] relative group overflow-hidden">
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded-lg bg-black/30">{metric.icon}</div>
                                    <div className="text-2xl font-black text-[var(--text-primary)]">{sessionReport.gdMetrics[metric.key]}/10</div>
                                </div>
                                <div className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)] mb-2">{metric.label}</div>
                                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${sessionReport.gdMetrics[metric.key] >= 8 ? 'bg-emerald-500' : sessionReport.gdMetrics[metric.key] >= 5 ? 'bg-cyan-500' : 'bg-red-500'}`} 
                                        style={{ width: `${sessionReport.gdMetrics[metric.key] * 10}%` }} 
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-center gap-4">
                {isJourneyMode && journeyStep < 4 ? (
                    <button onClick={nextJourneyStep} className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-bold transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 animate-bounce">
                        Proceed to Next Round <ChevronRight />
                    </button>
                ) : (
                    <>
                        <button onClick={resetSessionState} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">
                            Back to Menu
                        </button>
                        <button onClick={() => { setMode(sessionReport.mode); setView('setup'); }} className="px-8 py-3 bg-cyan-500 hover:bg-violet-700 rounded-xl font-bold transition-all shadow-lg shadow-violet-500/20">
                            Try Again
                        </button>
                    </>
                )}
            </div>

            {/* DETAILED TRANSCRIPT LOG */}
            {sessionReport.exchanges && sessionReport.exchanges.length > 0 && (
                <div className="mt-12 bg-[var(--bg-primary)] p-8 rounded-2xl border border-[var(--border-color)]">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <FileText className="text-cyan-500" /> Detailed Transcript Log
                    </h3>
                    <div className="space-y-8">
                        {sessionReport.exchanges.map((exchange, idx) => (
                            <div key={idx} className="pb-6 border-b border-[var(--border-color)] last:border-0 last:pb-0">
                                <div className="flex gap-4 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shrink-0">
                                        <Mic className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="w-full">
                                        <div className="text-sm font-bold text-[var(--text-secondary)] mb-1">
                                            {sessionReport.mode === 'gd' ? 'AI Discussion' : 'Aria'} (Turn {exchange.questionNumber})
                                        </div>
                                        <div className="text-[var(--text-primary)] font-medium bg-[var(--bg-secondary)]/20 p-4 rounded-lg border border-[var(--border-color)]">
                                            {exchange.question}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 ml-8">
                                    <div className="w-full">
                                        <div className="text-sm font-bold text-[var(--text-secondary)] mb-1 text-right">You</div>
                                        <div className="bg-cyan-500/10 text-[var(--text-primary)] p-4 rounded-lg border border-cyan-500/20">
                                            {exchange.answer}
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-4 bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 ml-12">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-yellow-500 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" /> AI Evaluation</h4>
                                        <p className="text-sm text-[var(--text-secondary)] mt-1">{exchange.feedback}</p>
                                        {exchange.idealAnswer && (
                                            <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                                <h5 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Ideal Answer Concept</h5>
                                                <p className="text-sm text-[var(--text-secondary)]">{exchange.idealAnswer}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center justify-center shrink-0 pr-4">
                                        <div className="text-2xl font-black text-yellow-500">{exchange.score}</div>
                                        <div className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-widest">Score</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
