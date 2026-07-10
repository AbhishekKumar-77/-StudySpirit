import { useState, useEffect, useCallback } from 'react';
import interviewApi from '../services/interviewApi';
import { API_BASE } from '../config';

/**
 * useInterviewSession - Custom hook for managing the state of an interview session,
 * journey steps, API calls to start/end, and localStorage caching for auto-recovery.
 */
export default function useInterviewSession(user, onSpeechOutput) {
    const [view, setView] = useState('setup'); // 'setup', 'interview', 'report', 'history', 'ats-checker', 'journey-report'
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('technical'); // 'technical', 'behavioral', 'resume', 'gd'
    const [totalQuestionsConfig, setTotalQuestionsConfig] = useState(10);
    const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
    const [targetRole, setTargetRole] = useState('Software Engineer');
    const [targetCompany, setTargetCompany] = useState('General Tech');
    
    // Session state
    const [sessionId, setSessionId] = useState(null);
    const [sessionReport, setSessionReport] = useState(null);
    const [interviewHistory, setInterviewHistory] = useState([]);

    // Exam state
    const [examCode, setExamCode] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [examData, setExamData] = useState(null);
    const [submissionId, setSubmissionId] = useState(null);
    const [isJoiningExam, setIsJoiningExam] = useState(false);

    // Journey mode state
    const [isJourneyMode, setIsJourneyMode] = useState(false);
    const [journeyStep, setJourneyStep] = useState(0); // 1: ATS, 2: HR, 3: GD, 4: Technical
    const [journeyReports, setJourneyReports] = useState([]);
    const [journeyModesList] = useState(['ats-checker', 'behavioral', 'gd', 'technical']);

    // ATS checker state
    const [atsFile, setAtsFile] = useState(null);
    const [atsJobDescription, setAtsJobDescription] = useState('');
    const [atsResult, setAtsResult] = useState(null);
    const [isCheckingAts, setIsCheckingAts] = useState(false);

    // Resume State
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState('');

    // Auto-save key
    const LOCAL_STORAGE_KEY = `studyspirit_interview_session_${user?.id || 'guest'}`;

    // Load history
    const loadHistory = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await interviewApi.getHistory();
            if (data.success) {
                setInterviewHistory(data.sessions);
            }
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Session auto-recovery on mount
    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Only recover active in-progress sessions less than 2 hours old
                if (parsed.status === 'in-progress' && Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
                    const confirmRecovery = window.confirm("You have an active interview session from earlier. Would you like to resume it?");
                    if (confirmRecovery) {
                        setView(parsed.view);
                        setMessages(parsed.messages);
                        setMode(parsed.mode);
                        setTotalQuestionsConfig(parsed.totalQuestionsConfig);
                        setCurrentQuestionNum(parsed.currentQuestionNum);
                        setTargetRole(parsed.targetRole);
                        setTargetCompany(parsed.targetCompany);
                        setSessionId(parsed.sessionId);
                        setSubmissionId(parsed.submissionId);
                        setExamCode(parsed.examCode);
                        setIsJourneyMode(parsed.isJourneyMode);
                        setJourneyStep(parsed.journeyStep);
                        setJourneyReports(parsed.journeyReports);
                    } else {
                        localStorage.removeItem(LOCAL_STORAGE_KEY);
                    }
                }
            } catch (e) {
                console.error("Failed to parse auto-saved session", e);
            }
        }
    }, [LOCAL_STORAGE_KEY]);

    // Save active session status to localStorage
    useEffect(() => {
        if (view === 'interview' && sessionId) {
            const dataToSave = {
                status: 'in-progress',
                timestamp: Date.now(),
                view,
                messages,
                mode,
                totalQuestionsConfig,
                currentQuestionNum,
                targetRole,
                targetCompany,
                sessionId,
                submissionId,
                examCode,
                isJourneyMode,
                journeyStep,
                journeyReports
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        } else if (view === 'setup' || view === 'report' || view === 'journey-report') {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }, [view, messages, mode, totalQuestionsConfig, currentQuestionNum, targetRole, targetCompany, sessionId, submissionId, examCode, isJourneyMode, journeyStep, journeyReports, LOCAL_STORAGE_KEY]);

    const startInterview = async (providedMode = null, providedFile = null, overrideConfig = null, examCtx = null) => {
        const activeMode = providedMode || mode;
        const activeFile = providedFile || resumeFile;
        const activeTotalQuestions = overrideConfig || totalQuestionsConfig;

        if (!resumeText.trim() && !activeFile && activeMode === 'resume') {
            alert("Please paste your resume content OR upload a PDF first.");
            return;
        }

        setView('interview');
        setIsLoading(true);
        setMessages([]);
        setSessionId(null);
        setCurrentQuestionNum(1);

        try {
            let response;
            const payload = {
                mode: activeMode,
                role: targetRole,
                company: targetCompany,
                totalQuestions: activeTotalQuestions,
                questionNumber: 1
            };

            if (activeFile) {
                const formData = new FormData();
                formData.append('resume', activeFile);
                formData.append('mode', activeMode);
                formData.append('role', targetRole);
                formData.append('company', targetCompany);
                formData.append('totalQuestions', activeTotalQuestions);
                formData.append('questionNumber', 1);
                if (examCtx?.examCode || examCode) formData.append('examCode', examCtx?.examCode || examCode);
                if (examCtx?.submissionId || submissionId) formData.append('submissionId', examCtx?.submissionId || submissionId);
                response = await interviewApi.start(formData);
            } else {
                response = await interviewApi.start({
                    ...payload,
                    resumeText,
                    examCode: examCtx?.examCode || examCode,
                    submissionId: examCtx?.submissionId || submissionId
                });
            }

            if (response && response.response) {
                if (response.resumeTextParsed) {
                    setResumeText(response.resumeTextParsed);
                }
                setSessionId(response.sessionId);
                const aiMsg = { 
                    role: 'ai', 
                    content: response.response, 
                    score: 0,
                    speakers: response.parsedResponse?.speakers 
                };
                setMessages([aiMsg]);
                if (onSpeechOutput) {
                    onSpeechOutput(response.response, response.parsedResponse?.speakers);
                }
            }
        } catch (error) {
            console.error('Failed to start interview:', error);
            setMessages([{ role: 'ai', content: "Error connecting to AI Interviewer. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (inputVal) => {
        if (!inputVal.trim() || isLoading) return;

        const userMsg = { role: 'user', content: inputVal.trim() };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const context = messages.slice(-10).map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.content
            }));

            const nextQNum = currentQuestionNum + 1;

            const response = await interviewApi.start({
                mode,
                role: targetRole,
                company: targetCompany,
                message: userMsg.content,
                context: context,
                sessionId,
                totalQuestions: totalQuestionsConfig, 
                questionNumber: nextQNum,
                examCode: examCode,
                submissionId: submissionId
            });

            if (response && response.response) {
                setCurrentQuestionNum(nextQNum);
                const score = response.parsedResponse?.score || 0;
                const feedback = response.parsedResponse?.feedback || "";

                const aiMsg = {
                    role: 'ai',
                    content: response.response,
                    score: score,
                    feedback: feedback,
                    speakers: response.parsedResponse?.speakers
                };
                setMessages(prev => [...prev, aiMsg]);
                if (onSpeechOutput) {
                    onSpeechOutput(response.response, response.parsedResponse?.speakers);
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, { role: 'ai', content: "Connection error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const finishInterview = async (lastAnswer = '', lastQuestion = '') => {
        setIsLoading(true);
        try {
            const lastMsg = messages[messages.length - 1];
            const response = await interviewApi.end({
                sessionId,
                lastAnswer: lastMsg?.role === 'user' ? lastMsg.content : lastAnswer,
                lastQuestion: lastMsg?.role === 'ai' ? lastMsg.content : lastQuestion,
                lastQuestionNumber: currentQuestionNum
            });

            if (response.success) {
                setSessionReport(response.report);
                
                // If this was a teacher exam, mark it complete in the exam system
                if (submissionId && (!isJourneyMode || journeyStep === journeyModesList.length)) {
                    try {
                        let finalScore = response.report.overallScore;
                        let finalFeedback = response.report.finalFeedback;
                        
                        if (isJourneyMode && journeyReports.length > 0) {
                            const allScores = [...journeyReports.map(r => r.overallScore || 0), response.report.overallScore || 0];
                            finalScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
                            finalFeedback = "Journey Completed. Multiple rounds evaluated.\n" + finalFeedback;
                        }

                        await fetch(`${API_BASE}/interview-exam/complete`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                submissionId,
                                sessionId: response.report._id,
                                score: finalScore,
                                feedback: finalFeedback,
                                strengths: response.report.strengths,
                                improvements: response.report.improvements,
                                gdMetrics: response.report.gdMetrics,
                                duration: response.report.duration,
                                questionsAnswered: response.report.questionsAsked
                            }),
                            credentials: 'include'
                        });
                    } catch (e) { 
                        console.error("Failed to notify exam system", e); 
                    }
                }
                
                if (isJourneyMode) {
                    setJourneyReports(prev => {
                        const exists = prev.find(r => r.sessionId === sessionId);
                        return exists ? prev : [...prev, { ...response.report, sessionMode: mode, sessionId }];
                    });
                }
                
                // Transition views based on journey
                if (isJourneyMode && journeyStep < journeyModesList.length) {
                    nextJourneyStep();
                } else if (isJourneyMode && journeyStep === journeyModesList.length) {
                    setJourneyStep(journeyModesList.length + 1);
                    setView('journey-report');
                } else {
                    setView('report');
                }
            }
        } catch (error) {
            console.error("Failed to end interview:", error);
            alert("Error generating report. Please check your connection.");
        } finally {
            setIsLoading(false);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    };

    const nextJourneyStep = () => {
        const nextStep = journeyStep + 1;
        setJourneyStep(nextStep);
        
        const effectiveFile = resumeFile || atsFile;
        if (effectiveFile && !resumeFile) setResumeFile(effectiveFile);

        const numQuestions = examData ? examData.totalQuestions : 10;
        setTotalQuestionsConfig(numQuestions);

        if (nextStep <= journeyModesList.length) {
            const nextMode = journeyModesList[nextStep - 1];
            if (nextMode === 'ats-checker') {
                setView('ats-checker');
            } else {
                setMode(nextMode);
                startInterview(nextMode, effectiveFile, numQuestions, examData ? { examCode: examData.code, submissionId } : null);
            }
        } else {
            setView('journey-report');
        }
    };

    const startJourney = () => {
        setIsJourneyMode(true);
        setJourneyStep(1);
        setJourneyReports([]);
        setView('ats-checker');
    };

    const handleJoinExam = async () => {
        if (!examCode.trim()) return alert("Please enter an exam code!");
        if (!registrationNumber.trim()) return alert("Please enter your Registration/Roll Number!");
        
        setIsJoiningExam(true);
        try {
            const res = await fetch(`${API_BASE}/interview-exam/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examCode, registrationNumber }),
                credentials: 'include'
            });
            const data = await res.json();
            
            if (data.success) {
                setExamData(data.exam);
                setSubmissionId(data.submissionId);
                const joinedModes = data.exam.modes && data.exam.modes.length > 0 ? data.exam.modes : [data.exam.mode || 'technical'];
                setMode(joinedModes[0]);
                setTotalQuestionsConfig(data.exam.totalQuestions);
                setTargetRole(data.exam.targetRole);
                setTargetCompany(data.exam.targetCompany);
                
                if (joinedModes.length > 1) {
                    setIsJourneyMode(true);
                    setJourneyStep(1);
                    setJourneyReports([]);
                    startInterview(joinedModes[0], null, data.exam.totalQuestions, {
                        examCode: data.exam.code,
                        submissionId: data.submissionId
                    });
                } else {
                    startInterview(joinedModes[0], null, data.exam.totalQuestions, {
                        examCode: data.exam.code,
                        submissionId: data.submissionId
                    });
                }
            } else {
                alert(data.message || "Failed to join exam");
            }
        } catch (err) {
            console.error(err);
            alert("Error joining exam. Check your connection.");
        } finally {
            setIsJoiningExam(false);
        }
    };

    const checkATS = async () => {
        if (!atsFile) return alert("Please upload your PDF resume first!");
        setIsCheckingAts(true);
        setAtsResult(null);

        try {
            const formData = new FormData();
            formData.append('resume', atsFile);
            if (atsJobDescription) {
                formData.append('jobDescription', atsJobDescription);
            }

            const data = await interviewApi.checkATS(formData);
            if (data && data.result) {
                setAtsResult(data.result);
            } else {
                alert("Failed to evaluate ATS. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Error checking ATS Score");
        } finally {
            setIsCheckingAts(false);
        }
    };

    const resetSessionState = () => {
        setView('setup');
        setIsJourneyMode(false);
        setJourneyStep(0);
        setJourneyReports([]);
        setSessionId(null);
        setSessionReport(null);
        setMessages([]);
        setAtsResult(null);
        setAtsFile(null);
        setAtsJobDescription('');
    };

    const viewTranscript = async (sessionParam) => {
        try {
            setIsLoading(true);
            const { session } = await interviewApi.getSessionDetails(sessionParam._id);
            setSessionReport({
                ...session,
                strengths: session.strengths || [],
                improvements: session.improvements || [],
                finalFeedback: session.finalFeedback || "Session was not fully completed.",
                overallScore: session.overallScore || 0,
                mode: session.mode,
                totalQuestions: session.exchanges ? session.exchanges.length : 0,
                duration: session.duration || 0,
            });
            setView('report');
        } catch (error) {
            console.error("Failed to load transcript:", error);
            alert("Could not load full transcript. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        view,
        setView,
        messages,
        setMessages,
        isLoading,
        mode,
        setMode,
        totalQuestionsConfig,
        setTotalQuestionsConfig,
        currentQuestionNum,
        targetRole,
        setTargetRole,
        targetCompany,
        setTargetCompany,
        sessionId,
        sessionReport,
        interviewHistory,
        loadHistory,
        startInterview,
        sendMessage,
        finishInterview,
        isJourneyMode,
        journeyStep,
        journeyReports,
        journeyModesList,
        nextJourneyStep,
        startJourney,
        examCode,
        setExamCode,
        registrationNumber,
        setRegistrationNumber,
        examData,
        handleJoinExam,
        isJoiningExam,
        atsFile,
        setAtsFile,
        atsJobDescription,
        setAtsJobDescription,
        atsResult,
        isCheckingAts,
        checkATS,
        resumeFile,
        setResumeFile,
        resumeText,
        setResumeText,
        resetSessionState,
        viewTranscript
    };
}
