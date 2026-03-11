import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { connectSocket, getSocket } from "../services/groupAPI";
import {
    ArrowLeft, FileCheck, ClipboardCheck, Code, Clock, Users, Trophy,
    ChevronRight, Calendar, Shield, Star, Zap, BookOpen, BarChart3,
    Lock, Unlock, Timer, Brain, CheckCircle, Award, Target, PlayCircle,
    AlertCircle, XCircle, Send, Play, Check, X
} from "lucide-react";
import { useApp } from "../context/AppContext";
import Editor from "@monaco-editor/react";

export default function Exams() {
    const navigate = useNavigate();
    const { user } = useApp();

    // Join State
    const [quizCodeInput, setQuizCodeInput] = useState("");
    const [regNoInput, setRegNoInput] = useState("");

    // Exam State (from Quiz student mode)
    const [joinedQuiz, setJoinedQuiz] = useState(null);
    const [examStarted, setExamStarted] = useState(false);
    const [examSubmitted, setExamSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [tabChangeDetected, setTabChangeDetected] = useState(false);
    const [warnings, setWarnings] = useState(0);
    const [fullscreenActive, setFullscreenActive] = useState(false);
    const [isReviewingAnswers, setIsReviewingAnswers] = useState(false);
    const [isTabHidden, setIsTabHidden] = useState(false);
    const fullscreenRef = useRef(null);

    // Coding Exam State
    const [codeLanguage, setCodeLanguage] = useState("javascript");
    const [codeTestResults, setCodeTestResults] = useState({});
    const [isRunningCode, setIsRunningCode] = useState(false);

    // ---------- TIMER ----------
    useEffect(() => {
        if (examStarted && !examSubmitted) {
            if (timeLeft <= 0) {
                submitExam();
                return;
            }
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [examStarted, timeLeft, examSubmitted]);

    // ---------- SECURE MODE ----------
    useEffect(() => {
        const isSecure = joinedQuiz?.settings?.secureMode;

        if (isSecure && examStarted && !showResult) {
            const enterFullscreen = async () => {
                try {
                    if (document.documentElement.requestFullscreen) {
                        await document.documentElement.requestFullscreen();
                    } else if (document.documentElement.webkitRequestFullscreen) {
                        await document.documentElement.webkitRequestFullscreen();
                    }
                    setFullscreenActive(true);
                } catch (err) {
                    console.error("Fullscreen err:", err);
                    alert("Secure Mode: Fullscreen required.");
                }
            };
            if (!document.fullscreenElement) enterFullscreen();

            const handleVisibilityChange = () => {
                const hidden = document.hidden;
                setIsTabHidden(hidden);
                if (hidden) {
                    setTabChangeDetected(true);
                    setWarnings(prev => {
                        const newCount = prev + 1;
                        if (newCount >= 3) {
                            alert("Violation Limit Reached! Exam is auto-submitting...");
                            submitExam();
                        } else {
                            alert("WARNING: Tab switching is strictly prohibited! Return to the exam immediately.");
                        }
                        return newCount;
                    });
                }
            };

            const handleContextMenu = (e) => e.preventDefault();
            const handleCopyPaste = (e) => e.preventDefault();
            const handleKeyDown = (e) => {
                if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                    (e.ctrlKey && e.key === 'c') || (e.ctrlKey && e.key === 'v') ||
                    e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && e.key === 's')) {
                    e.preventDefault();
                    alert("WARNING: Keyboard shortcuts / Screenshots are disabled during the exam!");
                }
            };

            const handleFullscreenChange = () => {
                const isFullscreen = !!document.fullscreenElement;
                setFullscreenActive(isFullscreen);
                if (!isFullscreen && !examSubmitted) {
                    setWarnings(prev => {
                        const newCount = prev + 1;
                        if (newCount >= 2) {
                            alert("Violation Limit Reached (Fullscreen Exited)! Exam is auto-submitting...");
                            submitExam();
                        } else {
                            alert("WARNING: You must stay in fullscreen! Next violation will submit your exam.");
                        }
                        return newCount;
                    });
                }
            };

            document.addEventListener("visibilitychange", handleVisibilityChange);
            document.addEventListener("fullscreenchange", handleFullscreenChange);
            document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.addEventListener("contextmenu", handleContextMenu);
            document.addEventListener("copy", handleCopyPaste);
            document.addEventListener("paste", handleCopyPaste);
            document.addEventListener("keydown", handleKeyDown);

            return () => {
                document.removeEventListener("visibilitychange", handleVisibilityChange);
                document.removeEventListener("fullscreenchange", handleFullscreenChange);
                document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
                document.removeEventListener("contextmenu", handleContextMenu);
                document.removeEventListener("copy", handleCopyPaste);
                document.removeEventListener("paste", handleCopyPaste);
                document.removeEventListener("keydown", handleKeyDown);
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => { });
                }
            };
        }
    }, [examStarted, joinedQuiz, examSubmitted, showResult]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // ---------- RUN CODE ----------
    const runCodeForQuestion = async () => {
        const currentQ = joinedQuiz.questions[currentQuestionIndex];
        if (!currentQ || currentQ.type !== "coding") return;

        const code = userAnswers[currentQ.id] || "";
        if (!code.trim()) return alert("Please write some code before running!");

        setIsRunningCode(true);
        const results = [];
        // Support testCases or default to an empty run
        const tcs = currentQ.testCases && currentQ.testCases.length > 0 ? currentQ.testCases : [{ input: "", expectedOutput: "" }];

        for (let i = 0; i < tcs.length; i++) {
            const tc = tcs[i];
            try {
                const executeRes = await fetch(`${API_BASE}/codespirit/execute`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ language: codeLanguage, code: code, stdin: tc.input })
                });
                const result = await executeRes.json();
                const out = (result.run?.stdout || "").trim();
                const passed = tc.expectedOutput ? (out === (tc.expectedOutput || "").trim() && result.success && result.run?.code === 0) : true;
                results.push({
                    pass: passed,
                    actual: out,
                    expected: tc.expectedOutput || "N/A",
                    input: tc.input || "None",
                    error: result.run?.stderr || ""
                });
            } catch (e) {
                results.push({ pass: false, error: e.message });
            }
        }
        setCodeTestResults(prev => ({ ...prev, [currentQ.id]: results }));
        setIsRunningCode(false);
    };

    // ---------- JOIN QUIZ ----------
    const joinQuiz = async () => {
        if (!quizCodeInput || !regNoInput) {
            alert("Please enter both the Exam Code and your Registration Number!");
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/quiz/${quizCodeInput.trim().toUpperCase()}`);
            const data = await res.json();
            if (data.success) {
                setJoinedQuiz({
                    questions: data.quiz.settings?.randomizeQuestions ? [...data.quiz.questions].sort(() => Math.random() - 0.5) : data.quiz.questions,
                    settings: data.quiz.settings,
                    title: data.quiz.title
                });
                setExamSubmitted(false);
                setUserAnswers({});
                setCurrentQuestionIndex(0);
                setShowResult(false);
                setIsReviewingAnswers(false);
                setWarnings(0);

                try {
                    const socket = connectSocket();
                    const doJoin = () => socket.emit('quiz:join', {
                        quizCode: quizCodeInput.toUpperCase().trim(),
                        studentId: user?._id || user?.id || 'guest',
                        studentName: user?.name || 'Student',
                        registrationNumber: regNoInput.trim()
                    });
                    if (socket.connected) doJoin(); else socket.once('connect', doJoin);
                } catch (_e) { console.error("Socket join error:", _e); }
            } else {
                alert(data.message || "Invalid Exam Code!");
                setJoinedQuiz(null);
            }
        } catch (err) {
            console.error("Join Quiz Error:", err);
            alert("Failed to connect to exam server.");
        }
    };

    // ---------- START EXAM ----------
    const startExam = () => {
        if (!joinedQuiz || joinedQuiz.questions.length === 0) {
            alert("No exam joined or no questions available!");
            return;
        }
        setTimeLeft(joinedQuiz.settings.timeLimit * 60);
        setExamStarted(true);
        setExamSubmitted(false);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setShowResult(false);

        try {
            const socket = connectSocket();
            const doJoin = () => socket.emit('quiz:join', {
                quizCode: quizCodeInput.toUpperCase().trim(),
                studentId: user?._id || user?.id || 'guest',
                studentName: user?.name || 'Student',
                registrationNumber: regNoInput.trim()
            });
            if (socket.connected) doJoin(); else socket.once('connect', doJoin);
        } catch (e) { console.error('Socket join error', e); }
    };

    // ---------- SUBMIT EXAM ----------
    const submitExam = async () => {
        if (!joinedQuiz) return;
        let correctCount = 0;
        let totalScore = 0;
        const quizQs = joinedQuiz.questions;

        quizQs.forEach(q => {
            if (q.type === "coding") {
                if (userAnswers[(q._id || q.id)] && userAnswers[(q._id || q.id)].trim() !== "") {
                    correctCount++;
                    totalScore += 1;
                }
            } else {
                if (userAnswers[(q._id || q.id)] === q.correct) {
                    correctCount++;
                    totalScore += 1;
                } else if (userAnswers[(q._id || q.id)] !== undefined) {
                    totalScore -= joinedQuiz.settings.negativeMarking;
                }
            }
        });

        const finalScore = Math.max(0, (totalScore / quizQs.length) * 100);
        setScore(Math.round(finalScore));
        setExamSubmitted(true);
        setExamStarted(false);
        setShowResult(true);

        try {
            await fetch(`${API_BASE}/quiz/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    quizCode: quizCodeInput.toUpperCase().trim(),
                    score: Number(totalScore.toFixed(2)),
                    percentage: Math.round(finalScore),
                    totalQuestions: quizQs.length,
                    timeTaken: joinedQuiz.settings.timeLimit * 60 - timeLeft,
                    registrationNumber: regNoInput.trim(),
                    studentName: user?.name || "Guest",
                    userAnswers: userAnswers
                })
            });
            try {
                const socket = getSocket();
                if (socket) {
                    const taken = (joinedQuiz.settings.timeLimit * 60) - timeLeft;
                    socket.emit('quiz:submitted', {
                        quizCode: quizCodeInput.toUpperCase().trim(),
                        studentId: user?._id || user?.id || 'guest',
                        studentName: user?.name || 'Student',
                        registrationNumber: regNoInput.trim(),
                        score: Math.round(finalScore),
                        correctAnswers: correctCount,
                        timeTaken: taken,
                        totalQuestions: quizQs.length
                    });
                    socket.emit('quiz:leave', {
                        quizCode: quizCodeInput.toUpperCase().trim(),
                        studentId: user?._id || user?.id || 'guest'
                    });
                }
            } catch (se) { console.error('Socket submit error', se); }
        } catch (e) {
            console.error("Submit error", e);
        }
    };

    const resetExam = () => {
        setShowResult(false);
        setJoinedQuiz(null);
        setQuizCodeInput("");
        setRegNoInput("");
        setIsReviewingAnswers(false);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setWarnings(0);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans" ref={fullscreenRef}>
            {/* ===== EXAM IN PROGRESS (full screen takeover) ===== */}
            {examStarted && joinedQuiz && joinedQuiz.questions[currentQuestionIndex] && (
                <div className="fixed inset-0 z-[200] bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-6 overflow-y-auto">
                    <div className="w-full max-w-5xl relative animate-fade-in">
                        {/* Warnings */}
                        {warnings > 0 && !isTabHidden && (
                            <div className="absolute -top-24 left-0 w-full p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 flex items-center gap-3 backdrop-blur-md animate-bounce">
                                <AlertCircle size={32} className="text-red-500" />
                                <div>
                                    <h4 className="font-bold text-lg">Security Warning ({warnings}/3)</h4>
                                    <p className="text-sm opacity-80">Do not switch tabs or exit fullscreen.</p>
                                </div>
                            </div>
                        )}

                        {/* Tab switch blocker */}
                        {isTabHidden && (
                            <div className="fixed inset-0 z-[999] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-3xl">
                                <AlertCircle size={100} className="text-red-500 mb-6 animate-pulse" />
                                <h1 className="text-5xl font-black text-red-500 mb-4 text-center">EXAM PAUSED</h1>
                                <p className="text-2xl text-white text-center mb-8 max-w-2xl">
                                    You have navigated away from the exam window. This has been recorded.
                                </p>
                            </div>
                        )}

                        {/* Exam Header */}
                        <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-6 border border-[var(--border-color)] shadow-2xl mb-8 flex justify-between items-center">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                                    <Brain size={32} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight select-none">{joinedQuiz.title || "Proctored Exam"}</h1>
                                    <div className="flex items-center gap-3 text-[var(--text-secondary)] font-medium text-sm mt-1">
                                        <span className="px-2 py-0.5 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] uppercase text-xs tracking-wider">{joinedQuiz.settings.difficulty}</span>
                                        <span>•</span>
                                        <span>{currentQuestionIndex + 1} / {joinedQuiz.questions.length} Questions</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-3 px-6 py-3 rounded-xl bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] shadow-inner backdrop-blur-md ${timeLeft < 300 ? "text-red-500 animate-pulse border-red-500/30" : "text-emerald-400 border-emerald-500/20"}`}>
                                <Timer size={28} />
                                <span className="text-3xl font-mono font-black tracking-widest">{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-10 border border-[var(--border-color)] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"></div>

                            <h3 className="text-3xl font-bold mb-10 leading-relaxed tracking-wide select-none">
                                {joinedQuiz.questions[currentQuestionIndex].question}
                            </h3>

                            <div className="grid gap-4">
                                {joinedQuiz.questions[currentQuestionIndex].type === "coding" ? (
                                    <div className="w-full text-left">
                                        <div className="mb-4 flex items-center gap-4 flex-wrap">
                                            <div className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 py-2 rounded-xl text-sm font-bold w-full md:w-auto">
                                                <Code size={18} className="text-cyan-400" /> 
                                                <span className="text-[var(--text-secondary)]">Language:</span>
                                                <select value={codeLanguage} onChange={e => setCodeLanguage(e.target.value)} className="bg-transparent text-[var(--text-primary)] outline-none cursor-pointer">
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="cpp">C++</option>
                                                    <option value="java">Java</option>
                                                </select>
                                            </div>
                                            <button onClick={runCodeForQuestion} disabled={isRunningCode} className="px-6 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 text-sm rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 ml-auto">
                                                <Play size={16} /> {isRunningCode ? "Running Tests..." : "Run Test Cases"}
                                            </button>
                                        </div>

                                        <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden mb-6 bg-[#0d1117] shadow-inner relative group">
                                            <div className="absolute top-0 right-0 p-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button
                                                    onClick={() => {
                                                        const newAnswers = { ...userAnswers, [(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)]: joinedQuiz.questions[currentQuestionIndex].starterCode || '' };
                                                        setUserAnswers(newAnswers);
                                                    }}
                                                    className="px-3 py-1.5 bg-[var(--bg-secondary)]/80 backdrop-blur-md text-[var(--text-secondary)] hover:text-cyan-400 border border-[var(--border-color)] text-xs rounded-lg font-bold transition-colors"
                                                    title="Reset to Starter Code"
                                                >
                                                    Reset Code
                                                </button>
                                            </div>
                                            <Editor
                                                height="450px"
                                                language={codeLanguage}
                                                theme="vs-dark"
                                                value={userAnswers[(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)] ?? joinedQuiz.questions[currentQuestionIndex].starterCode ?? ''}
                                                onChange={(val) => {
                                                    const newAnswers = { ...userAnswers, [(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)]: val };
                                                    setUserAnswers(newAnswers);
                                                }}
                                                options={{ 
                                                    fontSize: 15, 
                                                    minimap: { enabled: false },
                                                    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                                                    lineHeight: 1.6,
                                                    padding: { top: 20 },
                                                    scrollBeyondLastLine: false,
                                                    smoothScrolling: true,
                                                    cursorBlinking: "smooth",
                                                }}
                                            />
                                        </div>

                                        {/* Test Cases display *always* visible if they exist */}
                                        {joinedQuiz.questions[currentQuestionIndex].testCases && joinedQuiz.questions[currentQuestionIndex].testCases.length > 0 && (
                                            <div className="bg-[#0a0a0a] rounded-2xl border border-[var(--border-color)] p-6 mt-6 shadow-lg relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600"></div>
                                                <h3 className="text-white font-black mb-5 flex items-center justify-between">
                                                    <span className="flex items-center gap-3"><Target size={22} className="text-cyan-400" /> Test Cases</span>
                                                    {codeTestResults[(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)] && (
                                                        <div className="flex gap-2">
                                                            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                                                                {codeTestResults[(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)].filter(r => r.pass).length} Passed
                                                            </span>
                                                            <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
                                                                {codeTestResults[(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)].filter(r => !r.pass).length} Failed
                                                            </span>
                                                        </div>
                                                    )}
                                                </h3>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {joinedQuiz.questions[currentQuestionIndex].testCases.map((tc, i) => {
                                                        const result = codeTestResults[(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)]?.[i];
                                                        
                                                        // Determine card border based on execution state
                                                        let borderClass = "border-[var(--border-color)]";
                                                        let bgClass = "bg-[#111]";
                                                        let headerColor = "text-[var(--text-secondary)]";
                                                        let icon = null;

                                                        if (result) {
                                                            if (result.pass) {
                                                                borderClass = "border-emerald-500/40";
                                                                bgClass = "bg-emerald-500/5";
                                                                headerColor = "text-emerald-400";
                                                                icon = <CheckCircle size={18} className="text-emerald-500" />;
                                                            } else {
                                                                borderClass = "border-red-500/40";
                                                                bgClass = "bg-red-500/5";
                                                                headerColor = "text-red-400";
                                                                icon = <XCircle size={18} className="text-red-500" />;
                                                            }
                                                        }

                                                        return (
                                                            <div key={i} className={`p-5 rounded-xl border ${borderClass} ${bgClass} transition-all duration-300`}>
                                                                <div className={`flex items-center justify-between mb-4 font-black ${headerColor}`}>
                                                                    <div className="flex items-center gap-2">
                                                                        {icon} Test Case {i + 1}
                                                                    </div>
                                                                    {!result && <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/40">Pending</span>}
                                                                </div>

                                                                <div className="space-y-3 font-mono text-sm">
                                                                    <div>
                                                                        <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider block mb-1">Input:</span>
                                                                        <div className="bg-black/50 border border-white/5 p-3 rounded-lg text-white/80 break-all">{tc.input || "No input"}</div>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider block mb-1">Expected Output:</span>
                                                                        <div className="bg-black/50 border border-white/5 p-3 rounded-lg text-white/80 break-all">{tc.expectedOutput || "None"}</div>
                                                                    </div>

                                                                    {result && (
                                                                        <div className="pt-3 border-t border-white/5 mt-3 animate-fade-in">
                                                                            <span className={`text-xs uppercase tracking-wider block mb-1 font-bold ${result.pass ? 'text-emerald-500/70' : 'text-red-500/70'}`}>Your Output:</span>
                                                                            <div className={`bg-black/50 border p-3 rounded-lg break-all ${result.pass ? 'border-emerald-500/20 text-emerald-100' : 'border-red-500/20 text-red-100'}`}>
                                                                                {result.actual || "No output generated"}
                                                                            </div>
                                                                            {result.error && (
                                                                                <div className="mt-2 bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-300 text-xs overflow-x-auto whitespace-pre-wrap">
                                                                                    <span className="font-bold flex items-center gap-1 mb-1"><AlertCircle size={12}/> Error:</span>
                                                                                    {result.error}
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
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {joinedQuiz.questions[currentQuestionIndex].options.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    const newAnswers = { ...userAnswers, [(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)]: i };
                                                    setUserAnswers(newAnswers);
                                                    try {
                                                        const socket = getSocket();
                                                        if (socket?.connected) {
                                                            let correctCount = 0;
                                                            joinedQuiz.questions.forEach(q => { if (newAnswers[(q._id || q.id)] === q.correct) correctCount++; });
                                                            socket.emit('quiz:progress', {
                                                                quizCode: quizCodeInput.toUpperCase().trim(),
                                                                studentId: user?._id || user?.id || 'guest',
                                                                correctAnswers: correctCount,
                                                                totalQuestions: joinedQuiz.questions.length
                                                            });
                                                        }
                                                    } catch (e) { }
                                                }}
                                                className={`w-full p-6 text-left rounded-2xl text-xl font-medium transition-all duration-200 border-2 relative group ${userAnswers[(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)] === i
                                                    ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500 text-[var(--text-primary)] shadow-lg transform scale-[1.01]"
                                                    : "bg-[var(--glass-bg)] border-transparent hover:bg-[var(--bg-secondary)] hover:border-red-500/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                                    }`}
                                            >
                                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-black mr-4 text-lg transition-colors ${userAnswers[(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)] === i
                                                    ? "bg-red-500 text-white"
                                                    : "bg-[var(--bg-secondary)] text-[var(--text-muted)] group-hover:bg-[var(--border-color)]"
                                                    }`}>
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                {opt}
                                                {userAnswers[(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)] === i && (
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-red-400">
                                                        <CheckCircle size={28} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="flex justify-between mt-12 pt-8 border-t border-[var(--border-color)]">
                                <button
                                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                    disabled={currentQuestionIndex === 0}
                                    className="px-8 py-4 bg-[var(--glass-bg)] font-bold rounded-xl hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    <ArrowLeft size={20} /> Previous
                                </button>

                                {currentQuestionIndex < joinedQuiz.questions.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                        className="px-10 py-4 bg-gradient-to-br from-red-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        Next Question <ChevronRight size={20} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={submitExam}
                                        className="px-12 py-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        <Send size={20} /> Submit Exam
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== NORMAL PAGE (not in exam) ===== */}
            {!examStarted && (
                <>
                    {/* Navbar */}
                    <nav className="border-b border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="text-xl font-bold flex items-center gap-2">
                                <FileCheck className="text-red-500" />
                                Exams <span className="opacity-50 font-normal hidden sm:inline">| Assessment Center</span>
                            </div>
                        </div>
                    </nav>

                    <div className="max-w-5xl mx-auto p-6 animate-fade-in">

                        {/* ===== JOIN SCREEN (no quiz joined) ===== */}
                        {!joinedQuiz && !showResult && (
                            <>
                                {/* Hero */}
                                <div className="mb-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-8">
                                    <div className="flex items-center gap-5 flex-wrap">
                                        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center">
                                            <FileCheck className="text-red-500" size={32} />
                                        </div>
                                        <div className="flex-1 min-w-[250px]">
                                            <h1 className="text-3xl font-black mb-2">Exam Center</h1>
                                            <p className="text-[var(--text-secondary)]">Enter the exam code from your teacher to join a quiz or coding exam. Proctored, timed, and auto-graded.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Join Exam Card */}
                                <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-10 text-center max-w-2xl mx-auto mb-8">
                                    <Users size={70} className="text-red-400 mx-auto mb-5" />
                                    <h2 className="text-3xl font-black mb-2">Join an Exam</h2>
                                    <p className="text-[var(--text-secondary)] mb-8">Enter the exam code provided by your teacher to begin.</p>

                                    <div className="flex flex-col gap-4 max-w-md mx-auto">
                                        <input
                                            type="text"
                                            value={quizCodeInput}
                                            onChange={(e) => setQuizCodeInput(e.target.value)}
                                            placeholder="ENTER EXAM CODE (E.G. SP1234)"
                                            className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-lg font-bold text-center focus:border-red-500 outline-none uppercase tracking-widest"
                                        />
                                        <input
                                            type="text"
                                            value={regNoInput}
                                            onChange={(e) => setRegNoInput(e.target.value)}
                                            placeholder="REGISTRATION NUMBER (E.G. 122XXXXX)"
                                            className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-lg font-bold text-center focus:border-red-500 outline-none uppercase tracking-widest"
                                        />
                                    </div>

                                    <button
                                        onClick={joinQuiz}
                                        className="mt-6 px-12 py-4 bg-gradient-to-br from-red-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto text-lg"
                                    >
                                        <ChevronRight size={24} /> Join Exam
                                    </button>
                                </div>

                                {/* Info Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-5">
                                        <Clock size={20} className="text-amber-500 mb-3" />
                                        <h4 className="font-bold text-sm mb-1">Timed Exams</h4>
                                        <p className="text-xs text-[var(--text-muted)]">Timer starts when you begin. Auto-submits when time runs out.</p>
                                    </div>
                                    <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-5">
                                        <Shield size={20} className="text-red-500 mb-3" />
                                        <h4 className="font-bold text-sm mb-1">Proctored</h4>
                                        <p className="text-xs text-[var(--text-muted)]">Tab-switch detection, fullscreen mode, and copy-paste restrictions.</p>
                                    </div>
                                    <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-5">
                                        <BarChart3 size={20} className="text-emerald-500 mb-3" />
                                        <h4 className="font-bold text-sm mb-1">Instant Results</h4>
                                        <p className="text-xs text-[var(--text-muted)]">Auto-graded with score, rank, and question-wise breakdown.</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ===== PRE-EXAM SCREEN (quiz joined, not started) ===== */}
                        {joinedQuiz && !examStarted && !showResult && (
                            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-16 border border-[var(--border-color)] shadow-xl text-center max-w-3xl mx-auto mt-6">
                                <Trophy size={80} className="text-amber-500 mx-auto mb-6 animate-pulse" />
                                <h2 className="text-4xl font-black mb-4">Ready to Start?</h2>
                                <p className="text-lg text-[var(--text-secondary)] mb-2">{joinedQuiz.title || "Exam"}</p>
                                <div className="flex flex-wrap justify-center gap-4 mb-8 text-lg font-medium text-[var(--text-secondary)]">
                                    <span className="px-4 py-2 bg-[var(--glass-bg)] rounded-lg border border-[var(--border-color)]">
                                        {joinedQuiz.questions.length} Questions
                                    </span>
                                    <span className="px-4 py-2 bg-[var(--glass-bg)] rounded-lg border border-[var(--border-color)]">
                                        {joinedQuiz.settings.timeLimit} Minutes
                                    </span>
                                    {joinedQuiz.settings.negativeMarking > 0 && (
                                        <span className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
                                            -{joinedQuiz.settings.negativeMarking} Neg. Marking
                                        </span>
                                    )}
                                </div>

                                {joinedQuiz.settings.secureMode && (
                                    <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 flex items-center justify-center gap-3">
                                        <AlertCircle size={24} />
                                        <span className="font-bold">Secure Mode Enabled: Fullscreen is required.</span>
                                    </div>
                                )}

                                <button
                                    onClick={startExam}
                                    className="px-12 py-5 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto text-xl"
                                >
                                    <PlayCircle size={32} /> Start Exam Now
                                </button>
                            </div>
                        )}

                        {/* ===== RESULTS ===== */}
                        {showResult && joinedQuiz && joinedQuiz.settings.showResults && !isReviewingAnswers && (
                            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-16 border border-[var(--border-color)] shadow-xl text-center max-w-2xl mx-auto mt-6 animate-fade-in">
                                <Award size={120} className="text-amber-500 mx-auto mb-6 animate-bounce" />
                                <h2 className="text-6xl font-black text-emerald-400 mb-4">{score}%</h2>
                                <p className="text-2xl font-bold mb-2">Excellent Work!</p>
                                <p className="text-xl text-[var(--text-secondary)] mb-8">
                                    You answered <span className="font-bold text-[var(--text-primary)]">{Object.values(userAnswers).filter((a, idx) => a === joinedQuiz.questions[idx]?.correct).length}</span> out of {joinedQuiz.questions.length} correctly.
                                </p>
                                <div className="flex gap-4 justify-center flex-wrap">
                                    {joinedQuiz.settings.allowReview && (
                                        <button onClick={() => setIsReviewingAnswers(true)}
                                            className="px-8 py-4 bg-gradient-to-br from-red-500 to-orange-600 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105">
                                            Review Answers
                                        </button>
                                    )}
                                    <button onClick={resetExam}
                                        className="px-8 py-4 bg-[var(--border-color)] font-bold rounded-xl hover:bg-[var(--bg-secondary)] transition-all hover:scale-105">
                                        Take Another Exam
                                    </button>
                                </div>
                            </div>
                        )}

                        {showResult && joinedQuiz && !joinedQuiz.settings.showResults && !isReviewingAnswers && (
                            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-16 border border-[var(--border-color)] shadow-xl text-center max-w-2xl mx-auto mt-6 animate-fade-in">
                                <CheckCircle size={120} className="text-emerald-500 mx-auto mb-6 animate-bounce" />
                                <h2 className="text-4xl font-black mb-4">Exam Submitted Successfully!</h2>
                                <p className="text-xl text-[var(--text-secondary)] mb-8">
                                    Your teacher has disabled instant results. Your responses have been recorded and saved.
                                </p>
                                <button onClick={resetExam}
                                    className="px-8 py-4 bg-[var(--border-color)] font-bold rounded-xl hover:bg-[var(--bg-secondary)] transition-all hover:scale-105">
                                    Return to Exams
                                </button>
                            </div>
                        )}

                        {/* ===== REVIEW ANSWERS ===== */}
                        {isReviewingAnswers && joinedQuiz && (
                            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-10 border border-[var(--border-color)] shadow-xl max-w-4xl mx-auto mt-6 animate-fade-in mb-10">
                                <div className="flex justify-between items-center mb-10 border-b border-[var(--border-color)] pb-6">
                                    <h2 className="text-4xl font-black flex items-center gap-3">
                                        <BookOpen className="text-red-400" size={36} /> Review Answers
                                    </h2>
                                    <button onClick={() => setIsReviewingAnswers(false)}
                                        className="px-6 py-3 bg-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-xl font-bold flex items-center gap-2">
                                        <ArrowLeft size={18} /> Back to Results
                                    </button>
                                </div>

                                <div className="space-y-8 text-left">
                                    {joinedQuiz.questions.map((q, idx) => {
                                        const userAnswer = userAnswers[(q._id || q.id)];
                                        const isCoding = q.type === "coding";
                                        const isCorrect = isCoding ? !!(userAnswer && userAnswer.trim() !== "") : userAnswer === q.correct;
                                        const isSkipped = userAnswer === undefined || (isCoding && userAnswer.trim() === "");

                                        return (
                                            <div key={(q._id || q.id)} className={`p-8 rounded-2xl border ${isCorrect ? "bg-emerald-500/10 border-emerald-500/30" : isSkipped ? "bg-amber-500/10 border-amber-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                                                <h4 className="text-xl font-bold mb-6 flex items-start gap-3">
                                                    <span className={`px-3 py-1 rounded text-sm font-black text-white ${isCorrect ? "bg-emerald-500" : isSkipped ? "bg-amber-500" : "bg-red-500"}`}>
                                                        Q{idx + 1}
                                                    </span>
                                                    {q.question}
                                                </h4>

                                                {isCoding ? (
                                                    <div className="ml-12">
                                                        <h5 className="font-bold mb-2 text-cyan-400">Your Code Submission:</h5>
                                                        <pre className="p-4 bg-[#0d1117] rounded-xl font-mono text-sm text-green-400 overflow-x-auto border border-[var(--border-color)]">
                                                            {userAnswer || "No code submitted."}
                                                        </pre>
                                                    </div>
                                                ) : (
                                                    <div className="grid gap-3 ml-12">
                                                        {q.options.map((opt, optIdx) => {
                                                            const isThisUserAnswer = userAnswer === optIdx;
                                                            const isThisCorrectAnswer = q.correct === optIdx;

                                                            let style = "bg-[var(--glass-bg)] border-[var(--border-color)] text-[var(--text-secondary)]";
                                                            let icon = null;

                                                            if (isThisCorrectAnswer) {
                                                                style = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                                                                icon = <CheckCircle size={20} className="text-emerald-400 absolute right-4" />;
                                                            } else if (isThisUserAnswer && !isThisCorrectAnswer) {
                                                                style = "bg-red-500/20 border-red-500 text-red-300 font-bold";
                                                                icon = <XCircle size={20} className="text-red-400 absolute right-4" />;
                                                            }

                                                            return (
                                                                <div key={optIdx} className={`p-4 rounded-xl border relative flex items-center transition-all ${style}`}>
                                                                    <span className="font-bold mr-4 opacity-60 w-6">{String.fromCharCode(65 + optIdx)}.</span>
                                                                    {opt}
                                                                    {icon}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {isSkipped && (
                                                    <div className="ml-12 mt-4 text-amber-500 font-bold flex items-center gap-2">
                                                        <AlertCircle size={18} /> You skipped this question.
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.4s ease-out; }
            `}</style>
        </div>
    );
}
