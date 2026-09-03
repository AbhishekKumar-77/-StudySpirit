import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePageTracker } from '../hooks/usePageTracker';
import resourceApi from '../services/resourceApi';
import {
    Search, Bell, Bot, ArrowRight, CheckCircle2, AlertCircle, BookOpen, FileCheck,
    History, Star, Clock, GraduationCap, Zap, ChevronRight, Plus, Upload, Sparkles,
    LayoutDashboard, Layers, ShieldCheck, Flame, BookMarked, Eye, Play, TrendingUp
} from 'lucide-react';

// Modular Components
import ResourceSidebar from '../components/resources/ResourceSidebar';
import ResourceCard from '../components/resources/ResourceCard';
import CourseDetailView from '../components/resources/CourseDetailView';
import ResourceViewerModal from '../components/resources/ResourceViewerModal';
import ExamPrepModal from '../components/resources/ExamPrepModal';
import { getAvatarUrl, handleAvatarError } from '../utils/avatarHelper';

export default function Resources() {
    const { user } = useApp();
    const navigate = useNavigate();
    usePageTracker('Study Resource Hub', '/resources', '📚');

    // Tab State: 'dashboard', 'library', 'courses', 'saved', 'recent', 'exam-prep'
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

    // Data States
    const [hubData, setHubData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [savedResourceIds, setSavedResourceIds] = useState([]);
    const [activeViewerResource, setActiveViewerResource] = useState(null);
    const [showExamPrepModal, setShowExamPrepModal] = useState(false);

    // Fetch Hub Overview Data
    useEffect(() => {
        const fetchOverview = async () => {
            setIsLoading(true);
            try {
                const data = await resourceApi.getHubOverview();
                if (data && data.success) {
                    setHubData(data);
                }
            } catch (err) {
                console.error("Error fetching resource hub overview:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOverview();
    }, []);

    // Toggle Bookmark / Save
    const handleSaveToggle = async (resource) => {
        const resId = resource.id || resource._id;
        try {
            await resourceApi.toggleSaveResource(resId);
            setSavedResourceIds(prev =>
                prev.includes(resId) ? prev.filter(id => id !== resId) : [...prev, resId]
            );
        } catch (err) {
            console.error("Error toggling save:", err);
        }
    };

    // Filter Helper
    const filterBySearchAndType = (item) => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchTitle = (item.title || item.name || '').toLowerCase().includes(query);
            const matchCode = (item.courseCode || '').toLowerCase().includes(query);
            const matchUnit = (item.unit || '').toLowerCase().includes(query);
            if (!matchTitle && !matchCode && !matchUnit) return false;
        }

        if (selectedTypeFilter !== 'All') {
            const resType = (item.type || item.resourceType || '').toUpperCase();
            if (selectedTypeFilter === 'Notes') return resType.includes('NOTE');
            if (selectedTypeFilter === 'Videos') return resType.includes('VIDEO');
            if (selectedTypeFilter === 'PDFs') return resType.includes('PDF');
            if (selectedTypeFilter === 'Question Banks') return resType.includes('QUESTION_BANK');
            if (selectedTypeFilter === 'Assignments') return resType.includes('ASSIGNMENT');
            if (selectedTypeFilter === 'Papers') return resType.includes('PREVIOUS_PAPER');
        }

        return true;
    };

    // Python Curriculum Data Fallbacks
    const continueLearningList = hubData?.continueLearning || [
        { id: 'py-mod-1', title: 'Module 1 — Introduction to Programming', courseCode: 'CSE105', unit: 'Module 1', type: 'NOTE', progressPercent: 100, readTime: '12 min read', pageCount: 18, verified: true, verificationBadge: 'Official Curriculum' },
        { id: 'py-mod-2', title: 'Module 2 — Variables & Objects', courseCode: 'CSE105', unit: 'Module 2', type: 'NOTE', progressPercent: 40, readTime: '10 min read', pageCount: 16, verified: true, verificationBadge: 'Official Curriculum' },
        { id: 'py-mod-3', title: 'Module 3 — Data Types & Collections', courseCode: 'CSE105', unit: 'Module 3', type: 'NOTE', progressPercent: 0, readTime: '15 min read', pageCount: 22, verified: true, verificationBadge: 'Official Curriculum' }
    ];

    const coursesList = hubData?.courses || [
        { id: 'course-cse105', code: 'CSE105', name: 'Python Programming', resourceCount: 15, resourceBreakdown: '3 Core Modules · Detailed Notes · Short Revision Notes', progress: 55 },
        { id: 'course-cse102', code: 'CSE102', name: 'Data Structures & Algorithms', resourceCount: 18, resourceBreakdown: '6 Notes · 6 Practice Sets · 2 Quizzes', progress: 60 }
    ];

    const recommendedList = hubData?.recommended || [
        { id: 'py-mod-1', title: 'Module 1 — Introduction to Programming', courseCode: 'CSE105', unit: 'Module 1', type: 'NOTE', readTime: '12 min read', pageCount: 18, verified: true, verificationBadge: 'Official Curriculum' },
        { id: 'py-mod-2', title: 'Module 2 — Variables', courseCode: 'CSE105', unit: 'Module 2', type: 'NOTE', readTime: '10 min read', pageCount: 16, verified: true, verificationBadge: 'Official Curriculum' },
        { id: 'py-mod-3', title: 'Module 3 — Data Types', courseCode: 'CSE105', unit: 'Module 3', type: 'NOTE', readTime: '15 min read', pageCount: 22, verified: true, verificationBadge: 'Official Curriculum' }
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar Navigation */}
            <ResourceSidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setSelectedCourse(null);
                    if (tab === 'exam-prep') {
                        setShowExamPrepModal(true);
                    } else {
                        setActiveTab(tab);
                    }
                }}
            />

            {/* Main Sub-View Workspace */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Course Detail View */}
                {selectedCourse ? (
                    <CourseDetailView
                        course={selectedCourse}
                        onBack={() => setSelectedCourse(null)}
                        onOpenResource={(res) => setActiveViewerResource(res)}
                        onSaveToggle={handleSaveToggle}
                        savedResourceIds={savedResourceIds}
                    />
                ) : (
                    <div className="flex-1 bg-slate-50 text-slate-800 p-6 md:p-8 min-h-screen overflow-y-auto">
                        {/* Top Header Actions Row */}
                        <div className="flex items-center justify-end gap-3 mb-6">
                            <button
                                onClick={() => setShowExamPrepModal(true)}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition"
                            >
                                <Zap className="w-4 h-4 fill-white" />
                                <span>Create Exam Pack</span>
                            </button>

                            {/* Student Profile Pill */}
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-2.5 py-1 shadow-xs">
                                <img
                                    src={getAvatarUrl(user?.avatar)}
                                    alt={user?.name || 'User'}
                                    className="w-6 h-6 rounded-full object-cover"
                                    onError={handleAvatarError}
                                />
                                <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                                    {user?.name || 'sasa'}
                                </span>
                            </div>
                        </div>

                        {/* Global Search Bar & Filters */}
                        <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-200 shadow-xs mb-8">
                            <div className="relative mb-4">
                                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder='Search "Normalization", "Python loops", "CAP theorem", "CSE101"...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ff5733] text-slate-800 shadow-xs"
                                />
                            </div>

                            {/* Resource Type Filter Pills */}
                            <div className="flex items-center gap-2 overflow-x-auto">
                                {['All Resources', 'Notes', 'Videos', 'PDFs', 'Question Banks', 'Assignments', 'Papers'].map((label) => {
                                    const val = label === 'All Resources' ? 'All' : label;
                                    const isSel = selectedTypeFilter === val;
                                    return (
                                        <button
                                            key={label}
                                            onClick={() => setSelectedTypeFilter(val)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                                                isSel
                                                    ? 'bg-[#ff5733] text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* TAB 0: MAIN DASHBOARD */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-10">
                                {/* Section 1: Continue Learning */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-base font-extrabold text-slate-900">Continue Learning</h2>
                                            <p className="text-xs text-slate-500">Pick up right where you left off</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {continueLearningList.filter(filterBySearchAndType).map((item) => (
                                            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-orange-400 transition flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-extrabold text-[#ff5733] bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                                            {item.courseCode} · {item.unit}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400">{item.progressPercent}% viewed</span>
                                                    </div>

                                                    <h3 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-1 mb-2">
                                                        {item.title}
                                                    </h3>

                                                    {/* Progress bar */}
                                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                                                        <div className="h-full bg-[#ff5733] rounded-full" style={{ width: `${item.progressPercent}%` }} />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setActiveViewerResource(item)}
                                                    className="bg-slate-100 hover:bg-[#ff5733] hover:text-white text-slate-800 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                                                >
                                                    <span>Continue</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section 3: Recommended Resources */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-base font-extrabold text-slate-900">Faculty Verified Resources</h2>
                                            <p className="text-xs text-slate-500">Handpicked materials for your active subjects</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {recommendedList.filter(filterBySearchAndType).map((res) => (
                                            <ResourceCard
                                                key={res.id}
                                                resource={res}
                                                onOpen={(r) => setActiveViewerResource(r)}
                                                onSaveToggle={handleSaveToggle}
                                                isSaved={savedResourceIds.includes(res.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 1: LIBRARY */}
                        {activeTab === 'library' && (
                            <div className="space-y-8">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-base font-extrabold text-slate-900">Resource Library</h2>
                                            <p className="text-xs text-slate-500 font-medium">Browse and search all verified course materials</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {recommendedList.filter(filterBySearchAndType).map((res) => (
                                            <ResourceCard
                                                key={res.id}
                                                resource={res}
                                                onOpen={(r) => setActiveViewerResource(r)}
                                                onSaveToggle={handleSaveToggle}
                                                isSaved={savedResourceIds.includes(res.id)}
                                            />
                                        ))}
                                        {continueLearningList.filter(filterBySearchAndType).map((res) => (
                                            <ResourceCard
                                                key={res.id}
                                                resource={res}
                                                onOpen={(r) => setActiveViewerResource(r)}
                                                onSaveToggle={handleSaveToggle}
                                                isSaved={savedResourceIds.includes(res.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: MY COURSES */}
                        {activeTab === 'courses' && (
                            <div className="space-y-6">
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-slate-900">Academic Course Library</h2>
                                    <p className="text-xs text-slate-500">Select a course to view all materials organized by topic</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {coursesList.map((c) => (
                                        <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-purple-500 transition flex flex-col justify-between">
                                            <div>
                                                <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                                                    {c.code}
                                                </span>
                                                <h3 className="text-base font-extrabold text-slate-900 mt-3 mb-1">{c.name}</h3>
                                                <p className="text-xs text-slate-500 mb-4">{c.resourceBreakdown}</p>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-[11px] font-bold mb-1">
                                                    <span className="text-slate-500">Course Progress</span>
                                                    <span className="text-purple-600">{c.progress}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                                                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${c.progress}%` }} />
                                                </div>

                                                <button
                                                    onClick={() => setSelectedCourse(c)}
                                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2"
                                                >
                                                    <span>Browse Course Topics</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 3: SAVED */}
                        {activeTab === 'saved' && (
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-slate-900">My Saved Resources</h2>
                                    <p className="text-xs text-slate-500">Your bookmarked study materials</p>
                                </div>

                                {savedResourceIds.length === 0 ? (
                                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
                                        <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <h3 className="text-base font-bold text-slate-800">No Saved Resources Yet</h3>
                                        <p className="text-xs text-slate-500 mt-1">Click the ☆ icon on any resource card to save it here for fast access.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {recommendedList.map((res) => (
                                            <ResourceCard
                                                key={res.id}
                                                resource={res}
                                                onOpen={(r) => setActiveViewerResource(r)}
                                                onSaveToggle={handleSaveToggle}
                                                isSaved={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 4: RECENT */}
                        {activeTab === 'recent' && (
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-slate-900">Recent Resources</h2>
                                    <p className="text-xs text-slate-500">History of materials you opened or studied</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {continueLearningList.map((res) => (
                                        <ResourceCard
                                            key={res.id}
                                            resource={res}
                                            onOpen={(r) => setActiveViewerResource(r)}
                                            onSaveToggle={handleSaveToggle}
                                            isSaved={savedResourceIds.includes(res.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Contextual Resource Reader / Viewer Modal */}
            {activeViewerResource && (
                <ResourceViewerModal
                    resource={activeViewerResource}
                    onClose={() => setActiveViewerResource(null)}
                    onSaveToggle={handleSaveToggle}
                    isSaved={savedResourceIds.includes(activeViewerResource.id || activeViewerResource._id)}
                />
            )}

            {/* Exam Prep Pack Assembler Modal */}
            {showExamPrepModal && (
                <ExamPrepModal
                    onClose={() => setShowExamPrepModal(false)}
                    onOpenPack={(pack) => {
                        setShowExamPrepModal(false);
                    }}
                />
            )}
        </div>
    );
}
