import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePageTracker } from '../hooks/usePageTracker';
import resourceApi from '../services/resourceApi';
import {
    Search, Bell, Bot, ArrowRight, CheckCircle2, AlertCircle, BookOpen, FileCheck,
    History, Star, Clock, GraduationCap, Zap, ChevronRight, Plus, Upload, Sparkles
} from 'lucide-react';

// Modular Components
import ResourceSidebar from '../components/resources/ResourceSidebar';
import ResourceCard from '../components/resources/ResourceCard';
import CourseDetailView from '../components/resources/CourseDetailView';
import ResourceViewerModal from '../components/resources/ResourceViewerModal';
import ExamPrepModal from '../components/resources/ExamPrepModal';

export default function Resources() {
    const { user } = useApp();
    const navigate = useNavigate();
    usePageTracker('Study Resource Hub', '/resources', '📚');

    // Tab State: 'library', 'courses', 'saved', 'recent', 'exam-prep'
    const [activeTab, setActiveTab] = useState('library');
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
                        {/* Top Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Study Resource Hub</h1>
                                <p className="text-sm font-medium text-slate-500 mt-1">All your course material. One organized learning space.</p>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-auto">
                                {/* Student Profile Pill */}
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
                                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                                        {user?.name ? user.name.charAt(0) : 'A'}
                                    </div>
                                    <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                                        {user?.name || 'Abhishek Kumar'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Large Global Search Bar */}
                        <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-200 shadow-sm mb-6">
                            <div className="relative mb-4">
                                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder='Search "Normalization", "Python loops", "CAP theorem"...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-800 shadow-xs"
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
                                                    ? 'bg-cyan-600 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* TAB 1: LIBRARY (HOME) */}
                        {activeTab === 'library' && (
                            <div className="space-y-8">
                                {/* Section 1: Continue Learning */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-base font-extrabold text-slate-900">Continue Learning</h2>
                                            <p className="text-xs text-slate-500">Recently opened course materials</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(hubData?.continueLearning || [
                                            { id: 'res-norm-notes', title: 'Database Normalization Notes', courseCode: 'CSE101', unit: 'Unit 3', type: 'PDF', progressPercent: 68, readTime: '8 min read', pageCount: 24, verified: true },
                                            { id: 'res-nosql-video', title: 'Understanding 1NF, 2NF & 3NF', courseCode: 'CSE101', unit: 'Unit 3', type: 'VIDEO', progressPercent: 32, duration: '18:42', verified: true },
                                            { id: 'res-cap-bank', title: 'CAP Theorem & NoSQL Practice Questions', courseCode: 'CSE101', unit: 'Unit 4', type: 'QUESTION_BANK', progressPercent: 60, questionCount: 40, verified: true }
                                        ]).filter(filterBySearchAndType).map((item) => (
                                            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-cyan-400 transition flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-extrabold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                                                            {item.courseCode} · {item.unit}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400">{item.progressPercent}% viewed</span>
                                                    </div>

                                                    <h3 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-1 mb-2">
                                                        {item.title}
                                                    </h3>

                                                    {/* Progress bar */}
                                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                                                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${item.progressPercent}%` }} />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setActiveViewerResource(item)}
                                                    className="bg-slate-100 hover:bg-cyan-600 hover:text-white text-slate-800 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                                                >
                                                    <span>Continue</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section 2: My Courses Grid */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-base font-extrabold text-slate-900">My Courses</h2>
                                            <p className="text-xs text-slate-500">Your enrolled academic course library</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {(hubData?.courses || [
                                            { id: 'course-cse101', code: 'CSE101', name: 'Database Management Systems', resourceCount: 24, resourceBreakdown: '8 Notes · 6 Videos · 5 PDFs · 5 Others', progress: 68 },
                                            { id: 'course-cse202', code: 'CSE202', name: 'Operating Systems', resourceCount: 18, resourceBreakdown: '5 Notes · 7 Videos · 4 PDFs · 2 Papers', progress: 42 },
                                            { id: 'course-cse301', code: 'CSE301', name: 'Computer Networks', resourceCount: 32, resourceBreakdown: '10 Notes · 12 Videos · 6 PDFs · 4 Papers', progress: 81 },
                                            { id: 'course-cse102', code: 'CSE102', name: 'Data Structures & Algorithms', resourceCount: 29, resourceBreakdown: '9 Notes · 10 Videos · 5 PDFs · 5 Banks', progress: 75 }
                                        ]).map((c) => (
                                            <div key={c.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-cyan-500 hover:shadow-md transition flex flex-col justify-between">
                                                <div>
                                                    <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                                                        {c.code}
                                                    </span>
                                                    <h3 className="text-sm font-extrabold text-slate-900 mt-2 mb-1 line-clamp-1">{c.name}</h3>
                                                    <p className="text-xs font-semibold text-slate-500 mb-3">{c.resourceCount} Resources</p>
                                                    <p className="text-[10px] text-slate-400 leading-tight mb-4">{c.resourceBreakdown}</p>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-[11px] font-bold mb-1">
                                                        <span className="text-slate-500">Progress</span>
                                                        <span className="text-cyan-600">{c.progress}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                                                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${c.progress}%` }} />
                                                    </div>

                                                    <button
                                                        onClick={() => setSelectedCourse(c)}
                                                        className="w-full bg-slate-900 hover:bg-cyan-600 text-white font-bold text-xs py-2.5 rounded-xl transition"
                                                    >
                                                        Open Course
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section 3: Recommended Resources */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-base font-extrabold text-slate-900">Recommended Resources</h2>
                                            <p className="text-xs text-slate-500">Tailored based on your course progress</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(hubData?.recommended || [
                                            { id: 'res-norm-simp', title: 'Normalization Simplified Notes', courseCode: 'CSE101', unit: 'Unit 3', type: 'PDF', readTime: '6 min read', pageCount: 14, verified: true, verificationBadge: 'Faculty Verified' },
                                            { id: 'res-norm-lec', title: '18-min Normalization Masterclass', courseCode: 'CSE101', unit: 'Unit 3', type: 'VIDEO', duration: '18:15', verified: true, verificationBadge: 'Teacher Verified' },
                                            { id: 'res-exam-paper-2025', title: 'DBMS Previous Year Paper 2025', courseCode: 'CSE101', unit: 'Midterm', type: 'PREVIOUS_PAPER', pageCount: 8, verified: true, verificationBadge: 'Institution Resource' }
                                        ]).filter(filterBySearchAndType).map((res) => (
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
                                    {(hubData?.courses || []).map((c) => (
                                        <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-cyan-500 transition flex flex-col justify-between">
                                            <div>
                                                <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                                                    {c.code}
                                                </span>
                                                <h3 className="text-base font-extrabold text-slate-900 mt-3 mb-1">{c.name}</h3>
                                                <p className="text-xs text-slate-500 mb-4">{c.resourceBreakdown}</p>
                                            </div>

                                            <button
                                                onClick={() => setSelectedCourse(c)}
                                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2"
                                            >
                                                <span>Browse Course Topics</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
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
                                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
                                        <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <h3 className="text-base font-bold text-slate-800">No Saved Resources Yet</h3>
                                        <p className="text-xs text-slate-500 mt-1">Click the ☆ icon on any resource card to save it here for fast access.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(hubData?.recommended || []).map((res) => (
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
                                    {(hubData?.continueLearning || []).map((res) => (
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
