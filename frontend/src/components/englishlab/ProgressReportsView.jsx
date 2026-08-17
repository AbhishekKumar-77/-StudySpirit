import React, { useState } from 'react';
import { BarChart3, BookOpen, AlertCircle, Award, CheckCircle2, Clock, Calendar, Star } from 'lucide-react';

export default function ProgressReportsView({ profile = {}, history = [] }) {
    const [activeSubTab, setActiveSubTab] = useState('mistakes'); // mistakes | vocab | goals | history

    const recurringMistakes = profile.recurringMistakes || [
        { pattern: 'Subject-Verb Agreement', wrongExample: 'Yesterday I go university', correctExample: 'Yesterday I went to university', occurrences: 7, status: 'Needs Practice' },
        { pattern: 'Preposition of Duration', wrongExample: 'I am studying here since two years', correctExample: 'I have been studying here for two years', occurrences: 4, status: 'Needs Practice' }
    ];

    const vocabBank = profile.savedVocabulary || [
        { word: 'Collaborate', meaning: 'Work jointly on an activity', status: 'Learning' },
        { word: 'Articulate', meaning: 'Express ideas clearly', status: 'Practicing' },
        { word: 'Proficient', meaning: 'Competent or skilled in using something', status: 'Mastered' }
    ];

    const goals = profile.weeklyGoals || {
        speakingDaysTarget: 5, speakingDaysCompleted: 4,
        wordsTarget: 20, wordsCompleted: 12,
        writingTarget: 3, writingCompleted: 2,
        minutesTarget: 60, minutesCompleted: 42
    };

    const achievements = [
        { title: 'Conversation Starter', desc: 'Completed 5 AI conversations', icon: '💬', unlocked: true },
        { title: 'Pronunciation Star', desc: 'Scored 80+ in pronunciation coach', icon: '⭐', unlocked: true },
        { title: 'Word Wizard', desc: 'Saved 20 words to vocabulary bank', icon: '📚', unlocked: false },
        { title: 'Fluency Improver', desc: 'Spoke for 30 minutes in English', icon: '🗣️', unlocked: true }
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Progress Reports & Learning Bank
                </h2>
                <p className="text-xs text-slate-500">Track recurring mistakes, personal vocabulary bank, weekly goals, and badges.</p>
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-2 border-b border-slate-100 pb-3">
                {[
                    { id: 'mistakes', label: `Recurring Mistakes (${recurringMistakes.length})` },
                    { id: 'vocab', label: `My Vocabulary Bank (${vocabBank.length})` },
                    { id: 'goals', label: 'Weekly Goals' },
                    { id: 'achievements', label: 'Achievements' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveSubTab(t.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === t.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Recurring Mistakes */}
            {activeSubTab === 'mistakes' && (
                <div className="space-y-3">
                    {recurringMistakes.map((m, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between font-bold">
                                <span className="text-purple-700">{m.pattern}</span>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px]">
                                    {m.status} • {m.occurrences} times
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 bg-red-50 text-red-900 rounded">Incorrect: "{m.wrongExample}"</div>
                                <div className="p-2 bg-emerald-50 text-emerald-900 rounded">Correct: "{m.correctExample}"</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* My Vocabulary Bank */}
            {activeSubTab === 'vocab' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {vocabBank.map((w, i) => (
                        <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm">{w.word}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${w.status === 'Mastered' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {w.status}
                                </span>
                            </div>
                            <p className="text-slate-600 text-[11px]">{w.meaning}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Goals */}
            {activeSubTab === 'goals' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex justify-between"><span>Practice Speaking Days</span><span>{goals.speakingDaysCompleted} / {goals.speakingDaysTarget} days</span></div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden"><div className="bg-purple-600 h-full rounded-full" style={{ width: `${(goals.speakingDaysCompleted / goals.speakingDaysTarget) * 100}%` }} /></div>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex justify-between"><span>Learn Vocabulary</span><span>{goals.wordsCompleted} / {goals.wordsTarget} words</span></div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden"><div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(goals.wordsCompleted / goals.wordsTarget) * 100}%` }} /></div>
                    </div>
                </div>
            )}

            {/* Achievements */}
            {activeSubTab === 'achievements' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {achievements.map((ach, i) => (
                        <div key={i} className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${ach.unlocked ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                            <div className="text-2xl">{ach.icon}</div>
                            <div>
                                <h4 className="font-bold text-slate-900">{ach.title}</h4>
                                <p className="text-[11px] text-slate-500">{ach.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
