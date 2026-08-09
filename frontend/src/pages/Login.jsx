import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { login } from '../services/api';
import { API_URL } from '../config';
import { 
    Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, 
    ChevronRight, GraduationCap, Sparkles, Building2, User as UserIcon
} from 'lucide-react';

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

    const roleConfig = {
        student: { title: "Student Account", subtitle: "Access your personalized learning dashboard", icon: "📚" },
        teacher: { title: "Teacher Account", subtitle: "Manage quizzes & track student growth", icon: "🎓" },
        recruiter: { title: "Recruiter Account", subtitle: "Hire verified top engineering talent", icon: "💼" },
        default: { title: "Account", subtitle: "Access your personalized dashboard", icon: "✨" }
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
                    module.register(name, email, password, userRole, university, course, companyName)
                );
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
            }
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
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            backgroundColor: '#F8FAFC',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 16px',
            color: '#0F172A'
        }}>
            {/* Outer Container Card (Matching Screenshot Layout) */}
            <div style={{
                maxWidth: '1120px',
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '32px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05)',
                border: '1px solid #F1F5F9',
                padding: '40px 48px',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden'
            }}>

                {/* Top Bar: Brand Logo + New Here Switcher */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '40px'
                }}>
                    {/* Brand Logo & Stylized Name */}
                    <div 
                        onClick={() => navigate('/')} 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    >
                        <img src="/logo-icon.png" alt="StudySpirit" style={{ height: '40px', width: 'auto' }} />
                        <span style={{ fontSize: '26px', fontWeight: '900', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                            <span style={{ color: '#D97706' }}>Study</span>
                            <span style={{ color: '#0369A1' }}>Spirit</span>
                        </span>
                    </div>

                    {/* New here? Sign Up Switcher */}
                    <div style={{ fontSize: '15px', color: '#64748B', fontWeight: '500' }}>
                        {isLogin ? 'New here? ' : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#EE5D2B',
                                fontWeight: '700',
                                fontSize: '15px',
                                cursor: 'pointer',
                                padding: 0,
                                marginLeft: '4px'
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </div>

                {/* Main Content Grid: Form (Left) & 3D Illustration (Right) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '52% 48%',
                    gap: '40px',
                    alignItems: 'center'
                }}>
                    {/* LEFT COLUMN: FORM */}
                    <div>
                        {/* Pill Badge */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 18px',
                            borderRadius: '9999px',
                            backgroundColor: '#FFF3EC',
                            border: '1px solid #FDBA74',
                            marginBottom: '20px'
                        }}>
                            <GraduationCap size={16} style={{ color: '#EA580C' }} />
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#C2410C' }}>
                                {isLogin ? 'Welcome Back! 👋' : 'Create Account ✨'}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 style={{
                            fontSize: 'clamp(32px, 3.2vw, 40px)',
                            fontWeight: '900',
                            color: '#0F172A',
                            lineHeight: '1.15',
                            letterSpacing: '-0.02em',
                            margin: '0 0 10px 0'
                        }}>
                            {isLogin ? (
                                <>Sign in <br />to your account</>
                            ) : (
                                <>Create your <br />StudySpirit Account</>
                            )}
                        </h1>

                        {/* Subtitle */}
                        <p style={{
                            fontSize: '15px',
                            color: '#64748B',
                            margin: '0 0 32px 0',
                            lineHeight: '1.5'
                        }}>
                            Access your personalized dashboard and continue your learning journey.
                        </p>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                backgroundColor: '#FEF2F2',
                                border: '1px solid #FCA5A5',
                                color: '#DC2626',
                                fontSize: '14px',
                                fontWeight: '600',
                                marginBottom: '20px'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {!isLogin && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                                        Full Name
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <UserIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required={!isLogin}
                                            placeholder="Enter your name"
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px 14px 44px',
                                                borderRadius: '12px',
                                                border: '1px solid #E2E8F0',
                                                fontSize: '14px',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email Address */}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                                    Email Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        placeholder="you@example.com"
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px 14px 44px',
                                            borderRadius: '12px',
                                            border: '1px solid #E2E8F0',
                                            fontSize: '14px',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        placeholder="Enter your password"
                                        style={{
                                            width: '100%',
                                            padding: '14px 44px 14px 44px',
                                            borderRadius: '12px',
                                            border: '1px solid #E2E8F0',
                                            fontSize: '14px',
                                            outline: 'none',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#94A3B8',
                                            padding: 0
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Checkbox & Forgot Password */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#64748B' }}>
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={e => setRememberMe(e.target.checked)}
                                        style={{ accentColor: '#EE5D2B', borderRadius: '4px' }}
                                    />
                                    Remember me
                                </label>

                                <button
                                    type="button"
                                    onClick={() => alert("Password reset link sent to your email!")}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#EE5D2B',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '15px 24px',
                                    borderRadius: '9999px',
                                    background: 'linear-gradient(135deg, #FF6B35 0%, #EE5D2B 100%)',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    boxShadow: '0 6px 20px rgba(238, 93, 43, 0.35)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    marginTop: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {isLoading ? (
                                    <span>Authenticating...</span>
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        {isLogin && (
                            <>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    margin: '28px 0 20px',
                                    color: '#94A3B8',
                                    fontSize: '13px'
                                }}>
                                    <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
                                    <span>or continue with</span>
                                    <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
                                </div>

                                {/* Social Logins (Google, Microsoft, Apple) */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* Google */}
                                    <button
                                        type="button"
                                        onClick={() => redirectToProvider('google')}
                                        style={{
                                            width: '100%',
                                            padding: '12px 20px',
                                            borderRadius: '12px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #E2E8F0',
                                            color: '#0F172A',
                                            fontWeight: '700',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Continue with Google
                                    </button>

                                    {/* Microsoft */}
                                    <button
                                        type="button"
                                        onClick={() => redirectToProvider('google')}
                                        style={{
                                            width: '100%',
                                            padding: '12px 20px',
                                            borderRadius: '12px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #E2E8F0',
                                            color: '#0F172A',
                                            fontWeight: '700',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 23 23">
                                            <path fill="#f35325" d="M1 1h10v10H1z"/>
                                            <path fill="#81bc06" d="M12 1h10v10H12z"/>
                                            <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                                            <path fill="#ffba08" d="M12 12h10v10H12z"/>
                                        </svg>
                                        Continue with Microsoft
                                    </button>

                                    {/* Apple */}
                                    <button
                                        type="button"
                                        onClick={() => redirectToProvider('google')}
                                        style={{
                                            width: '100%',
                                            padding: '12px 20px',
                                            borderRadius: '12px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #E2E8F0',
                                            color: '#0F172A',
                                            fontWeight: '700',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 170 170" fill="#000000">
                                            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.02.24-9.88-1.87-14.59-6.35-3.13-2.83-7.05-7.55-11.77-14.16-6.64-9.35-11.75-20.08-15.34-32.18-3.59-12.1-5.39-23.72-5.39-34.86 0-14.5 3.42-26.68 10.26-36.54 6.84-9.86 15.67-14.93 26.49-15.22 4.67 0 9.77 1.15 15.3 3.46 5.53 2.31 9.38 3.51 11.55 3.6 2.06 0 6.01-1.25 11.85-3.75 5.84-2.5 10.74-3.64 14.7-3.41 11.22.47 20.31 4.71 27.27 12.72-10.02 6.06-14.93 14.47-14.73 25.24.19 10.36 4.3 18.79 12.33 25.28 4.07 3.34 8.78 5.79 14.13 7.35-2.61 7.68-6.12 15.65-10.53 23.91zM119.22 31.84c0-7.3 2.61-14.32 7.83-21.06 5.22-6.74 11.95-10.78 20.19-12.12.38 1.44.57 2.7.57 3.78 0 7.21-2.69 14.28-8.07 21.21-5.38 6.93-12.17 10.87-20.37 11.82-.09-1.25-.15-2.46-.15-3.63z" />
                                        </svg>
                                        Continue with Apple
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Security Box Badge */}
                        <div style={{
                            marginTop: '32px',
                            padding: '14px 20px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #F1F5F9',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <ShieldCheck size={24} style={{ color: '#0F172A' }} />
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                                        Your data is 100% secure
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                                        We never share your information
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={18} style={{ color: '#64748B' }} />
                        </div>

                        {/* Back to Home Link */}
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Link to="/" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none', fontWeight: '600' }}>
                                ← Back to Home Page
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: 3D ILLUSTRATION & SOFT CIRCLE BACKGROUND */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '520px'
                    }}>
                        {/* Soft Oval Peach Background */}
                        <div style={{
                            position: 'absolute',
                            width: '460px',
                            height: '460px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at 50% 50%, #FFF0E6 0%, #FFE5D4 65%, transparent 100%)',
                            zIndex: 0
                        }} />

                        {/* 3D Rendered Asset (Books, Plant, Spiral Notebook) */}
                        <img
                            src="/login-3d.png"
                            alt="StudySpirit 3D Books and Notebook Illustration"
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                width: '100%',
                                maxHeight: '500px',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.06))'
                            }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
