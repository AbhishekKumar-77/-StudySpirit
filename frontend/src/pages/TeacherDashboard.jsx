import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../config';
import { connectSocket, getSocket } from '../services/groupAPI';
import {
    BookOpen, FileQuestion, Trophy, Users, BarChart2, LogOut,
    PlusCircle, Clock, CheckCircle, Copy, Eye, Target,
    ChevronRight, Sun, Moon, Radio, AlertCircle, Key, X, Trash2, Download,
    ChevronDown, ChevronUp, Wifi, WifiOff, ArrowLeft, BarChart, TrendingDown, TrendingUp, Megaphone, School,
    Calendar, Video
} from 'lucide-react';

export default function TeacherDashboard() {
    const { user, logoutUser } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Read initial tab parameter from URL query string
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    const [activeTab, setActiveTab] = useState(tabParam || 'overview');

    // Sync active tab state when URL changes
    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);
    const [myQuizzes, setMyQuizzes] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [isLight, setIsLight] = useState(false);

    // Live Monitor state
    const [monitorCode, setMonitorCode] = useState('');
    const [monitoringCode, setMonitoringCode] = useState(null);
    const [liveStudents, setLiveStudents] = useState([]);
    const [liveSubmissions, setLiveSubmissions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [answerKeyQuiz, setAnswerKeyQuiz] = useState(null);
    const [showAnswerKey, setShowAnswerKey] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    const prevWatchCode = useRef(null);

    // Analytics state
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analyticsQuiz, setAnalyticsQuiz] = useState('');

    // Theme detection
    useEffect(() => {
        const check = () => setIsLight(document.documentElement.classList.contains('light'));
        check();
        const obs = new MutationObserver(check);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    // Redirect non-teachers
    useEffect(() => {
        if (user && user.role !== 'teacher') navigate('/dashboard');
    }, [user]);

    // Fetch quizzes
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await fetch(`${API_BASE}/quiz/my-quizzes`, { credentials: 'include' });
                const data = await res.json();
                if (data.success) {
                    const onlyQuizzes = (data.quizzes || []).filter(q => !q.questions?.some(qu => qu.type === 'coding'));
                    setMyQuizzes(onlyQuizzes);
                }
            } catch (e) { console.error('Failed to fetch quizzes', e); }
            finally { setLoadingQuizzes(false); }
        };
        fetchQuizzes();
    }, []);

    const handleDeleteQuiz = async (code) => {
        try {
            const res = await fetch(`${API_BASE}/quiz/${code}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setMyQuizzes(prev => prev.filter(q => q.code !== code));
                if (monitoringCode === code) stopMonitoring();
            } else {
                alert(data.message || 'Failed to delete quiz');
            }
        } catch (e) {
            console.error(e);
            alert('Error deleting quiz');
        }
    };

    // Socket setup for Live Monitor
    useEffect(() => {
        const socket = connectSocket();

        const onConnect = () => {
            console.log('🔌 Teacher socket connected:', socket.id);
            setSocketConnected(true);
        };
        const onDisconnect = () => {
            console.log('🔌 Teacher socket disconnected');
            setSocketConnected(false);
        };

        // Teacher receives live student count + list
        const onStudentsUpdate = (data) => {
            console.log('📡 quiz:students:update received:', JSON.stringify(data));
            const code = (data?.quizCode || '').toUpperCase().trim();
            const myCode = (prevWatchCode.current || '').toUpperCase().trim();
            if (code === myCode) {
                console.log('✅ Codes match! Updating students list:', data?.students?.length);
                setLiveStudents(data?.students || []);
            } else {
                console.log('⚠️ Code mismatch:', code, '!==', myCode);
            }
        };

        // Teacher receives real-time submission alert
        const onNewSubmission = (data) => {
            console.log('📡 quiz:new:submission received:', JSON.stringify(data));
            const code = (data?.quizCode || '').toUpperCase().trim();
            const myCode = (prevWatchCode.current || '').toUpperCase().trim();
            if (code === myCode) {
                const entry = {
                    studentName: data.studentName,
                    score: data.score,
                    correctAnswers: data.correctAnswers,
                    totalQuestions: data.totalQuestions,
                    timeTaken: data.timeTaken,
                    submittedAt: Date.now()
                };
                setLiveSubmissions(prev => [entry, ...prev]);
                setNotifications(prev => [`🎓 ${data.studentName} submitted — ${data.correctAnswers}/${data.totalQuestions} (${data.score}%)`, ...prev.slice(0, 4)]);
            }
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('quiz:students:update', onStudentsUpdate);
        socket.on('quiz:new:submission', onNewSubmission);

        if (socket.connected) {
            setSocketConnected(true);
            console.log('🔌 Teacher socket already connected:', socket.id);
        }

        // Debug: log all events from server
        socket.onAny((event, ...args) => {
            if (event.startsWith('quiz:')) {
                console.log(`📡 [Teacher] Event: ${event}`, args);
            }
        });

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('quiz:students:update', onStudentsUpdate);
            socket.off('quiz:new:submission', onNewSubmission);
            socket.offAny();
        };
    }, [monitoringCode]);

    const startMonitoring = async (code) => {
        const codeToWatch = (code || monitorCode).toUpperCase().trim();
        if (!codeToWatch) return;

        console.log('🎯 Starting monitor for:', codeToWatch);

        // Stop watching previous quiz
        if (prevWatchCode.current) {
            const s = getSocket();
            if (s) s.emit('quiz:teacher:unwatch', { quizCode: prevWatchCode.current });
        }

        setMonitoringCode(codeToWatch);
        setLiveStudents([]);
        setLiveSubmissions([]);
        setNotifications([]);
        setShowAnswerKey(false);
        prevWatchCode.current = codeToWatch;

        // Fetch existing submissions to persist data across refreshes
        try {
            const res = await fetch(`${API_BASE}/quiz/${codeToWatch}/leaderboard`, { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.leaderboard) {
                const existing = data.leaderboard.map(sub => ({
                    studentName: sub.name,
                    registrationNumber: sub.registrationNumber || '',
                    score: sub.score,
                    correctAnswers: sub.marks,
                    totalQuestions: sub.totalMarks,
                    timeTaken: sub.time ? (parseInt(sub.time) * 60 + parseInt(sub.time.split('m ')[1] || '0')) : 0,
                    submittedAt: Date.now()
                }));
                setLiveSubmissions(existing);
            }
        } catch (e) { console.error('Error fetching existing submissions:', e); }

        // Start watching
        const socket = connectSocket();
        const doWatch = () => {
            console.log('📡 Emitting quiz:teacher:watch for:', codeToWatch, 'socket connected:', socket.connected, 'socket id:', socket.id);
            socket.emit('quiz:teacher:watch', { quizCode: codeToWatch });
        };
        if (socket.connected) doWatch(); else socket.once('connect', doWatch);

        // Also load answer key
        try {
            const res = await fetch(`${API_BASE}/quiz/${codeToWatch}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setAnswerKeyQuiz(data.quiz);
        } catch (e) { console.error('Answer key fetch error', e); }
    };

    const stopMonitoring = () => {
        if (prevWatchCode.current) {
            const s = getSocket();
            if (s) s.emit('quiz:teacher:unwatch', { quizCode: prevWatchCode.current });
        }
        setMonitoringCode(null);
        setLiveStudents([]);
        setLiveSubmissions([]);
        setNotifications([]);
        setAnswerKeyQuiz(null);
        prevWatchCode.current = null;
    };

    const handleLogout = async () => { await logoutUser(); navigate('/'); };
    const toggleTheme = () => { document.documentElement.classList.toggle('light'); setIsLight(p => !p); };

    const totalQuestions = myQuizzes.reduce((s, q) => s + (q.questions?.length || 0), 0);
    const publishedCount = myQuizzes.filter(q => q.status === 'published').length;
    const draftCount = myQuizzes.filter(q => q.status === 'draft').length;

    const navItems = [
        { id: 'overview', label: 'Overview', icon: BarChart2 },
        { id: 'quizzes', label: 'My Quizzes', icon: FileQuestion },
        { id: 'live', label: 'Live Monitor', icon: Radio, badge: monitoringCode ? liveStudents.filter(s => s.status === 'active').length : null },
        { id: 'analytics', label: 'Q-Analytics', icon: BarChart },
        { id: 'create', label: 'Create Quiz', icon: PlusCircle, external: true, path: '/quiz' },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
            {/* ── Sidebar ─────────────────────────── */}
            <div className="fixed left-0 top-0 h-full w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col z-40 shadow-xl">
                <div className="p-6 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <BookOpen size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="font-black text-lg text-[var(--text-primary)]">StudySpirit</div>
                            <div className="text-xs text-violet-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                Teacher Portal
                                <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-red-500'}`} title={socketConnected ? 'Connected' : 'Disconnected'} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 mx-3 mt-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow">
                            {user?.name?.[0]?.toUpperCase() || 'T'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-[var(--text-primary)] text-sm truncate">{user?.name || 'Teacher'}</div>
                            <div className="text-xs text-violet-500 font-semibold">🎓 Instructor</div>
                        </div>
                    </div>
                </div>

                <div className="px-3 mt-4">
                    <button onClick={() => navigate('/teacher-toolkit')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-all">
                        <ArrowLeft size={18} /> Back to Hub
                    </button>
                </div>

                <nav className="flex-1 p-3 mt-2 space-y-1">
                    {navItems.map(item => (
                        <button key={item.id}
                            onClick={() => item.external ? navigate(item.path) : setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === item.id && !item.external
                                ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            <item.icon size={18} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge !== null && item.badge !== undefined && (
                                <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                                    {item.badge}
                                </span>
                            )}
                            {item.external && <ChevronRight size={14} className="opacity-50" />}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-[var(--border-color)] space-y-1">
                    <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-all">
                        {isLight ? <Moon size={18} /> : <Sun size={18} />}
                        {isLight ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-500/10 transition-all">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* ── Main Content ─────────────────────── */}
            <div className="ml-64 flex-1 p-8 min-h-screen">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-primary)]">
                            {activeTab === 'overview' && `Welcome back, ${user?.name?.split(' ')[0] || 'Teacher'}! 👋`}
                            {activeTab === 'quizzes' && 'My Quizzes'}
                            {activeTab === 'live' && '🔴 Live Exam Monitor'}
                            {activeTab === 'leaderboard' && 'Student Leaderboard'}
                            {activeTab === 'analytics' && '📊 Question Analytics'}
                            {activeTab === 'classrooms' && '🏫 Classrooms & Batches'}
                            {activeTab === 'announcements' && '📢 Batch Announcements'}
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-1">
                            {activeTab === 'overview' && "Here's your teaching dashboard at a glance."}
                            {activeTab === 'quizzes' && 'Manage all your created quizzes and view answer keys.'}
                            {activeTab === 'live' && 'Real-time view of who is taking your exam right now.'}
                            {activeTab === 'leaderboard' && 'See how students are performing across all quizzes.'}
                            {activeTab === 'analytics' && 'See which questions students struggled with the most.'}
                            {activeTab === 'classrooms' && 'Manage student classrooms, schedule live lectures, and track enrollments.'}
                            {activeTab === 'announcements' && 'Post and manage announcements across your student batches.'}
                        </p>
                    </div>
                    {activeTab !== 'classrooms' && activeTab !== 'announcements' && (
                        <button onClick={() => navigate('/quiz')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:scale-105 transition-all duration-200">
                            <PlusCircle size={18} /> Create New Quiz
                        </button>
                    )}
                </div>

                {/* ── OVERVIEW ── */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                            {[
                                { label: 'Total Quizzes', value: myQuizzes.length, icon: FileQuestion, bg: 'bg-violet-500/10', text: 'text-violet-500' },
                                { label: 'Published', value: publishedCount, icon: CheckCircle, bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
                                { label: 'Drafts', value: draftCount, icon: Clock, bg: 'bg-amber-500/10', text: 'text-amber-500' },
                                { label: 'Total Questions', value: totalQuestions, icon: Target, bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
                            ].map((s, i) => (
                                <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-violet-500/30 hover:shadow-lg transition-all">
                                    <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                                        <s.icon size={24} className={s.text} />
                                    </div>
                                    <div className="text-3xl font-black text-[var(--text-primary)] mb-1">{s.value}</div>
                                    <div className="text-sm text-[var(--text-secondary)] font-medium">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => navigate('/quiz')} className="flex items-center gap-4 p-6 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-2xl shadow-lg hover:scale-[1.02] transition-all text-left">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><PlusCircle size={24} /></div>
                                <div><div className="font-black text-lg">Create Quiz</div><div className="text-white/70 text-sm">Build or AI-generate questions</div></div>
                            </button>
                            <button onClick={() => setActiveTab('live')} className="flex items-center gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl hover:border-red-500/40 hover:shadow-lg transition-all text-left">
                                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center"><Radio size={24} className="text-red-500" /></div>
                                <div><div className="font-black text-lg text-[var(--text-primary)]">Live Monitor</div><div className="text-[var(--text-secondary)] text-sm">Watch exam in real-time</div></div>
                            </button>
                            <button onClick={() => setActiveTab('leaderboard')} className="flex items-center gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl hover:border-amber-500/40 hover:shadow-lg transition-all text-left">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center"><Trophy size={24} className="text-amber-500" /></div>
                                <div><div className="font-black text-lg text-[var(--text-primary)]">Leaderboard</div><div className="text-[var(--text-secondary)] text-sm">Track student performance</div></div>
                            </button>
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-[var(--text-primary)] mb-4">Recent Quizzes</h2>
                            {loadingQuizzes ? (
                                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 text-center text-[var(--text-muted)]">Loading...</div>
                            ) : myQuizzes.length === 0 ? (
                                <div className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl p-12 text-center">
                                    <FileQuestion size={48} className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
                                    <p className="text-[var(--text-muted)] mb-4">No quizzes yet.</p>
                                    <button onClick={() => navigate('/quiz')} className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all">Create Quiz</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {myQuizzes.slice(0, 6).map(quiz => (
                                        <QuizCard key={quiz.code} quiz={quiz} onDelete={handleDeleteQuiz} onNavigate={navigate} onMonitor={(code) => { setActiveTab('live'); startMonitoring(code); }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── QUIZZES TAB ── */}
                {activeTab === 'quizzes' && (
                    <div>
                        {loadingQuizzes ? (
                            <div className="text-center py-20 text-[var(--text-muted)]">Loading...</div>
                        ) : myQuizzes.length === 0 ? (
                            <div className="text-center py-20">
                                <FileQuestion size={64} className="mx-auto mb-4 text-[var(--text-muted)] opacity-40" />
                                <p className="text-xl text-[var(--text-muted)] mb-6">No quizzes yet</p>
                                <button onClick={() => navigate('/quiz')} className="px-8 py-4 bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all">Create Your First Quiz</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {myQuizzes.map(quiz => (
                                    <QuizCard key={quiz.code} quiz={quiz} onDelete={handleDeleteQuiz} onNavigate={navigate} showFull onMonitor={(code) => { setActiveTab('live'); startMonitoring(code); }} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── LIVE MONITOR TAB ── */}
                {activeTab === 'live' && (
                    <LiveMonitorSection
                        monitorCode={monitorCode}
                        setMonitorCode={setMonitorCode}
                        monitoringCode={monitoringCode}
                        liveStudents={liveStudents}
                        liveSubmissions={liveSubmissions}
                        notifications={notifications}
                        setNotifications={setNotifications}
                        answerKeyQuiz={answerKeyQuiz}
                        showAnswerKey={showAnswerKey}
                        setShowAnswerKey={setShowAnswerKey}
                        socketConnected={socketConnected}
                        onStart={startMonitoring}
                        onStop={stopMonitoring}
                        myQuizzes={myQuizzes}
                    />
                )}

                {/* ── LEADERBOARD ── */}
                {activeTab === 'leaderboard' && <LeaderboardSection myQuizzes={myQuizzes} />}

                {/* ── ANALYTICS ── */}
                {activeTab === 'analytics' && (
                    <AnalyticsSection
                        myQuizzes={myQuizzes}
                        analyticsData={analyticsData}
                        setAnalyticsData={setAnalyticsData}
                        analyticsLoading={analyticsLoading}
                        setAnalyticsLoading={setAnalyticsLoading}
                        analyticsQuiz={analyticsQuiz}
                        setAnalyticsQuiz={setAnalyticsQuiz}
                    />
                )}

                {/* ── CLASSROOMS ── */}
                {activeTab === 'classrooms' && <ClassroomSection />}

                {/* ── ANNOUNCEMENTS ── */}
                {activeTab === 'announcements' && <AnnouncementSection />}
            </div>
        </div>
    );
}

// ── Classroom Section ──────────────────────────────────────────
function ClassroomSection() {
    const [classrooms, setClassrooms] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Drill-down states
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [classroomDetails, setClassroomDetails] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [activeDetailTab, setActiveDetailTab] = useState('lectures');
    
    // Lectures tab states
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [lectureTitle, setLectureTitle] = useState('');
    const [lectureDesc, setLectureDesc] = useState('');
    const [lectureStart, setLectureStart] = useState('');
    const [lectureDuration, setLectureDuration] = useState('60');
    
    // Announcements tab states
    const [announcements, setAnnouncements] = useState([]);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [announcementsLoading, setAnnouncementsLoading] = useState(false);

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/teacher/classroom`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setClassrooms(data.classrooms);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const createClassroom = async () => {
        if (!name) return;
        try {
            const code = 'CL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const res = await fetch(`${API_BASE}/teacher/classroom`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, code }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setName('');
                setDescription('');
                fetchClassrooms();
            }
        } catch (e) { console.error(e); }
    };

    const fetchClassroomDetails = async (id) => {
        setDetailLoading(true);
        try {
            const res = await fetch(`${API_BASE}/teacher/classroom/${id}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setClassroomDetails(data.classroom);
                if (activeDetailTab === 'announcements') {
                    fetchClassroomAnnouncements(id);
                }
            }
        } catch (e) { console.error(e); }
        setDetailLoading(false);
    };

    const fetchClassroomAnnouncements = async (classId) => {
        setAnnouncementsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/teacher/classroom/${classId}/announcements`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setAnnouncements(data.announcements);
        } catch (e) { console.error(e); }
        setAnnouncementsLoading(false);
    };

    const handleSelectClassroom = (classroom) => {
        setSelectedClassroom(classroom);
        fetchClassroomDetails(classroom._id);
    };

    const handleBackToGrid = () => {
        setSelectedClassroom(null);
        setClassroomDetails(null);
        fetchClassrooms();
    };

    // Lectures handlers
    const handleScheduleLecture = async (e) => {
        e.preventDefault();
        if (!lectureTitle || !lectureStart) return;

        try {
            const res = await fetch(`${API_BASE}/teacher/classroom/${selectedClassroom._id}/lecture`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: lectureTitle,
                    description: lectureDesc,
                    scheduledStart: lectureStart,
                    duration: parseInt(lectureDuration) || 60
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setLectureTitle('');
                setLectureDesc('');
                setLectureStart('');
                setLectureDuration('60');
                setShowScheduleModal(false);
                fetchClassroomDetails(selectedClassroom._id);
            }
        } catch (error) { console.error(error); }
    };

    const handleDeleteLecture = async (lectureId) => {
        if (!window.confirm("Are you sure you want to delete this lecture?")) return;
        try {
            const res = await fetch(`${API_BASE}/teacher/classroom/${selectedClassroom._id}/lecture/${lectureId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                fetchClassroomDetails(selectedClassroom._id);
            }
        } catch (error) { console.error(error); }
    };

    const handleStartLecture = async (lectureId) => {
        try {
            const res = await fetch(`${API_BASE}/teacher/classroom/${selectedClassroom._id}/lecture/${lectureId}/start`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                fetchClassroomDetails(selectedClassroom._id);
                window.open(`/group-mode?roomId=${data.liveRoomId}`, '_blank');
            }
        } catch (error) { console.error(error); }
    };

    const handleStopLecture = async (lectureId) => {
        try {
            const res = await fetch(`${API_BASE}/teacher/classroom/${selectedClassroom._id}/lecture/${lectureId}/stop`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                fetchClassroomDetails(selectedClassroom._id);
            }
        } catch (error) { console.error(error); }
    };

    // Announcements handlers
    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcementTitle || !announcementContent) return;

        try {
            const res = await fetch(`${API_BASE}/teacher/announcement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: announcementTitle,
                    content: announcementContent,
                    classroomId: selectedClassroom._id
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setAnnouncementTitle('');
                setAnnouncementContent('');
                fetchClassroomAnnouncements(selectedClassroom._id);
            }
        } catch (error) { console.error(error); }
    };

    const handleTabChange = (tab) => {
        setActiveDetailTab(tab);
        if (tab === 'announcements' && selectedClassroom) {
            fetchClassroomAnnouncements(selectedClassroom._id);
        }
    };

    const copyInviteCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Class code "${code}" copied to clipboard!`);
    };

    const copyStudentLink = (liveRoomId) => {
        const joinLink = `${window.location.origin}/group-mode?roomId=${liveRoomId}`;
        navigator.clipboard.writeText(joinLink);
        alert(`Student Invite Link copied to clipboard:\n${joinLink}`);
    };

    // If detail view is active, render detailed dashboard
    if (selectedClassroom) {
        const details = classroomDetails || selectedClassroom;
        const studentsList = details.students || [];
        const lecturesList = details.lectures || [];

        return (
            <div className="space-y-6">
                {/* Detail Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-lg animate-fade-in">
                    <div className="space-y-1">
                        <button onClick={handleBackToGrid} className="flex items-center gap-2 text-sm font-bold text-violet-500 hover:text-violet-600 transition-colors mb-2">
                            <ArrowLeft size={16} /> Back to Batches
                        </button>
                        <h2 className="text-2xl font-black text-[var(--text-primary)]">{details.name}</h2>
                        {details.description && <p className="text-[var(--text-secondary)] text-sm">{details.description}</p>}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                            <span className="bg-violet-500/10 text-violet-500 border border-violet-500/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
                                Join Code: <span className="font-mono">{details.code}</span>
                                <button onClick={() => copyInviteCode(details.code)} className="hover:text-violet-600 transition-colors"><Copy size={12} /></button>
                            </span>
                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-bold">
                                {studentsList.length} Students Enrolled
                            </span>
                            <span className="bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-2.5 py-1 rounded-lg font-bold">
                                {lecturesList.length} Scheduled Lectures
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sub-tab Switcher */}
                <div className="flex border-b border-[var(--border-color)]">
                    {[
                        { id: 'lectures', label: '📅 Lectures & Live Classes' },
                        { id: 'students', label: '🎓 Enrolled Students' },
                        { id: 'announcements', label: '📢 Batch Announcements' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
                                activeDetailTab === tab.id
                                    ? 'border-violet-500 text-violet-500 font-extrabold'
                                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {detailLoading ? (
                    <div className="text-center py-12 text-[var(--text-muted)]">Loading batch details...</div>
                ) : (
                    <div className="space-y-6">
                        {/* ── LECTURES TAB ── */}
                        {activeDetailTab === 'lectures' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-lg text-[var(--text-primary)]">Lecture Schedule</h3>
                                    <button
                                        onClick={() => setShowScheduleModal(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold rounded-xl text-sm shadow-md hover:scale-[1.02] transition-all"
                                    >
                                        <PlusCircle size={16} /> Schedule Class
                                    </button>
                                </div>

                                {/* Schedule Modal */}
                                {showScheduleModal && (
                                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                                            <button
                                                onClick={() => setShowScheduleModal(false)}
                                                className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                            >
                                                <X size={18} />
                                            </button>
                                            <h3 className="text-lg font-black mb-4 text-[var(--text-primary)]">Schedule Live Class</h3>
                                            <form onSubmit={handleScheduleLecture} className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Class Title</label>
                                                    <input
                                                        type="text"
                                                        value={lectureTitle}
                                                        onChange={e => setLectureTitle(e.target.value)}
                                                        placeholder="e.g. Intro to Dynamic Programming"
                                                        className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-sm text-[var(--text-primary)]"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Description (Optional)</label>
                                                    <textarea
                                                        value={lectureDesc}
                                                        onChange={e => setLectureDesc(e.target.value)}
                                                        placeholder="What topics will be covered..."
                                                        className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-sm min-h-[80px] text-[var(--text-primary)]"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Start Date & Time</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={lectureStart}
                                                            onChange={e => setLectureStart(e.target.value)}
                                                            className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-sm text-[var(--text-primary)]"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Duration (mins)</label>
                                                        <select
                                                            value={lectureDuration}
                                                            onChange={e => setLectureDuration(e.target.value)}
                                                            className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-sm text-[var(--text-primary)]"
                                                        >
                                                            <option value="30">30 mins</option>
                                                            <option value="45">45 mins</option>
                                                            <option value="60">60 mins</option>
                                                            <option value="90">90 mins</option>
                                                            <option value="120">120 mins</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="w-full py-3 bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold rounded-xl text-sm mt-2"
                                                >
                                                    Confirm Schedule
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {/* Lectures List */}
                                {lecturesList.length === 0 ? (
                                    <div className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl p-12 text-center">
                                        <Calendar size={48} className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
                                        <p className="text-[var(--text-muted)] mb-4">No classes scheduled yet for this batch.</p>
                                        <button
                                            onClick={() => setShowScheduleModal(true)}
                                            className="px-5 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 transition-colors"
                                        >
                                            Schedule Your First Lecture
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {lecturesList.map(lecture => (
                                            <div
                                                key={lecture._id}
                                                className={`bg-[var(--bg-secondary)] border rounded-2xl p-5 relative group transition-all ${
                                                    lecture.isLive
                                                        ? 'border-red-500/50 shadow-md shadow-red-500/5 bg-gradient-to-br from-red-500/5 to-transparent'
                                                        : 'border-[var(--border-color)] hover:border-violet-500/30'
                                                }`}
                                            >
                                                {/* Delete button */}
                                                <button
                                                    onClick={() => handleDeleteLecture(lecture._id)}
                                                    className="absolute top-4 right-4 p-1.5 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete Class"
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                                <div className="pr-6 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        {lecture.isLive ? (
                                                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-500 text-white text-xs font-black rounded-lg uppercase tracking-wider animate-pulse">
                                                                <span className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE NOW
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-0.5 bg-[var(--border-color)] text-[var(--text-secondary)] text-xs font-bold rounded-lg uppercase">
                                                                Scheduled
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-1">
                                                            <Clock size={12} /> {lecture.duration} mins
                                                        </span>
                                                    </div>

                                                    <h4 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-violet-500 transition-colors">
                                                        {lecture.title}
                                                    </h4>
                                                    {lecture.description && (
                                                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                                                            {lecture.description}
                                                        </p>
                                                    )}

                                                    <div className="text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]">
                                                        🗓 {new Date(lecture.scheduledStart).toLocaleString()}
                                                    </div>

                                                    {/* Control Buttons */}
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {lecture.isLive ? (
                                                            <>
                                                                <button
                                                                    onClick={() => window.open(`/group-mode?roomId=${lecture.liveRoomId}`, '_blank')}
                                                                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                                                                >
                                                                    <Video size={14} /> Join stream
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStopLecture(lecture._id)}
                                                                    className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl text-xs transition-colors"
                                                                >
                                                                    End Class
                                                                </button>
                                                                <button
                                                                    onClick={() => copyStudentLink(lecture.liveRoomId)}
                                                                    className="py-2 px-3 bg-violet-500/15 hover:bg-violet-500/25 text-violet-500 font-bold rounded-xl text-xs transition-colors"
                                                                    title="Copy Join Link for Students"
                                                                >
                                                                    Invite
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleStartLecture(lecture._id)}
                                                                className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                                                            >
                                                                <Radio size={14} /> Start Live Session
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── STUDENTS TAB ── */}
                        {activeDetailTab === 'students' && (
                            <div className="space-y-4">
                                <h3 className="font-black text-lg text-[var(--text-primary)]">Enrolled Student Directory</h3>
                                {studentsList.length === 0 ? (
                                    <div className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl p-12 text-center text-[var(--text-muted)]">
                                        No students have joined this batch yet. Invite them using code: <span className="font-mono font-bold text-violet-500">{details.code}</span>
                                    </div>
                                ) : (
                                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-[var(--border-color)]/30 border-b border-[var(--border-color)] text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                                        <th className="p-4">Name</th>
                                                        <th className="p-4">Email</th>
                                                        <th className="p-4 text-center">Level</th>
                                                        <th className="p-4 text-center">XP</th>
                                                        <th className="p-4 text-center">Streak</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--border-color)]">
                                                    {studentsList.map(student => (
                                                        <tr key={student._id} className="hover:bg-[var(--border-color)]/10 transition-colors text-sm">
                                                            <td className="p-4 flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center font-bold text-violet-500">
                                                                    {student.avatar || student.name?.[0]?.toUpperCase() || 'S'}
                                                                </div>
                                                                <span className="font-semibold text-[var(--text-primary)]">{student.name}</span>
                                                            </td>
                                                            <td className="p-4 text-[var(--text-secondary)] font-medium">{student.email}</td>
                                                            <td className="p-4 text-center font-bold text-indigo-500">Lv.{student.stats?.level || 1}</td>
                                                            <td className="p-4 text-center text-cyan-600 dark:text-cyan-400 font-bold">{student.stats?.xp || 0}</td>
                                                            <td className="p-4 text-center text-amber-500 font-black">🔥 {student.stats?.streak || 0}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── ANNOUNCEMENTS TAB ── */}
                        {activeDetailTab === 'announcements' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left pane: announcement compose */}
                                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 h-fit shadow">
                                    <h3 className="font-black text-[var(--text-primary)] mb-4 flex items-center gap-1.5">
                                        <Megaphone size={16} className="text-violet-500" /> Broadcast to Batch
                                    </h3>
                                    <form onSubmit={handlePostAnnouncement} className="space-y-4">
                                        <input
                                            value={announcementTitle}
                                            onChange={e => setAnnouncementTitle(e.target.value)}
                                            placeholder="Announcement Title"
                                            className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-sm text-[var(--text-primary)]"
                                            required
                                        />
                                        <textarea
                                            value={announcementContent}
                                            onChange={e => setAnnouncementContent(e.target.value)}
                                            placeholder="Compose announcement..."
                                            className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-sm min-h-[120px] text-[var(--text-primary)]"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-colors"
                                        >
                                            Broadcast Announcement
                                        </button>
                                    </form>
                                </div>

                                {/* Right pane: list of announcements */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h3 className="font-black text-[var(--text-primary)] text-lg">Timeline</h3>
                                    {announcementsLoading ? (
                                        <div className="text-center py-8 text-[var(--text-muted)]">Loading announcements...</div>
                                    ) : announcements.length === 0 ? (
                                        <div className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl p-8 text-center text-[var(--text-muted)]">
                                            No announcements posted to this batch yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {announcements.map(ann => (
                                                <div key={ann._id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
                                                    <h4 className="font-bold text-[var(--text-primary)] text-base mb-1">{ann.title}</h4>
                                                    <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">{ann.content}</p>
                                                    <div className="mt-3 pt-2 border-t border-[var(--border-color)] flex justify-between text-[var(--text-muted)] text-xs">
                                                        <span>By: {ann.teacher?.name || 'Instructor'}</span>
                                                        <span>{new Date(ann.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Create Batch Card */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-md">
                <h3 className="font-black text-lg mb-4 text-[var(--text-primary)]">Create New Batch</h3>
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Batch Name e.g. CS-2024-B"
                        className="flex-1 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-sm text-[var(--text-primary)]"
                    />
                    <input
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Batch Description e.g. Algorithms class"
                        className="flex-[1.5] p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none text-sm text-[var(--text-primary)]"
                    />
                    <button
                        onClick={createClassroom}
                        className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-colors"
                    >
                        Create
                    </button>
                </div>
            </div>

            {/* Grid of Classrooms */}
            {loading ? (
                <div className="text-center py-12 text-[var(--text-muted)]">Loading batches...</div>
            ) : classrooms.length === 0 ? (
                <div className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl p-12 text-center">
                    <School size={48} className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
                    <p className="text-[var(--text-muted)] mb-4">You have not created any batches yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classrooms.map(c => (
                        <div
                            key={c._id}
                            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-violet-500/30 hover:shadow-lg transition-all flex flex-col justify-between"
                        >
                            <div className="space-y-2">
                                <h4 className="font-black text-lg text-[var(--text-primary)]">{c.name}</h4>
                                {c.description && <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{c.description}</p>}
                                <div className="flex items-center gap-1.5 pt-1 text-xs">
                                    <span className="text-[var(--text-muted)] font-semibold">Join Code:</span>
                                    <span className="font-mono font-black text-violet-500">{c.code}</span>
                                    <button onClick={() => copyInviteCode(c.code)} className="text-[var(--text-muted)] hover:text-violet-500 transition-colors"><Copy size={12} /></button>
                                </div>
                            </div>
                            <div className="mt-5 border-t border-[var(--border-color)] pt-4 flex items-center justify-between">
                                <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                    <span>👥 {c.students?.length || 0} Students</span>
                                    <span>🗓 {c.lectures?.length || 0} Lectures</span>
                                </div>
                                <button
                                    onClick={() => handleSelectClassroom(c)}
                                    className="px-3.5 py-1.5 bg-violet-500/10 hover:bg-violet-500 text-violet-500 hover:text-white rounded-lg text-xs font-bold transition-all"
                                >
                                    Manage
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Announcement Section ──────────────────────────────────────────
function AnnouncementSection() {
    const [announcements, setAnnouncements] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchAnnouncements(); }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/teacher/announcement`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setAnnouncements(data.announcements);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const postAnnouncement = async () => {
        if (!title || !content) return;
        try {
            const res = await fetch(`${API_BASE}/teacher/announcement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setTitle(''); setContent('');
                fetchAnnouncements();
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
                <h3 className="font-black mb-4">Broadcast New Announcement</h3>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full mb-3 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none" />
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's happening?" className="w-full mb-3 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl outline-none min-h-[100px]" />
                <button onClick={postAnnouncement} className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl">Broadcast to All Batches</button>
            </div>
            <div className="space-y-4">
                {announcements.map(a => (
                    <div key={a._id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
                        <div className="flex items-center gap-2 text-violet-500 font-bold text-xs uppercase tracking-widest mb-1">
                            <Megaphone size={14} /> Global Announcement
                        </div>
                        <h4 className="font-bold text-lg mb-2">{a.title}</h4>
                        <p className="text-[var(--text-secondary)] text-sm">{a.content}</p>
                        <div className="mt-4 text-[var(--text-muted)] text-xs">{new Date(a.createdAt).toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Live Monitor Section ─────────────────────────────────────────
function LiveMonitorSection({ monitorCode, setMonitorCode, monitoringCode, liveStudents, liveSubmissions,
    notifications, setNotifications, answerKeyQuiz, showAnswerKey, setShowAnswerKey,
    socketConnected, onStart, onStop, myQuizzes }) {

    const activeStudents = liveStudents.filter(s => s.status === 'active');
    const submittedStudents = liveStudents.filter(s => s.status === 'submitted');

    const publishedQuizzes = myQuizzes.filter(q => q.status === 'published');

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Socket status */}
            <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg w-fit ${socketConnected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                {socketConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                {socketConnected ? 'Live socket connected' : 'Socket disconnected — reconnecting...'}
            </div>

            {/* Quiz selector */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
                <h2 className="font-black text-[var(--text-primary)] text-lg mb-4 flex items-center gap-2">
                    <Radio size={20} className="text-red-500" /> Start Monitoring a Quiz
                </h2>

                {!monitoringCode ? (
                    <div className="space-y-4">
                        {/* Manual code entry */}
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={monitorCode}
                                onChange={e => setMonitorCode(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && onStart()}
                                placeholder="Enter quiz code e.g. SP1234"
                                className="flex-1 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-mono font-bold text-lg tracking-widest outline-none focus:border-violet-500 transition-colors"
                                maxLength={10}
                            />
                            <button onClick={() => onStart()} className="px-6 py-3 bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-violet-500/30">
                                Monitor
                            </button>
                        </div>

                        {/* Quick select from published quizzes */}
                        {publishedQuizzes.length > 0 && (
                            <div>
                                <p className="text-xs text-[var(--text-secondary)] font-semibold mb-2 uppercase tracking-wider">Or select a published quiz:</p>
                                <div className="flex flex-wrap gap-2">
                                    {publishedQuizzes.map(q => (
                                        <button key={q.code} onClick={() => onStart(q.code)}
                                            className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/50 text-violet-600 dark:text-violet-400 rounded-xl text-sm font-bold transition-all">
                                            <span className="font-mono tracking-widest">{q.code}</span>
                                            <span className="text-[var(--text-secondary)] font-normal text-xs truncate max-w-[120px]">{q.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                <span className="font-black text-xl text-[var(--text-primary)] font-mono tracking-widest">{monitoringCode}</span>
                            </div>
                            <span className="text-sm text-[var(--text-secondary)]">
                                {activeStudents.length} active · {submittedStudents.length} submitted
                            </span>
                        </div>
                        <button onClick={onStop} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl text-sm transition-all">
                            <X size={16} /> Stop Monitoring
                        </button>
                    </div>
                )}
            </div>

            {monitoringCode && (
                <>
                    {/* Live notifications */}
                    {notifications.length > 0 && (
                        <div className="space-y-2">
                            {notifications.map((n, i) => (
                                <div key={i} className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{n}</span>
                                    <button onClick={() => setNotifications(p => p.filter((_, j) => j !== i))} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 text-center">
                            <div className="text-4xl font-black text-indigo-500 mb-1">{activeStudents.length}</div>
                            <div className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Currently Taking</div>
                        </div>
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 text-center">
                            <div className="text-4xl font-black text-emerald-500 mb-1">{submittedStudents.length}</div>
                            <div className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Submitted</div>
                        </div>
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 text-center">
                            <div className="text-4xl font-black text-amber-500 mb-1">
                                {liveSubmissions.length > 0 ? Math.round(liveSubmissions.reduce((s, x) => s + x.score, 0) / liveSubmissions.length) : '--'}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Avg Score %</div>
                        </div>
                    </div>

                    {/* Two column layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Active students */}
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                            <h3 className="font-black text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                Students In Exam ({activeStudents.length})
                            </h3>
                            {activeStudents.length === 0 ? (
                                <div className="text-center py-8 text-[var(--text-muted)]">
                                    <Users size={36} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Waiting for students to join...</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {activeStudents.map((s, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-black">
                                                {s.name?.[0]?.toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-[var(--text-primary)] text-sm flex-1">{s.name} {s.registrationNumber ? `(${s.registrationNumber})` : ''}</span>
                                            {s.correctAnswers !== undefined && (
                                                <span className="text-xs font-bold text-amber-500 mr-2">
                                                    Points: {s.correctAnswers}/{s.totalQuestions || '?'}
                                                </span>
                                            )}
                                            <span className="text-xs text-indigo-500 font-bold">✍️ Active</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Live submission feed */}
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                            <h3 className="font-black text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <CheckCircle size={16} className="text-emerald-500" />
                                Submissions Feed ({liveSubmissions.length})
                            </h3>
                            {liveSubmissions.length === 0 ? (
                                <div className="text-center py-8 text-[var(--text-muted)]">
                                    <CheckCircle size={36} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Submissions will appear here in real-time</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {liveSubmissions.map((s, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl animate-fade-in">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-black">
                                                {s.studentName?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-[var(--text-primary)] text-sm">{s.studentName} {s.registrationNumber ? `(${s.registrationNumber})` : ''}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">
                                                    {s.timeTaken ? `${Math.floor(s.timeTaken / 60)}m ${s.timeTaken % 60}s` : 'N/A'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-lg font-black ${s.score >= 70 ? 'text-emerald-500' : s.score >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                                    {s.score}%
                                                </div>
                                                <div className="text-xs font-bold text-[var(--text-secondary)]">
                                                    {s.correctAnswers !== undefined ? `${s.correctAnswers}/${s.totalQuestions || '?'}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Answer Key section */}
                    {answerKeyQuiz && (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
                            <button
                                onClick={() => setShowAnswerKey(p => !p)}
                                className="w-full flex items-center justify-between p-5 hover:bg-[var(--border-color)] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <Key size={18} className="text-amber-500" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-black text-[var(--text-primary)]">Answer Key — {answerKeyQuiz.title}</div>
                                        <div className="text-xs text-[var(--text-secondary)]">{answerKeyQuiz.questions?.length} questions · Click to {showAnswerKey ? 'hide' : 'reveal'}</div>
                                    </div>
                                </div>
                                {showAnswerKey ? <ChevronUp size={20} className="text-[var(--text-secondary)]" /> : <ChevronDown size={20} className="text-[var(--text-secondary)]" />}
                            </button>

                            {showAnswerKey && (
                                <div className="px-5 pb-5 space-y-4 border-t border-[var(--border-color)]">
                                    <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-2">
                                        <AlertCircle size={14} />
                                        Answer Key is visible only to you (teacher). Students only see their own score percentage.
                                    </div>
                                    {answerKeyQuiz.questions?.map((q, idx) => (
                                        <div key={idx} className="border border-[var(--border-color)] rounded-xl p-4">
                                            <div className="font-semibold text-[var(--text-primary)] mb-3 text-sm">
                                                <span className="text-violet-500 font-black mr-2">Q{idx + 1}.</span>
                                                {q.question}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {q.options?.map((opt, oi) => (
                                                    <div key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${oi === q.correct
                                                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-bold'
                                                        : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                                                        }`}>
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${oi === q.correct ? 'bg-emerald-500 text-white' : 'bg-[var(--border-color)] text-[var(--text-muted)]'
                                                            }`}>
                                                            {['A', 'B', 'C', 'D'][oi]}
                                                        </span>
                                                        {opt}
                                                        {oi === q.correct && <CheckCircle size={14} className="ml-auto text-emerald-500" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ── Quiz Card ────────────────────────────────────────────────────
function QuizCard({ quiz, onNavigate, showFull = false, onMonitor, onDelete }) {
    const copyCode = () => { navigator.clipboard.writeText(quiz.code); alert(`Code "${quiz.code}" copied!`); };

    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-violet-500/30 hover:shadow-lg transition-all group relative">
            {onDelete && (
                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to delete this quiz?")) {
                            onDelete(quiz.code);
                        }
                    }}
                    className="absolute top-4 right-4 p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all z-10"
                    title="Delete Quiz"
                >
                    <Trash2 size={16} />
                </button>
            )}
            <div className="flex items-start justify-between mb-3 pr-8">
                <h3 className="font-black text-[var(--text-primary)] text-base line-clamp-2 flex-1 group-hover:text-violet-500 transition-colors">{quiz.title}</h3>
                <span className={`shrink-0 text-xs px-2 py-1 rounded-lg font-bold ${quiz.status === 'published' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>
                    {quiz.status === 'published' ? '✓ Live' : '⏳ Draft'}
                </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)] mb-4">
                <span className="flex items-center gap-1 bg-[var(--border-color)] px-2 py-1 rounded-lg"><FileQuestion size={12} /> {quiz.questions?.length || 0} Qs</span>
                <span className="flex items-center gap-1 bg-[var(--border-color)] px-2 py-1 rounded-lg"><Clock size={12} /> {quiz.settings?.timeLimit || 30}m</span>
                <span className="flex items-center gap-1 bg-[var(--border-color)] px-2 py-1 rounded-lg"><Target size={12} /> {quiz.settings?.difficulty || 'medium'}</span>
            </div>
            {quiz.status === 'published' && (
                <div className="flex items-center gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-4">
                    <span className="text-sm text-[var(--text-secondary)]">Code:</span>
                    <span className="font-black text-violet-600 dark:text-violet-400 tracking-widest text-base flex-1">{quiz.code}</span>
                    <button onClick={copyCode} className="p-1.5 hover:bg-violet-500/20 rounded-lg transition-all"><Copy size={14} className="text-violet-500" /></button>
                </div>
            )}
            <div className="flex gap-2">
                <button onClick={() => onNavigate('/quiz')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--border-color)] hover:bg-violet-500/10 hover:text-violet-500 text-[var(--text-secondary)] rounded-xl text-sm font-semibold transition-all">
                    <Eye size={15} /> Edit
                </button>
                {quiz.status === 'published' && (
                    <button onClick={() => onMonitor(quiz.code)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-semibold transition-all">
                        <Radio size={15} /> Monitor
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Leaderboard ──────────────────────────────────────────────────
function LeaderboardSection({ myQuizzes }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState('');

    const publishedQuizzes = myQuizzes.filter(q => q.status === 'published');

    useEffect(() => {
        if (!selectedQuiz) {
            setLeaderboard([]);
            return;
        }
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/quiz/${selectedQuiz}/leaderboard`, { credentials: 'include' });
                const data = await res.json();
                if (data.success) setLeaderboard(data.leaderboard);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, [selectedQuiz]);

    const downloadCSV = () => {
        if (leaderboard.length === 0) return;
        const headers = ["Rank", "Registration No", "Student Name", "Correct Answers", "Real Marks", "Total Questions", "Percentage", "Time Taken"];
        const rows = leaderboard.map(p => {
            // Calculate real marks exactly based on the final percentage they received
            const realMarks = ((p.score / 100) * (p.totalMarks || 1)).toFixed(2).replace(/\.00$/, '');
            return [
                p.rank,
                `"${p.registrationNumber || ''}"`,
                `"${p.name}"`,
                p.marks || 0,
                realMarks,
                p.totalMarks || 0,
                `${p.score}%`,
                p.time
            ];
        });
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `results_quiz_${selectedQuiz}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Select Quiz to view Results</label>
                <div className="flex gap-4">
                    <select
                        value={selectedQuiz}
                        onChange={(e) => setSelectedQuiz(e.target.value)}
                        className="flex-1 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:border-violet-500 outline-none transition-colors"
                    >
                        <option value="">-- Choose a published quiz --</option>
                        {publishedQuizzes.map(q => (
                            <option key={q.code} value={q.code}>{q.title} ({q.code})</option>
                        ))}
                    </select>
                    <button
                        onClick={downloadCSV}
                        disabled={!selectedQuiz || leaderboard.length === 0}
                        className="px-5 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--border-color)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-[var(--text-muted)]">Loading scoreboard...</div>
            ) : selectedQuiz && leaderboard.length === 0 ? (
                <div className="text-center py-20 bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl">
                    <Trophy size={64} className="mx-auto mb-4 text-amber-400 opacity-40" />
                    <p className="text-xl text-[var(--text-muted)]">No students have taken this quiz yet.</p>
                </div>
            ) : !selectedQuiz ? (
                <div className="text-center py-20 bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl">
                    <BarChart2 size={64} className="mx-auto mb-4 text-[var(--text-muted)] opacity-40" />
                    <p className="text-xl text-[var(--text-muted)]">Select a quiz to view its results board.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {leaderboard.map((p, i) => (
                        <div key={p.id || i} className={`flex items-center gap-5 p-5 rounded-2xl border transition-all ${i === 0 ? 'bg-amber-500/5 border-amber-500/25' :
                            i === 1 ? 'bg-slate-400/5 border-slate-400/20' :
                                i === 2 ? 'bg-orange-500/5 border-orange-400/20' :
                                    'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                            }`}>
                            <div className="w-10 text-center font-black text-xl">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-[var(--text-muted)] text-base">#{i + 1}</span>}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg">
                                {p.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-[var(--text-primary)]">{p.name} {p.registrationNumber ? <span className="text-sm font-normal text-[var(--text-muted)]">({p.registrationNumber})</span> : ''}</div>
                                <div className="flex gap-4 text-xs text-[var(--text-secondary)] mt-0.5">
                                    <span>⏱ Time: {p.time}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-[var(--text-primary)]">{p.score}%</div>
                                <div className="text-xs text-[var(--text-secondary)] font-bold">{p.marks !== undefined ? `${p.marks}/${p.totalMarks}` : ''} Marks</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Analytics Section ───────────────────────────────────────────────
function AnalyticsSection({ myQuizzes, analyticsData, setAnalyticsData, analyticsLoading, setAnalyticsLoading, analyticsQuiz, setAnalyticsQuiz }) {

    const loadAnalytics = async (code) => {
        if (!code) return;
        setAnalyticsLoading(true);
        setAnalyticsData(null);
        try {
            const res = await fetch(`${API_BASE}/quiz/${code}/analytics`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setAnalyticsData(data);
            else alert(data.message || 'Failed to load analytics');
        } catch (e) {
            console.error(e);
        }
        setAnalyticsLoading(false);
    };

    const getSuccessColor = (rate) => {
        if (rate >= 70) return 'from-emerald-500 to-emerald-400';
        if (rate >= 40) return 'from-amber-500 to-yellow-400';
        return 'from-red-500 to-rose-400';
    };

    return (
        <div className="space-y-6">
            {/* Quiz Selector */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-color)]">
                <label className="text-[var(--text-secondary)] text-sm mb-2 block font-semibold">Select a Quiz to Analyse</label>
                <div className="flex gap-3">
                    <select
                        value={analyticsQuiz}
                        onChange={(e) => setAnalyticsQuiz(e.target.value)}
                        className="flex-1 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:border-violet-500 outline-none"
                    >
                        <option value="">-- Select a quiz --</option>
                        {myQuizzes.filter(q => q.status === 'published').map(q => (
                            <option key={q.code} value={q.code}>{q.title} ({q.code})</option>
                        ))}
                    </select>
                    <button
                        onClick={() => loadAnalytics(analyticsQuiz)}
                        disabled={!analyticsQuiz || analyticsLoading}
                        className="px-6 py-3 bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {analyticsLoading ? 'Loading...' : 'Load Analytics'}
                    </button>
                </div>
            </div>

            {analyticsData && !analyticsLoading && (
                <>
                    {/* Summary bar */}
                    <div className="grid grid-cols-3 gap-4">
                        {[{ label: 'Total Submissions', val: analyticsData.totalSubmissions, color: 'text-cyan-400' },
                          { label: 'Total Questions', val: analyticsData.analytics.length, color: 'text-violet-400' },
                          { label: 'Avg Pass Rate', val: `${Math.round(analyticsData.analytics.reduce((s, q) => s + q.successRate, 0) / (analyticsData.analytics.length || 1))}%`, color: 'text-emerald-400' }
                        ].map(item => (
                            <div key={item.label} className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-color)] text-center">
                                <div className={`text-3xl font-black ${item.color}`}>{item.val}</div>
                                <div className="text-[var(--text-secondary)] text-sm mt-1">{item.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Hardest questions callout */}
                    {analyticsData.hardestQuestions?.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
                            <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                                <TrendingDown size={18} /> Top Hardest Questions (lowest pass rate)
                            </h3>
                            <div className="space-y-2">
                                {analyticsData.hardestQuestions.map((q, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center text-xs">{q.questionIndex + 1}</span>
                                        <span className="flex-1 text-[var(--text-primary)] truncate">{q.question}</span>
                                        <span className="text-red-400 font-bold">{q.successRate}% passed</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Per-question breakdown */}
                    <div className="space-y-4">
                        {analyticsData.analytics.map((q) => (
                            <div key={q.questionId} className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-color)]">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-black px-2 py-0.5 bg-[var(--border-color)] rounded text-[var(--text-secondary)]">Q{q.questionIndex + 1}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                                q.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                                q.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                            }`}>{q.difficulty}</span>
                                        </div>
                                        <p className="text-[var(--text-primary)] font-semibold">{q.question}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className={`text-2xl font-black ${
                                            q.successRate >= 70 ? 'text-emerald-400' : q.successRate >= 40 ? 'text-amber-400' : 'text-red-400'
                                        }`}>{q.successRate}%</div>
                                        <div className="text-xs text-[var(--text-secondary)]">pass rate</div>
                                    </div>
                                </div>

                                {/* Pass rate bar */}
                                <div className="h-2.5 bg-[var(--border-color)] rounded-full overflow-hidden mb-4">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${getSuccessColor(q.successRate)} transition-all duration-700`}
                                        style={{ width: `${q.successRate}%` }}
                                    />
                                </div>

                                {/* Stats row */}
                                <div className="flex gap-4 text-sm mb-4">
                                    <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle size={14} /> {q.correctCount} correct</span>
                                    <span className="flex items-center gap-1.5 text-red-400"><X size={14} className="opacity-70" /> {q.wrongCount} wrong</span>
                                    <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><Clock size={14} /> {q.skippedCount} skipped</span>
                                </div>

                                {/* Option breakdown */}
                                <div className="space-y-2">
                                    {q.options.map((opt, oi) => {
                                        const count = q.optionCounts[oi] || 0;
                                        const pct = q.totalAttempts > 0 ? Math.round((count / q.totalAttempts) * 100) : 0;
                                        const isCorrect = oi === q.correctOptionIndex;
                                        return (
                                            <div key={oi} className={`flex items-center gap-3 p-2.5 rounded-xl ${
                                                isCorrect ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-[var(--bg-primary)]/50'
                                            }`}>
                                                <span className={`w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center shrink-0 ${
                                                    isCorrect ? 'bg-emerald-500 text-white' : 'bg-[var(--border-color)] text-[var(--text-muted)]'
                                                }`}>{String.fromCharCode(65 + oi)}</span>
                                                <span className="flex-1 text-sm text-[var(--text-primary)] truncate">{opt}</span>
                                                <div className="w-24 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${ isCorrect ? 'bg-emerald-500' : 'bg-[var(--text-muted)]' }`} style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs text-[var(--text-secondary)] w-12 text-right font-bold">{count} ({pct}%)</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {!analyticsData && !analyticsLoading && (
                <div className="text-center py-20 text-[var(--text-muted)]">
                    <BarChart size={60} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Select a quiz above to see question analytics.</p>
                </div>
            )}
        </div>
    );
}
