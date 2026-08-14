import React from 'react';
import { Calendar, Clock, Flame, Zap, Play, CheckCircle2 } from 'lucide-react';

export default function DailyChallengeView({ onSolveChallenge }) {
    const pastChallenges = [
        { date: 'Today (Aug 15)', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', xp: '+50 XP', status: 'pending' },
        { date: 'Yesterday (Aug 14)', title: 'Trapping Rain Water', difficulty: 'Hard', xp: '+100 XP', status: 'completed' },
        { date: 'Aug 13', title: 'Two Sum', difficulty: 'Easy', xp: '+30 XP', status: 'completed' },
        { date: 'Aug 12', title: 'Valid Anagram', difficulty: 'Easy', xp: '+30 XP', status: 'completed' }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-8 rounded-3xl text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Daily Challenge Arena</h2>
                        <p className="text-sm text-emerald-200">Solve daily problems to build your streak and earn double XP</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/30 text-amber-200 mb-2 inline-block">
                            MEDIUM
                        </span>
                        <h3 className="text-xl font-bold text-white mb-2">Longest Substring Without Repeating Characters</h3>
                        <div className="flex items-center gap-4 text-xs text-emerald-200 font-semibold">
                            <span className="flex items-center gap-1"><Clock size={14} /> ~20 min</span>
                            <span className="flex items-center gap-1"><Zap size={14} /> +50 XP</span>
                            <span className="flex items-center gap-1"><Flame size={14} /> +1 Streak Bonus</span>
                        </div>
                    </div>

                    <button
                        onClick={onSolveChallenge}
                        className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 shrink-0 transition-all transform hover:scale-[1.02]"
                    >
                        <Play size={16} className="fill-white" />
                        <span>Solve Today's Challenge</span>
                    </button>
                </div>
            </div>

            {/* Past Challenges */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4">Recent Daily Challenges</h3>
                <div className="divide-y divide-gray-100">
                    {pastChallenges.map((c, i) => (
                        <div key={i} className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                    c.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                    {c.status === 'completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900">{c.title}</h4>
                                    <span className="text-xs text-gray-400">{c.date}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-purple-600">{c.xp}</span>
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                                    c.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                                    c.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                    {c.difficulty}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
