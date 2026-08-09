import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { login } from '../services/api';
import { API_URL } from '../config';
import {
    Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck,
    ChevronRight, GraduationCap, User as UserIcon
} from 'lucide-react';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');

.login-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #F0F4F8;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 16px;
    color: #0F172A;
    box-sizing: border-box;
}

.login-card {
    max-width: 1080px;
    width: 100%;
    background: #ffffff;
    border-radius: 28px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.07), 0 2px 12px rgba(0,0,0,0.04);
    border: 1px solid #E8EFF5;
    padding: 32px 40px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
}

.login-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
}

.login-brand {
    display: flex;
    align-items: center;
    gap: 9px;
    cursor: pointer;
    text-decoration: none;
}

.login-brand img {
    height: 34px;
    width: auto;
}

.login-brand-name {
    font-size: 22px;
    font-weight: 900;
    font-family: 'Outfit', 'Inter', sans-serif;
    line-height: 1;
}

.login-switch-text {
    font-size: 14px;
    color: #64748B;
    font-weight: 500;
}

.login-switch-btn {
    background: none;
    border: none;
    color: #EE5D2B;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    margin-left: 3px;
}

.login-grid {
    display: grid;
    grid-template-columns: 52% 48%;
    gap: 32px;
    align-items: center;
}

/* --- FORM SIDE --- */
.login-form-col {}

.login-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 5px 15px;
    border-radius: 9999px;
    background: #FFF3EC;
    border: 1px solid #FDBA74;
    margin-bottom: 14px;
    font-size: 12px;
    font-weight: 700;
    color: #C2410C;
}

.login-title {
    font-size: clamp(26px, 2.8vw, 36px);
    font-weight: 900;
    color: #0F172A;
    line-height: 1.18;
    letter-spacing: -0.02em;
    margin: 0 0 8px 0;
}

.login-subtitle {
    font-size: 14px;
    color: #64748B;
    margin: 0 0 22px 0;
    line-height: 1.5;
}

.login-error {
    padding: 10px 14px;
    border-radius: 10px;
    background: #FEF2F2;
    border: 1px solid #FCA5A5;
    color: #DC2626;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 16px;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.login-field-label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 6px;
}

.login-input-wrap {
    position: relative;
}

.login-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
    display: flex;
    align-items: center;
}

.login-input {
    width: 100%;
    padding: 12px 14px 12px 42px;
    border-radius: 11px;
    border: 1px solid #E2E8F0;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
    background: #FAFBFC;
}

.login-input:focus {
    border-color: #FF6B35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.12);
    background: #fff;
}

.login-pw-toggle {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #94A3B8;
    padding: 0;
    display: flex;
    align-items: center;
}

.login-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
}

.login-remember {
    display: flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    color: #64748B;
}

.login-remember input {
    accent-color: #EE5D2B;
}

.login-forgot {
    background: none;
    border: none;
    color: #EE5D2B;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    padding: 0;
}

.login-submit-btn {
    width: 100%;
    padding: 13px 24px;
    border-radius: 9999px;
    background: linear-gradient(135deg, #FF6B35 0%, #EE5D2B 100%);
    border: none;
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(238, 93, 43, 0.32);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    margin-top: 4px;
    transition: transform 0.15s, box-shadow 0.15s;
}

.login-submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 9px 24px rgba(238, 93, 43, 0.38);
}

.login-submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.login-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 18px 0 14px;
    color: #94A3B8;
    font-size: 12px;
}

.login-divider-line {
    flex: 1;
    height: 1px;
    background: #E2E8F0;
}

.login-social-btns {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.login-social-btn {
    width: 100%;
    padding: 10px 18px;
    border-radius: 11px;
    background: #fff;
    border: 1px solid #E2E8F0;
    color: #0F172A;
    font-weight: 700;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background 0.15s, border-color 0.15s, transform 0.15s;
}

.login-social-btn:hover {
    background: #F8FAFC;
    border-color: #CBD5E1;
    transform: translateY(-1px);
}

.login-security {
    margin-top: 20px;
    padding: 12px 16px;
    background: #F8FAFC;
    border: 1px solid #F1F5F9;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: background 0.15s;
}

.login-security:hover {
    background: #EFF6FF;
}

.login-security-inner {
    display: flex;
    align-items: center;
    gap: 12px;
}

.login-security-title {
    font-size: 12px;
    font-weight: 800;
    color: #0F172A;
}

.login-security-sub {
    font-size: 11px;
    color: #64748B;
}

.login-back-link {
    text-align: center;
    margin-top: 14px;
    font-size: 12px;
    color: #64748B;
    text-decoration: none;
    font-weight: 600;
    display: block;
    transition: color 0.15s;
}

.login-back-link:hover {
    color: #EE5D2B;
}

/* --- ILLUSTRATION SIDE --- */
.login-illus-col {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    overflow: hidden;
    background: linear-gradient(135deg, #FFF4ED 0%, #FFEADC 60%, #FFD9C0 100%);
    min-height: 460px;
    padding: 24px;
    box-sizing: border-box;
}

.login-illus-col img {
    width: 100%;
    max-width: 100%;
    height: 100%;
    max-height: 420px;
    object-fit: contain;
    object-position: center bottom;
    filter: drop-shadow(0 12px 28px rgba(0,0,0,0.08));
    position: relative;
    z-index: 1;
}

/* soft decorative blob behind image */
.login-illus-blob {
    position: absolute;
    width: 80%;
    height: 80%;
    background: radial-gradient(circle at 50% 60%, rgba(255,200,160,0.5) 0%, transparent 70%);
    z-index: 0;
}

/* ===== RESPONSIVE ===== */

/* Tablet: 768px - 1024px */
@media (max-width: 1024px) {
    .login-card {
        padding: 28px 28px;
        max-width: 900px;
    }
    .login-grid {
        grid-template-columns: 55% 45%;
        gap: 24px;
    }
    .login-illus-col {
        min-height: 400px;
    }
}

/* Mobile portrait: 768px and below */
@media (max-width: 768px) {
    .login-root {
        padding: 12px 10px;
        align-items: flex-start;
        min-height: 100dvh;
    }
    .login-card {
        border-radius: 20px;
        padding: 22px 20px;
        max-width: 100%;
        box-shadow: 0 6px 24px rgba(0,0,0,0.06);
    }
    .login-topbar {
        margin-bottom: 18px;
    }
    .login-grid {
        grid-template-columns: 1fr;
        gap: 0;
    }
    /* Hide illustration on mobile for clean UX */
    .login-illus-col {
        display: none;
    }
    .login-title {
        font-size: 28px;
    }
    .login-social-btns {
        flex-direction: column;
    }
    .login-form {
        gap: 12px;
    }
    .login-input {
        padding: 11px 14px 11px 40px;
        font-size: 16px; /* prevents iOS auto-zoom */
    }
}

/* Very small mobile: 375px and below */
@media (max-width: 400px) {
    .login-card {
        padding: 18px 14px;
        border-radius: 16px;
    }
    .login-brand-name {
        font-size: 18px;
    }
    .login-title {
        font-size: 24px;
    }
    .login-badge {
        font-size: 11px;
    }
}
`;

export default function Login() {
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
    const [companyName, setCompanyName] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                        setError('Email not verified. Please check your inbox.');
                        setIsLoading(false);
                        return;
                    }
                    throw err;
                }
            } else {
                const userRole = role || 'student';
                data = await import('../services/api').then(m =>
                    m.register(name, email, password, userRole, university, course, companyName)
                );
            }

            if (data.token) localStorage.setItem('token', data.token);
            const isAdmin = data.user?.isAdmin === true;
            const finalRole = isAdmin ? 'admin' : (data.user?.role || role || 'student');
            loginUser({ ...data.user, role: finalRole, isAdmin });

            if (isAdmin) navigate('/admin');
            else if (finalRole === 'teacher') navigate('/teacher-dashboard');
            else if (finalRole === 'recruiter') navigate('/recruiter-dashboard');
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
        <>
            <style>{CSS}</style>

            <div className="login-root">
                <div className="login-card">

                    {/* TOP BAR */}
                    <div className="login-topbar">
                        <div className="login-brand" onClick={() => navigate('/')}>
                            <img src="/logo-icon.png" alt="StudySpirit logo" />
                            <span className="login-brand-name">
                                <span style={{ color: '#D97706' }}>Study</span>
                                <span style={{ color: '#0369A1' }}>Spirit</span>
                            </span>
                        </div>
                        <div className="login-switch-text">
                            {isLogin ? 'New here?' : 'Have an account?'}
                            <button
                                type="button"
                                className="login-switch-btn"
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            >
                                {isLogin ? ' Sign Up' : ' Sign In'}
                            </button>
                        </div>
                    </div>

                    {/* GRID: Form | Illustration */}
                    <div className="login-grid">

                        {/* ── LEFT: FORM ── */}
                        <div className="login-form-col">
                            {/* Badge */}
                            <div className="login-badge">
                                <GraduationCap size={14} />
                                {isLogin ? 'Welcome Back! 👋' : 'Create Account ✨'}
                            </div>

                            {/* Title */}
                            <h1 className="login-title">
                                {isLogin ? <>Sign in<br />to your account</> : <>Create your<br />account</>}
                            </h1>

                            {/* Subtitle */}
                            <p className="login-subtitle">
                                Access your personalized dashboard and continue your learning journey.
                            </p>

                            {/* Error */}
                            {error && <div className="login-error">⚠️ {error}</div>}

                            {/* Form Fields */}
                            <form className="login-form" onSubmit={handleSubmit}>
                                {!isLogin && (
                                    <div>
                                        <label className="login-field-label">Full Name</label>
                                        <div className="login-input-wrap">
                                            <span className="login-input-icon"><UserIcon size={16} /></span>
                                            <input
                                                className="login-input"
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required={!isLogin}
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Email */}
                                <div>
                                    <label className="login-field-label">Email Address</label>
                                    <div className="login-input-wrap">
                                        <span className="login-input-icon"><Mail size={16} /></span>
                                        <input
                                            className="login-input"
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="login-field-label">Password</label>
                                    <div className="login-input-wrap">
                                        <span className="login-input-icon"><Lock size={16} /></span>
                                        <input
                                            className="login-input"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            style={{ paddingRight: '42px' }}
                                        />
                                        <button
                                            type="button"
                                            className="login-pw-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label="Toggle password visibility"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember + Forgot */}
                                <div className="login-row">
                                    <label className="login-remember">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={e => setRememberMe(e.target.checked)}
                                        />
                                        Remember me
                                    </label>
                                    <button
                                        type="button"
                                        className="login-forgot"
                                        onClick={() => alert('Password reset email sent!')}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="login-submit-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Authenticating...' : (
                                        <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
                                    )}
                                </button>
                            </form>

                            {/* Social Logins (only in sign-in mode) */}
                            {isLogin && (
                                <>
                                    <div className="login-divider">
                                        <div className="login-divider-line" />
                                        <span>or continue with</span>
                                        <div className="login-divider-line" />
                                    </div>

                                    <div className="login-social-btns">
                                        {/* Google */}
                                        <button type="button" className="login-social-btn" onClick={() => redirectToProvider('google')}>
                                            <svg width="17" height="17" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                            </svg>
                                            Continue with Google
                                        </button>

                                        {/* Microsoft */}
                                        <button type="button" className="login-social-btn" onClick={() => redirectToProvider('google')}>
                                            <svg width="17" height="17" viewBox="0 0 23 23">
                                                <path fill="#f35325" d="M1 1h10v10H1z"/>
                                                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                                                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                                                <path fill="#ffba08" d="M12 12h10v10H12z"/>
                                            </svg>
                                            Continue with Microsoft
                                        </button>

                                        {/* Apple */}
                                        <button type="button" className="login-social-btn" onClick={() => redirectToProvider('google')}>
                                            <svg width="17" height="17" viewBox="0 0 170 170" fill="#000">
                                                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.02.24-9.88-1.87-14.59-6.35-3.13-2.83-7.05-7.55-11.77-14.16-6.64-9.35-11.75-20.08-15.34-32.18-3.59-12.1-5.39-23.72-5.39-34.86 0-14.5 3.42-26.68 10.26-36.54 6.84-9.86 15.67-14.93 26.49-15.22 4.67 0 9.77 1.15 15.3 3.46 5.53 2.31 9.38 3.51 11.55 3.6 2.06 0 6.01-1.25 11.85-3.75 5.84-2.5 10.74-3.64 14.7-3.41 11.22.47 20.31 4.71 27.27 12.72-10.02 6.06-14.93 14.47-14.73 25.24.19 10.36 4.3 18.79 12.33 25.28 4.07 3.34 8.78 5.79 14.13 7.35-2.61 7.68-6.12 15.65-10.53 23.91zM119.22 31.84c0-7.3 2.61-14.32 7.83-21.06 5.22-6.74 11.95-10.78 20.19-12.12.38 1.44.57 2.7.57 3.78 0 7.21-2.69 14.28-8.07 21.21-5.38 6.93-12.17 10.87-20.37 11.82-.09-1.25-.15-2.46-.15-3.63z"/>
                                            </svg>
                                            Continue with Apple
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Security Badge */}
                            <div className="login-security">
                                <div className="login-security-inner">
                                    <ShieldCheck size={22} style={{ color: '#0F172A' }} />
                                    <div>
                                        <div className="login-security-title">Your data is 100% secure</div>
                                        <div className="login-security-sub">We never share your information</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} style={{ color: '#94A3B8' }} />
                            </div>

                            {/* Back to home */}
                            <Link to="/" className="login-back-link">← Back to Home Page</Link>
                        </div>

                        {/* ── RIGHT: ILLUSTRATION (hidden on mobile) ── */}
                        <div className="login-illus-col">
                            <div className="login-illus-blob" />
                            <img
                                src="/login-3d.png"
                                alt="StudySpirit 3D study books, plant and notebook"
                            />
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
