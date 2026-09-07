import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../config';
import {
    BookOpen, LogOut, PlusCircle, Clock, CheckCircle, Copy, Eye, Trophy,
    ChevronRight, Sun, Moon, ArrowLeft, Trash2, Users, FileQuestion,
    Target, BarChart2, Radio, Mic, Briefcase, MessageSquare, User, X,
    Download, ChevronDown, ChevronUp, Star, Award
} from 'lucide-react';
import { getAvatarUrl, handleAvatarError } from '../utils/avatarHelper';

const MODES = {
    technical: { label: 'Technical', icon: '💻', color: 'violet' },
    behavioral: { label: 'HR / Behavioral', icon: '🤝', color: 'blue' },
    resume: { label: 'CV / Resume', icon: '📄', color: 'emerald' },
    gd: { label: 'Group Discussion', icon: '🗣️', color: 'amber' }
};

export default function TeacherInterview() {
    const { user, logoutUser } = useApp();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [myExams, setMyExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLight, setIsLight] = useState(false);

    // Create exam state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newExam, setNewExam] = useState({
        title: '', modes: ['technical'], totalQuestions: 5,
        targetRole: 'Software Engineer', targetCompany: 'General Tech',
        scheduledStart: '', scheduledEnd: '', allowReAttempt: false,
        customQuestions: { technical: [] }
    });
    const [tempQuestionInputs, setTempQuestionInputs] = useState({});
    const [creating, setCreating] = useState(false);

    // Leaderboard state
    const [selectedExamCode, setSelectedExamCode] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);

    // Detail view
    const [viewingSubmission, setViewingSubmission] = useState(null);
    const [submissionDetail, setSubmissionDetail] = useState(null);

    // Theme
    useEffect(() => {
        const check = () => setIsLight(document.documentElement.classList.contains('light'));
        check();
        const obs = new MutationObserver(check);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    // Redirect non-teachers/non-admins
    useEffect(() => {
        if (user && user.role !== 'teacher' && user.role !== 'admin' && !user.isAdmin) {
            navigate('/dashboard');
        }
    }, [user]);

    const getAuthHeaders = () => {
        const userId = user?.id || user?._id || '';
        return {
            'Content-Type': 'application/json',
            ...(userId ? { 'x-user-id': userId } : {})
        };
    };

    // Fetch exams
    useEffect(() => { 
        if (user) fetchExams(); 
    }, [user]);

    const fetchExams = async () => {
        try {
            const res = await fetch(`${API_BASE}/interview-exam/my`, { 
                headers: getAuthHeaders(),
                credentials: 'include' 
            });
            const data = await res.json();
            if (data.success) setMyExams(data.exams || []);
        } catch (e) { 
            console.error('Failed to fetch exams', e); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleCreateExam = async () => {
        if (!newExam.title.trim()) { alert('Please enter an exam title'); return; }
        setCreating(true);
        try {
            const res = await fetch(`${API_BASE}/interview-exam/create`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    title: newExam.title.trim(),
                    modes: newExam.modes && newExam.modes.length > 0 ? newExam.modes : ['technical'],
                    customQuestions: newExam.customQuestions,
                    totalQuestions: newExam.totalQuestions,
                    targetRole: newExam.targetRole,
                    targetCompany: newExam.targetCompany,
                    creatorId: user?.id || user?._id,
                    creatorName: user?.name || 'Teacher',
                    settings: {
                        scheduledStart: newExam.scheduledStart || null,
                        scheduledEnd: newExam.scheduledEnd || null,
                        allowReAttempt: newExam.allowReAttempt
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`✅ Interview Exam Created!\n\nExam Code: ${data.examCode}\nShare this code with your students.`);
                setShowCreateModal(false);
                setNewExam({ 
                    title: '', 
                    modes: ['technical'], 
                    totalQuestions: 5, 
                    targetRole: 'Software Engineer', 
                    targetCompany: 'General Tech', 
                    scheduledStart: '', 
                    scheduledEnd: '', 
                    allowReAttempt: false, 
                    customQuestions: { technical: [] } 
                });
                setTempQuestionInputs({});
                fetchExams();
            } else {
                alert(data.message || 'Failed to create exam. Please check your connection.');
            }
        } catch (e) { 
            console.error('Error creating exam:', e);
            alert('Error creating exam: ' + (e.message || 'Network error')); 
        } finally { 
            setCreating(false); 
        }
    };

    const handleDeleteExam = async (code) => {
        if (!window.confirm(`Are you sure you want to delete interview exam "${code}" and all associated candidate submissions?`)) return;
        try {
            const res = await fetch(`${API_BASE}/interview-exam/${code}`, { 
                method: 'DELETE', 
                headers: getAuthHeaders(),
                credentials: 'include' 
            });
            const data = await res.json();
            if (data.success) {
                setMyExams(prev => prev.filter(e => e.code !== code));
                if (selectedExamCode === code) setSelectedExamCode('');
            } else {
                alert(data.message || 'Failed to delete exam');
            }
        } catch (e) { 
            alert('Error deleting exam'); 
        }
    };

    const fetchLeaderboard = async (code) => {
        setLeaderboardLoading(true);
        try {
            const res = await fetch(`${API_BASE}/interview-exam/${code}/leaderboard`, { 
                headers: getAuthHeaders(),
                credentials: 'include' 
            });
            const data = await res.json();
            if (data.success) setLeaderboard(data.leaderboard || []);
        } catch (e) { 
            console.error(e); 
        } finally { 
            setLeaderboardLoading(false); 
        }
    };

    useEffect(() => {
        if (selectedExamCode) fetchLeaderboard(selectedExamCode);
        else setLeaderboard([]);
    }, [selectedExamCode]);

    const fetchSubmissionDetail = async (submissionId) => {
        try {
            const res = await fetch(`${API_BASE}/interview-exam/submission/${submissionId}`, { 
                headers: getAuthHeaders(),
                credentials: 'include' 
            });
            const data = await res.json();
            if (data.success) { 
                setSubmissionDetail(data); 
                setViewingSubmission(submissionId); 
            }
        } catch (e) { 
            alert('Failed to load candidate details'); 
        }
    };

    const downloadCSV = () => {
        if (leaderboard.length === 0) return;
        const headers = ["Rank", "Reg No", "Name", "Score", "Mode", "Questions", "Time", "Strengths", "Improvements"];
        const rows = leaderboard.map(p => [
            p.rank, `"${p.registrationNumber}"`, `"${p.name}"`, p.score, p.mode,
            p.questionsAnswered, `"${p.time}"`,
            `"${(p.strengths || []).join('; ')}"`, `"${(p.improvements || []).join('; ')}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `interview_results_${selectedExamCode}.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const handleLogout = async () => { await logoutUser(); navigate('/'); };
    const toggleTheme = () => { document.documentElement.classList.toggle('light'); setIsLight(p => !p); };

    const totalExams = myExams.length;
    const totalCompleted = myExams.reduce((s, e) => s + (e.stats?.completed || 0), 0);
    const totalInProgress = myExams.reduce((s, e) => s + (e.stats?.inProgress || 0), 0);

    const navItems = [
        { id: 'overview', label: 'Overview', icon: BarChart2 },
        { id: 'exams', label: 'My Exams', icon: Mic },
        { id: 'create', label: 'Create Exam', icon: PlusCircle, action: () => setShowCreateModal(true) },
        { id: 'leaderboard', label: 'Results', icon: Trophy },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col z-40 shadow-xl">
                <div className="p-6 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                            <Mic size={20} className="text-white" />
                        </div>
                        <div>
                            <div className="font-black text-lg text-[var(--text-primary)]">StudySpirit</div>
                            <div className="text-xs text-rose-500 font-bold uppercase tracking-wider">AI Interview Hub</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 mx-3 mt-4 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20">
                    <div className="flex items-center gap-3">
                        <img
                            src={getAvatarUrl(user?.avatar)}
                            alt={user?.name || 'Teacher'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-rose-500/40 shadow-sm"
                            onError={handleAvatarError}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-[var(--text-primary)] text-sm truncate">{user?.name || 'Teacher'}</div>
                            <div className="text-xs text-rose-500 font-semibold">🎓 Instructor</div>
                        </div>
                    </div>
                </div>

                <div className="px-3 mt-4">
                    <button onClick={() => navigate('/teacher-toolkit')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all">
                        <ArrowLeft size={18} /> Back to Hub
                    </button>
                </div>

                <nav className="flex-1 p-3 mt-2 space-y-1">
                    {navItems.map(item => (
                        <button key={item.id}
                            onClick={() => item.action ? item.action() : setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === item.id && !item.action
                                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            <item.icon size={18} />
                            <span className="flex-1 text-left">{item.label}</span>
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

            {/* Main Content */}
            <div className="ml-64 flex-1 p-8 min-h-screen">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-primary)]">
                            {activeTab === 'overview' && `AI Interview Exams 🎤`}
                            {activeTab === 'exams' && 'My Interview Exams'}
                            {activeTab === 'leaderboard' && '📊 Interview Results'}
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-1">
                            {activeTab === 'overview' && "Create and manage AI-powered interview exams for your students."}
                            {activeTab === 'exams' && 'View all your created interview exams and share codes.'}
                            {activeTab === 'leaderboard' && 'View interview scores and download reports.'}
                        </p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-rose-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30 hover:scale-105 transition-all duration-200">
                        <PlusCircle size={18} /> Create Interview Exam
                    </button>
                </div>

                {/* ── OVERVIEW ── */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                            {[
                                { label: 'Total Exams', value: totalExams, icon: Mic, bg: 'bg-rose-500/10', text: 'text-rose-500' },
                                { label: 'Completed', value: totalCompleted, icon: CheckCircle, bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
                                { label: 'In Progress', value: totalInProgress, icon: Clock, bg: 'bg-amber-500/10', text: 'text-amber-500' },
                                { label: 'Total Students', value: totalCompleted + totalInProgress, icon: Users, bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
                            ].map((s, i) => (
                                <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-rose-500/30 hover:shadow-lg transition-all">
                                    <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                                        <s.icon size={24} className={s.text} />
                                    </div>
                                    <div className="text-3xl font-black text-[var(--text-primary)] mb-1">{s.value}</div>
                                    <div className="text-sm text-[var(--text-secondary)] font-medium">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Mode cards */}
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-primary)] mb-4">Interview Modes</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                {Object.entries(MODES).map(([key, mode]) => {
                                    const count = myExams.filter(e => e.modes?.includes(key)).length;
                                    return (
                                        <div key={key} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-rose-500/30 transition-all">
                                            <div className="text-3xl mb-3">{mode.icon}</div>
                                            <div className="font-black text-[var(--text-primary)] text-lg">{mode.label}</div>
                                            <div className="text-sm text-[var(--text-secondary)]">Included in {count} exam{count !== 1 ? 's' : ''}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent exams */}
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-primary)] mb-4">Recent Exams</h2>
                            {loading ? (
                                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 text-center text-[var(--text-muted)]">Loading...</div>
                            ) : myExams.length === 0 ? (
                                <div className="bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl p-12 text-center">
                                    <Mic size={48} className="mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
                                    <p className="text-[var(--text-muted)] mb-4">No interview exams yet.</p>
                                    <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all">Create Your First Exam</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {myExams.slice(0, 6).map(exam => (
                                        <ExamCard key={exam.code} exam={exam} onDelete={handleDeleteExam} onViewResults={(code) => { setSelectedExamCode(code); setActiveTab('leaderboard'); }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── MY EXAMS ── */}
                {activeTab === 'exams' && (
                    <div>
                        {loading ? (
                            <div className="text-center py-20 text-[var(--text-muted)]">Loading...</div>
                        ) : myExams.length === 0 ? (
                            <div className="text-center py-20">
                                <Mic size={64} className="mx-auto mb-4 text-[var(--text-muted)] opacity-40" />
                                <p className="text-xl text-[var(--text-muted)] mb-6">No interview exams yet</p>
                                <button onClick={() => setShowCreateModal(true)} className="px-8 py-4 bg-gradient-to-br from-rose-500 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all">Create Your First Exam</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {myExams.map(exam => (
                                    <ExamCard key={exam.code} exam={exam} onDelete={handleDeleteExam} onViewResults={(code) => { setSelectedExamCode(code); setActiveTab('leaderboard'); }} showFull />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── LEADERBOARD / RESULTS ── */}
                {activeTab === 'leaderboard' && (
                    <div className="space-y-6 max-w-5xl">
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Select Interview Exam</label>
                            <div className="flex gap-4">
                                <select
                                    value={selectedExamCode}
                                    onChange={e => setSelectedExamCode(e.target.value)}
                                    className="flex-1 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:border-rose-500 outline-none transition-colors"
                                >
                                    <option value="">-- Choose an exam --</option>
                                    {myExams.map(e => (
                                        <option key={e.code} value={e.code}>
                                            {e.title} ({e.code}) — {e.modes?.map(m => MODES[m]?.label || m).join(', ') || 'Mixed'}
                                        </option>
                                    ))}
                                </select>
                                {leaderboard.length > 0 && (
                                    <button onClick={downloadCSV} className="flex items-center gap-2 px-5 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold hover:bg-emerald-500/20 transition-all">
                                        <Download size={16} /> CSV
                                    </button>
                                )}
                            </div>
                        </div>

                        {leaderboardLoading ? (
                            <div className="text-center py-12 text-[var(--text-muted)]">Loading results...</div>
                        ) : leaderboard.length === 0 && selectedExamCode ? (
                            <div className="text-center py-12 bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-2xl">
                                <Trophy size={48} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
                                <p className="text-[var(--text-muted)]">No completed interviews for this exam yet.</p>
                            </div>
                        ) : leaderboard.length > 0 && (
                            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[var(--border-color)]">
                                                {['#', 'Reg No', 'Name', 'Score', 'Mode', 'Qs', 'Time', 'Action'].map(h => (
                                                    <th key={h} className="px-4 py-4 text-left text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboard.map((entry, idx) => (
                                                <tr key={entry.id} className={`border-b border-[var(--border-color)] hover:bg-rose-500/5 transition-colors ${idx < 3 ? 'bg-rose-500/[0.03]' : ''}`}>
                                                    <td className="px-4 py-4">
                                                        {idx === 0 ? <span className="text-xl">🥇</span> : idx === 1 ? <span className="text-xl">🥈</span> : idx === 2 ? <span className="text-xl">🥉</span> : <span className="font-black text-[var(--text-muted)]">{entry.rank}</span>}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-mono text-[var(--text-secondary)]">{entry.registrationNumber || '—'}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="font-bold text-[var(--text-primary)] text-sm">{entry.name}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`font-black text-lg ${entry.score >= 7 ? 'text-emerald-500' : entry.score >= 4 ? 'text-amber-500' : 'text-red-500'}`}>
                                                            {entry.score}/10
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm">
                                                        <span className="px-2 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-bold">{MODES[entry.mode]?.label || entry.mode}</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-bold text-[var(--text-secondary)]">{entry.questionsAnswered}</td>
                                                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">{entry.time}</td>
                                                    <td className="px-4 py-4">
                                                        <button onClick={() => fetchSubmissionDetail(entry.id)} className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-all">
                                                            <Eye size={13} /> View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── CREATE EXAM MODAL ── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black flex items-center gap-2">
                                <Mic className="text-rose-500" /> Create Interview Exam
                            </h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-[var(--border-color)] rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Exam Title *</label>
                                <input
                                    value={newExam.title}
                                    onChange={e => setNewExam(p => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Semester 6 Mock Interview"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:border-rose-500 outline-none"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Interview Modes * <span className="text-xs font-normal opacity-70">(Select one or more for a Complete Journey)</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(MODES).map(([key, mode]) => {
                                        const isSelected = newExam.modes.includes(key);
                                        return (
                                            <button key={key}
                                                onClick={() => {
                                                    setNewExam(p => {
                                                        const newModes = isSelected ? p.modes.filter(m => m !== key) : [...p.modes, key];
                                                        // Ensure at least one is selected
                                                        if (newModes.length === 0) return p;
                                                        return { ...p, modes: newModes };
                                                    });
                                                }}
                                                className={`p-3 rounded-xl border text-left transition-all font-semibold text-sm ${isSelected
                                                    ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/10'
                                                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-rose-500/30'
                                                    }`}
                                            >
                                                <span className="text-xl mr-2">{mode.icon}</span>{mode.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {newExam.modes.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-color)]">Manual Custom Questions (Optional)</h4>
                                    {newExam.modes.map((mKey) => {
                                        const customQs = newExam.customQuestions[mKey] || [];
                                        const currentInput = tempQuestionInputs[mKey] || '';
                                        
                                        return (
                                            <div key={mKey} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4">
                                                <div className="font-bold text-sm text-[var(--text-primary)] mb-2 flex items-center gap-2">
                                                    {MODES[mKey]?.icon} {MODES[mKey]?.label} Round Specific Questions
                                                </div>
                                                {customQs.length > 0 && (
                                                    <ul className="mb-3 space-y-2">
                                                        {customQs.map((q, idx) => (
                                                            <li key={idx} className="flex items-start justify-between bg-[var(--bg-secondary)] p-2 rounded-lg text-sm text-[var(--text-secondary)] border border-[var(--border-color)]">
                                                                <span className="flex-1 pr-2">{idx + 1}. {q}</span>
                                                                <button onClick={() => {
                                                                    setNewExam(p => ({
                                                                        ...p,
                                                                        customQuestions: {
                                                                            ...p.customQuestions,
                                                                            [mKey]: p.customQuestions[mKey].filter((_, i) => i !== idx)
                                                                        }
                                                                    }));
                                                                }} className="text-red-500 hover:bg-red-500/10 p-1 rounded transition-colors"><X size={14} /></button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                <div className="flex gap-2">
                                                    <input 
                                                        value={currentInput}
                                                        onChange={(e) => setTempQuestionInputs(p => ({ ...p, [mKey]: e.target.value }))}
                                                        placeholder={`Ask specific questions in the ${MODES[mKey]?.label} round...`}
                                                        className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-2.5 text-sm text-[var(--text-primary)] focus:border-rose-500 outline-none"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (!currentInput.trim()) return;
                                                                setNewExam(p => ({
                                                                    ...p,
                                                                    customQuestions: {
                                                                        ...p.customQuestions,
                                                                        [mKey]: [...(p.customQuestions[mKey] || []), currentInput.trim()]
                                                                    }
                                                                }));
                                                                setTempQuestionInputs(p => ({ ...p, [mKey]: '' }));
                                                            }
                                                        }}
                                                    />
                                                    <button 
                                                        onClick={() => {
                                                            if (!currentInput.trim()) return;
                                                            setNewExam(p => ({
                                                                ...p,
                                                                customQuestions: {
                                                                    ...p.customQuestions,
                                                                    [mKey]: [...(p.customQuestions[mKey] || []), currentInput.trim()]
                                                                }
                                                            }));
                                                            setTempQuestionInputs(p => ({ ...p, [mKey]: '' }));
                                                        }}
                                                        className="px-4 py-2 bg-rose-500/10 text-rose-500 font-bold rounded-lg hover:bg-rose-500/20 text-sm whitespace-nowrap"
                                                    >Add</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Questions</label>
                                    <input
                                        type="number" min={3} max={20}
                                        value={newExam.totalQuestions}
                                        onChange={e => setNewExam(p => ({ ...p, totalQuestions: parseInt(e.target.value) || 5 }))}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:border-rose-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Target Role</label>
                                    <select
                                        value={newExam.targetRole}
                                        onChange={e => setNewExam(p => ({ ...p, targetRole: e.target.value }))}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:border-rose-500 outline-none"
                                    >
                                        <option value="Software Engineer">Software Engineer</option>
                                        <option value="Frontend Developer">Frontend Developer</option>
                                        <option value="Backend Developer">Backend Developer</option>
                                        <option value="Full Stack Developer">Full Stack Developer</option>
                                        <option value="Data Scientist">Data Scientist</option>
                                        <option value="Product Manager">Product Manager</option>
                                        <option value="DevOps Engineer">DevOps Engineer</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Target Company</label>
                                <select
                                    value={newExam.targetCompany}
                                    onChange={e => setNewExam(p => ({ ...p, targetCompany: e.target.value }))}
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:border-rose-500 outline-none"
                                >
                                    <option value="General Tech">General Tech</option>
                                    <option value="Google">Google</option>
                                    <option value="Microsoft">Microsoft</option>
                                    <option value="Amazon">Amazon</option>
                                    <option value="Meta">Meta</option>
                                    <option value="Apple">Apple</option>
                                    <option value="Startup">High-Growth Startup</option>
                                    <option value="TCS">TCS</option>
                                    <option value="Infosys">Infosys</option>
                                    <option value="Wipro">Wipro</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Schedule Start (optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={newExam.scheduledStart}
                                        onChange={e => setNewExam(p => ({ ...p, scheduledStart: e.target.value }))}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:border-rose-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Schedule End (optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={newExam.scheduledEnd}
                                        onChange={e => setNewExam(p => ({ ...p, scheduledEnd: e.target.value }))}
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:border-rose-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newExam.allowReAttempt}
                                    onChange={e => setNewExam(p => ({ ...p, allowReAttempt: e.target.checked }))}
                                    className="w-5 h-5 accent-rose-500"
                                />
                                <span className="text-sm font-semibold text-[var(--text-secondary)]">Allow students to retake</span>
                            </label>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 px-4 rounded-xl border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-all text-[var(--text-secondary)] font-bold">Cancel</button>
                            <button onClick={handleCreateExam} disabled={creating} className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold transition-all shadow-lg shadow-rose-500/30 disabled:opacity-50">
                                {creating ? 'Creating...' : '🎤 Create Exam'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SUBMISSION DETAIL MODAL ── */}
            {viewingSubmission && submissionDetail && (
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <User className="text-rose-500" /> Interview Detail
                            </h3>
                            <button onClick={() => { setViewingSubmission(null); setSubmissionDetail(null); }} className="p-2 hover:bg-[var(--border-color)] rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border-color)]">
                                    <div className="text-xs text-[var(--text-muted)] mb-1">Student</div>
                                    <div className="font-black text-[var(--text-primary)]">{submissionDetail.submission?.studentName}</div>
                                </div>
                                <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border-color)]">
                                    <div className="text-xs text-[var(--text-muted)] mb-1">Score</div>
                                    <div className={`font-black text-2xl ${submissionDetail.submission?.overallScore >= 7 ? 'text-emerald-500' : submissionDetail.submission?.overallScore >= 4 ? 'text-amber-500' : 'text-red-500'}`}>
                                        {submissionDetail.submission?.overallScore}/10
                                    </div>
                                </div>
                            </div>

                            {submissionDetail.submission?.strengths?.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-emerald-500 mb-2 flex items-center gap-2"><Star size={16} /> Strengths</h4>
                                    <ul className="space-y-1">
                                        {submissionDetail.submission.strengths.map((s, i) => (
                                            <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                                <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" /> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {submissionDetail.submission?.improvements?.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-amber-500 mb-2 flex items-center gap-2"><Target size={16} /> Improvements</h4>
                                    <ul className="space-y-1">
                                        {submissionDetail.submission.improvements.map((s, i) => (
                                            <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                                <ChevronRight size={14} className="text-amber-500 mt-0.5 shrink-0" /> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {submissionDetail.submission?.finalFeedback && (
                                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
                                    <h4 className="font-bold text-rose-500 mb-2">Overall Feedback</h4>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{submissionDetail.submission.finalFeedback}</p>
                                </div>
                            )}

                            {/* Interview transcript */}
                            {submissionDetail.session?.exchanges?.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-[var(--text-primary)] mb-3">Interview Transcript</h4>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {submissionDetail.session.exchanges.map((ex, i) => (
                                            <div key={i} className="border border-[var(--border-color)] rounded-xl p-3">
                                                <div className="text-xs text-rose-500 font-bold mb-1">Q{ex.questionNumber}: {ex.question}</div>
                                                <div className="text-sm text-[var(--text-primary)] mb-1"><strong>Answer:</strong> {ex.answer}</div>
                                                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                                                    <span>Score: <strong className={ex.score >= 7 ? 'text-emerald-500' : ex.score >= 4 ? 'text-amber-500' : 'text-red-500'}>{ex.score}/10</strong></span>
                                                    {ex.feedback && <span>· {ex.feedback}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Exam Card Component ──────────────────────────────────────────
function ExamCard({ exam, onDelete, onViewResults, showFull = false }) {
    const copyCode = () => { navigator.clipboard.writeText(exam.code); alert(`Code "${exam.code}" copied!`); };
    const displayModes = exam.modes || [exam.mode];
    const mode = MODES[displayModes[0]] || { label: displayModes[0] || 'Mixed', icon: '🎤', color: 'rose' };

    return (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-rose-500/30 hover:shadow-lg transition-all group relative">
            {onDelete && (
                <button onClick={() => onDelete(exam.code)}
                    className="absolute top-4 right-4 p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all z-10"
                    title="Delete Exam"
                >
                    <Trash2 size={16} />
                </button>
            )}

            <div className="flex items-start justify-between mb-3 pr-8">
                <h3 className="font-black text-[var(--text-primary)] text-base line-clamp-2 flex-1 group-hover:text-rose-500 transition-colors">{exam.title}</h3>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)] mb-4">
                {displayModes.map(m => (
                    <span key={m} className="flex items-center gap-1 bg-rose-500/10 text-rose-500 px-2 py-1 rounded-lg font-bold">{MODES[m]?.icon || '🎤'} {MODES[m]?.label || m}</span>
                ))}
                <span className="flex items-center gap-1 bg-[var(--border-color)] px-2 py-1 rounded-lg"><MessageSquare size={12} /> {exam.totalQuestions} Qs</span>
                <span className="flex items-center gap-1 bg-[var(--border-color)] px-2 py-1 rounded-lg"><Briefcase size={12} /> {exam.targetRole}</span>
            </div>

            {/* Stats */}
            <div className="flex gap-3 mb-4 text-xs">
                <span className="flex items-center gap-1 text-emerald-500 font-bold">
                    <CheckCircle size={12} /> {exam.stats?.completed || 0} completed
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Clock size={12} /> {exam.stats?.inProgress || 0} active
                </span>
            </div>

            {/* Exam code */}
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-4">
                <span className="text-sm text-[var(--text-secondary)]">Code:</span>
                <span className="font-black text-rose-600 dark:text-rose-400 tracking-widest text-base flex-1">{exam.code}</span>
                <button onClick={copyCode} className="p-1.5 hover:bg-rose-500/20 rounded-lg transition-all"><Copy size={14} className="text-rose-500" /></button>
            </div>

            <div className="flex gap-2">
                <button onClick={() => onViewResults(exam.code)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--border-color)] hover:bg-rose-500/10 hover:text-rose-500 text-[var(--text-secondary)] rounded-xl text-sm font-semibold transition-all">
                    <Trophy size={15} /> Results
                </button>
            </div>
        </div>
    );
}
