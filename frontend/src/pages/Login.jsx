
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { login } from '../services/api';
import { API_URL } from '../config';

const Login = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const roleConfig = {
        student: {
            title: "STUDENT LOGIN",
            subtitle: "Enter the Arena of Knowledge",
            color: "from-blue-600 to-purple-600",
            icon: "👨‍💻",
            placeholder: "Student ID / Email",
            bgGlow: "bg-[var(--bg-secondary)]lue-500/20"
        },
        teacher: {
            title: "TEACHER PORTAL",
            subtitle: "Empower the Next Generation",
            color: "from-green-600 to-emerald-600",
            icon: "👨‍🏫",
            placeholder: "Teacher ID / Email",
            bgGlow: "bg-emerald-500/20"
        },
        recruiter: {
            title: "RECRUITER ACCESS",
            subtitle: "Discover Top Talent",
            color: "from-orange-600 to-red-600",
            icon: "🤝",
            placeholder: "Company Email",
            bgGlow: "bg-orange-500/20"
        },
        default: {
            title: "LOGIN TO SPIRIT",
            subtitle: "Welcome Back",
            color: "from-purple-600 to-pink-600",
            icon: "⚡",
            placeholder: "Username / Email",
            bgGlow: "bg-purple-500/20"
        }
    };

    const currentRole = roleConfig[role] || roleConfig.default;

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const { loginUser } = useApp();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [university, setUniversity] = useState('');
    const [course, setCourse] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showVerification, setShowVerification] = useState(false);
    const [otp, setOtp] = useState('');
    const [verificationEmail, setVerificationEmail] = useState(''); // Store email for verification separately to avoid confusion

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            let data;
            if (isLogin) {
                // Login Flow
                try {
                    data = await login(email, password);
                } catch (err) {
                    // Check if error is due to unverified email
                    // Ideally backend returns specific error code or message
                    if (err.message && err.message.includes('not verified')) {
                        setVerificationEmail(email);
                        setShowVerification(true);
                        setIsLoading(false);
                        return;
                    }
                    throw err;
                }
            } else {
                // Register Flow
                const userRole = role || 'student';
                data = await import('../services/api').then(module =>
                    module.register(name, email, password, userRole, university, course)
                );
            }

            // Check if verification is required (from register response)
            if (data.requiresVerification) {
                setVerificationEmail(data.email || email);
                setShowVerification(true);
                setIsLoading(false);
                return;
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            const finalRole = role || data.user.role;
            loginUser({ ...data.user, role: finalRole });
            navigate(data.user.isAdmin ? '/admin' : '/dashboard');
        } catch (err) {
            // Handle specific verification case from login
            if (isLogin && err.response && err.response.status === 403 && err.response.data.requiresVerification) {
                setVerificationEmail(email);
                setShowVerification(true);
            } else {
                setError(err.message || (isLogin ? 'Login failed' : 'Registration failed'));
            }
        } finally {
            if (!showVerification) setIsLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const module = await import('../services/api');
            const data = await module.verifyEmail(verificationEmail || email, otp);

            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            // If verify response returns user, log them in
            if (data.user) {
                const finalRole = role || data.user.role;
                loginUser({ ...data.user, role: finalRole });
                navigate(data.user.isAdmin ? '/admin' : '/dashboard');
            } else {
                // Fallback if no user data returned, try login again
                const loginData = await login(verificationEmail || email, password);
                const finalRole = role || loginData.user.role;
                loginUser({ ...loginData.user, role: finalRole });
                navigate(loginData.user.isAdmin ? '/admin' : '/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Invalid code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Redirect to backend for real OAuth flow
    const redirectToProvider = (provider) => {
        window.location.href = `${API_URL}/api/auth/${provider}`;
    };

    return (
        <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center overflow-hidden font-sans">

            {/* Background Effects */}
            <div className={`absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none ${currentRole.bgGlow} blur-[150px] transition-all duration-1000`} />
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            {/* Interactive Particles */}
            {[...Array(10)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full pointer-events-none blur-[1px] opacity-30"
                    style={{
                        width: `${Math.random() * 4 + 2}px`,
                        height: `${Math.random() * 4 + 2}px`,
                        background: 'white',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        transform: `translate(${(mousePosition.x - 50) * (i * 0.1)}px, ${(mousePosition.y - 50) * (i * 0.1)}px)`,
                        transition: 'transform 0.2s linear',
                    }}
                />
            ))}

            <div className="relative z-10 w-full max-w-2xl p-4 sm:p-8">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-10">
                    <div className="text-7xl sm:text-8xl mb-4 sm:mb-6 animate-bounce-slow filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        {currentRole.icon}
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter mb-4 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent px-2">
                        {isLogin ? currentRole.title : "JOIN THE SQUAD"}
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-lg tracking-widest uppercase">
                        {isLogin ? currentRole.subtitle : "Start Your Journey Today"}
                    </p>
                </div>

                {/* Login/Signup Form */}
                <div className="bg-white/5 border border-[var(--border-color)] p-6 sm:p-12 rounded-3xl sm:rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group transition-all duration-500">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${currentRole.color}`} />

                    {/* Toggle Switch */}
                    <div className="flex bg-[var(--bg-secondary)]lack/20 p-1 rounded-xl mb-8 border border-[var(--border-color)]">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${isLogin ? 'bg-white/10 text-[var(--text-primary)] shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${!isLogin ? 'bg-white/10 text-[var(--text-primary)] shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="text-red-500 text-lg text-center font-bold bg-red-500/10 py-3 rounded-xl animate-pulse">{error}</div>}

                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-xl px-5 py-4 text-lg text-[var(--text-primary)] placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-[var(--bg-secondary)]lack/40 transition-all font-medium"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                                title="Please enter a valid email address (e.g., name@domain.com)"
                                className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-xl px-5 py-4 text-lg text-[var(--text-primary)] placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-[var(--bg-secondary)]lack/40 transition-all font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                {isLogin ? 'Password' : 'Create Password'}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-xl px-5 py-4 text-lg text-[var(--text-primary)] placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-[var(--bg-secondary)]lack/40 transition-all font-medium"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">University / College</label>
                                    <input
                                        type="text"
                                        value={university}
                                        onChange={(e) => setUniversity(e.target.value)}
                                        placeholder="Enter your institution name"
                                        className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-xl px-5 py-4 text-lg text-[var(--text-primary)] placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-[var(--bg-secondary)]lack/40 transition-all font-medium"
                                        required={!isLogin}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Course / Major</label>
                                    <input
                                        type="text"
                                        value={course}
                                        onChange={(e) => setCourse(e.target.value)}
                                        placeholder="e.g. Computer Science"
                                        className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-xl px-5 py-4 text-lg text-[var(--text-primary)] placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-[var(--bg-secondary)]lack/40 transition-all font-medium"
                                        required={!isLogin}
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-5 mt-4 rounded-xl font-black uppercase tracking-widest text-lg bg-gradient-to-r ${currentRole.color} hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden disabled:opacity-50`}
                        >
                            <span className="relative z-10">{isLoading ? 'Processing...' : (isLogin ? 'Enter System' : 'Create Account')}</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </form>

                    {/* Verification Overlay */}
                    {showVerification && (
                        <div className="absolute inset-0 z-20 bg-[var(--bg-primary)]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 sm:p-8 text-center animate-fade-in">
                            <div className="text-6xl mb-6">📩</div>
                            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">VERIFY EMAIL</h2>
                            <p className="text-gray-400 mb-8 max-w-sm text-sm sm:text-base">
                                We've sent a 6-digit code to <br /><span className="text-[var(--text-primary)] font-bold">{email}</span>
                            </p>

                            <form onSubmit={handleVerify} className="w-full max-w-sm space-y-6">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full bg-[var(--bg-secondary)]lack/40 border border-white/20 rounded-xl px-2 sm:px-5 py-6 text-2xl sm:text-3xl text-center tracking-[0.5em] sm:tracking-[1em] font-mono text-[var(--text-primary)] placeholder-gray-700 focus:outline-none focus:border-purple-500/50 transition-all font-bold"
                                    required
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 rounded-xl font-black uppercase tracking-widest bg-white text-black hover:bg-purple-400 hover:text-[var(--text-primary)] transition-all transform hover:-translate-y-1"
                                >
                                    {isLoading ? 'Verifying...' : 'Unlock Access'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowVerification(false)}
                                    className="text-xs text-gray-500 hover:text-[var(--text-primary)] uppercase tracking-widest mt-4"
                                >
                                    Start Over
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Social Login for Students */}
                    {role === 'student' && isLogin && (
                        <div className="pt-8 flex flex-col gap-6">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[var(--border-color)]"></div>
                                </div>
                                <span className="relative z-10 bg-[#16161f] px-4 text-xs text-gray-500 uppercase tracking-widest">Or connect via</span>
                            </div>

                            <button type="button" onClick={() => redirectToProvider('google')} className="w-full flex items-center justify-center gap-4 py-4 bg-white/5 hover:bg-white/10 border border-[var(--border-color)] rounded-xl transition-all hover:-translate-y-1 hover:border-white/20 group">
                                <svg className="w-5 h-5 text-[var(--text-primary)] group-hover:text-blue-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-sm font-bold text-gray-300 group-hover:text-[var(--text-primary)] uppercase tracking-widest">Google</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-10 text-center">
                    <Link to="/" className="text-xs text-gray-500 hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest border-b border-transparent hover:border-gray-500">
                        Return to Homepage
                    </Link>
                </div>

                {/* Role Switcher (Optional, allows quick switching if they clicked wrong) */}
                {!role && (
                    <div className="mt-10 flex justify-center gap-6">
                        {['student'].map(r => (
                            <Link key={r} to={`/login/${r}`} className="text-3xl hover:scale-125 transition-transform opacity-50 hover:opacity-100" title={r}>
                                {roleConfig[r].icon}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .animate-bounce-slow { animation: bounce 3s infinite ease-in-out; }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            `}</style>
        </div>
    );
};

export default Login;
