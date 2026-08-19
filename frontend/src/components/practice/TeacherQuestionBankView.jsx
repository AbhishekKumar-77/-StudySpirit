import React, { useState } from 'react';
import { Search, CheckCircle2, BookOpen, FileText, Plus, ChevronDown, ChevronUp, PlusCircle, Layers } from 'lucide-react';
import { PYTHON_MODULE_1_QUESTIONS } from '../../data/pythonQuestions';

export default function TeacherQuestionBankView({ onAddToQuiz, onAddToPaper }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [activeFilter, setActiveFilter] = useState('all');
    const [notification, setNotification] = useState(null);

    const filtered = PYTHON_MODULE_1_QUESTIONS.filter(q => {
        const matchSearch = !searchTerm.trim() ||
            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.options.some(o => o.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchSearch;
    });

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(q => q.id)));
        }
    };

    const getSelectedQuestions = () => PYTHON_MODULE_1_QUESTIONS.filter(q => selectedIds.has(q.id));

    const showNotif = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddToQuiz = () => {
        const qs = getSelectedQuestions();
        if (qs.length === 0) { showNotif('⚠️ Select at least one question first.'); return; }
        if (onAddToQuiz) onAddToQuiz(qs);
        showNotif(`✅ ${qs.length} question${qs.length > 1 ? 's' : ''} added to quiz.`);
    };

    const handleAddToPaper = () => {
        const qs = getSelectedQuestions();
        if (qs.length === 0) { showNotif('⚠️ Select at least one question first.'); return; }
        if (onAddToPaper) onAddToPaper(qs);
        showNotif(`📄 ${qs.length} question${qs.length > 1 ? 's' : ''} added to exam paper.`);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Notification toast */}
            {notification && (
                <div className="fixed top-6 right-6 z-[200] bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-xl text-sm font-semibold text-slate-800 animate-in slide-in-from-top">
                    {notification}
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                            <Layers className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-black text-slate-800">Teacher Question Bank</h1>
                    </div>
                    <p className="text-xs text-slate-500 font-medium ml-11">
                        Python Programming · Module 1 · {PYTHON_MODULE_1_QUESTIONS.length} Questions with Answers
                    </p>
                </div>

                {/* Bulk Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    {selectedIds.size > 0 && (
                        <span className="px-3 py-1.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-xl">
                            {selectedIds.size} selected
                        </span>
                    )}
                    <button
                        onClick={handleAddToQuiz}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add to Quiz
                    </button>
                    <button
                        onClick={handleAddToPaper}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 transition-all"
                    >
                        <FileText className="w-4 h-4" />
                        Add to Exam Paper
                    </button>
                </div>
            </div>

            {/* Search & Select All */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                        onChange={selectAll}
                        className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-500">All</span>
                </label>
                <div className="w-px h-5 bg-slate-200" />
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search questions, options..."
                    className="flex-1 text-xs text-slate-700 bg-transparent outline-none placeholder:text-slate-400 font-medium"
                />
                <span className="text-xs font-semibold text-slate-400 shrink-0">{filtered.length} Qs</span>
            </div>

            {/* Question List */}
            <div className="space-y-3">
                {filtered.map((q, idx) => {
                    const isExpanded = expandedId === q.id;
                    const isSelected = selectedIds.has(q.id);

                    return (
                        <div
                            key={q.id}
                            className={`bg-white rounded-2xl border transition-all shadow-sm ${
                                isSelected
                                    ? 'border-violet-400 ring-2 ring-violet-100'
                                    : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {/* Question Row */}
                            <div className="flex items-start gap-3 p-4">
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(q.id)}
                                    className="mt-0.5 w-4 h-4 accent-violet-600 cursor-pointer shrink-0"
                                />

                                {/* Q Number Badge */}
                                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 text-xs font-extrabold flex items-center justify-center shrink-0">
                                    {idx + 1}
                                </div>

                                {/* Question Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                                        {q.question}
                                    </p>
                                    {!isExpanded && (
                                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                                            <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Answer: {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Expand Toggle */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-all shrink-0"
                                >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Expanded: Full Options + Explanation */}
                            {isExpanded && (
                                <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                                    {/* Options Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {q.options.map((opt, oIdx) => (
                                            <div
                                                key={oIdx}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${
                                                    oIdx === q.correct
                                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-md flex items-center justify-center font-extrabold text-[10px] shrink-0 ${
                                                    oIdx === q.correct
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                    {String.fromCharCode(65 + oIdx)}
                                                </span>
                                                {opt}
                                                {oIdx === q.correct && (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Explanation */}
                                    {q.explanation && (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 leading-relaxed">
                                            <span className="font-extrabold">Explanation: </span>
                                            {q.explanation}
                                        </div>
                                    )}

                                    {/* Key Concept */}
                                    {q.keyConcept && (
                                        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-800">
                                            <span className="font-extrabold text-indigo-600">Key Concept: </span>
                                            {q.keyConcept}
                                        </div>
                                    )}

                                    {/* Per-question add actions */}
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() => {
                                                if (onAddToQuiz) onAddToQuiz([q]);
                                                showNotif(`✅ Q${idx + 1} added to quiz.`);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add to Quiz
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (onAddToPaper) onAddToPaper([q]);
                                                showNotif(`📄 Q${idx + 1} added to exam paper.`);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            Add to Paper
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
