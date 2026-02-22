import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import * as soloApi from '../services/soloApi';
import {
    BookOpen, Users, Calendar, ClipboardCheck, Library, Code,
    Briefcase, Folder, MessageSquare, Award, Mic, TrendingUp,
    UserCheck, MessageCircle, Edit3, GraduationCap, Target,
    Clock, CheckCircle, Home, Zap, Brain, ChevronRight, Shield
} from 'lucide-react';

export default function Dashboard() {
    const { user, stats, setUser, setStats } = useApp();
    const navigate = useNavigate();
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [fabOpen, setFabOpen] = useState(false);
    const [confetti, setConfetti] = useState([]);
    const [loadProgress, setLoadProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [todayStudyTime, setTodayStudyTime] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Fetch Dashboard Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await soloApi.getStats();
                if (data && data.user) {
                    setDashboardData(data);
                    // Update user context with fresh data from backend
                    setUser(prev => ({
                        ...prev,
                        name: data.user.name || prev?.name,
                        email: data.user.email || prev?.email,
                        streak: data.user.studyStreak || 0,
                        level: data.user.level || 1,
                        xp: data.user.totalXP || 0,
                        reputation: data.user.reputation || 0,
                        connectionsCount: data.user.connectionsCount || 0
                    }));
                    setStats({
                        dailyGoals: data.user.dailyGoal || 5,
                        completionRate: Math.round((data.user.problemsSolvedToday / (data.user.dailyGoal || 5)) * 100) || 0
                    });
                    setTodayStudyTime(data.user.todayStudyTime || 0);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            }
        };
        fetchDashboardData();
    }, []);

    // Loading Progress
    useEffect(() => {
        const interval = setInterval(() => {
            setLoadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsLoading(false), 300);
                    return 100;
                }
                return prev + 20;
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Heartbeat & Study Time Tracking
    useEffect(() => {
        const heartbeatInterval = setInterval(async () => {
            try {
                // Call heartbeat API every minute
                const data = await soloApi.logHeartbeat();
                if (data && data.success) {
                    setTodayStudyTime(data.todayStudyTime);
                    setUser(prev => ({
                        ...prev,
                        level: data.level,
                        xp: data.xp
                    }));
                }
            } catch (err) {
                console.error('Heartbeat failed:', err);
            }
        }, 60000); // 60 seconds

        // Local UI update every second for smoothness
        const localTimer = setInterval(() => {
            setTodayStudyTime(prev => prev + 1);
        }, 1000);

        return () => {
            clearInterval(heartbeatInterval);
            clearInterval(localTimer);
        };
    }, []);

    // Mouse Parallax for ambient particles
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

    // Toast Notification System
    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // Confetti Effect
    const triggerConfetti = () => {
        const pieces = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 0.5,
            duration: 2 + Math.random() * 2,
            color: ['#06b6d4', '#a855f7', '#ec4899', '#3b82f6', '#ffffff'][Math.floor(Math.random() * 5)]
        }));

        setConfetti(pieces);
        setTimeout(() => setConfetti([]), 4000);
    };

    const features = [
        { id: 1, name: 'Solo Mode Study', path: '/solo-mode', icon: BookOpen, from: 'from-cyan-500', to: 'to-blue-500', desc: 'Independent study with AI mentorship' },
        { id: 2, name: 'Group Mode Study', path: '/group-mode', icon: Users, from: 'from-purple-500', to: 'to-pink-500', desc: 'Collaborative learning teams' },
        { id: 3, name: 'Study Planner & Goals', path: '/planner', icon: Calendar, from: 'from-indigo-500', to: 'to-cyan-400', desc: 'Smart planning & task management' },
        { id: 4, name: 'Quiz & Exam System', path: '/quiz', icon: ClipboardCheck, from: 'from-pink-500', to: 'to-rose-500', desc: 'Secure testing with instant results' },
        { id: 5, name: 'Study Resources Hub', path: '/resources', icon: Library, from: 'from-blue-600', to: 'to-purple-600', desc: 'Centralized knowledge base' },
        { id: 6, name: 'CodeSpirit', path: '/codespirit', icon: Code, from: 'from-cyan-400', to: 'to-teal-500', desc: 'Coding practice platform' },
        { id: 7, name: 'AI Interview Prep', path: '/interview', icon: Mic, from: 'from-fuchsia-500', to: 'to-pink-600', desc: 'Mock interview simulator' },
        { id: 8, name: 'CareerSprint', path: '/career', icon: Briefcase, from: 'from-indigo-400', to: 'to-blue-500', desc: 'Job & internship portal' },
        { id: 9, name: 'Project Lab', path: '/project-lab', icon: Folder, from: 'from-purple-500', to: 'to-fuchsia-500', desc: 'Build & showcase projects' },
        { id: 14, name: 'DiscussVerse', path: '/discuss', icon: MessageCircle, from: 'from-cyan-', to: 'to-purple-600', desc: 'Global coding community' },
        { id: 16, name: 'Soft Skills Lab', path: '/soft-skills', icon: Brain, from: 'from-pink-500', to: 'to-rose-400', desc: 'Communication training' },
        { id: 17, name: 'Code Editors', path: '/code-editor', icon: Edit3, from: 'from-cyan-500', to: 'to-blue-600', desc: 'Online IDE & compiler' }
    ];

    const formatStudyTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const quickStats = [
        {
            label: 'Daily Tasks',
            value: stats?.dailyGoals || 0,
            subtext: 'Missions Today',
            icon: Target,
            from: 'from-cyan-400',
            to: 'to-blue-500',
            onClick: () => navigate('/planner')
        },
        {
            label: 'Success Rate',
            value: `${stats?.completionRate || 0}%`,
            subtext: 'Keep it going!',
            icon: CheckCircle,
            from: 'from-purple-400',
            to: 'to-pink-500'
        },
        {
            label: 'Focus Time',
            value: formatStudyTime(todayStudyTime),
            subtext: `Today • ${formatStudyTime((dashboardData?.user?.totalStudyTime || 0))} total`,
            icon: Clock,
            from: 'from-pink-500',
            to: 'to-rose-500'
        },
    ];

    const quickActions = [
        { icon: Code, label: 'Code Now', path: '/codespirit', color: 'bg-cyan-500' },
        { icon: Calendar, label: 'Plan', path: '/planner', color: 'bg-purple-500' },
        ...(user?.isAdmin ? [{ icon: Shield, label: 'Admin Panel', path: '/admin', color: 'bg-rose-500' }] : [])
    ];

    // 3D Tilt Effect
    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
    };

    const handleMouseLeaveCard = (e) => {
        e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)`;
    };

    const SkeletonCard = () => (
        <div className="h-[200px] rounded-3xl bg-zinc-900/50 animate-pulse border border-white/5 p-8 backdrop-blur-md">
            <div className="w-[60px] h-[60px] bg-white/10 rounded-2xl mb-6" />
            <div className="w-[70%] h-5 bg-white/10 rounded-full mb-4" />
            <div className="w-[90%] h-3 bg-white/5 rounded-full" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#09090b] relative overflow-hidden font-sans selection:bg-cyan-500/30 text-white">

            {/* Loading Progress Bar */}
            {loadProgress < 100 && (
                <div className="fixed top-0 left-0 w-full h-[3px] z-[99999] bg-black">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                        style={{ width: `${loadProgress}%` }}
                    />
                </div>
            )}

            {/* Dark Mode Background Grid matching Landing page */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Glowing Orbs */}
            <div className="fixed top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none animate-float" />
            <div className="fixed bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none animate-float-reverse" />
            <div className="fixed top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none animate-pulse-slow" />

            {/* Floating Particles that follow mouse playfully */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={`p-${i}`}
                        className="absolute rounded-full pointer-events-none mix-blend-screen"
                        style={{
                            width: `${Math.random() * 4 + 1}px`,
                            height: `${Math.random() * 4 + 1}px`,
                            background: ['#06b6d4', '#a855f7', '#ec4899', '#ffffff'][i % 4],
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            transform: `translate(${(mousePosition.x - 50) * (i * 0.08)}px, ${(mousePosition.y - 50) * (i * 0.08)}px)`,
                            transition: 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)',
                            boxShadow: `0 0 10px ${['#06b6d4', '#a855f7', '#ec4899', '#ffffff'][i % 4]}`,
                            opacity: Math.random() * 0.5 + 0.3
                        }}
                    />
                ))}
            </div>

            {/* Confetti Overlay */}
            {confetti.length > 0 && (
                <div className="fixed inset-0 pointer-events-none z-[9999]">
                    {confetti.map(piece => (
                        <div
                            key={piece.id}
                            className="absolute w-2.5 h-2.5 animate-confetti"
                            style={{
                                left: `${piece.left}%`,
                                top: '-10%',
                                backgroundColor: piece.color,
                                animationDuration: `${piece.duration}s`,
                                animationDelay: `${piece.delay}s`,
                                transform: `rotate(${Math.random() * 360}deg)`,
                                borderRadius: Math.random() > 0.5 ? '50%' : '0'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Toast Notifications */}
            <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`backdrop-blur-2xl px-6 py-4 rounded-2xl text-white font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-slide-in border min-w-[250px] flex items-center gap-3 ${toast.type === 'success'
                            ? 'bg-cyan-900/40 border-cyan-500/50'
                            : 'bg-rose-900/40 border-rose-500/50'
                            }`}
                    >
                        <span className={`text-xl drop-shadow-[0_0_10px_currentColor] ${toast.type === 'success' ? 'text-cyan-400' : 'text-rose-400'}`}>
                            {toast.type === 'success' ? '✓' : '⚠'}
                        </span>
                        <span className="tracking-wide">{toast.message}</span>
                    </div>
                ))}
            </div>


            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 p-[2px]">
                            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                                <img src="/logo.png" alt="Logo" className="w-6 h-6 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" onError={(e) => { e.target.style.display = 'none'; }} />
                                {!document.querySelector('img[src="/logo.png"]')?.complete && (
                                    <span className="text-lg font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">S</span>
                                )}
                            </div>
                        </div>
                        <div className="text-2xl font-black tracking-tight text-white hidden sm:flex items-center">
                            STUDY<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 animate-gradient-x">SPIRIT</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center justify-center p-2.5 rounded-xl bg-white/5 text-zinc-400 transition-all duration-300 hover:bg-white/10 hover:text-white hover:scale-110 border border-white/5"
                        >
                            <Home className="w-5 h-5" />
                        </button>

                        {/* Admin Panel Button */}
                        {user?.isAdmin && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 transition-all duration-300 hover:bg-rose-500/20 hover:text-rose-300 hover:scale-105 border border-rose-500/20"
                            >
                                <Shield className="w-5 h-5" />
                                <span className="font-bold text-sm tracking-widest uppercase">Admin</span>
                            </button>
                        )}

                        <div className="flex items-center gap-3 bg-black/40 px-5 py-2 rounded-2xl border border-white/10 shadow-inner relative overflow-hidden backdrop-blur-md">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 pointer-events-none" />
                            <div className="relative flex items-center gap-2 group cursor-default">
                                <span className="text-xl group-hover:animate-bounce-slow drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]">🔥</span>
                                <span className="text-base font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                    {user?.streak || 0}
                                </span>
                            </div>

                            <div className="w-px h-6 bg-white/10 mx-1 md:mx-3" />

                            <div className="flex items-center gap-3">
                                <span className="text-xl hidden md:inline-block">👨‍💻</span>
                                <div className="hidden sm:block">
                                    <div className="text-sm font-bold text-white tracking-wide">{user?.name || 'Developer'}</div>
                                    <div className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">LEVEL {user?.level || 1}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10 relative z-10">
                {/* Header Card */}
                <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2rem] p-8 md:p-12 mb-12 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden animate-slide-down">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-shimmer" />

                    <div className="flex justify-between items-center flex-col lg:flex-row gap-8 relative z-10">
                        <div className="text-center lg:text-left w-full lg:w-auto">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4 animate-fade-in-up">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-300 uppercase">System Online</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tighter">
                                Welcome Back, <br className="hidden lg:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient-x">
                                    {user?.name || 'Developer'}
                                </span>
                                <span className="inline-block animate-wave ml-4 text-4xl">👋</span>
                            </h1>
                            <p className="text-lg md:text-xl text-zinc-400 font-light max-w-xl">
                                Your dashboard is ready. Time to dive into deep work and crush today's objectives.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                            {[
                                { label: 'Active Streak', value: `🔥 ${user?.streak || 0}`, from: 'from-amber-400', to: 'to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                                { label: 'Current Level', value: user?.level || 1, from: 'from-cyan-400', to: 'to-blue-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                                { label: 'Total EXP', value: user?.xp || 0, from: 'from-purple-400', to: 'to-pink-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                                { label: 'Reputation', value: user?.reputation || 0, from: 'from-emerald-400', to: 'to-teal-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`relative bg-black/40 backdrop-blur-xl rounded-2xl p-5 text-center border transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:scale-105 ${item.border}`}
                                    style={{ animation: `slideUp 0.8s ease-out ${0.1 * idx}s both` }}
                                >
                                    <div className={`absolute inset-0 rounded-2xl ${item.bg} opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                                    <div className="text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-widest">{item.label}</div>
                                    <div className={`text-3xl font-black bg-gradient-to-r ${item.from} ${item.to} bg-clip-text text-transparent drop-shadow-[0_0_15px_currentColor]`}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {quickStats.map((stat, idx) => (
                        <div
                            key={idx}
                            onClick={stat.onClick}
                            className={`group bg-zinc-900/30 backdrop-blur-xl rounded-3xl p-8 border border-white/5 transition-all duration-500 relative overflow-hidden hover:-translate-y-2 hover:border-cyan-500/30 hover:shadow-[0_20px_40px_rgba(6,182,212,0.15)] hover:bg-zinc-800/40 ${stat.onClick ? 'cursor-pointer' : ''}`}
                            style={{ animation: `slideUp 0.8s ease-out ${idx * 0.1}s both` }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none opacity-50 group-hover:scale-110 transition-transform duration-500" />
                            <div className="flex items-center gap-6 relative z-10">
                                <div className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.from} ${stat.to} shadow-[0_10px_20px_currentColor] drop-shadow-md group-hover:animate-icon-bounce`}>
                                    <stat.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[11px] text-zinc-400 font-bold mb-1 uppercase tracking-widest">{stat.label}</div>
                                    <div className="text-3xl font-black text-white mb-1 tracking-tight">
                                        {stat.value}
                                    </div>
                                    {stat.subtext && <div className="text-sm text-cyan-400/80 font-medium">{stat.subtext}</div>}
                                </div>
                            </div>
                            {stat.onClick && (
                                <div className="absolute top-6 right-6 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Celebration Alert */}
                {user?.streak > 0 && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 relative overflow-hidden animate-slide-up-delayed mb-16 flex flex-col md:flex-row items-center justify-between gap-6 group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="flex items-center gap-6 z-10">
                            <div className="text-5xl group-hover:animate-bounce-slow drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]">🔥</div>
                            <div>
                                <h3 className="text-2xl font-black text-white mb-1 tracking-tighter">Unstoppable!</h3>
                                <p className="text-zinc-400 text-lg">
                                    You're on a <span className="text-pink-400 font-bold">{user?.streak}-day streak</span>. Keep the momentum high.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                triggerConfetti();
                                showToast('System Overdrive Engaged!', 'success');
                            }}
                            className="bg-white text-black rounded-full px-8 py-4 font-black uppercase tracking-widest text-sm transition-all duration-300 hover:scale-105 hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] z-10 whitespace-nowrap"
                        >
                            Claim Reward
                        </button>
                    </div>
                )}

                {/* Main Modules Grid */}
                <div className="mb-8 flex items-center gap-4 animate-fade-in-up delay-200">
                    <div className="w-2 h-8 rounded-full bg-cyan-400 animate-pulse" />
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                            SYSTEM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">MODULES</span>
                        </h2>
                        <p className="text-zinc-500 font-medium">Access your personalized toolkit for extreme productivity.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        [...Array(12)].map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        features.map((feature, idx) => (
                            <button
                                key={feature.id}
                                onClick={() => {
                                    navigate(feature.path);
                                    showToast(`Initializing ${feature.name}...`, 'success');
                                }}
                                className={`group bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-300 cursor-pointer text-left relative overflow-hidden preserve-3d animate-scale-in flex flex-col items-start ${hoveredFeature === feature.id ? 'border-cyan-500/50 bg-zinc-800/80' : 'border-white/5'
                                    }`}
                                style={{ animationDelay: `${(idx % 8) * 0.05}s` }}
                                onMouseMove={handleMouseMove}
                                onMouseEnter={(e) => setHoveredFeature(feature.id)}
                                onMouseLeave={(e) => {
                                    setHoveredFeature(null);
                                    handleMouseLeaveCard(e);
                                }}
                            >
                                <div className={`absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-cyan-400 transform group-hover:translate-x-1 group-hover:-translate-y-1`}>
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                                <div className={`p-4 rounded-2xl inline-flex mb-6 shadow-lg bg-gradient-to-br ${feature.from} ${feature.to} group-hover:-translate-y-2 transition-transform duration-300 drop-shadow-[0_0_15px_currentColor] border border-white/20`}>
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-cyan-400 transition-colors">{feature.name}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed font-light">{feature.desc}</p>

                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transform scale-x-0 transition-transform duration-500 origin-left group-hover:scale-x-100" />
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Action FAB */}
            <div className="fixed bottom-8 right-8 z-[999]">
                {fabOpen && quickActions.map((action, idx) => (
                    <div
                        key={idx}
                        className="absolute right-2 cursor-pointer animate-fab-slide-in flex items-center justify-end"
                        style={{
                            bottom: `${(idx + 1) * 75}px`,
                            animationDelay: `${idx * 0.05}s`
                        }}
                        onClick={() => {
                            navigate(action.path);
                            setFabOpen(false);
                            showToast(`Launching ${action.label}...`, 'success');
                        }}
                    >
                        <div className="mr-4 bg-zinc-900/90 backdrop-blur-md px-5 py-2.5 rounded-xl text-white text-sm font-bold tracking-widest uppercase border border-white/10 shadow-xl pointer-events-none">
                            {action.label}
                        </div>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-2 border-white/20 hover:scale-110 ${action.color}`}>
                            <action.icon className="w-6 h-6 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                        </div>
                    </div>
                ))}

                <button
                    className={`w-16 h-16 rounded-full bg-white border-2 border-transparent cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center transition-all duration-500 z-[1000] hover:scale-110 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] ${fabOpen ? 'rotate-45 bg-zinc-800 text-white' : 'text-black'}`}
                    onClick={() => setFabOpen(!fabOpen)}
                >
                    <Zap className={`w-7 h-7 transition-colors ${fabOpen ? 'text-white' : 'text-black'}`} />
                </button>
            </div>

            <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        
        @keyframes float { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(40px, -40px) rotate(8deg); } 50% { transform: translate(-30px, 30px) rotate(-8deg); } 75% { transform: translate(30px, 15px) rotate(5deg); } }
        .animate-float { animation: float 25s ease-in-out infinite; }
        .animate-float-reverse { animation: float 30s ease-in-out infinite reverse; }
        
        @keyframes pulse-slow { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.2; transform: scale(1.15); } }
        .animate-pulse-slow { animation: pulse-slow 20s ease-in-out infinite; }
        
        @keyframes slide-down { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-down { animation: slide-down 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
        
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up-delayed { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both; }
        
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-scale-in { animation: scale-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-icon-bounce { animation: bounce-slow 2s ease-in-out infinite; }
        
        @keyframes wave { 0% { transform: rotate(0deg); } 10% { transform: rotate(14deg); } 20% { transform: rotate(-8deg); } 30% { transform: rotate(14deg); } 40% { transform: rotate(-4deg); } 50% { transform: rotate(10deg); } 60% { transform: rotate(0deg); } 100% { transform: rotate(0deg); } }
        .animate-wave { animation: wave 2.5s infinite; transform-origin: 70% 70%; display: inline-block; }
        
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-shimmer { animation: shimmer 2s infinite linear; background-size: 200% auto; }
        
        @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 8s ease infinite; }
        
        @keyframes slide-in-right { from { transform: translateX(200px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in-right 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        
        @keyframes fab-slide-in { from { opacity: 0; transform: translateY(20px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fab-slide-in { animation: fab-slide-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        
        @keyframes confetti-fall { 0% { transform: translateY(0) rotateZ(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotateZ(720deg); opacity: 0; } }
        .animate-confetti { animation: confetti-fall forwards ease-in; }
      `}</style>
        </div>
    );
}