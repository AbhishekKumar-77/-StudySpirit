import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { login } from '../services/api';
import { API_URL } from '../config';

const Login = () => {
    const { role } = useParams();
    const navigate = useNavigate();

    // Context & State
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

    // Dynamic Role Config matching the sci-fi theme
    const roleConfig = {
        student: { title: "STUDENT UPLINK", subtitle: "Access Knowledge Grid", icon: "01" },
        teacher: { title: "INSTRUCTOR NODE", subtitle: "Command Next Gen Grid", icon: "02" },
        recruiter: { title: "RECRUITER TERMINAL", subtitle: "Scan Top Talent", icon: "03" },
        default: { title: "SYSTEM UPLINK", subtitle: "Initialize Connection", icon: "SYS" }
    };

    const currentRole = roleConfig[role] || roleConfig.default;

    // Theme configurations
    const themeColor = isLight ? '#d4520a' : '#00d2ff'; // Burnt orange for light, cyan for dark
    const bgOverlay = isLight ? 'rgba(250, 247, 242, 0.92)' : 'rgba(5, 12, 20, 0.85)';
    const textColor = isLight ? '#1a1208' : '#fff';
    const mutedColor = isLight ? '#7a6048' : 'rgba(255,255,255,0.4)';
    const borderColor = isLight ? 'rgba(212, 82, 10, 0.3)' : 'rgba(0, 210, 255, 0.4)';
    const inputBg = isLight ? '#fff' : 'rgba(0,0,0,0.5)';
    const inputBorderBottom = isLight ? 'rgba(212, 82, 10, 0.2)' : 'rgba(0, 210, 255, 0.3)';

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
            const finalRole = role || data.user.role;
            loginUser({ ...data.user, role: finalRole });
            navigate(data.user.isAdmin ? '/admin' : '/dashboard');
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
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: isLight ? "'Inter', -apple-system, sans-serif" : "'Share Tech Mono', 'Courier New', monospace",
            backgroundColor: isLight ? '#faf7f2' : '#050a0f',
            backgroundImage: `url('/login-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            color: textColor,
            overflow: 'hidden',
            transition: 'all 0.5s ease',
        }}>
            {/* World background overlay for light mode (whitewash) or dark mode (scanlines) */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, width: '100%', height: '100%',
                background: isLight
                    ? 'rgba(250, 247, 242, 0.92)' // Strong cream overlay for light mode
                    : 'linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.25) 51%)', // Scanlines for dark mode
                backgroundSize: isLight ? 'auto' : '100% 4px',
                pointerEvents: 'none',
                zIndex: 1,
                transition: 'background 0.5s ease',
            }} />

            {/* Main Panel */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: 480,
                padding: '40px',
                background: bgOverlay,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${borderColor}`,
                boxShadow: `0 0 30px rgba(${isLight ? '212,82,10' : '0,210,255'}, 0.15)`,
                borderRadius: isLight ? 12 : 4,
                transition: 'all 0.5s ease',
            }}>
                {/* Cyber Decals (only in dark mode) */}
                {!isLight && (
                    <>
                        <div style={{ position: 'absolute', top: -1, left: -1, width: 20, height: 20, borderTop: `2px solid ${themeColor}`, borderLeft: `2px solid ${themeColor}` }} />
                        <div style={{ position: 'absolute', top: -1, right: -1, width: 20, height: 20, borderTop: `2px solid ${themeColor}`, borderRight: `2px solid ${themeColor}` }} />
                        <div style={{ position: 'absolute', bottom: -1, left: -1, width: 20, height: 20, borderBottom: `2px solid ${themeColor}`, borderLeft: `2px solid ${themeColor}` }} />
                        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 20, height: 20, borderBottom: `2px solid ${themeColor}`, borderRight: `2px solid ${themeColor}` }} />
                        <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, opacity: 0.6, letterSpacing: '2px' }}>V_2.0.4 // SECURE</div>
                    </>
                )}

                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 42, marginBottom: 8, display: 'inline-block', borderBottom: `2px solid ${themeColor}`, paddingBottom: 4, color: themeColor }}>
                        {currentRole.icon}
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 'bold', letterSpacing: isLight ? '-0.02em' : '0.1em', textTransform: 'uppercase', textShadow: isLight ? 'none' : `0 0 10px ${themeColor}`, color: themeColor }}>
                        {isLogin ? currentRole.title : "INITIALIZE NEW USER"}
                    </h1>
                    <p style={{ fontSize: 13, color: mutedColor, letterSpacing: isLight ? '0.05em' : '0.15em', marginTop: 8, textTransform: 'uppercase', fontWeight: isLight ? 600 : 400 }}>
                        {isLogin ? currentRole.subtitle : "Establish connection protocol"}
                    </p>
                </div>

                {/* Tab Toggle */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${borderColor}`, marginBottom: 32 }}>
                    <button
                        onClick={() => setIsLogin(true)}
                        style={{
                            flex: 1, padding: '12px', background: 'transparent', border: 'none',
                            color: isLogin ? themeColor : mutedColor,
                            fontWeight: isLogin ? 'bold' : 'normal',
                            fontSize: 14, letterSpacing: isLight ? '0.05em' : '0.1em', textTransform: 'uppercase',
                            cursor: 'pointer', position: 'relative',
                            transition: 'all 0.3s'
                        }}>
                        {isLight ? 'Login' : '[ LOGIN ]'}
                        {isLogin && <div style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: 2, background: themeColor, boxShadow: isLight ? 'none' : `0 0 10px ${themeColor}` }} />}
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        style={{
                            flex: 1, padding: '12px', background: 'transparent', border: 'none',
                            color: !isLogin ? themeColor : mutedColor,
                            fontWeight: !isLogin ? 'bold' : 'normal',
                            fontSize: 14, letterSpacing: isLight ? '0.05em' : '0.1em', textTransform: 'uppercase',
                            cursor: 'pointer', position: 'relative',
                            transition: 'all 0.3s'
                        }}>
                        {isLight ? 'Register' : '[ REGISTER ]'}
                        {!isLogin && <div style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: 2, background: themeColor, boxShadow: isLight ? 'none' : `0 0 10px ${themeColor}` }} />}
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {error && (
                        <div style={{ color: '#ff3333', fontSize: 13, padding: 12, border: '1px solid currentColor', background: 'rgba(255,0,0,0.1)', textAlign: 'center', letterSpacing: isLight ? 'normal' : '0.1em', borderRadius: isLight ? 4 : 0 }} className="animate-pulse">
                            {isLight ? '' : 'ERR: '} {error}
                        </div>
                    )}

                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', marginBottom: 6, color: mutedColor, fontWeight: isLight ? 600 : 400 }}>USER_ALIAS</label>
                            <input
                                type="text" value={name} onChange={e => setName(e.target.value)} required={!isLogin}
                                placeholder="Enter Full Name..."
                                className="login-input"
                                style={inputStyle(textColor, inputBg, inputBorderBottom, isLight)}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', marginBottom: 6, color: mutedColor, fontWeight: isLight ? 600 : 400 }}>COM_CHANNEL (EMAIL)</label>
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)} required
                            placeholder="user@network.grid"
                            className="login-input"
                            style={inputStyle(textColor, inputBg, inputBorderBottom, isLight)}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', marginBottom: 6, color: mutedColor, fontWeight: isLight ? 600 : 400 }}>ACCESS_KEY</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                                placeholder="••••••••••••"
                                className="login-input"
                                style={{
                                    ...inputStyle(textColor, inputBg, inputBorderBottom, isLight),
                                    paddingRight: '40px' // Make space for the icon
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                    background: 'transparent', border: 'none', color: mutedColor,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', marginBottom: 6, color: mutedColor, fontWeight: isLight ? 600 : 400 }}>INSTITUTION_NODE</label>
                                <input
                                    type="text" value={university} onChange={e => setUniversity(e.target.value)} required={!isLogin}
                                    placeholder="University / College"
                                    className="login-input"
                                    style={inputStyle(textColor, inputBg, inputBorderBottom, isLight)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.15em', marginBottom: 6, color: mutedColor, fontWeight: isLight ? 600 : 400 }}>DIRECTIVE_PATH</label>
                                <input
                                    type="text" value={course} onChange={e => setCourse(e.target.value)} required={!isLogin}
                                    placeholder="Course / Major"
                                    className="login-input"
                                    style={inputStyle(textColor, inputBg, inputBorderBottom, isLight)}
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit" disabled={isLoading}
                        style={{
                            marginTop: 16, padding: '16px', background: isLight ? themeColor : `rgba(0, 210, 255, 0.1)`,
                            border: isLight ? 'none' : `1px solid ${themeColor}`, color: isLight ? '#fff' : themeColor,
                            fontSize: 16, fontWeight: 'bold', letterSpacing: isLight ? '0.1em' : '0.2em', textTransform: 'uppercase',
                            cursor: isLoading ? 'wait' : 'pointer',
                            boxShadow: isLight ? `0 4px 15px rgba(212,82,10,0.3)` : `0 0 15px rgba(0,210,255,0.2) inset`,
                            transition: 'all 0.2s',
                            opacity: isLoading ? 0.7 : 1,
                            borderRadius: isLight ? 8 : 0
                        }}
                        onMouseEnter={e => {
                            if (!isLight) { e.currentTarget.style.background = themeColor; e.currentTarget.style.color = '#000'; }
                            else { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px rgba(212,82,10,0.4)`; }
                        }}
                        onMouseLeave={e => {
                            if (!isLight) { e.currentTarget.style.background = `rgba(0, 210, 255, 0.1)`; e.currentTarget.style.color = themeColor; }
                            else { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 15px rgba(212,82,10,0.3)`; }
                        }}
                    >
                        {isLoading ? 'EXECUTING...' : (isLogin ? 'INITIATE LINK' : 'CREATE RECORD')}
                    </button>
                </form>

                {/* Google Login */}
                {isLogin && (
                    <div style={{ marginTop: 32, textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ flex: 1, height: 1, background: borderColor }} />
                            <span style={{ margin: '0 16px', fontSize: 10, letterSpacing: '0.2em', color: mutedColor }}>EXTERNAL AUTH</span>
                            <div style={{ flex: 1, height: 1, background: borderColor }} />
                        </div>

                        <button
                            type="button" onClick={() => redirectToProvider('google')}
                            style={{
                                width: '100%', padding: '14px', background: isLight ? '#fff' : 'transparent',
                                border: isLight ? `1px solid ${borderColor}` : `1px dashed ${themeColor}`, color: themeColor,
                                fontSize: 13, letterSpacing: '0.1em', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                                transition: 'all 0.2s',
                                borderRadius: isLight ? 8 : 0,
                                fontWeight: isLight ? 'bold' : 'normal'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = isLight ? '#f9f5f0' : 'rgba(0, 210, 255, 0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = isLight ? '#fff' : 'transparent'; }}
                        >
                            <svg style={{ width: 18, height: 18, filter: isLight ? 'none' : 'grayscale(100%) brightness(200%) sepia(100%) hue-rotate(150deg) saturate(300%)' }} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            AUTH VIA GOOGLE
                        </button>
                    </div>
                )}

                <div style={{ marginTop: 40, textAlign: 'center' }}>
                    <Link to="/" style={{ color: mutedColor, fontSize: 11, textDecoration: 'none', letterSpacing: '0.1em', transition: 'color 0.2s', fontWeight: isLight ? 600 : 400 }}
                        onMouseEnter={e => e.currentTarget.style.color = themeColor}
                        onMouseLeave={e => e.currentTarget.style.color = mutedColor}
                    >
                        ← ABORT SEQUENCE (RETURN HOME)
                    </Link>
                </div>
            </div>

            <style>{`
                ::placeholder { color: ${isLight ? 'rgba(212, 82, 10, 0.4)' : 'rgba(0, 210, 255, 0.3)'}; }
                .login-input:focus { outline: none !important; border-bottom: 2px solid ${themeColor} !important; background: ${isLight ? '#fff8f5' : 'rgba(0,210,255,0.05)'} !important; }
            `}</style>
        </div>
    );
};

const inputStyle = (textColor, bg, border, isLight) => ({
    width: '100%',
    padding: '12px 16px',
    background: bg,
    border: 'none',
    borderBottom: `1px solid ${border}`,
    color: textColor,
    fontSize: 14,
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    borderRadius: isLight ? '6px 6px 0 0' : '0'
});

export default Login;
