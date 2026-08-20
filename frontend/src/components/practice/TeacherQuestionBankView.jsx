import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, BookOpen, FileText, Plus, ChevronDown, ChevronUp, PlusCircle, Layers, Filter } from 'lucide-react';
import { 
    PYTHON_MODULE_1_QUESTIONS, 
    PYTHON_MODULE_2_VARIABLES_QUESTIONS, 
    PYTHON_MODULE_2_DATA_QUESTIONS 
} from '../../data/pythonQuestions';

export default function TeacherQuestionBankView({ onAddToQuiz, onAddToPaper }) {
    const [selectedModule, setSelectedModule] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [notification, setNotification] = useState(null);

    const modulesList = [
        { id: 'all', name: 'All Modules (Python)', count: PYTHON_MODULE_1_QUESTIONS.length + PYTHON_MODULE_2_VARIABLES_QUESTIONS.length + PYTHON_MODULE_2_DATA_QUESTIONS.length },
        { id: 'mod1', name: 'Module 1: Intro to Programming', questions: PYTHON_MODULE_1_QUESTIONS },
        { id: 'mod2_var', name: 'Module 2: Variables & Assignments', questions: PYTHON_MODULE_2_VARIABLES_QUESTIONS },
        { id: 'mod2_data', name: 'Module 2: Data Types & Operations', questions: PYTHON_MODULE_2_DATA_QUESTIONS },
    ];

    const currentQuestions = useMemo(() => {
        if (selectedModule === 'mod1') return PYTHON_MODULE_1_QUESTIONS;
        if (selectedModule === 'mod2_var') return PYTHON_MODULE_2_VARIABLES_QUESTIONS;
        if (selectedModule === 'mod2_data') return PYTHON_MODULE_2_DATA_QUESTIONS;
        return [
            ...PYTHON_MODULE_1_QUESTIONS,
            ...PYTHON_MODULE_2_VARIABLES_QUESTIONS,
            ...PYTHON_MODULE_2_DATA_QUESTIONS
        ];
    }, [selectedModule]);

    const filtered = useMemo(() => {
        return currentQuestions.filter(q => {
            const matchSearch = !searchTerm.trim() ||
                q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.options.some(o => o.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchSearch;
        });
    }, [currentQuestions, searchTerm]);

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

    const getSelectedQuestions = () => currentQuestions.filter(q => selectedIds.has(q.id));

    const showNotif = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddToQuiz = () => {
        const qs = getSelectedQuestions();
        if (qs.length === 0) { showNotif('⚠️ Select at least one question first.'); return; }
        if (onAddToQuiz) onAddToQuiz(qs);
        showNotif(`✅ ${qs.length} question${qs.length > 1 ? 's' : ''} added to quiz draft.`);
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
                <div className="fixed top-6 right-6 z-[200] bg-white border border-indigo-200 rounded-2xl px-5 py-3 shadow-xl text-sm font-semibold text-slate-800 animate-in slide-in-from-top flex items-center gap-2">
                    {notification}
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold shadow-md">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800">Python Question Bank</h1>
                            <p className="text-xs text-slate-500 font-medium">
                                Browse questions module-wise & add them directly to your quiz draft
                            </p>
                        </div>
                    </div>
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
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.02]"
                    >
                        <PlusCircle className="w-4 h-4" />
                        + Add Selected to Quiz Draft
                    </button>
                    <button
                        onClick={handleAddToPaper}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 transition-all hover:scale-[1.02]"
                    >
                        <FileText className="w-4 h-4" />
                        Add to Exam Paper
                    </button>
                </div>
            </div>

            {/* Module Selector Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
                    <Filter className="w-3.5 h-3.5" /> Modules:
                </span>
                {modulesList.map(mod => (
                    <button
                        key={mod.id}
                        onClick={() => { setSelectedModule(mod.id); setSelectedIds(new Set()); }}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                            selectedModule === mod.id
                                ? 'bg-violet-600 text-white border-violet-600 shadow-md scale-[1.02]'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-violet-50 hover:text-violet-700'
                        }`}
                    >
                        {mod.name}
                    </button>
                ))}
            </div>

            {/* Search & Select All */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                        onChange={selectAll}
                        className="w-4 h-4 accent-violet-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-600">Select All</span>
                </label>
                <div className="w-px h-5 bg-slate-200" />
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search questions or keywords..."
                    className="flex-1 text-xs text-slate-700 bg-transparent outline-none placeholder:text-slate-400 font-medium"
                />
                <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg shrink-0">
                    {filtered.length} Questions
                </span>
            </div>

            {/* Question List */}
            <div className="space-y-4">
                {filtered.map((q, idx) => {
                    const isExpanded = expandedId === q.id;
                    const isSelected = selectedIds.has(q.id);

                    return (
                        <div
                            key={q.id}
                            className={`bg-white rounded-2xl border transition-all shadow-sm ${
                                isSelected
                                    ? 'border-violet-500 ring-2 ring-violet-100'
                                    : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {/* Question Header */}
                            <div className="p-5 space-y-3">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSelect(q.id)}
                                        className="mt-1 w-4 h-4 accent-violet-600 cursor-pointer shrink-0"
                                    />
                                    <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 text-xs font-black flex items-center justify-center shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <span className="text-[11px] font-extrabold text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-md uppercase">
                                                {q.topic || 'Python Programming'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 leading-relaxed whitespace-pre-line">
                                            {q.question}
                                        </p>
                                    </div>

                                    {/* Action button right */}
                                    <button
                                        onClick={() => {
                                            if (onAddToQuiz) onAddToQuiz([q]);
                                            showNotif(`✅ Question ${idx + 1} added to quiz draft.`);
                                        }}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:scale-105 shrink-0"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add to Draft
                                    </button>
                                </div>

                                {/* Display Options List directly */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                    {q.options.map((opt, oIdx) => (
                                        <div
                                            key={oIdx}
                                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                                                oIdx === q.correct
                                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                                    : 'bg-slate-50/80 border-slate-200/80 text-slate-700'
                                            }`}
                                        >
                                            <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] shrink-0 ${
                                                oIdx === q.correct
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                {String.fromCharCode(65 + oIdx)}
                                            </span>
                                            <span className="flex-1">{opt}</span>
                                            {oIdx === q.correct && (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Answer & Details Bar */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2 text-xs">
                                    <span className="text-emerald-700 font-extrabold flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        Correct Answer: Option {String.fromCharCode(65 + q.correct)} ({q.options[q.correct]})
                                    </span>

                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                                        className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors ml-auto"
                                    >
                                        {isExpanded ? 'Hide Explanation' : 'View Explanation & Concept'}
                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                </div>

                                {/* Expanded Explanation & Key Concept */}
                                {isExpanded && (
                                    <div className="space-y-2 pt-2 border-t border-slate-100">
                                        {q.explanation && (
                                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                                                <span className="font-black text-amber-800">💡 Explanation: </span>
                                                {q.explanation}
                                            </div>
                                        )}
                                        {q.keyConcept && (
                                            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-xs text-indigo-900">
                                                <span className="font-black text-indigo-700">🎯 Key Concept: </span>
                                                {q.keyConcept}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
