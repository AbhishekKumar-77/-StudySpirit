import React, { useState, useEffect } from 'react';
import { 
    CheckCircle2, XCircle, Sparkles, HelpCircle, ArrowRight, Lightbulb, 
    Bot, Bookmark, RefreshCw, ThumbsUp, ShieldAlert, Award, Clock
} from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { API_BASE } from '../../config';

export default function QuestionPlayer({ 
    questions = [], 
    sessionTitle = "Practice Session", 
    onFinish, 
    onAskAITutor 
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [confidence, setConfidence] = useState(null);
    const [savedBookmarked, setSavedBookmarked] = useState(false);
    const [scoreCount, setScoreCount] = useState(0);
    const [showResults, setShowResults] = useState(false);

    // AI Helper state
    const [aiHelpMode, setAiHelpMode] = useState(null); // 'explain' | 'hint'
    const [aiHelpText, setAiHelpText] = useState('');
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    // Enter fullscreen mode on mount
    useEffect(() => {
        try {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }
        } catch (e) {}
    }, []);

    const currentQ = questions[currentIndex] || {
        id: 'py-m1-q1',
        question: 'What is programming?',
        options: ['Creating instructions for computers', 'Designing components for computers', 'Managing files on a computer', 'Connecting devices to a network'],
        correct: 0,
        explanation: 'Programming is the process of creating instructions that tell a computer how to perform a particular task or solve a problem.',
        keyConcept: 'Sequential execution',
        difficulty: 'easy',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    };

    const handleSelectOption = async (idx) => {
        if (isSubmitted) return;
        setSelectedOption(idx);
        setIsSubmitted(true);

        const isRight = idx === currentQ.correct;
        if (isRight) {
            setScoreCount(prev => prev + 1);
        } else {
            // Log mistake into localStorage for Mistake Practice module
            try {
                const existing = JSON.parse(localStorage.getItem('study_spirit_logged_mistakes') || '[]');
                const exists = existing.some(m => m.question === currentQ.question);
                if (!exists) {
                    existing.push({
                        id: currentQ.id || Date.now(),
                        question: currentQ.question,
                        options: currentQ.options,
                        correct: currentQ.correct,
                        explanation: currentQ.explanation,
                        subject: currentQ.subject || 'Python Programming',
                        topic: currentQ.topic || 'Module 1 : Introduction to Programming',
                        date: new Date().toLocaleDateString()
                    });
                    localStorage.setItem('study_spirit_logged_mistakes', JSON.stringify(existing));
                }
            } catch (e) {
                console.error("Error logging mistake:", e);
            }
        }

        // Submit attempt to backend analytics
        try {
            await fetch(`${API_BASE}/practice/attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    questionId: currentQ.id || currentQ._id,
                    questionText: currentQ.question,
                    options: currentQ.options,
                    selectedAnswer: idx,
                    correctAnswer: currentQ.correct,
                    isCorrect: isRight,
                    subject: currentQ.subject || 'Python Programming',
                    topic: currentQ.topic || 'Module 1 : Introduction to Programming',
                    difficulty: currentQ.difficulty || 'easy',
                    confidence: confidence || 'none',
                    explanationGiven: currentQ.explanation || '',
                    keyConcept: currentQ.keyConcept || ''
                })
            });
        } catch (e) {
            console.error("Attempt log error:", e);
        }
    };

    const handleNextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
            setConfidence(null);
            setSavedBookmarked(false);
            setAiHelpMode(null);
            setAiHelpText('');
        } else {
            // Test completed!
            const finalScore = scoreCount + (selectedOption === currentQ.correct ? 1 : 0);
            const total = questions.length || 20;
            const percentage = Math.round((finalScore / total) * 100);

            // Update local storage mastery for Python Module 1
            localStorage.setItem('study_spirit_python_m1_score', percentage.toString());

            setShowResults(true);
        }
    };

    const handleRestartPractice = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsSubmitted(false);
        setConfidence(null);
        setSavedBookmarked(false);
        setScoreCount(0);
        setShowResults(false);
        setAiHelpMode(null);
        setAiHelpText('');
    };

    const handleExitPractice = () => {
        try {
            if (document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        } catch (e) {}

        const finalScore = scoreCount;
        const total = questions.length || 20;
        const percentage = Math.round((finalScore / total) * 100);

        onFinish({
            total,
            score: finalScore,
            percentage
        });
    };

    const handleFetchAIHelp = async (mode) => {
        setAiHelpMode(mode);
        setIsLoadingAi(true);
        try {
            const res = await fetch(`${API_BASE}/quiz/explain-answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    question: currentQ.question,
                    studentAnswer: currentQ.options[selectedOption] || '',
                    correctAnswer: currentQ.options[currentQ.correct]
                })
            });
            const data = await res.json();
            if (data.success) setAiHelpText(data.explanation);
            else setAiHelpText("Focus on understanding why the correct option satisfies the problem requirements.");
        } catch (e) {
            setAiHelpText("Hint: Review the fundamental concept explained in this question.");
        } finally {
            setIsLoadingAi(false);
        }
    };

    const handleSaveToBank = async () => {
        try {
            await fetch(`${API_BASE}/practice/save-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    questionText: currentQ.question,
                    options: currentQ.options,
                    correctIndex: currentQ.correct,
                    explanation: currentQ.explanation,
                    keyConcept: currentQ.keyConcept,
                    subject: currentQ.subject,
                    topic: currentQ.topic,
                    difficulty: currentQ.difficulty
                })
            });
            setSavedBookmarked(true);
            alert("Question saved to your Question Bank!");
        } catch (e) {
            alert("Saved locally to your Question Bank.");
            setSavedBookmarked(true);
        }
    };

    const isCorrect = isSubmitted && selectedOption === currentQ.correct;

    // Full-screen Result Summary Screen
    if (showResults) {
        const total = questions.length || 20;
        const percentage = Math.round((scoreCount / total) * 100);

        return (
            <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in">
                <div className="bg-white rounded-3xl p-8 md:p-12 max-w-xl w-full text-center space-y-6 shadow-2xl border border-slate-100">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto text-3xl font-black shadow-lg shadow-indigo-200">
                        {percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '📚'}
                    </div>

                    <div>
                        <span className="text-xs font-black uppercase text-indigo-600 tracking-widest">
                            Practice Complete
                        </span>
                        <h1 className="text-3xl font-black text-slate-900 mt-1">
                            Your Result: {percentage}%
                        </h1>
                        <p className="text-xs font-semibold text-slate-500 mt-2">
                            {percentage >= 80 ? 'Mastery Achieved! Fantastic performance.' : percentage >= 50 ? 'Good effort! Keep practicing to reach 100% mastery.' : 'Don\'t give up! Review your mistakes and try again.'}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="p-3 bg-white rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-400 font-bold uppercase">Total</p>
                            <p className="text-lg font-black text-slate-800">{total}</p>
                        </div>
                        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                            <p className="text-xs text-emerald-600 font-bold uppercase">Correct</p>
                            <p className="text-lg font-black text-emerald-700">{scoreCount}</p>
                        </div>
                        <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                            <p className="text-xs text-rose-600 font-bold uppercase">Wrong</p>
                            <p className="text-lg font-black text-rose-700">{total - scoreCount}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                        <button
                            onClick={handleRestartPractice}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Retake Practice</span>
                        </button>
                        <button
                            onClick={handleExitPractice}
                            className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                        >
                            Complete & Exit to Topics
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto p-4 md:p-8 animate-in fade-in">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header: Progress Bar & Question Count */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
                            {sessionTitle}
                        </span>
                        <h2 className="text-sm font-black text-slate-800">
                            Question {currentIndex + 1} of {questions.length || 1}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleSaveToBank}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                                savedBookmarked ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Bookmark className={`w-4 h-4 ${savedBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                            <span>{savedBookmarked ? 'Saved' : 'Save Question'}</span>
                        </button>
                        <button 
                            onClick={handleExitPractice}
                            className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all"
                        >
                            Exit
                        </button>
                    </div>
                </div>

                {/* Progress Bar Line */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                        style={{ width: `${((currentIndex + 1) / (questions.length || 1)) * 100}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                    />
                </div>

                {/* Main Question Card */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
                    {/* Question Text & Math formula */}
                    <div className="space-y-4">
                        <p className="text-base font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                            {currentQ.question}
                        </p>

                        {currentQ.mathFormula && (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto">
                                <BlockMath math={currentQ.mathFormula} />
                            </div>
                        )}
                    </div>

                    {/* MCQ Options */}
                    <div className="space-y-3">
                        {currentQ.options.map((optText, idx) => {
                            let optStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80";

                            if (selectedOption === idx) {
                                optStyle = "bg-indigo-50/80 border-indigo-500 text-indigo-900 font-bold ring-2 ring-indigo-500/20";
                            }

                            if (isSubmitted) {
                                if (idx === currentQ.correct) {
                                    optStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20";
                                } else if (selectedOption === idx) {
                                    optStyle = "bg-rose-50 border-rose-500 text-rose-900 font-bold ring-2 ring-rose-500/20";
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    disabled={isSubmitted}
                                    onClick={() => handleSelectOption(idx)}
                                    className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${optStyle}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-[11px] shadow-2xs">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="whitespace-pre-line">{optText}</span>
                                    </div>

                                    {isSubmitted && idx === currentQ.correct && (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    )}
                                    {isSubmitted && selectedOption === idx && idx !== currentQ.correct && (
                                        <XCircle className="w-5 h-5 text-rose-600" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Feedback Panel (After submission) */}
                    {isSubmitted && (
                        <div className="space-y-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                            {/* Result Badge */}
                            <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                                isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                            }`}>
                                {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-rose-600" />}
                                <div>
                                    <h4 className="text-sm font-black">{isCorrect ? '✓ Correct!' : '✕ Incorrect'}</h4>
                                    <p className="text-xs font-medium opacity-90">
                                        {isCorrect ? 'Great job! You selected the right answer.' : `Correct answer was option ${String.fromCharCode(65 + currentQ.correct)}.`}
                                    </p>
                                </div>
                            </div>

                            {/* Explanation Box */}
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                    Explanation
                                </h4>
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{currentQ.explanation}</p>

                                {currentQ.keyConcept && (
                                    <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200/60 text-xs font-semibold text-indigo-900">
                                        <span className="font-extrabold text-indigo-600">Key Concept: </span>
                                        {currentQ.keyConcept}
                                    </div>
                                )}
                            </div>

                            {/* AI Tutor Actions */}
                            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                                <p className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-indigo-600" />
                                    AI Tutor Intelligence
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <button 
                                        onClick={() => handleFetchAIHelp('explain')}
                                        className="px-3 py-1.5 bg-white border border-indigo-200 hover:border-indigo-500 text-indigo-700 text-xs font-bold rounded-xl shadow-2xs transition-all"
                                    >
                                        Explain More
                                    </button>
                                    <button 
                                        onClick={() => handleFetchAIHelp('hint')}
                                        className="px-3 py-1.5 bg-white border border-indigo-200 hover:border-indigo-500 text-indigo-700 text-xs font-bold rounded-xl shadow-2xs transition-all"
                                    >
                                        Give Hint
                                    </button>
                                    <button 
                                        onClick={() => onAskAITutor({ question: currentQ.question, answer: currentQ.options[selectedOption] })}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1"
                                    >
                                        <Bot className="w-3.5 h-3.5" />
                                        Ask AI Tutor
                                    </button>
                                </div>

                                {/* AI Output preview */}
                                {aiHelpMode && (
                                    <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-200 text-xs text-slate-700 leading-relaxed">
                                        {isLoadingAi ? 'AI Tutor is generating explanation...' : aiHelpText}
                                    </div>
                                )}
                            </div>

                            {/* Confidence Tracking Selector */}
                            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2">
                                <p className="text-xs font-bold text-slate-700">How confident were you with this question?</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { id: 'guessing', label: 'Guessing', style: 'border-slate-200 text-slate-600' },
                                        { id: 'unsure', label: 'Unsure', style: 'border-amber-200 text-amber-700' },
                                        { id: 'fairly_sure', label: 'Fairly Sure', style: 'border-blue-200 text-blue-700' },
                                        { id: 'very_confident', label: 'Very Confident', style: 'border-emerald-200 text-emerald-700' }
                                    ].map((conf) => (
                                        <button
                                            key={conf.id}
                                            onClick={() => setConfidence(conf.id)}
                                            className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                                                confidence === conf.id 
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                                    : `bg-slate-50 hover:bg-slate-100 ${conf.style}`
                                            }`}
                                        >
                                            {conf.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Next / Finish Button */}
                            <button
                                onClick={handleNextQuestion}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                            >
                                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Practice'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
