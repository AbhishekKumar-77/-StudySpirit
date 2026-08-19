import React, { useState, useEffect } from "react";
import { Zap, Trophy, Timer, Flame, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function GamifiedQuizArena({
    quiz,
    user,
    socket,
    isHost = false,
    onExit = () => {}
}) {
    const [gameState, setGameState] = useState("lobby"); // 'lobby', 'question', 'reveal', 'ended'
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [speedBonus, setSpeedBonus] = useState(0);
    const [arenaLeaderboard, setArenaLeaderboard] = useState([]);
    const [answeredCount, setAnsweredCount] = useState(0);

    const questions = quiz?.questions || [];
    const currentQ = questions[currentQIndex];

    // Colors for Kahoot-style options
    const optionColors = [
        "bg-red-600 hover:bg-red-500 border-red-400 text-white",
        "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white",
        "bg-amber-600 hover:bg-amber-500 border-amber-400 text-white",
        "bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white"
    ];

    const optionIcons = ["▲", "◆", "●", "■"];

    // Socket Event Handlers
    useEffect(() => {
        if (!socket) return;

        const handleStarted = () => setGameState("question");
        const handleQuestion = (data) => {
            setCurrentQIndex(data.questionIndex || 0);
            setTimeLeft(data.timeLimit || 20);
            setSelectedOption(null);
            setGameState("question");
            setAnsweredCount(0);
        };
        const handleRevealed = (data) => {
            setGameState("reveal");
            if (data.leaderboard) setArenaLeaderboard(data.leaderboard);
        };
        const handleStudentAnswered = () => {
            setAnsweredCount(prev => prev + 1);
        };

        socket.on('quiz:arena:started', handleStarted);
        socket.on('quiz:arena:question', handleQuestion);
        socket.on('quiz:arena:revealed', handleRevealed);
        socket.on('quiz:arena:student:answered', handleStudentAnswered);

        return () => {
            socket.off('quiz:arena:started', handleStarted);
            socket.off('quiz:arena:question', handleQuestion);
            socket.off('quiz:arena:revealed', handleRevealed);
            socket.off('quiz:arena:student:answered', handleStudentAnswered);
        };
    }, [socket]);

    // Timer logic during question step
    useEffect(() => {
        if (gameState !== "question") return;
        if (timeLeft <= 0) {
            if (isHost) hostRevealAnswer();
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [gameState, timeLeft, isHost]);

    // Actions: Host controls
    const hostStartGame = () => {
        if (!socket) return;
        socket.emit('quiz:arena:start', { quizCode: quiz.code });
        hostSendQuestion(0);
    };

    const hostSendQuestion = (index) => {
        if (!socket) return;
        const qData = questions[index];
        socket.emit('quiz:arena:next-question', {
            quizCode: quiz.code,
            questionIndex: index,
            questionData: qData,
            timeLimit: 20
        });
    };

    const hostRevealAnswer = () => {
        if (!socket) return;
        socket.emit('quiz:arena:reveal', {
            quizCode: quiz.code,
            correctAnswer: currentQ?.correct
        });
    };

    const hostNextOrEnd = () => {
        if (currentQIndex + 1 < questions.length) {
            hostSendQuestion(currentQIndex + 1);
        } else {
            setGameState("ended");
        }
    };

    // Actions: Student answer submission
    const submitStudentAnswer = (optIndex) => {
        if (selectedOption !== null || gameState !== "question") return;
        setSelectedOption(optIndex);

        const isCorr = optIndex === currentQ?.correct;
        const bonus = isCorr ? Math.round(timeLeft * 25) : 0;
        const points = isCorr ? 1000 + bonus : 0;

        if (isCorr) {
            setScore(s => s + points);
            setStreak(st => st + 1);
            setSpeedBonus(bonus);
        } else {
            setStreak(0);
        }

        if (socket) {
            socket.emit('quiz:arena:answer', {
                quizCode: quiz.code,
                studentId: user?._id || user?.id || 'guest',
                studentName: user?.name || 'Student',
                answer: optIndex,
                isCorrect: isCorr,
                speedBonus: bonus
            });
        }
    };

    return (
        <div className="min-h-[500px] bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 rounded-3xl border border-purple-500/20 p-6 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
                <div className="flex items-center gap-2">
                    <span className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl font-bold text-xs flex items-center gap-1">
                        <Zap className="w-4 h-4" /> GAMIFIED ARENA
                    </span>
                    <h2 className="text-lg font-bold text-slate-100">{quiz?.title}</h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                        <Trophy className="w-4 h-4" /> {score} pts
                    </div>
                    {streak > 1 && (
                        <div className="flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20 animate-bounce">
                            <Flame className="w-4 h-4" /> {streak}x Streak!
                        </div>
                    )}
                    <button onClick={onExit} className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-xl">
                        Exit
                    </button>
                </div>
            </div>

            {/* State: LOBBY */}
            {gameState === "lobby" && (
                <div className="my-auto text-center space-y-6 py-12">
                    <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-3xl font-black border-2 border-amber-500/40 animate-pulse">
                        ⚡
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-100">Live Synchronous Arena</h3>
                        <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
                            {isHost ? "You are the Host! Click start when all students are ready." : "Waiting for teacher to start the live quiz..."}
                        </p>
                    </div>

                    {isHost && (
                        <button
                            onClick={hostStartGame}
                            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-2xl text-base shadow-xl shadow-amber-500/30 transition transform hover:scale-105"
                        >
                            🚀 START LIVE ARENA NOW
                        </button>
                    )}
                </div>
            )}

            {/* State: QUESTION ACTIVE */}
            {gameState === "question" && currentQ && (
                <div className="my-auto space-y-6">
                    {/* Timer & Progress */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Question {currentQIndex + 1} of {questions.length}</span>
                        <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-amber-400" />
                            <span className={`font-black text-lg ${timeLeft <= 5 ? 'text-rose-500 animate-ping' : 'text-amber-400'}`}>
                                {timeLeft}s
                            </span>
                        </div>
                    </div>

                    {/* Question Statement */}
                    <div className="bg-slate-900/80 border border-purple-500/20 rounded-2xl p-6 text-center">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-100">{currentQ.question}</h3>
                    </div>

                    {/* 4 Color Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(currentQ.options || []).map((opt, idx) => (
                            <button
                                key={idx}
                                disabled={selectedOption !== null}
                                onClick={() => submitStudentAnswer(idx)}
                                className={`p-5 rounded-2xl border-2 font-bold text-left text-base shadow-xl transition-all duration-200 flex items-center gap-4 ${
                                    optionColors[idx % optionColors.length]
                                } ${selectedOption === idx ? 'ring-4 ring-white scale-102' : ''} ${selectedOption !== null && selectedOption !== idx ? 'opacity-40' : ''}`}
                            >
                                <span className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center font-black text-sm">
                                    {optionIcons[idx % optionIcons.length]}
                                </span>
                                <span className="flex-1">{opt}</span>
                            </button>
                        ))}
                    </div>

                    {isHost && (
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xs text-slate-400">{answeredCount} students answered</span>
                            <button onClick={hostRevealAnswer} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold">
                                Reveal Answer Early
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* State: REVEAL */}
            {gameState === "reveal" && currentQ && (
                <div className="my-auto text-center space-y-6 py-6">
                    <div className="inline-block p-4 rounded-2xl bg-slate-900 border border-slate-800">
                        {selectedOption === currentQ.correct ? (
                            <div className="text-emerald-400 font-black text-xl flex items-center gap-2 justify-center">
                                <CheckCircle className="w-6 h-6" /> CORRECT! +{1000 + speedBonus} pts
                            </div>
                        ) : (
                            <div className="text-rose-400 font-black text-xl flex items-center gap-2 justify-center">
                                <XCircle className="w-6 h-6" /> INCORRECT!
                            </div>
                        )}
                    </div>

                    <div className="text-sm text-slate-300">
                        Correct Answer: <strong className="text-emerald-400">{currentQ.options?.[currentQ.correct]}</strong>
                    </div>

                    {isHost && (
                        <button
                            onClick={hostNextOrEnd}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-sm transition flex items-center gap-2 mx-auto"
                        >
                            Next Question <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* State: ENDED */}
            {gameState === "ended" && (
                <div className="my-auto text-center space-y-6 py-12">
                    <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto text-4xl border-2 border-amber-500/40">
                        🏆
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-100">Live Arena Finished!</h3>
                        <p className="text-sm text-slate-400 mt-1">Your Final Score: <strong className="text-amber-400">{score} Points</strong></p>
                    </div>

                    <button onClick={onExit} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-sm">
                        Return to Quizzes
                    </button>
                </div>
            )}
        </div>
    );
}
