import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, CheckCircle2, BookOpen, Lightbulb, Search, FolderHeart } from 'lucide-react';
import { API_BASE } from '../../config';

export default function SavedQuizzesView() {
    const [savedQuestions, setSavedQuestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSavedQuestions();
    }, []);

    const loadSavedQuestions = async () => {
        setLoading(true);
        let questions = [];

        // 1. Try loading from localStorage
        try {
            const localSaved = JSON.parse(localStorage.getItem('study_spirit_saved_questions') || '[]');
            questions = localSaved;
        } catch (e) {
            console.error("Local saved load error:", e);
        }

        // 2. Fetch from backend API if available
        try {
            const res = await fetch(`${API_BASE}/practice/saved-questions`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success && data.questions && data.questions.length > 0) {
                // Merge backend saved questions with local saved questions
                const merged = [...questions];
                data.questions.forEach(q => {
                    if (!merged.some(m => m.question === q.questionText || m.question === q.question)) {
                        merged.push({
                            id: q._id || q.id,
                            question: q.questionText || q.question,
                            options: q.options || [],
                            correct: q.correctIndex !== undefined ? q.correctIndex : (q.correct || 0),
                            explanation: q.explanation,
                            keyConcept: q.keyConcept,
                            subject: q.subject || 'Python Programming',
                            topic: q.topic || 'General Practice',
                            savedAt: new Date(q.createdAt || Date.now()).toLocaleDateString()
                        });
                    }
                });
                questions = merged;
            }
        } catch (e) {
            console.log("Backend saved fetch offline or empty, using local saved.");
        }

        setSavedQuestions(questions);
        setLoading(false);
    };

    const handleDeleteSaved = (indexToDelete) => {
        const updated = savedQuestions.filter((_, idx) => idx !== indexToDelete);
        setSavedQuestions(updated);
        try {
            localStorage.setItem('study_spirit_saved_questions', JSON.stringify(updated));
        } catch (e) {}
    };

    const filteredQuestions = savedQuestions.filter(q => 
        (q.question || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.topic || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200">
                        <FolderHeart className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Saved Quizzes & Questions</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Questions bookmarked by you during practice sessions.
                        </p>
                    </div>
                </div>

                {savedQuestions.length > 0 && (
                    <span className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black rounded-full">
                        {savedQuestions.length} Saved Questions
                    </span>
                )}
            </div>

            {/* Search Bar */}
            {savedQuestions.length > 0 && (
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                    <input
                        type="text"
                        placeholder="Search saved questions by keyword or topic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
            )}

            {/* Saved Questions List */}
            {loading ? (
                <div className="py-16 text-center text-slate-400 font-medium text-xs">
                    Loading your saved questions...
                </div>
            ) : filteredQuestions.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
                        <Bookmark className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-800">No Saved Questions Yet</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            While practicing any question in Topic Practice, Smart Practice, or Daily Challenge, click the bookmark button to save it here for revision!
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredQuestions.map((q, idx) => {
                        const correctIndex = typeof q.correct === 'number' ? q.correct : 0;
                        const optionsList = Array.isArray(q.options) && q.options.length > 0 
                            ? q.options 
                            : ["Option A", "Option B", "Option C", "Option D"];

                        return (
                            <div key={idx} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-5">
                                {/* Top Badge & Delete Button */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-100">
                                            {q.subject || 'Python Programming'}
                                        </span>
                                        {q.topic && (
                                            <span className="text-[11px] font-bold text-slate-400">
                                                • {q.topic}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleDeleteSaved(idx)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                        title="Remove from saved"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* 1. Question Text */}
                                <div className="space-y-1">
                                    <h3 className="text-sm font-extrabold text-slate-800 leading-snug">
                                        Q{idx + 1}. {q.question}
                                    </h3>
                                </div>

                                {/* 2. All 4 Options */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    {optionsList.map((opt, optIdx) => {
                                        const isCorrectOpt = optIdx === correctIndex;
                                        const labelLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                                        return (
                                            <div
                                                key={optIdx}
                                                className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-3 transition-all ${
                                                    isCorrectOpt
                                                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold shadow-sm'
                                                        : 'bg-slate-50 border-slate-200/80 text-slate-700'
                                                }`}
                                            >
                                                <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-bold text-[11px] ${
                                                    isCorrectOpt 
                                                        ? 'bg-emerald-600 text-white' 
                                                        : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                    {labelLetter}
                                                </span>
                                                <span className="flex-1">{opt}</span>
                                                {isCorrectOpt && (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* 3. Answer & Detailed Explanation */}
                                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                                    <div className="flex items-center gap-2 font-black text-emerald-700">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Correct Answer: Option {String.fromCharCode(65 + correctIndex)} — {optionsList[correctIndex]}</span>
                                    </div>

                                    {q.explanation && (
                                        <div className="flex items-start gap-2 text-slate-600 leading-relaxed font-medium pt-1">
                                            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <span><strong className="text-slate-800">Explanation:</strong> {q.explanation}</span>
                                        </div>
                                    )}

                                    {q.keyConcept && (
                                        <div className="text-[11px] font-bold text-indigo-600 pt-1">
                                            Key Concept: {q.keyConcept}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
