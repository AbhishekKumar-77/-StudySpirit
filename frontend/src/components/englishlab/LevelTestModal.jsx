import React, { useState } from 'react';
import { Award, CheckCircle2, ArrowRight, X, Loader2, Sparkles } from 'lucide-react';
import englishLabApi from '../../services/englishLabApi';

const ASSESSMENT_QUESTIONS = [
    {
        id: 1,
        question: 'Choose the correct sentence:',
        options: [
            { text: 'I am working here since two years.', isCorrect: false },
            { text: 'I have been working here for two years.', isCorrect: true },
            { text: 'I work here since two years ago.', isCorrect: false },
            { text: 'I was work here for two years.', isCorrect: false }
        ]
    },
    {
        id: 2,
        question: 'Select the word closest in meaning to "Articulate":',
        options: [
            { text: 'Hesitant or confused', isCorrect: false },
            { text: 'Fluent and coherent in speech', isCorrect: true },
            { text: 'Quiet and shy', isCorrect: false },
            { text: 'Aggressive in discussion', isCorrect: false }
        ]
    },
    {
        id: 3,
        question: 'Which word completes the professional phrase: "We need to _____ on this project."',
        options: [
            { text: 'collaborate', isCorrect: true },
            { text: 'collision', isCorrect: false },
            { text: 'combustion', isCorrect: false },
            { text: 'collecting', isCorrect: false }
        ]
    },
    {
        id: 4,
        question: 'Choose the correct form: "If I _____ more time, I would have completed the report."',
        options: [
            { text: 'have had', isCorrect: false },
            { text: 'had had', isCorrect: true },
            { text: 'will have', isCorrect: false },
            { text: 'have', isCorrect: false }
        ]
    }
];

export default function LevelTestModal({ onClose, onComplete }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [resultLevel, setResultLevel] = useState(null);

    const currentQ = ASSESSMENT_QUESTIONS[currentIdx];

    const handleSelectOption = (option) => {
        const updated = [...selectedAnswers];
        updated[currentIdx] = option;
        setSelectedAnswers(updated);
    };

    const handleNext = async () => {
        if (currentIdx < ASSESSMENT_QUESTIONS.length - 1) {
            setCurrentIdx(prev => prev + 1);
        } else {
            // Submit test
            setSubmitting(true);
            try {
                const res = await englishLabApi.submitAssessment(selectedAnswers, 72);
                setResultLevel(res.cefrLevel || 'B1');
                if (onComplete) onComplete(res.profile);
            } catch (e) {
                console.error('Level test failed:', e);
            } finally {
                setSubmitting(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-5">
                {!resultLevel ? (
                    <>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    English CEFR Level Diagnostic Test
                                </h3>
                                <p className="text-xs text-slate-500">Question {currentIdx + 1} of {ASSESSMENT_QUESTIONS.length}</p>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="bg-purple-600 h-full transition-all duration-300"
                                style={{ width: `${((currentIdx + 1) / ASSESSMENT_QUESTIONS.length) * 100}%` }}
                            />
                        </div>

                        {/* Question */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-900 text-sm">{currentQ.question}</h4>
                            <div className="space-y-2">
                                {currentQ.options.map((opt, idx) => {
                                    const isSelected = selectedAnswers[currentIdx] === opt;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectOption(opt)}
                                            className={`w-full p-3 rounded-xl border text-xs font-semibold text-left transition-all ${isSelected
                                                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                                }`}
                                        >
                                            {opt.text}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleNext}
                                disabled={!selectedAnswers[currentIdx] || submitting}
                                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : currentIdx === ASSESSMENT_QUESTIONS.length - 1 ? 'Finish Assessment' : 'Next Question'}
                            </button>
                        </div>
                    </>
                ) : (
                    /* Result Screen */
                    <div className="text-center space-y-4 py-4">
                        <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto text-2xl font-black">
                            {resultLevel}
                        </div>
                        <h3 className="font-black text-slate-900 text-xl">Assessment Complete!</h3>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                            Your evaluated English level is <strong className="text-purple-700 font-bold">{resultLevel} Intermediate</strong>. Practice activities will now be tailored to your level.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 shadow-md shadow-purple-600/20"
                        >
                            Start Learning →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
