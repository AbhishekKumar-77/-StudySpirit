import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap, Users, Briefcase, Code, Trophy, BookOpen,
    Sparkles, CheckCircle2, ArrowRight, Lock, Mail,
    MessageSquare, BarChart3, FileText, Building2, Rocket,
    BookMarked, Lightbulb, Compass, Award, Star, X, Presentation
} from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [activeTab, setActiveTab] = useState('Home');

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (newsletterEmail.trim()) {
            setSubscribed(true);
            setTimeout(() => setSubscribed(false), 4000);
            setNewsletterEmail('');
        }
    };

    const scrollToSection = (id, tabName) => {
        setActiveTab(tabName);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            backgroundColor: '#ffffff',
            color: '#1e293b',
            minHeight: '100vh',
            overflowX: 'hidden'
        }}>

            {/* ==================== HEADER / NAVBAR ==================== */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{
                    maxWidth: '1360px',
                    margin: '0 auto',
                    padding: '14px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Brand Logo & Stylized Name (Icon only + styled StudySpirit text) */}
                    <div 
                        onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveTab('Home'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    >
                        <img 
                            src="/logo-icon.png" 
                            alt="StudySpirit Icon" 
                            style={{ height: '44px', width: 'auto', objectFit: 'contain' }} 
                        />
                        <span style={{ 
                            fontSize: '28px', 
                            fontWeight: '900', 
                            fontFamily: "'Outfit', 'Inter', sans-serif",
                            letterSpacing: '-0.02em',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <span style={{ 
                                background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 50%, #92400E 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))'
                            }}>Study</span>
                            <span style={{ 
                                background: 'linear-gradient(180deg, #0284C7 0%, #0369A1 50%, #075985 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))'
                            }}>Spirit</span>
                        </span>
                    </div>

                    {/* Nav Links */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
                        {[
                            { name: 'Home', target: '' },
                            { name: 'Features', target: 'features' },
                            { name: 'Courses', target: 'roles' },
                            { name: 'About', target: 'cta-banner' },
                            { name: 'Contact', target: 'footer' }
                        ].map((link) => (
                            <button
                                key={link.name}
                                onClick={() => {
                                    if (link.target) {
                                        scrollToSection(link.target, link.name);
                                    } else {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        setActiveTab('Home');
                                    }
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '15px',
                                    fontWeight: activeTab === link.name ? '700' : '600',
                                    color: activeTab === link.name ? '#EE5D2B' : '#4b5563',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    padding: '6px 0',
                                    transition: 'color 0.2s ease'
                                }}
                            >
                                {link.name}
                                {activeTab === link.name && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '3px',
                                        backgroundColor: '#EE5D2B',
                                        borderRadius: '2px'
                                    }} />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Header Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <button
                            onClick={() => setShowLoginModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 22px',
                                borderRadius: '9999px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                color: '#EE5D2B',
                                fontWeight: '700',
                                fontSize: '14px',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#EE5D2B'; e.currentTarget.style.backgroundColor = '#FFF5F0'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                        >
                            <Lock size={15} style={{ color: '#EE5D2B' }} />
                            Login
                        </button>

                        <button
                            onClick={() => navigate('/login/student')}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '9999px',
                                background: 'linear-gradient(135deg, #FF6B35 0%, #EE5D2B 100%)',
                                border: 'none',
                                color: '#ffffff',
                                fontWeight: '700',
                                fontSize: '14px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(238, 93, 43, 0.35)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(238, 93, 43, 0.45)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(238, 93, 43, 0.35)'; }}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </header>


            {/* ==================== HERO SECTION (EXACT MATCH FOR IMAGE 2) ==================== */}
            <section style={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
                borderBottom: '1px solid #f8fafc'
            }}>
                <div style={{
                    maxWidth: '1440px',
                    margin: '0 auto',
                    padding: '20px 32px 40px',
                    display: 'grid',
                    gridTemplateColumns: '40% 60%',
                    alignItems: 'center',
                    minHeight: '78vh'
                }}>
                    {/* Left Column: Headline & Action */}
                    <div style={{ zIndex: 10, paddingRight: '16px' }}>
                        {/* Pill Badge */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 22px',
                            borderRadius: '9999px',
                            backgroundColor: '#FFF3EC',
                            border: '1px solid #FDBA74',
                            marginBottom: '24px'
                        }}>
                            <GraduationCap size={18} style={{ color: '#EA580C' }} />
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#C2410C' }}>
                                Learn • Practice • Grow
                            </span>
                        </div>

                        {/* Title */}
                        <h1 style={{
                            fontSize: 'clamp(48px, 5.8vw, 78px)',
                            fontWeight: '900',
                            lineHeight: '1.05',
                            letterSpacing: '-0.03em',
                            margin: '0 0 20px 0'
                        }}>
                            <span style={{ color: '#0F172A', display: 'block' }}>STUDY</span>
                            <span style={{ 
                                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: 'block'
                            }}>
                                SPIRIT
                            </span>
                        </h1>

                        {/* Tagline */}
                        <p style={{
                            fontSize: '19px',
                            color: '#475569',
                            fontWeight: '400',
                            lineHeight: '1.6',
                            marginBottom: '36px',
                            maxWidth: '500px'
                        }}>
                            Study the way you want, succeed the way you dream.
                        </p>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                            <button
                                onClick={() => navigate('/login/student')}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '14px 32px',
                                    borderRadius: '9999px',
                                    background: 'linear-gradient(135deg, #FF6B35 0%, #EE5D2B 100%)',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    boxShadow: '0 6px 20px rgba(238, 93, 43, 0.4)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                            >
                                Get Started <ArrowRight size={18} />
                            </button>

                            <button
                                onClick={() => scrollToSection('features', 'Features')}
                                style={{
                                    padding: '14px 32px',
                                    borderRadius: '9999px',
                                    backgroundColor: '#ffffff',
                                    border: '2px solid #EE5D2B',
                                    color: '#EE5D2B',
                                    fontWeight: '700',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FFF5F0'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                            >
                                Learn More
                            </button>
                        </div>

                        {/* Trust Checkmarks */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                            {[
                                'AI Powered Learning',
                                'Personalized Paths',
                                'Placement Ready'
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: '#DCFCE7',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <CheckCircle2 size={13} style={{ color: '#16A34A' }} />
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Full Scene Desk Image (Matching Image 2 Aspect Ratio & Faded Edges) */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img 
                            src="/study-desk.jpg" 
                            alt="Study Desk Setup with Lamp, Laptop and Notebook" 
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '640px',
                                objectFit: 'contain',
                                display: 'block'
                            }}
                        />
                    </div>
                </div>
            </section>


            {/* ==================== EXPLORE YOUR ROLE SECTION (MATCHING IMAGE 4 EXACTLY) ==================== */}
            <section id="roles" style={{ padding: '90px 0', backgroundColor: '#ffffff' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
                    
                    {/* Section Title */}
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 style={{
                            fontSize: '36px',
                            fontWeight: '900',
                            color: '#0F172A',
                            letterSpacing: '-0.02em',
                            margin: '0 0 12px 0'
                        }}>
                            EXPLORE YOUR ROLE
                        </h2>
                        <div style={{
                            width: '60px',
                            height: '4px',
                            backgroundColor: '#EE5D2B',
                            borderRadius: '2px',
                            margin: '0 auto'
                        }} />
                    </div>

                    {/* 3 Role Cards Grid (Image 4 exact design with wave left ribbons) */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '36px'
                    }}>
                        
                        {/* CARD 1: STUDENT (Orange wave ribbon on left) */}
                        <div 
                            onClick={() => navigate('/login/student')}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '32px',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                padding: '44px 36px 36px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(238, 93, 43, 0.12)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)'; }}
                        >
                            {/* Left Wave Ribbon (Image 4 Style) */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: '12px',
                                background: 'linear-gradient(180deg, #FF9E7D 0%, #FFD0B8 100%)',
                                borderTopLeftRadius: '32px',
                                borderBottomLeftRadius: '32px'
                            }} />

                            {/* 3D Student Icon */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, #FFF1EC 0%, #FFE4D6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                boxShadow: '0 8px 20px rgba(238, 93, 43, 0.12)'
                            }}>
                                <GraduationCap size={44} style={{ color: '#EA580C' }} />
                            </div>

                            <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', marginBottom: '14px' }}>
                                I'm a Student
                            </h3>

                            {/* Subtitle with highlighted colors */}
                            <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '32px', minHeight: '48px' }}>
                                <span style={{ color: '#1E293B', fontWeight: '600' }}>Solo & Group Study Modes,</span>{' '}
                                <span style={{ color: '#C2410C', fontWeight: '600' }}>Quizzes, AI Mentor & More</span>
                            </p>

                            {/* Pill Button with Orange Border */}
                            <button style={{
                                width: '100%',
                                padding: '13px 24px',
                                borderRadius: '9999px',
                                backgroundColor: '#ffffff',
                                border: '2px solid #EE5D2B',
                                color: '#EE5D2B',
                                fontWeight: '700',
                                fontSize: '15px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 8px rgba(238, 93, 43, 0.1)'
                            }}>
                                Get Started <ArrowRight size={18} />
                            </button>
                        </div>


                        {/* CARD 2: TEACHER (Purple wave ribbon on left) */}
                        <div 
                            onClick={() => navigate('/login/teacher')}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '32px',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                padding: '44px 36px 36px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(124, 58, 237, 0.12)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)'; }}
                        >
                            {/* Left Wave Ribbon (Image 4 Style) */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: '12px',
                                background: 'linear-gradient(180deg, #A78BFA 0%, #DDD6FE 100%)',
                                borderTopLeftRadius: '32px',
                                borderBottomLeftRadius: '32px'
                            }} />

                            {/* 3D Teacher Icon */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                boxShadow: '0 8px 20px rgba(124, 58, 237, 0.12)'
                            }}>
                                <Presentation size={44} style={{ color: '#7C3AED' }} />
                            </div>

                            <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', marginBottom: '14px' }}>
                                I'm a Teacher
                            </h3>

                            {/* Subtitle with highlighted colors */}
                            <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '32px', minHeight: '48px' }}>
                                <span style={{ color: '#1E293B', fontWeight: '600' }}>Create Quizzes, Track Students</span>{' '}
                                <span style={{ color: '#92400E', fontWeight: '600' }}>& Manage Exams</span>
                            </p>

                            {/* Pill Button with Orange Border */}
                            <button style={{
                                width: '100%',
                                padding: '13px 24px',
                                borderRadius: '9999px',
                                backgroundColor: '#ffffff',
                                border: '2px solid #EE5D2B',
                                color: '#EE5D2B',
                                fontWeight: '700',
                                fontSize: '15px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 8px rgba(238, 93, 43, 0.1)'
                            }}>
                                Get Started <ArrowRight size={18} />
                            </button>
                        </div>


                        {/* CARD 3: RECRUITER (Green wave ribbon on left) */}
                        <div 
                            onClick={() => navigate('/login/recruiter')}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '32px',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                padding: '44px 36px 36px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.12)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)'; }}
                        >
                            {/* Left Wave Ribbon (Image 4 Style) */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: '12px',
                                background: 'linear-gradient(180deg, #86EFAC 0%, #DCFCE7 100%)',
                                borderTopLeftRadius: '32px',
                                borderBottomLeftRadius: '32px'
                            }} />

                            {/* 3D Briefcase Icon */}
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.12)'
                            }}>
                                <Briefcase size={44} style={{ color: '#059669' }} />
                            </div>

                            <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', marginBottom: '14px' }}>
                                I'm a Recruiter
                            </h3>

                            {/* Subtitle with highlighted colors */}
                            <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '32px', minHeight: '48px' }}>
                                <span style={{ color: '#1E293B', fontWeight: '600' }}>Hire Top Talent with</span>{' '}
                                <span style={{ color: '#C2410C', fontWeight: '600' }}>Verified Skill Passports</span>
                            </p>

                            {/* Pill Button with Orange Border */}
                            <button style={{
                                width: '100%',
                                padding: '13px 24px',
                                borderRadius: '9999px',
                                backgroundColor: '#ffffff',
                                border: '2px solid #EE5D2B',
                                color: '#EE5D2B',
                                fontWeight: '700',
                                fontSize: '15px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 8px rgba(238, 93, 43, 0.1)'
                            }}>
                                Get Started <ArrowRight size={18} />
                            </button>
                        </div>

                    </div>
                </div>
            </section>


            {/* ==================== THE ULTIMATE TOOLKIT SECTION ==================== */}
            <section id="features" style={{ padding: '90px 0', backgroundColor: '#faf9f6' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
                    
                    {/* Title */}
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{
                            fontSize: '40px',
                            fontWeight: '900',
                            color: '#0F172A',
                            letterSpacing: '-0.02em',
                            margin: '0 0 12px 0'
                        }}>
                            THE ULTIMATE <span style={{ color: '#EE5D2B' }}>TOOLKIT</span>
                        </h2>
                        <p style={{ fontSize: '17px', color: '#64748B', margin: 0 }}>
                            Everything you need to crush your learning goals.
                        </p>
                    </div>

                    {/* 8 Features Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '24px'
                    }}>
                        {[
                            {
                                icon: BookMarked,
                                title: 'Solo Mode',
                                desc: 'Focus sessions, Pomodoro, AI mentor & deep work tools.',
                                path: '/solo-mode',
                                color: '#3B82F6',
                                bg: '#EFF6FF'
                            },
                            {
                                icon: Users,
                                title: 'Group Mode',
                                desc: 'Study in live rooms with real-time video, chat & sync.',
                                path: '/group-mode',
                                color: '#8B5CF6',
                                bg: '#F5F3FF'
                            },
                            {
                                icon: MessageSquare,
                                title: 'AI Interview',
                                desc: 'Practice mock interviews with AI, your AI interviewer.',
                                path: '/interview',
                                color: '#EC4899',
                                bg: '#FDF2F8'
                            },
                            {
                                icon: Trophy,
                                title: 'Gamification',
                                desc: 'Earn XP, maintain streaks & climb the leaderboard.',
                                path: '/dashboard',
                                color: '#F59E0B',
                                bg: '#FEF3C7'
                            },
                            {
                                icon: Code,
                                title: 'CodeSpirit',
                                desc: 'Solve problems, run code live & level up your skills.',
                                path: '/codespirit',
                                color: '#0EA5E9',
                                bg: '#E0F2FE'
                            },
                            {
                                icon: Briefcase,
                                title: 'CareerSprint',
                                desc: 'AI resume, job board & interview prep in one place.',
                                path: '/career',
                                color: '#EE5D2B',
                                bg: '#FFF7ED'
                            },
                            {
                                icon: BookOpen,
                                title: 'Study Resources',
                                desc: 'Notes, videos, PDFs & smart search.',
                                path: '/resources',
                                color: '#10B981',
                                bg: '#ECFDF5'
                            },
                            {
                                icon: BarChart3,
                                title: 'Performance Analytics',
                                desc: 'Track progress & skill growth.',
                                path: '/dashboard',
                                color: '#6366F1',
                                bg: '#EEF2FF'
                            }
                        ].map((feature, idx) => {
                            const IconComponent = feature.icon;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => navigate(feature.path)}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '24px',
                                        padding: '32px 24px',
                                        border: '1px solid #f1f5f9',
                                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.08)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.03)';
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        backgroundColor: feature.bg,
                                        color: feature.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <IconComponent size={26} />
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                                        {feature.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>


            {/* ==================== CTA BANNER: READY TO LEVEL UP? ==================== */}
            <section id="cta-banner" style={{ padding: '80px 0', backgroundColor: '#ffffff' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FEF3C7 100%)',
                        borderRadius: '32px',
                        padding: '60px 48px',
                        border: '1px solid #FED7AA',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 10px 40px rgba(249, 115, 22, 0.08)'
                    }}>
                        <div style={{ textAlign: 'center', width: '100%', maxWidth: '780px', margin: '0 auto', zIndex: 2 }}>
                            <h2 style={{
                                fontSize: '42px',
                                fontWeight: '900',
                                color: '#0F172A',
                                letterSpacing: '-0.02em',
                                marginBottom: '16px'
                            }}>
                                Ready to <span style={{ color: '#EE5D2B' }}>Level Up?</span>
                            </h2>
                            <p style={{
                                fontSize: '18px',
                                color: '#475569',
                                marginBottom: '36px',
                                lineHeight: '1.6'
                            }}>
                                Join thousands of students turning late-night study sessions into their superpower.
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => navigate('/login/student')}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '14px 32px',
                                        borderRadius: '9999px',
                                        backgroundColor: '#EE5D2B',
                                        border: 'none',
                                        color: '#ffffff',
                                        fontWeight: '700',
                                        fontSize: '15px',
                                        cursor: 'pointer',
                                        boxShadow: '0 6px 18px rgba(238, 93, 43, 0.35)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                                >
                                    Join as Student <ArrowRight size={16} />
                                </button>

                                <button
                                    onClick={() => navigate('/login/teacher')}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '14px 32px',
                                        borderRadius: '9999px',
                                        backgroundColor: '#8B5CF6',
                                        border: 'none',
                                        color: '#ffffff',
                                        fontWeight: '700',
                                        fontSize: '15px',
                                        cursor: 'pointer',
                                        boxShadow: '0 6px 18px rgba(139, 92, 246, 0.35)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                                >
                                    Join as Teacher <ArrowRight size={16} />
                                </button>

                                <button
                                    onClick={() => navigate('/login/recruiter')}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '14px 32px',
                                        borderRadius: '9999px',
                                        backgroundColor: '#0D9488',
                                        border: 'none',
                                        color: '#ffffff',
                                        fontWeight: '700',
                                        fontSize: '15px',
                                        cursor: 'pointer',
                                        boxShadow: '0 6px 18px rgba(13, 148, 136, 0.35)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                                >
                                    Join as Recruiter <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ==================== STATS COUNTER ROW ==================== */}
            <section style={{ padding: '0 0 90px', backgroundColor: '#ffffff' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #f1f5f9',
                        borderRadius: '32px',
                        padding: '40px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '24px',
                        textAlign: 'center'
                    }}>
                        {[
                            { icon: Users, stat: '50K+', label: 'Active Learners', color: '#EE5D2B' },
                            { icon: GraduationCap, stat: '1.2K+', label: 'Teachers', color: '#8B5CF6' },
                            { icon: Building2, stat: '500+', label: 'Institutions', color: '#D97706' },
                            { icon: Rocket, stat: '95%', label: 'Placement Success', color: '#0EA5E9' }
                        ].map((item, idx) => {
                            const IconComp = item.icon;
                            return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '52px',
                                        height: '52px',
                                        borderRadius: '16px',
                                        backgroundColor: '#F8FAFC',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: item.color
                                    }}>
                                        <IconComp size={28} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', lineHeight: '1' }}>
                                            {item.stat}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500', marginTop: '4px' }}>
                                            {item.label}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>


            {/* ==================== FOOTER ==================== */}
            <footer id="footer" style={{
                backgroundColor: '#FAFAFA',
                borderTop: '1px solid #f1f5f9',
                padding: '70px 0 32px'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
                        gap: '40px',
                        marginBottom: '60px'
                    }}>
                        {/* Col 1: Brand */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <img src="/logo-icon.png" alt="StudySpirit Logo" style={{ height: '36px', width: 'auto' }} />
                                <span style={{ fontSize: '22px', fontWeight: '900', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                                    <span style={{ color: '#D97706' }}>Study</span>
                                    <span style={{ color: '#0369A1' }}>Spirit</span>
                                </span>
                            </div>
                            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                                Learn Better. Achieve More.
                            </p>
                        </div>

                        {/* Col 2: Quick Links */}
                        <div>
                            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '18px' }}>
                                Quick Links
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {['Home', 'Courses', 'About', 'Contact'].map((item) => (
                                    <li key={item}>
                                        <button 
                                            onClick={() => scrollToSection(item.toLowerCase(), item)}
                                            style={{ background: 'none', border: 'none', padding: 0, fontSize: '14px', color: '#64748B', cursor: 'pointer', textAlign: 'left' }}
                                        >
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 3: Resources */}
                        <div>
                            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '18px' }}>
                                Resources
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { name: 'Study Notes', path: '/resources' },
                                    { name: 'Practice Quizzes', path: '/quiz' },
                                    { name: 'Coding Practice', path: '/codespirit' },
                                    { name: 'Career Guide', path: '/career' }
                                ].map((item) => (
                                    <li key={item.name}>
                                        <button 
                                            onClick={() => navigate(item.path)}
                                            style={{ background: 'none', border: 'none', padding: 0, fontSize: '14px', color: '#64748B', cursor: 'pointer', textAlign: 'left' }}
                                        >
                                            {item.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 4: Follow Us */}
                        <div>
                            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '18px' }}>
                                Follow Us
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: '700' }}>f</div>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: '700' }}>X</div>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E0F2FE', color: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: '700' }}>in</div>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: '700' }}>▶</div>
                            </div>
                        </div>

                        {/* Col 5: Newsletter */}
                        <div>
                            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
                                Subscribe to Our Newsletter
                            </h4>
                            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input 
                                    type="email" 
                                    placeholder="Your email"
                                    value={newsletterEmail}
                                    onChange={e => setNewsletterEmail(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 14px',
                                        borderRadius: '9999px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '13px',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: '9999px',
                                        backgroundColor: '#EE5D2B',
                                        border: 'none',
                                        color: '#ffffff',
                                        fontWeight: '700',
                                        fontSize: '13px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Subscribe
                                </button>
                            </form>
                            {subscribed ? (
                                <p style={{ fontSize: '12px', color: '#16A34A', margin: 0 }}>✓ Thanks for subscribing!</p>
                            ) : (
                                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Stay updated with latest courses & features.</p>
                            )}
                        </div>
                    </div>

                    <div style={{
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        color: '#94A3B8'
                    }}>
                        <div>
                            © 2024 StudySpirit. All rights reserved. | Built for Learners. Powered by AI.
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
                            <span>|</span>
                            <span style={{ cursor: 'pointer' }}>Terms of Use</span>
                        </div>
                    </div>
                </div>
            </footer>


            {/* ==================== LOGIN ROLE SELECTOR MODAL ==================== */}
            {showLoginModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '28px',
                        padding: '40px',
                        maxWidth: '520px',
                        width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowLoginModal(false)}
                            style={{
                                position: 'absolute',
                                top: '24px',
                                right: '24px',
                                background: '#f1f5f9',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#64748b'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <img src="/logo-icon.png" alt="StudySpirit" style={{ height: '48px', width: 'auto', marginBottom: '12px' }} />
                            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', margin: '0 0 6px 0' }}>
                                Welcome Back!
                            </h3>
                            <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
                                Select your role to access your portal
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <button
                                onClick={() => { setShowLoginModal(false); navigate('/login/student'); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    backgroundColor: '#FFF8F5',
                                    border: '1px solid #FFEDD5',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#EE5D2B'; e.currentTarget.style.backgroundColor = '#FFF0E8'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#FFEDD5'; e.currentTarget.style.backgroundColor = '#FFF8F5'; }}
                            >
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EE5D2B', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <GraduationCap size={22} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Student Portal</div>
                                    <div style={{ fontSize: '13px', color: '#64748B' }}>Access study tools, quizzes & AI mentor</div>
                                </div>
                                <ArrowRight size={18} style={{ color: '#EE5D2B' }} />
                            </button>

                            <button
                                onClick={() => { setShowLoginModal(false); navigate('/login/teacher'); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    backgroundColor: '#F5F3FF',
                                    border: '1px solid #DDD6FE',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.backgroundColor = '#EDE9FE'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDD6FE'; e.currentTarget.style.backgroundColor = '#F5F3FF'; }}
                            >
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#7C3AED', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Users size={22} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Teacher Portal</div>
                                    <div style={{ fontSize: '13px', color: '#64748B' }}>Manage classrooms, quizzes & students</div>
                                </div>
                                <ArrowRight size={18} style={{ color: '#7C3AED' }} />
                            </button>

                            <button
                                onClick={() => { setShowLoginModal(false); navigate('/login/recruiter'); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    backgroundColor: '#FEFCE8',
                                    border: '1px solid #FDE68A',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#D97706'; e.currentTarget.style.backgroundColor = '#FEF9C3'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#FDE68A'; e.currentTarget.style.backgroundColor = '#FEFCE8'; }}
                            >
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#D97706', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Briefcase size={22} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Recruiter Portal</div>
                                    <div style={{ fontSize: '13px', color: '#64748B' }}>Hire verified talent with Skill Passports</div>
                                </div>
                                <ArrowRight size={18} style={{ color: '#D97706' }} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
