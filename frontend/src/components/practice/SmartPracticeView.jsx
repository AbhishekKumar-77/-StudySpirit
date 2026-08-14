import React, { useState } from 'react';
import { Brain, Sparkles, ArrowRight, Zap, Target, ShieldCheck } from 'lucide-react';

export default function SmartPracticeView({ onStartSession }) {
    const [selectedTopic, setSelectedTopic] = useState("OOP — Runtime Polymorphism");

    const smartRecommendation = {
        subject: "Python",
        topic: selectedTopic,
        questionCount: 10,
        difficultyMode: "Adaptive (Easy → Medium → Hard)",
        estimatedTimeMinutes: 8,
        reason: "You have struggled with this concept in your last 3 attempts.",
        masteryCurrent: 58,
        targetMastery: 85
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800">Smart Practice</h1>
                        <p className="text-xs text-slate-500 font-medium">
                            AI-driven adaptive practice tailored to your current weak areas & misconceptions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Recommended Session Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-6">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/40 backdrop-blur-md rounded-full text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        Recommended Practice Session
                    </span>
                    <span className="text-xs font-semibold text-indigo-200">
                        {smartRecommendation.estimatedTimeMinutes} mins
                    </span>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                        {smartRecommendation.subject}
                    </p>
                    <h2 className="text-3xl font-black tracking-tight">{smartRecommendation.topic}</h2>
                </div>

                {/* Reason Callout Box */}
                <div className="p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm text-xs font-medium leading-relaxed text-indigo-100">
                    <span className="font-bold text-amber-300">Why this session? </span>
                    {smartRecommendation.reason}
                </div>

                {/* Session Attributes Badges */}
                <div className="grid grid-cols-3 gap-4 py-2 border-y border-white/15 text-center">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-300">Questions</p>
                        <p className="text-base font-black mt-0.5">{smartRecommendation.questionCount}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-300">Difficulty</p>
                        <p className="text-base font-black mt-0.5">{smartRecommendation.difficultyMode.split(' ')[0]}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-300">Target Mastery</p>
                        <p className="text-base font-black mt-0.5 text-emerald-300">{smartRecommendation.targetMastery}%</p>
                    </div>
                </div>

                {/* Start Button */}
                <button 
                    onClick={() => onStartSession({
                        mode: 'smart',
                        topic: smartRecommendation.topic,
                        subject: smartRecommendation.subject
                    })}
                    className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-900 font-extrabold text-sm rounded-2xl shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                    <span>Start Practice Session</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* Other Smart Recommendations Grid */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Alternative Targeted Topics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        onClick={() => setSelectedTopic("Exception Handling & Custom Errors")}
                        className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 shadow-sm cursor-pointer transition-all flex items-center justify-between"
                    >
                        <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400">Python</span>
                            <h4 className="text-xs font-bold text-slate-800">Exception Handling & Custom Errors</h4>
                            <p className="text-[11px] text-slate-500 mt-1">Due for revision based on spaced repetition.</p>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-extrabold rounded-lg">Revision</span>
                    </div>

                    <div 
                        onClick={() => setSelectedTopic("SQL Joins & Aggregations")}
                        className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 shadow-sm cursor-pointer transition-all flex items-center justify-between"
                    >
                        <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400">DBMS</span>
                            <h4 className="text-xs font-bold text-slate-800">SQL Joins & Aggregations</h4>
                            <p className="text-[11px] text-slate-500 mt-1">6 previous mistakes logged.</p>
                        </div>
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[10px] font-extrabold rounded-lg">6 Mistakes</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
