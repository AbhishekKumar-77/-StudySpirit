import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { login } from '../services/api';
import { API_URL } from '../config';
import './Login.css';

const Login = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const { loginUser } = useApp();

    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [university, setUniversity] = useState('');
    const [course, setCourse] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLight, setIsLight] = useState(false);

    // Theme Detection
    useEffect(() => {
        const checkTheme = () => setIsLight(document.documentElement.classList.contains('light'));
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const roleConfig = {
        student: { title: "Student Portal", subtitle: "Access your learning dashboard", icon: "📚" },
        teacher: { title: "Teacher Portal", subtitle: "Manage quizzes & track students", icon: "🎓" },
        recruiter: { title: "Recruiter Portal", subtitle: "Discover top talent", icon: "💼" },
        default: { title: "Welcome Back", subtitle: "Sign in to continue", icon: "✨" }
    };

    const currentRole = roleConfig[role] || roleConfig.default;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            let data;
            if (isLogin) {
                try {
                    data = await login(email, password);
                } catch (err) {
                    if (err.message && err.message.toLowerCase().includes('not verified')) {
                        setError('Email not verified. Please verify your email.');
                        setIsLoading(false);
                        return;
                    }
                    throw err;
                }
            } else {
                const userRole = role || 'student';
                data = await import('../services/api').then(module =>
                    module.register(name, email, password, userRole, university, course)
                );
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            const finalRole = data.user?.role || role || 'student';
            loginUser({ ...data.user, role: finalRole });
            if (data.user.isAdmin) navigate('/admin');
            else if (finalRole === 'teacher') navigate('/teacher-toolkit');
            else navigate('/dashboard');
        } catch (err) {
            setError(err.message || (isLogin ? 'Authentication failed' : 'Registration failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const redirectToProvider = (provider) => {
        window.location.href = `${API_URL}/api/auth/${provider}`;
    };

    return (
        <div className={`login-page ${isLight ? 'light' : 'dark'}`}>
            {/* Background */}
            <div className="login-bg" />
            <div className="login-overlay" />

            {/* Login Card */}
            <div className="login-card">
                {/* Header */}
                <div className="login-header">
                    <div className="login-icon">{currentRole.icon}</div>
                    <h1 className="login-title">
                        {isLogin ? currentRole.title : 'Create Account'}
                    </h1>
                    <p className="login-subtitle">
                        {isLogin ? currentRole.subtitle : 'Join StudySpirit today'}
                    </p>
                </div>

                {/* Tab Toggle */}
                <div className="login-tabs">
                    <button
                        className={`login-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Sign In
                    </button>
                    <button
                        className={`login-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            <span>⚠</span> {error}
                        </div>
                    )}

                    {!isLogin && (
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text" value={name} onChange={e => setName(e.target.value)}
                                required={!isLogin} placeholder="Enter your name"
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            required placeholder="you@example.com"
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password} onChange={e => setPassword(e.target.value)}
                                required placeholder="••••••••"
                            />
                            <button
                                type="button" className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <>
                            <div className="input-group">
                                <label>University / College</label>
                                <input
                                    type="text" value={university} onChange={e => setUniversity(e.target.value)}
                                    required={!isLogin} placeholder="Your institution"
                                />
                            </div>
                            <div className="input-group">
                                <label>Course / Major</label>
                                <input
                                    type="text" value={course} onChange={e => setCourse(e.target.value)}
                                    required={!isLogin} placeholder="e.g. Computer Science"
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="login-submit" disabled={isLoading}>
                        {isLoading ? (
                            <span className="spinner" />
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                {/* Google Login */}
                {isLogin && (
                    <div className="login-divider-section">
                        <div className="login-divider">
                            <span>or continue with</span>
                        </div>
                        <button type="button" className="google-btn" onClick={() => redirectToProvider('google')}>
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                    </div>
                )}

                <div className="login-footer">
                    <Link to="/">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
