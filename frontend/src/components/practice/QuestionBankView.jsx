import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, Search, Filter, Play, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { API_BASE } from '../../config';
import { PYTHON_MODULE_1_QUESTIONS } from '../../data/pythonQuestions';

export default function QuestionBankView({ onStartSession }) {
    const [activeTab, setActiveTab] = useState('module1'); // 'module1' | 'saved' | 'mistakes' | 'difficult'
    const [questions, setQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (activeTab === 'module1') {
            const formatted = PYTHON_MODULE_1_QUESTIONS.map((q, idx) => ({
                _id: q.id || `py-m1-${idx}`,
                questionText: q.question,
                options: q.options,
                correctIndex: q.correct,
                explanation: q.explanation,
                keyConcept: q.keyConcept,
                subject: q.subject,
                topic: q.topic
            }));

            if (searchTerm.trim()) {
                const filtered = formatted.filter(q => 
                    q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    q.explanation.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setQuestions(filtered);
            } else {
                setQuestions(formatted);
            }
        } else {
            const fetchQuestions = async () => {
                try {
                    const res = await fetch(`${API_BASE}/practice/question-bank?category=${activeTab}&search=${encodeURIComponent(searchTerm)}`, {
                        credentials: 'include'
                    });
                    const data = await res.json();
                    if (data.success && data.questions?.length > 0) {
                        setQuestions(data.questions);
                    } else if (activeTab === 'mistakes') {
                        const rawLogged = JSON.parse(localStorage.getItem('study_spirit_logged_mistakes') || '[]');
                        setQuestions(rawLogged.map(m => ({
                            _id: m.id,
                            questionText: m.question,
                            options: m.options,
                            correctIndex: m.correct,
                            explanation: m.explanation,
                            subject: m.subject,
                            topic: m.topic
                        })));
                    } else {
                        setQuestions([]);
                    }
                } catch (e) {
                    console.error("Fetch QB Error:", e);
                }
            };
            fetchQuestions();
        }
    }, [activeTab, searchTerm]);

    const handleRemoveQuestion = async (id) => {
        try {
            await fetch(`${API_BASE}/practice/save-question/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            setQuestions(prev => prev.filter(q => q._id !== id));
        } catch (e) {
            setQuestions(prev => prev.filter(q => q._id !== id));
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-black text-slate-800">Question Bank Module</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                    Inspect, search, and practice questions from Python Module 1 and your saved repository.
                </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1 w-full md:w-auto flex-wrap">
                    {[
                        { id: 'module1', label: 'Python Module 1 (20 Qs)' },
                        { id: 'saved', label: 'Saved' },
                        { id: 'mistakes', label: 'Logged Mistakes' },
                        { id: 'difficult', label: 'Difficult' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search questions..."
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                        <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-700">No questions found</h3>
                        <p className="text-xs text-slate-400">Bookmark questions during practice to see them here.</p>
                    </div>
                ) : (
                    questions.map((q, idx) => (
                        <div key={q._id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-indigo-300 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-[10px] rounded-md">
                                        {q.subject || 'General'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">• {q.topic || 'General'}</span>
                                </div>

                                <button 
                                    onClick={() => handleRemoveQuestion(q._id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Remove from Saved"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-xs font-bold text-slate-800 leading-relaxed">{q.questionText}</p>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <span className="text-[11px] font-semibold text-slate-500">
                                    Correct Option: Option {String.fromCharCode(65 + (q.correctIndex || 0))}
                                </span>
                                <button 
                                    onClick={() => onStartSession({ mode: 'custom', question: q })}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1"
                                >
                                    <Play className="w-3 h-3 fill-current" />
                                    Practice
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
