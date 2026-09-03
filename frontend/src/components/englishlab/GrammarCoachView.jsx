import React, { useState } from 'react';
import { PenTool, CheckCircle2, AlertCircle, Sparkles, ArrowRight, BookOpen, RefreshCw } from 'lucide-react';

export default function GrammarCoachView({ profile = {} }) {
    const mistakes = profile.recurringMistakes || [
        {
            pattern: 'Subject-Verb Agreement / Past Tense',
            wrongExample: 'Yesterday I go university and meet my project guide',
            correctExample: 'Yesterday I went to university and met my project guide',
            explanation: 'Use simple past tense ("went", "met") for completed past actions with past time markers like "yesterday".',
            category: 'grammar',
            occurrences: 7,
            masteryScore: 45
        },
        {
            pattern: 'Preposition of Duration (Since vs For)',
            wrongExample: 'I am learning React since three years',
            correctExample: 'I have been learning React for three years',
            explanation: 'Use "for" with durations of time (three years) and "since" with specific starting points (since 2023). Use Present Perfect Continuous for continuing actions.',
            category: 'grammar',
            occurrences: 4,
            masteryScore: 60
        },
        {
            pattern: 'Polite Modal Verbs in Email Requests',
            wrongExample: 'Send me the updated database schema today',
            correctExample: 'Could you please send me the updated database schema by today?',
            explanation: 'In professional communication, replace imperatives with polite modal questions ("Could you please...", "Would you mind...").',
            category: 'politeness',
            occurrences: 3,
            masteryScore: 70
        }
    ];

    const quizQuestions = [
        {
            rule: 'Present Perfect Continuous',
            prompt: 'Complete the sentence: "We _____ (develop) this microservice architecture _____ six months."',
            options: [
                'are developing / since',
                'have been developing / for',
                'developed / since',
                'had developed / for'
            ],
            correctIdx: 1,
            explanation: '"have been developing / for" is correct because the action started in the past, continues today, and spans a duration (six months).'
        },
        {
            rule: 'Subject-Verb Agreement',
            prompt: 'Choose the correct sentence for technical documentation:',
            options: [
                'Each of the API endpoints return JSON response.',
                'Each of the API endpoints returns JSON response.',
                'Each of the API endpoints are returning JSON responses.',
                'Each of the API endpoints have returned JSON response.'
            ],
            correctIdx: 1,
            explanation: '"Each" is a singular indefinite pronoun and takes the singular verb "returns".'
        },
        {
            rule: 'Polite Professional Request',
            prompt: 'Which sentence is most appropriate when requesting urgent code review?',
            options: [
                'Check my PR immediately before sprint ends.',
                'Why have you not reviewed my PR yet?',
                'Could you please review PR #42 when you have a moment before today\'s release?',
                'Review PR #42 now please.'
            ],
            correctIdx: 2,
            explanation: '"Could you please review... when you have a moment" is polite, professional, and clear.'
        }
    ];

    const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [quizChecked, setQuizChecked] = useState(false);
    const [quizScore, setQuizScore] = useState(0);

    const q = quizQuestions[currentQuizIdx];

    const handleCheckQuiz = () => {
        if (selectedOption === null) return;
        setQuizChecked(true);
        if (selectedOption === q.correctIdx) {
            setQuizScore(s => s + 1);
        }
    };

    const handleNextQuiz = () => {
        setSelectedOption(null);
        setQuizChecked(false);
        if (currentQuizIdx < quizQuestions.length - 1) {
            setCurrentQuizIdx(i => i + 1);
        } else {
            setCurrentQuizIdx(0);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <PenTool className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Targeted Grammar Coach</h2>
                        <p className="text-xs text-slate-500">
                            Personalized grammar exercises and rule explanations based on real mistakes logged from your speaking and writing practice.
                        </p>
                    </div>
                </div>
            </div>

            {/* Recurring Mistakes Cards */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Your Recurring Mistake Patterns ({mistakes.length})
                    </h3>
                    <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        Auto-Synced from AI Sessions
                    </span>
                </div>

                {mistakes.map((m, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-700 text-xs">{m.pattern}</span>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                                Logged {m.occurrences} times • Mastery: {m.masteryScore}%
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-red-50/80 border border-red-200 rounded-lg text-red-900">
                                <span className="font-bold block text-[10px] text-red-700 uppercase">You Said / Wrote:</span>
                                "{m.wrongExample}"
                            </div>
                            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-900">
                                <span className="font-bold block text-[10px] text-emerald-700 uppercase">Correct Phrasing:</span>
                                "{m.correctExample}"
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic leading-relaxed">
                            💡 <strong>Why:</strong> {m.explanation}
                        </p>
                    </div>
                ))}
            </div>

            {/* Interactive Grammar Drill Quiz */}
            <div className="p-6 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Targeted Grammar Quiz (Question {currentQuizIdx + 1} of {quizQuestions.length})
                    </h3>
                    <span className="px-2.5 py-0.5 bg-white text-purple-700 font-bold text-xs rounded-lg border border-purple-200">
                        Rule: {q.rule}
                    </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 bg-white p-3.5 rounded-xl border border-purple-200 leading-relaxed">
                    {q.prompt}
                </p>

                {/* Multiple Choice Options */}
                <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                        const isSelected = selectedOption === oIdx;
                        let optStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';

                        if (quizChecked) {
                            if (oIdx === q.correctIdx) optStyle = 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold';
                            else if (isSelected) optStyle = 'bg-red-100 border-red-300 text-red-900 font-bold';
                        } else if (isSelected) {
                            optStyle = 'bg-purple-100 border-purple-400 text-purple-900 font-bold';
                        }

                        return (
                            <button
                                key={oIdx}
                                disabled={quizChecked}
                                onClick={() => setSelectedOption(oIdx)}
                                className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${optStyle}`}
                            >
                                <span>{opt}</span>
                                {quizChecked && oIdx === q.correctIdx && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between pt-2">
                    {!quizChecked ? (
                        <button
                            onClick={handleCheckQuiz}
                            disabled={selectedOption === null}
                            className="px-5 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 disabled:opacity-50 shadow-2xs"
                        >
                            Check Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuiz}
                            className="px-5 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 flex items-center gap-1 shadow-2xs"
                        >
                            {currentQuizIdx < quizQuestions.length - 1 ? 'Next Question' : 'Restart Quiz'} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {quizChecked && (
                    <div className="p-3.5 bg-white border border-purple-200 rounded-xl text-xs text-slate-700 leading-relaxed shadow-2xs">
                        <strong>💡 Explanation:</strong> {q.explanation}
                    </div>
                )}
            </div>
        </div>
    );
}
