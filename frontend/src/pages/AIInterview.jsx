import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePageTracker } from '../hooks/usePageTracker';
import {
    Mic, ArrowLeft, History, Camera, CameraOff, Volume2, VolumeX
} from 'lucide-react';

// Custom Hooks
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useTextToSpeech from '../hooks/useTextToSpeech';
import useCamera from '../hooks/useCamera';
import useVoiceAnalytics from '../hooks/useVoiceAnalytics';
import useInterviewSession from '../hooks/useInterviewSession';

// Modular Components
import SetupPanel from '../components/interview/SetupPanel';
import InterviewChat from '../components/interview/InterviewChat';
import ReportView from '../components/interview/ReportView';
import ATSChecker from '../components/interview/ATSChecker';
import HistoryView from '../components/interview/HistoryView';
import { JourneyProgressBar, JourneyFinalReport } from '../components/interview/JourneyProgress';

export default function AIInterview() {
    const { user } = useApp();
    const navigate = useNavigate();
    usePageTracker('Interview Prep', '/interview', '🎤');

    // Shared global settings
    const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
    const [autoSpeak, setAutoSpeak] = useState(true);
    const [input, setInput] = useState('');
    
    const videoRef = useRef(null);
    const autoSubmitTimeoutRef = useRef(null);

    // 1. Text to Speech
    const { 
        isSpeaking, 
        currentSpeaker, 
        availableVoices, 
        speak, 
        stopSpeaking 
    } = useTextToSpeech(autoSpeak, selectedVoiceURI, setSelectedVoiceURI);

    // 2. Speech to Text
    const { 
        isListening, 
        speechSupported, 
        fillerWordCount, 
        wordsSpoken, 
        startListening, 
        stopListening, 
        resetSpeechStats 
    } = useSpeechRecognition((transcript) => {
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
    });

    // 3. Camera lifecycle
    const { 
        cameraEnabled, 
        toggleCamera, 
        stopCamera 
    } = useCamera(true, videoRef);

    // 4. Voice & Time Analytics
    const { 
        elapsedTime, 
        wpm, 
        vocalVolume, 
        startTimer, 
        stopTimer, 
        resetTimer 
    } = useVoiceAnalytics(isListening, wordsSpoken);

    // 5. Core Session Logic
    const {
        view, setView,
        messages,
        isLoading,
        mode, setMode,
        totalQuestionsConfig, setTotalQuestionsConfig,
        currentQuestionNum,
        targetRole, setTargetRole,
        targetCompany, setTargetCompany,
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
        examCode, setExamCode,
        registrationNumber, setRegistrationNumber,
        handleJoinExam,
        isJoiningExam,
        atsFile, setAtsFile,
        atsJobDescription, setAtsJobDescription,
        atsResult,
        isCheckingAts,
        checkATS,
        resumeFile, setResumeFile,
        resumeText, setResumeText,
        resetSessionState,
        viewTranscript
    } = useInterviewSession(user, (text, speakers) => {
        // Callback when AI speaks
        speak(text, speakers);
    });

    // Handle Mic Toggling
    const toggleListening = () => {
        if (!speechSupported) {
            alert("Speech recognition is not supported in your browser. Please use Chrome.");
            return;
        }

        if (isListening) {
            stopListening();
        } else {
            stopSpeaking();
            startListening();
        }
    };

    // Auto submit mechanic when listening gets silent
    useEffect(() => {
        if (isListening && input.trim()) {
            if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
            autoSubmitTimeoutRef.current = setTimeout(() => {
                handleSendMessage();
            }, 3500);
        }
        return () => {
            if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
        };
    }, [input, isListening]);

    const handleSendMessage = () => {
        if (!input.trim() || isLoading) return;
        if (isListening) {
            stopListening();
        }
        stopSpeaking();
        sendMessage(input);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Timer Sync with Interview View
    useEffect(() => {
        if (view === 'interview') {
            resetSpeechStats();
            resetTimer();
            startTimer();
        } else {
            stopTimer();
            stopListening();
            stopSpeaking();
            stopCamera();
        }
    }, [view]);

    // End Interview Session completely
    const handleEndSession = () => {
        stopSpeaking();
        stopListening();
        stopTimer();
        if (sessionId && messages.length > 1) {
            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
            const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
            const msgsBeforeLastUser = messages.slice(0, messages.length - lastUserIdx);
            const lastAiQuestion = [...msgsBeforeLastUser].reverse().find(m => m.role === 'ai');
            finishInterview(lastUserMsg?.content || '', lastAiQuestion?.content || '');
        } else {
            resetSessionState();
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans relative overflow-y-auto overflow-x-hidden">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border-color)] px-6 py-4 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/10 rounded-lg">
                        <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2 rounded-lg">
                            <Mic className="w-6 h-6 text-[var(--text-primary)]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AI Interview Prep</h1>
                            <p className="text-xs text-[var(--text-secondary)]">Mock Interview with Aria</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (view === 'history') resetSessionState();
                            else {
                                loadHistory();
                                setView('history');
                            }
                        }}
                        className={`p-2 rounded-lg transition-all ${view === 'history' ? 'bg-cyan-500/20 text-cyan-500' : 'hover:bg-white/5 text-[var(--text-secondary)]'}`}
                    >
                        <History className="w-5 h-5" />
                    </button>
                    {view === 'interview' && (
                        <button
                            onClick={toggleCamera}
                            className={`p-2 rounded-lg transition-all ${cameraEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
                        >
                            {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                        </button>
                    )}
                    <button
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        className={`p-2 rounded-lg transition-all ${autoSpeak ? 'bg-cyan-500/20 text-cyan-500' : 'bg-white/5 text-[var(--text-muted)]'}`}
                    >
                        {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                    {view === 'interview' && (
                        <button
                            onClick={handleEndSession}
                            className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30"
                        >
                            End Session
                        </button>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 flex flex-col gap-6 min-h-[calc(100vh-80px)]">
                {isJourneyMode && <JourneyProgressBar journeyStep={journeyStep} journeyModesList={journeyModesList} />}

                {/* SETUP VIEW */}
                {view === 'setup' && (
                    <SetupPanel
                        mode={mode} setMode={setMode} setView={setView}
                        examCode={examCode} setExamCode={setExamCode}
                        registrationNumber={registrationNumber} setRegistrationNumber={setRegistrationNumber}
                        isJoiningExam={isJoiningExam} handleJoinExam={handleJoinExam} examData={examData}
                        totalQuestionsConfig={totalQuestionsConfig} setTotalQuestionsConfig={setTotalQuestionsConfig}
                        targetRole={targetRole} setTargetRole={setTargetRole}
                        targetCompany={targetCompany} setTargetCompany={setTargetCompany}
                        selectedVoiceURI={selectedVoiceURI} setSelectedVoiceURI={setSelectedVoiceURI}
                        availableVoices={availableVoices}
                        resumeFile={resumeFile} setResumeFile={setResumeFile}
                        resumeText={resumeText} setResumeText={setResumeText}
                        startInterview={startInterview} startJourney={startJourney} isLoading={isLoading}
                    />
                )}

                {/* INTERVIEW VIEW */}
                {view === 'interview' && (
                    <InterviewChat
                        messages={messages}
                        input={input} setInput={setInput}
                        sendMessage={handleSendMessage}
                        handleKeyDown={handleKeyDown}
                        isLoading={isLoading}
                        mode={mode}
                        isSpeaking={isSpeaking}
                        currentSpeaker={currentSpeaker}
                        targetRole={targetRole}
                        isListening={isListening}
                        toggleListening={toggleListening}
                        cameraEnabled={cameraEnabled}
                        videoRef={videoRef}
                        vocalVolume={vocalVolume}
                        elapsedTime={elapsedTime}
                        wpm={wpm}
                        fillerWordCount={fillerWordCount}
                        currentQuestionNum={currentQuestionNum}
                        totalQuestionsConfig={totalQuestionsConfig}
                    />
                )}

                {/* REPORT VIEW */}
                {view === 'report' && sessionReport && (
                    <ReportView
                        sessionReport={sessionReport}
                        isJourneyMode={isJourneyMode}
                        journeyStep={journeyStep}
                        nextJourneyStep={nextJourneyStep}
                        resetSessionState={resetSessionState}
                        setMode={setMode}
                        setView={setView}
                    />
                )}

                {/* ATS CHECKER VIEW */}
                {view === 'ats-checker' && (
                    <ATSChecker
                        atsFile={atsFile} setAtsFile={setAtsFile}
                        atsJobDescription={atsJobDescription} setAtsJobDescription={setAtsJobDescription}
                        atsResult={atsResult}
                        isCheckingAts={isCheckingAts}
                        checkATS={checkATS}
                        isJourneyMode={isJourneyMode}
                        nextJourneyStep={nextJourneyStep}
                    />
                )}

                {/* JOURNEY FINAL REPORT */}
                {view === 'journey-report' && (
                    <JourneyFinalReport
                        journeyReports={journeyReports}
                        resetSessionState={resetSessionState}
                    />
                )}

                {/* HISTORY VIEW */}
                {view === 'history' && (
                    <HistoryView
                        interviewHistory={interviewHistory}
                        viewTranscript={viewTranscript}
                    />
                )}
            </main>
        </div>
    );
}
