import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import englishLabApi from '../services/englishLabApi';

import EnglishLabSidebar from '../components/englishlab/EnglishLabSidebar';
import EnglishLabHeader from '../components/englishlab/EnglishLabHeader';
import EnglishDashboardOverview from '../components/englishlab/EnglishDashboardOverview';

import AIConversationView from '../components/englishlab/AIConversationView';
import PronunciationCoachView from '../components/englishlab/PronunciationCoachView';
import GrammarCoachView from '../components/englishlab/GrammarCoachView';
import VocabularyBuilderView from '../components/englishlab/VocabularyBuilderView';
import RealSituationsView from '../components/englishlab/RealSituationsView';
import ExtemporeSpeakingView from '../components/englishlab/ExtemporeSpeakingView';
import WritingLabView from '../components/englishlab/WritingLabView';
import ProgressReportsView from '../components/englishlab/ProgressReportsView';
import LevelTestModal from '../components/englishlab/LevelTestModal';

import { Loader2 } from 'lucide-react';

export default function SoftSkills() {
    const { user } = useApp();

    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState({});
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLevelTest, setShowLevelTest] = useState(false);

    useEffect(() => {
        loadLabData();
    }, []);

    const loadLabData = async () => {
        setLoading(true);
        try {
            const [profileRes, historyRes] = await Promise.all([
                englishLabApi.getProfile().catch(() => ({ profile: {} })),
                englishLabApi.getSessionHistory().catch(() => ({ sessions: [] }))
            ]);
            setProfile(profileRes.profile || {});
            setHistory(historyRes.sessions || []);
        } catch (e) {
            console.error('English Lab data load error:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
            {/* Left Sidebar Navigation */}
            <EnglishLabSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <EnglishLabHeader
                    user={user}
                    streak={profile.streak || 7}
                    xp={profile.practiceMinutes ? profile.practiceMinutes * 10 : 320}
                />

                <main className="p-6 md:p-8 max-w-[1400px] w-full mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-96">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <EnglishDashboardOverview
                                    user={user}
                                    profile={profile}
                                    onNavigateTab={setActiveTab}
                                    onOpenLevelTest={() => setShowLevelTest(true)}
                                    onStartPracticePlan={() => setActiveTab('conversation')}
                                />
                            )}

                            {activeTab === 'conversation' && (
                                <AIConversationView
                                    profile={profile}
                                    onSessionEnd={loadLabData}
                                />
                            )}

                            {activeTab === 'pronunciation' && (
                                <PronunciationCoachView />
                            )}

                            {activeTab === 'grammar' && (
                                <GrammarCoachView
                                    profile={profile}
                                />
                            )}

                            {activeTab === 'vocabulary' && (
                                <VocabularyBuilderView
                                    profile={profile}
                                    onRefresh={loadLabData}
                                />
                            )}

                            {activeTab === 'situations' && (
                                <RealSituationsView
                                    profile={profile}
                                />
                            )}

                            {activeTab === 'extempore' && (
                                <ExtemporeSpeakingView
                                    onSessionEnd={loadLabData}
                                />
                            )}

                            {activeTab === 'writing' && (
                                <WritingLabView />
                            )}

                            {activeTab === 'progress' && (
                                <ProgressReportsView
                                    profile={profile}
                                    history={history}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Level Test Modal */}
            {showLevelTest && (
                <LevelTestModal
                    onClose={() => setShowLevelTest(false)}
                    onComplete={(updatedProfile) => {
                        setProfile(updatedProfile);
                        setShowLevelTest(false);
                    }}
                />
            )}
        </div>
    );
}
