import React, { useState } from 'react';
import { Brain, Sparkles, ArrowRight, Zap, Target, BookOpen, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_BASE } from '../../config';
import { PYTHON_MODULE_1_QUESTIONS } from '../../data/pythonQuestions';

export default function SmartPracticeView({ onStartSession }) {
    const [topicName, setTopicName] = useState("Python OOP & Classes");
    const [difficultyLevel, setDifficultyLevel] = useState("medium");
    const [questionCount, setQuestionCount] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const popularTopics = [
        "Python Programming",
        "HTML & CSS Basics",
        "JavaScript Fundamentals",
        "DBMS & SQL Joins",
        "Data Structures & Algorithms",
        "Basics of Computers"
    ];

    const handleGeneratePractice = async () => {
        if (!topicName.trim()) {
            setErrorMsg("Please enter a topic name for your practice session.");
            return;
        }
        setErrorMsg('');
        setSuccessMsg('');
        setIsGenerating(true);

        try {
            const res = await fetch(`${API_BASE}/quiz/generate-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topicName.trim(),
                    difficulty: difficultyLevel,
                    mcqCount: Number(questionCount) || 10,
                    count: Number(questionCount) || 10,
                    codingCount: 0,
                    type: 'mcq'
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Server error: ${res.status}`);
            }

            const data = await res.json();

            if (data.success && data.questions && data.questions.length > 0) {
                setSuccessMsg(`✓ ${data.questions.length} questions generated for "${topicName.trim()}"! Starting session...`);
                setTimeout(() => {
                    if (onStartSession) {
                        onStartSession({
                            mode: 'smart',
                            topic: topicName.trim(),
                            questions: data.questions
                        });
                    }
                }, 800);
            } else {
                throw new Error(data.message || "No questions returned from AI. Try a different topic.");
            }
        } catch (error) {
            console.error("AI Practice generation error:", error);
            setErrorMsg(`AI generation failed: ${error.message}. Please check your internet connection and try again.`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200">
                    <Brain className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">AI Smart Practice</h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Enter any topic name and let AI generate instant adaptive questions for you.
                    </p>
                </div>
            </div>

            {/* Main AI Practice Creator Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-7 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />

                {/* Error Banner */}
                {errorMsg && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl p-4 relative z-10">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Success Banner */}
                {successMsg && (
                    <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl p-4 relative z-10">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Step 1: Topic Input */}
                <div className="space-y-3 relative z-10">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        1. Enter Topic Name
                    </label>
                    <input
                        type="text"
                        value={topicName}
                        onChange={(e) => setTopicName(e.target.value)}
                        placeholder="e.g. Python OOP, HTML Forms, SQL Joins..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                    />

                    {/* Popular Topic Chips */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-[11px] font-bold text-slate-400">Quick Select:</span>
                        {popularTopics.map((top, idx) => (
                            <button
                                key={idx}
                                onClick={() => setTopicName(top)}
                                className={`text-[11px] font-bold px-3 py-1 rounded-xl border transition-all ${
                                    topicName === top
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600'
                                }`}
                            >
                                {top}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Difficulty Level */}
                <div className="space-y-3 relative z-10">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        2. Select Difficulty Level
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { id: 'easy', label: 'Easy', color: 'emerald' },
                            { id: 'medium', label: 'Medium', color: 'indigo' },
                            { id: 'hard', label: 'Hard', color: 'rose' },
                            { id: 'adaptive', label: 'Adaptive', color: 'amber' }
                        ].map((diff) => (
                            <button
                                key={diff.id}
                                onClick={() => setDifficultyLevel(diff.id)}
                                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all text-center ${
                                    difficultyLevel === diff.id
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {diff.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 3: Question Count */}
                <div className="space-y-3 relative z-10">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        3. Number of Questions
                    </label>
                    <div className="flex items-center gap-3">
                        {[5, 10, 15, 20].map((count) => (
                            <button
                                key={count}
                                onClick={() => setQuestionCount(count)}
                                className={`flex-1 py-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                                    Number(questionCount) === count
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {count} Questions
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGeneratePractice}
                    disabled={isGenerating}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-75 relative z-10"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Generating Questions with StudySpirit AI...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 text-amber-300" />
                            <span>Generate AI Practice Session</span>
                            <ArrowRight className="w-5 h-5 ml-1" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

