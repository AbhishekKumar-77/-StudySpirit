import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../config';
import { connectSocket, getSocket } from '../services/groupAPI';
import {
    BookOpen, FileQuestion, Trophy, Users, BarChart2, LogOut,
    PlusCircle, Clock, CheckCircle, Copy, Eye, Target,
    ChevronRight, Sun, Moon, Radio, AlertCircle, Key, X,
    ChevronDown, ChevronUp, Wifi, WifiOff
} from 'lucide-react';

export default function TeacherDashboard() {
    const { user, logoutUser } = useApp();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
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
                if (data.success) setMyQuizzes(data.quizzes || []);
            } catch (e) { console.error('Failed to fetch quizzes', e); }
            finally { setLoadingQuizzes(false); }
        };
        fetchQuizzes();
    }, []);

    // Socket setup for Live Monitor
    useEffect(() => {
        const socket = connectSocket();

        const onConnect = () => setSocketConnected(true);
        const onDisconnect = () => setSocketConnected(false);

        // Teacher receives live student count + list
        const onStudentsUpdate = ({ quizCode, count, students }) => {
            if (quizCode === monitoringCode) {
                setLiveStudents(students || []);
            }
        };

        // Teacher receives real-time submission alert
        const onNewSubmission = ({ studentName, score, timeTaken, quizCode }) => {
            if (quizCode === monitoringCode) {
                const entry = { studentName, score, timeTaken, submittedAt: Date.now() };
                setLiveSubmissions(prev => [entry, ...prev]);
                setNotifications(prev => [`🎓 ${studentName} submitted — ${score}%`, ...prev.slice(0, 4)]);
            }
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('quiz:students:update', onStudentsUpdate);
        socket.on('quiz:new:submission', onNewSubmission);

        if (socket.connected) setSocketConnected(true);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('quiz:students:update', onStudentsUpdate);
            socket.off('quiz:new:submission', onNewSubmission);
        };
    }, [monitoringCode]);

    const startMonitoring = async (code) => {
        const codeToWatch = (code || monitorCode).toUpperCase().trim();
        if (!codeToWatch) return;

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

        // Start watching
        const socket = connectSocket();
        const doWatch = () => socket.emit('quiz:teacher:watch', { quizCode: codeToWatch });
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
        { id: 'create', label: 'Create Quiz', icon: PlusCircle, external: true },
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

                <nav className="flex-1 p-3 mt-4 space-y-1">
                    {navItems.map(item => (
                        <button key={item.id}
                            onClick={() => item.external ? navigate('/quiz') : setActiveTab(item.id)}
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
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-1">
                            {activeTab === 'overview' && "Here's your teaching dashboard at a glance."}
                            {activeTab === 'quizzes' && 'Manage all your created quizzes and view answer keys.'}
                            {activeTab === 'live' && 'Real-time view of who is taking your exam right now.'}
                            {activeTab === 'leaderboard' && 'See how students are performing across all quizzes.'}
                        </p>
                    </div>
                    <button onClick={() => navigate('/quiz')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:scale-105 transition-all duration-200">
                        <PlusCircle size={18} /> Create New Quiz
                    </button>
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
                                        <QuizCard key={quiz.code} quiz={quiz} onNavigate={navigate} onMonitor={(code) => { setActiveTab('live'); startMonitoring(code); }} />
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
                                    <QuizCard key={quiz.code} quiz={quiz} onNavigate={navigate} showFull onMonitor={(code) => { setActiveTab('live'); startMonitoring(code); }} />
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
                {activeTab === 'leaderboard' && <LeaderboardSection />}
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
                                            <span className="font-semibold text-[var(--text-primary)] text-sm flex-1">{s.name}</span>
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
                                                <div className="font-semibold text-[var(--text-primary)] text-sm">{s.studentName}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">
                                                    {s.timeTaken ? `${Math.floor(s.timeTaken / 60)}m ${s.timeTaken % 60}s` : 'N/A'}
                                                </div>
                                            </div>
                                            <div className={`text-lg font-black ${s.score >= 70 ? 'text-emerald-500' : s.score >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                                {s.score}%
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
function QuizCard({ quiz, onNavigate, showFull = false, onMonitor }) {
    const copyCode = () => { navigator.clipboard.writeText(quiz.code); alert(`Code "${quiz.code}" copied!`); };

    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-violet-500/30 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-3">
                <h3 className="font-black text-[var(--text-primary)] text-base line-clamp-2 flex-1 pr-2 group-hover:text-violet-500 transition-colors">{quiz.title}</h3>
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
function LeaderboardSection() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/quiz/leaderboard`, { credentials: 'include' });
                const data = await res.json();
                if (data.success) setLeaderboard(data.leaderboard);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return <div className="text-center py-20 text-[var(--text-muted)]">Loading...</div>;
    if (leaderboard.length === 0) return (
        <div className="text-center py-20 bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl">
            <Trophy size={64} className="mx-auto mb-4 text-amber-400 opacity-40" />
            <p className="text-xl text-[var(--text-muted)]">No students have taken a quiz yet.</p>
        </div>
    );

    return (
        <div className="space-y-3 max-w-4xl">
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
                        <div className="font-bold text-[var(--text-primary)]">{p.name}</div>
                        <div className="flex gap-4 text-xs text-[var(--text-secondary)] mt-0.5">
                            <span>📝 {p.quizzesTaken || 0} quizzes</span>
                            <span>⚡ {p.streak || 0} streak</span>
                            <span>⏱ Best: {p.time}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-[var(--text-primary)]">{p.score}%</div>
                        <div className="text-xs text-[var(--text-secondary)]">Avg: {p.averageScore || 0}%</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
