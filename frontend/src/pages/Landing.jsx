import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [typedText, setTypedText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const [scrollY, setScrollY] = useState(0);
    const [isLight, setIsLight] = useState(false);

    const fullText = "Study the way you want, succeed the way you dream.";

    useEffect(() => {
        const checkTheme = () => setIsLight(document.documentElement.classList.contains('light'));
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        let index = 0;
        const typingInterval = setInterval(() => {
            if (index <= fullText.length) {
                setTypedText(fullText.slice(0, index));
                index++;
            } else {
                clearInterval(typingInterval);
                setShowCursor(false);
            }
        }, 40);
        return () => clearInterval(typingInterval);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 10,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: '📖', title: 'Solo Mode', desc: 'Focus sessions, Pomodoro, AI mentor & deep work tools.' },
        { icon: '👥', title: 'Group Mode', desc: 'Study in live rooms with real-time video, chat & sync.' },
        { icon: '🧠', title: 'AI Interview', desc: 'Practice mock interviews with Aria, your AI interviewer.' },
        { icon: '🏆', title: 'Gamification', desc: 'Earn XP, maintain streaks & climb the leaderboard.' },
        { icon: '💻', title: 'CodeSpirit', desc: 'Solve problems, run code live & level up your skills.' },
        { icon: '🚀', title: 'CareerSprint', desc: 'AI resume, job board & interview prep in one place.' },
    ];

    const steps = [
        { num: '01', title: 'Create Your Profile', desc: 'Set your goals, track your stack, and let AI personalize your learning path.' },
        { num: '02', title: 'Deep Work Protocol', desc: 'Enter Pomodoro sessions. Block distractions. Study with purpose.' },
        { num: '03', title: 'Rise & Ascend', desc: 'Track progress, earn badges, and go from student to master.' },
    ];

    // ========== THEME TOKENS (NO gradient-clip-text at all) ==========
    const dark = {
        pageBg: '#0d0b09',
        sectionBg2: '#111009',
        heroTitle: '#f5efe3',          // cream white for "STUDY"
        spiritColor: '#FF6B35',        // vibrant orange for "SPIRIT"  
        spiritGlow: '0 0 18px rgba(255,107,53,0.45)',
        accent: '#FF6B35',
        accentAlt: '#FFD700',
        sectionHighlight: '#FF6B35',   // headings highlight word color
        text: '#f0e6cc',
        subText: '#c4aa88',
        muted: '#8a7060',
        badgeBg: 'rgba(255,107,53,0.12)',
        badgeBorder: 'rgba(255,107,53,0.35)',
        badgeText: '#FF8C55',
        cardBg: 'rgba(30, 22, 14, 0.85)',
        cardBorder: 'rgba(255,107,53,0.12)',
        cardHoverBg: 'rgba(255,107,53,0.06)',
        cardHoverBorder: 'rgba(255,107,53,0.3)',
        cardTitle: '#f5efe3',
        cardText: '#8a7060',
        stepNumColor: 'rgba(255,107,53,0.12)',
        stepTitle: '#f5efe3',
        stepText: '#8a7060',
        accentLine: '#FF6B35',
        btnPrimary: { background: '#FF6B35', color: '#fff', shadow: '0 8px 30px rgba(255,107,53,0.4)' },
        btnSecondary: { background: 'rgba(255,255,255,0.05)', border: 'rgba(240,230,204,0.18)', color: '#c4aa88' },
        footerBg: '#0a0807',
        footerBorder: 'rgba(255,107,53,0.08)',
        footerText: '#5a4030',
        overlayBottom: 'linear-gradient(to bottom, rgba(13,11,9,0.4) 0%, rgba(13,11,9,0.2) 40%, rgba(13,11,9,0.9) 75%, #0d0b09 100%)',
        overlayLamp: 'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(255,140,60,0.1) 0%, transparent 70%)',
    };

    const light = {
        pageBg: '#faf7f2',
        sectionBg2: '#f0ebe1',
        heroTitle: '#1a1208',          // near-black for "STUDY"  
        spiritColor: '#d4520a',        // deep burnt orange on bright bg
        spiritGlow: 'none',
        accent: '#d4520a',
        accentAlt: '#b8820a',
        sectionHighlight: '#d4520a',
        text: '#1a1208',
        subText: '#4a3820',
        muted: '#7a6048',
        badgeBg: 'rgba(212,82,10,0.08)',
        badgeBorder: 'rgba(212,82,10,0.25)',
        badgeText: '#c04a08',
        cardBg: '#ffffff',
        cardBorder: 'rgba(212,82,10,0.1)',
        cardHoverBg: '#fff8f5',
        cardHoverBorder: 'rgba(212,82,10,0.3)',
        cardTitle: '#1a1208',
        cardText: '#7a6048',
        stepNumColor: 'rgba(212,82,10,0.1)',
        stepTitle: '#1a1208',
        stepText: '#7a6048',
        accentLine: '#d4520a',
        btnPrimary: { background: '#d4520a', color: '#fff', shadow: '0 8px 30px rgba(212,82,10,0.3)' },
        btnSecondary: { background: 'rgba(255,255,255,0.8)', border: 'rgba(212,82,10,0.2)', color: '#7a6048' },
        footerBg: '#ede8df',
        footerBorder: 'rgba(212,82,10,0.12)',
        footerText: '#a08060',
        overlayBottom: 'linear-gradient(to bottom, rgba(250,247,242,0.0) 0%, rgba(250,247,242,0.05) 45%, rgba(250,247,242,0.92) 78%, #faf7f2 100%)',
        overlayLamp: 'radial-gradient(ellipse 60% 55% at 18% 30%, rgba(255,190,100,0.3) 0%, transparent 70%)',
    };

    const t = isLight ? light : dark;

    const heroTitleStyle = {
        fontSize: 'clamp(52px, 9vw, 100px)',
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        marginBottom: 24,
        textShadow: isLight ? 'none' : '0 4px 40px rgba(0,0,0,0.9)',
    };

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
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                }} />

                {/* Gradient overlays */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: t.overlayBottom, transition: 'background 0.5s' }} />
                <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: t.overlayLamp, transition: 'background 0.5s' }} />

                {/* NAVBAR */}
                <nav style={{ position: 'relative', zIndex: 10, padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1400, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src="/logo.png" alt="StudySpirit Logo" style={{
                            width: 46, height: 46, borderRadius: 12, objectFit: 'cover',
                            boxShadow: `0 0 16px rgba(255,107,53,0.35)`,
                        }} />
                        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>
                            <span style={{ color: isLight ? '#1a1208' : '#f5efe3' }}>STUDY</span>
                            <span style={{
                                color: t.spiritColor,
                                textShadow: !isLight ? '0 0 12px rgba(255,107,53,0.4)' : 'none',
                            }}>SPIRIT</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '10px 28px', borderRadius: 999,
                            background: t.badgeBg, border: `1px solid ${t.badgeBorder}`,
                            color: t.badgeText, fontWeight: 700, fontSize: 13, letterSpacing: '0.12em',
                            cursor: 'pointer', textTransform: 'uppercase', backdropFilter: 'blur(12px)',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = `rgba(255,107,53,0.22)`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = t.badgeBg; }}
                    >Login</button>
                </nav>

                {/* HERO CONTENT */}
                <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px 120px', maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

                    {/* Live badge */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 999, background: t.badgeBg, border: `1px solid ${t.badgeBorder}`, marginBottom: 32, backdropFilter: 'blur(12px)' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.accent, animation: 'blink 2s infinite' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: t.badgeText, textTransform: 'uppercase' }}>Your Study Sanctuary</span>
                    </div>

                    {/* Hero title — NO gradient clip, just solid colors */}
                    <h1 style={heroTitleStyle}>
                        <span style={{ color: t.heroTitle, display: 'block' }}>STUDY</span>
                        <span style={{
                            color: t.spiritColor,
                            display: 'block',
                            textShadow: t.spiritGlow,
                        }}>SPIRIT</span>
                    </h1>

                    {/* Typed subtitle */}
                    <p style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', color: t.subText, fontWeight: 300, lineHeight: 1.6, maxWidth: 580, marginBottom: 48, minHeight: 60 }}>
                        {typedText}
                        {showCursor && <span style={{ borderRight: `2px solid ${t.accent}`, marginLeft: 2, animation: 'blink 1s infinite' }}>&nbsp;</span>}
                    </p>

                    {/* CTAs */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '18px 44px', borderRadius: 999,
                                background: t.btnPrimary.background, border: 'none', color: t.btnPrimary.color,
                                fontWeight: 800, fontSize: 15, letterSpacing: '0.08em',
                                cursor: 'pointer', textTransform: 'uppercase',
                                boxShadow: t.btnPrimary.shadow, transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'none'; }}
                        >Start Journey →</button>

                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '18px 44px', borderRadius: 999,
                                background: t.btnSecondary.background, border: `1px solid ${t.btnSecondary.border}`,
                                color: t.btnSecondary.color, fontWeight: 700, fontSize: 15, letterSpacing: '0.08em',
                                cursor: 'pointer', textTransform: 'uppercase', backdropFilter: 'blur(12px)',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = t.badgeBorder; e.currentTarget.style.color = t.accent; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.btnSecondary.border; e.currentTarget.style.color = t.btnSecondary.color; }}
                        >Explore Features</button>
                    </div>

                    {/* Scroll hint */}
                    <div style={{ marginTop: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.4 }}>
                        <div style={{ width: 1, height: 48, background: `linear-gradient(to bottom, transparent, ${t.accent})`, animation: 'growLine 2s ease-in-out infinite' }} />
                        <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.muted }}>Scroll</span>
                    </div>
                </div>
            </div>

            {/* ========== FEATURES ========== */}
            <div style={{ background: t.pageBg, padding: '120px 24px', transition: 'background 0.5s' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 80 }}>
                        <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 4, background: t.badgeBg, border: `1px solid ${t.badgeBorder}`, fontSize: 11, letterSpacing: '0.2em', color: t.badgeText, textTransform: 'uppercase', marginBottom: 20 }}>
                            Arsenal
                        </div>
                        <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
                            <span style={{ color: t.text }}>THE ULTIMATE </span>
                            {/* solid color, NOT gradient clip */}
                            <span style={{ color: t.sectionHighlight }}>TOOLKIT</span>
                        </h2>
                        <p style={{ color: t.muted, fontSize: 18, fontWeight: 300 }}>Everything you need to crush your learning goals.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                        {features.map((f, i) => (
                            <div key={i}
                                style={{ padding: '32px', background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20, backdropFilter: 'blur(12px)', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.background = t.cardHoverBg; e.currentTarget.style.borderColor = t.cardHoverBorder; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isLight ? '0 12px 32px rgba(212,82,10,0.1)' : '0 20px 40px rgba(0,0,0,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = t.cardBg; e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none'; }}
                            >
                                <div style={{ fontSize: 40, marginBottom: 20 }}>{f.icon}</div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: t.cardTitle, marginBottom: 12 }}>{f.title}</h3>
                                <p style={{ fontSize: 15, color: t.cardText, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========== THE PATH ========== */}
            <div style={{ background: t.sectionBg2, padding: '120px 24px', transition: 'background 0.5s' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 80 }}>
                        <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
                            <span style={{ color: t.text }}>THE </span>
                            <span style={{ color: t.sectionHighlight }}>PATH</span>
                        </h2>
                        <p style={{ color: t.muted, fontSize: 18, fontWeight: 300 }}>Three steps to mastery.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
                        {steps.map((step, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 48, flexDirection: i % 2 === 1 ? 'row-reverse' : 'row', flexWrap: 'wrap' }}>
                                {/* Big number — solid color, no clip */}
                                <div style={{
                                    fontSize: 'clamp(80px, 12vw, 140px)', fontWeight: 900,
                                    color: t.stepNumColor,
                                    letterSpacing: '-0.05em', lineHeight: 1, minWidth: 160, textAlign: 'center',
                                    WebkitTextStroke: `2px ${isLight ? 'rgba(212,82,10,0.15)' : 'rgba(255,107,53,0.15)'}`,
                                }}>{step.num}</div>
                                <div style={{ flex: 1, minWidth: 280 }}>
                                    <div style={{ width: 40, height: 3, background: t.accentLine, borderRadius: 99, marginBottom: 20 }} />
                                    <h3 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: t.stepTitle, marginBottom: 16, letterSpacing: '-0.02em' }}>{step.title}</h3>
                                    <p style={{ fontSize: 18, color: t.stepText, lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========== CTA ========== */}
            <div style={{ background: t.pageBg, padding: '100px 24px', position: 'relative', overflow: 'hidden', transition: 'background 0.5s' }}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${isLight ? 'rgba(212,82,10,0.05)' : 'rgba(255,107,53,0.06)'}, transparent)` }} />
                <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                        <img src="/logo.png" alt="StudySpirit" style={{ width: 80, height: 80, borderRadius: 24, objectFit: 'cover', boxShadow: `0 0 40px rgba(255,107,53,0.3)` }} />
                    </div>

                    <h2 style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 24 }}>
                        <span style={{ color: t.text }}>READY TO</span>
                        <br />
                        <span style={{ color: t.sectionHighlight }}>LEVEL UP?</span>
                    </h2>
                    <p style={{ fontSize: 18, color: t.muted, marginBottom: 48, fontWeight: 300 }}>
                        Join thousands of students turning late-night study sessions into their superpower.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '22px 60px', borderRadius: 999, background: t.btnPrimary.background,
                            border: 'none', color: '#fff', fontWeight: 900, fontSize: 17, letterSpacing: '0.1em',
                            cursor: 'pointer', textTransform: 'uppercase', boxShadow: t.btnPrimary.shadow,
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'none'; }}
                    >Join StudySpirit →</button>
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
                @keyframes growLine { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html { scroll-behavior: smooth; }
            `}</style>
        </div>
    );
}
