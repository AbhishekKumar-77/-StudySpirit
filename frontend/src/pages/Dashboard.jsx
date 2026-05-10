import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as soloApi from '../services/soloApi';
import { taskAPI } from '../services/plannerApi';
import { getRecentPages } from '../hooks/usePageTracker';
import NotificationBell from '../components/NotificationBell';
import confetti from 'canvas-confetti';
import {
    BookOpen, Users, Calendar, ClipboardCheck, Library, Code,
    Briefcase, Folder, MessageCircle, Mic, Brain, Edit3, Target, CheckCircle, Clock, Home, Shield, ChevronRight, ArrowRight, FileCheck, History, Map, Share2, Award, Copy
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
    const { user, stats, setUser, setStats } = useApp();
    const navigate = useNavigate();
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [todayStudyTime, setTodayStudyTime] = useState(0);
    const [isLight, setIsLight] = useState(false);
    const [rewardClaimed, setRewardClaimed] = useState(false);
    const [todayMission, setTodayMission] = useState(null);
    const [recentPages, setRecentPages] = useState([]);
    const [copied, setCopied] = useState(false);

    const copyProfileLink = () => {
        const link = `${window.location.origin}/profile/${user?._id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        setRecentPages(getRecentPages());
    }, []);

    // Fireworks & Confetti Burst
    const fireConfetti = useCallback(() => {
        if (rewardClaimed) return;
        setRewardClaimed(true);

        const duration = 3000;
        const end = Date.now() + duration;

        const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e', '#06b6d4', '#ff6b6b', '#ffd93d'];

        // Center burst
        confetti({
            particleCount: 100,
            spread: 100,
            origin: { x: 0.5, y: 0.5 },
            colors,
            startVelocity: 45,
            gravity: 0.8,
            shapes: ['circle', 'square'],
            scalar: 1.2,
            zIndex: 10000
        });

        // Side bursts
        setTimeout(() => {
            confetti({ particleCount: 50, angle: 60, spread: 70, origin: { x: 0, y: 0.6 }, colors, zIndex: 10000 });
            confetti({ particleCount: 50, angle: 120, spread: 70, origin: { x: 1, y: 0.6 }, colors, zIndex: 10000 });
        }, 200);

        // Continuous firework bursts
        const interval = setInterval(() => {
            if (Date.now() > end) {
                clearInterval(interval);
                return;
            }

            confetti({
                particleCount: 30,
                angle: 60 + Math.random() * 60,
                spread: 60 + Math.random() * 40,
                origin: { x: Math.random(), y: Math.random() * 0.4 },
                colors,
                startVelocity: 30 + Math.random() * 20,
                gravity: 1,
                zIndex: 10000
            });
        }, 250);

        // Star burst at top
        setTimeout(() => {
            confetti({
                particleCount: 80,
                spread: 160,
                origin: { x: 0.5, y: 0.2 },
                colors,
                startVelocity: 55,
                gravity: 1.2,
                shapes: ['star'],
                scalar: 1.5,
                zIndex: 10000
            });
        }, 500);

        // Final grand burst
        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 180,
                origin: { x: 0.5, y: 0.35 },
                colors,
                startVelocity: 50,
                gravity: 0.6,
                shapes: ['circle', 'square', 'star'],
                scalar: 1.3,
                ticks: 300,
                zIndex: 10000
            });
        }, 1200);

        // Reset after 5 seconds
        setTimeout(() => setRewardClaimed(false), 5000);
    }, [rewardClaimed]);

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
                } catch (err) {
                    console.error('Failed to fetch tasks', err);
                }

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

                    // Pull today's mission from learning path roadmap
                    const lp = data.learningPath;
                    if (lp && lp.topics && lp.topics.length > 0) {
                        const activeTopic = lp.topics.find(t => t.status === 'active') || lp.topics[0];
                        if (activeTopic) {
                            setTodayMission({
                                title: activeTopic.name || 'Study Session',
                                task: activeTopic.task || `Study ${activeTopic.name} today`,
                                xp: activeTopic.xp || 50,
                                tag: activeTopic.tag || 'concept',
                                day: activeTopic.day || 1
                            });
                        }
                    }
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
        { id: 13, name: 'Exams', description: 'Quiz & coding exams', path: '/exams', icon: FileCheck, color: '#ef4444' },
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
            from: '#6366f1', to: '#8b5cf6',
            path: '/planner'
        },
        {
            label: 'Success Rate',
            value: `${stats?.completionRate || 0}%`,
            subtext: 'Keep it going!',
            icon: CheckCircle,
            from: '#ec4899', to: '#f43f5e',
            path: '/planner'
        },
        {
            label: 'Focus Time',
            value: formatStudyTime(todayStudyTime),
            subtext: `Today • ${formatStudyTime((dashboardData?.user?.totalStudyTime || 0))} total`,
            icon: Clock,
            from: '#f97316', to: '#f59e0b',
            path: '/solo-mode'
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
                        <NotificationBell />
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

                {/* Skill Passport Share Section */}
                <div className="profile-share-card">
                    <div className="ps-content">
                        <div className="ps-icon"><Shield size={24} color="#6366f1" /></div>
                        <div className="ps-info">
                            <h3>Your Skill Passport is Active</h3>
                            <p>Recruiters can now see your verified scores and streak.</p>
                        </div>
                    </div>
                    <div className="ps-actions">
                        <button className="btn-outline" onClick={() => navigate(`/profile/${user?._id}`)}>
                            <Eye size={16} /> View
                        </button>
                        <button className="btn-primary" onClick={copyProfileLink}>
                            {copied ? <CheckCircle size={16} /> : <Share2 size={16} />}
                            {copied ? 'Copied!' : 'Share Link'}
                        </button>
                    </div>
                </div>

                {/* Badges Section */}
                {user?.badges?.length > 0 && (
                    <div className="badges-section">
                        <div className="badges-header">
                            <h3><Award size={18} className="text-primary" /> Your Milestones</h3>
                            <span className="badge-count">{user.badges.length} Unlocked</span>
                        </div>
                        <div className="badges-row">
                            {user.badges.map((badge, i) => (
                                <div key={i} className="badge-item" title={badge.description}>
                                    <span className="badge-icon">{badge.icon}</span>
                                    <span className="badge-name">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Stats Cards */}
                <div className="quick-stats-container">
                    {quickStats.map((stat, idx) => (
                        <div 
                            key={idx} 
                            className="quick-stat-card" 
                            style={stat.path ? { cursor: 'pointer' } : {}}
                            onClick={() => stat.path && navigate(stat.path)}
                        >
                            <div className="quick-stat-icon" style={{ background: `linear-gradient(135deg, ${stat.from}, ${stat.to})` }}>
                                <stat.icon size={24} color="#fff" />
                            </div>
                            <div className="quick-stat-info">
                                <div className="qs-label">{stat.label}</div>
                                <div className="qs-value">{stat.value}</div>
                                <div className="qs-subtext">{stat.subtext}</div>
                            </div>
                            {stat.path && <ChevronRight className="qs-arrow" size={20} />}
                        </div>
                    ))}
                </div>

                {/* Smart Action Area */}
                <div className="action-area">
                    {/* Today's Mission Card — Smart fallback if no roadmap */}
                    <div className="today-mission-card" onClick={() => navigate(todayMission ? '/solo-mode' : '/planner')} style={{ cursor: 'pointer' }}>
                        <div className="mission-left">
                            <div className="mission-badge">⚡ TODAY'S MISSION</div>
                            <h3 className="mission-title">{todayMission ? todayMission.title : 'Establish Your Foundation'}</h3>
                            <p className="mission-task">{todayMission ? todayMission.task : 'Set up your daily goals in the Planner to track your progress.'}</p>
                            <div className="mission-meta">
                                <span className="mission-xp">+{todayMission ? todayMission.xp : 50} XP</span>
                                <span className="mission-tag">{todayMission ? todayMission.tag : 'planning'}</span>
                                {todayMission?.day && <span className="mission-day">Day {todayMission.day}</span>}
                            </div>
                        </div>
                        <div className="mission-arrow">→</div>
                    </div>

                    {/* Continue Where You Left Off */}
                    {recentPages.length > 0 && (
                        <div className="recent-pages-section">
                            <div className="recent-header">
                                <h3><History size={16} /> Continue Where You Left Off</h3>
                                <p>Jump right back into your active sessions.</p>
                            </div>
                            <div className="recent-grid">
                                {recentPages.map((page, i) => (
                                    <div key={i} className="recent-card" onClick={() => navigate(page.path)}>
                                        <div className="recent-icon">{page.icon}</div>
                                        <div className="recent-info">
                                            <h4>{page.name}</h4>
                                            <span className="recent-time">Visited recently</span>
                                        </div>
                                        <ArrowRight size={14} className="recent-arrow" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Goal Badge — shown when user has a study goal */}
                {user?.studyGoal && user?.onboardingCompleted && (
                    <div className="goal-badge-row">
                        <div className="goal-badge">
                            <span className="goal-icon">🎯</span>
                            <span className="goal-text">{user.studyGoal}</span>
                            <span className="goal-divider">•</span>
                            <span className="goal-level">{user.difficultyLevel || 'Student'}</span>
                        </div>
                        <button className="change-goal-btn" onClick={() => navigate('/onboarding')}>Change Goal</button>
                    </div>
                )}

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
                        <button
                            className={`claim-reward-btn ${rewardClaimed ? 'claimed' : ''}`}
                            onClick={fireConfetti}
                        >
                            {rewardClaimed ? '✨ CLAIMED ✓' : '🎉 CLAIM REWARD'}
                        </button>
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