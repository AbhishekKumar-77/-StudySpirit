import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as soloApi from '../services/soloApi';
import {
    BookOpen, Users, Calendar, ClipboardCheck, Library, Code,
    Briefcase, Folder, MessageCircle, Mic, Brain, Edit3, Target, CheckCircle, Clock, Home, Shield, ChevronRight, ArrowRight
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
    const { user, stats, setUser, setStats } = useApp();
    const navigate = useNavigate();
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [todayStudyTime, setTodayStudyTime] = useState(0);
    const [isLight, setIsLight] = useState(false);

    // Theme Detection
    useEffect(() => {
        const checkTheme = () => setIsLight(document.documentElement.classList.contains('light'));
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Fetch Dashboard Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await soloApi.getStats();
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
                    setStats({
                        dailyGoals: data.user.dailyGoal || 5,
                        completionRate: Math.round((data.user.problemsSolvedToday / (data.user.dailyGoal || 5)) * 100) || 0
                    });
                    setTodayStudyTime(data.user.todayStudyTime || 0);
                }
            } catch (err) { }
        };
        fetchDashboardData();
    }, [setUser, setStats]);

    const formatStudyTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const features = [
        { id: 1, name: 'Solo Mode', description: 'Deep focus study sessions', path: '/solo-mode', icon: BookOpen, color: '#6366f1' },
        { id: 2, name: 'Group Mode', description: 'Collaborate with peers', path: '/group-mode', icon: Users, color: '#8b5cf6' },
        { id: 3, name: 'Planner', description: 'Organize your schedule', path: '/planner', icon: Calendar, color: '#ec4899' },
        { id: 4, name: 'Quizzes', description: 'Test your knowledge', path: '/quiz', icon: ClipboardCheck, color: '#f59e0b' },
        { id: 5, name: 'Resources', description: 'Curated study materials', path: '/resources', icon: Library, color: '#10b981' },
        { id: 6, name: 'CodeSpirit', description: 'Practice coding challenges', path: '/codespirit', icon: Code, color: '#06b6d4' },
        { id: 7, name: 'Interview Prep', description: 'AI-powered mock interviews', path: '/interview', icon: Mic, color: '#f43f5e' },
        { id: 8, name: 'CareerSprint', description: 'Plan your career path', path: '/career', icon: Briefcase, color: '#84cc16' },
        { id: 9, name: 'Project Lab', description: 'Build real-world projects', path: '/project-lab', icon: Folder, color: '#f97316' },
        { id: 10, name: 'DiscussVerse', description: 'Community discussions', path: '/discuss', icon: MessageCircle, color: '#14b8a6' },
        { id: 11, name: 'Soft Skills', description: 'Communication & leadership', path: '/soft-skills', icon: Brain, color: '#a855f7' },
        { id: 12, name: 'Editors', description: 'Online code editor', path: '/code-editor', icon: Edit3, color: '#64748b' }
    ];

    const quickStats = [
        {
            label: 'Daily Tasks',
            value: stats?.dailyGoals || 0,
            subtext: 'Missions Today',
            icon: Target,
            from: '#6366f1', to: '#8b5cf6'
        },
        {
            label: 'Success Rate',
            value: `${stats?.completionRate || 0}%`,
            subtext: 'Keep it going!',
            icon: CheckCircle,
            from: '#ec4899', to: '#f43f5e'
        },
        {
            label: 'Focus Time',
            value: formatStudyTime(todayStudyTime),
            subtext: `Today • ${formatStudyTime((dashboardData?.user?.totalStudyTime || 0))} total`,
            icon: Clock,
            from: '#f97316', to: '#f59e0b'
        },
    ];

    return (
        <div className={`dashboard-container ${isLight ? 'light-mode' : 'dark-mode'}`}>
            {/* Background Image with Overlay */}
            <div className="dashboard-bg" />
            <div className="dashboard-overlay" />

            {/* Navbar */}
            <nav className="dash-nav">
                <div className="nav-container">
                    <div className="nav-logo" onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="Logo" />
                        <span className="logo-text">
                            STUDY<span>SPIRIT</span>
                        </span>
                    </div>

                    <div className="nav-actions">
                        <button className="nav-home" onClick={() => navigate('/')}>
                            <Home size={20} />
                        </button>
                        {user?.isAdmin && (
                            <button className="nav-admin" onClick={() => navigate('/admin')}>
                                <Shield size={16} /> ADMIN
                            </button>
                        )}
                        <div className="nav-profile">
                            <div className="streak">
                                <span>🔥</span> <strong>{user?.streak || 0}</strong>
                            </div>
                            <div className="divider" />
                            <div className="profile-info">
                                <div className="profile-name">{user?.name || 'SYS.USER'}</div>
                                <div className="profile-level">LEVEL {user?.level || 1}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="dashboard-content">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <div className="welcome-badge">
                        <span className="pulse-dot"></span> SYSTEM ONLINE
                    </div>
                    <h1 className="welcome-title">
                        Welcome Back, <br />
                        <span className="highlight-name">{user?.name || 'Developer'}</span> <span className="wave">👋</span>
                    </h1>
                    <p className="welcome-subtitle">Your dashboard is ready. Time to dive into deep work and crush today's objectives.</p>
                </div>

                {/* Stats Row */}
                <div className="stats-row">
                    <div className="stat-pill">
                        <span className="stat-pill-icon">🔥</span>
                        <div>
                            <div className="stat-pill-label">Streak</div>
                            <div className="stat-pill-value amber">{user?.streak || 0}</div>
                        </div>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-pill-icon">⚡</span>
                        <div>
                            <div className="stat-pill-label">Level</div>
                            <div className="stat-pill-value cyan">{user?.level || 1}</div>
                        </div>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-pill-icon">✨</span>
                        <div>
                            <div className="stat-pill-label">Total XP</div>
                            <div className="stat-pill-value purple">{user?.xp || 0}</div>
                        </div>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-pill-icon">🏆</span>
                        <div>
                            <div className="stat-pill-label">Reputation</div>
                            <div className="stat-pill-value emerald">{user?.reputation || 0}</div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="quick-stats-container">
                    {quickStats.map((stat, idx) => (
                        <div key={idx} className="quick-stat-card">
                            <div className="quick-stat-icon" style={{ background: `linear-gradient(135deg, ${stat.from}, ${stat.to})` }}>
                                <stat.icon size={24} color="#fff" />
                            </div>
                            <div className="quick-stat-info">
                                <div className="qs-label">{stat.label}</div>
                                <div className="qs-value">{stat.value}</div>
                                <div className="qs-subtext">{stat.subtext}</div>
                            </div>
                            <ChevronRight className="qs-arrow" size={20} />
                        </div>
                    ))}
                </div>

                {/* Streak Reward Alert */}
                {user?.streak > 0 && (
                    <div className="streak-reward-card">
                        <div className="reward-content">
                            <span className="reward-icon">🔥</span>
                            <div>
                                <h2>Unstoppable!</h2>
                                <p>You're on a <strong>{user?.streak}-day streak</strong>. Keep the momentum high.</p>
                            </div>
                        </div>
                        <button className="claim-reward-btn">CLAIM REWARD</button>
                    </div>
                )}

                {/* Features Section Title */}
                <div className="features-header">
                    <h2>Your <span>Toolkit</span></h2>
                    <p>Access your personalized modules for extreme productivity.</p>
                </div>

                {/* Feature Cards Grid */}
                <div className="features-grid">
                    {features.map((feature) => {
                        const isHovered = hoveredFeature === feature.id;
                        return (
                            <div
                                key={feature.id}
                                className={`feature-card ${isHovered ? 'hovered' : ''}`}
                                onMouseEnter={() => setHoveredFeature(feature.id)}
                                onMouseLeave={() => setHoveredFeature(null)}
                                onClick={() => navigate(feature.path)}
                            >
                                <div className="feature-card-glow" style={{ background: feature.color }} />
                                <div className="feature-card-icon" style={{ background: `${feature.color}15`, borderColor: `${feature.color}40` }}>
                                    <feature.icon size={26} style={{ color: feature.color }} />
                                </div>
                                <h3 className="feature-card-name">{feature.name}</h3>
                                <p className="feature-card-desc">{feature.description}</p>
                                <div className="feature-card-arrow" style={{ color: feature.color }}>
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="watermark">StudySpirit Nexus System</div>
        </div>
    );
}