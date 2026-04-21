import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { API_BASE } from "../config";
import { connectSocket, getSocket } from "../services/groupAPI";
import {
    ArrowLeft, FilePlus, Clock, Edit, Sparkles, CheckCircle, Award,
    Trash2, Brain, Users, Send, BarChart, Target, Trophy, Zap,
    Timer, PlayCircle, PauseCircle, RotateCcw, Crown, Star,
    Flame, TrendingUp, Download, Copy, Share2, Settings, Bot,
    BookOpen, Lightbulb, AlertCircle, ChevronRight, Hash, XCircle, Pause,
    Image, Calendar, BarChart2, TrendingDown, Upload
} from "lucide-react";
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function StudySprintQuiz() {
    const { user } = useApp();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    // Preview mode: teacher opened exam with ?preview=1 to see it as a student would
    const isPreviewMode = searchParams.get('preview') === '1';
    const previewCode = searchParams.get('code') || '';

    // Main Tab State
    const [activeTab, setActiveTab] = useState("teacher");

    // Teacher Mode
    const [questions, setQuestions] = useState([]);
    const [newQ, setNewQ] = useState("");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correct, setCorrect] = useState(null);
    const [quizTitle, setQuizTitle] = useState("Untitled Quiz");
    const [quizCode, setQuizCode] = useState("SP1234");
    const [questionType, setQuestionType] = useState("mcq"); // 'mcq' or 'true-false'

    const [settings, setSettings] = useState({
        timeLimit: 30,
        difficulty: "medium",
        negativeMarking: 0.25,
        allowReview: true,
        showResults: true,
        randomizeQuestions: false,
        secureMode: true,
        scheduledStart: "",  // ISO datetime string (empty = no schedule)
        scheduledEnd: "",
    });

    // Media & Graded content for the question being built
    const [newQImageUrl, setNewQImageUrl] = useState("");
    const [newQAudioUrl, setNewQAudioUrl] = useState("");
    const [newQVideoUrl, setNewQVideoUrl] = useState("");
    const [newQRubric, setNewQRubric] = useState("");
    const [newQMathFormula, setNewQMathFormula] = useState(""); // LaTeX equation

    const [aiTeacherTopic, setAiTeacherTopic] = useState("");
    const [aiQuestionCount, setAiQuestionCount] = useState(10); // Default to 10 questions
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiImageBase64, setAiImageBase64] = useState(""); // Image uploaded by teacher
    const [isParsingImage, setIsParsingImage] = useState(false);
    const [drafts, setDrafts] = useState([]);

    // Student Exam Mode
    const [studentQuizCodeInput, setStudentQuizCodeInput] = useState(""); // Input for student to join
    const [studentRegNoInput, setStudentRegNoInput] = useState(""); // Input for student reg no
    const [aiExplanations, setAiExplanations] = useState({}); // For post-exam doubt resolution
    const [isExplaining, setIsExplaining] = useState({});
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
    const [isTabHidden, setIsTabHidden] = useState(false);
    const [alreadySubmittedError, setAlreadySubmittedError] = useState(""); // Re-attempt block message
    const [codingSubmissions, setCodingSubmissions] = useState([]); // coding answers to store on submit
    const fullscreenRef = useRef(null);
    // Ref keeps latest userAnswers accessible in timer callback (avoids stale closure)
    const userAnswersRef = useRef({});

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

    // Auto-enter student tab & pre-fill quiz code when in preview mode
    useEffect(() => {
        if (isPreviewMode && previewCode) {
            setActiveTab('student');
            setStudentQuizCodeInput(previewCode.toUpperCase());
        }
    }, [isPreviewMode, previewCode]);

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

    // Handle Socket Reconnections for Live Monitoring
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        
        const handleReconnect = () => {
            if (activeTab === "student" && examStarted && !examSubmitted && joinedQuiz) {
                // Re-emit join
                socket.emit('quiz:join', {
                    quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),
                    studentId: user?._id || user?.id || 'guest',
                    studentName: user?.name || 'Student',
                    registrationNumber: studentRegNoInput.trim()
                });
                
                // Re-emit progress
                const correctCount = joinedQuiz.questions.filter(q => userAnswers[q._id || q.id] === q.correct).length;
                socket.emit('quiz:progress', {
                    quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),
                    studentId: user?._id || user?.id || 'guest',
                    correctAnswers: correctCount,
                    totalQuestions: joinedQuiz.questions.length
                });
            }
        };

        socket.on('connect', handleReconnect);
        
        return () => {
            socket.off('connect', handleReconnect);
        };
    }, [activeTab, examStarted, examSubmitted, joinedQuiz, studentQuizCodeInput, studentRegNoInput, user, userAnswers]);

    // --------------------------- FUNCTIONS ---------------------------

    const addQuestion = () => {
        if (!newQ.trim()) {
            alert("Please enter a question!");
            return;
        }
        if (questionType !== 'subjective' && (correct === null || options.some(o => !o.trim()))) {
            alert("Please fill all MCQ options and select the correct one!");
            return;
        }

        setQuestions([
            ...questions,
            {
                id: Date.now(),
                question: newQ,
                imageUrl: newQImageUrl.trim(),
                audioUrl: newQAudioUrl.trim(),
                videoUrl: newQVideoUrl.trim(),
                mathFormula: newQMathFormula.trim(),
                rubric: newQRubric.trim(),
                options: questionType !== 'subjective' ? options : [],
                correct: questionType !== 'subjective' ? correct : null,
                type: questionType,
                difficulty: settings.difficulty
            }
        ]);

        setNewQ("");
        setNewQImageUrl("");
        setNewQAudioUrl("");
        setNewQVideoUrl("");
        setNewQMathFormula("");
        setNewQRubric("");
        setOptions(["", "", "", ""]);
        setCorrect(null);
        setQuestionType("mcq");
    };

    const deleteQuestion = (id) => {
        setQuestions(questions.filter(q => (q._id || q.id) !== id));
    };

    const generateQuizCode = () => {
        const code = "SP" + Math.random().toString(36).substr(2, 4).toUpperCase();
        setQuizCode(code);
    };

    // Keep ref in sync with latest answers — used by timer to avoid stale closure
    useEffect(() => {
        userAnswersRef.current = userAnswers;
    }, [userAnswers]);

    // TIMER EFFECT — uses userAnswersRef.current so auto-submit never misses last answers
    useEffect(() => {
        if ((examStarted && activeTab === "student") || (practiceStarted && activeTab === "practice")) {
            if (timeLeft <= 0) {
                if (activeTab === "student") submitExam(userAnswersRef.current);
                return;
            }
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [examStarted, timeLeft, examSubmitted, practiceStarted, activeTab]);

    // PREVENT ACCIDENTAL REFRESH IF UNSAVED QUESTIONS EXIST
    useEffect(() => {
        if (activeTab !== "teacher" || questions.length === 0 || isSaving) return;
        
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "You have unsaved questions. Are you sure you want to leave?";
        };
        
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [questions.length, activeTab, isSaving]);

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

                // ✅ FIX: socket leave is now INSIDE the cleanup return so it actually fires
                try {
                    const socket = getSocket();
                    if (socket) {
                        socket.emit("quiz:leave", {
                            quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),
                            studentId: user?._id || user?.id || "guest"
                        });
                    }
                } catch (e) { }
            };
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
        setAlreadySubmittedError("");
        try {
            // ── Step 1: Check re-attempt ──────────────────────────
            const attemptRes = await fetch(
                `${API_BASE}/quiz/${studentQuizCodeInput.trim().toUpperCase()}/check-attempt?registrationNumber=${encodeURIComponent(studentRegNoInput.trim().toUpperCase())}`
            );
            const attemptData = await attemptRes.json();
            if (attemptData.success && attemptData.alreadySubmitted) {
                setAlreadySubmittedError(
                    `Registration number "${studentRegNoInput.trim().toUpperCase()}" has already submitted this quiz. Re-attempts are not allowed.`
                );
                return;
            }
            // ── Step 2: Load quiz ─────────────────────────────────
            const res = await fetch(`${API_BASE}/quiz/${studentQuizCodeInput.trim().toUpperCase()}`);
            const data = await res.json();
            if (data.success) {
                const quizSettings = data.quiz.settings;
                const qs = quizSettings.randomizeQuestions
                    ? [...data.quiz.questions].sort(() => Math.random() - 0.5)
                    : data.quiz.questions;
                setJoinedQuiz({ ...data.quiz, questions: qs, settings: quizSettings });
                setExamSubmitted(false);
                setUserAnswers({});
                setCurrentQuestionIndex(0);
                setShowResult(false);
                setIsReviewingAnswers(false);
                setWarnings(0);
                try {
                    const socket = connectSocket();
                    const doJoin = () => socket.emit('quiz:join', {
                        quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),
                        studentId: user?._id || user?.id || 'guest',
                        studentName: user?.name || 'Student',
                        registrationNumber: studentRegNoInput.trim()
                    });
                    if (socket.connected) { doJoin(); } else { socket.once('connect', doJoin); }
                } catch (_e) { console.error("❌ Socket join error:", _e); }
            } else {
                setAlreadySubmittedError(data.message || "Invalid Quiz Code!");
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

    // ✅ FIX: accepts latestAnswers param so timer auto-submit passes fresh answers via ref
    const submitExam = async (latestAnswers) => {
        if (!joinedQuiz) return;
        const answersToUse = latestAnswers || userAnswers;
        let correctCount = 0;
        let totalScore = 0;
        const quizQs = joinedQuiz.questions;

        quizQs.forEach(q => {
            if (answersToUse[(q._id || q.id)] === q.correct) {
                correctCount++;
                totalScore += 1;
            } else if (answersToUse[(q._id || q.id)] !== undefined) {
                totalScore -= joinedQuiz.settings.negativeMarking;
            }
        });

        const finalScore = Math.max(0, (totalScore / quizQs.length) * 100);
        setScore(Math.round(finalScore));
        setExamSubmitted(true);
        setExamStarted(false);
        setShowResult(true);

        try {
            const submitRes = await fetch(`${API_BASE}/quiz/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),
                    score: Number(totalScore.toFixed(2)),
                    percentage: Math.round(finalScore),
                    totalQuestions: quizQs.length,
                    timeTaken: joinedQuiz.settings.timeLimit * 60 - timeLeft,
                    registrationNumber: studentRegNoInput.trim(),
                    studentName: user?.name || "Guest",
                    userAnswers: answersToUse,
                    codingSubmissions: codingSubmissions // 🔍 coding answers for teacher review
                })
            });
            const submitData = await submitRes.json();
            if (!submitRes.ok && submitData.message) {
                console.warn('Submit result:', submitData.message);
            }
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
            // Convert local datetime-local string to UTC ISO string
            const formatToUTC = (dateStr) => {
                if (!dateStr) return null;
                return new Date(dateStr).toISOString();
            };

            const formattedSettings = {
                ...settings,
                timeLimit: settings.timeLimit || 30,
                negativeMarking: settings.negativeMarking || 0,
                scheduledStart: formatToUTC(settings.scheduledStart),
                scheduledEnd: formatToUTC(settings.scheduledEnd)
            };

            const res = await fetch(`${API_BASE}/quiz/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Needed for auth/creatorId
                body: JSON.stringify({
                    title: quizTitle,
                    questions,
                    settings: formattedSettings,
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

        const loadedSettings = { ...quiz.settings };
        // Parse UTC timestamp back into local datetime-local format
        const formatFromUTC = (isoString) => {
            if (!isoString) return '';
            const d = new Date(isoString);
            const yyyy = d.getFullYear();
            const MM = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
        };

        loadedSettings.scheduledStart = formatFromUTC(loadedSettings.scheduledStart);
        loadedSettings.scheduledEnd = formatFromUTC(loadedSettings.scheduledEnd);

        setSettings(loadedSettings);
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
                    type: questionType,
                    count: aiQuestionCount || 5
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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            generateFromImage(base64String, file.type);
        };
        reader.readAsDataURL(file);
    };

    const generateFromImage = async (base64, mimeType) => {
        setIsParsingImage(true);
        try {
            const res = await fetch(`${API_BASE}/quiz/generate-from-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: base64,
                    mimeType: mimeType,
                    difficulty: settings.difficulty,
                    count: aiQuestionCount || 5
                })
            });
            const data = await res.json();

            if (data.success && data.questions) {
                setQuestions(prev => [...prev, ...data.questions]);
                alert(`${data.questions.length} questions generated from image!`);
            } else {
                alert("Failed to generate questions from image: " + (data.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Vision AI Gen Error:", err);
            alert("Error connecting to Vision AI service.");
        } finally {
            setIsParsingImage(false);
            if (document.getElementById('ai-image-upload')) {
                document.getElementById('ai-image-upload').value = '';
            }
        }
    };


    const generateAIQuestionsForPractice = async (isNext = false, correct = null) => {
        if (!studentPracticeTopic.trim()) {
            alert("Please enter a topic for AI practice questions.");
            return;
        }
        setIsGeneratingPractice(true);
        try {
            const currentDiff = isNext ? aiQuestions[aiQuestions.length - 1]?.difficulty : studentPracticeDifficulty;
            const res = await fetch(`${API_BASE}/quiz/adaptive-practice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: studentPracticeTopic,
                    currentDifficulty: currentDiff,
                    wasCorrect: correct
                })
            });
            const data = await res.json();

            if (data.success && data.question) {
                if (!isNext) {
                    setAiQuestions([data.question]);
                    setPracticeStarted(true);
                    setPracticeFinished(false);
                    setPracticeIndex(0);
                    setPracticeScore(0);
                    setPracticeAnswered(false);
                    setLastChosenPracticeOption(null);
                    setUserAnswers({}); 
                } else {
                    setAiQuestions(prev => [...prev, data.question]);
                    setPracticeIndex(prev => prev + 1);
                    setPracticeAnswered(false);
                    setLastChosenPracticeOption(null);
                }
            } else {
                alert("Failed to generate questions: " + (data.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Practice Gen Error:", err);
            alert("Error connecting to AI service.");
        } finally {
            setIsGeneratingPractice(false);
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
        if (!practiceAnswered) alert("You skipped this question.");
        
        if (practiceIndex + 1 >= practiceQuestionCount) {
            setPracticeFinished(true);
        } else {
            const wasCorrect = practiceAnswered && lastChosenPracticeOption === aiQuestions[practiceIndex].correct;
            generateAIQuestionsForPractice(true, wasCorrect);
        }
    };

    const handleAskDoubt = async (question) => {
        setIsExplaining(prev => ({...prev, [question._id || question.id]: true}));
        try {
            const userAnswerText = question.type === 'subjective' ? userAnswers[question._id || question.id] || "No answer" : question.options[userAnswers[question._id || question.id]] || "No option selected";
            const correctAnswerText = question.type === 'subjective' ? question.rubric : question.options[question.correct];
            const res = await fetch(`${API_BASE}/quiz/explain-answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question.question,
                    studentAnswer: userAnswerText,
                    correctAnswer: correctAnswerText
                })
            });
            const data = await res.json();
            if (data.success && data.explanation) {
                setAiExplanations(prev => ({...prev, [question._id || question.id]: data.explanation}));
            }
        } catch (e) {
            console.error("Doubt error:", e);
        } finally {
            setIsExplaining(prev => ({...prev, [question._id || question.id]: false}));
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

            {/* Teacher Preview Banner */}
            {isPreviewMode && (
                <div className="sticky top-0 z-[100] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">👁️</span>
                        <span className="font-bold uppercase tracking-wide text-sm">Teacher Preview Mode</span>
                        <span className="text-amber-100 text-xs">— This is exactly how students see the exam. No answers will be recorded.</span>
                    </div>
                    <button onClick={() => window.close()} className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-sm font-bold transition-all">
                        Close Preview
                    </button>
                </div>
            )}

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
                        { id: "teacher", label: "Create Quiz", icon: "FilePlus" },
                        { id: "practice", label: "AI Practice", icon: "Bot" },
                        { id: "leaderboard", label: "Leaderboard", icon: "Trophy" }
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
                        <BookOpen size={20} /> My Saved Quizzes
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
                                        <label className="flex items-center gap-2 cursor-pointer text-[var(--text-primary)] font-medium hover:text-cyan-400 transition-colors">
                                            <input
                                                type="radio"
                                                name="questionType"
                                                value="subjective"
                                                checked={questionType === "subjective"}
                                                onChange={() => { setQuestionType("subjective"); }}
                                                className="accent-violet-500 w-4 h-4"
                                            /> Subjective (AI Graded)
                                        </label>
                                    </div>
                                </div>


                                <textarea
                                    value={newQ}
                                    onChange={(e) => setNewQ(e.target.value)}
                                    placeholder="Enter your main question text here..."
                                    className="w-full p-4 bg-[var(--glass-bg)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] text-lg font-semibold mb-3 min-h-[120px] focus:border-cyan-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all duration-300 resize-y"
                                />

                                {/* LaTeX Math */}
                                <div className="mb-4">
                                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Math Equation (LaTeX, optional)</label>
                                    <input
                                        type="text"
                                        value={newQMathFormula}
                                        onChange={(e) => setNewQMathFormula(e.target.value)}
                                        placeholder="e.g. \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}"
                                        className="w-full p-3 bg-[var(--glass-bg)] border border-cyan-500/20 rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none transition-all font-mono text-sm"
                                    />
                                    {newQMathFormula && (
                                        <div className="mt-2 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-x-auto text-[var(--text-primary)]">
                                            <BlockMath math={newQMathFormula} />
                                        </div>
                                    )}
                                </div>

                                {/* Image URL for question */}
                                <div className="mb-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Image size={16} className="text-cyan-400" />
                                        <label className="text-[var(--text-secondary)] text-sm">Question Image URL (optional)</label>
                                    </div>
                                    <input
                                        type="url"
                                        value={newQImageUrl}
                                        onChange={(e) => setNewQImageUrl(e.target.value)}
                                        placeholder="https://... (paste any image URL)"
                                        className="w-full p-3 bg-[var(--glass-bg)] border border-cyan-500/20 rounded-xl text-[var(--text-primary)] text-sm focus:border-cyan-500 outline-none transition-all"
                                    />
                                    {newQImageUrl && (
                                        <div className="mt-2 rounded-xl overflow-hidden border border-cyan-500/20 max-h-48">
                                            <img src={newQImageUrl} alt="Question preview" className="w-full object-contain max-h-48 bg-black/10" onError={(e) => e.target.style.display='none'} />
                                        </div>
                                    )}
                                </div>

                                {/* Audio & Video URLs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                    <div>
                                        <label className="text-[var(--text-secondary)] text-sm mb-1 block">Audio URL (optional, MP3/WAV)</label>
                                        <input type="url" value={newQAudioUrl} onChange={e => setNewQAudioUrl(e.target.value)} placeholder="https://..." className="w-full p-3 bg-[var(--glass-bg)] border border-cyan-500/20 rounded-xl text-sm focus:border-cyan-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[var(--text-secondary)] text-sm mb-1 block">Video URL (optional, MP4)</label>
                                        <input type="url" value={newQVideoUrl} onChange={e => setNewQVideoUrl(e.target.value)} placeholder="https://..." className="w-full p-3 bg-[var(--glass-bg)] border border-cyan-500/20 rounded-xl text-sm focus:border-cyan-500 outline-none" />
                                    </div>
                                </div>

                                {questionType === 'subjective' ? (
                                    <div className="mb-6">
                                        <label className="text-[var(--text-secondary)] text-sm mb-2 block font-bold">Teacher's Rubric for AI Grading <Sparkles size={14} className="inline text-amber-500 ml-1" /></label>
                                        <textarea
                                            value={newQRubric}
                                            onChange={(e) => setNewQRubric(e.target.value)}
                                            placeholder="E.g., Award 5 points for mentioning 'photosynthesis', 3 points for 'sunlight'..."
                                            className="w-full p-4 bg-[var(--bg-secondary)] border border-amber-500/30 rounded-xl text-[var(--text-primary)] min-h-[100px] outline-none"
                                        />
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
                                    <h3 className="text-[var(--text-primary)] font-bold mb-2 flex items-center gap-2 text-xl">
                                        <Brain size={24} className="text-amber-500" /> Generate AI Questions
                                    </h3>
                                    {/* Difficulty indicator for AI generation */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-sm text-[var(--text-secondary)]">AI will generate</span>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${
                                            settings.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' :
                                            settings.difficulty === 'hard' ? 'bg-red-500/15 text-red-500 border-red-500/30' :
                                            'bg-amber-500/15 text-amber-500 border-amber-500/30'
                                        }`}>
                                            {settings.difficulty === 'easy' ? '🟢 Easy' : settings.difficulty === 'hard' ? '🔴 Hard' : '🟡 Medium'} questions
                                        </span>
                                        <span className="text-xs text-[var(--text-secondary)]">(Change in Quiz Settings →)</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                                        <input
                                            type="text"
                                            value={aiTeacherTopic}
                                            onChange={(e) => setAiTeacherTopic(e.target.value)}
                                            placeholder="Topic for AI questions (e.g., 'React Hooks')"
                                            className="flex-1 p-4 bg-[var(--glass-bg)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] focus:border-amber-500 outline-none transition-all duration-300"
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={aiQuestionCount}
                                            onChange={(e) => setAiQuestionCount(e.target.value === "" ? "" : Number(e.target.value))}
                                            placeholder="Count"
                                            className="w-full md:w-24 p-4 bg-[var(--glass-bg)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] focus:border-amber-500 outline-none text-center"
                                        />
                                        <button
                                            onClick={handleTeacherAIGeneration}
                                            disabled={isGenerating || isParsingImage}
                                            className="w-full md:w-auto px-6 py-4 bg-gradient-to-br from-amber-500 to-orange-600 text-[var(--text-primary)] font-bold rounded-xl shadow-lg transition-all hover:opacity-90 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
                                        >
                                            <Sparkles size={20} /> {isGenerating ? `Generating...` : "Generate with AI"}
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-px bg-cyan-500/20"></div>
                                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">OR</span>
                                        <div className="flex-1 h-px bg-cyan-500/20"></div>
                                    </div>

                                    <div className="mt-4">
                                        <label className={`
                                            w-full flex flex-col items-center justify-center py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
                                            ${isParsingImage ? 'border-amber-500/50 bg-amber-500/10' : 'border-cyan-500/30 bg-[var(--glass-bg)] hover:border-amber-500/50 hover:bg-black/20'}
                                        `}>
                                            <div className="flex flex-col items-center justify-center text-[var(--text-secondary)]">
                                                {isParsingImage ? (
                                                    <Sparkles size={32} className="mb-2 text-amber-500 animate-pulse" />
                                                ) : (
                                                    <Upload size={32} className="mb-2 text-cyan-400 group-hover:text-amber-500" />
                                                )}
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                    {isParsingImage ? 'Reading Image & Generating...' : 'Upload an Image to Generate Questions'}
                                                </p>
                                                <p className="text-xs opacity-70 mt-1">
                                                    (Textbook page, handwritten notes, diagram, etc.)
                                                </p>
                                            </div>
                                            <input 
                                                id="ai-image-upload" 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={handleImageUpload} 
                                                disabled={isParsingImage || isGenerating} 
                                            />
                                        </label>
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

                                        {/* Schedule Section */}
                                        <div className="pt-3 border-t border-[var(--border-color)] mt-1">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Calendar size={16} className="text-violet-400" />
                                                <span className="text-[var(--text-secondary)] text-sm font-semibold">Schedule Quiz (optional)</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="text-[var(--text-muted)] text-xs mb-1 block">Opens at</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={settings.scheduledStart}
                                                        onChange={(e) => setSettings({ ...settings, scheduledStart: e.target.value })}
                                                        className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm focus:border-violet-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[var(--text-muted)] text-xs mb-1 block">Closes at</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={settings.scheduledEnd}
                                                        onChange={(e) => setSettings({ ...settings, scheduledEnd: e.target.value })}
                                                        className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm focus:border-violet-500 outline-none"
                                                    />
                                                </div>
                                                {(settings.scheduledStart || settings.scheduledEnd) && (
                                                    <button onClick={() => setSettings({ ...settings, scheduledStart: '', scheduledEnd: '' })} className="text-xs text-red-400 hover:text-red-300 underline">Clear schedule</button>
                                                )}
                                            </div>
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
                                    <div key={(q._id || q.id)} className="bg-[var(--glass-bg)] p-5 rounded-xl border border-[var(--border-color)] hover:border-cyan-500/50 transition-colors group">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-cyan-400 font-bold">Q{idx + 1}:</span>
                                                    {q.difficulty && (
                                                        <span className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase border ${
                                                            q.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' :
                                                            q.difficulty === 'hard' ? 'bg-red-500/15 text-red-500 border-red-500/30' :
                                                            'bg-amber-500/15 text-amber-500 border-amber-500/30'
                                                        }`}>
                                                            {q.difficulty}
                                                        </span>
                                                    )}
                                                    {q.type === 'true-false' && (
                                                        <span className="text-xs px-2 py-0.5 rounded-md font-bold uppercase bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">T/F</span>
                                                    )}
                                                </div>
                                                <p className="text-lg font-medium text-[var(--text-primary)] mb-3">
                                                    {q.question}
                                                </p>
                                                {q.mathFormula && (
                                                    <div className="mb-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-x-auto text-[var(--text-primary)]">
                                                        <BlockMath math={q.mathFormula} />
                                                    </div>
                                                )}
                                                {q.imageUrl && (
                                                    <div className="mb-3 rounded-xl overflow-hidden border border-cyan-500/20 max-h-32">
                                                        <img src={q.imageUrl} alt="Q" className="object-contain max-h-32 w-full" onError={(e) => e.target.style.display='none'} />
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {q.options.map((opt, i) => (
                                                        <span key={i} className={`
                                                            px-3 py-2 rounded-lg text-sm font-medium border
                                                            ${i === q.correct
                                                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                                                : "bg-[var(--glass-bg)] border-[var(--border-color)] text-[var(--text-secondary)]"
                                                            }
                                                        `}>
                                                            {i === q.correct && '✓ '}{opt}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteQuestion((q._id || q.id))}
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

                {/* STUDENT EXAM */}
                {activeTab === "student" && (
                    <div className="min-h-[400px]">
                        {!joinedQuiz && (
                            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-16 border border-[var(--border-color)] shadow-xl text-center max-w-2xl mx-auto mt-10">
                                <Users size={80} className="text-cyan-400  mx-auto mb-6" />
                                <h2 className="text-4xl font-black text-[var(--text-primary)] mb-4">Join a Quiz</h2>
                                <p className="text-xl text-[var(--text-secondary)] mb-8">
                                    Enter the quiz code provided by your teacher to begin your exam.
                                </p>
                                <div className="flex flex-col gap-4 max-w-md mx-auto">
                                    <input
                                        type="text"
                                        value={studentQuizCodeInput}
                                        onChange={(e) => setStudentQuizCodeInput(e.target.value)}
                                        placeholder="Enter Code (e.g. SP1234)"
                                        className="w-full p-4 bg-[var(--bg-secondary)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] text-lg font-bold text-center focus:border-cyan-500 outline-none uppercase tracking-widest"
                                    />
                                    <input
                                        type="text"
                                        value={studentRegNoInput}
                                        onChange={(e) => setStudentRegNoInput(e.target.value)}
                                        placeholder="Registration Number (e.g. 122XXXXX)"
                                        className="w-full p-4 bg-[var(--bg-secondary)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] text-lg font-bold text-center focus:border-cyan-500 outline-none uppercase tracking-widest"
                                    />
                                </div>
                                <button
                                    onClick={joinQuiz}
                                    className="mt-6 px-12 py-4 bg-gradient-to-br from-cyan-500  to-pink-500 text-[var(--text-primary)] font-bold rounded-xl shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto text-lg"
                                >
                                    <ChevronRight size={24} /> Join Quiz
                                </button>

                                {/* Re-attempt block error */}
                                {alreadySubmittedError && (
                                    <div className="mt-6 p-4 bg-red-500/15 border border-red-500/40 rounded-xl text-red-400 font-semibold text-sm flex items-center gap-3 max-w-md mx-auto">
                                        <AlertCircle size={20} className="shrink-0" />
                                        {alreadySubmittedError}
                                    </div>
                                )}
                            </div>
                        )}

                        {joinedQuiz && !examStarted && !showResult && (
                            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-16 border border-[var(--border-color)] shadow-xl text-center max-w-3xl mx-auto mt-10">
                                <Trophy size={80} className="text-amber-500 mx-auto mb-6 animate-pulse" />
                                <h2 className="text-4xl font-black text-[var(--text-primary)] mb-4">Ready to Start?</h2>
                                <div className="flex flex-wrap justify-center gap-4 mb-8 text-lg font-medium text-[var(--text-secondary)]">
                                    <span className="px-4 py-2 bg-[var(--glass-bg)] rounded-lg border border-[var(--border-color)]">
                                        {joinedQuiz.questions.length} Questions
                                    </span>
                                    <span className="px-4 py-2 bg-[var(--glass-bg)] rounded-lg border border-[var(--border-color)]">
                                        {joinedQuiz.settings.timeLimit} Minutes
                                    </span>
                                    {joinedQuiz.settings.negativeMarking > 0 && (
                                        <span className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
                                            - {joinedQuiz.settings.negativeMarking} Neg. Marking
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
                                    className="px-12 py-5 bg-gradient-to-br from-emerald-500 to-emerald-700 text-[var(--text-primary)] font-bold rounded-2xl shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto text-xl"
                                >
                                    <PlayCircle size={32} /> Start Exam Now
                                </button>
                            </div>
                        )}

                        {examStarted && joinedQuiz && joinedQuiz.questions[currentQuestionIndex] && (
                            <div className="fixed inset-0 z-[200] bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-6 overflow-y-auto">
                                <div className="w-full max-w-5xl relative animate-fade-in-up">

                                    {/* Warnings Overlay */}
                                    {warnings > 0 && !isTabHidden && (
                                        <div className="absolute -top-24 left-0 w-full p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-700 dark:text-red-200 flex items-center justify-between gap-4 backdrop-blur-md animate-bounce">
                                            <div className="flex items-center gap-3">
                                                <AlertCircle size={32} className="text-red-500" />
                                                <div>
                                                    <h4 className="font-bold text-lg">Security Warning ({warnings}/3)</h4>
                                                    <p className="text-sm opacity-80">Do not switch tabs or exit fullscreen. Reaching the limit will auto-submit your exam.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* CHEATING BLOCKER OVERLAY - Shows instantly when they switch tabs/apps */}
                                    {isTabHidden && (
                                        <div className="fixed inset-0 z-[999] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-3xl">
                                            <AlertCircle size={100} className="text-red-500 mb-6 animate-pulse" />
                                            <h1 className="text-5xl font-black text-red-500 mb-4 text-center">EXAM PAUSED</h1>
                                            <p className="text-2xl text-white text-center mb-8 max-w-2xl">
                                                You have navigated away from the exam window. This has been recorded. Tab switching or opening other applications is strictly prohibited.
                                            </p>
                                        </div>
                                    )}

                                    {/* Exam Header */}
                                    <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-6 border border-[var(--border-color)] shadow-2xl mb-8 flex justify-between items-center">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500  to-indigo-600 flex items-center justify-center text-[var(--text-primary)] shadow-lg shadow-violet-500/20 select-none">
                                                <Brain size={32} />
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight select-none">{joinedQuiz.title || "Proctored Exam"}</h1>
                                                <div className="flex items-center gap-3 text-[var(--text-secondary)] font-medium text-sm mt-1">
                                                    <span className="px-2 py-0.5 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] uppercase text-xs tracking-wider">{joinedQuiz.settings.difficulty}</span>
                                                    <span>•</span>
                                                    <span>{currentQuestionIndex + 1} / {joinedQuiz.questions.length} Questions</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`
                                            flex items-center gap-3 px-6 py-3 rounded-xl bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] shadow-inner backdrop-blur-md
                                            ${timeLeft < 300 ? "text-red-500 animate-pulse border-red-500/30" : "text-emerald-400 border-emerald-500/20"}
                                        `}>
                                            <Timer size={28} />
                                            <span className="text-3xl font-mono font-black tracking-widest">{formatTime(timeLeft)}</span>
                                        </div>
                                    </div>

                                    {/* Question Card */}
                                    <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-10 border border-[var(--border-color)] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500  via-fuchsia-600 to-cyan-600"></div>

                                        <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-6 leading-relaxed tracking-wide select-none">
                                            {joinedQuiz.questions[currentQuestionIndex].question}
                                        </h3>

                                        {/* Math Equation */}
                                        {joinedQuiz.questions[currentQuestionIndex].mathFormula && (
                                            <div className="mb-6 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-x-auto text-2xl text-[var(--text-primary)] select-none">
                                                <BlockMath math={joinedQuiz.questions[currentQuestionIndex].mathFormula} />
                                            </div>
                                        )}

                                        {/* Question Image */}
                                        {joinedQuiz.questions[currentQuestionIndex].imageUrl && (
                                            <div className="mb-8 rounded-2xl overflow-hidden border border-cyan-500/20 bg-black/10">
                                                <img
                                                    src={joinedQuiz.questions[currentQuestionIndex].imageUrl}
                                                    alt="Question"
                                                    className="w-full object-contain max-h-72"
                                                    onError={(e) => e.target.style.display='none'}
                                                />
                                            </div>
                                        )}
                                        {joinedQuiz.questions[currentQuestionIndex].audioUrl && (
                                            <div className="mb-6 w-full max-w-md mx-auto">
                                                <audio controls className="w-full">
                                                    <source src={joinedQuiz.questions[currentQuestionIndex].audioUrl} type="audio/mpeg" />
                                                </audio>
                                            </div>
                                        )}
                                        {joinedQuiz.questions[currentQuestionIndex].videoUrl && (
                                            <div className="mb-6 rounded-2xl overflow-hidden border border-cyan-500/20 max-h-96 w-full max-w-2xl mx-auto">
                                                <video controls className="w-full object-contain max-h-96">
                                                    <source src={joinedQuiz.questions[currentQuestionIndex].videoUrl} type="video/mp4" />
                                                </video>
                                            </div>
                                        )}

                                        <div className="grid gap-4">
                                            {joinedQuiz.questions[currentQuestionIndex].type === 'subjective' ? (
                                                <textarea
                                                    value={userAnswers[(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)] || ""}
                                                    onChange={(e) => {
                                                        const newAnswers = { ...userAnswers, [(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)]: e.target.value };
                                                        setUserAnswers(newAnswers);
                                                    }}
                                                    placeholder="Type your detailed answer here..."
                                                    className="w-full p-6 bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] focus:border-cyan-500 rounded-2xl text-[var(--text-primary)] text-lg min-h-[150px] outline-none transition-all shadow-inner"
                                                />
                                            ) : (
                                                joinedQuiz.questions[currentQuestionIndex].options.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            const newAnswers = { ...userAnswers, [(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)]: i };
                                                            setUserAnswers(newAnswers);

                                                            let correctCount = 0;
                                                            joinedQuiz.questions.forEach((q) => {
                                                                if (newAnswers[(q._id || q.id)] === q.correct) correctCount++;
                                                            });
                                                            try {
                                                                const socket = getSocket();
                                                                if (socket && socket.connected) {
                                                                    socket.emit('quiz:progress', {
                                                                        quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),
                                                                        studentId: user?._id || user?.id || 'guest',
                                                                        correctAnswers: correctCount,
                                                                        totalQuestions: joinedQuiz.questions.length
                                                                    });
                                                                }
                                                            } catch (e) { console.error("Socket error on progress:", e); }
                                                        }}
                                                        className={`
                                                            w-full p-6 text-left rounded-2xl text-xl font-medium transition-all duration-200 border-2 relative group
                                                            ${userAnswers[(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)] === i
                                                                ? "bg-gradient-to-r from-cyan-500 /20 to-cyan-600/20 border-cyan-500 text-[var(--text-primary)] shadow-[0_0_30px_rgba(34,211,238,0.15)] transform scale-[1.01]"
                                                                : "bg-[var(--glass-bg)] border-transparent hover:bg-[var(--bg-secondary)] hover:border-cyan-500/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                                            }
                                                        `}
                                                    >
                                                        <span className={`
                                                            inline-flex items-center justify-center w-10 h-10 rounded-lg font-black mr-4 text-lg transition-colors
                                                            ${userAnswers[(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)] === i
                                                                ? "bg-cyan-500 text-[var(--text-primary)]"
                                                                : "bg-[var(--bg-secondary)] text-[var(--text-muted)] group-hover:bg-[var(--border-color)] group-hover:text-[var(--text-secondary)]"}
                                                        `}>
                                                            {String.fromCharCode(65 + i)}
                                                        </span>
                                                        {opt}

                                                        {userAnswers[(joinedQuiz.questions[currentQuestionIndex]._id || joinedQuiz.questions[currentQuestionIndex].id)] === i && (
                                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-cyan-400 animate-fade-in">
                                                                <CheckCircle size={28} />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))
                                            )}
                                        </div>

                                        <div className="flex justify-between mt-12 pt-8 border-t border-[var(--border-color)]">
                                            <button
                                                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                                disabled={currentQuestionIndex === 0}
                                                className="px-8 py-4 bg-[var(--glass-bg)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                            >
                                                <ArrowLeft size={20} /> Previous
                                            </button>

                                            {currentQuestionIndex < joinedQuiz.questions.length - 1 ? (
                                                <button
                                                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                                                    className="px-10 py-4 bg-gradient-to-br from-cyan-500  to-indigo-600 text-[var(--text-primary)] font-bold rounded-xl shadow-lg shadow-violet-500/20 hover:scale-105 hover:shadow-violet-500/40 transition-all flex items-center gap-2"
                                                >
                                                    Next Question <ChevronRight size={20} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={submitExam}
                                                    className="px-12 py-4 bg-gradient-to-br from-rose-500 to-red-600 text-[var(--text-primary)] font-bold rounded-xl shadow-lg shadow-red-500/30 hover:scale-105 hover:shadow-red-500/50 transition-all flex items-center gap-2"
                                                >
                                                    <Target size={20} /> Submit Exam
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showResult && joinedQuiz && joinedQuiz.settings.showResults && (
                            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-16 border border-[var(--border-color)] shadow-xl text-center max-w-2xl mx-auto mt-10 animate-fade-in-up">
                                <Award size={120} className="text-amber-500 mx-auto mb-6 animate-bounce" />
                                <h2 className="text-6xl font-black text-emerald-400 mb-4">{score}%</h2>
                                <p className="text-2xl text-[var(--text-primary)] font-bold mb-2">Excellent Work!</p>
                                <p className="text-xl text-[var(--text-secondary)] mb-8">
                                    You answered <span className="text-[var(--text-primary)] font-bold">{Object.values(userAnswers).filter((a, idx) => a === joinedQuiz.questions[idx]?.correct).length}</span> out of {joinedQuiz.questions.length} correctly.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    {joinedQuiz.settings.allowReview && (
                                        <button
                                            onClick={() => setIsReviewingAnswers(true)}
                                            className="px-8 py-4 bg-gradient-to-br from-cyan-500  to-blue-500 text-[var(--text-primary)] font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                                        >
                                            Review Answers
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setShowResult(false); setJoinedQuiz(null); setStudentQuizCodeInput(""); setStudentRegNoInput(""); setIsReviewingAnswers(false); }}
                                        className="px-8 py-4 bg-[var(--border-color)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--bg-secondary)] transition-all hover:scale-105"
                                    >
                                        Take Another Quiz
                                    </button>
                                </div>
                            </div>
                        )}

                        {showResult && joinedQuiz && !joinedQuiz.settings.showResults && (
                            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-16 border border-[var(--border-color)] shadow-xl text-center max-w-2xl mx-auto mt-10 animate-fade-in-up">
                                <CheckCircle size={120} className="text-emerald-500 mx-auto mb-6 animate-bounce" />
                                <h2 className="text-4xl font-black text-[var(--text-primary)] mb-4">Exam Submitted Successfully!</h2>
                                <p className="text-xl text-[var(--text-secondary)] mb-8">
                                    Your teacher has disabled instant results for this exam. Your responses have been recorded and saved.
                                </p>
                                <button
                                    onClick={() => { setShowResult(false); setJoinedQuiz(null); setStudentQuizCodeInput(""); setIsReviewingAnswers(false); }}
                                    className="px-8 py-4 bg-[var(--border-color)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--bg-secondary)] transition-all hover:scale-105"
                                >
                                    Return to Quizzes
                                </button>
                            </div>
                        )}

                        {/* REVIEW ANSWERS UI */}
                        {isReviewingAnswers && joinedQuiz && (
                            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-10 border border-[var(--border-color)] shadow-xl max-w-4xl mx-auto mt-10 animate-fade-in-up mb-10">
                                <div className="flex justify-between items-center mb-10 border-b border-[var(--border-color)] pb-6">
                                    <h2 className="text-4xl font-black text-[var(--text-primary)] flex items-center gap-3">
                                        <BookOpen className="text-cyan-400 " size={36} /> Review Answers
                                    </h2>
                                    <button
                                        onClick={() => setIsReviewingAnswers(false)}
                                        className="px-6 py-3 bg-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-xl font-bold flex items-center gap-2"
                                    >
                                        <ArrowLeft size={18} /> Back to Results
                                    </button>
                                </div>

                                <div className="space-y-8 text-left">
                                    {joinedQuiz.questions.map((q, idx) => {
                                        const userAnswerIdx = userAnswers[(q._id || q.id)];
                                        const isCorrect = userAnswerIdx === q.correct;
                                        const isSkipped = userAnswerIdx === undefined;

                                        return (
                                            <div key={(q._id || q.id)} className={`p-8 rounded-2xl border ${isCorrect ? "bg-emerald-500/10 border-emerald-500/30" :
                                                isSkipped ? "bg-amber-500/10 border-amber-500/30" : "bg-red-500/10 border-red-500/30"
                                                }`}>
                                                <h4 className="text-xl text-[var(--text-primary)] font-bold mb-6 flex items-start gap-3">
                                                    <span className={`px-3 py-1 rounded text-sm font-black ${isCorrect ? "bg-emerald-500 text-[var(--text-primary)]" :
                                                        isSkipped ? "bg-amber-500 text-[var(--text-primary)]" : "bg-red-500 text-[var(--text-primary)]"
                                                        }`}>
                                                        Q{idx + 1}
                                                    </span>
                                                    {q.question}
                                                </h4>

                                                <div className="grid gap-3 ml-12">
                                                    {q.type === 'subjective' ? (
                                                        <div className="p-4 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl relative flex flex-col">
                                                            <span className="text-[var(--text-secondary)] font-bold text-sm mb-1 text-cyan-500">Your Answer:</span>
                                                            <p className="text-[var(--text-primary)] italic mb-4">{userAnswers[(q._id || q.id)] || "Not answered"}</p>
                                                            <span className="text-[var(--text-secondary)] font-bold text-sm mb-1 text-emerald-500">Grading Rubric / Ideal Answer:</span>
                                                            <p className="text-[var(--text-primary)] font-medium text-emerald-400">{q.rubric || "No rubric provided."}</p>
                                                        </div>
                                                    ) : (
                                                        q.options.map((opt, optIdx) => {
                                                            const isThisUserAnswer = userAnswerIdx === optIdx;
                                                            const isThisCorrectAnswer = q.correct === optIdx;

                                                            let style = "bg-[var(--glass-bg)] border-[var(--border-color)] text-[var(--text-secondary)]"; // Default
                                                            let icon = null;

                                                            if (isThisCorrectAnswer) {
                                                                style = "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold";
                                                                icon = <CheckCircle size={20} className="text-emerald-400 absolute right-4" />;
                                                            } else if (isThisUserAnswer && !isThisCorrectAnswer) {
                                                                style = "bg-red-500/20 border-red-500 text-red-600 dark:text-red-300 font-bold";
                                                                icon = <XCircle size={20} className="text-red-400 absolute right-4" />;
                                                            }

                                                            return (
                                                                <div key={optIdx} className={`p-4 rounded-xl border relative flex items-center transition-all ${style}`}>
                                                                    <span className="font-bold mr-4 opacity-60 w-6">{String.fromCharCode(65 + optIdx)}.</span>
                                                                    {opt}
                                                                    {icon}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>

                                                {isSkipped && (
                                                    <div className="ml-12 mt-4 text-amber-500 font-bold flex items-center gap-2">
                                                        <AlertCircle size={18} /> You skipped this question.
                                                    </div>
                                                )}

                                                {/* AI Doubt Resolution */}
                                                {!isCorrect && !isSkipped && q.type !== 'subjective' && (
                                                    <div className="ml-12 mt-4">
                                                        {!aiExplanations[(q._id || q.id)] ? (
                                                            <button 
                                                                onClick={() => handleAskDoubt(q)}
                                                                disabled={isExplaining[(q._id || q.id)]}
                                                                className="flex items-center gap-2 text-sm px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-lg transition-all"
                                                            >
                                                                <Bot size={16} /> {isExplaining[(q._id || q.id)] ? "Asking AI..." : "Why is this correct?"}
                                                            </button>
                                                        ) : (
                                                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 rounded-lg animate-fade-in text-sm leading-relaxed">
                                                                <div className="font-bold text-indigo-400 mb-1 flex items-center gap-2"><Bot size={16}/> AI Explanation</div>
                                                                {aiExplanations[(q._id || q.id)]}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* AI PRACTICE */}
                {activeTab === "practice" && (
                    <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-8 border border-[var(--border-color)] shadow-[0_20px_60px_rgba(0,0,0,0.3)] min-h-[500px]">
                        {!practiceStarted ? (
                            <div className="text-center py-20 max-w-2xl mx-auto">
                                <Bot size={100} className="text-cyan-400  mx-auto mb-8" />
                                <h2 className="text-5xl font-black text-[var(--text-primary)] mb-6">AI Practice Arena</h2>
                                <p className="text-xl text-[var(--text-secondary)] mb-10">
                                    Generate unlimited AI-powered questions based on your preferred topic and difficulty.
                                </p>
                                <div className="space-y-4 max-w-md mx-auto mb-10">
                                    <input
                                        type="text"
                                        value={studentPracticeTopic}
                                        onChange={(e) => setStudentPracticeTopic(e.target.value)}
                                        placeholder="Enter topic (e.g., 'React Hooks')"
                                        className="w-full p-4 bg-[var(--bg-secondary)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] text-lg focus:border-cyan-500 outline-none transition-all"
                                    />
                                    <select
                                        value={studentPracticeDifficulty}
                                        onChange={(e) => setStudentPracticeDifficulty(e.target.value)}
                                        className="w-full p-4 bg-[var(--bg-secondary)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] text-lg focus:border-cyan-500 outline-none transition-all"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={practiceQuestionCount}
                                        onChange={(e) => setPracticeQuestionCount(e.target.value === "" ? "" : Number(e.target.value))}
                                        placeholder="Number of Questions"
                                        className="w-full p-4 bg-[var(--bg-secondary)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] text-lg focus:border-cyan-500 outline-none transition-all"
                                    />
                                </div>
                                <button
                                    onClick={generateAIQuestionsForPractice}
                                    className="px-12 py-5 bg-gradient-to-br from-cyan-500  to-indigo-600 text-[var(--text-primary)] font-bold rounded-2xl shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-105 hover:shadow-violet-500/50 flex items-center gap-3 mx-auto text-xl"
                                >
                                    <Sparkles size={24} /> Generate Questions
                                </button>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto py-10 animate-fade-in">
                                {!practiceFinished ? (
                                    <>
                                        <div className="flex justify-between items-center mb-10">
                                            <div className="text-cyan-400  font-bold text-lg">
                                                Question {practiceIndex + 1} <span className="text-[var(--text-muted)]">of</span> {aiQuestions.length}
                                            </div>
                                            <div className="px-6 py-2 bg-[var(--bg-secondary)] rounded-full border border-cyan-500/30 text-amber-500 font-bold text-lg shadow-lg">
                                                Score: {practiceScore} / {practiceIndex + (practiceAnswered ? 1 : 0)}
                                            </div>
                                        </div>

                                        <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-10 leading-relaxed">
                                            {aiQuestions[practiceIndex].question}
                                        </h3>

                                        <div className="grid gap-4 mb-10">
                                            {aiQuestions[practiceIndex].options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => answerPractice(i, aiQuestions[practiceIndex].id)}
                                                    disabled={practiceAnswered}
                                                    className={`
                                                        w-full p-6 text-left rounded-xl text-lg font-medium transition-all duration-300 border-2 relative
                                                        ${practiceAnswered
                                                            ? i === aiQuestions[practiceIndex].correct
                                                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-100"
                                                                : i === lastChosenPracticeOption
                                                                    ? "bg-red-500/20 border-red-500 text-red-700 dark:text-red-100"
                                                                    : "bg-[var(--glass-bg)] border-transparent opacity-50"
                                                            : "bg-[var(--glass-bg)] border-transparent hover:bg-[var(--bg-secondary)] hover:border-cyan-500/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                                        }
                                                    `}
                                                >
                                                    <span className="font-bold mr-4 opacity-70 w-6 inline-block">
                                                        {String.fromCharCode(65 + i)}.
                                                    </span>
                                                    {opt}
                                                    {practiceAnswered && i === aiQuestions[practiceIndex].correct &&
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-emerald-400 font-bold">
                                                            <CheckCircle size={24} /> Correct
                                                        </div>
                                                    }
                                                    {practiceAnswered && i === lastChosenPracticeOption && i !== aiQuestions[practiceIndex].correct &&
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-red-500 font-bold">
                                                            <XCircle size={24} /> Incorrect
                                                        </div>
                                                    }
                                                </button>
                                            ))}
                                        </div>

                                        {practiceAnswered && (
                                            <div className="bg-[var(--glass-bg)] p-6 rounded-xl border-l-4 border-cyan-500 mb-10 animate-slide-up">
                                                <h4 className="text-cyan-400  font-bold mb-2 flex items-center gap-2 text-lg">
                                                    <Lightbulb size={24} className="text-yellow-400" /> AI Feedback
                                                </h4>
                                                <p className="text-[var(--text-secondary)] leading-relaxed">
                                                    The correct answer is <span className="font-bold text-[var(--text-primary)]">Option {String.fromCharCode(65 + aiQuestions[practiceIndex].correct)}</span>.
                                                </p>
                                            </div>
                                        )}


                                        <div className="text-center">
                                            <button
                                                onClick={nextPracticeQuestion}
                                                disabled={!practiceAnswered && practiceIndex < aiQuestions.length - 1}
                                                className={`
                                                    px-10 py-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-[var(--text-primary)] font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 text-lg flex items-center gap-2 mx-auto
                                                    ${(!practiceAnswered && practiceIndex < aiQuestions.length - 1) ? "opacity-50 cursor-not-allowed grayscale" : "hover:scale-105"}
                                                `}
                                            >
                                                {practiceIndex === aiQuestions.length - 1 ? "Finish & View Results" : "Next Question"} <ChevronRight size={24} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center animate-fade-in-up">
                                        <Award size={100} className="text-amber-500 mx-auto mb-6 animate-bounce" />
                                        <h2 className="text-4xl font-black text-[var(--text-primary)] mb-2">Practice Complete!</h2>
                                        <p className="text-xl text-[var(--text-secondary)] mb-8">
                                            Final Score: <span className="text-emerald-400 font-bold">{practiceScore}</span> / {aiQuestions.length}
                                        </p>

                                        <div className="space-y-6 text-left max-w-3xl mx-auto mb-10">
                                            {aiQuestions.map((q, idx) => {
                                                const userAnswerIdx = userAnswers[(q._id || q.id)];
                                                const isCorrect = userAnswerIdx === q.correct;
                                                return (
                                                    <div key={(q._id || q.id)} className={`p-6 rounded-xl border ${isCorrect ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                                                        <h4 className="text-[var(--text-primary)] font-bold mb-3 flex items-start gap-2">
                                                            <span className="opacity-50">Q{idx + 1}.</span> {q.question}
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className={`flex items-center gap-2 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                                                                <span className="font-bold w-20">You:</span>
                                                                {q.options[userAnswerIdx]} ({isCorrect ? "Correct" : "Incorrect"})
                                                            </div>
                                                            {!isCorrect && (
                                                                <div className="flex items-center gap-2 text-emerald-400">
                                                                    <span className="font-bold w-20">Correct:</span>
                                                                    {q.options[q.correct]}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => { setPracticeStarted(false); setAiQuestions([]); setPracticeFinished(false); }}
                                            className="px-10 py-4 bg-[var(--border-color)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--bg-secondary)] transition-all hover:scale-105"
                                        >
                                            Start New Practice
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* LEADERBOARD */}
                {activeTab === "leaderboard" && (
                    <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-8 border border-[var(--border-color)] shadow-xl max-w-5xl mx-auto">
                        <h2 className="text-3xl font-black text-[var(--text-primary)] mb-8 flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
                            <Trophy size={40} className="text-amber-500" /> Global Leaderboard
                        </h2>
                        <div className="flex flex-col gap-2">
                            {leaderboard.length === 0 ? (
                                <div className="text-center py-20 bg-[var(--glass-bg)] rounded-2xl border border-[var(--border-color)] animate-fade-in">
                                    <div className="text-6xl mb-6 animate-float">🏆</div>
                                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Be the First Champion!</h3>
                                    <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">No scores recorded yet. Take a quiz now to claim the throne and set the standard for others.</p>
                                    <button
                                        onClick={() => setActiveTab('student')}
                                        className="px-8 py-3 bg-gradient-to-r from-cyan-500  to-indigo-600 rounded-xl font-bold text-[var(--text-primary)] shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300"
                                    >
                                        Start a Quiz Now
                                    </button>
                                </div>
                            ) : (
                                leaderboard.map((player, idx) => (
                                    <div
                                        key={player.id || idx}
                                        className={`
                                        flex items-center gap-6 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.01]
                                        ${player.isYou
                                                ? "bg-cyan-500 /20 border border-cyan-500/30 shadow-[0_0_30px_rgba(139,92,246,0.1)]"
                                                : "bg-[var(--glass-bg)] border border-[var(--border-color)] hover:bg-[var(--glass-bg)]"
                                            }
                                    `}
                                    >
                                        <div className="w-16 flex justify-center text-3xl font-black">
                                            {player.rank === 1 ? <Crown size={40} className="text-amber-400 animate-bounce" />
                                                : player.rank === 2 ? <div className="relative"><Crown size={36} className="text-[var(--text-secondary)]" /><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-primary)]">2</span></div>
                                                    : player.rank === 3 ? <div className="relative"><Crown size={32} className="text-amber-700" /><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-primary)]">3</span></div>
                                                        : <span className="text-[var(--text-muted)]">#{player.rank}</span>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold text-[var(--text-primary)]">{player.name}</h3>
                                                {player.isYou && <span className="px-2 py-0.5 bg-cyan-500  text-[var(--text-primary)] text-xs font-bold rounded uppercase tracking-wider">You</span>}
                                            </div>
                                            <div className="flex gap-6 text-sm font-medium text-[var(--text-secondary)]">
                                                <span className="flex items-center gap-1.5"><Clock size={16} className="text-cyan-400" /> {player.time}</span>
                                                <span className="flex items-center gap-1.5"><Flame size={16} className="text-orange-500" /> {player.streak} Streak</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-[var(--text-primary)]">{player.score}%</div>
                                            <div className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Score</div>
                                        </div>
                                        <div className="w-12 flex justify-center">
                                            {player.rank <= 3 && <Trophy size={28} className={player.rank === 1 ? "text-amber-400" : player.rank === 2 ? "text-[var(--text-secondary)]" : "text-amber-700"} />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
