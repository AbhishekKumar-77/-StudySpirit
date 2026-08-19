import React from "react";
import { CheckCircle2, Bookmark, HelpCircle, EyeOff, LayoutGrid } from "lucide-react";

export default function QuestionPalette({
    questions = [],
    currentIndex = 0,
    userAnswers = {},
    markedForReview = {},
    visitedQuestions = {},
    onSelectQuestion = () => {},
    isOpen = true,
    onClose = () => {}
}) {
    // Stats calculation
    let answeredCount = 0;
    let markedCount = 0;
    let unansweredCount = 0;
    let notVisitedCount = 0;

    questions.forEach((q, idx) => {
        const qId = q._id || q.id || idx;
        const isAns = userAnswers[qId] !== undefined && userAnswers[qId] !== null && userAnswers[qId] !== "";
        const isMarked = !!markedForReview[qId];
        const isVisited = !!visitedQuestions[qId];

        if (isAns && isMarked) {
            markedCount++;
        } else if (isAns) {
            answeredCount++;
        } else if (isMarked) {
            markedCount++;
        } else if (isVisited) {
            unansweredCount++;
        } else {
            notVisitedCount++;
        }
    });

    return (
        <div className={`bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 text-white shadow-2xl transition-all duration-300 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                    <LayoutGrid className="w-4 h-4 text-blue-400" />
                    <span>Question Palette ({questions.length})</span>
                </div>
                <button
                    onClick={onClose}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800/60 transition"
                >
                    Hide
                </button>
            </div>

            {/* Legend Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-emerald-400 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-lg text-rose-400 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span>Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1.5 rounded-lg text-purple-400 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span>Review ({markedCount})</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-slate-400 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                    <span>Not Visited ({notVisitedCount})</span>
                </div>
            </div>

            {/* Grid of Question Buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {questions.map((q, idx) => {
                    const qId = q._id || q.id || idx;
                    const isCurrent = idx === currentIndex;
                    const isAns = userAnswers[qId] !== undefined && userAnswers[qId] !== null && userAnswers[qId] !== "";
                    const isMarked = !!markedForReview[qId];
                    const isVisited = !!visitedQuestions[qId];

                    let btnStyle = "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80";

                    if (isAns && isMarked) {
                        btnStyle = "bg-purple-600/30 text-purple-300 border-purple-500 font-bold ring-2 ring-purple-500/40";
                    } else if (isAns) {
                        btnStyle = "bg-emerald-600/30 text-emerald-300 border-emerald-500 font-bold";
                    } else if (isMarked) {
                        btnStyle = "bg-purple-600/20 text-purple-400 border-purple-500/60 font-medium";
                    } else if (isVisited) {
                        btnStyle = "bg-rose-600/20 text-rose-300 border-rose-500/40";
                    }

                    if (isCurrent) {
                        btnStyle += " ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 scale-105";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => onSelectQuestion(idx)}
                            className={`h-9 rounded-xl border flex items-center justify-center text-xs font-semibold transition-all duration-200 ${btnStyle}`}
                            title={`Question ${idx + 1}: ${isAns ? 'Answered' : isVisited ? 'Visited' : 'Not Visited'}`}
                        >
                            {idx + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
