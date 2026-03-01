import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [typedText, setTypedText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const [scrollY, setScrollY] = useState(0);

    const fullText = "Study the way you want, succeed the way you dream.";

    // Typing animation
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

    // Mouse parallax on hero image
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

    // Scroll parallax
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

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: '#f0e6cc', background: '#0d0b09' }}>

            {/* ========== HERO SECTION ========== */}
            <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* Background Image with Parallax */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    transform: `translateX(${mousePosition.x * 0.3}px) translateY(${mousePosition.y * 0.3 + scrollY * 0.4}px) scale(1.15)`,
                    transition: 'transform 0.6s cubic-bezier(0.2, 0, 0, 1)',
                    backgroundImage: `url('/study-desk.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                }} />

                {/* Multi-layer overlay: bottom dark fade + color tint */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(13,11,9,0.45) 0%, rgba(13,11,9,0.3) 40%, rgba(13,11,9,0.88) 75%, rgba(13,11,9,1) 100%)' }} />
                {/* Warm amber tint from the lamp */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(212,136,42,0.12) 0%, transparent 70%)' }} />
                {/* Top vignette */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(13,11,9,0.6) 0%, transparent 70%)' }} />

                {/* NAVBAR */}
                <nav style={{ position: 'relative', zIndex: 10, padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1400, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: 'linear-gradient(135deg, #d4882a, #c97d1a)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(212,136,42,0.4)',
                            fontSize: 20, fontWeight: 900
                        }}>📚</div>
                        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', color: '#f0e6cc' }}>
                            STUDY<span style={{ color: '#d4882a' }}>SPIRIT</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '10px 28px', borderRadius: 999,
                            background: 'rgba(212,136,42,0.12)',
                            border: '1px solid rgba(212,136,42,0.35)',
                            color: '#d4882a',
                            fontWeight: 700, fontSize: 13, letterSpacing: '0.12em',
                            cursor: 'pointer', textTransform: 'uppercase',
                            backdropFilter: 'blur(12px)',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,136,42,0.25)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(212,136,42,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,136,42,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        Login
                    </button>
                </nav>

                {/* HERO CONTENT */}
                <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px 120px', maxWidth: 900, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 18px', borderRadius: 999,
                        background: 'rgba(212,136,42,0.1)',
                        border: '1px solid rgba(212,136,42,0.3)',
                        marginBottom: 32, backdropFilter: 'blur(12px)',
                    }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#d4882a', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#d4882a', textTransform: 'uppercase' }}>Your Study Sanctuary</span>
                    </div>

                    {/* Main Title */}
                    <h1 style={{
                        fontSize: 'clamp(52px, 9vw, 100px)',
                        fontWeight: 900, lineHeight: 1,
                        letterSpacing: '-0.04em', marginBottom: 24,
                        textShadow: '0 4px 40px rgba(0,0,0,0.8)',
                    }}>
                        <span style={{ color: '#f0e6cc' }}>STUDY</span>
                        <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #d4882a 0%, #f0a030 40%, #c97d1a 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 30px rgba(212,136,42,0.4))',
                        }}>SPIRIT</span>
                    </h1>

                    {/* Typed Subtitle */}
                    <p style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', color: '#c4aa88', fontWeight: 300, lineHeight: 1.6, maxWidth: 580, marginBottom: 48, minHeight: 60 }}>
                        {typedText}
                        {showCursor && <span style={{ borderRight: '2px solid #d4882a', marginLeft: 2, animation: 'blink 1s step-end infinite' }}>&nbsp;</span>}
                    </p>

                    {/* CTAs */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '18px 44px', borderRadius: 999,
                                background: 'linear-gradient(135deg, #d4882a, #c97d1a)',
                                border: 'none', color: '#0d0b09',
                                fontWeight: 800, fontSize: 15, letterSpacing: '0.08em',
                                cursor: 'pointer', textTransform: 'uppercase',
                                boxShadow: '0 8px 30px rgba(212,136,42,0.45), 0 0 0 1px rgba(212,136,42,0.3)',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(212,136,42,0.6)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(212,136,42,0.45)'; }}
                        >
                            Start Journey →
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '18px 44px', borderRadius: 999,
                                background: 'rgba(240,230,204,0.06)',
                                border: '1px solid rgba(240,230,204,0.2)',
                                color: '#c4aa88',
                                fontWeight: 700, fontSize: 15, letterSpacing: '0.08em',
                                cursor: 'pointer', textTransform: 'uppercase',
                                backdropFilter: 'blur(12px)',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,136,42,0.4)'; e.currentTarget.style.color = '#d4882a'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(240,230,204,0.2)'; e.currentTarget.style.color = '#c4aa88'; }}
                        >
                            Explore Features
                        </button>
                    </div>

                    {/* Scroll hint */}
                    <div style={{ marginTop: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.4 }}>
                        <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, #d4882a)', animation: 'growLine 2s ease-in-out infinite' }} />
                        <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a89070' }}>Scroll</span>
                    </div>
                </div>
            </div>

            {/* ========== FEATURES SECTION ========== */}
            <div style={{ background: '#0d0b09', padding: '120px 24px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                    {/* Section header */}
                    <div style={{ textAlign: 'center', marginBottom: 80 }}>
                        <div style={{
                            display: 'inline-block', padding: '4px 16px', borderRadius: 4,
                            background: 'rgba(212,136,42,0.1)', border: '1px solid rgba(212,136,42,0.2)',
                            fontSize: 11, letterSpacing: '0.2em', color: '#d4882a', textTransform: 'uppercase',
                            marginBottom: 20
                        }}>Arsenal</div>
                        <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#f0e6cc', margin: '0 0 16px' }}>
                            THE ULTIMATE <span style={{ background: 'linear-gradient(135deg, #d4882a, #f0a030)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TOOLKIT</span>
                        </h2>
                        <p style={{ color: '#a89070', fontSize: 18, fontWeight: 300 }}>Everything you need to crush your learning goals.</p>
                    </div>

                    {/* Feature cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                        {features.map((f, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '32px',
                                    background: 'rgba(92,58,26,0.08)',
                                    border: '1px solid rgba(212,136,42,0.1)',
                                    borderRadius: 20,
                                    backdropFilter: 'blur(12px)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(212,136,42,0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(212,136,42,0.3)';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(92,58,26,0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(212,136,42,0.1)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Warm glow on hover accent */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #d4882a, transparent)', opacity: 0 }} className="card-top-line" />

                                <div style={{ fontSize: 40, marginBottom: 20 }}>{f.icon}</div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f0e6cc', marginBottom: 12, letterSpacing: '-0.01em' }}>{f.title}</h3>
                                <p style={{ fontSize: 15, color: '#a89070', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========== HOW IT WORKS SECTION ========== */}
            <div style={{ background: '#100e0b', padding: '120px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 80 }}>
                        <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#f0e6cc', margin: '0 0 16px' }}>
                            THE <span style={{ background: 'linear-gradient(135deg, #d4882a, #f0a030)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PATH</span>
                        </h2>
                        <p style={{ color: '#a89070', fontSize: 18, fontWeight: 300 }}>Three steps to mastery.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
                        {steps.map((step, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 48, flexDirection: i % 2 === 1 ? 'row-reverse' : 'row', flexWrap: 'wrap' }}>
                                {/* Big number */}
                                <div style={{
                                    fontSize: 'clamp(80px, 12vw, 140px)', fontWeight: 900,
                                    background: 'linear-gradient(180deg, rgba(212,136,42,0.15) 0%, transparent 100%)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    letterSpacing: '-0.05em', lineHeight: 1, minWidth: 160, textAlign: 'center',
                                    filter: 'drop-shadow(0 0 20px rgba(212,136,42,0.1))',
                                }}>{step.num}</div>

                                {/* Text */}
                                <div style={{ flex: 1, minWidth: 280 }}>
                                    <div style={{ width: 40, height: 3, background: 'linear-gradient(90deg, #d4882a, #c97d1a)', borderRadius: 99, marginBottom: 20 }} />
                                    <h3 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#f0e6cc', marginBottom: 16, letterSpacing: '-0.02em' }}>{step.title}</h3>
                                    <p style={{ fontSize: 18, color: '#a89070', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ========== CTA SECTION ========== */}
            <div style={{ background: '#0d0b09', padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
                {/* Subtle warm glow background */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,136,42,0.07), transparent)' }} />

                <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    {/* Image thumbnail above CTA */}
                    <div style={{
                        width: 80, height: 80, borderRadius: 24,
                        margin: '0 auto 32px',
                        background: 'linear-gradient(135deg, #d4882a, #5c3a1a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 36,
                        boxShadow: '0 0 40px rgba(212,136,42,0.3)',
                    }}>✨</div>

                    <h2 style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#f0e6cc', marginBottom: 24 }}>
                        READY TO<br />
                        <span style={{ background: 'linear-gradient(135deg, #d4882a, #f0a030)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LEVEL UP?</span>
                    </h2>
                    <p style={{ fontSize: 18, color: '#a89070', marginBottom: 48, fontWeight: 300 }}>
                        Join thousands of students turning late-night study sessions into their superpower.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '22px 60px', borderRadius: 999,
                            background: 'linear-gradient(135deg, #d4882a, #c97d1a)',
                            border: 'none', color: '#0d0b09',
                            fontWeight: 900, fontSize: 17, letterSpacing: '0.1em',
                            cursor: 'pointer', textTransform: 'uppercase',
                            boxShadow: '0 0 60px rgba(212,136,42,0.4)',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 80px rgba(212,136,42,0.6)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(212,136,42,0.4)'; }}
                    >
                        Join StudySpirit →
                    </button>
                </div>
            </div>

            {/* ========== FOOTER ========== */}
            <footer style={{ background: '#0a0807', borderTop: '1px solid rgba(212,136,42,0.08)', padding: '40px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#5c3a1a', letterSpacing: '0.05em' }}>
                    STUDY<span style={{ color: '#d4882a' }}>SPIRIT</span> © 2025
                </div>
                <div style={{ display: 'flex', gap: 32, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {['Privacy', 'Terms', 'GitHub'].map(link => (
                        <span key={link} style={{ color: '#5c3a1a', cursor: 'pointer', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#d4882a'}
                            onMouseLeave={e => e.currentTarget.style.color = '#5c3a1a'}
                        >{link}</span>
                    ))}
                </div>
            </footer>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
                @keyframes blink {
                    50% { border-color: transparent; }
                }
                @keyframes growLine {
                    0%, 100% { opacity: 0.4; transform: scaleY(1); }
                    50% { opacity: 0.8; transform: scaleY(1.2); }
                }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html { scroll-behavior: smooth; }
            `}</style>
        </div>
    );
}
