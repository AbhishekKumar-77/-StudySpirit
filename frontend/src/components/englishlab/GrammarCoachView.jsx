import React, { useState } from 'react';
import { PenTool, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function GrammarCoachView({ profile = {} }) {
    const mistakes = profile.recurringMistakes || [
        {
            pattern: 'Subject-Verb Agreement / Past Tense',
            wrongExample: 'Yesterday I go university and meet my friend',
            correctExample: 'Yesterday I went to university and met my friend',
            explanation: 'Use simple past tense ("went", "met") for completed past actions.',
            category: 'grammar',
            occurrences: 7,
            masteryScore: 42
        },
        {
            pattern: 'Preposition of Duration',
            wrongExample: 'I am studying here since two years',
            correctExample: 'I have been studying here for two years',
            explanation: 'Use "for" with durations of time and Present Perfect Continuous.',
            category: 'grammar',
            occurrences: 4,
            masteryScore: 60
        }
    ];

    const [exerciseAnswer, setExerciseAnswer] = useState('');
    const [exerciseChecked, setExerciseChecked] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-purple-600" />
                    Grammar Coach — Personalized from Your Practice
                </h2>
                <p className="text-xs text-slate-500">
                    Targeted grammar exercises automatically created from errors recorded during your speaking and writing sessions.
                </p>
            </div>

            {/* Recurring Mistakes Cards */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Recurring Mistakes</h3>

                {mistakes.map((m, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-700 text-xs">{m.pattern}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                                Occurrences: {m.occurrences} • Mastery: {m.masteryScore}%
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900">
                                <span className="font-bold block text-[10px] text-red-700 uppercase">You Said:</span>
                                "{m.wrongExample}"
                            </div>
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                                <span className="font-bold block text-[10px] text-emerald-700 uppercase">Better:</span>
                                "{m.correctExample}"
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic">
                            💡 <strong>Why:</strong> {m.explanation}
                        </p>
                    </div>
                ))}
            </div>

            {/* Interactive Practice Exercise */}
            <div className="p-5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Targeted Practice Exercise
                </h3>
                <p className="text-xs text-slate-600">Complete the sentence using Present Perfect Continuous:</p>

                <div className="bg-white p-4 rounded-xl border border-purple-200 text-xs font-semibold text-slate-800 space-y-2">
                    <p>"I _____ (study) Computer Science at university _____ three years."</p>
                    <input
                        type="text"
                        value={exerciseAnswer}
                        onChange={(e) => setExerciseAnswer(e.target.value)}
                        placeholder="Type your answer (e.g. have been studying ... for)..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-purple-500 focus:outline-none"
                    />
                </div>

                <button
                    onClick={() => setExerciseChecked(true)}
                    className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 shadow-2xs"
                >
                    Check Answer
                </button>

                {exerciseChecked && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Correct! "have been studying... for three years" is the right Present Perfect Continuous form.
                    </div>
                )}
            </div>
        </div>
    );
}
