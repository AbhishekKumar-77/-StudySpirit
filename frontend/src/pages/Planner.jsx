import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Map, Calendar as CalendarIcon, Target,
    BarChart3, Clock, Sparkles, Search, Bell, ChevronRight, Check,
    Plus, BookOpen, Zap, Compass, ShieldCheck, Flame, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAvatarUrl, handleAvatarError } from '../utils/avatarHelper';
import './Planner.css';
import { API_BASE } from '../config';

// Modular Planner Subcomponents
import PlannerOverview from '../components/planner/PlannerOverview';
import AcademicRoadmap from '../components/planner/AcademicRoadmap';
import WeeklySchedule from '../components/planner/WeeklySchedule';
import SkillGraph from '../components/planner/SkillGraph';
import GoalsMilestones from '../components/planner/GoalsMilestones';
import ProgressAnalytics from '../components/planner/ProgressAnalytics';
import DeadlinesManager from '../components/planner/DeadlinesManager';
import AIPlanBuilderModal from '../components/planner/AIPlanBuilderModal';
import AddTaskModal from '../components/planner/AddTaskModal';
import SetGoalModal from '../components/planner/SetGoalModal';
import AddDeadlineModal from '../components/planner/AddDeadlineModal';

export default function Planner() {
    const { user } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSemesterNum, setSelectedSemesterNum] = useState(2);

    // Modals
    const [showAIPlanModal, setShowAIPlanModal] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showAddGoalModal, setShowAddGoalModal] = useState(false);
    const [showAddDeadlineModal, setShowAddDeadlineModal] = useState(false);

    // Forms State
    const [aiForm, setAiForm] = useState({
        targetRole: 'Software Engineer',
        hoursPerDay: 4,
        preferredFocus: 'Data Structures & Algorithms'
    });

    const [newTaskForm, setNewTaskForm] = useState({
        title: '',
        dayLabel: 'Mon',
        taskType: 'LEARN',
        durationMinutes: 60,
        courseName: 'Data Structures'
    });

    const [newGoalForm, setNewGoalForm] = useState({
        role: 'Software Engineer',
        targetDate: 'June 2027'
    });

    const [deadlineForm, setDeadlineForm] = useState({
        title: '',
        category: 'Academic',
        urgency: 'Due this week',
        date: 'May 30, 2026'
    });

    // Central Planner State connected to MongoDB
    const [state, setState] = useState({
        profile: {
            displayName: user?.name || user?.username || 'Student',
            level: user?.level || 3,
            xp: user?.xp || 4630,
            xpToNextLevel: 6000,
            currentSemester: 2,
            batch: 'CSE — 2026 Batch',
            department: 'Computer Science & Engineering',
            targetRole: 'Software Engineer',
            targetDate: 'June 2027',
            currentFocus: { course: 'Data Structures', topic: 'Linked List', masteryPercent: 66 },
            careerSteps: []
        },
        semesters: [
            { number: 1, label: 'Semester 1', status: 'completed' },
            { number: 2, label: 'Semester 2', status: 'current' },
            { number: 3, label: 'Semester 3', status: 'upcoming' },
            { number: 4, label: 'Semester 4', status: 'upcoming' },
            { number: 5, label: 'Semester 5', status: 'upcoming' },
            { number: 6, label: 'Semester 6', status: 'upcoming' },
            { number: 7, label: 'Semester 7', status: 'upcoming' },
            { number: 8, label: 'Semester 8', status: 'upcoming' }
        ],
        semesterData: {},
        tasks: [],
        milestones: [],
        deadlines: [],
        recommendations: [],
        stats: {
            overallProgressPercent: 68,
            percentileRank: 65,
            weeklyHoursSpent: '0h 0m',
            weeklyHoursTarget: '7h 0m',
            weeklyHoursDiff: '+1h 30m vs last week',
            completionRate: 0,
            upcomingDeadlinesCount: 0,
            aiStatusMessage: "AI is planning your study roadmap."
        }
    });

    // ── API DATA FETCHING ─────────────────────────────────────────────
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPlannerState();
    }, [user]);

    const fetchPlannerState = async () => {
        setLoading(true);
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (user?._id) {
                headers['x-user-id'] = user._id;
            }

            const res = await fetch(`${API_BASE}/planner/full-state`, {
                headers,
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success && data.data) {
                setState(data.data);
                if (data.data.profile?.currentSemester) {
                    setSelectedSemesterNum(data.data.profile.currentSemester);
                }
            }
        } catch (err) {
            console.error('Failed to load real planner state from API:', err);
        } finally {
            setLoading(false);
        }
    };

    // ── TASK STATUS TOGGLE (PATCH API) ───────────────────────────────
    const handleToggleTask = async (taskId, currentStatus) => {
        const nextStatus = (currentStatus === 'COMPLETED' || currentStatus === 'MASTERED') ? 'NOT_STARTED' : 'COMPLETED';
        const nextCompleted = nextStatus === 'COMPLETED';

        // Optimistic UI update
        setState(prev => {
            const updatedTasks = (prev.tasks || []).map(t =>
                t._id === taskId ? { ...t, status: nextStatus, completed: nextCompleted } : t
            );
            const totalMins = updatedTasks.reduce((s, t) => s + (t.durationMinutes || 60), 0);
            const compMins = updatedTasks.filter(t => t.completed).reduce((s, t) => s + (t.durationMinutes || 60), 0);
            const pct = totalMins > 0 ? Math.round((compMins / totalMins) * 100) : 0;

            return {
                ...prev,
                tasks: updatedTasks,
                stats: {
                    ...prev.stats,
                    completionRate: pct,
                    weeklyHoursSpent: `${Math.floor(compMins / 60)}h ${compMins % 60}m`
                }
            };
        });

        try {
            const headers = { 'Content-Type': 'application/json' };
            if (user?._id) headers['x-user-id'] = user._id;

            await fetch(`${API_BASE}/planner/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers,
                credentials: 'include',
                body: JSON.stringify({ status: nextStatus })
            });
        } catch (err) {
            console.error('Failed to update task status in API:', err);
        }
    };

    // ── CREATE NEW TASK (POST API) ───────────────────────────────────
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskForm.title.trim()) return;

        const newObj = {
            title: newTaskForm.title,
            dayLabel: newTaskForm.dayLabel || 'Mon',
            dayOfWeek: newTaskForm.dayLabel || 'Mon',
            taskType: newTaskForm.taskType || 'LEARN',
            durationMinutes: Number(newTaskForm.durationMinutes) || 60,
            courseName: newTaskForm.courseName || 'Data Structures',
            status: 'NOT_STARTED',
            completed: false
        };

        try {
            const headers = { 'Content-Type': 'application/json' };
            if (user?._id) headers['x-user-id'] = user._id;

            const res = await fetch(`${API_BASE}/planner/tasks`, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify(newObj)
            });
            const data = await res.json();
            if (data.success && data.task) {
                setState(prev => ({
                    ...prev,
                    tasks: [...(prev.tasks || []), data.task]
                }));
            }
            setShowAddTaskModal(false);
            setNewTaskForm({ title: '', dayLabel: 'Mon', taskType: 'LEARN', durationMinutes: 60, courseName: 'Data Structures' });
        } catch (err) {
            console.error('Failed to post task to API:', err);
        }
    };

    // ── DELETE TASK (DELETE API) ─────────────────────────────────────
    const handleDeleteTask = async (taskId) => {
        setState(prev => ({
            ...prev,
            tasks: (prev.tasks || []).filter(t => t._id !== taskId)
        }));

        try {
            const headers = { 'Content-Type': 'application/json' };
            if (user?._id) headers['x-user-id'] = user._id;

            await fetch(`${API_BASE}/planner/tasks/${taskId}`, {
                method: 'DELETE',
                headers,
                credentials: 'include'
            });
        } catch (err) {
            console.error('Failed to delete task from API:', err);
        }
    };

    // ── AI PLAN BUILDER (POST API) ───────────────────────────────────
    const handleGenerateAIPlan = async (e) => {
        e.preventDefault();
        setAiLoading(true);
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (user?._id) headers['x-user-id'] = user._id;

            const res = await fetch(`${API_BASE}/planner/ai-plan-builder`, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify(aiForm)
            });
            const data = await res.json();
            if (data.success) {
                // Refresh complete state to load newly generated tasks and roadmap
                await fetchPlannerState();
                setShowAIPlanModal(false);
            }
        } catch (err) {
            console.error('AI Plan generation error:', err);
        } finally {
            setAiLoading(false);
        }
    };

    // ── SET CAREER GOAL (POST API) ───────────────────────────────────
    const handleSetGoal = async (e) => {
        e.preventDefault();
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (user?._id) headers['x-user-id'] = user._id;

            const res = await fetch(`${API_BASE}/planner/goals`, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify({
                    role: newGoalForm.role,
                    targetDate: newGoalForm.targetDate
                })
            });
            const data = await res.json();
            if (data.success) {
                setState(prev => ({
                    ...prev,
                    profile: {
                        ...prev.profile,
                        targetRole: newGoalForm.role,
                        targetDate: newGoalForm.targetDate
                    }
                }));
                setShowAddGoalModal(false);
            }
        } catch (err) {
            console.error('Failed to set goal in API:', err);
        }
    };

    // ── ADD DEADLINE (POST API) ──────────────────────────────────────
    const handleAddDeadline = async (e) => {
        e.preventDefault();
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (user?._id) headers['x-user-id'] = user._id;

            const res = await fetch(`${API_BASE}/planner/deadlines`, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify(deadlineForm)
            });
            const data = await res.json();
            if (data.success && data.deadline) {
                setState(prev => ({
                    ...prev,
                    deadlines: [...(prev.deadlines || []), data.deadline]
                }));
                setShowAddDeadlineModal(false);
                setDeadlineForm({ title: '', category: 'Academic', urgency: 'Due this week', date: 'May 30, 2026' });
            }
        } catch (err) {
            console.error('Failed to save deadline to API:', err);
        }
    };

    // ── DELETE DEADLINE (DELETE API) ─────────────────────────────────
    const handleDeleteDeadline = async (deadlineId) => {
        setState(prev => ({
            ...prev,
            deadlines: (prev.deadlines || []).filter(d => d._id !== deadlineId)
        }));

        try {
            const headers = { 'Content-Type': 'application/json' };
            if (user?._id) headers['x-user-id'] = user._id;

            await fetch(`${API_BASE}/planner/deadlines/${deadlineId}`, {
                method: 'DELETE',
                headers,
                credentials: 'include'
            });
        } catch (err) {
            console.error('Failed to delete deadline from API:', err);
        }
    };

    return (
        <div className="sp-planner-layout">
            {/* ── LEFT FIXED SIDEBAR ── */}
            <aside className="sp-sidebar">
                <div className="sp-sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img
                        src="/logo-icon.png"
                        alt="StudySpirit Logo"
                        style={{ width: '42px', height: '42px', objectFit: 'contain', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        <span style={{ color: '#0f172a' }}>Study</span><span style={{ color: '#e07b00', fontWeight: 900 }}>Spirit</span>
                    </span>
                </div>
                <div className="sp-sidebar-tag">AI Study Planner</div>

                {/* Primary Navigation Tabs */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'roadmap', label: 'Curriculum Roadmap', icon: Map },
                        { id: 'week', label: 'This Week Schedule', icon: CalendarIcon },
                        { id: 'skills', label: 'Skills & Learning Path', icon: Compass },
                        { id: 'goals', label: 'Goals & Milestones', icon: Target },
                        { id: 'progress', label: 'Progress & Insights', icon: BarChart3 },
                        { id: 'deadlines', label: 'Deadlines', icon: Clock }
                    ].map(nav => (
                        <button
                            key={nav.id}
                            className={`sp-nav-item ${activeTab === nav.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(nav.id)}
                        >
                            <nav.icon size={18} />
                            <span>{nav.label}</span>
                        </button>
                    ))}

                    <div className="sp-nav-section-title">Quick Actions</div>
                    <button className="sp-quick-action-btn primary" onClick={() => setShowAIPlanModal(true)}>
                        <Sparkles size={16} />
                        <span>AI Plan Builder</span>
                    </button>
                    <button className="sp-quick-action-btn" onClick={() => setShowAddTaskModal(true)}>
                        <Plus size={16} />
                        <span>Add Task</span>
                    </button>
                    <button className="sp-quick-action-btn" onClick={() => navigate('/resources')}>
                        <BookOpen size={16} />
                        <span>Explore Courses</span>
                    </button>
                    <button className="sp-quick-action-btn" onClick={() => navigate('/codespirit')}>
                        <Zap size={16} />
                        <span>Practice Now</span>
                    </button>
                </div>

                {/* Current Focus Card */}
                <div className="sp-focus-card">
                    <div className="sp-focus-header">
                        <Flame size={14} color="#10b981" />
                        <span>Your Current Focus</span>
                    </div>
                    <div className="sp-focus-title">{state.profile?.currentFocus?.course || 'Data Structures'}</div>
                    <div className="sp-focus-subtitle">{state.profile?.currentFocus?.topic || 'Linked List'}</div>
                    <div className="sp-focus-badge">{state.profile?.currentFocus?.masteryPercent || 66}% Mastered</div>
                    <button className="sp-btn-continue" onClick={() => setActiveTab('week')}>
                        Continue Learning
                    </button>
                </div>

                {/* Profile Info */}
                <div className="sp-sidebar-profile">
                    <div>
                        <div className="sp-profile-name">
                            {user?.name || state.profile?.displayName || 'Student'} <ShieldCheck size={14} color="#10b981" />
                        </div>
                        <div className="sp-profile-meta">Level {user?.level || state.profile?.level || 3} • {user?.xp || state.profile?.xp || 4630} XP</div>
                    </div>
                </div>
            </aside>

            {/* ── MAIN CONTENT CONTAINER ── */}
            <main className="sp-main-container">
                {/* Top Search & Header */}
                <header className="sp-top-header">
                    <div className="sp-search-bar">
                        <Search size={16} color="#64748b" />
                        <input
                            type="text"
                            className="sp-search-input"
                            placeholder="Search courses, skills, tasks, topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="sp-top-header-right">
                        <button className="sp-icon-btn" title="Refresh Planner" onClick={fetchPlannerState}>
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button className="sp-icon-btn" title="Weekly Calendar" onClick={() => setActiveTab('week')}>
                            <CalendarIcon size={18} />
                        </button>

                    </div>
                </header>

                {/* Content Body Rendering Organized Submodules */}
                <div className="sp-content-body">
                    {activeTab === 'overview' && (
                        <PlannerOverview
                            state={state}
                            selectedSemesterNum={selectedSemesterNum}
                            setSelectedSemesterNum={setSelectedSemesterNum}
                            setActiveTab={setActiveTab}
                            setShowAIPlanModal={setShowAIPlanModal}
                            handleToggleTask={handleToggleTask}
                            searchQuery={searchQuery}
                        />
                    )}

                    {activeTab === 'roadmap' && (
                        <AcademicRoadmap
                            state={state}
                            selectedSemesterNum={selectedSemesterNum}
                            setSelectedSemesterNum={setSelectedSemesterNum}
                        />
                    )}

                    {activeTab === 'week' && (
                        <WeeklySchedule
                            state={state}
                            handleToggleTask={handleToggleTask}
                            handleDeleteTask={handleDeleteTask}
                            setShowAddTaskModal={setShowAddTaskModal}
                            searchQuery={searchQuery}
                        />
                    )}

                    {activeTab === 'skills' && (
                        <SkillGraph
                            state={state}
                            selectedSemesterNum={selectedSemesterNum}
                            setSelectedSemesterNum={setSelectedSemesterNum}
                        />
                    )}

                    {activeTab === 'goals' && (
                        <GoalsMilestones
                            state={state}
                            setShowAddGoalModal={setShowAddGoalModal}
                            setShowAIPlanModal={setShowAIPlanModal}
                        />
                    )}

                    {activeTab === 'progress' && (
                        <ProgressAnalytics state={state} />
                    )}

                    {activeTab === 'deadlines' && (
                        <DeadlinesManager
                            state={state}
                            setShowAddDeadlineModal={setShowAddDeadlineModal}
                            handleDeleteDeadline={handleDeleteDeadline}
                        />
                    )}
                </div>
            </main>

            {/* ── MODALS (AI Plan Builder, Add Task, Set Goal, Add Deadline) ── */}
            <AIPlanBuilderModal
                isOpen={showAIPlanModal}
                onClose={() => setShowAIPlanModal(false)}
                onGenerate={handleGenerateAIPlan}
                aiForm={aiForm}
                setAiForm={setAiForm}
                loading={aiLoading}
            />

            <AddTaskModal
                isOpen={showAddTaskModal}
                onClose={() => setShowAddTaskModal(false)}
                onSubmit={handleCreateTask}
                newTaskForm={newTaskForm}
                setNewTaskForm={setNewTaskForm}
            />

            <SetGoalModal
                isOpen={showAddGoalModal}
                onClose={() => setShowAddGoalModal(false)}
                onSubmit={handleSetGoal}
                newGoalForm={newGoalForm}
                setNewGoalForm={setNewGoalForm}
            />

            <AddDeadlineModal
                isOpen={showAddDeadlineModal}
                onClose={() => setShowAddDeadlineModal(false)}
                onSubmit={handleAddDeadline}
                deadlineForm={deadlineForm}
                setDeadlineForm={setDeadlineForm}
            />
        </div>
    );
}
