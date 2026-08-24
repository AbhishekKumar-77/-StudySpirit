import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { API_BASE } from "../config";
import { codeExecutionEngine } from "../services/codeExecutionEngine";
import {
    ArrowLeft, Play, Download, Upload, Copy, Trash2, Terminal,
    Settings, Code, FileText, Save, FolderOpen, Zap,
    CheckCircle, Sparkles, RotateCcw, ChevronLeft, ChevronRight,
    Trophy, Target, Hash, AlertCircle, MessageSquare, Clock,
    Loader, Shield, Star, XCircle, Bookmark
} from "lucide-react";

const normalizeOutput = (str) => {
    return (str || '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim()
        .split('\n')
        .map(line => line.trim())
        .join('\n');
};

const LANGUAGES = [
    { id: "javascript", name: "JavaScript", ext: "js", defaultCode: '// JavaScript\nconsole.log("Hello, World!");\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("StudySpirit"));' },
    { id: "python", name: "Python", ext: "py", defaultCode: '# Python\nprint("Hello, World!")\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("StudySpirit"))' },
    { id: "typescript", name: "TypeScript", ext: "ts", defaultCode: '// TypeScript\ninterface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = { name: "John", age: 25 };\nconsole.log(`${user.name} is ${user.age} years old`);' },
    { id: "java", name: "Java", ext: "java", defaultCode: '// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
    { id: "cpp", name: "C++", ext: "cpp", defaultCode: '// C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
    { id: "c", name: "C", ext: "c", defaultCode: '// C\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
];

const THEMES = [
    { id: "vs-dark", name: "Dark (VS Code)" },
    { id: "light", name: "Light" },
    { id: "hc-black", name: "High Contrast" },
];

export default function CodeEditor() {
    const navigate = useNavigate();
    const location = useLocation();

    // Support both old single-problem and new multi-challenge format
    const challenges = location.state?.challenges || [];
    const sessionId = location.state?.sessionId || null;
    const legacyProblem = location.state?.problem;
    const isChallengeMode = challenges.length > 0 || !!legacyProblem;

    // If old format (single problem), convert to array
    const allChallenges = challenges.length > 0
        ? challenges
        : legacyProblem
            ? [legacyProblem]
            : [];

    const totalQuestions = allChallenges.length;

    // Current question index
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentProblem = allChallenges[currentIndex] || null;

    // Per-question code storage mapping language to code
    const [codePerQuestion, setCodePerQuestion] = useState(() => {
        return allChallenges.map(ch => {
            const langStates = {};
            LANGUAGES.forEach(l => {
                langStates[l.id] = l.defaultCode;
            });
            const chLang = (LANGUAGES.find(l => l.id === ch.language) || LANGUAGES[0]).id;
            if (ch.userCode) langStates[chLang] = ch.userCode;
            else if (ch.starterCode) langStates[chLang] = ch.starterCode;
            return langStates;
        });
    });

    // Scratchpad mode per-language code storage
    const [scratchpadCodes, setScratchpadCodes] = useState(() => {
        const states = {};
        LANGUAGES.forEach(l => states[l.id] = l.defaultCode);
        return states;
    });

    // Per-question output storage
    const [outputPerQuestion, setOutputPerQuestion] = useState(() =>
        allChallenges.map(() => "")
    );

    // Track completed questions
    const [completedQuestions, setCompletedQuestions] = useState(() =>
        allChallenges.map(ch => ch.status === 'solved' || false)
    );

    const editorRef = useRef(null);
    const [language, setLanguage] = useState(() => {
        if (currentProblem?.language) return LANGUAGES.find(l => l.id === currentProblem.language) || LANGUAGES[0];
        return LANGUAGES[0];
    });
    const [code, setCode] = useState(() => {
        if (totalQuestions > 0) {
            const langId = currentProblem?.language
                ? (LANGUAGES.find(l => l.id === currentProblem.language) || LANGUAGES[0]).id
                : LANGUAGES[0].id;
            return codePerQuestion[0][langId];
        }
        return scratchpadCodes[LANGUAGES[0].id];
    });
    const [theme] = useState("light");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionMode, setExecutionMode] = useState(() => {
        return localStorage.getItem("codeeditor_execution_mode") || "local";
    });
    const [loadingEngine, setLoadingEngine] = useState(false);
    const [engineProgress, setEngineProgress] = useState("");
    const [fontSize, setFontSize] = useState(14);
    const [showSettings, setShowSettings] = useState(false);
    const [savedFiles, setSavedFiles] = useState(() => {
        try { return JSON.parse(localStorage.getItem("codeeditor_files") || "[]"); }
        catch { return []; }
    });
    const [currentFileName, setCurrentFileName] = useState("untitled");
    const [stdin, setStdin] = useState(() => {
        // Auto-fill stdin with first test case input
        const firstChallenge = (challenges.length > 0 ? challenges : legacyProblem ? [legacyProblem] : [])[0];
        return firstChallenge?.testCases?.[0]?.input || "";
    });
    const [tcOutputs, setTcOutputs] = useState({}); // per-tc output: { tcIndex: {stdout, running} }

    // Timer state
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const timerRef = useRef(null);

    // Auto-verification state
    const [verificationResults, setVerificationResults] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);

    // AI Review state
    const [reviewData, setReviewData] = useState(null);
    const [isReviewing, setIsReviewing] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [showQuestionNav, setShowQuestionNav] = useState(false);

    // Secure Mode state
    const isSecureMode = location.state?.secureMode || false;
    const [warnings, setWarnings] = useState(0);
    const [isTabHidden, setIsTabHidden] = useState(false);
    const [fullscreenActive, setFullscreenActive] = useState(false);

    // Timer effect
    useEffect(() => {
        if (isChallengeMode && !completedQuestions[currentIndex]) {
            setTimerActive(true);
        } else {
            setTimerActive(false);
        }
    }, [currentIndex, isChallengeMode]);

    useEffect(() => {
        if (timerActive) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [timerActive]);

    // Secure browser mode hooks
    useEffect(() => {
        if (isSecureMode && isChallengeMode) {
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
                    alert("Secure Mode: Fullscreen access is recommended.");
                }
            };
            if (!document.fullscreenElement) enterFullscreen();

            const handleVisibilityChange = () => {
                const hidden = document.hidden;
                setIsTabHidden(hidden);
                if (hidden) {
                    setWarnings(prev => {
                        const newCount = prev + 1;
                        if (newCount >= 3) {
                            alert("Violation Limit Reached! Suspicious activity detected.");
                        } else {
                            alert("WARNING: Tab switching is strictly prohibited in Secure Mode! Please return to your editor.");
                        }
                        return newCount;
                    });
                }
            };

            const handleContextMenu = (e) => e.preventDefault();
            const handleCopyPaste = (e) => {
                e.preventDefault();
                alert("Copy/Paste is disabled in Secure Mode.");
            };
            const handleKeyDown = (e) => {
                if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                    (e.ctrlKey && e.key === 'c') || (e.ctrlKey && e.key === 'v') ||
                    e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && e.key === 's')) {
                    e.preventDefault();
                    alert("Keyboard shortcuts and screenshots are disabled in Secure Mode!");
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);
            document.addEventListener('contextmenu', handleContextMenu);
            document.addEventListener('copy', handleCopyPaste);
            document.addEventListener('paste', handleCopyPaste);
            window.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                document.removeEventListener('contextmenu', handleContextMenu);
                document.removeEventListener('copy', handleCopyPaste);
                document.removeEventListener('paste', handleCopyPaste);
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isSecureMode, isChallengeMode]);

    // Reset timer and verification when switching questions
    useEffect(() => {
        setElapsedTime(0);
        setVerificationResults(null);
        setReviewData(null);
        setShowReview(false);
        setTcOutputs({});
        // Auto-fill stdin with first test case for new question
        const ch = allChallenges[currentIndex];
        if (ch?.testCases?.[0]?.input) setStdin(ch.testCases[0].input);
    }, [currentIndex]);

    // Sync code/output when switching questions
    useEffect(() => {
        if (totalQuestions > 0 && currentIndex < totalQuestions) {
            const ch = allChallenges[currentIndex];
            setOutput(outputPerQuestion[currentIndex] || "");
            if (ch?.language) {
                const lang = LANGUAGES.find(l => l.id === ch.language);
                if (lang) {
                    setLanguage(lang);
                    setCode(codePerQuestion[currentIndex][lang.id]);
                } else {
                    setCode(codePerQuestion[currentIndex][language.id]);
                }
            } else {
                setCode(codePerQuestion[currentIndex][language.id]);
            }
        }
    }, [currentIndex]);

    // Save code for current question before switching
    const saveCurrentCode = () => {
        setOutputPerQuestion(prev => {
            const updated = [...prev];
            updated[currentIndex] = output;
            return updated;
        });
    };

    const goToQuestion = (index) => {
        if (index < 0 || index >= totalQuestions) return;
        saveCurrentCode();
        setCurrentIndex(index);
    };

    const goNext = () => goToQuestion(currentIndex + 1);
    const goPrev = () => goToQuestion(currentIndex - 1);

    const formatTimer = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const markCompleted = async () => {
        setTimerActive(false);
        setCompletedQuestions(prev => {
            const updated = [...prev];
            updated[currentIndex] = true;
            return updated;
        });

        if (sessionId && currentProblem?.id) {
            try {
                await fetch(`${API_BASE}/codespirit/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        sessionId,
                        challengeId: currentProblem.id,
                        code,
                        status: 'solved',
                        solveTime: elapsedTime
                    })
                });
            } catch (err) {
                console.error("Sync failed", err);
            }
        }
    };

    // Auto-verify against test cases
    const verifyCode = async () => {
        if (!sessionId || !currentProblem?.id) return;
        setIsVerifying(true);
        setVerificationResults(null);
        try {
            const data = await codeExecutionEngine.verify(language.id, code, currentProblem.testCases || [], {
                mode: executionMode,
                sessionId,
                challengeId: currentProblem.id,
                functionName: currentProblem.functionName || 'solution',
                onLoadStart: (msg) => {
                    setLoadingEngine(true);
                    setEngineProgress(msg);
                },
                onLoadProgress: (msg) => {
                    setEngineProgress(msg);
                },
                onLoadEnd: () => {
                    setLoadingEngine(false);
                }
            });

            setLoadingEngine(false);

            if (data.success) {
                setVerificationResults(data);
                if (data.allPassed) {
                    markCompleted();
                }
            } else {
                setVerificationResults({ results: [], allPassed: false, message: data.message || 'Verification failed' });
            }
        } catch (err) {
            setVerificationResults({ results: [], allPassed: false, message: 'Verification error: ' + err.message });
        } finally {
            setIsVerifying(false);
        }
    };

    // AI Code Review
    const requestReview = async () => {
        if (!currentProblem) return;
        setIsReviewing(true);
        setShowReview(true);
        try {
            const res = await fetch(`${API_BASE}/codespirit/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    code,
                    language: language.id,
                    problemTitle: currentProblem.title,
                    problemDescription: currentProblem.description,
                    allTestsPassed: verificationResults?.allPassed || false
                })
            });
            const data = await res.json();
            if (data.success) {
                setReviewData(data.review);
            } else {
                setReviewData({ overallFeedback: data.message || 'Review failed', score: 0 });
            }
        } catch (err) {
            setReviewData({ overallFeedback: 'Network error: ' + err.message, score: 0 });
        } finally {
            setIsReviewing(false);
        }
    };

    const handleBookmarkProblem = async () => {
        if (!currentProblem) return;
        try {
            const res = await fetch(`${API_BASE}/codespirit/save-problem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    problem: {
                        title: currentProblem.title,
                        topic: currentProblem.topic || location.state?.topic || 'Coding Challenge',
                        difficulty: currentProblem.difficulty || 'medium',
                        language: language.id,
                        description: currentProblem.description,
                        starterCode: currentProblem.starterCode || code,
                        testCases: currentProblem.testCases || []
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message || "Problem bookmarked!");
            }
        } catch (e) {
            alert("Failed to bookmark problem: " + e.message);
        }
    };

    const handleEditorMount = (editor) => { editorRef.current = editor; };

    // Run code with a specific test case's input and store the result inline
    const runWithTestCase = async (tcIndex, tcInput) => {
        setTcOutputs(prev => ({ ...prev, [tcIndex]: { running: true, stdout: null, stderr: null } }));
        try {
            const result = await codeExecutionEngine.execute(language.id, code, tcInput || '', {
                mode: executionMode,
                onLoadStart: (msg) => {
                    setLoadingEngine(true);
                    setEngineProgress(msg);
                },
                onLoadProgress: (msg) => {
                    setEngineProgress(msg);
                },
                onLoadEnd: () => {
                    setLoadingEngine(false);
                }
            });

            setLoadingEngine(false);

            if (result.success && result.run) {
                setTcOutputs(prev => ({
                    ...prev,
                    [tcIndex]: {
                        running: false,
                        stdout: result.run.stdout?.trim() || '',
                        stderr: result.run.stderr?.trim() || '',
                        exitCode: result.run.exitCode
                    }
                }));
            } else {
                setTcOutputs(prev => ({ ...prev, [tcIndex]: { running: false, stderr: result.message || 'Error', stdout: null } }));
            }
        } catch (e) {
            setTcOutputs(prev => ({ ...prev, [tcIndex]: { running: false, stderr: e.message, stdout: null } }));
        }
    };

    const runCode = async () => {
        setIsRunning(true);
        setOutput("⏳ Compiling & Running...\n");

        try {
            const result = await codeExecutionEngine.execute(language.id, code, stdin, {
                mode: executionMode,
                onLoadStart: (msg) => {
                    setLoadingEngine(true);
                    setEngineProgress(msg);
                },
                onLoadProgress: (msg) => {
                    setEngineProgress(msg);
                },
                onLoadEnd: () => {
                    setLoadingEngine(false);
                }
            });

            setLoadingEngine(false);

            if (result.success && result.run) {
                const out = result.run.stdout || "";
                const err = result.run.stderr || "";
                const finalOutput = (out ? `✅ Output:\n${out}` : "") + (err ? `\n❌ Errors:\n${err}` : "") || "✅ Code executed (no output)";
                setOutput(finalOutput);
                setOutputPerQuestion(prev => { const u = [...prev]; u[currentIndex] = finalOutput; return u; });
            } else {
                setOutput(`❌ Execution failed: ${result.message || "Unknown error"}`);
            }
        } catch (e) {
            setOutput(`❌ Error: ${e.message}`);
        }
        setIsRunning(false);
    };

    const changeLanguage = (langId) => {
        const lang = LANGUAGES.find(l => l.id === langId);
        if (lang) {
            setLanguage(lang);
            if (totalQuestions > 0) {
                setCode(codePerQuestion[currentIndex][lang.id] || lang.defaultCode);
            } else {
                setCode(scratchpadCodes[lang.id] || lang.defaultCode);
            }
            setOutput("");
        }
    };

    const copyCode = () => { navigator.clipboard.writeText(code); alert("Code copied!"); };

    const downloadCode = () => {
        const blob = new Blob([code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentFileName}.${language.ext}`;
        a.click();
    };

    const saveFile = () => {
        const name = prompt("Enter file name:", currentFileName) || currentFileName;
        const file = { name, language: language.id, code, savedAt: Date.now() };
        const updated = [...savedFiles.filter(f => f.name !== name), file];
        setSavedFiles(updated);
        setCurrentFileName(name);
        localStorage.setItem("codeeditor_files", JSON.stringify(updated));
        alert(`Saved: ${name}.${language.ext}`);
    };

    const loadFile = (file) => {
        const lang = LANGUAGES.find(l => l.id === file.language);
        if (lang) { setLanguage(lang); setCode(file.code); setCurrentFileName(file.name); setOutput(""); }
    };

    const deleteFile = (name) => {
        const updated = savedFiles.filter(f => f.name !== name);
        setSavedFiles(updated);
        localStorage.setItem("codeeditor_files", JSON.stringify(updated));
    };

    const clearOutput = () => setOutput("");
    const resetCode = () => {
        if (currentProblem?.starterCode && currentProblem.language === language.id) {
            setCode(currentProblem.starterCode);
        } else {
            setCode(language.defaultCode);
        }
        setOutput("");
    };

    // Export challenge + code as PDF
    const exportPDF = () => {
        const escapeHtml = (str) => str?.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || '';
        const now = new Date().toLocaleString();
        const title = currentProblem?.title || currentFileName;

        let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${escapeHtml(title)} - StudySpirit</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
        .header { border-bottom: 3px solid #6366f1; padding-bottom: 16px; margin-bottom: 30px; }
        .header h1 { font-size: 28px; color: #6366f1; margin-bottom: 4px; }
        .header .meta { font-size: 13px; color: #64748b; }
        .badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-easy { background: #d1fae5; color: #065f46; }
        .badge-medium { background: #fef3c7; color: #92400e; }
        .badge-hard { background: #fee2e2; color: #991b1b; }
        .section { margin-bottom: 28px; }
        .section-title { font-size: 16px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-left: 4px solid #6366f1; padding-left: 12px; }
        .description { font-size: 15px; white-space: pre-wrap; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
        .test-case { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-family: 'Consolas', 'Courier New', monospace; font-size: 13px; }
        .test-case .label { font-weight: 700; color: #64748b; font-size: 11px; text-transform: uppercase; margin-bottom: 2px; }
        .test-case .value { color: #0f172a; }
        .test-case .output { color: #16a34a; font-weight: 600; }
        .hints { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; }
        .hints li { margin-bottom: 6px; font-size: 14px; color: #92400e; }
        .code-block { background: #0f172a; color: #e2e8f0; border-radius: 8px; padding: 20px; font-family: 'Consolas', 'Fira Code', 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word; line-height: 1.5; }
        .output-block { background: #022c22; color: #4ade80; border-radius: 8px; padding: 16px; font-family: 'Consolas', monospace; font-size: 13px; white-space: pre-wrap; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
        @media print { body { padding: 20px; } .code-block { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .output-block { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">
            <span>Language: <strong>${language.name}</strong></span>
            &nbsp;&bull;&nbsp;
            <span>Date: ${now}</span>
            ${currentProblem?.difficulty ? `&nbsp;&bull;&nbsp;<span class="badge badge-${currentProblem.difficulty}">${currentProblem.difficulty}</span>` : ''}
            ${totalQuestions > 1 ? `&nbsp;&bull;&nbsp;<span>Question ${currentIndex + 1} of ${totalQuestions}</span>` : ''}
        </div>
    </div>`;

        // Problem description
        if (currentProblem?.description) {
            htmlContent += `
    <div class="section">
        <div class="section-title">Problem Statement</div>
        <div class="description">${escapeHtml(currentProblem.description)}</div>
    </div>`;
        }

        // Test cases
        if (currentProblem?.testCases?.length > 0) {
            htmlContent += `
    <div class="section">
        <div class="section-title">Test Cases</div>`;
            currentProblem.testCases.forEach((tc, i) => {
                htmlContent += `
        <div class="test-case">
            <div class="label">Test Case ${i + 1}</div>
            <div class="value">Input: ${escapeHtml(tc.input)}</div>
            <div class="output">Expected Output: ${escapeHtml(tc.output)}</div>
        </div>`;
            });
            htmlContent += `\n    </div>`;
        }

        // Hints
        if (currentProblem?.hints?.length > 0) {
            htmlContent += `
    <div class="section">
        <div class="section-title">Hints</div>
        <div class="hints"><ul>`;
            currentProblem.hints.forEach(h => {
                htmlContent += `<li>${escapeHtml(h)}</li>`;
            });
            htmlContent += `</ul></div>\n    </div>`;
        }

        // Your code
        htmlContent += `
    <div class="section">
        <div class="section-title">Your Solution (${language.name})</div>
        <div class="code-block">${escapeHtml(code)}</div>
    </div>`;

        // Output
        if (output) {
            htmlContent += `
    <div class="section">
        <div class="section-title">Output</div>
        <div class="output-block">${escapeHtml(output)}</div>
    </div>`;
        }

        htmlContent += `
    <div class="footer">
        Generated by StudySpirit Code Editor &bull; ${now}
    </div>
</body>
</html>`;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    const completedCount = completedQuestions.filter(Boolean).length;

    return (
        <div className="min-h-screen font-sans bg-gray-100 text-gray-900">
            
            {/* Global Loader for Client-Side Engines */}
            {loadingEngine && (
                <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6">
                    <div className="glass-card p-8 rounded-2xl max-w-sm w-full text-center border-cyan-500/30 flex flex-col items-center justify-center relative overflow-hidden animate-fade-in-up">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-30 pointer-events-none" />
                        <Loader size={48} className="text-cyan-400 animate-spin mb-4" />
                        <h3 className="text-lg font-bold mb-2 tracking-wide text-cyan-400">LOADING RUNTIME</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">{engineProgress || "Downloading compilation modules..."}</p>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-cyan-400 to-violet-500 h-full rounded-full animate-shimmer" style={{ width: '100%' }} />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Tab switch blocker */}
            {isTabHidden && isSecureMode && (
                <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-3xl">
                    <AlertCircle size={100} className="text-red-500 mb-6 animate-pulse" />
                    <h1 className="text-5xl font-black text-red-500 mb-4 text-center">SESSION PAUSED</h1>
                    <p className="text-2xl text-white text-center mb-4 max-w-2xl">
                        You have navigated away from the secure editor window. This action has been recorded.
                    </p>
                    <p className="text-xl text-amber-400 font-bold">Warnings: {warnings} / 3</p>
                </div>
            )}

            {/* Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl border-b px-6 py-4 bg-white/80 border-gray-200">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(isChallengeMode ? "/codespirit" : "/dashboard")} className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all bg-violet-100 text-violet-700 hover:bg-violet-200">
                        <ArrowLeft size={18} /> {isChallengeMode ? "Exit Challenge" : "Back"}
                    </button>

                    <div className="flex items-center gap-3">
                        {isChallengeMode ? <Zap className="text-cyan-" size={28} /> : <Code className="text-cyan-" size={28} />}
                        <span className="text-xl font-bold">
                            {isChallengeMode
                                ? totalQuestions > 1
                                    ? `Challenge Mode (${totalQuestions} Questions)`
                                    : "Daily Challenge Mode"
                                : "StudySpirit Code Editor"
                            }
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Question Navigator Toggle (only in multi-question mode) */}
                        {totalQuestions > 1 && (
                            <button
                                onClick={() => setShowQuestionNav(!showQuestionNav)}
                                className={`px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${showQuestionNav
                                    ? (theme === "light" ? "bg-violet-200 text-violet-800" : "bg-cyan-500/30 text-violet-300")
                                    : (theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-[var(--bg-secondary)] hover:bg-[var(--border-color)]")
                                    }`}
                            >
                                <Hash size={16} /> Q{currentIndex + 1}/{totalQuestions}
                            </button>
                        )}
                        <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg transition-all bg-gray-200 hover:bg-gray-300">
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Progress Bar for multi-question mode */}
            {totalQuestions > 1 && (
                <div className={`px-6 py-2 ${theme === "light" ? "bg-white border-b border-gray-200" : "bg-[var(--glass-bg)] border-b border-[var(--border-color)]"}`}>
                    <div className="max-w-[1600px] mx-auto">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold flex items-center gap-2">
                                <Target size={14} className="text-cyan-" />
                                Question {currentIndex + 1} of {totalQuestions}
                            </span>
                            <span className="text-sm font-semibold flex items-center gap-2">
                                <Trophy size={14} className="text-emerald-500" />
                                {completedCount}/{totalQuestions} Completed
                            </span>
                        </div>
                        {/* Progress bar */}
                        <div className={`h-2 rounded-full overflow-hidden ${theme === "light" ? "bg-gray-200" : "bg-[var(--bg-secondary)]"}`}>
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan- to-emerald-500 transition-all duration-500"
                                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                            />
                        </div>
                        {/* Question Dots */}
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                            {allChallenges.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => goToQuestion(idx)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${idx === currentIndex
                                        ? "bg-cyan-500 text-[var(--text-primary)] shadow-lg shadow-violet-500/30 scale-110"
                                        : completedQuestions[idx]
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : theme === "light"
                                                ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]"
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className={`max-w-[1600px] mx-auto p-6 ${isChallengeMode ? 'h-[calc(100vh-88px)]' : ''}`}>
                {/* Toolbar */}
                <div className={`flex flex-wrap items-center gap-3 mb-4 p-4 rounded-xl ${theme === "light" ? "bg-white border border-gray-200" : "bg-[var(--glass-bg)] border border-[var(--border-color)]"}`}>
                    <select value={language.id} onChange={(e) => changeLanguage(e.target.value)} className={`px-4 py-2 rounded-lg font-semibold ${theme === "light" ? "bg-gray-100 border border-gray-300" : "bg-[var(--bg-secondary)] border border-cyan-500/30"}`}>
                        {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>

                    {/* Execution Mode Toggle */}
                    <div className={`flex items-center rounded-lg p-0.5 border ${theme === "light" ? "bg-gray-100 border-gray-300" : "bg-[var(--bg-secondary)] border-cyan-500/10"}`}>
                        <button
                            onClick={() => { setExecutionMode("local"); localStorage.setItem("codeeditor_execution_mode", "local"); }}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                                executionMode === "local"
                                    ? (theme === "light"
                                        ? "bg-emerald-100 text-emerald-800 shadow"
                                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]")
                                    : "opacity-60 hover:opacity-100 text-[var(--text-secondary)]"
                            }`}
                            title="Run code client-side inside your browser (Instant, Offline)"
                        >
                            <Zap size={13} className={executionMode === "local" ? "animate-pulse" : ""} /> Local
                        </button>
                        <button
                            onClick={() => { setExecutionMode("cloud"); localStorage.setItem("codeeditor_execution_mode", "cloud"); }}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                                executionMode === "cloud"
                                    ? (theme === "light"
                                        ? "bg-cyan-100 text-cyan-800 shadow"
                                        : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]")
                                    : "opacity-60 hover:opacity-100 text-[var(--text-secondary)]"
                            }`}
                            title="Run code in the cloud via compiler API (Requires Network)"
                        >
                            <Clock size={13} /> Cloud
                        </button>
                    </div>
                    <button onClick={runCode} disabled={isRunning} className={`px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${isRunning ? "opacity-50 cursor-not-allowed" : ""} bg-gradient-to-r from-emerald-500 to-green-600 text-[var(--text-primary)] shadow-lg shadow-emerald-500/30`}>
                        {isRunning ? <Zap className="animate-spin" size={18} /> : <Play size={18} />} {isRunning ? "Running..." : "Run Code"}
                    </button>

                    {/* Verify & Mark Buttons (challenge mode) */}
                    {isChallengeMode && (
                        <>
                            <button
                                onClick={verifyCode}
                                disabled={isVerifying}
                                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${theme === "light" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"} ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isVerifying ? <Loader size={16} className="animate-spin" /> : <Shield size={16} />}
                                {isVerifying ? 'Verifying...' : 'Run Tests'}
                            </button>
                            <button
                                onClick={markCompleted}
                                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${completedQuestions[currentIndex]
                                    ? (theme === "light" ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/20 text-emerald-400")
                                    : (theme === "light" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30")
                                    }`}
                            >
                                <CheckCircle size={16} /> {completedQuestions[currentIndex] ? "Completed ✓" : "Mark Done"}
                            </button>
                        </>
                    )}
                    {/* Timer */}
                    {isChallengeMode && (
                        <div className={`px-4 py-2 rounded-lg font-mono font-bold flex items-center gap-2 ${theme === "light" ? "bg-gray-100" : "bg-[var(--bg-secondary)]"}`}>
                            <Clock size={16} className="text-cyan-500" />
                            <span className={elapsedTime > 600 ? 'text-amber-500' : elapsedTime > 1200 ? 'text-rose-500' : ''}>{formatTimer(elapsedTime)}</span>
                        </div>
                    )}

                    {isChallengeMode && currentProblem && (
                        <button onClick={handleBookmarkProblem} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${theme === "light" ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"}`} title="Bookmark problem to Saved Problems">
                            <Bookmark size={16} /> Save Problem
                        </button>
                    )}
                    <button onClick={saveFile} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${theme === "light" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"}`}>
                        <Save size={16} /> Save
                    </button>
                    <button onClick={exportPDF} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${theme === "light" ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"}`}>
                        <Download size={16} /> PDF
                    </button>
                    <button onClick={copyCode} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${theme === "light" ? "bg-gray-100 hover:bg-gray-200" : "bg-[var(--border-color)] hover:bg-[var(--bg-secondary)]"}`}>
                        <Copy size={16} /> Copy
                    </button>
                    <button onClick={resetCode} className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${theme === "light" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"}`}>
                        <Trash2 size={16} /> Reset
                    </button>

                    {/* Next / Previous Buttons (multi-question) */}
                    {totalQuestions > 1 && (
                        <div className="ml-auto flex items-center gap-2">
                            <button
                                onClick={goPrev}
                                disabled={currentIndex === 0}
                                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-[var(--border-color)] hover:bg-[var(--bg-secondary)]"}`}
                            >
                                <ChevronLeft size={18} /> Prev
                            </button>
                            <span className={`px-3 py-2 rounded-lg font-bold text-sm ${theme === "light" ? "bg-violet-100 text-violet-700" : "bg-cyan-500/20 text-violet-300"}`}>
                                {currentIndex + 1} / {totalQuestions}
                            </span>
                            <button
                                onClick={goNext}
                                disabled={currentIndex === totalQuestions - 1}
                                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${currentIndex < totalQuestions - 1
                                    ? "bg-gradient-to-r from-cyan- to-indigo-500 text-[var(--text-primary)] shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
                                    : (theme === "light" ? "bg-gray-200" : "bg-[var(--border-color)]")
                                    }`}
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {!isChallengeMode && <div className="ml-auto text-sm opacity-70">{currentFileName}.{language.ext}</div>}
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className={`mb-4 p-4 rounded-xl ${theme === "light" ? "bg-white border border-gray-200" : "bg-[var(--glass-bg)] border border-[var(--border-color)]"}`}>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold">Theme:</span>
                                <select value={theme} onChange={(e) => setTheme(e.target.value)} className={`px-3 py-1 rounded-lg ${theme === "light" ? "bg-gray-100 border border-gray-300" : "bg-[var(--bg-secondary)] border border-cyan-500/30"}`}>
                                    {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold">Font Size:</span>
                                <input type="range" min="10" max="24" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-24" />
                                <span className="text-sm">{fontSize}px</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`grid grid-cols-1 ${isChallengeMode ? 'lg:grid-cols-2 h-[calc(100%-80px)]' : 'lg:grid-cols-[1fr_320px]'} gap-4`}>

                    {/* LEFT PANEL: Problem Statement (Only if challenge mode) */}
                    {isChallengeMode && currentProblem && (
                        <div className={`rounded-xl overflow-y-auto p-6 border ${theme === "light" ? "bg-white border-gray-200" : "bg-[var(--glass-bg)] border-[var(--border-color)]"}`}>
                            {/* Question badge */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-cyan-500/20 text-cyan-`}>
                                    {totalQuestions > 1 ? `Question ${currentIndex + 1} of ${totalQuestions}` : "Daily Challenge"}
                                </span>
                                {currentProblem.difficulty && (
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${currentProblem.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                        currentProblem.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                                            'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {currentProblem.difficulty}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-2xl font-black mb-4">{currentProblem.title}</h2>
                            <div className={`prose ${theme === "light" ? "prose-slate" : "prose-invert"} prose-sm mb-6 max-w-none`}>
                                <p className="whitespace-pre-wrap">{currentProblem.description}</p>
                            </div>

                            {currentProblem.testCases && (
                                <div className={`border rounded-xl overflow-hidden ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-[var(--bg-secondary)] border-[var(--border-color)]"}`}>
                                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 opacity-70"><CheckCircle size={14} /> Sample Test Cases</span>
                                        <button
                                            onClick={() => currentProblem.testCases.forEach((tc, i) => runWithTestCase(i, tc.input))}
                                            className={`text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${theme === 'light' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                                        >
                                            <Play size={11} /> Run All
                                        </button>
                                    </div>
                                    <div className="divide-y divide-[var(--border-color)]">
                                        {currentProblem.testCases.map((tc, i) => {
                                            const tcOut = tcOutputs[i];
                                            const isPassed = tcOut && !tcOut.running && tcOut.stdout !== null && normalizeOutput(tcOut.stdout) === normalizeOutput(tc.output);
                                            const isFailed = tcOut && !tcOut.running && tcOut.stdout !== null && normalizeOutput(tcOut.stdout) !== normalizeOutput(tc.output);
                                            return (
                                                <div key={i} className={`p-4 transition-colors ${
                                                    isPassed ? (theme === 'light' ? 'bg-emerald-50' : 'bg-emerald-500/5') :
                                                    isFailed ? (theme === 'light' ? 'bg-red-50' : 'bg-red-500/5') : ''
                                                }`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-xs font-bold flex items-center gap-1.5 ${
                                                            isPassed ? 'text-emerald-500' : isFailed ? 'text-red-500' : 'opacity-60'
                                                        }`}>
                                                            {isPassed ? <CheckCircle size={12} /> : isFailed ? <XCircle size={12} /> : <Hash size={12} />}
                                                            Test Case {i + 1}
                                                        </span>
                                                        <button
                                                            onClick={() => { setStdin(tc.input); runWithTestCase(i, tc.input); }}
                                                            disabled={tcOut?.running}
                                                            className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all disabled:opacity-50 ${
                                                                theme === 'light' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                                            }`}
                                                        >
                                                            {tcOut?.running ? <Loader size={10} className="animate-spin" /> : <Play size={10} />}
                                                            {tcOut?.running ? 'Running...' : '▶ Run'}
                                                        </button>
                                                    </div>
                                                    <div className="font-mono text-xs space-y-1">
                                                        <div className="flex gap-2">
                                                            <span className="opacity-40 shrink-0">Input:</span>
                                                            <span className="text-cyan-400 break-all">{tc.input}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="opacity-40 shrink-0">Expected:</span>
                                                            <span className="text-emerald-400">{tc.output}</span>
                                                        </div>
                                                        {tcOut && !tcOut.running && (
                                                            <div className="flex gap-2 mt-1 pt-1 border-t border-[var(--border-color)]">
                                                                <span className={`opacity-40 shrink-0`}>Got:</span>
                                                                {tcOut.stderr && !tcOut.stdout ? (
                                                                    <span className="text-red-400">{tcOut.stderr}</span>
                                                                ) : (
                                                                    <span className={isPassed ? 'text-emerald-400' : 'text-red-400'}>
                                                                        {tcOut.stdout !== '' ? tcOut.stdout : <span className="opacity-50 italic">(empty output)</span>}
                                                                    </span>
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

                            {currentProblem.hints && (
                                <div className={`mt-4 border rounded-xl p-4 ${theme === "light" ? "bg-yellow-50 border-yellow-200" : "bg-yellow-500/10 border-yellow-500/20"}`}>
                                    <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-yellow-500"><Sparkles size={14} /> Hints</div>
                                    <ul className="list-disc pl-4 text-sm opacity-80">
                                        {currentProblem.hints.map((h, i) => <li key={i}>{h}</li>)}
                                    </ul>
                                </div>
                            )}

                            {/* Auto-Verification Results */}
                            {verificationResults && (
                                <div className={`mt-4 border rounded-xl p-4 ${verificationResults.allPassed
                                    ? (theme === 'light' ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20')
                                    : (theme === 'light' ? 'bg-red-50 border-red-200' : 'bg-red-500/10 border-red-500/20')}`}
                                >
                                    <div className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${verificationResults.allPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {verificationResults.allPassed ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                        {verificationResults.message}
                                    </div>
                                    <div className="space-y-2">
                                        {verificationResults.results?.map((r, i) => (
                                            <div key={i} className={`p-3 rounded-lg border text-sm font-mono ${r.passed
                                                ? (theme === 'light' ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/5 border-emerald-500/20')
                                                : (theme === 'light' ? 'bg-red-50 border-red-200' : 'bg-red-500/5 border-red-500/20')}`}
                                            >
                                                <div className="flex items-center gap-2 mb-1 font-sans">
                                                    {r.passed ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />}
                                                    <span className="font-bold text-xs">Test Case {r.testCase}</span>
                                                </div>
                                                <div className="text-xs opacity-70">Input: <span className="opacity-100">{r.input}</span></div>
                                                <div className="text-xs opacity-70">Expected: <span className="text-emerald-500">{r.expectedOutput}</span></div>
                                                {!r.passed && <div className="text-xs opacity-70">Got: <span className="text-red-500">{r.actualOutput || '(empty)'}</span></div>}
                                                {r.stderr && <div className="text-xs text-red-400 mt-1">{r.stderr}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Code Review */}
                            {isChallengeMode && (
                                <div className="mt-4">
                                    <button
                                        onClick={requestReview}
                                        disabled={isReviewing}
                                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${theme === 'light'
                                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                            : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20'} ${isReviewing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isReviewing ? <Loader size={16} className="animate-spin" /> : <Star size={16} />}
                                        {isReviewing ? 'Analyzing Code...' : 'Get AI Code Review'}
                                    </button>
                                </div>
                            )}

                            {/* Review Results Panel */}
                            {showReview && reviewData && (
                                <div className={`mt-4 border rounded-xl p-5 ${theme === 'light' ? 'bg-purple-50 border-purple-200' : 'bg-purple-500/5 border-purple-500/20'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold uppercase tracking-wider text-purple-500 flex items-center gap-2"><Star size={14} /> AI Code Review</span>
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${reviewData.score >= 80 ? 'bg-emerald-500/20 text-emerald-500' : reviewData.score >= 50 ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'}`}>
                                            Score: {reviewData.score}/100
                                        </div>
                                    </div>

                                    {reviewData.timeComplexity && (
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className={`p-3 rounded-lg ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}>
                                                <div className="text-xs font-bold text-[var(--text-muted)] mb-1">Time Complexity</div>
                                                <div className="text-sm font-bold">{reviewData.timeComplexity}</div>
                                            </div>
                                            <div className={`p-3 rounded-lg ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}>
                                                <div className="text-xs font-bold text-[var(--text-muted)] mb-1">Space Complexity</div>
                                                <div className="text-sm font-bold">{reviewData.spaceComplexity}</div>
                                            </div>
                                        </div>
                                    )}

                                    {reviewData.strengths?.length > 0 && (
                                        <div className="mb-3">
                                            <div className="text-xs font-bold text-emerald-500 mb-1">✅ Strengths</div>
                                            <ul className="text-sm space-y-1">{reviewData.strengths.map((s, i) => <li key={i} className="opacity-80">• {s}</li>)}</ul>
                                        </div>
                                    )}

                                    {reviewData.improvements?.length > 0 && (
                                        <div className="mb-3">
                                            <div className="text-xs font-bold text-amber-500 mb-1">💡 Improvements</div>
                                            <ul className="text-sm space-y-1">{reviewData.improvements.map((s, i) => <li key={i} className="opacity-80">• {s}</li>)}</ul>
                                        </div>
                                    )}

                                    {reviewData.bugs?.length > 0 && (
                                        <div className="mb-3">
                                            <div className="text-xs font-bold text-red-500 mb-1">🐛 Bugs Found</div>
                                            <ul className="text-sm space-y-1">{reviewData.bugs.map((s, i) => <li key={i} className="opacity-80">• {s}</li>)}</ul>
                                        </div>
                                    )}

                                    {reviewData.optimizedApproach && (
                                        <div className="mb-3">
                                            <div className="text-xs font-bold text-cyan-500 mb-1">🚀 Optimal Approach</div>
                                            <p className="text-sm opacity-80">{reviewData.optimizedApproach}</p>
                                        </div>
                                    )}

                                    <div className={`mt-3 p-3 rounded-lg text-sm ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}>
                                        <div className="text-xs font-bold text-[var(--text-muted)] mb-1">Overall</div>
                                        <p className="opacity-80">{reviewData.overallFeedback}</p>
                                    </div>
                                </div>
                            )}

                            {/* Previous / Next navigation at bottom of problem panel */}
                            {totalQuestions > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-color)]">
                                    <button
                                        onClick={goPrev}
                                        disabled={currentIndex === 0}
                                        className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-[var(--border-color)] hover:bg-[var(--bg-secondary)]"}`}
                                    >
                                        <ChevronLeft size={18} /> Previous
                                    </button>
                                    <button
                                        onClick={markCompleted}
                                        className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${completedQuestions[currentIndex]
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            : "bg-gradient-to-r from-emerald-500 to-green-600 text-[var(--text-primary)] shadow-lg shadow-emerald-500/20"
                                            }`}
                                    >
                                        <CheckCircle size={18} /> {completedQuestions[currentIndex] ? "Completed ✓" : "Mark as Done"}
                                    </button>
                                    <button
                                        onClick={goNext}
                                        disabled={currentIndex === totalQuestions - 1}
                                        className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${currentIndex < totalQuestions - 1
                                            ? "bg-gradient-to-r from-cyan- to-indigo-500 text-[var(--text-primary)] shadow-lg shadow-violet-500/20"
                                            : (theme === "light" ? "bg-gray-200" : "bg-[var(--border-color)]")
                                            }`}
                                    >
                                        Next <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}

                            {/* Completion Summary (shown when all done) */}
                            {totalQuestions > 1 && completedCount === totalQuestions && (
                                <div className={`mt-6 p-6 rounded-xl text-center border ${theme === "light" ? "bg-emerald-50 border-emerald-200" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                                    <Trophy size={48} className="mx-auto mb-3 text-amber-500" />
                                    <h3 className="text-xl font-black mb-2">🎉 All Questions Completed!</h3>
                                    <p className="text-sm opacity-70">You solved all {totalQuestions} challenges. Great job!</p>
                                    <button
                                        onClick={() => navigate("/codespirit")}
                                        className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan- to-indigo-500 text-[var(--text-primary)] font-bold rounded-xl shadow-lg"
                                    >
                                        Generate More Challenges
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MAIN EDITOR AREA */}
                    <div className="flex flex-col gap-4">
                        {/* Code Editor */}
                        <div className={`rounded-xl overflow-hidden border flex-1 min-h-[400px] ${theme === "light" ? "border-gray-200" : "border-cyan-500/20"}`}>
                            <Editor
                                height="100%"
                                language={language.id}
                                value={code}
                                theme={theme}
                                onChange={(val) => {
                                    setCode(val || "");
                                    if (totalQuestions > 0) {
                                        setCodePerQuestion(prev => {
                                            const u = [...prev];
                                            u[currentIndex] = { ...u[currentIndex], [language.id]: val || "" };
                                            return u;
                                        });
                                    } else {
                                        setScratchpadCodes(prev => ({ ...prev, [language.id]: val || "" }));
                                    }
                                }}
                                onMount={handleEditorMount}
                                options={{
                                    fontSize,
                                    minimap: { enabled: !isChallengeMode },
                                    wordWrap: "on",
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    padding: { top: 16, bottom: 16 },
                                    fontFamily: "'Fira Code', 'Consolas', monospace",
                                    fontLigatures: true,
                                }}
                            />
                        </div>

                        {/* Input (stdin) */}
                        {["python", "java", "cpp", "c"].includes(language.id) && (
                            <div className={`rounded-xl p-4 ${theme === "light" ? "bg-white border border-gray-200" : "bg-[var(--glass-bg)] border border-[var(--border-color)]"}`}>
                                <div className="text-sm font-semibold mb-2 flex items-center gap-2"><Terminal size={16} /> Input (stdin)</div>
                                <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} rows={2} placeholder="Input..." className={`w-full p-3 rounded-lg font-mono text-sm resize-none ${theme === "light" ? "bg-gray-50 border border-gray-200" : "bg-[var(--bg-secondary)] border border-cyan-500/20"}`} />
                            </div>
                        )}

                        {/* Output */}
                        <div className="rounded-xl p-4 max-h-[200px] overflow-hidden flex flex-col bg-white border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-sm font-semibold flex items-center gap-2"><Terminal size={16} /> Output</div>
                                <button onClick={clearOutput} className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">Clear</button>
                            </div>
                            <pre className="flex-1 overflow-auto p-3 rounded-lg font-mono text-sm bg-gray-50 border border-gray-200 text-gray-800">
                                {output || "Run code to see output..."}
                            </pre>
                        </div>
                    </div>

                    {/* SIDEBAR (Only visible if !challenge mode) */}
                    {!isChallengeMode && (
                        <div className="flex flex-col gap-4">
                            {/* Saved Files */}
                            <div className={`rounded-xl p-4 ${theme === "light" ? "bg-white border border-gray-200" : "bg-[var(--glass-bg)] border border-[var(--border-color)]"}`}>
                                <div className="text-sm font-semibold mb-3 flex items-center gap-2"><FolderOpen size={16} /> Saved Files</div>
                                {savedFiles.length === 0 ? (
                                    <div className="text-center py-6 text-sm opacity-50">No files</div>
                                ) : (
                                    <div className="flex flex-col gap-2 max-h-[200px] overflow-auto">
                                        {savedFiles.map(f => (
                                            <div key={f.name} className={`p-3 rounded-lg flex justify-between items-center cursor-pointer transition-all ${theme === "light" ? "bg-gray-50 hover:bg-gray-100" : "bg-[var(--glass-bg)] hover:bg-cyan-500/10"}`}>
                                                <div onClick={() => loadFile(f)} className="flex-1">
                                                    <div className="font-semibold text-sm">{f.name}</div>
                                                    <div className="text-xs opacity-50">{LANGUAGES.find(l => l.id === f.language)?.name}</div>
                                                </div>
                                                <button onClick={() => deleteFile(f.name)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Language Info */}
                            <div className={`rounded-xl p-4 ${theme === "light" ? "bg-white border border-gray-200" : "bg-[var(--glass-bg)] border border-[var(--border-color)]"}`}>
                                <div className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText size={16} /> Info</div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="opacity-70">Lang</span><span className="font-semibold">{language.name}</span></div>
                                    <div className="flex justify-between"><span className="opacity-70">Ext</span><span className="font-mono">.{language.ext}</span></div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className={`rounded-xl p-4 ${theme === "light" ? "bg-violet-50 border border-cyan-200" : "bg-cyan-500/10 border border-cyan-500/20"}`}>
                                <div className="text-sm font-semibold mb-2">💡 Tips</div>
                                <ul className="text-xs space-y-1 opacity-80">
                                    <li>• Ctrl+S to save</li>
                                    <li>• Run for output</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
