import React, { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import { CheckCircle2, Square, CheckSquare, Code, AlignLeft, HelpCircle } from "lucide-react";

export default function QuestionRenderer({
    question,
    questionIndex = 0,
    userAnswer,
    onAnswerChange = () => {},
    onExecuteCode = null,
    isExecutingCode = false,
    codeOutput = null,
    readOnly = false
}) {
    if (!question) return null;

    const qType = question.type || "mcq";
    const qId = question._id || question.id || questionIndex;

    // Helper: render KaTeX or plain text
    const renderMathOrText = (str) => {
        if (!str) return null;
        if (str.includes('$') || str.includes('\\')) {
            try {
                return <InlineMath math={str.replace(/\$/g, '')} />;
            } catch (e) {
                return <span>{str}</span>;
            }
        }
        return <span>{str}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Question Header & Media attachments */}
            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold uppercase tracking-wider mt-0.5">
                        {qType.toUpperCase()}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-slate-100 leading-snug">
                        {question.question}
                    </h3>
                </div>

                {/* KaTeX formula string if present */}
                {question.mathFormula && (
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl my-2 overflow-x-auto text-blue-300">
                        <BlockMath math={question.mathFormula} />
                    </div>
                )}

                {/* Media (Image / Audio / Video) */}
                {question.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-800 max-h-72 my-3 max-w-xl">
                        <img src={question.imageUrl} alt="Question Diagram" className="w-full h-full object-contain bg-black/40" />
                    </div>
                )}

                {question.audioUrl && (
                    <audio controls className="w-full my-2">
                        <source src={question.audioUrl} />
                    </audio>
                )}

                {question.videoUrl && (
                    <video controls className="w-full max-h-72 rounded-xl border border-slate-800 my-2">
                        <source src={question.videoUrl} />
                    </video>
                )}
            </div>

            {/* Render options based on question type */}
            <div className="mt-4">
                {/* 1. MCQ Single Select */}
                {qType === "mcq" && (
                    <div className="grid grid-cols-1 gap-3">
                        {(question.options || []).map((opt, idx) => {
                            const isSelected = Number(userAnswer) === idx;
                            return (
                                <button
                                    key={idx}
                                    disabled={readOnly}
                                    onClick={() => onAnswerChange(idx)}
                                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                                        isSelected
                                            ? "bg-blue-600/20 border-blue-500 text-blue-200 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                                            : "bg-slate-800/40 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                                    }`}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                                        isSelected ? "bg-blue-500 border-blue-400 text-white" : "bg-slate-900 border-slate-700 text-slate-400"
                                    }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="flex-1 text-sm font-medium">
                                        {renderMathOrText(opt)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 2. MSQ Multiple Select */}
                {qType === "msq" && (
                    <div className="space-y-3">
                        <p className="text-xs text-blue-400 font-semibold mb-2">Select ALL correct options:</p>
                        {(question.options || []).map((opt, idx) => {
                            const selectedArray = Array.isArray(userAnswer) ? userAnswer : [];
                            const isSelected = selectedArray.includes(idx);

                            const toggleOption = () => {
                                if (readOnly) return;
                                const updated = isSelected
                                    ? selectedArray.filter(i => i !== idx)
                                    : [...selectedArray, idx];
                                onAnswerChange(updated);
                            };

                            return (
                                <button
                                    key={idx}
                                    disabled={readOnly}
                                    onClick={toggleOption}
                                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                                        isSelected
                                            ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/30"
                                            : "bg-slate-800/40 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                                    }`}
                                >
                                    {isSelected ? (
                                        <CheckSquare className="w-5 h-5 text-indigo-400 shrink-0" />
                                    ) : (
                                        <Square className="w-5 h-5 text-slate-500 shrink-0" />
                                    )}
                                    <span className="flex-1 text-sm font-medium">{renderMathOrText(opt)}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 3. Fill-in-the-Blanks */}
                {qType === "fill-blanks" && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400">Type your answer in the box below:</label>
                        <input
                            type="text"
                            disabled={readOnly}
                            value={userAnswer || ""}
                            onChange={(e) => onAnswerChange(e.target.value)}
                            placeholder="Enter answer..."
                            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:border-blue-500 focus:outline-none transition-all font-medium text-sm"
                        />
                    </div>
                )}

                {/* 4. Subjective Short Answer / Essay */}
                {qType === "subjective" && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="flex items-center gap-1 font-semibold text-slate-300">
                                <AlignLeft className="w-3.5 h-3.5 text-blue-400" />
                                Written Answer (AI Evaluated)
                            </span>
                            {question.rubric && (
                                <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                    Rubric Guided
                                </span>
                            )}
                        </div>
                        <textarea
                            disabled={readOnly}
                            rows={5}
                            value={userAnswer || ""}
                            onChange={(e) => onAnswerChange(e.target.value)}
                            placeholder="Write your answer clearly here..."
                            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:border-blue-500 focus:outline-none transition-all text-sm leading-relaxed"
                        />
                    </div>
                )}

                {/* 5. Coding Question */}
                {qType === "coding" && (
                    <div className="space-y-4">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                            <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                    <Code className="w-4 h-4 text-emerald-400" /> Solution Code (JavaScript / Python / C++)
                                </span>
                                {onExecuteCode && (
                                    <button
                                        onClick={onExecuteCode}
                                        disabled={isExecutingCode || readOnly}
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                                    >
                                        {isExecutingCode ? "Running..." : "▶ Run Code"}
                                    </button>
                                )}
                            </div>
                            <textarea
                                disabled={readOnly}
                                rows={8}
                                value={userAnswer || question.starterCode || "function solution() {\n  // write code here\n}"}
                                onChange={(e) => onAnswerChange(e.target.value)}
                                className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs focus:outline-none leading-relaxed"
                            />
                        </div>

                        {/* Test Cases Output */}
                        {codeOutput && (
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs">
                                <div className="text-slate-400 font-bold mb-1">Execution Output:</div>
                                <pre className="text-slate-200 whitespace-pre-wrap">{codeOutput}</pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
