import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../config';
import {
    BookOpen, FileQuestion, Trophy, Users, BarChart2, LogOut,
    PlusCircle, Clock, CheckCircle, Copy, Trash2, Eye, TrendingUp,
    Zap, Target, Award, Star, ChevronRight, Sun, Moon
} from 'lucide-react';

export default function TeacherDashboard() {
    const { user, logoutUser } = useApp();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [myQuizzes, setMyQuizzes] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [isLight, setIsLight] = useState(false);

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
        if (user && user.role !== 'teacher') {
            navigate('/dashboard');
        }
    }, [user]);

    // Fetch quizzes
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await fetch(`${API_BASE}/quiz/my-quizzes`, { credentials: 'include' });
                const data = await res.json();
                if (data.success) setMyQuizzes(data.quizzes || []);
            } catch (e) {
                console.error('Failed to fetch quizzes', e);
            } finally {
                setLoadingQuizzes(false);
            }
        };
        fetchQuizzes();
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        navigate('/');
    };

    const toggleTheme = () => {
        document.documentElement.classList.toggle('light');
        setIsLight(prev => !prev);
    };

    const totalQuestions = myQuizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0);
    const publishedCount = myQuizzes.filter(q => q.status === 'published').length;
    const draftCount = myQuizzes.filter(q => q.status === 'draft').length;

    const stats = [
        { label: 'Total Quizzes', value: myQuizzes.length, icon: FileQuestion, color: 'from-violet-500 to-indigo-600', bg: 'bg-violet-500/10', text: 'text-violet-500' },
        { label: 'Published', value: publishedCount, icon: CheckCircle, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
        { label: 'Drafts', value: draftCount, icon: Clock, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10', text: 'text-amber-500' },
        { label: 'Total Questions', value: totalQuestions, icon: Target, color: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col z-40 shadow-xl">
                {/* Logo */}
                <div className="p-6 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <BookOpen size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="font-black text-lg text-[var(--text-primary)]">StudySpirit</div>
                            <div className="text-xs text-violet-500 font-bold uppercase tracking-wider">Teacher Portal</div>
                        </div>
                    </div>
                </div>

                {/* Teacher Profile */}
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

                {/* Nav Items */}
                <nav className="flex-1 p-3 mt-4 space-y-1">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart2 },
                        { id: 'quizzes', label: 'My Quizzes', icon: FileQuestion },
                        { id: 'create', label: 'Create Quiz', icon: PlusCircle },
                        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => item.id === 'create' ? navigate('/quiz') : setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === item.id && item.id !== 'create'
                                    ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                            {item.id === 'create' && <ChevronRight size={14} className="ml-auto opacity-50" />}
                        </button>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-[var(--border-color)] space-y-1">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)] transition-all"
                    >
                        {isLight ? <Moon size={18} /> : <Sun size={18} />}
                        {isLight ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 p-8 min-h-screen">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-primary)]">
                            {activeTab === 'overview' && `Welcome back, ${user?.name?.split(' ')[0] || 'Teacher'}! 👋`}
                            {activeTab === 'quizzes' && 'My Quizzes'}
                            {activeTab === 'leaderboard' && 'Student Leaderboard'}
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-1">
                            {activeTab === 'overview' && 'Here\'s your teaching dashboard at a glance.'}
                            {activeTab === 'quizzes' && 'Manage all your created quizzes.'}
                            {activeTab === 'leaderboard' && 'See how students are performing across all quizzes.'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/quiz')}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:scale-105 transition-all duration-200"
                    >
                        <PlusCircle size={18} /> Create New Quiz
                    </button>
                </div>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                            {stats.map((s, i) => (
                                <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-violet-500/30 hover:shadow-lg transition-all duration-300">
                                    <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                                        <s.icon size={24} className={s.text} />
                                    </div>
                                    <div className="text-3xl font-black text-[var(--text-primary)] mb-1">{s.value}</div>
                                    <div className="text-sm text-[var(--text-secondary)] font-medium">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-primary)] mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => navigate('/quiz')}
                                    className="flex items-center gap-4 p-6 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-violet-500/30 hover:scale-[1.02] transition-all text-left"
                                >
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <PlusCircle size={24} />
                                    </div>
                                    <div>
                                        <div className="font-black text-lg">Create Quiz</div>
                                        <div className="text-white/70 text-sm">Build or AI-generate questions</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab('quizzes')}
                                    className="flex items-center gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl hover:border-violet-500/40 hover:shadow-lg transition-all text-left"
                                >
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                        <FileQuestion size={24} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <div className="font-black text-lg text-[var(--text-primary)]">Manage Quizzes</div>
                                        <div className="text-[var(--text-secondary)] text-sm">Edit, publish or share codes</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab('leaderboard')}
                                    className="flex items-center gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl hover:border-amber-500/40 hover:shadow-lg transition-all text-left"
                                >
                                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                        <Trophy size={24} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <div className="font-black text-lg text-[var(--text-primary)]">View Leaderboard</div>
                                        <div className="text-[var(--text-secondary)] text-sm">Track student performance</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Recent Quizzes */}
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-primary)] mb-4">Recent Quizzes</h2>
                            {loadingQuizzes ? (
                                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 text-center text-[var(--text-muted)]">Loading...</div>
                            ) : myQuizzes.length === 0 ? (
                                <div className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl p-12 text-center">
                                    <FileQuestion size={48} className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
                                    <p className="text-[var(--text-muted)] mb-4">No quizzes yet. Create your first quiz!</p>
                                    <button onClick={() => navigate('/quiz')} className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all">
                                        Create Quiz
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {myQuizzes.slice(0, 6).map(quiz => (
                                        <QuizCard key={quiz.code} quiz={quiz} onNavigate={navigate} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* QUIZZES TAB */}
                {activeTab === 'quizzes' && (
                    <div>
                        {loadingQuizzes ? (
                            <div className="text-center py-20 text-[var(--text-muted)]">Loading your quizzes...</div>
                        ) : myQuizzes.length === 0 ? (
                            <div className="text-center py-20">
                                <FileQuestion size={64} className="mx-auto mb-4 text-[var(--text-muted)] opacity-40" />
                                <p className="text-xl text-[var(--text-muted)] mb-6">No quizzes yet</p>
                                <button onClick={() => navigate('/quiz')} className="px-8 py-4 bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all">
                                    Create Your First Quiz
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {myQuizzes.map(quiz => (
                                    <QuizCard key={quiz.code} quiz={quiz} onNavigate={navigate} showFull />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* LEADERBOARD TAB */}
                {activeTab === 'leaderboard' && (
                    <LeaderboardSection />
                )}
            </div>
        </div>
    );
}

// ── Quiz Card Component ──────────────────────────────────────────
function QuizCard({ quiz, onNavigate, showFull = false }) {
    const copyCode = () => {
        navigator.clipboard.writeText(quiz.code);
        alert(`Code "${quiz.code}" copied! Share it with your students.`);
    };

    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-violet-500/30 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-3">
                <h3 className="font-black text-[var(--text-primary)] text-base line-clamp-2 flex-1 pr-2 group-hover:text-violet-500 transition-colors">{quiz.title}</h3>
                <span className={`shrink-0 text-xs px-2 py-1 rounded-lg font-bold ${quiz.status === 'published'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}>
                    {quiz.status === 'published' ? '✓ Live' : '⏳ Draft'}
                </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)] mb-4">
                <span className="flex items-center gap-1 bg-[var(--border-color)] px-2 py-1 rounded-lg">
                    <FileQuestion size={12} /> {quiz.questions?.length || 0} Qs
                </span>
                <span className="flex items-center gap-1 bg-[var(--border-color)] px-2 py-1 rounded-lg">
                    <Clock size={12} /> {quiz.settings?.timeLimit || 30}m
                </span>
                <span className="flex items-center gap-1 bg-[var(--border-color)] px-2 py-1 rounded-lg">
                    <Target size={12} /> {quiz.settings?.difficulty || 'medium'}
                </span>
            </div>

            {quiz.status === 'published' && (
                <div className="flex items-center gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-4">
                    <span className="text-sm text-[var(--text-secondary)]">Code:</span>
                    <span className="font-black text-violet-600 dark:text-violet-400 tracking-widest text-base flex-1">{quiz.code}</span>
                    <button onClick={copyCode} className="p-1.5 hover:bg-violet-500/20 rounded-lg transition-all" title="Copy code">
                        <Copy size={14} className="text-violet-500" />
                    </button>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => onNavigate('/quiz')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--border-color)] hover:bg-violet-500/10 hover:text-violet-500 text-[var(--text-secondary)] rounded-xl text-sm font-semibold transition-all"
                >
                    <Eye size={15} /> Edit
                </button>
                {quiz.status === 'published' && (
                    <button
                        onClick={copyCode}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold transition-all"
                    >
                        <Copy size={15} /> Share Code
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Leaderboard Component ────────────────────────────────────────
function LeaderboardSection() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(`${API_BASE}/quiz/leaderboard`, { credentials: 'include' });
                const data = await res.json();
                if (data.success) setLeaderboard(data.leaderboard);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch_();
    }, []);

    if (loading) return <div className="text-center py-20 text-[var(--text-muted)]">Loading leaderboard...</div>;

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
                        i === 1 ? 'bg-slate-300/5 border-slate-400/20' :
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
