import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon, title, desc, index, hoveredCard, setHoveredCard }) => {
    return (
        <div
            className={`relative p-10 bg-[var(--bg-secondary)]lack/40 backdrop-blur-3xl rounded-3xl border transition-all duration-500 cursor-pointer min-h-[400px] flex flex-col items-center justify-center text-center overflow-hidden z-10
        ${hoveredCard === index
                    ? 'scale-105 -translate-y-3 border-cyan-500/50 shadow-[0_30px_80px_rgba(6,182,212,0.3)]'
                    : 'border-[var(--border-color)]'}`}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-transform duration-500 transform ${hoveredCard === index ? 'scale-x-100' : 'scale-x-0'}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

            <div className={`text-6xl mb-8 filter drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all duration-500 ${hoveredCard === index ? 'animate-bounce-slow' : ''}`}>
                {icon}
            </div>

            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider">{title}</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">{desc}</p>
        </div>
    );
};

export default function Landing() {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [ripples, setRipples] = useState([]);
    const [typedText, setTypedText] = useState('');
    const [showCursor, setShowCursor] = useState(true);

    const fullText = "Study the way you want, succeed the way you dream.";

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
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleButtonClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() };
        setRipples([...ripples, ripple]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== ripple.id)), 600);
        setTimeout(() => navigate('/login'), 300);
    };

    return (
        <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center overflow-hidden py-20 px-6 font-sans">
            {/* Dark Mode Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Glowing Orbs */}
            <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-cyan-600/20 blur-[150px] pointer-events-none" />
            <div className="absolute top-[40%] right-[30%] w-[250px] h-[250px] rounded-full bg-pink-600/10 blur-[100px] pointer-events-none" />

            {/* Navbar */}
            <nav className="absolute top-0 w-full z-50 p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 p-[2px]">
                        <div className="w-full h-full bg-[var(--bg-secondary)]lack rounded-xl flex items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" onError={(e) => { e.target.style.display = 'none'; }} />
                            {!document.querySelector('img[src="/logo.png"]')?.complete && (
                                <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">S</span>
                            )}
                        </div>
                    </div>
                    <div className="text-2xl font-black tracking-tight text-[var(--text-primary)] flex items-center">
                        STUDY<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">SPIRIT</span>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="group relative px-6 py-2 bg-transparent overflow-hidden rounded-full border border-zinc-800 hover:border-cyan-500/50 transition-all font-semibold tracking-wide"
                >
                    <div className="absolute inset-0 w-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 transition-all duration-[250ms] ease-out group-hover:w-full" />
                    <span className="relative z-10 text-zinc-300 group-hover:text-[var(--text-primary)] transition-colors">LOGIN</span>
                </button>
            </nav>

            {/* Floating Particles that follow mouse playfully */}
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

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl w-full flex flex-col items-center mt-24">

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md mb-8">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold tracking-[0.2em] text-cyan-300 uppercase">Next-Gen AI Platform</span>
                </div>

                <h1 className="text-6xl sm:text-8xl md:text-9xl font-black mb-6 text-center leading-none tracking-tighter">
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">STUDY</span>
                    <br className="md:hidden" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-gradient-x">SPIRIT</span>
                </h1>

                <p className="text-lg md:text-2xl text-[var(--text-secondary)] max-w-3xl mb-12 min-h-[60px] leading-relaxed text-center font-light">
                    {typedText}
                    {showCursor && <span className="animate-blink ml-1 border-r-2 border-cyan-400">&nbsp;</span>}
                </p>

                <div className="flex flex-col sm:flex-row gap-6">
                    <button
                        onClick={handleButtonClick}
                        className="group relative px-10 py-5 bg-white text-black rounded-full text-lg font-bold uppercase tracking-widest overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    >
                        {ripples.map(r => (
                            <span key={r.id} className="absolute bg-[var(--bg-secondary)]lack/10 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ripple"
                                style={{ left: r.x, top: r.y }} />
                        ))}
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            Start Journey
                            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-10 py-5 rounded-full border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50 backdrop-blur-md text-[var(--text-primary)] text-lg font-bold uppercase tracking-widest transition-all duration-300"
                    >
                        Explore Features
                    </button>
                </div>

                {/* Features Grid */}
                <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4">
                    <FeatureCard
                        index={0} icon="⚡" title="Hyper Productivity"
                        desc="Tools engineered for deep work. Block out noise, track progress, and conquer goals."
                        hoveredCard={hoveredCard} setHoveredCard={setHoveredCard}
                    />
                    <FeatureCard
                        index={1} icon="🧠" title="AI Mentorship"
                        desc="Personalized roadmaps and instant feedback from advanced AI designed to level you up."
                        hoveredCard={hoveredCard} setHoveredCard={setHoveredCard}
                    />
                    <FeatureCard
                        index={2} icon="🌐" title="Global Sync"
                        desc="Collaborate, compete, and connect in real-time with top learners around the world."
                        hoveredCard={hoveredCard} setHoveredCard={setHoveredCard}
                    />
                </div>

                {/* Elaborated Section */}
                <div className="mt-40 w-full flex flex-col items-center relative z-10 pt-20 border-t border-zinc-800/50">
                    <div className="text-center mb-20 max-w-4xl px-4">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-[var(--text-primary)]">
                            THE ULTIMATE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">ARSENAL</span>
                        </h2>
                        <p className="text-xl text-[var(--text-secondary)] font-light">Everything you need to crush your learning goals, wrapped in a beautiful, distraction-free environment.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4">
                        {[
                            { icon: '⚔️', title: 'Vs Mode', desc: 'Real-time coding battles. Rank up by proving your skills.' },
                            { icon: '🔥', title: 'Gamification', desc: 'Streaks, XP, and unlockable badges to keep you hooked on progress.' },
                            { icon: '🧘', title: 'Zen Mode', desc: 'Built-in wellness checks and focus timers to prevent burnout.' },
                            { icon: '📊', title: 'Analytics', desc: 'Deep insights into your habits. Know exactly where you stand.' },
                            { icon: '🤝', title: 'Community', desc: 'Join guilds, share resources, and study together in live audio rooms.' },
                            { icon: '🚀', title: 'Career Path', desc: 'Interview prep, resume building, and roadmap generation by AI.' }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group p-8 bg-[var(--glass-bg)] border border-zinc-800 rounded-3xl backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:bg-zinc-800/50"
                            >
                                <div className="text-4xl mb-4 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{feature.title}</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed font-light">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Steps Section */}
                <div className="mt-40 w-full max-w-6xl px-4">
                    <div className="space-y-32">
                        {[
                            { num: '01', title: 'Initialize Profile', desc: 'Set up your goals, sync your existing platforms (LeetCode, GitHub), and let our AI craft your custom curriculum.' },
                            { num: '02', title: 'Deep Work Protocol', desc: 'Enter our immersive Pomodoro sessions. Ambient soundscapes and hard notification blocks ensure absolute focus.' },
                            { num: '03', title: 'Ascension', desc: 'Crush daily quests, rise through the global leaderboards, and transform from a student to a master.' }
                        ].map((step, i) => (
                            <div key={i} className={`flex flex-col md:flex-row items-center gap-12 lg:gap-24 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="text-8xl md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-800 to-transparent select-none leading-none w-full md:w-1/2 text-center">
                                    {step.num}
                                </div>
                                <div className="w-full md:w-1/2 text-center md:text-left">
                                    <h3 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">{step.title}</h3>
                                    <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed font-light">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-40 mb-20 p-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-[3rem] w-full mx-4 max-w-[calc(100%-2rem)] md:max-w-6xl overflow-hidden group">
                    <div className="bg-[var(--bg-secondary)]lack p-12 md:p-24 rounded-[2.8rem] text-center w-full h-full relative overflow-hidden flex flex-col items-center justify-center">
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500 pointer-events-none" />
                        <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter text-[var(--text-primary)]">READY TO LEVEL UP?</h2>
                        <button onClick={() => navigate('/login')} className="px-12 py-5 bg-white text-black font-black text-xl md:text-2xl uppercase tracking-widest hover:scale-105 transition-all duration-300 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            Join StudySpirit
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <footer className="w-full border-t border-zinc-800/50 pt-16 pb-8 text-[var(--text-muted)] px-6 mt-20">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-[var(--text-primary)] bg-clip-text">STUDYSPIRIT © 2025</span>
                        </div>
                        <div className="flex gap-6 text-sm font-semibold uppercase tracking-widest">
                            <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">Privacy</span>
                            <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">Terms</span>
                            <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">Twitter</span>
                            <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">GitHub</span>
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
        .animate-bounce-slow { animation: bounce 4s infinite; }
        .animate-gradient-x { background-size: 200% 200%; border:0; animation: gradient-x 10s ease infinite; }
        @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes ripple { to { transform: translate(-50%, -50%) scale(4); opacity: 0; } }
        .animate-ripple { width: 100px; height: 100px; animation: ripple 0.6s linear; }
        .animate-blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { border-color: transparent; } }
      `}</style>
        </div>
    );
}
