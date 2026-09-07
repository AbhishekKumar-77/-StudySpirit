import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as soloApi from '../services/soloApi';
import { taskAPI, analyticsAPI } from '../services/plannerApi';
import { getRecentPages } from '../hooks/usePageTracker';
import NotificationBell from '../components/NotificationBell';
import confetti from 'canvas-confetti';
import {
    LayoutDashboard, BookOpen, Users, Calendar, ClipboardCheck, Code,
    Mic, Library, Briefcase, Folder, Brain, Edit3,
    Search, Flame, Zap, Star, Trophy, CheckCircle2, Clock, Play, Pause,
    RotateCcw, ChevronRight, ArrowRight, Shield, Award, Sparkles, Bot,
    FileCheck, Plus, Sparkle, ExternalLink, TrendingUp, Menu, X, Sun, Moon, Send,
    Maximize2, Minimize2, Sliders, Settings
} from 'lucide-react';
import './Dashboard.css';
import { getAvatarUrl, handleAvatarError } from '../utils/avatarHelper';
import AIMentorModal from '../components/dashboard/AIMentorModal';
import FocusZenModal from '../components/dashboard/FocusZenModal';

export default function Dashboard() {
    const { user, stats, setUser, setStats } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Data & UI States
    const [dashboardData, setDashboardData] = useState(null);
    const [todayStudyTime, setTodayStudyTime] = useState(0);
    const [todayMission, setTodayMission] = useState(null);
    const [recentPages, setRecentPages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [rewardClaimed, setRewardClaimed] = useState(false);

    // Enhancement 1: Mobile Sidebar Toggle State
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Enhancement 2: Dark / Light Mode Switcher State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    });

    // Enhancement 3: Instant AI Mentor Modal State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiMessages, setAiMessages] = useState([
        { id: 1, sender: 'bot', text: `Hi ${user?.name || 'sasa'}! 👋 I'm your AI Study Mentor. Ask me any study question or request learning tips!` }
    ]);
    const [aiInput, setAiInput] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);

    // Enhancement 4: Live Deadlines & Stats State
    const [liveDeadlines, setLiveDeadlines] = useState([]);
    const [weeklyStats, setWeeklyStats] = useState({ completed: 12, inProgress: 18, pending: 6 });
    const [weeklyData, setWeeklyData] = useState([]);

    // Pomodoro Focus Timer State (25 mins default = 1500 sec)
    const [timerSeconds, setTimerSeconds] = useState(1500);
    const [initialTimerDuration, setInitialTimerDuration] = useState(1500);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isZenModalOpen, setIsZenModalOpen] = useState(false);

    const handleSelectTimerPreset = (mins) => {
        const secs = mins * 60;
        setIsTimerRunning(false);
        setInitialTimerDuration(secs);
        setTimerSeconds(secs);
    };

    // Plan Checklist State (loaded dynamically from real MongoDB backend)
    const [planTasks, setPlanTasks] = useState([]);

    // Handle Dark Mode Toggle
    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const nextMode = !prev;
            if (nextMode) {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                localStorage.setItem('theme', 'light');
            }
            return nextMode;
        });
    };

    // Synchronize initial theme
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }
    }, [isDarkMode]);

    // AI Mentor Chat Handler
    const handleSendAiMessage = async () => {
        if (!aiInput.trim()) return;
        const userMsg = { id: Date.now(), sender: 'user', text: aiInput };
        setAiMessages(prev => [...prev, userMsg]);
        const queryText = aiInput;
        setAiInput('');
        setIsAiTyping(true);

        try {
            const res = await soloApi.sendAIMessage(queryText);
            setAiMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: res.response || `Great question! To master "${queryText}", focus on breaking down core concepts into 25-minute study intervals with active recall.`
            }]);
        } catch (error) {
            console.error('AI chat error:', error);
            setAiMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: "Sorry, I am having trouble connecting to the AI Mentor. Please try again in a moment."
            }]);
        } finally {
            setIsAiTyping(false);
        }
    };

    // Timer Effect
    useEffect(() => {
        let interval = null;
        if (isTimerRunning && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds(prev => prev - 1);
            }, 1000);
        } else if (timerSeconds === 0) {
            setIsTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timerSeconds]);

    const formatTimer = (sec) => {
        const mins = Math.floor(sec / 60);
        const remainingSec = sec % 60;
        return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsTimerRunning(prev => !prev);
    const resetTimer = () => {
        setIsTimerRunning(false);
        setTimerSeconds(1500);
    };

    // Format relative due dates intelligently for real active dates
    const formatRelativeDue = (dueDateStr) => {
        if (!dueDateStr) return 'Due Soon';
        const due = new Date(dueDateStr);
        if (isNaN(due.getTime())) return `Due ${dueDateStr}`;
        
        const now = new Date();
        const todayStr = now.toDateString();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (due.toDateString() === todayStr) return 'Due Today, 11:59 PM';
        if (due.toDateString() === tomorrow.toDateString()) return 'Due Tomorrow, 11:59 PM';
        
        const diffMs = due - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1 && diffDays <= 7) return `Due in ${diffDays} days`;
        
        return `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    // Calculate dynamic SVG curve points for Weekly Progress graph
    const buildWeeklySvgPath = (dataPoints) => {
        const defaultDays = [
            { day: 'Mon', val: 35 },
            { day: 'Tue', val: 50 },
            { day: 'Wed', val: 65 },
            { day: 'Thu', val: 60 },
            { day: 'Fri', val: 78 },
            { day: 'Sat', val: 92 },
            { day: 'Sun', val: 75 }
        ];

        let points = defaultDays;
        if (dataPoints && dataPoints.length > 0) {
            const maxScore = Math.max(...dataPoints.map(d => (d.hours * 20) + (d.problems * 15)), 1);
            points = dataPoints.map(d => {
                const score = (d.hours * 20) + (d.problems * 15);
                const val = Math.min(95, Math.max(20, Math.round((score / maxScore) * 75 + 20)));
                return { day: d.day, val };
            });
        }

        const width = 400;
        const height = 130;
        const paddingX = 25;
        const stepX = (width - paddingX * 2) / (points.length - 1);

        const coords = points.map((p, idx) => {
            const x = paddingX + idx * stepX;
            const y = height - 20 - (p.val / 100) * (height - 40);
            return { x, y, val: p.val, day: p.day };
        });

        let linePath = `M ${coords[0].x},${coords[0].y}`;
        for (let i = 0; i < coords.length - 1; i++) {
            const curr = coords[i];
            const next = coords[i + 1];
            const cpX = (curr.x + next.x) / 2;
            linePath += ` C ${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y}`;
        }

        const areaPath = `${linePath} L ${coords[coords.length - 1].x},${height} L ${coords[0].x},${height} Z`;

        let peakIdx = coords.length - 2;
        let maxVal = -1;
        coords.forEach((c, i) => {
            if (c.val > maxVal) { maxVal = c.val; peakIdx = i; }
        });
        const peakPoint = coords[peakIdx] || coords[coords.length - 1];

        return { linePath, areaPath, activeX: peakPoint.x, activeY: peakPoint.y, activePct: peakPoint.val };
    };

    // Toggle Task & sync state with MongoDB backend
    const toggleTask = async (id) => {
        let isAllDone = false;
        setPlanTasks(prev => {
            const updated = prev.map(task => 
                task.id === id ? { ...task, completed: !task.completed } : task
            );
            const doneCount = updated.filter(t => t.completed).length;
            if (doneCount === updated.length && updated.length > 0) {
                isAllDone = true;
            }
            return updated;
        });

        if (isAllDone) {
            fireConfetti();
        }

        try {
            if (typeof id === 'string' && id.length === 24) {
                const target = planTasks.find(t => t.id === id);
                await taskAPI.toggle(id, target ? !target.completed : true);
            } else {
                await soloApi.toggleTask(id);
            }
        } catch (err) {
            console.warn('Task toggle sync note:', err);
        }
    };

    useEffect(() => {
        setRecentPages(getRecentPages());
    }, []);

    // Fireworks & Confetti Burst
    const fireConfetti = useCallback(() => {
        if (rewardClaimed) return;
        setRewardClaimed(true);

        const duration = 2500;
        const end = Date.now() + duration;
        const colors = ['#ff6b4a', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];

        confetti({
            particleCount: 80,
            spread: 90,
            origin: { x: 0.5, y: 0.6 },
            colors,
            zIndex: 10000
        });

        const interval = setInterval(() => {
            if (Date.now() > end) {
                clearInterval(interval);
                return;
            }
            confetti({
                particleCount: 25,
                angle: 60 + Math.random() * 60,
                spread: 60,
                origin: { x: Math.random(), y: Math.random() * 0.5 },
                colors,
                zIndex: 10000
            });
        }, 300);

        setTimeout(() => setRewardClaimed(false), 5000);
    }, [rewardClaimed]);

    // Enhancement 4: Fetch Live Real Dashboard Data & Tasks from Database
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch solo stats
                const soloData = await soloApi.getStats();
                
                // 2. Fetch full planner overview
                let plannerOverview = null;
                try {
                    plannerOverview = await analyticsAPI.getOverview();
                } catch (err) {
                    console.warn('Planner overview fetch note:', err);
                }

                // 3. Fetch planner tasks
                let allTasks = [];
                try {
                    const tasksRes = await taskAPI.getAll();
                    if (tasksRes && tasksRes.tasks) allTasks = tasksRes.tasks;
                } catch (err) {}

                // Populate Today's Plan Tasks from MongoDB
                let currentTasks = [];
                if (plannerOverview && plannerOverview.tasks && plannerOverview.tasks.length > 0) {
                    currentTasks = plannerOverview.tasks.slice(0, 4).map(t => ({
                        id: t._id || t.id,
                        text: t.title || t.text,
                        completed: !!(t.completed || t.status === 'COMPLETED' || t.status === 'completed'),
                        durationMinutes: t.durationMinutes || 45
                    }));
                } else if (allTasks.length > 0) {
                    currentTasks = allTasks.slice(0, 4).map(t => ({
                        id: t._id || t.id,
                        text: t.title || t.text,
                        completed: t.status === 'completed',
                        durationMinutes: t.estimatedTime || 45
                    }));
                } else {
                    currentTasks = [
                        { id: 'task_1', text: 'Watch Introduction Video', completed: true, durationMinutes: 30 },
                        { id: 'task_2', text: 'Practice Problems (5/10)', completed: false, durationMinutes: 45 },
                        { id: 'task_3', text: 'Take Quiz', completed: false, durationMinutes: 25 }
                    ];
                }
                setPlanTasks(currentTasks);

                // Populate Active Focus Course & Topic
                if (plannerOverview && plannerOverview.profile && plannerOverview.profile.currentFocus) {
                    setTodayMission({
                        title: plannerOverview.profile.currentFocus.course || 'Data Structures & Algorithms',
                        task: plannerOverview.profile.currentFocus.topic || 'Arrays and Linked List'
                    });
                } else if (soloData && soloData.learningPath && soloData.learningPath.topics) {
                    const activeTopic = soloData.learningPath.topics.find(t => t.status === 'active') || soloData.learningPath.topics[0];
                    if (activeTopic) {
                        setTodayMission({
                            title: activeTopic.name || 'Data Structures & Algorithms',
                            task: activeTopic.task || 'Arrays and Linked List'
                        });
                    }
                }

                // Populate Weekly Stats & Weekly Chart Data
                const doneCount = currentTasks.filter(t => t.completed).length + (soloData?.user?.problemsSolvedToday || 0);
                const inProgCount = currentTasks.filter(t => !t.completed).length + 2;
                const pendingCount = Math.max(1, (allTasks.length > 0 ? allTasks.length - doneCount : 2));

                setWeeklyStats({
                    completed: doneCount || 12,
                    inProgress: inProgCount || 18,
                    pending: pendingCount || 2
                });

                if (soloData && soloData.weeklyData) {
                    setWeeklyData(soloData.weeklyData);
                }

                // Populate Real Upcoming Deadlines
                let deadlinesList = [];
                if (plannerOverview && plannerOverview.deadlines && plannerOverview.deadlines.length > 0) {
                    deadlinesList = plannerOverview.deadlines.slice(0, 3).map((d, idx) => ({
                        id: d._id || idx,
                        title: d.title,
                        due: formatRelativeDue(d.date),
                        color: idx === 0 ? '#8b5cf6' : idx === 1 ? '#f97316' : '#10b981',
                        bg: idx === 0 ? '#f5f3ff' : idx === 1 ? '#fff7ed' : '#ecfdf5'
                    }));
                } else if (allTasks.length > 0) {
                    const pending = allTasks.filter(t => t.status !== 'completed').slice(0, 3);
                    deadlinesList = pending.map((t, idx) => ({
                        id: t._id || idx,
                        title: t.title || 'Study Assignment',
                        due: formatRelativeDue(t.dueDate),
                        color: idx === 0 ? '#8b5cf6' : idx === 1 ? '#f97316' : '#10b981',
                        bg: idx === 0 ? '#f5f3ff' : idx === 1 ? '#fff7ed' : '#ecfdf5'
                    }));
                }

                if (deadlinesList.length === 0) {
                    const currentYear = new Date().getFullYear();
                    deadlinesList = [
                        { id: 1, title: 'Data Structures Quiz', due: 'Due Tomorrow, 11:59 PM', color: '#8b5cf6', bg: '#f5f3ff' },
                        { id: 2, title: 'Arrays Assignment', due: `Due May 18, ${currentYear + 1}`, color: '#f97316', bg: '#fff7ed' },
                        { id: 3, title: 'Mock Interview Round', due: `Due May 20, ${currentYear + 1}`, color: '#10b981', bg: '#ecfdf5' }
                    ];
                }
                setLiveDeadlines(deadlinesList);

                if (soloData && soloData.user) {
                    setDashboardData(soloData);
                    setUser(prev => ({
                        ...prev,
                        name: soloData.user.name || prev?.name,
                        email: soloData.user.email || prev?.email,
                        streak: soloData.user.studyStreak || 0,
                        level: soloData.user.level || 1,
                        xp: soloData.user.totalXP || 0,
                        reputation: soloData.user.reputation || 0
                    }));
                }
            } catch (err) {
                console.error('Error fetching dashboard real data:', err);
            }
        };
        fetchDashboardData();
    }, [setUser, setStats]);

    // Enhancement 5: XP Level Progress Ring Calculation (0 - 100%)
    const currentXp = user?.xp || 4630;
    const xpProgressPercent = Math.min(100, Math.max(15, (currentXp % 1000) / 10));

    // Platform features list
    const navFeatures = [
        { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { id: 'group', name: 'Group Mode', path: '/group-mode', icon: Users },
        { id: 'planner', name: 'Study Planner', path: '/planner', icon: Calendar },
        { id: 'quizzes', name: 'Quizzes', path: '/quiz', icon: ClipboardCheck },
        { id: 'exams', name: 'Exams', path: '/exams', icon: FileCheck },
        { id: 'codespirit', name: 'CodeSpirit', path: '/codespirit', icon: Code },
        { id: 'interview', name: 'Interview Prep', path: '/interview', icon: Mic },
        { id: 'resources', name: 'Study Resources', path: '/resources', icon: Library },
        { id: 'career', name: 'CareerSprint', path: '/career', icon: Briefcase },
        { id: 'project', name: 'Project Lab', path: '/project-lab', icon: Folder },
        { id: 'softskills', name: 'Soft Skills', path: '/soft-skills', icon: Brain },
        { id: 'editors', name: 'Code Editor', path: '/code-editor', icon: Edit3 },
    ];

    const quickAccessGrid = [
        { name: 'CodeSpirit', icon: Code, color: '#06b6d4', bg: '#ecfeff', path: '/codespirit' },
        { name: 'Quizzes', icon: ClipboardCheck, color: '#ec4899', bg: '#fdf2f8', path: '/quiz' },
        { name: 'Exams', icon: FileCheck, color: '#ef4444', bg: '#fef2f2', path: '/exams' },
        { name: 'Group Study', icon: Users, color: '#8b5cf6', bg: '#f5f3ff', path: '/group-mode' },
        { name: 'Resources', icon: Library, color: '#10b981', bg: '#ecfdf5', path: '/resources' },
        { name: 'Interview Prep', icon: Mic, color: '#f43f5e', bg: '#fff1f2', path: '/interview' },
        { name: 'CareerSprint', icon: Briefcase, color: '#84cc16', bg: '#f7fee7', path: '/career' },
        { name: 'Project Lab', icon: Folder, color: '#f97316', bg: '#fff7ed', path: '/project-lab' },
        { name: 'Soft Skills', icon: Brain, color: '#a855f7', bg: '#faf5ff', path: '/soft-skills' }
    ];

    const currentYear = new Date().getFullYear();
    const defaultDeadlines = [
        { id: 1, title: 'Data Structures Quiz', due: 'Due Tomorrow, 11:59 PM', color: '#8b5cf6', bg: '#f5f3ff' },
        { id: 2, title: 'Arrays Assignment', due: `Due May 18, ${currentYear}`, color: '#f97316', bg: '#fff7ed' },
        { id: 3, title: 'Mock Interview Round', due: `Due May 20, ${currentYear}`, color: '#10b981', bg: '#ecfdf5' },
    ];

    const upcomingDeadlines = liveDeadlines.length > 0 ? liveDeadlines : defaultDeadlines;

    const filterSearch = (item) => {
        if (!searchQuery) return true;
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    };

    return (
        <div className={`new-dashboard-layout ${isDarkMode ? 'dark-dashboard' : ''}`}>
            {/* Enhancement 1: Mobile Sidebar Backdrop Overlay */}
            {isMobileSidebarOpen && (
                <div className="sidebar-backdrop" onClick={() => setIsMobileSidebarOpen(false)} />
            )}

            {/* LEFT SIDEBAR */}
            <aside className={`sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand-row">
                    <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
                        <img
                            src="/logo-icon.png"
                            alt="StudySpirit Logo"
                            className="brand-logo-img"
                        />
                        <div className="brand-text">
                            <span className="brand-title">
                                <span className="brand-study">Study</span><span className="brand-spirit">Spirit</span>
                            </span>
                            <span className="brand-subtitle">Learn • Practice • Grow</span>
                        </div>
                    </div>

                    {/* Mobile Close Button */}
                    <button className="mobile-close-btn" onClick={() => setIsMobileSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navFeatures.filter(filterSearch).map((item) => {
                        const Icon = item.icon;
                        const isActive = item.path && (location.pathname === item.path || (item.id === 'dashboard' && location.pathname === '/dashboard'));
                        const isAiMentor = item.id === 'ai-mentor';
                        return (
                            <button
                                key={item.id}
                                className={`sidebar-item ${isActive ? 'active' : ''} ${isAiMentor ? 'ai-mentor-nav-item' : ''}`}
                                onClick={() => {
                                    if (item.action) {
                                        item.action();
                                    } else if (item.path) {
                                        navigate(item.path);
                                    }
                                    setIsMobileSidebarOpen(false);
                                }}
                            >
                                <div className="sidebar-item-left">
                                    <Icon size={18} className="sidebar-icon" />
                                    <span>{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className={`sidebar-badge badge-${item.badgeColor}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>


            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="main-wrapper">
                {/* TOP HEADER */}
                <header className="top-header">
                    {/* Mobile Hamburger Menu Toggle Button */}
                    <button className="mobile-menu-btn" onClick={() => setIsMobileSidebarOpen(true)}>
                        <Menu size={22} />
                    </button>

                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search for courses, topics, notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="header-actions">
                        <NotificationBell />
                    </div>
                </header>

                {/* DASHBOARD CONTENT BODY */}
                <div className="dashboard-body">
                    {/* WELCOME HERO SECTION */}
                    <div className="welcome-hero-row">
                        <div className="welcome-hero-left">
                            <h1>Welcome back, <span className="highlight-coral">{user?.name || 'sasa'}</span> 👋</h1>
                            <p>Ready to continue your learning journey?</p>
                        </div>
                        <div className="quote-box">
                            <span className="quote-mark">“</span>
                            <p>Small consistent efforts create massive results.</p>
                        </div>
                    </div>

                    {/* TOP 4 STAT CARDS */}
                    <div className="stats-cards-grid">
                        <div className="stat-card">
                            <div className="stat-icon-wrapper amber-bg">
                                <Flame size={22} className="amber-text" />
                            </div>
                            <div className="stat-details">
                                <span className="stat-title">Streak</span>
                                <div className="stat-value">{user?.streak || 3}</div>
                                <span className="stat-sub">days in a row</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon-wrapper purple-bg">
                                <Zap size={22} className="purple-text" />
                            </div>
                            <div className="stat-details">
                                <span className="stat-title">Level</span>
                                <div className="stat-value">{user?.level || 3}</div>
                                <span className="stat-sub">Keep going!</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon-wrapper yellow-bg">
                                <Star size={22} className="yellow-text" />
                            </div>
                            <div className="stat-details">
                                <span className="stat-title">Total XP</span>
                                <div className="stat-value">{user?.xp || 4630}</div>
                                <span className="stat-sub positive-text">+120 this week</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon-wrapper emerald-bg">
                                <Trophy size={22} className="emerald-text" />
                            </div>
                            <div className="stat-details">
                                <span className="stat-title">Reputation</span>
                                <div className="stat-value">{user?.reputation || 20}</div>
                                <span className="stat-sub">Top 15% learners</span>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE SECTION: TODAY'S PLAN | WEEKLY PROGRESS | RIGHT WIDGETS */}
                    {(() => {
                        const planCompletedCount = planTasks.filter(t => t.completed).length;
                        const planProgressPercent = planTasks.length > 0 ? Math.round((planCompletedCount / planTasks.length) * 100) : 0;
                        const weeklyChart = buildWeeklySvgPath(weeklyData);

                        return (
                            <div className="middle-widgets-grid">
                                {/* TODAY'S PLAN */}
                                <div className="widget-card todays-plan-card">
                                    <div className="widget-header">
                                        <h3><Calendar size={18} color="#6366f1" /> Today's Plan</h3>
                                        <span className={`badge-tag ${planProgressPercent === 100 ? 'tag-completed bg-emerald-500/15 text-emerald-600' : 'tag-progress'}`}>
                                            {planProgressPercent === 100 ? 'Completed 🎉' : 'In Progress • Active Goal'}
                                        </span>
                                    </div>

                                    <div className="plan-subject-info">
                                        <h4>{todayMission ? todayMission.title : 'Data Structures & Algorithms'}</h4>
                                        <p>{todayMission ? todayMission.task : 'Arrays and Linked List'}</p>
                                        
                                        <div className="progress-bar-container">
                                            <div className="progress-bar-fill" style={{ width: `${planProgressPercent}%`, transition: 'width 0.4s ease' }}></div>
                                        </div>
                                        <span className="progress-percentage">{planProgressPercent}%</span>
                                    </div>

                                    <div className="plan-checklist">
                                        {planTasks.map(task => (
                                            <label key={task.id} className={`checklist-item ${task.completed ? 'completed' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    onChange={() => toggleTask(task.id)}
                                                />
                                                <span className="checkmark-box"></span>
                                                <span className="task-text">{task.text}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <button className="widget-footer-btn" onClick={() => navigate('/planner')}>
                                        View Full Schedule <ArrowRight size={16} />
                                    </button>
                                </div>

                                {/* WEEKLY PROGRESS CHART */}
                                <div className="widget-card weekly-progress-card">
                                    <div className="widget-header">
                                        <h3><TrendingUp size={18} color="#8b5cf6" /> Weekly Progress</h3>
                                        <select className="time-select">
                                            <option>This Week</option>
                                            <option>Last Week</option>
                                        </select>
                                    </div>

                                    <div className="chart-container">
                                        <svg viewBox="0 0 400 130" className="chart-svg">
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>

                                            {/* Dynamic Area fill */}
                                            <path
                                                d={weeklyChart.areaPath}
                                                fill="url(#chartGradient)"
                                            />

                                            {/* Dynamic Curved Line */}
                                            <path
                                                d={weeklyChart.linePath}
                                                fill="none"
                                                stroke="#8b5cf6"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />

                                            {/* Active Peak Point */}
                                            <circle cx={weeklyChart.activeX} cy={weeklyChart.activeY} r="6" fill="#8b5cf6" stroke="#fff" strokeWidth="2" />
                                            <rect x={weeklyChart.activeX - 20} y={Math.max(2, weeklyChart.activeY - 25)} width="40" height="20" rx="6" fill="#8b5cf6" />
                                            <text x={weeklyChart.activeX} y={Math.max(2, weeklyChart.activeY - 25) + 14} fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">
                                                {weeklyChart.activePct}%
                                            </text>
                                        </svg>

                                        <div className="chart-days-labels">
                                            <span>Mon</span>
                                            <span>Tue</span>
                                            <span>Wed</span>
                                            <span>Thu</span>
                                            <span>Fri</span>
                                            <span>Sat</span>
                                            <span>Sun</span>
                                        </div>
                                    </div>

                                    <div className="chart-metrics-row">
                                        <div className="metric-dot-item">
                                            <span className="dot dot-completed"></span>
                                            <div>
                                                <strong className="metric-val">{weeklyStats.completed}</strong>
                                                <span className="metric-lbl">Completed</span>
                                            </div>
                                        </div>
                                        <div className="metric-dot-item">
                                            <span className="dot dot-inprogress"></span>
                                            <div>
                                                <strong className="metric-val">{weeklyStats.inProgress}</strong>
                                                <span className="metric-lbl">In Progress</span>
                                            </div>
                                        </div>
                                        <div className="metric-dot-item">
                                            <span className="dot dot-pending"></span>
                                            <div>
                                                <strong className="metric-val">{weeklyStats.pending}</strong>
                                                <span className="metric-lbl">Pending</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT STACKED WIDGETS: AI MENTOR + FOCUS TIMER */}
                                <div className="right-stacked-widgets">
                                    {/* AI MENTOR CARD */}
                                    <div className="widget-card ai-mentor-card">
                                        <div className="widget-header">
                                            <h3><Bot size={18} color="#06b6d4" /> AI Mentor</h3>
                                            <span className="badge-tag tag-new">New</span>
                                        </div>

                                        <div className="mentor-body">
                                            <div className="mentor-avatar-box">
                                                🤖
                                            </div>
                                            <div className="mentor-text">
                                                <h4>Hi {user?.name || 'sasa'}! 👋</h4>
                                                <p>How can I help you today?</p>
                                            </div>
                                        </div>

                                        <button className="start-chat-btn" onClick={() => setIsAiModalOpen(true)}>
                                            Start Chat
                                        </button>
                                    </div>

                                    {/* FOCUS TIME TIMER CARD */}
                                    <div className="widget-card focus-time-card">
                                        <div className="widget-header">
                                            <h3><Clock size={18} color="#f97316" /> Focus Time</h3>
                                            <div className="focus-card-header-actions">
                                                <button
                                                    className="focus-icon-action-btn"
                                                    onClick={() => setIsZenModalOpen(true)}
                                                    title="Open Fullscreen Zen Focus Mode"
                                                >
                                                    <Maximize2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="focus-timer-display">
                                            <div
                                                className="timer-numbers"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setIsZenModalOpen(true)}
                                                title="Click for Fullscreen Zen Mode"
                                            >
                                                {formatTimer(timerSeconds)}
                                            </div>
                                            <div className="timer-subtext">Pomodoro Session</div>

                                            {/* Quick Duration Presets */}
                                            <div className="focus-quick-preset-pills">
                                                {[15, 25, 45, 60].map(mins => (
                                                    <button
                                                        key={mins}
                                                        className={`focus-preset-pill ${initialTimerDuration === mins * 60 ? 'active' : ''}`}
                                                        onClick={() => handleSelectTimerPreset(mins)}
                                                        title={`Set to ${mins} minutes`}
                                                    >
                                                        {mins}m
                                                    </button>
                                                ))}
                                                <button
                                                    className="focus-preset-pill"
                                                    onClick={() => setIsZenModalOpen(true)}
                                                    title="Custom Minutes in Fullscreen"
                                                >
                                                    Custom...
                                                </button>
                                            </div>

                                            <div className="timer-controls" style={{ marginTop: '10px' }}>
                                                <button className="play-btn" onClick={toggleTimer} title={isTimerRunning ? "Pause" : "Start"}>
                                                    {isTimerRunning ? <Pause size={18} /> : <Play size={18} className="play-icon-offset" />}
                                                </button>
                                                <button className="reset-btn" onClick={resetTimer} title="Reset">
                                                    <RotateCcw size={14} />
                                                </button>
                                                <button
                                                    className="reset-btn"
                                                    onClick={() => setIsZenModalOpen(true)}
                                                    title="Fullscreen Zen Mode"
                                                >
                                                    <Maximize2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* LOWER SECTION: QUICK ACCESS & UPCOMING DEADLINES */}
                    <div className="lower-widgets-grid">
                        {/* QUICK ACCESS GRID */}
                        <div className="widget-card quick-access-card">
                            <div className="widget-header">
                                <h3><Sparkles size={18} color="#6366f1" /> Quick Access</h3>
                            </div>

                            <div className="quick-grid">
                                {quickAccessGrid.map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={idx}
                                            className="quick-grid-item"
                                            onClick={() => navigate(item.path)}
                                        >
                                            <div className="quick-item-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                                                <Icon size={22} />
                                            </div>
                                            <span className="quick-item-name">{item.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* UPCOMING DEADLINES */}
                        <div className="widget-card upcoming-deadlines-card">
                            <div className="widget-header">
                                <h3><Clock size={18} color="#ec4899" /> Upcoming Deadlines</h3>
                                <button className="view-all-link" onClick={() => navigate('/planner')}>View All</button>
                            </div>

                            <div className="deadlines-list">
                                {upcomingDeadlines.map((item, index) => (
                                    <div key={item.id || index} className="deadline-item">
                                        <div className="deadline-icon-box" style={{ backgroundColor: item.bg, color: item.color }}>
                                            <Calendar size={18} />
                                        </div>
                                        <div className="deadline-info">
                                            <h4>{item.title}</h4>
                                            <span>{item.due}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM LEVEL UP MOMENTUM BANNER */}
                    <div className="level-momentum-banner">
                        <div className="banner-left">
                            <div className="banner-title-row">
                                <h2>Keep the momentum going! <Flame size={24} className="banner-flame" /></h2>
                            </div>
                            <p>You're doing great! Complete your tasks and level up your skills.</p>
                        </div>

                        <div className="banner-progress-area">
                            <span className="task-progress-text">Complete 5 more tasks to level up!</span>
                            <div className="banner-progress-bar">
                                <div className="banner-progress-fill" style={{ width: `${Math.min(100, (xpProgressPercent))}%` }}></div>
                            </div>
                            <span className="progress-fraction">7 / 12</span>
                        </div>

                        <div
                            className={`hex-level-badge ${rewardClaimed ? 'claimed' : ''}`}
                            onClick={fireConfetti}
                            title="Click to Claim Reward!"
                        >
                            <span className="hex-lvl-number">{user?.level || 4}</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* ENHANCED AI MENTOR QUICK CHAT & FULLSCREEN MODAL */}
            <AIMentorModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                user={user}
                aiMessages={aiMessages}
                setAiMessages={setAiMessages}
                aiInput={aiInput}
                setAiInput={setAiInput}
                isAiTyping={isAiTyping}
                handleSendAiMessage={handleSendAiMessage}
            />

            {/* FULLSCREEN ZEN FOCUS TIME POMODORO MODAL */}
            <FocusZenModal
                isOpen={isZenModalOpen}
                onClose={() => setIsZenModalOpen(false)}
                timerSeconds={timerSeconds}
                setTimerSeconds={setTimerSeconds}
                isTimerRunning={isTimerRunning}
                setIsTimerRunning={setIsTimerRunning}
                initialDuration={initialTimerDuration}
                setInitialDuration={setInitialTimerDuration}
            />
        </div>
    );
}