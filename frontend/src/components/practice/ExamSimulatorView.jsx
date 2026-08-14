import React, { useState, useEffect } from 'react';
import { Award, Clock, CheckCircle, AlertCircle, ChevronRight, BarChart2, ShieldCheck, Flag } from 'lucide-react';

export default function ExamSimulatorView({ onFinishExam }) {
    const [examState, setExamState] = useState('selection'); // 'selection' | 'running' | 'report'
    const [timeLeft, setTimeLeft] = useState(3600); // 60 mins
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState({});

    const sampleExamQuestions = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        question: `Question ${i + 1}: What is the time complexity of operation ${i + 1} in a balanced Binary Search Tree?`,
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        correct: 1,
        subject: 'Data Structures'
    }));

    useEffect(() => {
        if (examState === 'running') {
            if (timeLeft <= 0) {
                setExamState('report');
                return;
            }
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [examState, timeLeft]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (optIdx) => {
        setAnswers(prev => ({ ...prev, [currentQIndex]: optIdx }));
    };

    const toggleFlag = (idx) => {
        setFlagged(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const handleSubmitExam = () => {
        if (window.confirm("Are you sure you want to submit your exam now?")) {
            setExamState('report');
        }
    };

    if (examState === 'selection') {
        return (
            <div className="p-8 max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-xl font-black text-slate-800">Exam Simulator & Mock Tests</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Practice under realistic exam conditions with full proctored timer & analytics.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Option 1: University Mock Exam */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                        <div>
                            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 font-extrabold text-[10px] rounded-md">
                                University Exam
                            </span>
                            <h3 className="text-base font-black text-slate-800 mt-2">End-Term CS Simulator</h3>
                            <p className="text-xs text-slate-500 mt-1">50 Questions • 60 Mins • Negative Marking -0.25</p>
                        </div>
                        <button 
                            onClick={() => { setTimeLeft(3600); setExamState('running'); }}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                        >
                            Start Exam
                        </button>
                    </div>

                    {/* Option 2: Placement Test */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                        <div>
                            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 font-extrabold text-[10px] rounded-md">
                                Placement Test
                            </span>
                            <h3 className="text-base font-black text-slate-800 mt-2">Tech Aptitude & Coding</h3>
                            <p className="text-xs text-slate-500 mt-1">30 Questions • 45 Mins • Mixed Difficulty</p>
                        </div>
                        <button 
                            onClick={() => { setTimeLeft(2700); setExamState('running'); }}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                        >
                            Start Exam
                        </button>
                    </div>

                    {/* Option 3: GATE Style Practice */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                        <div>
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 font-extrabold text-[10px] rounded-md">
                                GATE Prep
                            </span>
                            <h3 className="text-base font-black text-slate-800 mt-2">GATE CS Core Practice</h3>
                            <p className="text-xs text-slate-500 mt-1">65 Questions • 180 Mins • High Difficulty</p>
                        </div>
                        <button 
                            onClick={() => { setTimeLeft(10800); setExamState('running'); }}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                        >
                            Start Exam
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (examState === 'running') {
        const q = sampleExamQuestions[currentQIndex];

        return (
            <div className="p-8 max-w-6xl mx-auto space-y-6">
                {/* Top Control Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                            Exam Simulator
                        </span>
                        <span className="text-xs text-slate-400">|</span>
                        <span className="text-xs font-bold text-slate-700">Question {currentQIndex + 1} of {sampleExamQuestions.length}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-mono font-bold text-sm flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-rose-500" />
                            {formatTime(timeLeft)}
                        </div>
                        <button 
                            onClick={handleSubmitExam}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                        >
                            Submit Exam
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Box */}
                    <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-slate-900 leading-relaxed">{q.question}</p>
                            <button 
                                onClick={() => toggleFlag(currentQIndex)}
                                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                                    flagged[currentQIndex] ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}
                            >
                                <Flag className="w-3.5 h-3.5" />
                                {flagged[currentQIndex] ? 'Flagged' : 'Flag'}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {q.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className={`w-full p-4 rounded-2xl border text-left text-xs transition-all ${
                                        answers[currentQIndex] === idx
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between pt-4 border-t border-slate-100">
                            <button 
                                disabled={currentQIndex === 0}
                                onClick={() => setCurrentQIndex(prev => prev - 1)}
                                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button 
                                disabled={currentQIndex === sampleExamQuestions.length - 1}
                                onClick={() => setCurrentQIndex(prev => prev + 1)}
                                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl disabled:opacity-40"
                            >
                                Next Question
                            </button>
                        </div>
                    </div>

                    {/* Question Navigation Palette */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-slate-800">Question Palette</h4>
                        <div className="grid grid-cols-5 gap-2">
                            {sampleExamQuestions.map((_, idx) => {
                                const isAns = answers[idx] !== undefined;
                                const isFlg = flagged[idx];
                                const isCur = currentQIndex === idx;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQIndex(idx)}
                                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                                            isCur ? 'ring-2 ring-indigo-600 bg-indigo-600 text-white' :
                                            isAns ? 'bg-emerald-100 text-emerald-800' :
                                            isFlg ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Exam Report Summary Screen
    const totalAttempted = Object.keys(answers).length;
    let correctCount = 0;
    Object.keys(answers).forEach(k => {
        if (answers[k] === sampleExamQuestions[k].correct) correctCount++;
    });
    const percentage = Math.round((correctCount / sampleExamQuestions.length) * 100);

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                    🏆
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Exam Completed!</h2>
                    <p className="text-xs text-slate-500 mt-1">Here is your detailed performance report.</p>
                </div>

                <div className="grid grid-cols-4 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Score</p>
                        <p className="text-xl font-black text-slate-800">{percentage}%</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Attempted</p>
                        <p className="text-xl font-black text-slate-800">{totalAttempted} / {sampleExamQuestions.length}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Correct</p>
                        <p className="text-xl font-black text-emerald-600">{correctCount}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</p>
                        <p className="text-xl font-black text-indigo-600">
                            {totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0}%
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => setExamState('selection')}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                    Back to Exam Simulator
                </button>
            </div>
        </div>
    );
}
