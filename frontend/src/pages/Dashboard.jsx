import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as soloApi from '../services/soloApi';
import { taskAPI } from '../services/plannerApi';
import { getRecentPages } from '../hooks/usePageTracker';
import NotificationBell from '../components/NotificationBell';
import confetti from 'canvas-confetti';
import {
    LayoutDashboard, BookOpen, Users, Calendar, ClipboardCheck, Code,
    Mic, Library, Briefcase, Folder, MessageCircle, Brain, Edit3,
    Search, Flame, Zap, Star, Trophy, CheckCircle2, Clock, Play, Pause,
    RotateCcw, ChevronRight, ArrowRight, Shield, Award, Sparkles, Bot,
    FileCheck, Plus, Sparkle, ExternalLink, TrendingUp
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
    const { user, stats, setUser, setStats } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Data States
    const [dashboardData, setDashboardData] = useState(null);
    const [todayStudyTime, setTodayStudyTime] = useState(0);
    const [todayMission, setTodayMission] = useState(null);
    const [recentPages, setRecentPages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [rewardClaimed, setRewardClaimed] = useState(false);

    // Pomodoro Focus Timer State (25 mins default = 1500 sec)
    const [timerSeconds, setTimerSeconds] = useState(1500);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Plan Checklist State
    const [planTasks, setPlanTasks] = useState([
        { id: 1, text: 'Watch Introduction Video', completed: true },
        { id: 2, text: 'Practice Problems (5/10)', completed: false },
        { id: 3, text: 'Take Quiz', completed: false }
    ]);

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

    const toggleTask = (id) => {
        setPlanTasks(prev => prev.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
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

    // Fetch Dashboard Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await soloApi.getStats();
                
                let totalTasksForToday = 0;
                let completedTasksForToday = 0;
                let hasTasks = false;
                
                try {
                    const tasksRes = await taskAPI.getAll();
                    if (tasksRes && tasksRes.tasks) {
                        const todayDateStr = new Date().toDateString();
                        const dailyTasks = tasksRes.tasks.filter(t => {
                            if (t.status === 'completed' && t.completedAt) {
                                return new Date(t.completedAt).toDateString() === todayDateStr;
                            }
                            if (t.dueDate) {
                                return new Date(t.dueDate).toDateString() === todayDateStr;
                            }
                            return t.status !== 'completed';
                        });
                        totalTasksForToday = dailyTasks.length;
                        completedTasksForToday = dailyTasks.filter(t => t.status === 'completed').length;
                        hasTasks = true;
                    }
                } catch (err) { }

                if (data && data.user) {
                    setDashboardData(data);
                    setUser(prev => ({
                        ...prev,
                        name: data.user.name || prev?.name,
                        email: data.user.email || prev?.email,
                        streak: data.user.studyStreak || 0,
                        level: data.user.level || 1,
                        xp: data.user.totalXP || 0,
                        reputation: data.user.reputation || 0
                    }));
                    
                    const dailyGoalsCount = hasTasks ? totalTasksForToday : (data.user.dailyGoal || 5);
                    let compRate = 0;
                    if (hasTasks && totalTasksForToday > 0) {
                        compRate = Math.round((completedTasksForToday / totalTasksForToday) * 100);
                    } else if (data.user.problemsSolvedToday) {
                        compRate = Math.round((data.user.problemsSolvedToday / (data.user.dailyGoal || 5)) * 100);
                    }
                    
                    setStats({
                        dailyGoals: dailyGoalsCount,
                        completionRate: compRate
                    });
                    setTodayStudyTime(data.user.todayStudyTime || 0);

                    const lp = data.learningPath;
                    if (lp && lp.topics && lp.topics.length > 0) {
                        const activeTopic = lp.topics.find(t => t.status === 'active') || lp.topics[0];
                        if (activeTopic) {
                            setTodayMission({
                                title: activeTopic.name || 'Data Structures & Algorithms',
                                task: activeTopic.task || 'Arrays and Linked List',
                                xp: activeTopic.xp || 50,
                                tag: activeTopic.tag || 'In Progress',
                                day: activeTopic.day || 1
                            });
                        }
                    }
                }
            } catch (err) { }
        };
        fetchDashboardData();
    }, [setUser, setStats]);

    // 13 Features list matching the user request & sidebar
    const navFeatures = [
        { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { id: 'solo', name: 'Solo Mode', path: '/solo-mode', icon: BookOpen, badge: 'Live', badgeColor: 'green' },
        { id: 'group', name: 'Group Mode', path: '/group-mode', icon: Users },
        { id: 'planner', name: 'Study Planner', path: '/planner', icon: Calendar },
        { id: 'quizzes', name: 'Quizzes & Exams', path: '/quiz', icon: ClipboardCheck },
        { id: 'codespirit', name: 'CodeSpirit', path: '/codespirit', icon: Code },
        { id: 'interview', name: 'Interview Prep', path: '/interview', icon: Mic, badge: 'AI', badgeColor: 'coral' },
        { id: 'resources', name: 'Study Resources', path: '/resources', icon: Library },
        { id: 'career', name: 'CareerSprint', path: '/career', icon: Briefcase },
        { id: 'project', name: 'Project Lab', path: '/project-lab', icon: Folder },
        { id: 'discuss', name: 'DiscussVerse', path: '/discuss', icon: MessageCircle },
        { id: 'softskills', name: 'Soft Skills', path: '/soft-skills', icon: Brain },
        { id: 'editors', name: 'Code Editor', path: '/code-editor', icon: Edit3 },
    ];

    const quickAccessGrid = [
        { name: 'CodeSpirit', icon: Code, color: '#06b6d4', bg: '#ecfeff', path: '/codespirit' },
        { name: 'Quizzes', icon: ClipboardCheck, color: '#ec4899', bg: '#fdf2f8', path: '/quiz' },
        { name: 'Solo Mode', icon: BookOpen, color: '#6366f1', bg: '#eef2ff', path: '/solo-mode' },
        { name: 'Group Study', icon: Users, color: '#8b5cf6', bg: '#f5f3ff', path: '/group-mode' },
        { name: 'Resources', icon: Library, color: '#10b981', bg: '#ecfdf5', path: '/resources' },
        { name: 'Interview Prep', icon: Mic, color: '#f43f5e', bg: '#fff1f2', path: '/interview' },
        { name: 'CareerSprint', icon: Briefcase, color: '#84cc16', bg: '#f7fee7', path: '/career' },
        { name: 'Project Lab', icon: Folder, color: '#f97316', bg: '#fff7ed', path: '/project-lab' },
        { name: 'DiscussVerse', icon: MessageCircle, color: '#14b8a6', bg: '#f0fdfa', path: '/discuss' },
        { name: 'Soft Skills', icon: Brain, color: '#a855f7', bg: '#faf5ff', path: '/soft-skills' }
    ];

    const upcomingDeadlines = [
        { id: 1, title: 'Data Structures Quiz', due: 'Due Tomorrow, 11:59 PM', color: '#8b5cf6', bg: '#f5f3ff' },
        { id: 2, title: 'Arrays Assignment', due: 'Due May 18, 2025', color: '#f97316', bg: '#fff7ed' },
        { id: 3, title: 'Mock Interview Round', due: 'Due May 20, 2025', color: '#10b981', bg: '#ecfdf5' },
    ];

    const filterSearch = (item) => {
        if (!searchQuery) return true;
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    };

    return (
        <div className="new-dashboard-layout">
            {/* LEFT SIDEBAR */}
            <aside className="sidebar">
                <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
                    <div className="brand-logo">
                        <img src="/logo.png" alt="StudySpirit Logo" onError={(e) => { e.target.style.display = 'none'; }} />
                        <Sparkles size={24} className="brand-fallback-icon" />
                    </div>
                    <div className="brand-text">
                        <span className="brand-title">StudySpirit</span>
                        <span className="brand-subtitle">Learn • Practice • Grow</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navFeatures.filter(filterSearch).map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.id === 'dashboard' && location.pathname === '/dashboard');
                        return (
                            <button
                                key={item.id}
                                className={`sidebar-item ${isActive ? 'active' : ''}`}
                                onClick={() => navigate(item.path)}
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

                <div className="sidebar-footer">
                    <div className="upgrade-card">
                        <div className="upgrade-icon">🔥</div>
                        <h4>Upgrade to Pro</h4>
                        <p>Unlock premium features and accelerate your learning.</p>
                        <button className="upgrade-btn" onClick={() => navigate('/onboarding')}>Upgrade Now</button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="main-wrapper">
                {/* TOP HEADER */}
                <header className="top-header">
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
                        
                        <div className="user-profile-widget" onClick={() => navigate(`/profile/${user?._id || ''}`)}>
                            <div className="user-streak-badge">
                                <Flame size={16} className="flame-icon" />
                                <span>{user?.streak || 3}</span>
                            </div>
                            <div className="user-level-badge">
                                <span className="user-name">{user?.name || 'sasa'}</span>
                                <span className="user-lvl">Level {user?.level || 3}</span>
                            </div>
                            <img
                                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                                alt="User Avatar"
                                className="user-avatar"
                            />
                        </div>
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
                    <div className="middle-widgets-grid">
                        {/* TODAY'S PLAN */}
                        <div className="widget-card todays-plan-card">
                            <div className="widget-header">
                                <h3><Calendar size={18} color="#6366f1" /> Today's Plan</h3>
                                <span className="badge-tag tag-progress">In Progress • 2:30 PM - 3:15 PM</span>
                            </div>

                            <div className="plan-subject-info">
                                <h4>{todayMission ? todayMission.title : 'Data Structures & Algorithms'}</h4>
                                <p>{todayMission ? todayMission.task : 'Arrays and Linked List'}</p>
                                
                                <div className="progress-bar-container">
                                    <div className="progress-bar-fill" style={{ width: '65%' }}></div>
                                </div>
                                <span className="progress-percentage">65%</span>
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
                                <svg viewBox="0 0 400 150" className="chart-svg">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Area fill */}
                                    <path
                                        d="M 20,120 Q 70,110 120,80 T 220,70 T 320,30 L 370,50 L 370,140 L 20,140 Z"
                                        fill="url(#chartGradient)"
                                    />

                                    {/* Curved Line */}
                                    <path
                                        d="M 20,120 Q 70,110 120,80 T 220,70 T 320,30 L 370,50"
                                        fill="none"
                                        stroke="#8b5cf6"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />

                                    {/* Active Point at 75% */}
                                    <circle cx="320" cy="30" r="6" fill="#8b5cf6" stroke="#fff" strokeWidth="2" />
                                    <rect x="300" y="5" width="40" height="20" rx="6" fill="#8b5cf6" />
                                    <text x="320" y="19" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">75%</text>
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
                                        <strong className="metric-val">12</strong>
                                        <span className="metric-lbl">Completed</span>
                                    </div>
                                </div>
                                <div className="metric-dot-item">
                                    <span className="dot dot-inprogress"></span>
                                    <div>
                                        <strong className="metric-val">18</strong>
                                        <span className="metric-lbl">In Progress</span>
                                    </div>
                                </div>
                                <div className="metric-dot-item">
                                    <span className="dot dot-pending"></span>
                                    <div>
                                        <strong className="metric-val">6</strong>
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

                                <button className="start-chat-btn" onClick={() => navigate('/interview')}>
                                    Start Chat
                                </button>
                            </div>

                            {/* FOCUS TIME TIMER CARD */}
                            <div className="widget-card focus-time-card">
                                <div className="widget-header">
                                    <h3><Clock size={18} color="#f97316" /> Focus Time</h3>
                                </div>

                                <div className="focus-timer-display">
                                    <div className="timer-numbers">
                                        {formatTimer(timerSeconds)}
                                    </div>
                                    <div className="timer-subtext">Pomodoro Session</div>

                                    <div className="timer-controls">
                                        <button className="play-btn" onClick={toggleTimer} title={isTimerRunning ? "Pause" : "Start"}>
                                            {isTimerRunning ? <Pause size={18} /> : <Play size={18} className="play-icon-offset" />}
                                        </button>
                                        <button className="reset-btn" onClick={resetTimer} title="Reset">
                                            <RotateCcw size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                {upcomingDeadlines.map(item => (
                                    <div key={item.id} className="deadline-item">
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
                                <div className="banner-progress-fill" style={{ width: '58%' }}></div>
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
        </div>
    );
}