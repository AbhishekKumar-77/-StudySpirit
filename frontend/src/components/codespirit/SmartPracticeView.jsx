import React, { useState } from 'react';
import { Zap, Sparkles, Target, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';

export default function SmartPracticeView({ selectedSubject, onStartPractice }) {
    const [difficulty, setDifficulty] = useState("medium");
    const [count, setCount] = useState(5);
    const [topicInput, setTopicInput] = useState("Functions & Recursion");

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 rounded-3xl text-white shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                    <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                        <Zap size={24} />
                    </span>
                    <div>
                        <h2 className="text-2xl font-bold">Smart Practice Engine</h2>
                        <p className="text-sm text-purple-200">AI-powered adaptive learning recommendations</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/10">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-purple-200 uppercase mb-2">Selected Subject Context</label>
                            <div className="px-4 py-3 rounded-xl bg-white/10 text-white font-bold text-base flex items-center justify-between border border-white/10">
                                <span className="capitalize">{selectedSubject}</span>
                                <span className="text-xs bg-purple-500/30 px-2.5 py-1 rounded-md text-purple-200">Active</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-purple-200 uppercase mb-2">Target Topic</label>
                            <input
                                type="text"
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-purple-300 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                                placeholder="e.g. Arrays, Recursion, Pointers"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-purple-200 uppercase mb-2">Difficulty</label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-semibold"
                                >
                                    <option value="easy" className="text-gray-900">Easy</option>
                                    <option value="medium" className="text-gray-900">Medium</option>
                                    <option value="hard" className="text-gray-900">Hard</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-purple-200 uppercase mb-2">Question Count</label>
                                <select
                                    value={count}
                                    onChange={(e) => setCount(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-semibold"
                                >
                                    <option value={1} className="text-gray-900">1 Challenge</option>
                                    <option value={3} className="text-gray-900">3 Challenges</option>
                                    <option value={5} className="text-gray-900">5 Challenges</option>
                                    <option value={10} className="text-gray-900">10 Challenges</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => onStartPractice(selectedSubject, topicInput, difficulty, count)}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
                        >
                            <Zap size={18} className="fill-white" />
                            <span>Launch Smart Practice Session</span>
                        </button>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col justify-between">
                        <div>
                            <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-3">AI Diagnostic Summary</h4>
                            <div className="space-y-3 text-xs text-purple-100">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <span>Mastery index for {selectedSubject}: 68%</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Target size={16} className="text-amber-400 shrink-0 mt-0.5" />
                                    <span>Targeting weakest concepts first for faster retention</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Sparkles size={16} className="text-purple-300 shrink-0 mt-0.5" />
                                    <span>Generates competitive programming format problems with hidden edge-cases</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 text-center">
                            <span className="text-[11px] text-purple-300">Powered by StudySpirit Real-time Piston Engine</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
