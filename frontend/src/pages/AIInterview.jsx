import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePageTracker } from '../hooks/usePageTracker';
import soloApi from '../services/soloApi';

// Custom Hooks
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useTextToSpeech from '../hooks/useTextToSpeech';
import useCamera from '../hooks/useCamera';
import useVoiceAnalytics from '../hooks/useVoiceAnalytics';
import useInterviewSession from '../hooks/useInterviewSession';

// Modular Components
import InterviewSidebar from '../components/interview/InterviewSidebar';
import InterviewDashboard from '../components/interview/InterviewDashboard';
import GuidedInterviewWizard from '../components/interview/GuidedInterviewWizard';
import AriaInterviewRoom from '../components/interview/AriaInterviewRoom';
import TechnicalInterviewRoom from '../components/interview/TechnicalInterviewRoom';
import GDPanelRoom from '../components/interview/GDPanelRoom';
import QuestionBankView from '../components/interview/QuestionBankView';
import MyInterviewsView from '../components/interview/MyInterviewsView';
import ATSChecker from '../components/interview/ATSChecker';
import ReportView from '../components/interview/ReportView';

export default function AIInterview() {
    const { user } = useApp();
    const navigate = useNavigate();
    usePageTracker('Interview Prep', '/interview', '🎤');

    // Tab & View Control
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'interviews', 'practice', 'question-bank', 'reports', 'ats'
    const [roomType, setRoomType] = useState(null); // 'aria', 'technical', 'gd', 'wizard'
    const [dashboardData, setDashboardData] = useState(null);

    // Shared settings
    const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
    const [autoSpeak, setAutoSpeak] = useState(true);
    const [input, setInput] = useState('');
    
    const videoRef = useRef(null);

    // 1. Text to Speech
    const { 
        isSpeaking, 
        currentSpeaker, 
        speak, 
        stopSpeaking 
    } = useTextToSpeech(autoSpeak, selectedVoiceURI, setSelectedVoiceURI);

    // 2. Speech to Text
    const { 
        isListening, 
        speechSupported, 
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

    // 4. Voice Analytics
    const { 
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
        examCode, setExamCode,
        registrationNumber, setRegistrationNumber,
        handleJoinExam,
        atsFile, setAtsFile,
        atsJobDescription, setAtsJobDescription,
        atsResult,
        isCheckingAts,
        checkATS,
        resumeFile, setResumeFile,
        resetSessionState
    } = useInterviewSession(user, (text, speakers) => {
        speak(text, speakers);
    });

    // Fetch Dashboard Data from Backend
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await soloApi.getInterviewDashboard();
                if (data && data.success) {
                    setDashboardData(data);
                }
            } catch (err) {
                console.error("Error fetching interview dashboard data:", err);
            }
        };

        fetchDashboardData();
    }, []);

    // Toggle Mic Listening
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

    const handleSendMessage = () => {
        if (!input.trim() || isLoading) return;
        if (isListening) stopListening();
        stopSpeaking();
        sendMessage(input);
        setInput('');
    };

    // Launch Interview Session with specific mode
    const handleLaunchInterview = (selectedRound = 'technical', params = {}) => {
        if (params.targetRole) setTargetRole(params.targetRole);
        if (params.targetCompany) setTargetCompany(params.targetCompany);

        setMode(selectedRound);

        if (selectedRound === 'gd') {
            setRoomType('gd');
        } else if (selectedRound === 'technical') {
            setRoomType('technical');
        } else {
            setRoomType('aria');
        }

        startInterview(selectedRound, params.resumeFile || resumeFile, 10);
    };

    // End Active Session
    const handleEndSession = () => {
        stopSpeaking();
        stopListening();
        stopTimer();
        setRoomType(null);
        if (sessionId && messages.length > 1) {
            finishInterview();
            setActiveTab('reports');
        } else {
            resetSessionState();
            setActiveTab('dashboard');
        }
    };

    // Render Room Component if in active session
    if (roomType === 'aria') {
        return (
            <AriaInterviewRoom
                targetRole={targetRole}
                targetCompany={targetCompany}
                messages={messages}
                input={input}
                setInput={setInput}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                isSpeaking={isSpeaking}
                currentSpeaker={currentSpeaker}
                isListening={isListening}
                onToggleListening={toggleListening}
                cameraEnabled={cameraEnabled}
                onToggleCamera={toggleCamera}
                videoRef={videoRef}
                autoSpeak={autoSpeak}
                onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
                currentQuestionNum={currentQuestionNum}
                totalQuestionsConfig={totalQuestionsConfig}
                onEndInterview={handleEndSession}
                onBack={() => setRoomType(null)}
            />
        );
    }

    if (roomType === 'technical') {
        return (
            <TechnicalInterviewRoom
                targetRole={targetRole}
                targetCompany={targetCompany}
                cameraEnabled={cameraEnabled}
                onToggleCamera={toggleCamera}
                videoRef={videoRef}
                onEndInterview={handleEndSession}
                onBack={() => setRoomType(null)}
            />
        );
    }

    if (roomType === 'gd') {
        return (
            <GDPanelRoom
                targetRole={targetRole}
                user={user}
                cameraEnabled={cameraEnabled}
                onToggleCamera={toggleCamera}
                videoRef={videoRef}
                onEndInterview={handleEndSession}
                onBack={() => setRoomType(null)}
            />
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Dedicated Interview Prep Sidebar */}
            <InterviewSidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setRoomType(null);
                    setActiveTab(tab);
                }}
                readinessScore={dashboardData?.profile?.readiness?.technical || 76}
            />

            {/* Main Sub-View Container */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Guided Interview Setup Wizard */}
                {roomType === 'wizard' && (
                    <GuidedInterviewWizard
                        onCancel={() => setRoomType(null)}
                        onLaunchInterview={handleLaunchInterview}
                        onJoinExam={(code, reg) => {
                            setExamCode(code);
                            setRegistrationNumber(reg);
                            handleJoinExam();
                        }}
                    />
                )}

                {/* Dashboard View */}
                {!roomType && activeTab === 'dashboard' && (
                    <InterviewDashboard
                        user={user}
                        dashboardData={dashboardData}
                        onStartNewInterview={(type) => {
                            if (type === 'specific-job') setRoomType('wizard');
                            else handleLaunchInterview(type === 'skill-practice' ? 'technical' : 'behavioral');
                        }}
                        onSelectQuickAction={(action) => {
                            if (action === 'aria') handleLaunchInterview('full-mock');
                            else if (action === 'technical') setRoomType('technical');
                            else if (action === 'behavioral') handleLaunchInterview('behavioral');
                            else if (action === 'gd') setRoomType('gd');
                        }}
                        onOpenATS={() => setActiveTab('ats')}
                        onOpenQuestionBank={() => setActiveTab('question-bank')}
                        onOpenHistory={() => setActiveTab('interviews')}
                        onOpenReport={() => setActiveTab('reports')}
                    />
                )}

                {/* Question Bank View */}
                {!roomType && activeTab === 'question-bank' && (
                    <QuestionBankView
                        onStartPractice={(category, title) => {
                            handleLaunchInterview('technical');
                        }}
                    />
                )}

                {/* My Interviews (History) View */}
                {!roomType && activeTab === 'interviews' && (
                    <MyInterviewsView
                        onSelectSession={(sess) => {
                            setActiveTab('reports');
                        }}
                    />
                )}

                {/* Resume & ATS View */}
                {!roomType && activeTab === 'ats' && (
                    <div className="p-6 md:p-8 flex-1">
                        <ATSChecker
                            atsFile={atsFile}
                            setAtsFile={setAtsFile}
                            atsJobDescription={atsJobDescription}
                            setAtsJobDescription={setAtsJobDescription}
                            atsResult={atsResult}
                            isCheckingAts={isCheckingAts}
                            checkATS={checkATS}
                        />
                    </div>
                )}

                {/* Reports View */}
                {!roomType && activeTab === 'reports' && (
                    <div className="p-6 md:p-8 flex-1">
                        <ReportView
                            sessionReport={sessionReport || {
                                overallScore: 78,
                                targetRole: 'Backend Developer',
                                targetCompany: 'Google',
                                mode: 'technical'
                            }}
                            resetSessionState={() => setActiveTab('dashboard')}
                            setMode={setMode}
                            setView={setView}
                        />
                    </div>
                )}

                {/* Practice Tab View */}
                {!roomType && activeTab === 'practice' && (
                    <GuidedInterviewWizard
                        onCancel={() => setActiveTab('dashboard')}
                        onLaunchInterview={handleLaunchInterview}
                        onJoinExam={(code, reg) => {
                            setExamCode(code);
                            setRegistrationNumber(reg);
                            handleJoinExam();
                        }}
                    />
                )}
            </div>
        </div>
    );
}
