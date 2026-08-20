import React, { useMemo } from 'react';
import { Target, Flame, Sparkles, Award, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { 
    PYTHON_MODULE_1_QUESTIONS, 
    PYTHON_MODULE_2_VARIABLES_QUESTIONS, 
    PYTHON_MODULE_2_DATA_QUESTIONS 
} from '../../data/pythonQuestions';

export default function DailyChallengeView({ onStartSession }) {
    // Combine all 60 questions into one pool
    const all60Questions = useMemo(() => [
        ...PYTHON_MODULE_1_QUESTIONS,
        ...PYTHON_MODULE_2_VARIABLES_QUESTIONS,
        ...PYTHON_MODULE_2_DATA_QUESTIONS
    ], []);

    // Pick 10 deterministic questions based on today's date string
    const todays10Questions = useMemo(() => {
        const todayStr = new Date().toDateString();
        // Simple hash function for date string
        let hash = 0;
        for (let i = 0; i < todayStr.length; i++) {
            hash = (hash << 5) - hash + todayStr.charCodeAt(i);
            hash |= 0;
        }
        const startIndex = Math.abs(hash) % Math.max(1, all60Questions.length - 10);
        return all60Questions.slice(startIndex, startIndex + 10);
    }, [all60Questions]);

    const handleStartChallenge = () => {
        if (onStartSession) {
            onStartSession({
                mode: 'topic',
                topic: `Daily Challenge (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
                questions: todays10Questions
            });
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-200">
                    <Target className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Daily Practice Challenge</h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Solve 10 questions selected daily from the Python 60-question mastery pool.
                    </p>
                </div>
            </div>

            {/* Daily Challenge Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-7">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between">
                    <span className="px-3.5 py-1 bg-amber-400/20 border border-amber-300/30 backdrop-blur-md rounded-full text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                        Today's Special Challenge
                    </span>
                    <span className="text-xs font-bold text-indigo-200 bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                </div>

                <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                        Python Core & Variables
                    </span>
                    <h2 className="text-3xl font-black tracking-tight text-white">
                        10 Questions Daily Sprint
                    </h2>
                    <p className="text-xs text-indigo-100/90 font-medium leading-relaxed max-w-xl">
                        Handpicked 10 questions from the 60 Python MCQs pool (Module 1, Module 2 Variables & Data Types). Complete today's set to boost your accuracy and streak score!
                    </p>
                </div>

                {/* Badges Info */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm text-center">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-300">Questions</p>
                        <p className="text-lg font-black text-white mt-0.5">10 MCQs</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-300">Pool Size</p>
                        <p className="text-lg font-black text-amber-300 mt-0.5">60 Questions</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-300">Reward</p>
                        <p className="text-lg font-black text-emerald-300 mt-0.5">+100 XP</p>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleStartChallenge}
                    className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Start Today's Challenge</span>
                    <ArrowRight className="w-5 h-5 ml-1" />
                </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-800">Fresh Questions Daily</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Every day a different set of 10 questions is selected automatically from the 60 questions database.
                        </p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 font-bold">
                        <Award className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-800">Build Habit & Streak</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Completing 10 questions daily keeps your practice heatmap green and updates your daily goal!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
