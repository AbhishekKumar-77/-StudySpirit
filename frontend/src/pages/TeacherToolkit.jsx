import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ClipboardCheck, Home, Shield, ArrowRight, Library, Target } from 'lucide-react';
import './Dashboard.css';

export default function TeacherToolkit() {
    const { user } = useApp();
    const navigate = useNavigate();
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [isLight, setIsLight] = useState(false);

    // Theme Detection
    useEffect(() => {
        const checkTheme = () => setIsLight(document.documentElement.classList.contains('light'));
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Redirect non-teachers
    useEffect(() => {
        if (user && user.role !== 'teacher') navigate('/dashboard');
    }, [user, navigate]);

    const features = [
        {
            id: 1,
            name: 'Quizzes',
            description: 'Manage quizzes & monitor live exams',
            path: '/teacher-dashboard',
            icon: ClipboardCheck,
            color: '#f59e0b'
        },
        {
            id: 2,
            name: 'Resources',
            description: 'Study Vault, AI Notes, and Explainer',
            path: '/resources',
            icon: Library,
            color: '#10b981'
        },
        {
            id: 3,
            name: 'CodeSpirit Exam',
            description: 'Create and manage coding and mcq exams',
            path: '/codespirit-creator',
            icon: Target,
            color: '#8b5cf6'
        }
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
                            <div className="profile-info">
                                <div className="profile-name" style={{ textAlign: 'right' }}>{user?.name || 'Instructor'}</div>
                                <div className="profile-level" style={{ textAlign: 'right' }}>Teacher Portal</div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="dashboard-content">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <div className="welcome-badge">
                        <span className="pulse-dot"></span> INSTRUCTOR HUB ONLINE
                    </div>
                    <h1 className="welcome-title">
                        Welcome Back, <br />
                        <span className="highlight-name">{user?.name?.split(' ')[0] || 'Teacher'}</span> <span className="wave">👋</span>
                    </h1>
                    <p className="welcome-subtitle">Your teaching dashboard is ready. Manage your classes, create resources, and crush today's objectives.</p>
                </div>

                {/* Features Section Title */}
                <div className="features-header mt-10">
                    <h2>Your <span>Toolkit</span></h2>
                    <p>Access your personalized teaching modules for extreme productivity.</p>
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
