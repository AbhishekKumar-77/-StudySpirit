import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Map, Calendar as CalendarIcon, Award, Target,
    BarChart3, Clock, Sparkles, Search, Bell, ChevronRight, Check,
    Plus, Play, CheckCircle2, Circle, AlertCircle, BookOpen,
    Code, ArrowUpRight, Zap, RefreshCw, X, User, Flame, Filter,
    Layers, Compass, ArrowRight, ShieldCheck, Dumbbell, FolderGit2
} from 'lucide-react';
import './Planner.css';
import { API_BASE } from '../config';

export default function Planner() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSemesterNum, setSelectedSemesterNum] = useState(2);

    // Modals
    const [showAIPlanModal, setShowAIPlanModal] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showAddGoalModal, setShowAddGoalModal] = useState(false);

    // AI Builder Form State
    const [aiForm, setAiForm] = useState({
        targetRole: 'Backend Developer',
        hoursPerDay: 4,
        preferredFocus: 'Data Structures & Algorithms'
    });

    // Add Task Form State
    const [newTaskForm, setNewTaskForm] = useState({
        title: '',
        dayLabel: 'Thu 15',
        taskType: 'LEARN',
        durationMinutes: 60,
        courseName: 'Data Structures'
    });

    // Add Goal Form State
    const [newGoalForm, setNewGoalForm] = useState({
        role: 'Software Engineer',
        targetDate: 'June 2027'
    });

    // Planner Full State from Backend
    const [state, setState] = useState({
        profile: {
            displayName: 'sasa',
            level: 3,
            xp: 4630,
            xpToNextLevel: 6000,
            currentSemester: 2,
            batch: 'CSE — 2026 Batch',
            department: 'Computer Science & Engineering',
            targetRole: 'Software Engineer',
            targetDate: 'June 2027',
            currentFocus: { course: 'Data Structures', topic: 'Linked List', masteryPercent: 66 }
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
        courses: [
            { name: 'Data Structures', mastery: 72, color: '#10b981' },
            { name: 'Object Oriented Programming', mastery: 65, color: '#8b5cf6' },
            { name: 'Database Management Systems', mastery: 40, color: '#f59e0b' },
            { name: 'Discrete Mathematics', mastery: 65, color: '#06b6d4' },
            { name: 'Computer Organization', mastery: 30, color: '#ef4444' }
        ],
        skills: [
            { name: 'Programming Fundamentals', mastery: 100, status: 'Completed', color: '#10b981' },
            { name: 'Data Structures', mastery: 68, status: 'In Progress', color: '#10b981' },
            { name: 'Algorithms', mastery: 30, status: 'Recommended Next', color: '#f59e0b' },
            { name: 'C++ Programming', mastery: 70, status: 'In Progress', color: '#10b981' },
            { name: 'Git & GitHub', mastery: 80, status: 'In Progress', color: '#8b5cf6' },
            { name: 'Problem Solving', mastery: 60, status: 'In Progress', color: '#f59e0b' },
            { name: 'Web Fundamentals', mastery: 25, status: 'In Progress', color: '#06b6d4' },
            { name: 'Database Systems', mastery: 20, status: 'In Progress', color: '#ef4444' },
            { name: 'Software Engineering', mastery: 0, status: 'Locked', color: '#94a3b8' }
        ],
        projects: [
            {
                _id: 'p1',
                name: 'Library Management System',
                status: 'In Progress',
                progress: 45,
                dueDate: 'May 30, 2026',
                relatedSkills: ['C++', 'OOP', 'Database', 'Git', 'Problem Solving']
            }
        ],
        tasks: [
            { _id: 't1', title: 'Arrays & Linked List — Concepts', dayLabel: 'Mon 12', durationMinutes: 60, taskType: 'LEARN', status: 'COMPLETED', completed: true },
            { _id: 't2', title: 'Linked List — Practice Problems', dayLabel: 'Tue 13', durationMinutes: 90, taskType: 'PRACTICE', status: 'COMPLETED', completed: true },
            { _id: 't3', title: 'Linked List — Quiz', dayLabel: 'Wed 14', durationMinutes: 30, taskType: 'QUIZ', status: 'COMPLETED', completed: true },
            { _id: 't4', title: 'Stack — Concepts', dayLabel: 'Thu 15', durationMinutes: 60, taskType: 'LEARN', status: 'NOT_STARTED', completed: false },
            { _id: 't5', title: 'Stack — Practice Problems', dayLabel: 'Fri 16', durationMinutes: 90, taskType: 'PRACTICE', status: 'NOT_STARTED', completed: false },
            { _id: 't6', title: 'Mini Assessment', dayLabel: 'Sat 17', durationMinutes: 45, taskType: 'ASSESSMENT', status: 'NOT_STARTED', completed: false },
            { _id: 't7', title: 'Project Work — Library Management', dayLabel: 'Sun 18', durationMinutes: 120, taskType: 'PROJECT', status: 'NOT_STARTED', completed: false }
        ],
        milestones: [
            { _id: 'm1', title: 'First Steps', description: 'Complete your first course.', current: 1, target: 1, completed: true, locked: false, icon: '🎓' },
            { _id: 'm2', title: 'Problem Solver', description: 'Solve 100 problems.', current: 72, target: 100, completed: false, locked: false, icon: '📜' },
            { _id: 'm3', title: 'Project Builder', description: 'Build 3 projects.', current: 1, target: 3, completed: false, locked: false, icon: '💻' },
            { _id: 'm4', title: 'DSA Master', description: 'Solve 200 DSA problems.', current: 72, target: 200, completed: false, locked: false, icon: '🧠' },
            { _id: 'm5', title: 'Placement Ready', description: 'Complete all required requirements.', current: 0, target: 100, completed: false, locked: true, icon: '🔒' }
        ],
        deadlines: [
            { _id: 'd1', title: 'DBMS Midterm Exam', date: 'May 20, 2026', category: 'Academic', urgency: 'Due this week' },
            { _id: 'd2', title: 'DSA Assignment 3', date: 'May 25, 2026', category: 'Academic', urgency: 'Due next week' },
            { _id: 'd3', title: 'Library Management Project', date: 'May 30, 2026', category: 'Projects', urgency: 'Due this month' },
            { _id: 'd4', title: 'Summer Internship Application', date: 'Jun 10, 2026', category: 'Career', urgency: 'Upcoming' }
        ],
        recommendations: [
            {
                recType: 'focus',
                badgeLabel: 'Focus recommendation',
                title: 'Focus on Data Structures',
                description: 'Your DSA accuracy is improving but needs more practice.',
                actionText: 'Practice Now →'
            },
            {
                recType: 'weak_area',
                badgeLabel: 'Weak-area recommendation',
                title: 'Weak Area: Recursion',
                description: 'We recommend: 3 lessons and 5 practice problems.',
                actionText: 'Start Learning →'
            },
            {
                recType: 'project',
                badgeLabel: 'Project recommendation',
                title: 'Project Suggestion',
                description: 'Build a To-Do App using C++ and File Handling.',
                actionText: 'Explore →'
            }
        ],
        stats: {
            overallProgressPercent: 68,
            percentileRank: 65,
            weeklyHoursSpent: '6h 20m',
            weeklyHoursTarget: '7h 15m',
            weeklyHoursDiff: '+1h 30m vs last week',
            completionRate: 55,
            upcomingDeadlinesCount: 3,
            aiStatusMessage: "Keep going! You're 72% towards completing this week's plan."
        }
    });

    // Fetch Full Planner State from API
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPlannerState();
    }, []);

    const fetchPlannerState = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/planner/full-state`, {
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setState(data.data);
            }
        } catch (err) {
            console.error('Failed to load planner state from API:', err);
        } finally {
            setLoading(false);
        }
    };

    // Toggle Task Completion Lifecycle Status
    const handleToggleTask = async (taskId, currentStatus) => {
        const nextStatus = (currentStatus === 'COMPLETED' || currentStatus === 'MASTERED') ? 'NOT_STARTED' : 'COMPLETED';
        const nextCompleted = nextStatus === 'COMPLETED';

        // Optimistic UI update
        setState(prev => {
            const updatedTasks = prev.tasks.map(t =>
                t._id === taskId ? { ...t, status: nextStatus, completed: nextCompleted } : t
            );
            const totalMins = updatedTasks.reduce((s, t) => s + (t.durationMinutes || 60), 0);
            const compMins = updatedTasks.filter(t => t.completed).reduce((s, t) => s + (t.durationMinutes || 60), 0);
            const pct = Math.round((compMins / totalMins) * 100);

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
            await fetch(`${API_BASE}/api/planner/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });
        } catch (err) {
            console.error('Failed to toggle task lifecycle:', err);
        }
    };

    // Create New Task
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskForm.title.trim()) return;

        const newObj = {
            _id: `t_${Date.now()}`,
            title: newTaskForm.title,
            dayLabel: newTaskForm.dayLabel,
            taskType: newTaskForm.taskType,
            durationMinutes: Number(newTaskForm.durationMinutes),
            status: 'NOT_STARTED',
            completed: false
        };

        setState(prev => ({
            ...prev,
            tasks: [...prev.tasks, newObj]
        }));
        setShowAddTaskModal(false);
        setNewTaskForm({ title: '', dayLabel: 'Thu 15', taskType: 'LEARN', durationMinutes: 60, courseName: 'Data Structures' });

        try {
            await fetch(`${API_BASE}/api/planner/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newObj)
            });
        } catch (err) {
            console.error('Failed to post task:', err);
        }
    };

    // AI Plan Builder Submit
    const handleGenerateAIPlan = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/planner/ai-plan-builder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aiForm)
            });
            const data = await res.json();
            if (data.success) {
                setState(prev => ({
                    ...prev,
                    profile: {
                        ...prev.profile,
                        targetRole: data.targetRole
                    }
                }));
                setShowAIPlanModal(false);
            }
        } catch (err) {
            console.error('AI Plan generation error:', err);
        }
    };

    // Filter items based on global search query
    const filteredCourses = state.courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredSkills = state.skills.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredTasks = state.tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="sp-planner-layout">
            {/* Sidebar (Fixed position) */}
            <aside className="sp-sidebar">
                <div className="sp-sidebar-brand">
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

                {/* Navigation Items */}
                <div style={{ flex: 1 }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'roadmap', label: 'Roadmap', icon: Map },
                        { id: 'week', label: 'This Week', icon: CalendarIcon },
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
                    <div className="sp-focus-title">{state.profile.currentFocus?.course || 'Data Structures'}</div>
                    <div className="sp-focus-subtitle">{state.profile.currentFocus?.topic || 'Linked List'}</div>
                    <div className="sp-focus-badge">{state.profile.currentFocus?.masteryPercent || 66}% Mastered</div>
                    <button className="sp-btn-continue" onClick={() => setActiveTab('week')}>
                        Continue Learning
                    </button>
                </div>

                {/* Profile Pill */}
                <div className="sp-sidebar-profile">
                    <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        alt="Avatar"
                        className="sp-avatar"
                    />
                    <div>
                        <div className="sp-profile-name">
                            {state.profile.displayName} <ShieldCheck size={14} color="#10b981" />
                        </div>
                        <div className="sp-profile-meta">Level {state.profile.level} • {state.profile.xp} XP</div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="sp-main-container">
                {/* Top Header */}
                <header className="sp-top-header">
                    <div className="sp-search-bar">
                        <Search size={16} color="#64748b" />
                        <input
                            type="text"
                            className="sp-search-input"
                            placeholder="Search for topics, skills, courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="sp-top-header-right">
                        <button className="sp-icon-btn" title="Notifications">
                            <Bell size={18} />
                            <span className="sp-icon-dot" />
                        </button>
                        <button className="sp-icon-btn" title="Calendar" onClick={() => setActiveTab('week')}>
                            <CalendarIcon size={18} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                                alt="Profile"
                                className="sp-avatar"
                            />
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <div className="sp-content-body">
                    {/* Main Header & AI Status Card */}
                    <div className="sp-page-header-row">
                        <div>
                            <h1 className="sp-page-title">Your Study Planner ✨</h1>
                            <p className="sp-page-subtitle">Your personalized roadmap to learn, practice and achieve.</p>
                        </div>

                        {/* Dynamic AI Status Card */}
                        <div className="sp-ai-status-card" onClick={() => setShowAIPlanModal(true)}>
                            <div className="sp-ai-icon-box">🤖</div>
                            <div>
                                <div className="sp-ai-status-title">AI is planning your success</div>
                                <div className="sp-ai-status-desc">{state.stats.aiStatusMessage}</div>
                            </div>
                            <ChevronRight size={18} color="#7e22ce" style={{ marginLeft: 'auto' }} />
                        </div>
                    </div>

                    {/* Top 4 Summary Cards */}
                    <div className="sp-summary-grid">
                        {/* Card 1: Current Semester */}
                        <div className="sp-summary-card">
                            <div className="sp-summary-card-header">
                                <span className="sp-summary-title">Current Semester</span>
                                <div className="sp-summary-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>🎓</div>
                            </div>
                            <div className="sp-summary-value">Semester {state.profile.currentSemester}</div>
                            <div className="sp-summary-subtext">{state.profile.batch}</div>
                            <a href="#roadmap" className="sp-summary-link" onClick={() => setActiveTab('roadmap')}>View Roadmap →</a>
                        </div>

                        {/* Card 2: Overall Progress */}
                        <div className="sp-summary-card">
                            <div className="sp-summary-card-header">
                                <span className="sp-summary-title">Overall Progress</span>
                                <div className="sp-summary-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>📊</div>
                            </div>
                            <div className="sp-summary-value">{state.stats.overallProgressPercent}%</div>
                            <div className="sp-summary-subtext">You're ahead of {state.stats.percentileRank}% of learners</div>
                            <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>Keep it up! 🚀</div>
                        </div>

                        {/* Card 3: Weekly Progress */}
                        <div className="sp-summary-card">
                            <div className="sp-summary-card-header">
                                <span className="sp-summary-title">Weekly Progress</span>
                                <div className="sp-summary-icon" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>📈</div>
                            </div>
                            <div className="sp-summary-value">{state.stats.weeklyHoursSpent}</div>
                            <div className="sp-summary-subtext">{state.stats.weeklyHoursDiff}</div>
                        </div>

                        {/* Card 4: Upcoming Deadlines */}
                        <div className="sp-summary-card">
                            <div className="sp-summary-card-header">
                                <span className="sp-summary-title">Upcoming Deadlines</span>
                                <div className="sp-summary-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>📅</div>
                            </div>
                            <div className="sp-summary-value">{state.stats.upcomingDeadlinesCount}</div>
                            <div className="sp-summary-subtext">Due this week</div>
                            <a href="#deadlines" className="sp-summary-link" onClick={() => setActiveTab('deadlines')}>View All →</a>
                        </div>
                    </div>

                    {/* OVERVIEW TAB CONTENT (Full Wireframe Layout) */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Academic Roadmap Timeline */}
                            <div className="sp-section-card">
                                <div className="sp-section-title-row">
                                    <div className="sp-section-title">Academic Roadmap</div>
                                </div>
                                <div className="sp-roadmap-track">
                                    <div className="sp-roadmap-line" />
                                    {state.semesters.map(sem => (
                                        <div
                                            key={sem.number}
                                            className={`sp-roadmap-node ${sem.status}`}
                                            onClick={() => {
                                                setSelectedSemesterNum(sem.number);
                                                setActiveTab('roadmap');
                                            }}
                                        >
                                            <div className="sp-node-circle">
                                                {sem.status === 'completed' ? <Check size={14} /> : sem.number}
                                            </div>
                                            <div className="sp-node-label">Sem {sem.number}</div>
                                            <div className="sp-node-status">
                                                {sem.status === 'completed' ? 'Completed' : sem.status === 'current' ? 'Current' : 'Upcoming'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Main Grid: Semester Details + AI Recommendations */}
                            <div className="sp-main-grid">
                                {/* Left: Semester Details (3 Columns) */}
                                <div className="sp-section-card">
                                    <div className="sp-semester-header">
                                        Semester {state.profile.currentSemester} — Current &nbsp;
                                        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                                            ({state.profile.startDate} → {state.profile.endDate})
                                        </span>
                                    </div>

                                    <div className="sp-3col-grid">
                                        {/* Col 1: Academic Courses */}
                                        <div>
                                            <div className="sp-col-title">Academic Courses</div>
                                            {filteredCourses.map((c, i) => (
                                                <div key={i} className="sp-list-item">
                                                    <span className="sp-item-name">{c.name}</span>
                                                    <span className="sp-item-pct" style={{ color: c.color }}>{c.mastery}%</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Col 2: Skills to Build */}
                                        <div>
                                            <div className="sp-col-title">Skills to Build</div>
                                            {filteredSkills.slice(0, 4).map((sk, i) => (
                                                <div key={i} className="sp-list-item">
                                                    <span className="sp-item-name">{sk.name}</span>
                                                    <span className="sp-item-pct" style={{ color: sk.color }}>{sk.mastery}%</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Col 3: Projects */}
                                        <div>
                                            <div className="sp-col-title">Projects</div>
                                            {state.projects.map((p, i) => (
                                                <div key={i} style={{ marginBottom: '14px' }}>
                                                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', margin: '4px 0', color: '#64748b' }}>
                                                        <span style={{ color: '#0284c7', fontWeight: 600 }}>{p.status}</span>
                                                        <span style={{ fontWeight: 700 }}>{p.progress}%</span>
                                                    </div>
                                                    <div className="sp-progress-bg">
                                                        <div className="sp-progress-fill" style={{ width: `${p.progress}%` }} />
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Due: {p.dueDate}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: AI Recommendations Side Panel */}
                                <div className="sp-ai-panel">
                                    <div className="sp-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        AI Recommendations ✨
                                    </div>
                                    {state.recommendations.map((rec, i) => (
                                        <div key={i} className={`sp-recommend-card ${rec.recType}`}>
                                            <div className="sp-rec-badge">{rec.badgeLabel || 'Recommendation'}</div>
                                            <div className="sp-rec-title">{rec.title}</div>
                                            <div className="sp-rec-desc">{rec.description}</div>
                                            <button className="sp-rec-action" onClick={() => setActiveTab('week')}>
                                                {rec.actionText || 'Explore →'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Split Grid: This Week's Plan vs Skills & Learning Path */}
                            <div className="sp-weekly-split-grid">
                                {/* Left: This Week's Plan */}
                                <div className="sp-section-card">
                                    <div className="sp-section-title-row">
                                        <div className="sp-section-title">This Week's Plan</div>
                                        <button className="sp-rec-action" onClick={() => setActiveTab('week')}>View Full Schedule →</button>
                                    </div>

                                    {filteredTasks.slice(0, 7).map((t, idx) => (
                                        <div key={t._id || idx} className="sp-task-row">
                                            <div className="sp-task-left">
                                                <div className="sp-task-date">{t.dayLabel}</div>
                                                <div className="sp-task-title">{t.title}</div>
                                            </div>
                                            <div className="sp-task-right">
                                                <div className="sp-task-duration">{t.durationMinutes} min</div>
                                                <span className={`sp-type-badge ${t.taskType}`}>{t.taskType}</span>
                                                <div
                                                    className={`sp-checkbox ${t.completed ? 'checked' : ''}`}
                                                    onClick={() => handleToggleTask(t._id, t.status)}
                                                >
                                                    {t.completed && <Check size={12} />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Task Summary Bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8fafc', borderRadius: '12px', marginTop: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Planned Time</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{state.stats.weeklyHoursTarget}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Completed</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>{state.stats.weeklyHoursSpent}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Completion Rate</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>{state.stats.completionRate}%</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Skills & Learning Path */}
                                <div className="sp-section-card">
                                    <div className="sp-section-title-row">
                                        <div className="sp-section-title">Skills & Learning Path</div>
                                        <button className="sp-rec-action" onClick={() => setActiveTab('skills')}>View Path →</button>
                                    </div>

                                    {state.skills.slice(0, 6).map((sk, idx) => (
                                        <div key={idx} style={{ marginBottom: '14px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 600, color: '#0f172a' }}>{sk.name}</span>
                                                <span style={{ fontWeight: 700, color: sk.color }}>{sk.mastery}%</span>
                                            </div>
                                            <div className="sp-progress-bg">
                                                <div className="sp-progress-fill" style={{ width: `${sk.mastery}%`, backgroundColor: sk.color }} />
                                            </div>
                                            {sk.status === 'Recommended Next' && (
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                                                    Recommended Next
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Milestones Section */}
                            <div className="sp-section-card">
                                <div className="sp-section-title-row">
                                    <div className="sp-section-title">Milestones</div>
                                </div>
                                <div className="sp-milestones-grid">
                                    {state.milestones.map((m, idx) => (
                                        <div key={idx} className="sp-milestone-card">
                                            <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{m.icon}</div>
                                            <div className="sp-milestone-title">{m.title}</div>
                                            <div className="sp-milestone-desc">{m.description}</div>
                                            {m.completed ? (
                                                <div className="sp-milestone-status">✓ Completed</div>
                                            ) : m.locked ? (
                                                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>🔒 Locked</div>
                                            ) : (
                                                <div>
                                                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>{m.current} / {m.target}</div>
                                                    <div className="sp-progress-bg">
                                                        <div className="sp-progress-fill" style={{ width: `${(m.current / m.target) * 100}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ROADMAP TAB */}
                    {activeTab === 'roadmap' && (
                        <div className="sp-section-card">
                            <div className="sp-section-title">Semester Curriculum Roadmap</div>
                            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
                                Interactive view of your 8-Semester Computer Science curriculum and required milestones.
                            </p>
                            <div className="sp-3col-grid">
                                {state.courses.map((c, i) => (
                                    <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>{c.name}</div>
                                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '10px' }}>Course Mastery: {c.mastery}%</div>
                                        <div className="sp-progress-bg">
                                            <div className="sp-progress-fill" style={{ width: `${c.mastery}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* THIS WEEK TAB */}
                    {activeTab === 'week' && (
                        <div className="sp-section-card">
                            <div className="sp-section-title-row">
                                <div className="sp-section-title">This Week's Detailed Schedule</div>
                                <button className="sp-btn-continue" style={{ width: 'auto' }} onClick={() => setShowAddTaskModal(true)}>
                                    + Add New Task
                                </button>
                            </div>
                            {state.tasks.map((t, idx) => (
                                <div key={t._id || idx} className="sp-task-row" style={{ padding: '16px' }}>
                                    <div className="sp-task-left">
                                        <div className="sp-task-date" style={{ width: '70px', fontSize: '0.88rem' }}>{t.dayLabel}</div>
                                        <div>
                                            <div className="sp-task-title" style={{ fontSize: '0.95rem' }}>{t.title}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Status: {t.status}</div>
                                        </div>
                                    </div>
                                    <div className="sp-task-right">
                                        <div className="sp-task-duration">{t.durationMinutes} min</div>
                                        <span className={`sp-type-badge ${t.taskType}`}>{t.taskType}</span>
                                        <div
                                            className={`sp-checkbox ${t.completed ? 'checked' : ''}`}
                                            onClick={() => handleToggleTask(t._id, t.status)}
                                        >
                                            {t.completed && <Check size={14} />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* SKILLS & LEARNING PATH TAB */}
                    {activeTab === 'skills' && (
                        <div className="sp-section-card">
                            <div className="sp-section-title">Dependency-Aware Skill Graph</div>
                            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
                                Prerequisites and skill dependencies mapped for your career target.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                {state.skills.map((sk, idx) => (
                                    <div key={idx} style={{ padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '6px' }}>
                                            <span>{sk.name}</span>
                                            <span style={{ color: sk.color }}>{sk.mastery}%</span>
                                        </div>
                                        <div className="sp-progress-bg">
                                            <div className="sp-progress-fill" style={{ width: `${sk.mastery}%`, backgroundColor: sk.color }} />
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '8px' }}>Category: {sk.category}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* GOALS & MILESTONES TAB */}
                    {activeTab === 'goals' && (
                        <div className="sp-section-card">
                            <div className="sp-section-title-row">
                                <div className="sp-section-title">Career Goal Breakdown & Roadmap</div>
                                <button className="sp-btn-continue" style={{ width: 'auto' }} onClick={() => setShowAddGoalModal(true)}>
                                    + Set Career Goal
                                </button>
                            </div>
                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '14px', marginBottom: '24px' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                                    Target Career: {state.profile.targetRole}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 16px' }}>
                                    Target Date: {state.profile.targetDate}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {state.profile.careerSteps?.map(step => (
                                        <div key={step.step} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step.completed ? '#10b981' : '#e2e8f0', color: step.completed ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
                                                {step.completed ? '✓' : step.step}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: step.completed ? '#0f172a' : '#64748b' }}>{step.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PROGRESS & INSIGHTS TAB */}
                    {activeTab === 'progress' && (
                        <div className="sp-section-card">
                            <div className="sp-section-title">Progress & Insights Analytics</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '16px' }}>
                                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '10px' }}>Assessment Performance</div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Quiz Average: <strong>78%</strong></div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px' }}>Coding Accuracy: <strong>64%</strong></div>
                                </div>
                                <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                    <div style={{ fontWeight: 700, color: '#166534', marginBottom: '8px' }}>🤖 AI Diagnostic Insight</div>
                                    <p style={{ fontSize: '0.85rem', color: '#15803d', lineHeight: 1.5 }}>
                                        Your DSA practice is consistent, but your assessment accuracy dropped slightly this week. Review recursion & stack before moving to tree data structures.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DEADLINES TAB */}
                    {activeTab === 'deadlines' && (
                        <div className="sp-section-card">
                            <div className="sp-section-title">Categorized Deadlines</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                                {state.deadlines.map(d => (
                                    <div key={d._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Category: {d.category}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: '#d97706', fontSize: '0.88rem' }}>{d.urgency}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Due: {d.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* AI PLAN BUILDER MODAL */}
            {showAIPlanModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#ffffff', borderRadius: '20px', width: '500px', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>✨ AI Study Plan Builder</div>
                            <X size={20} cursor="pointer" onClick={() => setShowAIPlanModal(false)} />
                        </div>
                        <form onSubmit={handleGenerateAIPlan}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Target Career Role</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    value={aiForm.targetRole}
                                    onChange={(e) => setAiForm({ ...aiForm, targetRole: e.target.value })}
                                    placeholder="e.g. Backend Developer, Fullstack, AI Engineer"
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Available Daily Hours</label>
                                <input
                                    type="number"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    value={aiForm.hoursPerDay}
                                    onChange={(e) => setAiForm({ ...aiForm, hoursPerDay: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="sp-btn-continue" style={{ padding: '12px' }}>
                                Generate Personalized Roadmap & Weekly Tasks
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD TASK MODAL */}
            {showAddTaskModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#ffffff', borderRadius: '20px', width: '450px', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>+ Add Learning Task</div>
                            <X size={20} cursor="pointer" onClick={() => setShowAddTaskModal(false)} />
                        </div>
                        <form onSubmit={handleCreateTask}>
                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Task Title</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    placeholder="e.g. Binary Search Trees — Practice"
                                    value={newTaskForm.title}
                                    onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Day Label</label>
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        value={newTaskForm.dayLabel}
                                        onChange={(e) => setNewTaskForm({ ...newTaskForm, dayLabel: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Type</label>
                                    <select
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        value={newTaskForm.taskType}
                                        onChange={(e) => setNewTaskForm({ ...newTaskForm, taskType: e.target.value })}
                                    >
                                        <option value="LEARN">LEARN</option>
                                        <option value="PRACTICE">PRACTICE</option>
                                        <option value="QUIZ">QUIZ</option>
                                        <option value="ASSESSMENT">ASSESSMENT</option>
                                        <option value="PROJECT">PROJECT</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Duration (minutes)</label>
                                <input
                                    type="number"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    value={newTaskForm.durationMinutes}
                                    onChange={(e) => setNewTaskForm({ ...newTaskForm, durationMinutes: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="sp-btn-continue" style={{ padding: '12px' }}>
                                Add Task to Schedule
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* SET GOAL MODAL */}
            {showAddGoalModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#ffffff', borderRadius: '20px', width: '450px', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>🎯 Set Career Goal</div>
                            <X size={20} cursor="pointer" onClick={() => setShowAddGoalModal(false)} />
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setState(prev => ({
                                ...prev,
                                profile: {
                                    ...prev.profile,
                                    targetRole: newGoalForm.role,
                                    targetDate: newGoalForm.targetDate
                                }
                            }));
                            setShowAddGoalModal(false);
                        }}>
                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Target Career Role</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    value={newGoalForm.role}
                                    onChange={(e) => setNewGoalForm({ ...newGoalForm, role: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Target Date</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    value={newGoalForm.targetDate}
                                    onChange={(e) => setNewGoalForm({ ...newGoalForm, targetDate: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="sp-btn-continue" style={{ padding: '12px' }}>
                                Save Career Goal
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
