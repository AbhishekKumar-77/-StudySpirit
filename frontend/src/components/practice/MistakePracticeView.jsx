import React from 'react';
import { AlertCircle, RefreshCw, CheckCircle2, Play, ChevronRight, RotateCcw } from 'lucide-react';

export default function MistakePracticeView({ mistakesData, onStartSession }) {
    // Load real mistakes from localStorage or passed props (no mock fallback)
    const rawLoggedMistakes = JSON.parse(localStorage.getItem('study_spirit_logged_mistakes') || '[]');

    // Structure raw mistakes into subject/topic groups if present
    let mistakes = mistakesData || [];
    if (!mistakesData && rawLoggedMistakes.length > 0) {
        const grouped = {};
        rawLoggedMistakes.forEach(item => {
            const sub = item.subject || "Python Programming";
            const top = item.topic || "Module 1 : Introduction to Programming";
            if (!grouped[sub]) grouped[sub] = {};
            if (!grouped[sub][top]) grouped[sub][top] = { topic: top, mistakeCount: 0, questions: [] };
            grouped[sub][top].mistakeCount++;
            grouped[sub][top].questions.push(item);
        });

        mistakes = Object.keys(grouped).map(sub => ({
            subject: sub,
            topics: Object.values(grouped[sub])
        }));
    }

    const totalMistakes = mistakes.reduce((acc, sub) => acc + sub.topics.reduce((tAcc, top) => tAcc + top.mistakeCount, 0), 0);

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800">Practice Your Mistakes</h1>
                            <p className="text-xs text-slate-500 font-medium">
                                Review and solve questions you previously got wrong to improve mastery.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-2 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-700 font-extrabold text-xs">
                    {totalMistakes} Total Mistakes Logged
                </div>
            </div>

            {/* Empty State Check */}
            {totalMistakes === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                        🎉
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">You're doing great!</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                        No incorrect questions logged yet. Start Smart Practice or Topic Practice to keep building your skills.
                    </p>
                    <button 
                        onClick={() => onStartSession({ mode: 'smart' })}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                        Start Smart Practice
                    </button>
                </div>
            ) : (
                /* Grouped Mistakes by Subject */
                <div className="space-y-6">
                    {mistakes.map((subItem, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-extrabold text-slate-800 tracking-wide flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                    {subItem.subject}
                                </h3>
                                <span className="text-xs font-bold text-slate-400">
                                    {subItem.topics.reduce((a, b) => a + b.mistakeCount, 0)} Mistakes
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {subItem.topics.map((top, tIdx) => (
                                    <div 
                                        key={tIdx} 
                                        className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-rose-300 hover:bg-rose-50/20 transition-all flex items-center justify-between"
                                    >
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800">{top.topic}</h4>
                                            <p className="text-[11px] font-semibold text-rose-600 mt-0.5">
                                                {top.mistakeCount} mistakes logged
                                            </p>
                                        </div>

                                        <button 
                                            onClick={() => onStartSession({
                                                mode: 'mistake',
                                                topic: top.topic,
                                                subject: subItem.subject
                                            })}
                                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            Practice Again
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
