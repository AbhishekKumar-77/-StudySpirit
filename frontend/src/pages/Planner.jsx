import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, CheckSquare, Target, Plus,
    Clock, AlertCircle, TrendingUp, Sparkles, X, Check,
    Edit, Trash2, ChevronRight, Flag, Brain, Timer,
    BarChart3, Award, Zap, BookOpen, Users, FileText,
    RefreshCw, Download, Upload, Copy, Flame, Settings,
    Filter, Search, Play, Pause, RotateCcw, Bell, Moon, Sun,
    GraduationCap, Layers, CalendarDays, ListChecks, Lightbulb,
    ChevronLeft, MessageSquare, Star
} from 'lucide-react';
import {
    studyPlanTemplates,
    studyTechniques,
    generateStudyPlanPrompt,
    generateCalendarDates
} from '../data/studyPlanData';
import { taskAPI, goalAPI, analyticsAPI } from '../services/plannerApi';
import { API_BASE } from '../config';

export default function Planner() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tasks');
    const [showAddTask, setShowAddTask] = useState(false);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [showPomodoro, setShowPomodoro] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [focusMode, setFocusMode] = useState(false);
    const [studyStreak, setStudyStreak] = useState(15);
    const [animateCards, setAnimateCards] = useState(false);

    // New Enhanced Features
    const [showPlanBuilder, setShowPlanBuilder] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showTechniques, setShowTechniques] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showSessionLogger, setShowSessionLogger] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [studySessions, setStudySessions] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);
    const [showTechniqueModal, setShowTechniqueModal] = useState(false);
    const [selectedTechnique, setSelectedTechnique] = useState(null);

    // AI Plan Builder State
    const [planInputs, setPlanInputs] = useState({
        subjects: '',
        daysAvailable: 7,
        hoursPerDay: 4,
        goal: '',
        currentLevel: 'beginner',
        deadline: '',
        preferredTechnique: 'pomodoro'
    });

    // Pomodoro Timer State
    const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerMode, setTimerMode] = useState('work');

    const [newTask, setNewTask] = useState({
        title: '',
        priority: 'medium',
        date: '',
        subject: 'General',
        estimatedTime: '1h'
    });

    const [newGoal, setNewGoal] = useState({
        title: '',
        deadline: '',
        type: 'custom',
        category: 'Academic'
    });

    const [tasks, setTasks] = useState([]);
    const [goals, setGoals] = useState([]);
    const [weeklyPlan, setWeeklyPlan] = useState([
        { day: 'Sun', created: 0, completed: 0 },
        { day: 'Mon', created: 0, completed: 0 },
        { day: 'Tue', created: 0, completed: 0 },
        { day: 'Wed', created: 0, completed: 0 },
        { day: 'Thu', created: 0, completed: 0 },
        { day: 'Fri', created: 0, completed: 0 },
        { day: 'Sat', created: 0, completed: 0 }
    ]);

    // Loading and Error States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Overview/Analytics State
    const [overview, setOverview] = useState({
        performance: { totalTasks: 0, completedTasks: 0, totalGoals: 0, completedGoals: 0 },
        insights: []
    });

    useEffect(() => {
        setTimeout(() => setAnimateCards(true), 100);
    }, []);

    // Fetch data from API on mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch tasks
                const tasksRes = await taskAPI.getAll();
                if (tasksRes.success) {
                    const todayStr = new Date().toLocaleDateString();
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const tomorrowStr = tomorrow.toLocaleDateString();

                    setTasks(tasksRes.tasks.map(t => {
                        let dateLabel = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date';
                        if (dateLabel === todayStr) dateLabel = 'Today';
                        else if (dateLabel === tomorrowStr) dateLabel = 'Tomorrow';

                        return {
                            ...t,
                            id: t._id,
                            completed: t.status === 'completed',
                            date: dateLabel,
                            time: t.estimatedTime ? `${Math.floor(t.estimatedTime / 60)}h ${t.estimatedTime % 60}m` : '1h'
                        };
                    }));
                }

                // Fetch goals
                const goalsRes = await goalAPI.getAll();
                if (goalsRes.success) {
                    setGoals(goalsRes.goals.map(g => ({
                        ...g,
                        id: g._id,
                        deadline: g.targetDate ? new Date(g.targetDate).toISOString().split('T')[0] : '',
                        milestones: g.milestones?.length || 0,
                        badge: g.category === 'Technical' ? '🏆' : g.category === 'Course' ? '🎯' : g.category === 'Competition' ? '⭐' : '🚀'
                    })));
                }

                // Fetch analytics overview
                const overviewRes = await analyticsAPI.getOverview();
                if (overviewRes.success) {
                    setOverview(overviewRes.overview);
                    if (overviewRes.overview.weeklyActivity) {
                        setWeeklyPlan(overviewRes.overview.weeklyActivity);
                    }
                }

                setError(null);
            } catch (err) {
                console.error('Failed to fetch planner data:', err);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let interval = null;
        if (isTimerRunning && pomodoroTime > 0) {
            interval = setInterval(() => {
                setPomodoroTime(prev => prev - 1);
            }, 1000);
        } else if (pomodoroTime === 0) {
            setIsTimerRunning(false);
            if (timerMode === 'work') {
                setTimerMode('break');
                setPomodoroTime(5 * 60);
            } else {
                setTimerMode('work');
                setPomodoroTime(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, pomodoroTime, timerMode]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Add Task via API
    const addTask = async () => {
        if (newTask.title.trim()) {
            try {
                // Parse estimated time to minutes
                let estimatedMinutes = 60;
                if (newTask.estimatedTime) {
                    const match = newTask.estimatedTime.match(/(\d+)h?\s*(\d*)m?/);
                    if (match) {
                        estimatedMinutes = (parseInt(match[1]) || 0) * 60 + (parseInt(match[2]) || 0);
                    }
                }

                const taskData = {
                    title: newTask.title,
                    priority: newTask.priority,
                    subject: newTask.subject,
                    estimatedTime: estimatedMinutes,
                    dueDate: newTask.date ? new Date(newTask.date) : null
                };

                const res = await taskAPI.create(taskData);
                if (res.success) {
                    const t = res.task;
                    setTasks([{
                        ...t,
                        id: t._id,
                        completed: t.status === 'completed',
                        date: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date',
                        time: newTask.estimatedTime
                    }, ...tasks]);
                    setNewTask({ title: '', priority: 'medium', date: '', subject: 'General', estimatedTime: '1h' });
                    setShowAddTask(false);
                    // Refresh analytics
                    refreshAnalytics();
                }
            } catch (err) {
                console.error('Failed to add task:', err);
                setError('Failed to add task');
            }
        }
    };

    // Add Goal via API
    const addGoal = async () => {
        if (newGoal.title.trim() && newGoal.deadline) {
            try {
                const goalData = {
                    title: newGoal.title,
                    targetDate: new Date(newGoal.deadline),
                    category: newGoal.category,
                    description: ''
                };

                const res = await goalAPI.create(goalData);
                if (res.success) {
                    const g = res.goal;
                    setGoals([{
                        ...g,
                        id: g._id,
                        deadline: new Date(g.targetDate).toISOString().split('T')[0],
                        milestones: 0,
                        badge: g.category === 'Technical' ? '🏆' : g.category === 'Course' ? '🎯' : g.category === 'Competition' ? '⭐' : '🚀'
                    }, ...goals]);
                    setNewGoal({ title: '', deadline: '', type: 'custom', category: 'Academic' });
                    setShowAddGoal(false);
                    refreshAnalytics();
                }
            } catch (err) {
                console.error('Failed to add goal:', err);
                setError('Failed to add goal');
            }
        }
    };

    // Toggle Task Completion via API
    const toggleTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        try {
            const newCompleted = !task.completed;
            const res = await taskAPI.toggle(id, newCompleted);
            if (res.success) {
                setTasks(tasks.map(t =>
                    t.id === id ? { ...t, completed: newCompleted, status: newCompleted ? 'completed' : 'pending' } : t
                ));
                refreshAnalytics();
            }
        } catch (err) {
            console.error('Failed to toggle task:', err);
        }
    };

    // Delete Task via API
    const deleteTask = async (id) => {
        try {
            const res = await taskAPI.delete(id);
            if (res.success) {
                setTasks(tasks.filter(task => task.id !== id));
                refreshAnalytics();
            }
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    // Delete Goal via API
    const deleteGoal = async (id) => {
        try {
            const res = await goalAPI.delete(id);
            if (res.success) {
                setGoals(goals.filter(goal => goal.id !== id));
                refreshAnalytics();
            }
        } catch (err) {
            console.error('Failed to delete goal:', err);
        }
    };

    // Update Goal Progress via API
    const updateGoalProgress = async (id, progress) => {
        try {
            const res = await goalAPI.updateProgress(id, progress);
            if (res.success) {
                setGoals(goals.map(g =>
                    g.id === id ? { ...g, progress } : g
                ));
                refreshAnalytics();
            }
        } catch (err) {
            console.error('Failed to update goal progress:', err);
        }
    };

    // Refresh Analytics
    const refreshAnalytics = async () => {
        try {
            const overviewRes = await analyticsAPI.getOverview();
            if (overviewRes.success) {
                setOverview(overviewRes.overview);
                if (overviewRes.overview.weeklyActivity) {
                    setWeeklyPlan(overviewRes.overview.weeklyActivity);
                }
            }
        } catch (err) {
            console.error('Failed to refresh analytics:', err);
        }
    };

    return (
        <>
            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
            </style>

            <div style={{
                minHeight: '100vh',
                background: focusMode
                    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                    : 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
                position: 'relative',
                paddingBottom: '60px',
                transition: 'background 1s ease'
            }}>
                {/* Background Effects */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    right: '10%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(80px)',
                    animation: 'float 8s ease-in-out infinite'
                }}></div>

                {/* Navbar */}
                <nav style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    padding: '20px 32px'
                }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: 'none',
                                color: '#34d399',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '10px',
                                border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}>
                                <Flame size={20} color="#f59e0b" />
                                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#f59e0b' }}>
                                    {studyStreak} Day Streak
                                </span>
                            </div>

                            <button
                                onClick={() => setFocusMode(!focusMode)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    background: focusMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(30, 34, 54, 0.6)',
                                    border: `1px solid ${focusMode ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                                    borderRadius: '10px',
                                    color: focusMode ? '#a855f7' : '#8892a6',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {focusMode ? <Moon size={18} /> : <Sun size={18} />}
                                Focus Mode
                            </button>

                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
                                Study Planner Pro
                            </div>
                        </div>
                    </div>
                </nav>

                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 32px' }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.2) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '40px',
                        marginBottom: '32px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.2)',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: animateCards ? 'fadeInUp 0.8s ease' : 'none'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)'
                        }}></div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                padding: '24px',
                                borderRadius: '20px',
                                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
                                animation: 'float 3s ease-in-out infinite'
                            }}>
                                <Calendar size={48} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: '#34d399',
                                    fontWeight: '600',
                                    letterSpacing: '0.1em',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase'
                                }}>
                                    Module 3 - Enhanced Edition
                                </div>
                                <h1 style={{
                                    fontSize: '2.5rem',
                                    fontWeight: '900',
                                    color: 'white',
                                    marginBottom: '12px',
                                    letterSpacing: '-0.02em'
                                }}>
                                    AI-Powered Study Planner
                                </h1>
                                <p style={{ fontSize: '1.125rem', color: '#a3b3c7' }}>
                                    Smart planning, task management & goal tracking with advanced AI assistance
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pomodoro Timer */}
                    {showPomodoro && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(251, 146, 60, 0.15))',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '20px',
                            padding: '28px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            marginBottom: '24px',
                            animation: 'fadeInUp 0.5s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <Timer size={28} color="#f59e0b" />
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
                                            Pomodoro Timer - {timerMode === 'work' ? 'Focus Time' : 'Break Time'}
                                        </h3>
                                        <div style={{ fontSize: '3rem', fontWeight: '900', color: '#f59e0b', marginTop: '8px' }}>
                                            {formatTime(pomodoroTime)}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                                        style={{
                                            padding: '12px 24px',
                                            background: isTimerRunning ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #10b981, #059669)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
                                        {isTimerRunning ? 'Pause' : 'Start'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPomodoroTime(25 * 60);
                                            setIsTimerRunning(false);
                                            setTimerMode('work');
                                        }}
                                        style={{
                                            padding: '12px',
                                            background: 'rgba(30, 34, 54, 0.6)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '12px',
                                            color: '#8892a6',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <RotateCcw size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Overview */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        {[
                            { icon: CheckSquare, label: 'Tasks Completed', value: `${overview.performance.completedTasks}/${overview.performance.totalTasks}`, color: '#10b981' },
                            { icon: Target, label: 'Active Goals', value: overview.performance.totalGoals - overview.performance.completedGoals, color: '#06b6d4' },
                            { icon: Clock, label: 'Total Tasks', value: overview.performance.totalTasks, color: '#8b5cf6' },
                            { icon: TrendingUp, label: 'Completion Rate', value: overview.performance.totalTasks > 0 ? `${Math.round((overview.performance.completedTasks / overview.performance.totalTasks) * 100)}%` : '0%', color: '#f59e0b' }
                        ].map((stat, idx) => (
                            <div key={idx} style={{
                                background: 'rgba(30, 34, 54, 0.6)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '20px',
                                padding: '28px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                transition: 'all 0.4s',
                                animation: `fadeIn ${0.5 + idx * 0.1}s ease`,
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        background: `${stat.color}20`,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        animation: 'float 3s ease-in-out infinite'
                                    }}>
                                        <stat.icon size={24} color={stat.color} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: '#8892a6', marginBottom: '4px' }}>{stat.label}</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'white' }}>{stat.value}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'techniques', label: '💡 Techniques', icon: Lightbulb },
                            { id: 'builder', label: '🤖 AI Plan Builder', icon: Brain },
                            { id: 'tasks', label: '✅ To-Do List', icon: CheckSquare },
                            { id: 'goals', label: '🎯 Goals', icon: Target },
                            { id: 'analytics', label: '📊 Analytics', icon: BarChart3 }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    background: activeTab === tab.id ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(30, 34, 54, 0.6)',
                                    color: 'white',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    transform: activeTab === tab.id ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: activeTab === tab.id ? '0 10px 30px rgba(16, 185, 129, 0.4)' : 'none'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}



                    {/* Techniques Tab */}
                    {activeTab === 'techniques' && (
                        <div>
                            <div style={{ marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
                                    💡 Study Techniques Library
                                </h2>
                                <p style={{ fontSize: '1rem', color: '#8892a6' }}>
                                    Master proven study methods to boost your learning efficiency
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '24px' }}>
                                {studyTechniques.map((technique) => (
                                    <div
                                        key={technique.id}
                                        style={{
                                            background: 'rgba(30, 34, 54, 0.6)',
                                            backdropFilter: 'blur(20px)',
                                            borderRadius: '20px',
                                            padding: '32px',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            transition: 'all 0.4s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.borderColor = technique.color + '40';
                                            e.currentTarget.style.boxShadow = `0 20px 40px ${technique.color}30`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '20px' }}>
                                            <div style={{
                                                fontSize: '3rem',
                                                lineHeight: 1,
                                                animation: 'float 3s ease-in-out infinite'
                                            }}>
                                                {technique.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                                                    {technique.name}
                                                </h3>
                                                <p style={{ fontSize: '0.95rem', color: '#a3b3c7', lineHeight: '1.6' }}>
                                                    {technique.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                            <div style={{ textAlign: 'center', padding: '12px', background: `${technique.color}15`, borderRadius: '10px' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: technique.color, marginBottom: '4px' }}>
                                                    {technique.effectiveness}%
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#8892a6' }}>Effective</div>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px' }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#6366f1', marginBottom: '4px' }}>
                                                    {technique.difficulty}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#8892a6' }}>Difficulty</div>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '10px' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#06b6d4', marginBottom: '4px', lineHeight: '1.3' }}>
                                                    {technique.timeCommitment}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#8892a6' }}>Time</div>
                                            </div>
                                        </div>

                                        {/* Best For */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#10b981', marginBottom: '10px' }}>
                                                ✨ Best For:
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {technique.bestFor.map((item, idx) => (
                                                    <span
                                                        key={idx}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: 'rgba(16, 185, 129, 0.15)',
                                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                                            borderRadius: '8px',
                                                            fontSize: '0.8rem',
                                                            color: '#34d399',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Steps */}
                                        <div style={{
                                            padding: '20px',
                                            background: `${technique.color}10`,
                                            border: `1px solid ${technique.color}30`,
                                            borderRadius: '12px'
                                        }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ListChecks size={18} color={technique.color} />
                                                How to Apply:
                                            </div>
                                            <ol style={{ margin: 0, paddingLeft: '20px', color: '#a3b3c7', fontSize: '0.875rem', lineHeight: '1.8' }}>
                                                {technique.steps.map((step, idx) => (
                                                    <li key={idx} style={{ marginBottom: '6px' }}>{step}</li>
                                                ))}
                                            </ol>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => {
                                                setSelectedTechnique(technique);
                                                setShowTechniqueModal(true);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            style={{
                                                width: '100%',
                                                background: `linear-gradient(135deg, ${technique.color}, ${technique.color}dd)`,
                                                border: 'none',
                                                color: 'white',
                                                padding: '14px',
                                                borderRadius: '12px',
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                marginTop: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                        >
                                            <Star size={18} />
                                            Start Using This Technique
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Plan Builder Tab */}
                    {activeTab === 'builder' && (
                        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
                                    🤖 AI Study Plan Builder
                                </h2>
                                <p style={{ fontSize: '1.125rem', color: '#a3b3c7', maxWidth: '600px', margin: '0 auto' }}>
                                    Answer a few questions and let AI create a personalized study plan for you
                                </p>
                            </div>

                            <div style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15))',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '24px',
                                padding: '40px',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                boxShadow: '0 20px 60px rgba(139, 92, 246, 0.2)'
                            }}>
                                {/* Form */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* Subjects/Topics */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                                            📚 What do you want to study?
                                        </label>
                                        <input
                                            type="text"
                                            value={planInputs.subjects}
                                            onChange={(e) => setPlanInputs({ ...planInputs, subjects: e.target.value })}
                                            placeholder="e.g., React, Node.js, MongoDB, DSA..."
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                background: 'rgba(30, 34, 54, 0.8)',
                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '1rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    {/* Days and Hours */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                                                📅 Days Available
                                            </label>
                                            <input
                                                type="number"
                                                value={planInputs.daysAvailable}
                                                onChange={(e) => setPlanInputs({ ...planInputs, daysAvailable: parseInt(e.target.value) })}
                                                min="1"
                                                max="365"
                                                style={{
                                                    width: '100%',
                                                    padding: '16px',
                                                    background: 'rgba(30, 34, 54, 0.8)',
                                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                                    borderRadius: '12px',
                                                    color: 'white',
                                                    fontSize: '1rem',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                                                ⏰ Hours Per Day
                                            </label>
                                            <input
                                                type="number"
                                                value={planInputs.hoursPerDay}
                                                onChange={(e) => setPlanInputs({ ...planInputs, hoursPerDay: parseInt(e.target.value) })}
                                                min="1"
                                                max="16"
                                                style={{
                                                    width: '100%',
                                                    padding: '16px',
                                                    background: 'rgba(30, 34, 54, 0.8)',
                                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                                    borderRadius: '12px',
                                                    color: 'white',
                                                    fontSize: '1rem',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Goal */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                                            🎯 What's your main goal?
                                        </label>
                                        <input
                                            type="text"
                                            value={planInputs.goal}
                                            onChange={(e) => setPlanInputs({ ...planInputs, goal: e.target.value })}
                                            placeholder="e.g., Get a job, Pass exam, Build a project..."
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                background: 'rgba(30, 34, 54, 0.8)',
                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '1rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    {/* Current Level */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                                            📊 Your Current Level
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                            {['beginner', 'intermediate', 'advanced'].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setPlanInputs({ ...planInputs, currentLevel: level })}
                                                    style={{
                                                        padding: '14px',
                                                        background: planInputs.currentLevel === level ? 'rgba(139, 92, 246, 0.3)' : 'rgba(30, 34, 54, 0.6)',
                                                        border: `2px solid ${planInputs.currentLevel === level ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)'}`,
                                                        borderRadius: '12px',
                                                        color: 'white',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        textTransform: 'capitalize',
                                                        transition: 'all 0.3s'
                                                    }}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                                            📆 Deadline (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            value={planInputs.deadline}
                                            onChange={(e) => setPlanInputs({ ...planInputs, deadline: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                background: 'rgba(30, 34, 54, 0.8)',
                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '1rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    {/* Preferred Technique */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                                            💡 Preferred Study Technique
                                        </label>
                                        <select
                                            value={planInputs.preferredTechnique}
                                            onChange={(e) => setPlanInputs({ ...planInputs, preferredTechnique: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                background: 'rgba(30, 34, 54, 0.8)',
                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="pomodoro">Pomodoro Technique</option>
                                            <option value="feynman">Feynman Technique</option>
                                            <option value="spaced">Spaced Repetition</option>
                                            <option value="active">Active Recall</option>
                                            <option value="mindmap">Mind Mapping</option>
                                            <option value="sq3r">SQ3R Method</option>
                                        </select>
                                    </div>

                                    {/* Generate Button */}
                                    <button
                                        onClick={async () => {
                                            if (!planInputs.subjects.trim()) {
                                                alert("Please enter at least one subject!");
                                                return;
                                            }

                                            setGeneratedPlan({ status: 'generating' });

                                            try {
                                                const response = await fetch(`${API_BASE}/solo/ai/study-suggestions`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    credentials: 'include',
                                                    body: JSON.stringify({
                                                        topics: `${planInputs.subjects} - Goal: ${planInputs.goal}`,
                                                        daysAvailable: planInputs.daysAvailable,
                                                        hoursPerDay: planInputs.hoursPerDay,
                                                        pressureLevel: 'medium'
                                                    })
                                                });

                                                const data = await response.json();

                                                if (data.success && data.plan) {
                                                    setGeneratedPlan({
                                                        status: 'complete',
                                                        ...data.plan
                                                    });
                                                } else {
                                                    throw new Error(data.message || "Failed to generate plan");
                                                }
                                            } catch (error) {
                                                console.error("AI Plan Error:", error);
                                                alert("Failed to connect to AI. Please try again later.");
                                                setGeneratedPlan(null);
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                            border: 'none',
                                            color: 'white',
                                            padding: '18px',
                                            borderRadius: '14px',
                                            fontSize: '1.125rem',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            marginTop: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            transition: 'all 0.3s',
                                            boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'scale(1.02)';
                                            e.target.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'scale(1)';
                                            e.target.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.4)';
                                        }}
                                    >
                                        <Sparkles size={24} />
                                        Generate AI Study Plan
                                    </button>
                                </div>

                                {/* AI Tips */}
                                <div style={{
                                    marginTop: '32px',
                                    padding: '20px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '12px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                        <Lightbulb size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                                                💡 Pro Tips for Better Results
                                            </div>
                                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#a3b3c7', fontSize: '0.875rem', lineHeight: '1.7' }}>
                                                <li>Be specific about your subjects (e.g., "React Hooks, Redux" instead of just "React")</li>
                                                <li>Set realistic daily hours based on your schedule</li>
                                                <li>Include both learning and practice time in your estimate</li>
                                                <li>Add a deadline to get time-optimized plans</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Generated Plan Result */}
                                {generatedPlan && generatedPlan.status === 'generating' && (
                                    <div style={{ marginTop: '32px', textAlign: 'center', padding: '40px' }}>
                                        <div style={{ fontSize: '1.5rem', color: '#a855f7', fontWeight: '700', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>
                                            🤖 AI is crafting your perfect plan...
                                        </div>
                                        <div style={{ color: '#a3b3c7' }}>Analyzing your goals, subjects, and schedule</div>
                                    </div>
                                )}

                                {generatedPlan && generatedPlan.status === 'complete' && (
                                    <div style={{
                                        marginTop: '32px',
                                        background: '#1e2236',
                                        borderRadius: '20px',
                                        padding: '32px',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        animation: 'fadeIn 0.5s ease'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
                                                    {generatedPlan.name}
                                                </h3>
                                                <p style={{ color: '#a3b3c7', fontSize: '1rem' }}>{generatedPlan.description}</p>
                                            </div>
                                            <div style={{ padding: '8px 16px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '8px', fontWeight: '700' }}>
                                                AI Generated
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                                            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', textAlign: 'center' }}>
                                                <div style={{ color: '#8892a6', fontSize: '0.85rem', marginBottom: '4px' }}>Duration</div>
                                                <div style={{ color: 'white', fontWeight: '700', fontSize: '1.2rem' }}>{generatedPlan.duration}</div>
                                            </div>
                                            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', textAlign: 'center' }}>
                                                <div style={{ color: '#8892a6', fontSize: '0.85rem', marginBottom: '4px' }}>Daily Focus</div>
                                                <div style={{ color: 'white', fontWeight: '700', fontSize: '1.2rem' }}>{generatedPlan.hoursPerDay}h</div>
                                            </div>
                                            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', textAlign: 'center' }}>
                                                <div style={{ color: '#8892a6', fontSize: '0.85rem', marginBottom: '4px' }}>Subjects</div>
                                                <div style={{ color: 'white', fontWeight: '700', fontSize: '1.2rem' }}>{generatedPlan.subjects.length}</div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '32px' }}>
                                            <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '16px' }}>Your Schedule Snapshot</h4>
                                            {Object.entries(generatedPlan.schedule).map(([day, details], idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '16px', marginBottom: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                                                    <div style={{ minWidth: '80px', color: '#a855f7', fontWeight: '700', textTransform: 'capitalize' }}>{day}</div>
                                                    <div style={{ color: '#e9d5ff' }}>{details.focus}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={async () => {
                                                try {
                                                    const tasksToCreate = [];
                                                    const today = new Date();
                                                    let dayIndex = 0;

                                                    // Needed for UI mapping
                                                    const todayStr = new Date().toLocaleDateString();
                                                    const tomorrow = new Date();
                                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                                    const tomorrowStr = tomorrow.toLocaleDateString();

                                                    for (const [day, details] of Object.entries(generatedPlan.schedule)) {
                                                        const taskDate = new Date(today);
                                                        taskDate.setDate(today.getDate() + dayIndex);

                                                        const taskData = {
                                                            title: `${day}: ${details.focus}`,
                                                            description: details.description || "",
                                                            priority: 'high',
                                                            status: 'pending',
                                                            dueDate: taskDate.toISOString(),
                                                            subject: generatedPlan.subjects[0] || 'General',
                                                            estimatedTime: (parseFloat(details.hours) || 1) * 60
                                                        };

                                                        // Create in DB
                                                        const res = await taskAPI.create(taskData);

                                                        if (res.success && res.task) {
                                                            let dateLabel = new Date(res.task.dueDate).toLocaleDateString();
                                                            if (dateLabel === todayStr) dateLabel = 'Today';
                                                            else if (dateLabel === tomorrowStr) dateLabel = 'Tomorrow';

                                                            tasksToCreate.push({
                                                                ...res.task,
                                                                id: res.task._id,
                                                                completed: res.task.status === 'completed',
                                                                date: dateLabel,
                                                                time: `${Math.floor((res.task.estimatedTime || 60) / 60)}h ${(res.task.estimatedTime || 60) % 60}m`
                                                            });
                                                        }
                                                        dayIndex++;
                                                    }

                                                    setTasks(prev => [...prev, ...tasksToCreate]);
                                                    alert("Plan saved to database and added to To-Do List!");
                                                    setActiveTab('tasks');
                                                    refreshAnalytics();
                                                } catch (err) {
                                                    console.error("Failed to add plan tasks:", err);
                                                    alert("Failed to save tasks to database.");
                                                }
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '1.1rem',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <CheckSquare size={20} />
                                            Add Plan to To-Do List
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    {activeTab === 'tasks' && (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                                {/* Task List */}
                                <div style={{
                                    background: 'rgba(30, 34, 54, 0.6)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '20px',
                                    padding: '28px',
                                    border: '1px solid rgba(255, 255, 255, 0.08)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <CheckSquare size={24} color="#10b981" />
                                            Task Manager
                                        </h3>
                                        <button
                                            onClick={() => setShowAddTask(!showAddTask)}
                                            style={{
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                border: 'none',
                                                color: 'white',
                                                padding: '10px 20px',
                                                borderRadius: '10px',
                                                fontSize: '0.875rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <Plus size={18} />
                                            Add Task
                                        </button>
                                    </div>

                                    {showAddTask && (
                                        <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                            <input
                                                type="text"
                                                value={newTask.title}
                                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                                placeholder="Task title..."
                                                style={{
                                                    width: '100%',
                                                    padding: '14px',
                                                    background: 'rgba(30, 34, 54, 0.8)',
                                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                                    borderRadius: '10px',
                                                    color: 'white',
                                                    fontSize: '0.95rem',
                                                    marginBottom: '12px'
                                                }}
                                                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                                            />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                                {['high', 'medium', 'low'].map(priority => (
                                                    <button
                                                        key={priority}
                                                        onClick={() => setNewTask({ ...newTask, priority })}
                                                        style={{
                                                            padding: '10px',
                                                            background: newTask.priority === priority ?
                                                                (priority === 'high' ? 'rgba(239, 68, 68, 0.2)' : priority === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)') :
                                                                'rgba(30, 34, 54, 0.6)',
                                                            border: `1px solid ${priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#3b82f6'}`,
                                                            borderRadius: '8px',
                                                            color: 'white',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            textTransform: 'capitalize'
                                                        }}
                                                    >
                                                        {priority}
                                                    </button>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={addTask}
                                                    style={{
                                                        flex: 1,
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        border: 'none',
                                                        color: 'white',
                                                        padding: '12px',
                                                        borderRadius: '10px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Add Task
                                                </button>
                                                <button
                                                    onClick={() => setShowAddTask(false)}
                                                    style={{
                                                        flex: 1,
                                                        background: 'rgba(239, 68, 68, 0.2)',
                                                        border: 'none',
                                                        color: '#ef4444',
                                                        padding: '12px',
                                                        borderRadius: '10px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Task Groups */}
                                    <div>
                                        {['Today', 'Tomorrow', 'This Week'].map(dateGroup => {
                                            const groupTasks = tasks.filter(t => {
                                                if (selectedSubject !== 'all' && t.subject !== selectedSubject) return false;
                                                return t.date === dateGroup || (dateGroup === 'This Week' && t.date !== 'Today' && t.date !== 'Tomorrow');
                                            });
                                            if (groupTasks.length === 0) return null;

                                            return (
                                                <div key={dateGroup} style={{ marginBottom: '24px' }}>
                                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#10b981', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {dateGroup}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        {groupTasks.map(task => (
                                                            <div
                                                                key={task.id}
                                                                style={{
                                                                    padding: '16px',
                                                                    background: task.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 34, 54, 0.8)',
                                                                    borderRadius: '12px',
                                                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '16px',
                                                                    transition: 'all 0.3s'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                                                            >
                                                                <div
                                                                    onClick={() => toggleTask(task.id)}
                                                                    style={{
                                                                        width: '24px',
                                                                        height: '24px',
                                                                        borderRadius: '6px',
                                                                        border: `2px solid ${task.completed ? '#10b981' : '#60a5fa'}`,
                                                                        background: task.completed ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        cursor: 'pointer',
                                                                        flexShrink: 0
                                                                    }}
                                                                >
                                                                    {task.completed && <Check size={16} color="white" />}
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{
                                                                        fontSize: '1rem',
                                                                        fontWeight: '600',
                                                                        color: task.completed ? '#6ee7b7' : 'white',
                                                                        textDecoration: task.completed ? 'line-through' : 'none',
                                                                        marginBottom: '6px'
                                                                    }}>
                                                                        {task.title}
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                                        <span style={{
                                                                            padding: '4px 10px',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: '600',
                                                                            background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.2)' : task.priority === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                                            color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#60a5fa'
                                                                        }}>
                                                                            {task.priority}
                                                                        </span>
                                                                        <span style={{ fontSize: '0.75rem', color: '#8892a6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                            <Clock size={14} /> {task.time}
                                                                        </span>
                                                                        <span style={{ fontSize: '0.75rem', color: '#8892a6' }}>
                                                                            {task.subject}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => deleteTask(task.id)}
                                                                    style={{
                                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                                        border: 'none',
                                                                        color: '#ef4444',
                                                                        padding: '8px',
                                                                        borderRadius: '8px',
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.3s'
                                                                    }}
                                                                    onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                                    onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>


                                {/* Weekly Overview */}
                                <div style={{
                                    background: 'rgba(30, 34, 54, 0.6)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '20px',
                                    padding: '28px',
                                    border: '1px solid rgba(255, 255, 255, 0.08)'
                                }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Calendar size={24} color="#10b981" />
                                        Weekly Activity
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {weeklyPlan.map((day, idx) => {
                                            const completionRate = day.created > 0 ? (day.completed / day.created) * 100 : 0;
                                            return (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        padding: '16px',
                                                        background: 'rgba(30, 34, 54, 0.8)',
                                                        borderRadius: '12px',
                                                        border: '1px solid rgba(255, 255, 255, 0.08)'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                        <div>
                                                            <div style={{ fontSize: '1rem', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                                                                {day.day}
                                                            </div>
                                                            <div style={{ fontSize: '0.875rem', color: '#8892a6' }}>
                                                                {day.completed} completed / {day.created} created
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: '900', color: completionRate >= 100 ? '#10b981' : day.created === 0 ? '#8892a6' : '#f59e0b' }}>
                                                            {day.created > 0 ? `${Math.round(completionRate)}%` : '-'}
                                                        </div>
                                                    </div>
                                                    <div style={{ width: '100%', height: '6px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${Math.min(completionRate, 100)}%`,
                                                            height: '100%',
                                                            background: 'linear-gradient(90deg, #10b981, #34d399)',
                                                            borderRadius: '999px',
                                                            transition: 'width 1s ease'
                                                        }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'goals' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white' }}>
                                    Your Goals
                                </h3>
                                <button
                                    onClick={() => setShowAddGoal(!showAddGoal)}
                                    style={{
                                        background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
                                        border: 'none',
                                        color: 'white',
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        fontSize: '0.875rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Plus size={18} />
                                    New Goal
                                </button>
                            </div>

                            {showAddGoal && (
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(14, 165, 233, 0.15))',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '20px',
                                    padding: '28px',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    marginBottom: '24px'
                                }}>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
                                        Create New Goal
                                    </h4>
                                    <input
                                        type="text"
                                        value={newGoal.title}
                                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                        placeholder="Goal title..."
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            background: 'rgba(30, 34, 54, 0.8)',
                                            border: '1px solid rgba(6, 182, 212, 0.3)',
                                            borderRadius: '10px',
                                            color: 'white',
                                            fontSize: '0.95rem',
                                            marginBottom: '12px'
                                        }}
                                    />
                                    <input
                                        type="date"
                                        value={newGoal.deadline}
                                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            background: 'rgba(30, 34, 54, 0.8)',
                                            border: '1px solid rgba(6, 182, 212, 0.3)',
                                            borderRadius: '10px',
                                            color: 'white',
                                            fontSize: '0.95rem',
                                            marginBottom: '12px'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                        {['custom', 'auto'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setNewGoal({ ...newGoal, type })}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    background: newGoal.type === type ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 34, 54, 0.6)',
                                                    border: `1px solid ${newGoal.type === type ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)'}`,
                                                    borderRadius: '10px',
                                                    color: 'white',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    textTransform: 'capitalize'
                                                }}
                                            >
                                                {type} Goal
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={addGoal}
                                            style={{
                                                flex: 1,
                                                background: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
                                                border: 'none',
                                                color: 'white',
                                                padding: '12px',
                                                borderRadius: '10px',
                                                fontWeight: '700',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Create Goal
                                        </button>
                                        <button
                                            onClick={() => setShowAddGoal(false)}
                                            style={{
                                                flex: 1,
                                                background: 'rgba(239, 68, 68, 0.2)',
                                                border: 'none',
                                                color: '#ef4444',
                                                padding: '12px',
                                                borderRadius: '10px',
                                                fontWeight: '700',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                                {goals.map(goal => (
                                    <div
                                        key={goal.id}
                                        style={{
                                            background: 'rgba(30, 34, 54, 0.6)',
                                            backdropFilter: 'blur(20px)',
                                            borderRadius: '20px',
                                            padding: '28px',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            transition: 'all 0.4s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(6, 182, 212, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                                                    {goal.title}
                                                </h4>
                                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        background: goal.type === 'custom' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                                                        color: goal.type === 'custom' ? '#06b6d4' : '#a855f7',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {goal.type}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: '#8892a6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Calendar size={14} /> {goal.deadline}
                                                    </span>
                                                </div>
                                            </div>
                                            <Flag size={24} color={goal.progress >= 75 ? '#10b981' : goal.progress >= 50 ? '#f59e0b' : '#ef4444'} />
                                        </div>

                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '0.875rem', color: '#8892a6' }}>Progress</span>
                                                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white' }}>{goal.progress}%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: 'rgba(6, 182, 212, 0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${goal.progress}%`,
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, #06b6d4, #0ea5e9)',
                                                    borderRadius: '999px',
                                                    transition: 'width 1s ease'
                                                }}></div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '10px' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#8892a6' }}>Milestones</span>
                                            <span style={{ fontSize: '1rem', fontWeight: '700', color: '#06b6d4' }}>
                                                {Math.round((goal.progress / 100) * goal.milestones)}/{goal.milestones}
                                            </span>
                                        </div>

                                        <div style={{ marginTop: '16px' }}>
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#8892a6' }}>Update Progress</span>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'white' }}>{goal.progress}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={goal.progress}
                                                    onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                                                    style={{
                                                        width: '100%',
                                                        accentColor: '#06b6d4',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => deleteGoal(goal.id)}
                                                    style={{
                                                        flex: 1,
                                                        background: 'rgba(239, 68, 68, 0.2)',
                                                        border: '1px solid rgba(239, 68, 68, 0.4)',
                                                        color: '#ef4444',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.3s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
                            {/* Performance Chart */}
                            <div style={{
                                background: 'rgba(30, 34, 54, 0.6)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '20px',
                                padding: '28px',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <TrendingUp size={24} color="#10b981" />
                                    Performance Trends
                                </h3>
                                <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                                    {weeklyPlan.map((day, idx) => {
                                        // Use completed count for bar height, max height based on max completed
                                        const maxCompleted = Math.max(...weeklyPlan.map(d => d.completed), 1);
                                        const height = (day.completed / maxCompleted) * 100;
                                        return (
                                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#10b981' }}>
                                                    {day.completed}
                                                </div>
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        height: `${Math.max(height * 2, day.completed > 0 ? 20 : 5)}px`,
                                                        background: day.completed > 0 ? 'linear-gradient(180deg, #10b981, #059669)' : 'rgba(100, 116, 139, 0.3)',
                                                        borderRadius: '8px 8px 0 0',
                                                        transition: 'height 1s ease'
                                                    }}
                                                />
                                                <div style={{ fontSize: '0.75rem', color: '#8892a6', fontWeight: '600' }}>
                                                    {day.day}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* AI Insights */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15))',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '20px',
                                padding: '28px',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Sparkles size={24} color="#a855f7" />
                                    AI Insights
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {overview.insights && overview.insights.length > 0 ? overview.insights.map((insight, idx) => {
                                        // Map insight type to icon and color
                                        const insightStyles = {
                                            success: { icon: '🎉', color: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.4)' },
                                            warning: { icon: '⚠️', color: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.4)' },
                                            info: { icon: '💡', color: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.2)' },
                                            alert: { icon: '🔔', color: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.4)' },
                                            tip: { icon: '🎯', color: 'rgba(6, 182, 212, 0.2)', border: 'rgba(6, 182, 212, 0.4)' }
                                        };
                                        const style = insightStyles[insight.type] || insightStyles.info;
                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    padding: '16px',
                                                    background: style.color,
                                                    borderRadius: '12px',
                                                    border: `1px solid ${style.border}`
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <div style={{ fontSize: '2rem' }}>{style.icon}</div>
                                                    <div>
                                                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                                                            {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                                                        </div>
                                                        <div style={{ fontSize: '0.875rem', color: '#e9d5ff', lineHeight: '1.6' }}>
                                                            {insight.text}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div style={{
                                            padding: '24px',
                                            textAlign: 'center',
                                            color: '#8892a6'
                                        }}>
                                            <Sparkles size={32} color="#a855f7" style={{ marginBottom: '12px' }} />
                                            <p>Start adding tasks and goals to see personalized AI insights!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Template Details Modal */}
            {selectedTemplate && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
                    onClick={() => setSelectedTemplate(null)}
                >
                    <div
                        style={{
                            background: '#1a1f37',
                            width: '100%',
                            maxWidth: '900px',
                            maxHeight: '90vh',
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: '0 50px 100px rgba(0, 0, 0, 0.5)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '32px',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start'
                        }}>
                            <div>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    borderRadius: '8px',
                                    color: '#10b981',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    marginBottom: '12px',
                                    border: '1px solid rgba(16, 185, 129, 0.3)'
                                }}>
                                    {selectedTemplate.difficulty} Difficulty
                                </div>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
                                    {selectedTemplate.name}
                                </h2>
                                <p style={{ fontSize: '1rem', color: '#a3b3c7' }}>
                                    {selectedTemplate.description}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    color: 'white',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                            {/* Key Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                    <Clock size={24} color="#6366f1" style={{ marginBottom: '8px' }} />
                                    <div style={{ fontSize: '0.875rem', color: '#8892a6', marginBottom: '4px' }}>Total Duration</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>{selectedTemplate.duration}</div>
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                    <Timer size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
                                    <div style={{ fontSize: '0.875rem', color: '#8892a6', marginBottom: '4px' }}>Daily Commitment</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>{selectedTemplate.hoursPerDay} Hours</div>
                                </div>
                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                                    <Target size={24} color="#ef4444" style={{ marginBottom: '8px' }} />
                                    <div style={{ fontSize: '0.875rem', color: '#8892a6', marginBottom: '4px' }}>Topics Covered</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>{selectedTemplate.subjects.length} Subjects</div>
                                </div>
                            </div>

                            {/* Schedule Preview */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CalendarDays size={20} color="#10b981" />
                                    Sample Schedule
                                </h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {Object.entries(selectedTemplate.schedule || {}).slice(0, 5).map(([day, details], idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '20px',
                                            padding: '16px',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '12px',
                                            borderLeft: '3px solid #10b981'
                                        }}>
                                            <div style={{ minWidth: '80px', fontSize: '0.9rem', fontWeight: '700', color: '#10b981', textTransform: 'capitalize' }}>
                                                {day}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: 'white', fontWeight: '600', marginBottom: '4px' }}>{details.focus}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#8892a6' }}>
                                                    {details.hours} hours study • {details.breaks} breaks
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recommended Techniques */}
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Lightbulb size={20} color="#f59e0b" />
                                    Recommended Techniques
                                </h3>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {selectedTemplate.techniques.map((tech, idx) => (
                                        <div key={idx} style={{
                                            padding: '8px 16px',
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            borderRadius: '50px',
                                            fontSize: '0.9rem',
                                            color: '#f59e0b',
                                            fontWeight: '600'
                                        }}>
                                            {tech}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '24px 32px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            background: 'rgba(0, 0, 0, 0.2)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '16px'
                        }}>
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                style={{
                                    padding: '14px 28px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Generate tasks from the template schedule
                                    const newTasks = [];
                                    const schedule = selectedTemplate.schedule || {};
                                    let idCounter = Date.now();

                                    Object.entries(schedule).forEach(([day, details]) => {
                                        // Create a main focus task
                                        newTasks.push({
                                            id: idCounter++,
                                            title: `${day}: ${details.focus}`,
                                            completed: false,
                                            priority: 'high',
                                            type: 'study',
                                            time: `${details.hours}h`, // Use the hours from the template
                                            subject: selectedTemplate.subjects[0] || 'General' // Pick the first subject or General
                                        });

                                        // Create a review task using a recommended technique
                                        if (selectedTemplate.techniques && selectedTemplate.techniques.length > 0) {
                                            newTasks.push({
                                                id: idCounter++,
                                                title: `${day}: Review using ${selectedTemplate.techniques[0]}`,
                                                completed: false,
                                                priority: 'medium',
                                                type: 'review',
                                                time: '30m',
                                                subject: selectedTemplate.subjects[0] || 'General'
                                            });
                                        }
                                    });

                                    // Add the new tasks to the existing tasks state
                                    setTasks([...tasks, ...newTasks]);

                                    // Show success message and navigate
                                    alert(`Successfully added ${newTasks.length} tasks from "${selectedTemplate.name}" to your To-Do List!`);
                                    setSelectedTemplate(null);
                                    setActiveTab('tasks');
                                }}
                                style={{
                                    padding: '14px 28px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                Start This Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Technique Active Modal - The "Output" View */}
            {showTechniqueModal && selectedTechnique && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    animation: 'fadeIn 0.3s ease'
                }} onClick={() => setShowTechniqueModal(false)}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        borderRadius: '24px',
                        padding: '40px',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        border: `1px solid ${selectedTechnique.color || '#34d399'}`,
                        boxShadow: `0 0 50px ${selectedTechnique.color || '#34d399'}30`,
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>

                        <button
                            onClick={() => setShowTechniqueModal(false)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                            <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '5rem',
                                    marginBottom: '20px',
                                    animation: 'float 3s ease-in-out infinite'
                                }}>
                                    {selectedTechnique.icon}
                                </div>
                                <div style={{
                                    background: `${selectedTechnique.color}20`,
                                    color: selectedTechnique.color,
                                    padding: '10px',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    marginBottom: '10px'
                                }}>
                                    {selectedTechnique.effectiveness}% Effective
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                    Difficulty: {selectedTechnique.difficulty}
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: '10px' }}>
                                    {selectedTechnique.name}
                                </h2>
                                <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '30px', lineHeight: '1.6' }}>
                                    {selectedTechnique.description}
                                </p>

                                <div style={{ marginBottom: '30px' }}>
                                    <h3 style={{ color: selectedTechnique.color, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Sparkles size={20} />
                                        Why use this technique? (Expected Output)
                                    </h3>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                                        <p style={{ color: '#e2e8f0', marginBottom: '15px' }}>
                                            By using the <strong>{selectedTechnique.name}</strong>, you can expect to:
                                        </p>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {selectedTechnique.bestFor.map((benefit, i) => (
                                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#cbd5e1' }}>
                                                    <Check size={16} color={selectedTechnique.color} />
                                                    Improve {benefit}
                                                </li>
                                            ))}
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#cbd5e1' }}>
                                                <Check size={16} color={selectedTechnique.color} />
                                                Boost retention efficiency by {Math.round((selectedTechnique.effectiveness / 100) * 1.5 * 10) / 10}x
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '30px' }}>
                                    <h3 style={{ color: 'white', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <ListChecks size={20} />
                                        How to apply
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {selectedTechnique.steps.map((step, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '15px', alignItems: 'start', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                                <div style={{ background: selectedTechnique.color, color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', flexShrink: 0 }}>
                                                    {i + 1}
                                                </div>
                                                <div style={{ color: '#cbd5e1' }}>{step}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowTechniqueModal(false);
                                        if (selectedTechnique.name.toLowerCase().includes('pomodoro')) {
                                            setShowPomodoro(true);
                                            setActiveTab('techniques');
                                        } else {
                                            // Add an active session or task
                                            setTasks(prev => [{
                                                id: Date.now(),
                                                title: `Practice ${selectedTechnique.name}`,
                                                priority: 'high',
                                                completed: false,
                                                date: 'Today',
                                                time: '45m',
                                                subject: 'Study Skills',
                                                progress: 0
                                            }, ...prev]);
                                            setActiveTab('tasks');
                                            alert(`Added "${selectedTechnique.name}" practice to your To-Do List!`);
                                        }
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '18px',
                                        background: `linear-gradient(135deg, ${selectedTechnique.color}, ${selectedTechnique.color}cc)`,
                                        border: 'none',
                                        borderRadius: '16px',
                                        color: 'white',
                                        fontSize: '1.2rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        boxShadow: `0 10px 30px ${selectedTechnique.color}40`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Zap size={24} />
                                    Start Session with {selectedTechnique.name}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
