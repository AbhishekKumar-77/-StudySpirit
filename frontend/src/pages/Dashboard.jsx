
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
            color: ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]
        }));

        setConfetti(pieces);
        setTimeout(() => setConfetti([]), 4000);
    };

    const features = [
        { id: 1, name: 'Solo Mode Study', path: '/solo-mode', icon: BookOpen, from: 'from-blue-500', to: 'to-cyan-500', desc: 'Independent study with AI mentorship' },
        { id: 2, name: 'Group Mode Study', path: '/group-mode', icon: Users, from: 'from-violet-500', to: 'to-pink-500', desc: 'Collaborative learning teams' },
        { id: 3, name: 'Study Planner & Goals', path: '/planner', icon: Calendar, from: 'from-emerald-500', to: 'to-green-400', desc: 'Smart planning & task management' },
        { id: 4, name: 'Quiz & Exam System', path: '/quiz', icon: ClipboardCheck, from: 'from-amber-500', to: 'to-red-500', desc: 'Secure testing with instant results' },
        { id: 5, name: 'Study Resources Hub', path: '/resources', icon: Library, from: 'from-indigo-500', to: 'to-violet-500', desc: 'Centralized knowledge base' },
        { id: 6, name: 'CodeSpirit', path: '/codespirit', icon: Code, from: 'from-yellow-500', to: 'to-orange-500', desc: 'Coding practice platform' },
        { id: 7, name: 'AI Interview Prep', path: '/interview', icon: Mic, from: 'from-pink-500', to: 'to-rose-500', desc: 'Mock interview simulator' },
        { id: 8, name: 'CareerSprint', path: '/career', icon: Briefcase, from: 'from-cyan-500', to: 'to-teal-500', desc: 'Job & internship portal' },
        { id: 9, name: 'Project Lab', path: '/project-lab', icon: Folder, from: 'from-purple-600', to: 'to-violet-500', desc: 'Build & showcase projects' },
        // { id: 10, name: 'ChatMentor.AI', path: '/chat-mentor', icon: MessageSquare, from: 'from-blue-500', to: 'to-indigo-500', desc: '24/7 AI tutor assistant' },
        // { id: 11, name: 'Institution Portal', path: '/institution', icon: GraduationCap, from: 'from-red-500', to: 'to-pink-500', desc: 'Admin & management tools' },
        // { id: 12, name: 'AI Skill Analyzer', path: '/analyzer', icon: TrendingUp, from: 'from-emerald-500', to: 'to-teal-500', desc: 'Performance analytics' },
        // { id: 13, name: 'Events Hub', path: '/events', icon: Calendar, from: 'from-orange-500', to: 'to-rose-500', desc: 'Hackathons, webinars & contests' },
        { id: 14, name: 'DiscussVerse', path: '/discuss', icon: MessageCircle, from: 'from-violet-500', to: 'to-indigo-500', desc: 'Global coding community' },
        { id: 16, name: 'Soft Skills Lab', path: '/soft-skills', icon: Brain, from: 'from-pink-500', to: 'to-violet-500', desc: 'Communication training' },
        { id: 17, name: 'Code Editors', path: '/code-editor', icon: Edit3, from: 'from-cyan-500', to: 'to-blue-500', desc: 'Online IDE & compiler' }
    ];

    const formatStudyTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const quickStats = [
        {
            label: 'Daily Goals',
            value: stats?.dailyGoals || 0,
            subtext: 'Tasks Today',
            icon: Target,
            from: 'from-cyan-500',
            to: 'to-blue-500',
            onClick: () => navigate('/planner')
        },
        {
            label: 'Completion Rate',
            value: `${stats?.completionRate || 0}%`,
            subtext: 'Keep it up!',
            icon: CheckCircle,
            from: 'from-emerald-500',
            to: 'to-green-400'
        },
        {
            label: 'Study Time',
            value: formatStudyTime(todayStudyTime),
            subtext: `Today • ${formatStudyTime((dashboardData?.user?.totalStudyTime || 0))} total`,
            icon: Clock,
            from: 'from-violet-500',
            to: 'to-purple-600'
        },
    ];

    const quickActions = [
        // { icon: MessageSquare, label: 'Ask AI', path: '/chat-mentor', color: 'bg-blue-500' },
        { icon: Code, label: 'Code Now', path: '/codespirit', color: 'bg-yellow-500' },
        { icon: Calendar, label: 'Plan', path: '/planner', color: 'bg-emerald-500' },
        ...(user?.isAdmin ? [{ icon: Shield, label: 'Admin Panel', path: '/admin', color: 'bg-red-500' }] : [])
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

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.02)`;
    };

    const handleMouseLeaveCard = (e) => {
        e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)`;
    };

    const SkeletonCard = () => (
        <div className="h-[200px] rounded-[20px] bg-gradient-to-r from-[#1e1e32]/50 via-[#323250]/50 to-[#1e1e32]/50 bg-[length:200%_100%] animate-shimmer border border-violet-500/10 p-7">
            <div className="w-[60px] h-[60px] bg-violet-500/20 rounded-[14px] mb-5" />
            <div className="w-[70%] h-5 bg-violet-500/20 rounded mb-3" />
            <div className="w-[90%] h-3.5 bg-violet-500/15 rounded" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0d0d15] relative overflow-hidden font-sans selection:bg-violet-500/30">

            {/* Loading Progress Bar */}
            {loadProgress < 100 && (
                <div className="fixed top-0 left-0 w-full h-[3px] z-[99999] bg-slate-900/50">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                        style={{ width: `${loadProgress}%` }}
                    />
                </div>
            )}

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
            <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`backdrop-blur-xl px-6 py-4 rounded-xl text-white font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.3)] animate-slide-in border border-white/20 min-w-[250px] flex items-center gap-3 ${toast.type === 'success'
                            ? 'bg-gradient-to-br from-emerald-500/90 to-green-400/90'
                            : 'bg-gradient-to-br from-red-500/90 to-red-600/90'
                            }`}
                    >
                        <span className="text-xl">{toast.type === 'success' ? '✓' : '⚠'}</span>
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>

            {/* Animated Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[80px] animate-float" />
                <div className="absolute bottom-[10%] right-[10%] w-[700px] h-[700px] bg-pink-500/15 rounded-full blur-[80px] animate-float-reverse" />
                <div className="absolute top-1/2 right-[5%] w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[70px] animate-pulse-slow" />
            </div>

            {/* Grid Background */}
            <div
                className="fixed inset-0 w-full h-full opacity-30 pointer-events-none animate-grid-move"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px'
                }}
            />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[#0f172a]/70 backdrop-blur-[30px] border-b border-violet-500/20 shadow-[0_10px_40px_rgba(139,92,246,0.15)]">
                <div className="max-w-[1400px] mx-auto px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="StudySpirit Logo" className="w-10 h-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                        <div className="text-3xl font-black bg-gradient-to-r from-white via-violet-300 to-blue-400 bg-clip-text text-transparent tracking-tight animate-title-glow">
                            STUDYSPIRIT
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center justify-center p-3 rounded-xl bg-indigo-500/15 text-slate-400 transition-all duration-300 hover:bg-indigo-500/30 hover:text-blue-400 hover:scale-110 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                        >
                            <Home className="w-5 h-5" />
                        </button>

                        {/* Admin Panel Button */}
                        {user?.isAdmin && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/15 text-red-400 transition-all duration-300 hover:bg-red-500/30 hover:text-red-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] border border-red-500/20"
                            >
                                <Shield className="w-5 h-5" />
                                <span className="font-bold text-sm">Admin</span>
                            </button>
                        )}

                        <div className="flex items-center gap-3 bg-gradient-to-r from-[#1e2236]/90 to-[#28143c]/70 px-5 py-2.5 rounded-2xl border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)] relative overflow-hidden">
                            <div className="relative flex items-center gap-2">
                                <div className="absolute left-0 bottom-full text-[0.5rem] animate-fire-rise opacity-0">✨</div>
                                <div className="absolute left-1 bottom-full text-[0.5rem] animate-fire-rise opacity-0 delay-150">✨</div>
                                <div className="absolute left-2 bottom-full text-[0.5rem] animate-fire-rise opacity-0 delay-300">✨</div>
                                <span className="text-2xl drop-shadow-[0_0_10px_rgba(251,146,60,0.8)] animate-fire-flicker">🔥</span>
                                <span className="text-base font-black bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
                                    {user?.streak || 0}
                                </span>
                            </div>

                            <div className="w-px h-[30px] bg-violet-500/30 mx-2" />

                            <span className="text-2xl animate-bounce-slow">👨‍🎓</span>
                            <div>
                                <div className="text-sm font-semibold text-white">{user?.name || 'Student'}</div>
                                <div className="text-xs text-violet-300 font-semibold tracking-wider">LEVEL {user?.level || 1}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-8 py-10 relative z-10">
                {/* Header Card */}
                <div className="bg-gradient-to-br from-indigo-500/15 to-violet-500/15 backdrop-blur-[30px] rounded-3xl p-10 mb-10 border border-violet-500/30 shadow-[0_20px_60px_rgba(139,92,246,0.2)] relative overflow-hidden animate-slide-down">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-violet-500 via-pink-500 via-cyan-500 to-transparent animate-shimmer-glow" />

                    <div className="flex justify-between items-center flex-wrap gap-6 relative z-10">
                        <div>
                            <div className="text-sm text-violet-300 font-bold tracking-[0.15em] mb-3 uppercase animate-neon-glow drop-shadow-[0_0_10px_rgba(167,139,250,0.8)]">
                                ⚡ Welcome Back
                            </div>
                            <h1 className="text-[2.5rem] font-black text-white mb-3 tracking-tight drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                                Hey, {user?.name || 'Student'}! <span className="inline-block animate-wave">👋</span>
                            </h1>
                            <p className="text-lg text-slate-300 font-normal">
                                Ready to crush your goals today?
                            </p>
                        </div>

                        <div className="flex gap-4 flex-wrap">
                            {[
                                { label: 'Streak', value: `🔥 ${user?.streak || 0}`, from: 'from-amber-500', to: 'to-red-500' },
                                { label: 'Level', value: user?.level || 1, from: 'from-violet-500', to: 'to-pink-500' },
                                { label: 'XP', value: user?.xp || 0, from: 'from-cyan-500', to: 'to-blue-500' },
                                { label: 'Reputation', value: user?.reputation || 0, from: 'from-emerald-500', to: 'to-teal-500' }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gradient-to-br from-[#1e1e32]/90 to-[#280a3c]/70 backdrop-blur-xl rounded-2xl p-5 px-7 text-center border border-violet-500/20 min-w-[110px] transition-all duration-300 shadow-[0_10px_30px_rgba(139,92,246,0.1)] hover:-translate-y-1 hover:scale-105 hover:shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:border-violet-500/50"
                                    style={{ animation: `slideUp 0.8s ease-out ${0.1 * idx}s both` }}
                                >
                                    <div className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">{item.label}</div>
                                    <div className={`text-[1.75rem] font-black bg-gradient-to-r ${item.from} ${item.to} bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]`}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {quickStats.map((stat, idx) => (
                        <div
                            key={idx}
                            onClick={stat.onClick}
                            className={`group bg-gradient-to-br from-[#141428]/80 to-[#1e0f32]/60 backdrop-blur-[30px] rounded-[20px] p-7 border border-violet-500/20 transition-all duration-500 relative overflow-hidden hover:-translate-y-2 hover:scale-[1.02] hover:border-violet-500/50 hover:shadow-[0_30px_60px_rgba(139,92,246,0.3)] hover:bg-gradient-to-br hover:from-[#1e0f32]/95 hover:to-[#280a3c]/80 ${stat.onClick ? 'cursor-pointer' : ''}`}
                            style={{ animation: `slideUp 0.8s ease-out ${idx * 0.1}s both` }}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`bg-gradient-to-br ${stat.from} ${stat.to} p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] animate-icon-bounce`}>
                                    <stat.icon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-slate-400 font-semibold mb-1 uppercase tracking-wider">{stat.label}</div>
                                    <div className={`text-[2rem] font-black mb-0.5 bg-gradient-to-r ${stat.from} ${stat.to} bg-clip-text text-transparent`}>
                                        {stat.value}
                                    </div>
                                    {stat.subtext && <div className="text-xs text-violet-400">{stat.subtext}</div>}
                                </div>
                            </div>
                            {stat.onClick && (
                                <div className="absolute top-3 right-3 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Motivation Section */}
                <div className="bg-gradient-to-br from-pink-500/15 to-purple-500/15 backdrop-blur-[30px] rounded-[20px] p-10 mb-10 border border-pink-500/30 relative overflow-hidden animate-slide-up-delayed">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent" />

                    <div className="flex items-center justify-between gap-5 relative z-10 flex-wrap">
                        <div className="flex items-center gap-5">
                            <div className="text-[3.5rem] drop-shadow-[0_0_20px_rgba(236,72,153,0.8)] animate-bounce-slow">🚀</div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Today's Motivation</h3>
                                <p className="text-lg bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent italic font-semibold">
                                    "You're on a {user?.streak || 0}-day streak! Keep the momentum going! 💪"
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                triggerConfetti();
                                showToast('🎉 Awesome! Keep going!', 'success');
                            }}
                            className="bg-gradient-to-r from-violet-500 to-pink-500 border-none rounded-xl px-6 py-3 text-white font-bold cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:scale-105 hover:shadow-[0_15px_40px_rgba(139,92,246,0.5)]"
                        >
                            🎊 Celebrate
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="mb-6 animate-fade-in-up delay-200">
                    <h2 className="text-[2.5rem] font-black text-white mb-3 tracking-tight drop-shadow-[0_0_20px_rgba(139,92,246,0.3)] text-shadow-glow">
                        🚀 Explore Features
                    </h2>
                    <p className="text-base text-slate-400 mb-8">
                        Choose from {features.length} powerful tools to enhance your learning experience
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        [...Array(17)].map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        features.map((feature, idx) => (
                            <button
                                key={feature.id}
                                onClick={() => {
                                    navigate(feature.path);
                                    showToast(`Opening ${feature.name}...`, 'success');
                                }}
                                className={`group bg-gradient-to-br from-[#141428]/80 to-[#1e0fb2]/60 backdrop-blur-[30px] rounded-[20px] p-7 border transition-all duration-150 cursor-pointer text-left relative overflow-hidden text-white preserve-3d animate-scale-in hover:shadow-[0_30px_80px_rgba(139,92,246,0.4)] hover:bg-gradient-to-br hover:from-[#1e0f32]/95 hover:to-[#280a3c]/80 ${hoveredFeature === feature.id ? 'border-violet-500/60' : 'border-violet-500/20'
                                    }`}
                                style={{ animationDelay: `${(idx % 6) * 0.05}s` }}
                                onMouseMove={handleMouseMove}
                                onMouseEnter={(e) => {
                                    setHoveredFeature(feature.id);
                                    // Apply styles via state/classes instead of direct inline if possible, but 3d tilt needs inline
                                }}
                                onMouseLeave={(e) => {
                                    setHoveredFeature(null);
                                    handleMouseLeaveCard(e);
                                }}
                            >
                                <div className={`p-4 rounded-[14px] inline-flex mb-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] bg-gradient-to-br ${feature.from} ${feature.to} group-hover:-translate-y-1 feature-icon`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{feature.name}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>

                                <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${feature.from} ${feature.to} transform scale-x-0 transition-transform duration-400 origin-left group-hover:scale-x-100 shadow-[0_0_20px_currentColor]`} />
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8 z-[999]">
                {fabOpen && quickActions.map((action, idx) => (
                    <div
                        key={idx}
                        className="absolute right-0 cursor-pointer animate-fab-slide-in"
                        style={{
                            bottom: `${(idx + 1) * 70}px`,
                            animationDelay: `${idx * 0.05}s`
                        }}
                        onClick={() => {
                            navigate(action.path);
                            setFabOpen(false);
                            showToast(`Opening ${action.label}...`, 'success');
                        }}
                    >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-2 border-white/20 hover:scale-110 ${action.color} shadow-${action.color}/40`}>
                            <action.icon className="w-6 h-6 text-white" />
                        </div>

                        <div className="absolute right-[70px] top-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm font-semibold whitespace-nowrap border border-violet-500/30 pointer-events-none">
                            {action.label}
                        </div>
                    </div>
                ))}

                <button
                    className={`w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 border-none cursor-pointer shadow-[0_10px_40px_rgba(139,92,246,0.5)] flex items-center justify-center transition-all duration-300 z-[1000] hover:scale-110 hover:shadow-[0_15px_50px_rgba(139,92,246,0.7)] ${fabOpen ? 'rotate-45' : 'rotate-0'}`}
                    onClick={() => setFabOpen(!fabOpen)}
                >
                    <Zap className="w-7 h-7 text-white" />
                </button>
            </div>

            <style>{`
        @keyframes wave { 0% { transform: rotate(0deg); } 10% { transform: rotate(14deg); } 20% { transform: rotate(-8deg); } 30% { transform: rotate(14deg); } 40% { transform: rotate(-4deg); } 50% { transform: rotate(10deg); } 60% { transform: rotate(0deg); } 100% { transform: rotate(0deg); } }
        .animate-wave { animation: wave 2.5s infinite; transform-origin: 70% 70%; display: inline-block; }
        
        .preserve-3d { transform-style: preserve-3d; }
        
        @keyframes float { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(40px, -40px) rotate(8deg); } 50% { transform: translate(-30px, 30px) rotate(-8deg); } 75% { transform: translate(30px, 15px) rotate(5deg); } }
        .animate-float { animation: float 25s ease-in-out infinite; }
        .animate-float-reverse { animation: float 30s ease-in-out infinite reverse; }
        
        @keyframes pulse-slow { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.2; transform: scale(1.15); } }
        .animate-pulse-slow { animation: pulse-slow 20s ease-in-out infinite; }
        
        @keyframes grid-move { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }
        .animate-grid-move { animation: grid-move 20s linear infinite; }
        
        @keyframes slide-down { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-down { animation: slide-down 0.8s ease-out; }
        
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up-delayed { animation: slide-up 0.8s ease-out 0.2s both; }
        .animate-slide-Up { animation: slide-up 0.8s ease-out both; }
        
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: scale-in 0.6s ease-out both; }
        
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-icon-bounce { animation: bounce-slow 2s ease-in-out infinite; }
        
        @keyframes title-glow { 0%, 100% { text-shadow: 0 0 30px rgba(139, 92, 246, 0.5); } 50% { text-shadow: 0 0 60px rgba(236, 72, 153, 0.8); } }
        .animate-title-glow { animation: title-glow 3s ease-in-out infinite; }
        
        @keyframes neon-glow { 0%, 100% { text-shadow: 0 0 10px rgba(167, 139, 250, 0.8); } 50% { text-shadow: 0 0 20px rgba(167, 139, 250, 1); } }
        .animate-neon-glow { animation: neon-glow 2.5s ease-in-out infinite; }
        
        @keyframes shimmer-glow { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .animate-shimmer-glow { animation: shimmer-glow 3s ease-in-out infinite; }
        
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
        
        @keyframes slide-in-right { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in-right 0.3s ease-out forwards; }
        
        @keyframes fab-slide-in { from { opacity: 0; transform: translateY(20px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fab-slide-in { animation: fab-slide-in 0.3s ease-out both; }
        
        @keyframes confetti-fall { 0% { transform: translateY(0) rotateZ(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotateZ(720deg); opacity: 0; } }
        .animate-confetti { animation: confetti-fall forwards; }
        
        @keyframes fire-flicker { 0%, 100% { filter: drop-shadow(0 0 10px rgba(251, 146, 60, 0.8)); transform: scale(1); } 50% { filter: drop-shadow(0 0 20px rgba(239, 68, 68, 1)); transform: scale(1.1); } }
        .animate-fire-flicker { animation: fire-flicker 2s ease-in-out infinite; }
        
        @keyframes fire-rise { 0% { opacity: 0; transform: translateY(0) scale(1); } 50% { opacity: 1; } 100% { opacity: 0; transform: translateY(-30px) scale(0.5); } }
        .animate-fire-rise { animation: fire-rise 0.8s ease-out infinite; }
        
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out both; }
        
        .text-shadow-glow { text-shadow: -2px -2px 0 rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3); }
      `}</style>
        </div>
    );
}