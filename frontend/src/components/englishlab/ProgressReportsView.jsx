import React, { useState } from 'react';
import {
    BarChart3, BookOpen, AlertCircle, Award, CheckCircle2,
    Clock, Calendar, Star, Volume2, Sparkles, Trophy, Zap, ShieldCheck
} from 'lucide-react';

export default function ProgressReportsView({ profile = {}, history = [] }) {
    const [activeSubTab, setActiveSubTab] = useState('radar'); // radar | mistakes | vocab | goals | badges

    const scores = profile.scores || {
        speakingScore: 68,
        pronunciationScore: 61,
        grammarScore: 72,
        vocabularyScore: 58,
        fluencyScore: 64,
        confidenceScore: 70,
        overallConfidence: 64
    };

    const recurringMistakes = profile.recurringMistakes || [
        { pattern: 'Subject-Verb Agreement', wrongExample: 'Yesterday I go university', correctExample: 'Yesterday I went to university', occurrences: 7, status: 'Needs Practice' },
        { pattern: 'Preposition of Duration', wrongExample: 'I am studying here since two years', correctExample: 'I have been studying here for two years', occurrences: 4, status: 'Needs Practice' },
        { pattern: 'Modal Politeness', wrongExample: 'Send me the updated API docs now', correctExample: 'Could you please send me the updated API docs?', occurrences: 3, status: 'In Review' }
    ];

    const vocabBank = profile.savedVocabulary || [
        { word: 'Orchestrate', ipa: '/ˈɔː.kɪ.streɪt/', meaning: 'Coordinate and organize multiple components', context: 'Architecture', status: 'Learning' },
        { word: 'Collaborate', ipa: '/kəˈlæb.ə.reɪt/', meaning: 'Work jointly on an activity or project', context: 'Teamwork', status: 'Practicing' },
        { word: 'Articulate', ipa: '/ɑːˈtɪk.jə.lət/', meaning: 'Express ideas clearly and effectively', context: 'Professional', status: 'Mastered' },
        { word: 'Refactor', ipa: '/riːˈfæk.tər/', meaning: 'Restructure code without altering behavior', context: 'Engineering', status: 'Mastered' }
    ];

    const goals = profile.weeklyGoals || {
        speakingDaysTarget: 5, speakingDaysCompleted: 4,
        wordsTarget: 20, wordsCompleted: 14,
        writingTarget: 3, writingCompleted: 2,
        minutesTarget: 60, minutesCompleted: 48
    };

    const achievements = [
        { title: 'Conversation Starter', desc: 'Completed 5 AI spoken conversations with Aria', icon: '💬', unlocked: true, date: '2 days ago' },
        { title: 'Phonetics Pioneer', desc: 'Scored 85+ in pronunciation coach drills', icon: '⭐', unlocked: true, date: 'Yesterday' },
        { title: 'Extempore Dynamo', desc: 'Spoke continuously for 2 minutes without pausing', icon: '🎙️', unlocked: true, date: 'Today' },
        { title: 'Word Wizard', desc: 'Saved 20 words to personal vocabulary bank', icon: '📚', unlocked: false, date: 'In Progress (14/20)' },
        { title: 'Business Communicator', desc: 'Achieved 85+ tone score on professional email lab', icon: '💼', unlocked: true, date: '3 days ago' },
        { title: 'C1 Fluency Milestone', desc: 'Reach C1 CEFR Advanced certification level', icon: '🏆', unlocked: false, date: 'Current: B1' }
    ];

    const speakWord = (word) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Soft Skills Analytics & Learning Bank</h2>
                        <p className="text-xs text-slate-500">Track multi-dimensional mastery scores, error logs, vocabulary bank, and weekly targets.</p>
                    </div>
                </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
                {[
                    { id: 'radar', label: '📊 Skills Breakdown & Radar' },
                    { id: 'mistakes', label: `⚠️ Mistake Bank (${recurringMistakes.length})` },
                    { id: 'vocab', label: `📚 My Vocab Bank (${vocabBank.length})` },
                    { id: 'goals', label: '🎯 Weekly Habit Goals' },
                    { id: 'badges', label: '🏆 Achievements & Badges' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveSubTab(t.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeSubTab === t.id
                                ? 'bg-purple-600 text-white shadow-2xs'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* SUBTAB 1: Radar & Performance Metrics */}
            {activeSubTab === 'radar' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {[
                            { label: 'Spoken Fluency', val: scores.fluencyScore, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Pronunciation', val: scores.pronunciationScore, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                            { label: 'Grammar', val: scores.grammarScore, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Vocabulary', val: scores.vocabularyScore, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'Confidence', val: scores.confidenceScore, color: 'text-pink-600', bg: 'bg-pink-50' },
                            { label: 'Overall CEFR', val: scores.overallConfidence, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                        ].map((m, idx) => (
                            <div key={idx} className={`${m.bg} p-4 rounded-2xl border border-slate-200 text-center space-y-1`}>
                                <span className="text-[11px] font-bold text-slate-500 block truncate">{m.label}</span>
                                <div className={`text-2xl font-black ${m.color}`}>{m.val}%</div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                                    <div className={`h-full rounded-full bg-current ${m.color}`} style={{ width: `${m.val}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 text-white rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">CEFR Readiness</span>
                            <h3 className="text-lg font-black">Current Level: B1 (Intermediate) → Target: B2 (Upper Intermediate)</h3>
                            <p className="text-xs text-purple-200">
                                💡 Primary focus recommendation: Expand your active professional vocabulary and practice 2-minute extempore talks.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-center px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                                <span className="text-[10px] text-purple-200 block uppercase">Streak</span>
                                <strong className="text-base font-black text-amber-400">🔥 7 Days</strong>
                            </div>
                            <div className="text-center px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                                <span className="text-[10px] text-purple-200 block uppercase">Practice Time</span>
                                <strong className="text-base font-black text-white">48 Mins</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SUBTAB 2: Mistake Bank */}
            {activeSubTab === 'mistakes' && (
                <div className="space-y-3">
                    {recurringMistakes.map((m, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between font-bold">
                                <span className="text-purple-700">{m.pattern}</span>
                                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px]">
                                    {m.status} • Logged {m.occurrences} times
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="p-2.5 bg-red-50 text-red-900 rounded-lg border border-red-200">
                                    <strong className="block text-[10px] uppercase text-red-700">Incorrect:</strong>
                                    "{m.wrongExample}"
                                </div>
                                <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200">
                                    <strong className="block text-[10px] uppercase text-emerald-700">Correct:</strong>
                                    "{m.correctExample}"
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SUBTAB 3: Vocabulary Bank */}
            {activeSubTab === 'vocab' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vocabBank.map((w, i) => (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-900 text-sm">{w.word}</h4>
                                        <span className="text-[11px] font-mono text-slate-400">{w.ipa}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => speakWord(w.word)}
                                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-purple-600 hover:bg-purple-50"
                                        >
                                            <Volume2 className="w-3.5 h-3.5" />
                                        </button>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            w.status === 'Mastered'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-purple-100 text-purple-700'
                                        }`}>
                                            {w.status}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-xs mt-1">{w.meaning}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SUBTAB 4: Weekly Habit Goals */}
            {activeSubTab === 'goals' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                            <span>Daily Speaking Days</span>
                            <span className="text-purple-700 font-bold">{goals.speakingDaysCompleted} / {goals.speakingDaysTarget} days</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-purple-600 h-full rounded-full" style={{ width: `${(goals.speakingDaysCompleted / goals.speakingDaysTarget) * 100}%` }} />
                        </div>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                            <span>Target Vocabulary Mastered</span>
                            <span className="text-emerald-700 font-bold">{goals.wordsCompleted} / {goals.wordsTarget} words</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(goals.wordsCompleted / goals.wordsTarget) * 100}%` }} />
                        </div>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                            <span>Writing Lab Submissions</span>
                            <span className="text-pink-700 font-bold">{goals.writingCompleted} / {goals.writingTarget} essays</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-pink-600 h-full rounded-full" style={{ width: `${(goals.writingCompleted / goals.writingTarget) * 100}%` }} />
                        </div>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                            <span>Total Practice Minutes</span>
                            <span className="text-amber-700 font-bold">{goals.minutesCompleted} / {goals.minutesTarget} mins</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(goals.minutesCompleted / goals.minutesTarget) * 100}%` }} />
                        </div>
                    </div>
                </div>
            )}

            {/* SUBTAB 5: Achievements */}
            {activeSubTab === 'badges' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {achievements.map((ach, i) => (
                        <div
                            key={i}
                            className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs transition-all ${
                                ach.unlocked
                                    ? 'bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 opacity-60'
                            }`}
                        >
                            <div className="text-3xl p-2 bg-white rounded-xl border border-slate-200 shadow-2xs flex-shrink-0">
                                {ach.icon}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="font-bold text-slate-900">{ach.title}</h4>
                                    {ach.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                </div>
                                <p className="text-[11px] text-slate-500 leading-snug">{ach.desc}</p>
                                <span className="text-[10px] font-bold text-purple-700 block pt-0.5">{ach.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
