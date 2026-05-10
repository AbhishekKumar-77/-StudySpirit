import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
    const navigate = useNavigate();
    const [typedText, setTypedText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const [scrollY, setScrollY] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isLight, setIsLight] = useState(false);

    const fullText = "Study the way you want, succeed the way you dream.";

    useEffect(() => {
        const check = () => setIsLight(document.documentElement.classList.contains('light'));
        check();
        const obs = new MutationObserver(check);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        let i = 0;
        const t = setInterval(() => {
            if (i <= fullText.length) { setTypedText(fullText.slice(0, i)); i++; }
            else { clearInterval(t); setShowCursor(false); }
        }, 40);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const mm = (e) => setMousePosition({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 10 });
        window.addEventListener('mousemove', mm);
        return () => window.removeEventListener('mousemove', mm);
    }, []);

    useEffect(() => {
        const s = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', s);
        return () => window.removeEventListener('scroll', s);
    }, []);

    const dark = {
        pageBg: '#0d0b09', sectionBg2: '#111009', heroTitle: '#f5efe3', spiritColor: '#FF6B35',
        spiritGlow: '0 0 18px rgba(255,107,53,0.45)', accent: '#FF6B35', accentAlt: '#FFD700',
        sectionHighlight: '#FF6B35', text: '#f0e6cc', subText: '#c4aa88', muted: '#8a7060',
        badgeBg: 'rgba(255,107,53,0.12)', badgeBorder: 'rgba(255,107,53,0.35)', badgeText: '#FF8C55',
        cardBg: 'rgba(30, 22, 14, 0.85)', cardBorder: 'rgba(255,107,53,0.12)',
        cardHoverBg: 'rgba(255,107,53,0.06)', cardHoverBorder: 'rgba(255,107,53,0.3)',
        cardTitle: '#f5efe3', cardText: '#8a7060', stepNumColor: 'rgba(255,107,53,0.12)',
        stepTitle: '#f5efe3', stepText: '#8a7060', accentLine: '#FF6B35',
        btnPrimary: { background: '#FF6B35', color: '#fff', shadow: '0 8px 30px rgba(255,107,53,0.4)' },
        btnSecondary: { background: 'rgba(255,255,255,0.05)', border: 'rgba(240,230,204,0.18)', color: '#c4aa88' },
        footerBg: '#0a0807', footerBorder: 'rgba(255,107,53,0.08)', footerText: '#5a4030',
        overlayBottom: 'linear-gradient(to bottom, rgba(13,11,9,0.4) 0%, rgba(13,11,9,0.2) 40%, rgba(13,11,9,0.9) 75%, #0d0b09 100%)',
        overlayLamp: 'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(255,140,60,0.1) 0%, transparent 70%)',
    };

    const light = {
        pageBg: '#faf7f2', sectionBg2: '#f0ebe1', heroTitle: '#1a1208', spiritColor: '#d4520a',
        spiritGlow: 'none', accent: '#d4520a', accentAlt: '#b8820a', sectionHighlight: '#d4520a',
        text: '#1a1208', subText: '#4a3820', muted: '#7a6048',
        badgeBg: 'rgba(212,82,10,0.08)', badgeBorder: 'rgba(212,82,10,0.25)', badgeText: '#c04a08',
        cardBg: '#ffffff', cardBorder: 'rgba(212,82,10,0.1)',
        cardHoverBg: '#fff8f5', cardHoverBorder: 'rgba(212,82,10,0.3)',
        cardTitle: '#1a1208', cardText: '#7a6048', stepNumColor: 'rgba(212,82,10,0.1)',
        stepTitle: '#1a1208', stepText: '#7a6048', accentLine: '#d4520a',
        btnPrimary: { background: '#d4520a', color: '#fff', shadow: '0 8px 30px rgba(212,82,10,0.3)' },
        btnSecondary: { background: 'rgba(255,255,255,0.8)', border: 'rgba(212,82,10,0.2)', color: '#7a6048' },
        footerBg: '#ede8df', footerBorder: 'rgba(212,82,10,0.12)', footerText: '#a08060',
        overlayBottom: 'linear-gradient(to bottom, rgba(250,247,242,0.0) 0%, rgba(250,247,242,0.05) 45%, rgba(250,247,242,0.92) 78%, #faf7f2 100%)',
        overlayLamp: 'radial-gradient(ellipse 60% 55% at 18% 30%, rgba(255,190,100,0.3) 0%, transparent 70%)',
    };

    const t = isLight ? light : dark;

    // Role cards config
    const roleCards = [
        {
            role: 'student',
            emoji: '📚',
            title: 'I\'m a Student',
            subtitle: 'Access learning tools, quizzes, AI practice & more',
            features: ['Solo & Group Study Modes', 'AI Practice Arena', 'Career & Interview Prep', 'Coding Challenges'],
            color: '#FF6B35',
            glow: 'rgba(255,107,53,0.2)',
            borderHover: 'rgba(255,107,53,0.5)',
        },
        {
            role: 'teacher',
            emoji: '🎓',
            title: 'I\'m a Teacher',
            subtitle: 'Create quizzes, track students & manage exams',
            features: ['Create AI-Powered Quizzes', 'Real-time Exam Management', 'Student Leaderboard', 'Performance Analytics'],
            color: '#7C3AED',
            glow: 'rgba(124,58,237,0.2)',
            borderHover: 'rgba(124,58,237,0.5)',
        },
        {
            role: 'recruiter',
            emoji: '💼',
            title: 'I\'m a Recruiter',
            subtitle: 'Hire top talent with verified Skill Passports',
            features: ['AI Reverse Matching', 'Verified Skill Badges', 'Campus Drive Management', 'One-Click Apply Pipeline'],
            color: '#06b6d4',
            glow: 'rgba(6,182,212,0.2)',
            borderHover: 'rgba(6,182,212,0.5)',
        },
    ];

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: t.text, background: t.pageBg, transition: 'background 0.5s, color 0.5s' }}>

            {/* ========== HERO ========== */}
            <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* Background photo */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    transform: `translateX(${mousePosition.x * 0.3}px) translateY(${mousePosition.y * 0.3 + scrollY * 0.4}px) scale(1.15)`,
                    transition: 'transform 0.6s cubic-bezier(0.2, 0, 0, 1)',
                    backgroundImage: `url('/study-desk.jpg')`,
                    backgroundSize: 'cover', backgroundPosition: 'center top',
                }} />
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: t.overlayBottom, transition: 'background 0.5s' }} />
                <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: t.overlayLamp, transition: 'background 0.5s' }} />

                {/* NAVBAR */}
                <nav style={{ position: 'relative', zIndex: 10, padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1400, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src="/logo.png" alt="StudySpirit Logo" style={{ width: 46, height: 46, borderRadius: 12, objectFit: 'cover', boxShadow: `0 0 16px rgba(255,107,53,0.35)` }} />
                        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>
                            <span style={{ color: isLight ? '#1a1208' : '#f5efe3' }}>STUDY</span>
                            <span style={{ color: t.spiritColor, textShadow: !isLight ? '0 0 12px rgba(255,107,53,0.4)' : 'none' }}>SPIRIT</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={() => navigate('/login/student')}
                            style={{ padding: '10px 24px', borderRadius: 999, background: t.badgeBg, border: `1px solid ${t.badgeBorder}`, color: t.badgeText, fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', cursor: 'pointer', textTransform: 'uppercase', backdropFilter: 'blur(12px)', transition: 'all 0.3s ease' }}
                        >Student Login</button>
                        <button
                            onClick={() => navigate('/login/teacher')}
                            style={{ padding: '10px 24px', borderRadius: 999, background: 'rgba(124,58,237,0.15)', border: `1px solid rgba(124,58,237,0.35)`, color: '#a78bfa', fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', cursor: 'pointer', textTransform: 'uppercase', backdropFilter: 'blur(12px)', transition: 'all 0.3s ease' }}
                        >Teacher</button>
                        <button
                            onClick={() => navigate('/login/recruiter')}
                            style={{ padding: '10px 24px', borderRadius: 999, background: 'rgba(6,182,212,0.15)', border: `1px solid rgba(6,182,212,0.35)`, color: '#67e8f9', fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', cursor: 'pointer', textTransform: 'uppercase', backdropFilter: 'blur(12px)', transition: 'all 0.3s ease' }}
                        >Recruiter</button>
                    </div>
                </nav>

                {/* HERO CONTENT */}
                <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px 80px', maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 999, background: t.badgeBg, border: `1px solid ${t.badgeBorder}`, marginBottom: 32, backdropFilter: 'blur(12px)' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.accent, animation: 'blink 2s infinite' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: t.badgeText, textTransform: 'uppercase' }}>Your Study Sanctuary</span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(52px, 9vw, 100px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 24, textShadow: isLight ? 'none' : '0 4px 40px rgba(0,0,0,0.9)' }}>
                        <span style={{ color: t.heroTitle, display: 'block' }}>STUDY</span>
                        <span style={{ color: t.spiritColor, display: 'block', textShadow: t.spiritGlow }}>SPIRIT</span>
                    </h1>

                    <p style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', color: t.subText, fontWeight: 300, lineHeight: 1.6, maxWidth: 580, marginBottom: 48, minHeight: 60 }}>
                        {typedText}
                        {showCursor && <span style={{ borderRight: `2px solid ${t.accent}`, marginLeft: 2, animation: 'blink 1s infinite' }}>&nbsp;</span>}
                    </p>

                    {/* Scroll hint */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.5 }}>
                        <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, transparent, ${t.accent})` }} />
                        <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.muted }}>Choose your role</span>
                    </div>
                </div>
            </div>

            {/* ========== ROLE SELECTION ========== */}
            <div style={{ background: t.pageBg, padding: '100px 24px', transition: 'background 0.5s' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 4, background: t.badgeBg, border: `1px solid ${t.badgeBorder}`, fontSize: 11, letterSpacing: '0.2em', color: t.badgeText, textTransform: 'uppercase', marginBottom: 20 }}>
                            Get Started
                        </div>
                        <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px', color: t.text }}>
                            WHO ARE <span style={{ color: t.sectionHighlight }}>YOU?</span>
                        </h2>
                        <p style={{ color: t.muted, fontSize: 18, fontWeight: 300 }}>Select your role to get the right experience.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
                        {roleCards.map((card) => (
                            <RoleCard key={card.role} card={card} t={t} isLight={isLight} onNavigate={navigate} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ========== FEATURES ========== */}
            <div style={{ background: t.sectionBg2, padding: '100px 24px', transition: 'background 0.5s' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px', color: t.text }}>
                            THE ULTIMATE <span style={{ color: t.sectionHighlight }}>TOOLKIT</span>
                        </h2>
                        <p style={{ color: t.muted, fontSize: 18, fontWeight: 300 }}>Everything you need to crush your learning goals.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                        {[
                            { icon: '📖', title: 'Solo Mode', desc: 'Focus sessions, Pomodoro, AI mentor & deep work tools.' },
                            { icon: '👥', title: 'Group Mode', desc: 'Study in live rooms with real-time video, chat & sync.' },
                            { icon: '🧠', title: 'AI Interview', desc: 'Practice mock interviews with Aria, your AI interviewer.' },
                            { icon: '🏆', title: 'Gamification', desc: 'Earn XP, maintain streaks & climb the leaderboard.' },
                            { icon: '💻', title: 'CodeSpirit', desc: 'Solve problems, run code live & level up your skills.' },
                            { icon: '🚀', title: 'CareerSprint', desc: 'AI resume, job board & interview prep in one place.' },
                        ].map((f, i) => (
                            <div key={i}
                                style={{ padding: '32px', background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20, backdropFilter: 'blur(12px)', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.background = t.cardHoverBg; e.currentTarget.style.borderColor = t.cardHoverBorder; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = t.cardBg; e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.transform = 'none'; }}
                            >
                                <div style={{ fontSize: 40, marginBottom: 20 }}>{f.icon}</div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: t.cardTitle, marginBottom: 12 }}>{f.title}</h3>
                                <p style={{ fontSize: 15, color: t.cardText, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========== CTA ========== */}
            <div style={{ background: t.pageBg, padding: '100px 24px', textAlign: 'center', transition: 'background 0.5s' }}>
                <div style={{ maxWidth: 820, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 24 }}>
                        <span style={{ color: t.text }}>READY TO</span><br />
                        <span style={{ color: t.sectionHighlight }}>LEVEL UP?</span>
                    </h2>
                    <p style={{ fontSize: 18, color: t.muted, marginBottom: 48, fontWeight: 300 }}>
                        Join thousands of students turning late-night study sessions into their superpower.
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/login/student')}
                            style={{ padding: '18px 44px', borderRadius: 999, background: t.btnPrimary.background, border: 'none', color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '0.08em', cursor: 'pointer', textTransform: 'uppercase', boxShadow: t.btnPrimary.shadow, transition: 'all 0.3s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >Join as Student →</button>
                        <button
                            onClick={() => navigate('/login/teacher')}
                            style={{ padding: '18px 44px', borderRadius: 999, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', color: '#a78bfa', fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.3s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >Join as Teacher →</button>
                        <button
                            onClick={() => navigate('/login/recruiter')}
                            style={{ padding: '18px 44px', borderRadius: 999, background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.35)', color: '#67e8f9', fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.3s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >Join as Recruiter →</button>
                    </div>
                </div>
            </div>

            {/* ========== FOOTER ========== */}
            <footer style={{ background: t.footerBg, borderTop: `1px solid ${t.footerBorder}`, padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, transition: 'background 0.5s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src="/logo.png" alt="Logo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                    <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: '0.05em' }}>
                        <span style={{ color: t.footerText }}>STUDY</span>
                        <span style={{ color: t.accent }}>SPIRIT</span>
                        <span style={{ color: t.footerText }}> © 2025</span>
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 32, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {['Privacy', 'Terms', 'GitHub'].map(link => (
                        <span key={link} style={{ color: t.footerText, cursor: 'pointer', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = t.accent}
                            onMouseLeave={e => e.currentTarget.style.color = t.footerText}
                        >{link}</span>
                    ))}
                </div>
            </footer>

            <style>{`
                @keyframes blink { 50% { opacity: 0; } }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html { scroll-behavior: smooth; }
            `}</style>
        </div>
    );
}

// ── Role Card Sub-Component ──────────────────────────────────────
function RoleCard({ card, t, isLight, onNavigate }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onClick={() => onNavigate(`/login/${card.role}`)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: '40px', borderRadius: 24, cursor: 'pointer',
                background: hovered ? `${card.glow}` : t.cardBg,
                border: `2px solid ${hovered ? card.borderHover : t.cardBorder}`,
                boxShadow: hovered ? `0 20px 60px ${card.glow}` : (isLight ? '0 2px 16px rgba(0,0,0,0.05)' : 'none'),
                transform: hovered ? 'translateY(-6px)' : 'none',
                transition: 'all 0.3s ease',
            }}
        >
            <div style={{ fontSize: 56, marginBottom: 20 }}>{card.emoji}</div>
            <h3 style={{ fontSize: 28, fontWeight: 900, color: hovered ? card.color : t.cardTitle, marginBottom: 10, transition: 'color 0.3s' }}>{card.title}</h3>
            <p style={{ fontSize: 15, color: t.cardText, marginBottom: 24, lineHeight: 1.6 }}>{card.subtitle}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {card.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: t.cardText }}>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>
                        </span>
                        {f}
                    </li>
                ))}
            </ul>
            <div style={{
                width: '100%', padding: '14px 24px', borderRadius: 999, textAlign: 'center',
                background: card.color, color: '#fff', fontWeight: 800, fontSize: 14,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                boxShadow: hovered ? `0 8px 24px ${card.glow}` : 'none',
                transition: 'all 0.3s ease',
            }}>
                Get Started →
            </div>
        </div>
    );
}
