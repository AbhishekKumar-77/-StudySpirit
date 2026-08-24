import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useApp } from "../context/AppContext";
import { usePageTracker } from "../hooks/usePageTracker";

// Import Modular Components
import CodeSpiritSidebar from "../components/codespirit/CodeSpiritSidebar";
import CodeSpiritHeader from "../components/codespirit/CodeSpiritHeader";
import CodeSpiritDashboard from "../components/codespirit/CodeSpiritDashboard";
import SmartPracticeView from "../components/codespirit/SmartPracticeView";
import ProblemsView from "../components/codespirit/ProblemsView";
import MyMistakesView from "../components/codespirit/MyMistakesView";
import DailyChallengeView from "../components/codespirit/DailyChallengeView";
import SkillTreeView from "../components/codespirit/SkillTreeView";
import CompanyPrepView from "../components/codespirit/CompanyPrepView";
import SubjectModulesView from "../components/codespirit/SubjectModulesView";
import ContestsView from "../components/codespirit/ContestsView";
import LeaderboardView from "../components/codespirit/LeaderboardView";
import SavedProblemsView from "../components/codespirit/SavedProblemsView";
import HistoryView from "../components/codespirit/HistoryView";
import AICodingTutorModal from "../components/codespirit/AICodingTutorModal";

export default function CodeSpirit() {
    const navigate = useNavigate();
    const { user } = useApp();
    usePageTracker('CodeSpirit', '/codespirit', '🧠');

    // Navigation & Context State
    const [activeTab, setActiveTab] = useState("home");
    const [selectedSubject, setSelectedSubject] = useState("python");

    // Dashboard Data & AI Tutor State
    const [dashboardData, setDashboardData] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [isAITutorOpen, setIsAITutorOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchDashboardStats();
    }, [selectedSubject]);

    const fetchDashboardStats = async () => {
        setLoadingData(true);
        try {
            const res = await api.get('/codespirit/dashboard-stats');
            if (res.data?.success) {
                setDashboardData(res.data);
            }
        } catch (e) {
            console.error("Dashboard stats error:", e);
        } finally {
            setLoadingData(false);
        }
    };

    // Handler: Launch Practice Engine with Selected Subject Context
    const handleStartPractice = async (subj = selectedSubject, topicName = "Functions & Recursion", difficulty = "medium", count = 5) => {
        setIsGenerating(true);
        const fullTopic = `${topicName} (${subj.toUpperCase()})`;
        try {
            const res = await api.post('/codespirit/generate', {
                topic: fullTopic,
                difficulty,
                count,
                language: subj === 'dsa' ? 'cpp' : subj === 'sql' ? 'python' : subj
            });
            const data = res.data;
            if (data.success && data.challenges?.length > 0) {
                navigate('/code-editor', {
                    state: {
                        sessionId: data.sessionId,
                        challenges: data.challenges,
                        totalCount: data.totalCount,
                        topic: fullTopic,
                        difficulty,
                        secureMode: false
                    }
                });
            } else {
                alert("Failed to generate practice session: " + (data.message || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Error launching practice session.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Handler: Launch Daily Challenge
    const handleSolveChallenge = async () => {
        setIsGenerating(true);
        try {
            const res = await api.get(`/codespirit/daily?language=${selectedSubject === 'dsa' ? 'cpp' : selectedSubject}`);
            if (res.data?.success && res.data?.session) {
                const sess = res.data.session;
                navigate('/code-editor', {
                    state: {
                        sessionId: sess._id,
                        challenges: sess.challenges,
                        totalCount: sess.challenges.length,
                        topic: sess.topic,
                        difficulty: sess.difficulty,
                        secureMode: false
                    }
                });
            } else {
                handleStartPractice(selectedSubject, "Daily Challenge Spot", "medium", 1);
            }
        } catch (e) {
            handleStartPractice(selectedSubject, "Daily Challenge Spot", "medium", 1);
        } finally {
            setIsGenerating(false);
        }
    };

    // Handler: Open Specific Problem
    const handleOpenProblem = (prob) => {
        handleStartPractice(prob.subject || selectedSubject, prob.title || prob.topic, prob.difficulty?.toLowerCase() || 'medium', 1);
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc] text-gray-900 font-sans">
            {/* 1. Left Sidebar Navigation */}
            <CodeSpiritSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
                onOpenAITutor={() => setIsAITutorOpen(true)}
            />

            {/* 2. Main Content Area */}
            <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto">
                {/* Header */}
                <CodeSpiritHeader
                    stats={dashboardData?.stats}
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                />

                {/* Loading Overlay */}
                {isGenerating && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center text-white">
                        <div className="bg-white p-6 rounded-3xl text-center shadow-2xl text-gray-900 animate-in fade-in">
                            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
                            <h3 className="font-bold text-base">Generating Practice Session...</h3>
                            <p className="text-xs text-gray-500 mt-1">Preparing competitive problem set for {selectedSubject.toUpperCase()}</p>
                        </div>
                    </div>
                )}

                {/* Tab Views */}
                {activeTab === 'home' && (
                    <CodeSpiritDashboard
                        dashboardData={dashboardData}
                        selectedSubject={selectedSubject}
                        setSelectedSubject={setSelectedSubject}
                        onStartPractice={handleStartPractice}
                        onSolveChallenge={handleSolveChallenge}
                        onOpenProblem={handleOpenProblem}
                        setActiveTab={setActiveTab}
                    />
                )}

                {activeTab === 'subject-detail' && (
                    <SubjectModulesView
                        selectedSubject={selectedSubject}
                        dashboardData={dashboardData}
                        onStartPractice={handleStartPractice}
                    />
                )}

                {activeTab === 'smart-practice' && (
                    <SmartPracticeView
                        selectedSubject={selectedSubject}
                        onStartPractice={handleStartPractice}
                    />
                )}

                {activeTab === 'problems' && (
                    <ProblemsView
                        selectedSubject={selectedSubject}
                        onOpenProblem={handleOpenProblem}
                    />
                )}

                {activeTab === 'mistakes' && (
                    <MyMistakesView
                        onStartPractice={handleStartPractice}
                    />
                )}

                {activeTab === 'daily-challenge' && (
                    <DailyChallengeView
                        onSolveChallenge={handleSolveChallenge}
                    />
                )}

                {activeTab === 'company-prep' && (
                    <CompanyPrepView
                        onStartPractice={handleStartPractice}
                    />
                )}

                {activeTab === 'contests' && (
                    <ContestsView
                        onStartPractice={handleStartPractice}
                    />
                )}

                {activeTab === 'leaderboard' && (
                    <LeaderboardView />
                )}

                {activeTab === 'skill-tree' && (
                    <SkillTreeView
                        selectedSubject={selectedSubject}
                        onStartPractice={handleStartPractice}
                    />
                )}

                {activeTab === 'history' && (
                    <HistoryView
                        onStartPractice={handleStartPractice}
                    />
                )}

                {activeTab === 'saved-problems' && (
                    <SavedProblemsView
                        onStartPractice={handleStartPractice}
                    />
                )}
            </main>

            {/* 3. AI Coding Tutor Modal / Drawer */}
            <AICodingTutorModal
                isOpen={isAITutorOpen}
                onClose={() => setIsAITutorOpen(false)}
                selectedSubject={selectedSubject}
            />
        </div>
    );
}
