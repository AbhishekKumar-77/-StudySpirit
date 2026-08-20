import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, Flame, Clock, CheckCircle2, XCircle, ArrowRight, Award, Sparkles, RefreshCw, BarChart2, ShieldCheck, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GamifiedPlayer({ questions = [], sessionTitle = "Gamified Quiz", perQuestionTimer = 30, onFinish }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerLocked, setIsAnswerLocked] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(perQuestionTimer);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [questionResults, setQuestionResults] = useState([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [isQuizCompleted, setIsQuizCompleted] = useState(false);
    const [lastPointsEarned, setLastPointsEarned] = useState(0);
    const [lastSpeedBonus, setLastSpeedBonus] = useState(0);

    const timerRef = useRef(null);
    const currentQ = questions[currentIndex] || {};
    const questionTimeLimit = currentQ.timeLimit || perQuestionTimer || 30;

    // Simulated competition leaderboard data
    const mockCompetitors = [
        { name: 'Rahul S.', basePoints: 2400 },
        { name: 'Ananya P.', basePoints: 2150 },
        { name: 'Dev K.', basePoints: 1900 },
        { name: 'Sneha M.', basePoints: 1750 },
    ];

    // Reset state for new question
    useEffect(() => {
        if (isQuizCompleted) return;
        setSelectedOption(null);
        setIsAnswerLocked(false);
        setTimeRemaining(questionTimeLimit);
        setShowLeaderboard(false);

        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleTimeOut();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [currentIndex, isQuizCompleted]);

    const handleTimeOut = () => {
        if (isAnswerLocked) return;
        setIsAnswerLocked(true);
        setStreak(0);
        setLastPointsEarned(0);
        setLastSpeedBonus(0);

        setQuestionResults(prev => [...prev, {
            questionIndex: currentIndex,
            selected: null,
            correct: currentQ.correct,
            isCorrect: false,
            points: 0,
            timeTaken: questionTimeLimit
        }]);
    };

    const handleSelectOption = (optIdx) => {
        if (isAnswerLocked) return;
        clearInterval(timerRef.current);
        setSelectedOption(optIdx);
        setIsAnswerLocked(true);

        const timeTaken = questionTimeLimit - timeRemaining;
        const isCorrect = (optIdx === currentQ.correct || String(optIdx) === String(currentQ.correct));

        let earnedPoints = 0;
        let speedBonus = 0;

        if (isCorrect) {
            const newStreak = streak + 1;
            setStreak(newStreak);

            // Calculate Speed Bonus (up to 500 points for instant response)
            const speedRatio = Math.max(0, (questionTimeLimit - timeTaken) / questionTimeLimit);
            speedBonus = Math.round(500 * speedRatio);
            
            // Multiplier for streak
            const multiplier = newStreak >= 5 ? 2.0 : newStreak >= 3 ? 1.5 : 1.0;
            earnedPoints = Math.round((500 + speedBonus) * multiplier);

            setScore(prev => prev + earnedPoints);
            setLastPointsEarned(earnedPoints);
            setLastSpeedBonus(speedBonus);

            // Confetti animation
            confetti({
                particleCount: 60,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            setStreak(0);
            setLastPointsEarned(0);
            setLastSpeedBonus(0);
        }

        setQuestionResults(prev => [...prev, {
            questionIndex: currentIndex,
            selected: optIdx,
            correct: currentQ.correct,
            isCorrect,
            points: earnedPoints,
            timeTaken
        }]);
    };

    const handleNextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setShowLeaderboard(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsQuizCompleted(true);
        }
    };

    // Calculate leaderboard positions
    const getLeaderboard = () => {
        const list = mockCompetitors.map((c, idx) => ({
            ...c,
            score: c.basePoints + Math.round((currentIndex + 1) * 350 + (idx % 2 === 0 ? 100 : 0))
        }));
        list.push({ name: 'You (Student)', score: score, isUser: true });
        list.sort((a, b) => b.score - a.score);
        return list;
    };

    // Timer SVG Calculations
    const progressPercent = (timeRemaining / questionTimeLimit) * 100;
    const strokeDashoffset = 283 - (283 * progressPercent) / 100;
    const timerColor = timeRemaining > questionTimeLimit * 0.5 ? '#10b981' : timeRemaining > questionTimeLimit * 0.2 ? '#f59e0b' : '#ef4444';

    const optionColors = [
        { bg: 'bg-rose-500 hover:bg-rose-600', border: 'border-rose-600', text: 'text-white', badge: 'bg-rose-700' },
        { bg: 'bg-sky-500 hover:bg-sky-600', border: 'border-sky-600', text: 'text-white', badge: 'bg-sky-700' },
        { bg: 'bg-amber-500 hover:bg-amber-600', border: 'border-amber-600', text: 'text-white', badge: 'bg-amber-700' },
        { bg: 'bg-emerald-500 hover:bg-emerald-600', border: 'border-emerald-600', text: 'text-white', badge: 'bg-emerald-700' },
    ];

    // Quiz Completion Summary View
    if (isQuizCompleted) {
        const correctCount = questionResults.filter(r => r.isCorrect).length;
        const accuracy = Math.round((correctCount / questions.length) * 100);

        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
                <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-lg shadow-amber-500/20">
                        <Trophy className="w-10 h-10" />
                    </div>

                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Gamified Quiz Completed</span>
                        <h1 className="text-3xl font-black mt-1 text-white">{sessionTitle}</h1>
                    </div>

                    {/* Final Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Final Score</span>
                            <p className="text-2xl font-black text-amber-400 mt-0.5">{score} pts</p>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Accuracy</span>
                            <p className="text-2xl font-black text-emerald-400 mt-0.5">{accuracy}%</p>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Correct</span>
                            <p className="text-2xl font-black text-indigo-400 mt-0.5">{correctCount}/{questions.length}</p>
                        </div>
                    </div>

                    {/* Final Leaderboard Preview */}
                    <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-700 text-left space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Final Top Standings</span>
                        {getLeaderboard().slice(0, 3).map((item, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold ${item.isUser ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-slate-700 flex items-center justify-center text-[10px]">{idx + 1}</span>
                                    <span>{item.name}</span>
                                </div>
                                <span>{item.score} pts</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onFinish}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-2xl shadow-lg hover:brightness-110 transition-all text-base uppercase tracking-wider"
                    >
                        Return to Workspace
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
            {/* Background Aesthetic Glows */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* TOP BAR */}
            <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 px-6 py-4 rounded-3xl shadow-xl backdrop-blur-xl relative z-10">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-xl">
                        Q {currentIndex + 1} / {questions.length}
                    </span>
                    <h2 className="text-sm font-bold text-slate-300 hidden sm:block truncate max-w-xs">{sessionTitle}</h2>
                </div>

                <div className="flex items-center gap-4">
                    {/* Fire Streak Counter */}
                    {streak > 0 && (
                        <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3.5 py-1 rounded-xl text-xs font-black animate-bounce">
                            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>{streak}x Streak!</span>
                        </div>
                    )}

                    {/* Total Score Badge */}
                    <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1 rounded-xl text-xs font-black">
                        <Zap className="w-4 h-4 fill-emerald-400" />
                        <span>{score} PTS</span>
                    </div>
                </div>
            </div>

            {/* MAIN QUESTION & TIMER CONTAINER */}
            <div className="max-w-3xl mx-auto w-full my-auto space-y-6 relative z-10 py-4">
                {/* CIRCULAR TIMER */}
                <div className="flex justify-center mb-2">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-20 h-20 transform -rotate-90">
                            <circle cx="40" cy="40" r="35" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                            <circle
                                cx="40" cy="40" r="35"
                                stroke={timerColor}
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray="220"
                                strokeDashoffset={220 - (220 * progressPercent) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>
                        <span className="absolute text-xl font-black text-white">{timeRemaining}</span>
                    </div>
                </div>

                {/* QUESTION CARD */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center backdrop-blur-xl">
                    <p className="text-xl sm:text-2xl font-black text-white leading-relaxed">
                        {currentQ.question}
                    </p>
                </div>

                {/* OPTIONS GRID (Mentimeter / Kahoot Style 4 Color Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(currentQ.options || []).map((opt, oIdx) => {
                        const style = optionColors[oIdx % optionColors.length];
                        const isChosen = selectedOption === oIdx;
                        const isCorrect = (oIdx === currentQ.correct || String(oIdx) === String(currentQ.correct));

                        let cardClass = `${style.bg} ${style.border} ${style.text}`;

                        if (isAnswerLocked) {
                            if (isCorrect) {
                                cardClass = 'bg-emerald-600 border-emerald-400 text-white ring-4 ring-emerald-400/50 scale-[1.02]';
                            } else if (isChosen) {
                                cardClass = 'bg-rose-600 border-rose-400 text-white opacity-80';
                            } else {
                                cardClass = 'bg-slate-900 border-slate-800 text-slate-500 opacity-40';
                            }
                        }

                        return (
                            <button
                                key={oIdx}
                                disabled={isAnswerLocked}
                                onClick={() => handleSelectOption(oIdx)}
                                className={`p-5 rounded-2xl border-2 font-bold text-left text-base sm:text-lg transition-all duration-200 flex items-center gap-3 shadow-lg ${cardClass} ${!isAnswerLocked ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}`}
                            >
                                <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${style.badge}`}>
                                    {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="flex-1">{opt}</span>
                                {isAnswerLocked && isCorrect && <CheckCircle2 className="w-6 h-6 text-white shrink-0" />}
                                {isAnswerLocked && isChosen && !isCorrect && <XCircle className="w-6 h-6 text-white shrink-0" />}
                            </button>
                        );
                    })}
                </div>

                {/* POST-ANSWER FEEDBACK & POINTS BANNER */}
                {isAnswerLocked && (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-in slide-in-from-bottom">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                {selectedOption !== null && (selectedOption === currentQ.correct || String(selectedOption) === String(currentQ.correct)) ? (
                                    <div className="flex items-center gap-2 text-emerald-400 font-black text-lg">
                                        <CheckCircle2 className="w-6 h-6" /> Correct! +{lastPointsEarned} pts
                                        {lastSpeedBonus > 0 && <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">⚡ Speed Bonus: +{lastSpeedBonus}</span>}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-rose-400 font-black text-lg">
                                        <XCircle className="w-6 h-6" /> Incorrect! (0 pts)
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowLeaderboard(true)}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                            >
                                View Leaderboard <BarChart2 className="w-4 h-4" />
                            </button>
                        </div>

                        {currentQ.explanation && (
                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                                <strong className="text-amber-400">💡 Explanation: </strong>{currentQ.explanation}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* BETWEEN-QUESTION ANIMATED LEADERBOARD MODAL (Mentimeter Style) */}
            {showLeaderboard && (
                <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
                    <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-amber-400" />
                                <h3 className="text-lg font-black text-white">Live Leaderboard</h3>
                            </div>
                            <span className="text-xs font-bold text-slate-400">After Q{currentIndex + 1}</span>
                        </div>

                        <div className="space-y-2">
                            {getLeaderboard().map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                                        item.isUser
                                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-400 text-white font-black shadow-lg scale-[1.02]'
                                            : 'bg-slate-950/80 border-slate-800 text-slate-300 font-bold'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                                            idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                            {idx + 1}
                                        </span>
                                        <span className="text-sm">{item.name}</span>
                                    </div>
                                    <span className="text-sm">{item.score} pts</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleNextQuestion}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black rounded-2xl shadow-lg transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                            {currentIndex < questions.length - 1 ? 'Next Question' : 'View Final Results'} <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
