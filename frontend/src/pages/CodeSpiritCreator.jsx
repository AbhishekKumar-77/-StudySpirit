import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { API_BASE } from "../config";
import { connectSocket, getSocket } from "../services/groupAPI";
import {
    ArrowLeft, FilePlus, Clock, Edit, Sparkles, CheckCircle, Award,
    Trash2, Brain, Users, Send, BarChart, Target, Trophy, Zap,
    Timer, PlayCircle, PauseCircle, RotateCcw, Crown, Star,
    Flame, TrendingUp, Download, Copy, Share2, Settings, Bot,
    BookOpen, Lightbulb, AlertCircle, ChevronRight, Hash, XCircle, Pause
} from "lucide-react";

export default function CodeSpiritCreator() {
    const { user } = useApp();
    const navigate = useNavigate();

    // Main Tab State
    const [activeTab, setActiveTab] = useState("teacher");

    // Teacher Mode
    const [questions, setQuestions] = useState([]);
    const [newQ, setNewQ] = useState("");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correct, setCorrect] = useState(null);
    const [quizTitle, setQuizTitle] = useState("Untitled Quiz");
    const [quizCode, setQuizCode] = useState("SP1234");
    const [questionType, setQuestionType] = useState("mcq"); // 'mcq', 'true-false', 'coding'
    const [starterCode, setStarterCode] = useState("");
    const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "" }]);
    const [settings, setSettings] = useState({
        timeLimit: 30, // minutes
        difficulty: "medium", // overall quiz difficulty for AI gen
        negativeMarking: 0.25,
        allowReview: true,
        showResults: true,
        randomizeQuestions: false,
        secureMode: true, // Default to secure mode as requested
    });

    const [aiTeacherTopic, setAiTeacherTopic] = useState("");
    const [aiQuestionCount, setAiQuestionCount] = useState(10); // Default to 10 questions
    const [aiCodingCount, setAiCodingCount] = useState(2); // Default to 2 coding problems
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [drafts, setDrafts] = useState([]);

    // Student Exam Mode
    const [studentQuizCodeInput, setStudentQuizCodeInput] = useState(""); // Input for student to join
    const [studentRegNoInput, setStudentRegNoInput] = useState(""); // Input for student reg no
    const [joinedQuiz, setJoinedQuiz] = useState(null); // Stores quiz data student has joined
    const [examStarted, setExamStarted] = useState(false);
    const [examSubmitted, setExamSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0); // Initialized later based on quiz settings
    const [userAnswers, setUserAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [tabChangeDetected, setTabChangeDetected] = useState(false);
    const [warnings, setWarnings] = useState(0); // Track security warnings
    const [fullscreenActive, setFullscreenActive] = useState(false);
    const [isReviewingAnswers, setIsReviewingAnswers] = useState(false);
    const [isTabHidden, setIsTabHidden] = useState(false); // New state to detect if user switched tabs
    const fullscreenRef = useRef(null); // Ref for fullscreen element

    // AI Practice Mode
    const [aiQuestions, setAiQuestions] = useState([]);
    const [practiceStarted, setPracticeStarted] = useState(false);
    const [practiceIndex, setPracticeIndex] = useState(0);
    const [practiceScore, setPracticeScore] = useState(0);
    const [practiceAnswered, setPracticeAnswered] = useState(false);
    const [studentPracticeTopic, setStudentPracticeTopic] = useState("General Programming"); // Student controlled topic
    const [studentPracticeDifficulty, setStudentPracticeDifficulty] = useState("medium"); // Student controlled difficulty
    const [practiceQuestionCount, setPracticeQuestionCount] = useState(5); // User input for count
    const [practiceFinished, setPracticeFinished] = useState(false); // To show results
    const [isGeneratingPractice, setIsGeneratingPractice] = useState(false); // Loading for AI Practice
    const [lastChosenPracticeOption, setLastChosenPracticeOption] = useState(null); // To highlight user's choice

    // Leaderboard
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        if (activeTab === "leaderboard") {
            const fetchLeaderboard = async () => {
                try {
                    const res = await fetch(`${API_BASE}/quiz/leaderboard`, { credentials: 'include' });
                    const data = await res.json();
                    if (data.success) {
                        setLeaderboard(data.leaderboard);
                    }
                } catch (e) {
                    console.error("Leaderboard fetch error", e);
                }
            };
            fetchLeaderboard();
        } else if (activeTab === "teacher") {
            const fetchDrafts = async () => {
                try {
                    const res = await fetch(`${API_BASE}/quiz/my-quizzes`, { credentials: 'include' });
                    const data = await res.json();
                    if (data.success) {
                        setDrafts(data.quizzes || []);
                    }
                } catch (e) {
                    console.error("Drafts fetch error", e);
                }
            };
            fetchDrafts();
        }
    }, [activeTab]);
    // --------------------------- FUNCTIONS ---------------------------

    const addQuestion = () => {
        if (questionType === "coding") {
            if (!newQ.trim() || testCases.some(tc => !tc.input.trim() || !tc.expectedOutput.trim())) {
                alert("Please fill the problem statement and all test cases correctly!");
                return;
            }
            setQuestions([
                ...questions,
                {
                    id: Date.now(),
                    question: newQ,
                    type: questionType,
                    difficulty: settings.difficulty,
                    starterCode: starterCode || "",
                    testCases: testCases
                }
            ]);
        } else {
            if (!newQ.trim() || correct === null || options.some(o => !o.trim())) {
                alert("Please fill all fields correctly!");
                return;
            }

            setQuestions([
                ...questions,
                {
                    id: Date.now(),
                    question: newQ,
                    options,
                    correct,
                    type: questionType,
                    difficulty: settings.difficulty
                }
            ]);
        }

        setNewQ("");
        setOptions(["", "", "", ""]);
        setCorrect(null);
        setStarterCode("");
        setTestCases([{ input: "", expectedOutput: "" }]);
        setQuestionType("mcq"); // Reset to default
    };

    const deleteQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const generateQuizCode = () => {
        const code = "SP" + Math.random().toString(36).substr(2, 4).toUpperCase();
        setQuizCode(code);
    };

    // TIMER EFFECT
    useEffect(() => {
        if ((examStarted && activeTab === "student") || (practiceStarted && activeTab === "practice")) {
            if (timeLeft <= 0) {
                if (activeTab === "student") submitExam();
                // For practice, just let it run out or manage as needed without auto-submit
                return;
            }
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [examStarted, timeLeft, examSubmitted, practiceStarted, activeTab]);

    // SECURE MODE EFFECTS
    // SECURE MODE EFFECTS
    useEffect(() => {
        // Use joinedQuiz settings for students
        const isSecure = activeTab === "student" ? joinedQuiz?.settings?.secureMode : false;

        if (isSecure && examStarted && activeTab === "student" && !showResult) {

            // Enter Fullscreen
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
                setIsTabHidden(hidden); // Instantly blocks UI with an overlay

                if (hidden) {
                    setTabChangeDetected(true);
                    setWarnings(prev => {
                        const newCount = prev + 1;
                        if (newCount >= 3) { // Gave them 3 strikes for flexibility
                            alert("Violation Limit Reached! Exam is auto-submitting...");
                            submitExam();
                        } else {
                            alert("WARNING: Tab switching is strictly prohibited! Return to the exam immediately.");
                        }
                        return newCount;
                    });
                }
            };

            // Anti-Cheat: Block right click
            const handleContextMenu = (e) => { e.preventDefault(); };

            // Anti-Cheat: Block Copy/Paste
            const handleCopyPaste = (e) => { e.preventDefault(); };

            // Anti-Cheat: Block Keyboard Shortcuts (PrintScreen, F12, Ctrl+C)
            const handleKeyDown = (e) => {
                // Prevent F12, Ctrl+Shift+I, Ctrl+C, Ctrl+V, PrintScreen
                if (
                    e.key === 'F12' ||
                    (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                    (e.ctrlKey && e.key === 'c') ||
                    (e.ctrlKey && e.key === 'v') ||
                    e.key === 'PrintScreen' ||
                    (e.metaKey && e.shiftKey && e.key === 's') // Windows Snip / Mac screenshot
                ) {
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
            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.addEventListener('mozfullscreenchange', handleFullscreenChange);
            document.addEventListener('contextmenu', handleContextMenu);
            document.addEventListener('copy', handleCopyPaste);
            document.addEventListener('paste', handleCopyPaste);
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener("visibilitychange", handleVisibilityChange);
                document.removeEventListener('fullscreenchange', handleFullscreenChange);
                document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
                document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
                document.removeEventListener('contextmenu', handleContextMenu);
                document.removeEventListener('copy', handleCopyPaste);
                document.removeEventListener('paste', handleCopyPaste);
                document.removeEventListener('keydown', handleKeyDown);

                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => { });
                }
            };

            // Cleanup socket room if student leaves the page mid-exam
            try {
                const socket = getSocket();
                if (socket) {
                    socket.emit("quiz:leave", {
                        quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),
                        studentId: user?._id || user?.id || "guest"
                    });
                }
            } catch (e) { }
        }
    }, [examStarted, joinedQuiz, activeTab, examSubmitted, showResult]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const joinQuiz = async () => {
        if (!studentQuizCodeInput || !studentRegNoInput) {
            alert("Please enter both the Quiz Code and your Registration Number!");
            return;
        }

        try {
            // Fetch quiz from backend
            const res = await fetch(`${API_BASE}/quiz/${studentQuizCodeInput.trim().toUpperCase()}`);
            const data = await res.json();

            if (data.success) {
                setJoinedQuiz({
                    questions: settings.randomizeQuestions ? [...data.quiz.questions].sort(() => Math.random() - 0.5) : data.quiz.questions,
                    settings: data.quiz.settings
                });
                setExamSubmitted(false);
                setUserAnswers({});
                setCurrentQuestionIndex(0);
                setShowResult(false);
                setIsReviewingAnswers(false);
                setWarnings(0);

                // Pre-connect socket so teacher sees student joining
                try {
                    const socket = connectSocket();
                    const doJoin = () => socket.emit('quiz:join', {
                        quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),
                        studentId: user?._id || user?.id || 'guest',
                        studentName: user?.name || 'Student',
                        registrationNumber: studentRegNoInput.trim()
                    });
                    if (socket.connected) { doJoin(); console.log("📡 Socket quiz:join emitted (connected)"); } else { socket.once('connect', () => { doJoin(); console.log("📡 Socket quiz:join emitted (after connect)"); }); }
                } catch (_e) { console.error("❌ Socket join error:", _e); }
                // Also update local quiz code display if needed, or just keep input
            } else {
                alert(data.message || "Invalid Quiz Code!");
                setJoinedQuiz(null);
            }
        } catch (err) {
            console.error("Join Quiz Error:", err);
            alert("Failed to connect to quiz server.");
        }
    };

    const startExam = () => {
        if (!joinedQuiz || joinedQuiz.questions.length === 0) {
            alert("No quiz joined or no questions available!");
            return;
        }
        setTimeLeft(joinedQuiz.settings.timeLimit * 60);
        setExamStarted(true);
        setExamSubmitted(false);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setShowResult(false);

        // Notify teacher: student joined exam
        try {
            const socket = connectSocket();
            const doJoin = () => socket.emit('quiz:join', {
                quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),
                studentId: user?._id || user?.id || 'guest',
                studentName: user?.name || 'Student',
                registrationNumber: studentRegNoInput.trim()
            });
            if (socket.connected) { doJoin(); console.log("📡 Socket quiz:join emitted from startExam"); } else { socket.once('connect', () => { doJoin(); console.log("📡 Socket quiz:join emitted from startExam (after connect)"); }); }
        } catch (e) { console.error('Socket join error', e); }
    };

    const submitExam = async () => {
        if (!joinedQuiz) return;
        let correctCount = 0;
        let totalScore = 0;
        const quizQs = joinedQuiz.questions;

        quizQs.forEach(q => {
            if (userAnswers[q.id] === q.correct) {
                correctCount++;
                totalScore += 1;
            } else if (userAnswers[q.id] !== undefined) {
                totalScore -= joinedQuiz.settings.negativeMarking;
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
                    quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),
                    score: Number(totalScore.toFixed(2)), // Real marks with negative deductions
                    percentage: Math.round(finalScore), // Pass negative-marked final percentage
                    totalQuestions: quizQs.length,
                    timeTaken: joinedQuiz.settings.timeLimit * 60 - timeLeft,
                    registrationNumber: studentRegNoInput.trim()
                })
            });
            // Notify teacher: student submitted (real-time)
            try {
                const socket = getSocket();
                if (socket) {
                    const taken = (joinedQuiz.settings.timeLimit * 60) - timeLeft;
                    console.log("📡 Emitting quiz:submitted..."); socket.emit('quiz:submitted', {
                        quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),
                        studentId: user?._id || user?.id || 'guest',
                        studentName: user?.name || 'Student',
                        registrationNumber: studentRegNoInput.trim(),
                        score: Math.round(finalScore),
                        correctAnswers: correctCount,
                        timeTaken: taken,
                        totalQuestions: quizQs.length
                    });
                    socket.emit('quiz:leave', {
                        quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),
                        studentId: user?._id || user?.id || 'guest'
                    });
                }
            } catch (se) { console.error('Socket submit error', se); }
        } catch (e) {
            console.error("Submit error", e);
        }
    };

    const saveQuiz = async (status = "published") => {
        if (questions.length === 0) {
            alert("Add some questions first to create a quiz!");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/quiz/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Needed for auth/creatorId
                body: JSON.stringify({
                    title: quizTitle,
                    questions,
                    settings: {
                        ...settings,
                        timeLimit: settings.timeLimit || 30,
                        negativeMarking: settings.negativeMarking || 0
                    },
                    creatorName: user?.name || "Teacher",
                    status
                })
            });
            const data = await res.json();

            if (data.success) {
                setQuizCode(data.quizCode);
                if (status === "draft") {
                    alert(`Draft Saved Successfully!\nYou can find it in your drafts.`);
                    // Refresh drafts
                    const draftRes = await fetch(`${API_BASE}/quiz/my-quizzes`, { credentials: 'include' });
                    const draftData = await draftRes.json();
                    if (draftData.success) setDrafts(draftData.quizzes || []);
                } else {
                    alert(`Quiz Published Successfully! \n\nShare this Code: ${data.quizCode}`);
                }
            } else {
                alert("Failed to save quiz: " + data.message);
            }
        } catch (err) {
            console.error("Save Quiz Error:", err);
            alert("Error saving quiz to server.");
        } finally {
            setIsSaving(false);
        }
    };

    const loadDraft = (quiz) => {
        setQuestions(quiz.questions || []);
        setQuizTitle(quiz.title);
        setQuizCode(quiz.code);
        setSettings(quiz.settings);
        setActiveTab("teacher");
    };

    const publishExistingDraft = async (code) => {
        try {
            const res = await fetch(`${API_BASE}/quiz/${code}/publish`, {
                method: 'PUT',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                alert(`Quiz published! Share code: ${data.quizCode}`);
                // Refresh drafts
                const draftRes = await fetch(`${API_BASE}/quiz/my-quizzes`, { credentials: 'include' });
                const draftData = await draftRes.json();
                if (draftData.success) setDrafts(draftData.quizzes || []);
            } else {
                alert("Failed to publish: " + data.message);
            }
        } catch (e) {
            console.error(e);
            alert("Error publishing.");
        }
    };

    const handleTeacherAIGeneration = async () => {
        if (!aiTeacherTopic.trim()) {
            alert("Please enter a topic for AI question generation.");
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch(`${API_BASE}/quiz/generate-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: aiTeacherTopic,
                    difficulty: settings.difficulty,
                    mcqCount: aiQuestionCount || 5,
                    codingCount: aiCodingCount || 0
                })
            });
            const data = await res.json();

            if (data.success && data.questions) {
                setQuestions(prev => [...prev, ...data.questions]);
                setAiTeacherTopic("");
                alert(`${data.questions.length} AI questions added!`);
            } else {
                alert("Failed to generate questions: " + (data.message || "Unknown error"));
            }
        } catch (err) {
            console.error("AI Gen Error:", err);
            alert("Error connecting to AI service.");
        } finally {
            setIsGenerating(false);
        }
    };


    const generateAIQuestionsForPractice = async () => {
        if (!studentPracticeTopic.trim()) {
            alert("Please enter a topic for AI practice questions.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/quiz/generate-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: studentPracticeTopic,
                    difficulty: studentPracticeDifficulty,
                    type: "mcq",
                    count: practiceQuestionCount || 5
                })
            });
            const data = await res.json();

            if (data.success && data.questions) {
                setAiQuestions(data.questions);
                setPracticeStarted(true);
                setPracticeFinished(false);
                setPracticeIndex(0);
                setPracticeScore(0);
                setPracticeAnswered(false);
                setLastChosenPracticeOption(null);
                setUserAnswers({}); // Clear previous answers
            } else {
                alert("Failed to generate questions: " + (data.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Practice Gen Error:", err);
            alert("Error connecting to AI service.");
        }
    };

    const answerPractice = (optionIndex, questionId) => {
        if (practiceAnswered) return;
        setPracticeAnswered(true);
        setLastChosenPracticeOption(optionIndex); // Store user's chosen option

        if (optionIndex === aiQuestions[practiceIndex].correct) {
            setPracticeScore(practiceScore + 1);
        }
        // Store answer for potential review, though not fully implemented here
        setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const nextPracticeQuestion = () => {
        // If not answered, consider it skipped for score but allow next
        if (!practiceAnswered && practiceIndex < aiQuestions.length - 1) {
            alert("You skipped this question.");
        }

        if (practiceIndex < aiQuestions.length - 1) {
            setPracticeIndex(practiceIndex + 1);
            setPracticeAnswered(false);
            setLastChosenPracticeOption(null);
        } else {
            setPracticeFinished(true);
        }
    };


    const getIcon = (iconName) => {
        const icons = {
            ArrowLeft, FilePlus, Clock, Edit, Sparkles, CheckCircle, Award,
            Trash2, Brain, Users, Send, BarChart, Target, Trophy, Zap,
            Timer, PlayCircle, PauseCircle, RotateCcw, Crown, Star,
            Flame, TrendingUp, Download, Copy, Share2, Settings, Bot,
            BookOpen, Lightbulb, AlertCircle, ChevronRight, Hash, XCircle
        };
        const IconComponent = icons[iconName];
        return IconComponent ? <IconComponent size={20} /> : null;
    };


    // --------------------------- RENDER ---------------------------
    return (
        <div
            className="min-h-screen bg-[var(--bg-primary)] relative pb-20 overflow-hidden font-sans text-[var(--text-primary)]"
            ref={fullscreenRef}
        >
            {/* Background Glow */}
            <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-cyan-500 /15 rounded-full blur-[100px] z-0 pointer-events-none"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[100px] z-0 pointer-events-none"></div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--border-color)] px-8 py-4 transition-all duration-300">
                <div className="max-w-[1400px] mx-auto flex items-center">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-3 bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:border-cyan-500/50 hover:-translate-x-1"
                    >
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-8 py-10 relative z-10">
                {/* Hero Header */}
                <div className="bg-gradient-to-br from-cyan-500 /20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-10 mb-8 border border-cyan-500/20 shadow-[0_20px_60px_rgba(139,92,246,0.2)] relative overflow-hidden transition-all duration-300 group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50"></div>

                    <div className="flex items-center justify-between flex-wrap gap-6">
                        <div>
                            <h1 className="text-5xl font-black text-[var(--text-primary)] mb-3">
                                {activeTab === "teacher" ? quizTitle : activeTab === "student" ? "Live Exam Mode" : activeTab === "practice" ? "AI Practice Arena" : "Global Leaderboard"}
                            </h1>
                            <p className="text-xl text-[var(--text-secondary)]">
                                {(activeTab === "teacher" && questions.length > 0) || (activeTab === "student" && joinedQuiz?.questions.length > 0)
                                    ? `${(activeTab === "teacher" ? questions.length : joinedQuiz.questions.length)} Questions • ${settings.timeLimit} min • ${settings.difficulty.toUpperCase()}`
                                    : "Create or join a quiz to begin"}
                            </p>
                        </div>

                        {activeTab === "teacher" && questions.length > 0 && (
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <button onClick={() => saveQuiz("draft")} disabled={isSaving} className="px-6 py-4 bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-bold rounded-xl shadow border border-[var(--border-color)] transition-all duration-300 hover:bg-[var(--border-color)] flex items-center gap-2">
                                    <Edit size={20} /> Save as Draft
                                </button>
                                <button onClick={() => saveQuiz("published")} disabled={isSaving} className="px-8 py-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-[var(--text-primary)] font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70">
                                    <Share2 size={20} /> {isSaving ? "Saving..." : "Publish Exam"}
                                </button>
                            </div>
                        )}
                        {activeTab === "student" && joinedQuiz && showResult && (
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-br from-cyan-500  to-pink-500 text-[var(--text-primary)] font-bold rounded-xl shadow-lg shadow-violet-500/30 transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                    <BookOpen size={20} /> Review Answers
                                </button>
                                <button className="px-6 py-3 bg-white/10 text-[var(--text-primary)] rounded-xl hover:bg-white/15 transition-all duration-300 flex items-center gap-2">
                                    <Download size={20} /> Export Scorecard
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-3 mb-10 flex-wrap">
                    {[
                        { id: "teacher", label: "Create Exam", icon: "FilePlus" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-xl font-bold text-[10px] sm:text-sm uppercase tracking-wider transition-all duration-300
                                ${activeTab === tab.id
                                    ? "bg-gradient-to-br from-cyan-500  to-pink-500 text-[var(--text-primary)] shadow-lg shadow-violet-500/30 scale-105"
                                    : "bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]/80 hover:shadow-md"
                                }
                            `}
                        >
                            {getIcon(tab.icon)} {tab.label}
                        </button>
                    ))}

                    <button
                        onClick={() => setActiveTab("drafts")}
                        className={`
                            flex w-full sm:w-auto items-center justify-center gap-2 px-4 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 mt-2 sm:mt-0 sm:ml-auto
                            ${activeTab === "drafts"
                                ? "bg-gradient-to-br from-amber-500 to-orange-500 text-[var(--text-primary)] shadow-lg shadow-amber-500/30 scale-105"
                                : "bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]/80 hover:shadow-md"
                            }
                        `}
                    >
                        <BookOpen size={20} /> My Saved Exams
                    </button>
                </div>

                {/* TAB CONTENT */}

                {/* TEACHER CREATOR */}
                {activeTab === "teacher" && (
                    <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-7 border border-[var(--border-color)] shadow-xl transition-all duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3 border-b-2 border-cyan-500/30 pb-3">
                                    <FilePlus size={32} /> Create New Question
                                </h2>

                                <input
                                    type="text"
                                    value={quizTitle}
                                    onChange={(e) => setQuizTitle(e.target.value)}
                                    placeholder="Quiz Title (e.g., React Mastery Test)"
                                    className="w-full p-4 bg-[var(--glass-bg)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] text-lg font-semibold mb-5 focus:border-cyan-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all duration-300"
                                />

                                <div className="mb-5">
                                    <label className="text-[var(--text-secondary)] mb-2 block text-sm">Question Type:</label>
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer text-[var(--text-primary)] font-medium hover:text-cyan-400  transition-colors">
                                            <input
                                                type="radio"
                                                name="questionType"
                                                value="mcq"
                                                checked={questionType === "mcq"}
                                                onChange={() => { setQuestionType("mcq"); setOptions(["", "", "", ""]); setCorrect(null); }}
                                                className="accent-violet-500 w-4 h-4"
                                            /> MCQ
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-[var(--text-primary)] font-medium hover:text-cyan-400  transition-colors">
                                            <input
                                                type="radio"
                                                name="questionType"
                                                value="true-false"
                                                checked={questionType === "true-false"}
                                                onChange={() => { setQuestionType("true-false"); setOptions(["True", "False"]); setCorrect(null); }}
                                                className="accent-violet-500 w-4 h-4"
                                            /> True/False
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-[var(--text-primary)] font-medium hover:text-cyan-400  transition-colors">
                                            <input
                                                type="radio"
                                                name="questionType"
                                                value="coding"
                                                checked={questionType === "coding"}
                                                onChange={() => { setQuestionType("coding"); options.length = 0; setCorrect(null); }}
                                                className="accent-violet-500 w-4 h-4"
                                            /> Coding Problem
                                        </label>
                                    </div>
                                </div>


                                <textarea
                                    value={newQ}
                                    onChange={(e) => setNewQ(e.target.value)}
                                    placeholder="Enter your question here..."
                                    className="w-full p-4 bg-[var(--glass-bg)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] text-lg font-semibold mb-5 min-h-[120px] focus:border-cyan-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all duration-300 resize-y"
                                />

                                {questionType === "coding" ? (
                                    <div className="mb-6 space-y-4">
                                        <textarea
                                            value={starterCode}
                                            onChange={(e) => setStarterCode(e.target.value)}
                                            placeholder="Starter Code (optional)... e.g. function solve(input) {\n\n}"
                                            className="w-full p-4 bg-black/40 border border-violet-500/30 font-mono text-sm rounded-xl text-green-400 focus:border-violet-500 outline-none min-h-[100px]"
                                        />
                                        <div className="space-y-3">
                                            <h4 className="text-[var(--text-primary)] font-bold text-sm">Test Cases</h4>
                                            {testCases.map((tc, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input
                                                        placeholder="Input (stdin)"
                                                        value={tc.input}
                                                        onChange={(e) => {
                                                            const newTc = [...testCases];
                                                            newTc[idx].input = e.target.value;
                                                            setTestCases(newTc);
                                                        }}
                                                        className="flex-1 p-3 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                                                    />
                                                    <input
                                                        placeholder="Expected Output (stdout)"
                                                        value={tc.expectedOutput}
                                                        onChange={(e) => {
                                                            const newTc = [...testCases];
                                                            newTc[idx].expectedOutput = e.target.value;
                                                            setTestCases(newTc);
                                                        }}
                                                        className="flex-1 p-3 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                                                    />
                                                    <button onClick={() => setTestCases(testCases.filter((_, i) => i !== idx))} className="p-3 text-red-500 hover:bg-red-500/10 rounded-lg">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={() => setTestCases([...testCases, { input: "", expectedOutput: "" }])} className="text-sm font-bold text-violet-500 hover:text-violet-400">
                                                + Add Test Case
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                            {options.map((opt, i) => (
                                                <div key={i} className="relative group">
                                                    <input
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOpts = [...options];
                                                            newOpts[i] = e.target.value;
                                                            setOptions(newOpts);
                                                        }}
                                                        placeholder={`Option ${i + 1}`}
                                                        className={`
                                                            w-full pl-10 pr-4 py-3.5 rounded-xl text-[var(--text-primary)] transition-all duration-300 outline-none border
                                                            ${correct === i
                                                                ? "bg-emerald-500/20 border-emerald-500"
                                                                : "bg-[var(--glass-bg)] border-[var(--border-color)] group-hover:border-cyan-500/50"
                                                            }
                                                        `}
                                                    />
                                                    {correct === i && <CheckCircle size={20} className="text-emerald-500 absolute left-3 top-3.5" />}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-3 mb-6 flex-wrap">
                                            {options.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCorrect(i)}
                                                    className={`
                                                        px-5 py-3 rounded-xl font-bold transition-all duration-300 shadow-md
                                                        ${correct === i
                                                            ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-[var(--text-primary)] shadow-emerald-500/30"
                                                            : "bg-[var(--border-color)]/50 text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]"
                                                        }
                                                    `}
                                                >
                                                    Mark {questionType === "mcq" ? `Option ${i + 1}` : options[i]} Correct
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <button
                                    onClick={addQuestion}
                                    className="w-full py-4 bg-gradient-to-br from-cyan-500  to-pink-500 text-[var(--text-primary)] font-bold rounded-xl shadow-lg shadow-violet-500/30 transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 text-lg"
                                >
                                    Add Question to Quiz
                                </button>

                                <div className="mt-10 border-t border-cyan-500/20 pt-8">
                                    <h3 className="text-[var(--text-primary)] font-bold mb-4 flex items-center gap-2 text-xl">
                                        <Brain size={24} className="text-amber-500" /> Generate AI Questions
                                    </h3>
                                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                                        <input
                                            type="text"
                                            value={aiTeacherTopic}
                                            onChange={(e) => setAiTeacherTopic(e.target.value)}
                                            placeholder="Topic for AI questions (e.g., 'React Hooks', 'Data Structures')"
                                            className="flex-1 p-4 bg-[var(--glass-bg)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300"
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={aiQuestionCount}
                                            onChange={(e) => setAiQuestionCount(e.target.value === "" ? "" : Number(e.target.value))}
                                            placeholder="MCQ Count"
                                            className="w-full md:w-28 p-4 bg-[var(--glass-bg)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300 text-center"
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            max="5"
                                            value={aiCodingCount}
                                            onChange={(e) => setAiCodingCount(e.target.value === "" ? "" : Number(e.target.value))}
                                            placeholder="Coding Count"
                                            className="w-full md:w-32 p-4 bg-[var(--glass-bg)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300 text-center"
                                        />
                                        <button
                                            onClick={handleTeacherAIGeneration}
                                            disabled={isGenerating}
                                            className="w-full md:w-auto px-6 py-4 bg-gradient-to-br from-amber-500 to-orange-600 text-[var(--text-primary)] font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
                                        >
                                            <Sparkles size={20} /> {isGenerating ? "Generating..." : "Generate with AI"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-[var(--text-primary)] font-bold mb-4 flex items-center gap-2 text-xl">
                                        <Settings size={24} className="text-[var(--text-secondary)]" /> Quiz Settings
                                    </h3>
                                    <div className="bg-[var(--glass-bg)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
                                        <div>
                                            <label className="text-[var(--text-secondary)] text-sm mb-1 block">Time Limit (minutes)</label>
                                            <input
                                                type="number"
                                                value={settings.timeLimit}
                                                onChange={(e) => setSettings({ ...settings, timeLimit: e.target.value === "" ? "" : Number(e.target.value) })}
                                                className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-cyan-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[var(--text-secondary)] text-sm mb-1 block">Negative Marking</label>
                                            <input
                                                type="number"
                                                step="0.05"
                                                value={settings.negativeMarking}
                                                onChange={(e) => setSettings({ ...settings, negativeMarking: e.target.value === "" ? "" : Number(e.target.value) })}
                                                className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-cyan-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[var(--text-secondary)] text-sm mb-1 block">Difficulty</label>
                                            <select
                                                value={settings.difficulty}
                                                onChange={(e) => setSettings({ ...settings, difficulty: e.target.value })}
                                                className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-cyan-500 outline-none transition-all"
                                            >
                                                <option value="easy">Easy</option>
                                                <option value="medium">Medium</option>
                                                <option value="hard">Hard</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between py-2 border-t border-[var(--border-color)] mt-2">
                                            <label className="text-[var(--text-secondary)] text-sm">Randomize</label>
                                            <input
                                                type="checkbox"
                                                checked={settings.randomizeQuestions}
                                                onChange={(e) => setSettings({ ...settings, randomizeQuestions: e.target.checked })}
                                                className="w-5 h-5 accent-violet-500 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-t border-[var(--border-color)]">
                                            <label className="text-[var(--text-secondary)] text-sm flex items-center gap-2">
                                                Secure Mode <AlertCircle size={14} className="text-amber-500" />
                                            </label>
                                            <input
                                                type="checkbox"
                                                checked={settings.secureMode}
                                                onChange={(e) => setSettings({ ...settings, secureMode: e.target.checked })}
                                                className="w-5 h-5 accent-violet-500 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-t border-[var(--border-color)]">
                                            <label className="text-[var(--text-secondary)] text-sm">Instant Results</label>
                                            <input
                                                type="checkbox"
                                                checked={settings.showResults}
                                                onChange={(e) => setSettings({ ...settings, showResults: e.target.checked })}
                                                className="w-5 h-5 accent-violet-500 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <h3 className="text-[var(--text-primary)] font-bold mb-4 text-xl border-b border-[var(--border-color)] pb-2">
                                Added Questions <span className="text-cyan-400 ">({questions.length})</span>
                            </h3>
                            {questions.length === 0 && (
                                <div className="text-center py-10 text-[var(--text-muted)] bg-[var(--glass-bg)] rounded-xl border border-dashed border-[var(--border-color)]">
                                    <FilePlus size={48} className="mx-auto mb-3 opacity-50" />
                                    <p>No questions added yet. Start creating above!</p>
                                </div>
                            )}
                            <div className="space-y-3">
                                {questions.map((q, idx) => (
                                    <div key={q.id} className="bg-[var(--glass-bg)] p-5 rounded-xl border border-[var(--border-color)] hover:border-cyan-500/50 transition-colors group">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <p className="text-lg font-medium text-[var(--text-primary)] mb-3">
                                                    <span className="text-cyan-400 font-bold mr-2">
                                                        Q{idx + 1} {q.type === "coding" ? "(Coding)" : ""}:
                                                    </span>
                                                    {q.question}
                                                </p>
                                                {q.type === "coding" ? (
                                                    <div className="text-sm font-mono bg-black/50 p-3 rounded-lg text-amber-500 border border-amber-500/20">
                                                        Test Cases: {q.testCases?.length || 0}
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {q.options?.map((opt, i) => (
                                                            <span key={i} className={`
                                                                px-3 py-2 rounded-lg text-sm font-medium border
                                                                ${i === q.correct
                                                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                                                    : "bg-[var(--glass-bg)] border-[var(--border-color)] text-[var(--text-secondary)]"
                                                                }
                                                            `}>
                                                                {opt}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => deleteQuestion(q.id)}
                                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* MY DRAFTS */}
                {activeTab === "drafts" && (
                    <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-7 border border-[var(--border-color)] shadow-xl transition-all duration-300 min-h-[400px]">
                        <h2 className="text-3xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3 border-b-2 border-amber-500/30 pb-4">
                            <BookOpen size={36} className="text-amber-500" /> My Saved Quizzes
                        </h2>

                        {drafts.length === 0 ? (
                            <div className="text-center py-20 text-[var(--text-muted)] bg-[var(--glass-bg)] rounded-2xl border border-dashed border-[var(--border-color)]">
                                <FilePlus size={64} className="mx-auto mb-4 opacity-40 text-cyan-400 " />
                                <p className="text-xl">You have no saved drafts.</p>
                                <p className="text-sm mt-2">Go to 'Create Quiz' to start building one.</p>
                                <button
                                    onClick={() => setActiveTab("teacher")}
                                    className="mt-6 px-6 py-3 bg-cyan-500  text-[var(--text-primary)] rounded-lg hover:bg-cyan-500  transition-colors"
                                >
                                    Create a Quiz
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {drafts.map((draft) => (
                                    <div key={draft.code} className="bg-[var(--glass-bg)] p-6 rounded-2xl border border-[var(--border-color)] hover:border-amber-500/50 transition-all group flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-amber-400 transition-colors line-clamp-2">
                                                    {draft.title}
                                                </h3>
                                                <span className={`text-xs px-2 py-1 rounded-md font-bold ${draft.status === 'draft' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                                    {draft.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="text-[var(--text-secondary)] text-sm mb-4 space-y-1">
                                                <p className="flex items-center gap-2"><Target size={14} /> Code: {draft.code}</p>
                                                <p className="flex items-center gap-2"><Settings size={14} /> Questions: {draft.questions?.length || 0}</p>
                                                <p className="flex items-center gap-2"><Clock size={14} /> Time Limit: {draft.settings?.timeLimit || 30}m</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--border-color)]">
                                            <button
                                                onClick={() => loadDraft(draft)}
                                                className="w-full py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--border-color)] transition flex items-center justify-center gap-2 font-medium"
                                            >
                                                <Edit size={16} /> Edit
                                            </button>

                                            {draft.status === 'draft' ? (
                                                <button
                                                    onClick={() => publishExistingDraft(draft.code)}
                                                    className="w-full py-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg hover:bg-emerald-600/30 transition flex items-center justify-center gap-2 font-medium"
                                                >
                                                    <Share2 size={16} /> Publish
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(draft.code);
                                                        alert("Code copied!");
                                                    }}
                                                    className="w-full py-2.5 bg-cyan-500 /20 text-cyan-400  rounded-lg hover:bg-cyan-500 /30 transition flex items-center justify-center gap-2 font-medium"
                                                >
                                                    <Copy size={16} /> Copy Code
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
