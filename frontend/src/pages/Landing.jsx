import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon, title, desc, index, hoveredCard, setHoveredCard }) => {
    return (
        <div
            className={`relative p-10 bg-white/40 backdrop-blur-3xl rounded-3xl border transition-all duration-500 cursor-pointer min-h-[400px] flex flex-col items-center justify-center text-center overflow-hidden
        ${hoveredCard === index
                    ? 'scale-105 -translate-y-3 border-[#80A1BA] shadow-[0_30px_80px_rgba(128,161,186,0.5)]'
                    : 'border-white/50'}`}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#80A1BA] to-transparent transition-transform duration-500 transform ${hoveredCard === index ? 'scale-x-100' : 'scale-x-0'}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

            <div className="text-6xl mb-8 filter drop-shadow-[0_0_20px_rgba(145,196,195,0.8)] animate-bounce-slow">
                {icon}
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-4 uppercase tracking-wider">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
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
        }, 30);
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
        <div className="relative min-h-screen bg-[#FFF7DD] text-gray-800 flex flex-col items-center justify-center overflow-hidden py-20 px-6 font-sans">
            {/* Background Blobs */}
            <div className="absolute -top-[15%] -left-[10%] w-[400px] h-[400px] md:w-[700px] md:h-[700px] rounded-full bg-[#80A1BA]/40 blur-[100px] animate-float-dynamic opacity-60 pointer-events-none" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full bg-[#91C4C3]/40 blur-[120px] animate-float-dynamic opacity-50 pointer-events-none rev" />
            <div className="absolute top-1/3 right-[5%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full bg-[#B4DEBD]/40 blur-[100px] animate-pulse-custom pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(128, 161, 186, 0.2) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            {/* Navbar */}
            <nav className="absolute top-0 left-0 w-full z-50 p-4 md:p-6 flex justify-between items-center max-w-[1400px] mx-auto right-0">
                <div className="flex items-center gap-2 md:gap-3">
                    <img src="/logo.png" alt="StudySpirit Logo" className="w-8 h-8 md:w-12 md:h-12 drop-shadow-[0_0_15px_rgba(128,161,186,0.5)]" />
                    <div className="text-xl md:text-2xl font-black italic tracking-tighter bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] bg-clip-text text-transparent">
                        STUDYSPIRIT
                    </div>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-1.5 md:px-6 md:py-2 bg-[#80A1BA]/20 hover:bg-[#80A1BA]/30 border border-[#80A1BA]/20 rounded-full backdrop-blur-md transition-all font-bold text-xs md:text-sm tracking-wide text-gray-800"
                >
                    LOGIN
                </button>
            </nav>

            {/* Floating Particles */}
            {[...Array(15)].map((_, i) => (
                <div
                    key={`p-${i}`}
                    className="absolute rounded-full pointer-events-none blur-[1px]"
                    style={{
                        width: `${Math.random() * 6 + 2}px`,
                        height: `${Math.random() * 6 + 2}px`,
                        background: ['#80A1BA', '#91C4C3', '#B4DEBD'][i % 3],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        transform: `translate(${(mousePosition.x - 50) * (i * 0.05)}px, ${(mousePosition.y - 50) * (i * 0.05)}px)`,
                        transition: 'transform 0.5s cubic-bezier(0.1, 0, 0.2, 1)',
                        boxShadow: `0 0 15px ${['#80A1BA', '#91C4C3', '#B4DEBD'][i % 3]}`,
                        opacity: 0.6
                    }}
                />
            ))}

            {/* Hero Content */}
            <div className="relative z-10 max-w-7xl w-full flex flex-col items-center mt-10">

                {/* TAGLINE WITH ICON - FROM USER CODE */}
                <div className="flex items-center justify-center gap-2 md:gap-4 mb-6 md:mb-10 group cursor-default text-center px-2">
                    <span className="text-xl md:text-3xl animate-spin-slow text-[#B4DEBD] hidden sm:inline-block">⚡</span>
                    <div className="text-[10px] sm:text-xs md:text-base font-black tracking-[0.2em] md:tracking-[0.3em] text-[#80A1BA] uppercase drop-shadow-[0_0_10px_rgba(128,161,186,0.5)]">
                        AI-POWERED LEARNING PLATFORM
                    </div>
                    <span className="text-xl md:text-3xl animate-spin-slow rev text-[#B4DEBD] hidden sm:inline-block">⚡</span>
                </div>

                <h1 className="text-5xl sm:text-7xl md:text-9xl font-black mb-4 md:mb-6 animate-title-3d italic tracking-tighter bg-gradient-to-br from-[#80A1BA] via-[#91C4C3] to-[#B4DEBD] bg-clip-text text-transparent text-center px-4">
                    STUDYSPIRIT
                </h1>

                <p className="text-base sm:text-lg md:text-2xl text-gray-600 max-w-2xl mb-8 md:mb-12 min-h-[60px] leading-relaxed text-center px-4 font-medium">
                    {typedText}
                    {showCursor && <span className="animate-blink ml-1 border-r-2 border-[#80A1BA]">&nbsp;</span>}
                </p>

                <button
                    onClick={handleButtonClick}
                    className="group relative px-8 py-4 md:px-12 md:py-5 bg-gradient-to-r from-[#80A1BA] via-[#91C4C3] to-[#B4DEBD] rounded-full text-lg md:text-xl font-bold uppercase tracking-widest overflow-hidden transition-all duration-500 hover:scale-110 hover:shadow-[0_0_40px_rgba(145,196,195,0.7)] active:scale-95 text-white"
                >
                    {ripples.map(r => (
                        <span key={r.id} className="absolute bg-white/40 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ripple"
                            style={{ left: r.x, top: r.y }} />
                    ))}
                    <span className="relative z-10 flex items-center justify-center gap-2 md:gap-3 text-white">
                        Get Started
                        <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </span>
                </button>

                {/* Feature Stats Cards - EXACT CONTENT FROM USER CODE */}
                <div className="mt-20 md:mt-40 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 w-full px-4">
                    <FeatureCard
                        index={0} icon="🚀" title="17+ Powerful Features"
                        desc="Complete learning ecosystem with AI mentorship and smart tracking."
                        hoveredCard={hoveredCard} setHoveredCard={setHoveredCard}
                    />
                    <FeatureCard
                        index={1} icon="🤖" title="AI Powered Learning"
                        desc="Smart recommendations & personalized insights tailored to your unique study patterns."
                        hoveredCard={hoveredCard} setHoveredCard={setHoveredCard}
                    />
                    <FeatureCard
                        index={2} icon="👥" title="24/7 Active Community"
                        desc="Connect, collaborate & grow together with thousands of students world wide."
                        hoveredCard={hoveredCard} setHoveredCard={setHoveredCard}
                    />
                </div>

                {/* ==================== WHY CHOOSE SECTION ==================== */}
                <div className="mt-20 md:mt-40 w-full flex flex-col items-center relative z-10 px-4">
                    <h2 className="text-3xl md:text-6xl font-black text-center mb-10 md:mb-20 italic bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] bg-clip-text text-transparent">
                        WHY CHOOSE STUDYSPIRIT?
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
                        {[
                            { icon: '🧠', title: 'AI Mentorship', desc: 'Get instant feedback on your code and personalized study plans tailored to your goals.' },
                            { icon: '⚔️', title: 'Solo & Vs Mode', desc: 'Practice alone or challenge friends in real-time coding battles to rank up.' },
                            { icon: '🔥', title: 'Gamified Growth', desc: 'Earn XP, maintain streaks, and unlock achievements as you master new skills.' },
                            { icon: '🧘', title: 'Wellness First', desc: 'Integrated breathing exercises and mood tracking to prevent burnout.' },
                            { icon: '📊', title: 'Unified Dashboard', desc: 'Track your progress across LeetCode, HackerRank, and more in one place.' },
                            { icon: '🤝', title: 'Community', desc: 'Join a thriving community of developers sharing resources and opportunities.' }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group relative p-8 bg-white/40 border border-[#80A1BA]/20 rounded-[2rem] backdrop-blur-md transition-all duration-500 hover:border-[#80A1BA]/80 hover:bg-white/60 hover:-translate-y-2"
                            >
                                <div className="text-5xl mb-6 drop-shadow-md">{feature.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4 italic uppercase">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How it Works Expanded */}
                <section className="mt-20 md:mt-40 w-full max-w-5xl px-4">
                    <h2 className="text-3xl md:text-6xl font-bold text-center mb-12 md:mb-24 italic text-gray-800">3 STEPS TO MASTER ANY SKILL</h2>
                    <div className="space-y-20 md:space-y-32">
                        {[
                            { num: '01', title: 'Connect Your Soul', desc: 'Sync your calendars, tasks, and favorite resources. Our AI creates a unified dashboard of your upcoming challenges.' },
                            { num: '02', title: 'Enter Flow State', desc: 'Activate focus sessions. We block distractions and keep you in the zone with dynamic ambient sounds.' },
                            { num: '03', title: 'Rise in Ranks', desc: 'Review your analytics, earn XP, and level up your StudySpirit as you conquer goals and beat challenges.' }
                        ].map((step, i) => (
                            <div key={i} className={`flex flex-col md:flex-row items-center gap-6 md:gap-16 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="text-7xl md:text-[12rem] font-black text-[#80A1BA]/10 select-none text-center md:text-left leading-none">{step.num}</div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl md:text-3xl font-bold text-[#80A1BA] mb-4 md:mb-6 tracking-tighter">{step.title}</h3>
                                    <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed font-medium">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ==================== JOIN AS SECTION ==================== */}
                <div className="mt-20 md:mt-40 w-full flex flex-col items-center relative z-10 px-4">
                    <h2 className="text-3xl md:text-6xl font-black text-center mb-10 md:mb-20 italic bg-gradient-to-r from-[#80A1BA] to-[#B4DEBD] bg-clip-text text-transparent">
                        JOIN THE REVOLUTION AS
                    </h2>

                    <div className="flex justify-center w-full">
                        {[
                            {
                                role: 'student',
                                icon: '👨‍💻',
                                title: 'Developer / Student',
                                desc: 'Master skills, build projects, and compete with peers.',
                                path: '/login',
                                color: 'from-[#80A1BA]/30 to-[#91C4C3]/30',
                                border: 'hover:border-[#80A1BA]'
                            }
                        ].map((item, i) => (
                            <div
                                key={i}
                                onClick={() => navigate(item.path)}
                                className={`group relative p-10 bg-gradient-to-b ${item.color} border border-white/50 rounded-[2rem] backdrop-blur-md transition-all duration-500 border-2 ${item.border} hover:-translate-y-2 cursor-pointer text-center overflow-hidden max-w-md w-full`}
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{item.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4 italic uppercase">{item.title}</h3>
                                <p className="text-gray-700 leading-relaxed relative z-10 font-medium">{item.desc}</p>

                                <div className="mt-8 inline-block px-6 py-2 rounded-full border border-[#80A1BA] text-sm font-bold uppercase tracking-widest text-[#80A1BA] group-hover:bg-[#80A1BA] group-hover:text-white transition-all">
                                    Login as {item.role}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-32 md:mt-80 p-8 md:p-20 w-full bg-gradient-to-t from-[#B4DEBD]/40 to-transparent rounded-[2rem] md:rounded-[4rem] text-center border-x border-t border-white/40 mx-4 max-w-[calc(100%-2rem)] md:max-w-none">
                    <h2 className="text-4xl md:text-8xl font-black mb-6 md:mb-10 leading-none italic uppercase tracking-tighter text-gray-800">DON'T JUST STUDY.<br />RISE.</h2>
                    <button onClick={() => navigate('/login')} className="px-8 py-4 md:px-20 md:py-8 bg-[#80A1BA] text-white font-black text-lg md:text-2xl uppercase tracking-tighter italic hover:bg-[#91C4C3] hover:text-white transition-all transform md:hover:-rotate-3 duration-500 rounded-full shadow-xl hover:shadow-[#91C4C3]/50">
                        Unlock Your Potential Now
                    </button>
                </div>

                {/* Footer */}
                <footer className="mt-20 md:mt-40 pt-10 md:pt-20 pb-10 w-full border-t border-gray-300 text-gray-600 px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-left mb-10 md:mb-20">
                        <div>
                            <h4 className="text-gray-800 font-black text-sm mb-6 tracking-widest uppercase italic">The App</h4>
                            <ul className="space-y-3 text-xs font-bold">
                                <li className="hover:text-[#80A1BA] cursor-pointer transition-colors uppercase lg:tracking-widest">Dashboard</li>
                                <li className="hover:text-[#80A1BA] cursor-pointer transition-colors uppercase lg:tracking-widest">Focus Mode</li>
                                <li className="hover:text-[#80A1BA] cursor-pointer transition-colors uppercase lg:tracking-widest">Pricing</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-gray-800 font-black text-sm mb-6 tracking-widest uppercase italic">Company</h4>
                            <ul className="space-y-3 text-xs font-bold">
                                <li className="hover:text-[#80A1BA] cursor-pointer transition-colors uppercase lg:tracking-widest">About Us</li>
                                <li className="hover:text-[#80A1BA] cursor-pointer transition-colors uppercase lg:tracking-widest">Roadmap</li>
                                <li className="hover:text-[#80A1BA] cursor-pointer transition-colors uppercase lg:tracking-widest">Careers</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-gray-800 font-black text-sm mb-6 tracking-widest uppercase italic">Social</h4>
                            <ul className="space-y-3 text-xs font-bold">
                                <li className="hover:text-[#80A1BA] cursor-pointer transition-colors uppercase lg:tracking-widest">Twitter</li>
                                <li className="hover:text-[#80A1BA] cursor-pointer transition-colors uppercase lg:tracking-widest">Discord</li>
                                <li className="hover:text-[#80A1BA] cursor-pointer transition-colors uppercase lg:tracking-widest">Github</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-gray-800 font-black text-sm mb-6 tracking-widest uppercase italic">Legal</h4>
                            <ul className="space-y-3 text-xs font-bold">
                                <li className="hover:text-[#80A1BA] cursor-pointer transition-colors uppercase lg:tracking-widest">Privacy</li>
                                <li className="hover:text-[#80A1BA] cursor-pointer transition-colors uppercase lg:tracking-widest">Terms</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase text-gray-500">
                        <span>© 2025 StudySpirit INC.</span>
                        <span className="italic">Built for the brave.</span>
                    </div>
                </footer>
            </div>

            <style>{`
        .animate-bounce-slow { animation: bounce 4s infinite; }
        .rev { animation-direction: reverse; }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
      `}</style>
        </div>
    );
}
