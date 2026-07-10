import React from 'react';
import { History, ChevronRight } from 'lucide-react';

export default function HistoryView({
    interviewHistory,
    viewTranscript
}) {
    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Interview History</h2>
                <div className="text-sm text-[var(--text-secondary)]">{interviewHistory.length} Sessions</div>
            </div>

            <div className="grid gap-4">
                {interviewHistory.map((session, i) => (
                    <div key={i} className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] hover:border-cyan-500/30 transition-all flex justify-between items-center group">
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                session.overallScore >= 7 
                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                    : session.overallScore >= 4 
                                        ? 'bg-amber-500/20 text-amber-400' 
                                        : 'bg-red-500/20 text-red-400'
                            }`}>
                                {session.overallScore}
                            </div>
                            <div>
                                <div className="font-bold text-lg capitalize flex items-center gap-2">
                                    {session.mode} Interview
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-secondary)] border border-[var(--border-color)] normal-case">
                                        {new Date(session.startedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="text-sm text-[var(--text-secondary)] mt-1 flex gap-4">
                                    <span>{session.questionsAsked} Questions</span>
                                    <span>{session.duration ? Math.floor(session.duration / 60) + ' mins' : 'Incomplete'}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => viewTranscript(session)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-opacity opacity-0 group-hover:opacity-100 flex items-center gap-2 text-cyan-500">
                            View Details <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            {interviewHistory.length === 0 && (
                <div className="text-center py-20 text-[var(--text-muted)]">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    No past interviews found. Start your first session!
                </div>
            )}
        </div>
    );
}
