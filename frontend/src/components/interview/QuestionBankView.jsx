import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Filter, ArrowRight, CheckCircle2, Building, ChevronDown, ChevronUp, Play } from 'lucide-react';
import soloApi from '../../services/soloApi';

export default function QuestionBankView({ onStartPractice }) {
    const [questions, setQuestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [expandedQuestionId, setExpandedQuestionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const categories = ['All', 'DSA', 'System Design', 'Backend', 'Behavioral', 'HR', 'DBMS', 'OS', 'Networks'];
    const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const data = await soloApi.getQuestionBank({
                    category: selectedCategory,
                    difficulty: selectedDifficulty,
                    search: searchQuery
                });
                if (data && data.questions) {
                    setQuestions(data.questions);
                }
            } catch (err) {
                console.error('Error fetching question bank:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, [selectedCategory, selectedDifficulty, searchQuery]);

    return (
        <div className="flex-1 bg-slate-50 text-slate-800 p-6 md:p-8 min-h-screen overflow-y-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Curated Repository</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Question Bank</h1>
                <p className="text-sm text-slate-500 mt-1">Explore 10,000+ curated interview questions asked by top tech companies</p>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-200 shadow-sm mb-6 space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by topic, keyword, or problem title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>

                    {/* Difficulty Selector */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-xs font-bold text-slate-500 shrink-0">Difficulty:</span>
                        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                            {difficulties.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setSelectedDifficulty(d)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                        selectedDifficulty === d ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 mr-2">Categories:</span>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                                selectedCategory === cat
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Question List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading questions...</div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs font-semibold">No questions found matching your filter criteria.</div>
                ) : (
                    questions.map((q) => {
                        const isExpanded = expandedQuestionId === q._id;
                        return (
                            <div key={q._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                                q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                                                q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {q.difficulty}
                                            </span>
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                                                {q.category}
                                            </span>
                                            {q.role && (
                                                <span className="text-[10px] font-semibold text-slate-400">
                                                    Target Role: {q.role}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-sm font-bold text-slate-900">{q.title}</h3>
                                        <p className="text-xs text-slate-600 line-clamp-2">{q.questionText}</p>

                                        {/* Company Tags */}
                                        {q.companyTags && q.companyTags.length > 0 && (
                                            <div className="flex items-center gap-1.5 pt-1">
                                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                                <div className="flex flex-wrap gap-1">
                                                    {q.companyTags.map(c => (
                                                        <span key={c} className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                            {c}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        <button
                                            onClick={() => setExpandedQuestionId(isExpanded ? null : q._id)}
                                            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 flex items-center gap-1 transition"
                                        >
                                            <span>{isExpanded ? 'Hide Sample' : 'View Sample'}</span>
                                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </button>

                                        <button
                                            onClick={() => onStartPractice(q.category, q.title)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition"
                                        >
                                            <Play className="w-3.5 h-3.5" />
                                            <span>Practice</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Sample Answer Box */}
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 bg-purple-50/40 rounded-xl p-4 text-xs">
                                        <p className="font-extrabold text-purple-900 mb-1">Sample Answer Concept:</p>
                                        <p className="text-slate-700 leading-relaxed">{q.sampleAnswer}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
