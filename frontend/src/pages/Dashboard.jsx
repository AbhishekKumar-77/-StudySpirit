import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as soloApi from '../services/soloApi';
import {
    BookOpen, Users, Calendar, ClipboardCheck, Library, Code,
    Briefcase, Folder, MessageCircle, Mic, Brain, Edit3, Target, CheckCircle, Clock, Home, Shield, ChevronRight
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
    const { user, stats, setUser, setStats } = useApp();
    const navigate = useNavigate();
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [dashboardData, setDashboardData] = useState(null);
    const [todayStudyTime, setTodayStudyTime] = useState(0);

    const handleMouseMove = (e) => {
        setMousePosition({
            x: (e.clientX / window.innerWidth - 0.5) * 20,
            y: (e.clientY / window.innerHeight - 0.5) * 20
        });
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
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
        { id: 1, name: 'Solo Mode', path: '/solo-mode', icon: BookOpen },
        { id: 2, name: 'Group Mode', path: '/group-mode', icon: Users },
        { id: 3, name: 'Planner', path: '/planner', icon: Calendar },
        { id: 4, name: 'Quizzes', path: '/quiz', icon: ClipboardCheck },
        { id: 5, name: 'Resources', path: '/resources', icon: Library },
        { id: 6, name: 'CodeSpirit', path: '/codespirit', icon: Code },
        { id: 7, name: 'Interview prep', path: '/interview', icon: Mic },
        { id: 8, name: 'CareerSprint', path: '/career', icon: Briefcase },
        { id: 9, name: 'Project Lab', path: '/project-lab', icon: Folder },
        { id: 10, name: 'DiscussVerse', path: '/discuss', icon: MessageCircle },
        { id: 11, name: 'Soft Skills', path: '/soft-skills', icon: Brain },
        { id: 12, name: 'Editors', path: '/code-editor', icon: Edit3 }
    ];

    const quickStats = [
        {
            label: 'Daily Tasks',
            value: stats?.dailyGoals || 0,
            subtext: 'Missions Today',
            icon: Target,
            from: '#00d2ff', to: '#3a7bd5'
        },
        {
            label: 'Success Rate',
            value: `${stats?.completionRate || 0}%`,
            subtext: 'Keep it going!',
            icon: CheckCircle,
            from: '#f093fb', to: '#f5576c'
        },
        {
            label: 'Focus Time',
            value: formatStudyTime(todayStudyTime),
            subtext: `Today • ${formatStudyTime((dashboardData?.user?.totalStudyTime || 0))} total`,
            icon: Clock,
            from: '#ff0844', to: '#ffb199'
        },
    ];

    return (
        <div className="dashboard-container">
            {/* Ambient Background Gradient */}
            <div className="ambient-background" />
            <div className="ambient-grid" />

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
                {/* Header Card (Welcome Back + Top Stats) */}
                <div className="welcome-card">
                    <div className="welcome-header">
                        <div className="system-online">
                            <span className="pulse-dot"></span> SYSTEM ONLINE
                        </div>
                        <h1>Welcome Back,<br /><span className="highlight-name">{user?.name || 'Developer'}</span> <span className="wave">👋</span></h1>
                        <p>Your dashboard is ready. Time to dive into deep work and crush today's objectives.</p>
                    </div>

                    <div className="top-stats-grid">
                        <div className="top-stat-box box-amber">
                            <div className="stat-label">ACTIVE STREAK</div>
                            <div className="stat-value text-amber">🔥 {user?.streak || 0}</div>
                        </div>
                        <div className="top-stat-box box-cyan">
                            <div className="stat-label">CURRENT LEVEL</div>
                            <div className="stat-value text-cyan">{user?.level || 1}</div>
                        </div>
                        <div className="top-stat-box box-purple">
                            <div className="stat-label">TOTAL EXP</div>
                            <div className="stat-value text-purple">{user?.xp || 0}</div>
                        </div>
                        <div className="top-stat-box box-emerald">
                            <div className="stat-label">REPUTATION</div>
                            <div className="stat-value text-emerald">{user?.reputation || 0}</div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="quick-stats-container">
                    {quickStats.map((stat, idx) => (
                        <div key={idx} className="quick-stat-card">
                            <div className="quick-stat-icon" style={{ background: `linear-gradient(135deg, ${stat.from}, ${stat.to})` }}>
                                <stat.icon size={28} color="#fff" />
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

                <div className="holographic-title">
                    <div className="system-modules-header">
                        <h2>HOLOGRAPHIC <span>MODULES</span></h2>
                        <p>Access your personalized toolkit for extreme productivity.</p>
                    </div>
                </div>

                {/* Holographic Scene (Increased Size & Spacing) */}
                <div className="hologram-wrapper">
                    <div className="holographic-scene" style={{
                        transform: `rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`
                    }}>

                        {/* Central Holographic Book */}
                        <div className="central-book-container">
                            <div className="book-base-glow" />

                            <div className="css-book">
                                <div className="book-cover-left">
                                    <div className="poly-pattern"></div>
                                </div>
                                <div className="book-cover-right">
                                    <div className="poly-pattern"></div>
                                </div>
                                <div className="book-spine"></div>
                                <div className="book-center-light"></div>
                            </div>

                            {/* Ring Base on the ground */}
                            <div className="base-ring">
                                {[...Array(24)].map((_, i) => (
                                    <div key={i} className="ring-segment" style={{ transform: `rotate(${i * 15}deg)` }}></div>
                                ))}
                            </div>
                        </div>

                        {/* Orbiting Modules (Larger Orbit) */}
                        <div className="orbit-container">
                            {features.map((feature, idx) => {
                                const total = features.length;
                                const angle = (idx / total) * 360;
                                const isHovered = hoveredFeature === feature.id;

                                // MUCH Larger elliptical orbit for spacing
                                const radiusX = 540;
                                const radiusY = 280;
                                const rad = (angle - 90) * (Math.PI / 180);
                                const x = Math.cos(rad) * radiusX;
                                const y = Math.sin(rad) * radiusY;

                                // Z-index logic: Front items higher, back items lower
                                const zIndex = Math.floor(y) + 500;
                                const scale = 1 + (y / radiusY) * 0.3; // Front nodes larger, back nodes smaller

                                return (
                                    <div
                                        key={feature.id}
                                        className={`feature-node ${isHovered ? 'hovered' : ''}`}
                                        onMouseEnter={() => setHoveredFeature(feature.id)}
                                        onMouseLeave={() => setHoveredFeature(null)}
                                        onClick={() => navigate(feature.path)}
                                        style={{
                                            transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                                            zIndex: isHovered ? 9999 : zIndex // Huge z-index to stay on top
                                        }}
                                    >
                                        <div className="ground-ripple" />

                                        <div className="holo-beam">
                                            <div className="holo-beam-core" />
                                        </div>

                                        <div className="icon-sphere">
                                            <div className="icon-sphere-glow" />
                                            <div className="icon-sphere-border" />
                                            <feature.icon size={20} className="feature-icon" />
                                        </div>

                                        <div className="feature-label">
                                            {feature.name}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div >
                </div >
            </div >

            <div className="watermark">StudySpirit Nexus System</div>
        </div >
    );
}