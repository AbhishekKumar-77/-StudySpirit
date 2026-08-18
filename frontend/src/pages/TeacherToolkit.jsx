import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    ClipboardCheck, Home, Shield, ArrowRight, Library, Target, Mic, School,
    Megaphone, GraduationCap, BookOpen, BarChart2, Sparkles, Users, Bell,
    Code2, Video, LogOut, ChevronRight
} from 'lucide-react';

export default function TeacherToolkit() {
    const { user, logoutUser } = useApp();
    const navigate = useNavigate();

    // Redirect non-teachers
    useEffect(() => {
        if (user && user.role !== 'teacher' && user.role !== 'admin') navigate('/dashboard');
    }, [user, navigate]);

    const firstName = user?.name?.split(' ')[0] || 'Teacher';
    const initial = user?.name?.[0]?.toUpperCase() || 'T';

    const features = [
        {
            id: 1,
            name: 'Quizzes & Live Exams',
            description: 'Create quizzes, monitor live exams, view leaderboards and answer keys.',
            path: '/teacher-dashboard',
            icon: ClipboardCheck,
            color: '#f59e0b',
            bg: '#fffbeb',
            border: '#fde68a'
        },
        {
            id: 2,
            name: 'Study Resources',
            description: 'Upload notes, create AI-powered explainers, and manage the Study Vault.',
            path: '/resources',
            icon: Library,
            color: '#10b981',
            bg: '#ecfdf5',
            border: '#a7f3d0'
        },
        {
            id: 3,
            name: 'CodeSpirit Exam',
            description: 'Set coding challenges, evaluate student submissions and view rankings.',
            path: '/teacher-codespirit',
            icon: Code2,
            color: '#8b5cf6',
            bg: '#f5f3ff',
            border: '#c4b5fd'
        },
        {
            id: 4,
            name: 'AI Interview Exam',
            description: 'Create AI-powered mock interview assessments and review student results.',
            path: '/teacher-interview',
            icon: Mic,
            color: '#f43f5e',
            bg: '#fff1f2',
            border: '#fecdd3'
        },
        {
            id: 5,
            name: 'Classrooms & Batches',
            description: 'Manage batches, schedule live lectures, go live, and enroll students.',
            path: '/teacher-dashboard?tab=classrooms',
            icon: School,
            color: '#3b82f6',
            bg: '#eff6ff',
            border: '#bfdbfe'
        },
        {
            id: 6,
            name: 'Announcements',
            description: 'Post and manage global batch announcements and important updates.',
            path: '/teacher-dashboard?tab=announcements',
            icon: Megaphone,
            color: '#f97316',
            bg: '#fff7ed',
            border: '#fed7aa'
        }
    ];

    const quickStats = [
        { label: 'Your Role', value: 'Instructor', icon: GraduationCap, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Portal', value: 'Teacher Hub', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Tools', value: `${features.length} Modules`, icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">

            {/* ── TOP NAV BAR ─────────────────────── */}
            <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between gap-4 shadow-sm">
                {/* Logo */}
                <div
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <span className="font-black text-slate-900 text-sm">StudySpirit</span>
                        <span className="text-[10px] font-bold text-violet-600 ml-1.5 px-1.5 py-0.5 bg-violet-50 rounded-md">Teacher Hub</span>
                    </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    {user?.isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all"
                        >
                            <Shield className="w-3.5 h-3.5" /> Admin Panel
                        </button>
                    )}

                    {/* User profile badge */}
                    <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                        <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                            {initial}
                        </div>
                        <div className="hidden sm:block">
                            <div className="font-bold text-slate-900 text-xs leading-none">{user?.name || 'Teacher'}</div>
                            <div className="text-[10px] font-semibold text-violet-600">Instructor</div>
                        </div>
                    </div>

                    <button
                        onClick={async () => { await logoutUser?.(); navigate('/'); }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* ── MAIN CONTENT ─────────────────────── */}
            <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

                {/* Welcome Hero */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-2xl p-8 shadow-lg shadow-violet-600/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-violet-200 text-xs font-bold uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                            Instructor Hub Online
                        </div>
                        <h1 className="text-3xl font-black tracking-tight leading-tight">
                            Welcome Back, {firstName}! 👋
                        </h1>
                        <p className="text-violet-200 text-sm max-w-md leading-relaxed">
                            Your teaching dashboard is ready. Manage your classes, create resources, and crush today's objectives.
                        </p>
                    </div>

                    {/* Quick stats row */}
                    <div className="flex gap-3 flex-wrap">
                        {quickStats.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div key={i} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3 text-white min-w-[140px]">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase text-violet-200 tracking-wide">{stat.label}</div>
                                        <div className="font-black text-sm">{stat.value}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Your Toolkit Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-violet-600" />
                                Your Teaching Toolkit
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">Access your personalized teaching modules.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.id}
                                    onClick={() => navigate(feature.path)}
                                    className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-slate-300 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                                    style={{ '--hover-color': feature.color }}
                                >
                                    <div className="space-y-3">
                                        {/* Icon */}
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: feature.bg, border: `1px solid ${feature.border}` }}
                                        >
                                            <Icon className="w-6 h-6" style={{ color: feature.color }} />
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-slate-900 text-base group-hover:text-violet-700 transition-colors">
                                                {feature.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className="flex items-center gap-1.5 text-xs font-bold mt-4 pt-4 border-t border-slate-100 transition-colors group-hover:gap-2.5"
                                        style={{ color: feature.color }}
                                    >
                                        Open Module <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Tip Banner */}
                <div className="bg-white rounded-2xl border border-violet-200/60 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Bell className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">Need to post an announcement?</h3>
                            <p className="text-xs text-slate-500">Post batch-wide announcements or schedule live lectures directly from the Teacher Dashboard.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/teacher-dashboard?tab=announcements')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
                    >
                        Go to Announcements <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-6 text-[11px] text-slate-400 font-medium">
                StudySpirit Teacher Portal · {new Date().getFullYear()}
            </footer>
        </div>
    );
}
