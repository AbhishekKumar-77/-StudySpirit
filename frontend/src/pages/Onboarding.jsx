import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { completeOnboarding } from '../services/soloApi';

const GOALS = [
    { id: 'DSA', label: 'DSA & Algorithms', icon: '🧩', desc: 'Arrays, Trees, Graphs, DP — ace coding interviews', color: '#6366f1' },
    { id: 'Web Dev', label: 'Web Development', icon: '🌐', desc: 'HTML, CSS, React, Node.js, full-stack projects', color: '#06b6d4' },
    { id: 'AI/ML', label: 'AI / Machine Learning', icon: '🤖', desc: 'Python, ML models, deep learning, NLP', color: '#8b5cf6' },
    { id: 'Interview Prep', label: 'Interview Preparation', icon: '🎯', desc: 'System design, HR rounds, real company patterns', color: '#f59e0b' },
    { id: 'Competitive', label: 'Competitive Programming', icon: '⚡', desc: 'Codeforces, LeetCode contests, speed coding', color: '#f43f5e' },
];

const LEVELS = [
    { id: 'Beginner', icon: '🌱', label: 'Beginner', desc: 'Just starting out, learning the basics', color: '#10b981' },
    { id: 'Intermediate', icon: '🔥', label: 'Intermediate', desc: 'Know the fundamentals, want to go deeper', color: '#f59e0b' },
    { id: 'Advanced', icon: '⚡', label: 'Advanced', desc: 'Experienced, targeting top companies', color: '#6366f1' },
];

export default function Onboarding() {
    const { user, setUser } = useApp();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1=goal, 2=level, 3=profile, 4=generating
    const [goal, setGoal] = useState('');
    const [level, setLevel] = useState('');
    const [university, setUniversity] = useState('');
    const [course, setCourse] = useState('');
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState(null);
    const [error, setError] = useState('');
    const [dots, setDots] = useState(0);

    // Animated loading dots
    React.useEffect(() => {
        if (step !== 4) return;
        const interval = setInterval(() => setDots(d => (d + 1) % 4), 500);
        return () => clearInterval(interval);
    }, [step]);

    const handleFinish = async () => {
        setStep(4);
        setLoading(true);
        setError('');
        try {
            const res = await completeOnboarding({ studyGoal: goal, difficultyLevel: level, university, course });
            if (res.success) {
                setRoadmap(res.roadmap);
                // Update user context with onboardingCompleted flag
                setUser(prev => ({
                    ...prev,
                    onboardingCompleted: true,
                    studyGoal: goal,
                    difficultyLevel: level,
                    university: university || prev?.university,
                    course: course || prev?.course,
                }));
                setLoading(false);
            }
        } catch (err) {
            setLoading(false);
            setError('Could not generate roadmap. Redirecting you to dashboard...');
            setTimeout(() => navigate('/dashboard'), 2000);
        }
    };

    const selectedGoal = GOALS.find(g => g.id === goal);
    const selectedLevel = LEVELS.find(l => l.id === level);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #06080e 0%, #0d1117 50%, #0a0d1a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', 'Segoe UI', sans-serif", padding: '20px',
            position: 'relative', overflow: 'hidden'
        }}>
            {/* Background grid */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.04,
                backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
            }} />
            {/* Glow blobs */}
            <div style={{ position: 'absolute', top: '15%', left: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 680, position: 'relative', zIndex: 1 }}>

                {/* ── Step indicator ── */}
                {step < 4 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
                        {[1, 2, 3].map(s => (
                            <React.Fragment key={s}>
                                <div style={{
                                    width: s === step ? 32 : 10, height: 10, borderRadius: 5,
                                    background: s <= step ? '#6366f1' : 'rgba(255,255,255,0.15)',
                                    transition: 'all 0.4s ease'
                                }} />
                                {s < 3 && <div style={{ width: 24, height: 2, background: s < step ? '#6366f1' : 'rgba(255,255,255,0.1)', borderRadius: 2, transition: 'all 0.4s ease' }} />}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* ── STEP 1: Goal ── */}
                {step === 1 && (
                    <div style={{ animation: 'fadeSlideIn 0.4s ease' }}>
                        <div style={{ textAlign: 'center', marginBottom: 36 }}>
                            <div style={{ fontSize: 13, color: '#6366f1', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>Welcome to StudySpirit</div>
                            <h1 style={{ fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 800, color: '#f0f6fc', margin: '0 0 12px', lineHeight: 1.2 }}>
                                What's your <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>main goal?</span>
                            </h1>
                            <p style={{ color: 'rgba(240,246,252,0.5)', fontSize: 15, margin: 0 }}>We'll build a personalized roadmap just for you</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {GOALS.map(g => (
                                <button key={g.id} onClick={() => { setGoal(g.id); setStep(2); }}
                                    style={{
                                        background: goal === g.id
                                            ? `linear-gradient(135deg, ${g.color}22, ${g.color}11)`
                                            : 'rgba(255,255,255,0.03)',
                                        border: `1.5px solid ${goal === g.id ? g.color : 'rgba(255,255,255,0.08)'}`,
                                        borderRadius: 16, padding: '18px 22px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 16,
                                        transition: 'all 0.25s ease', textAlign: 'left',
                                        transform: goal === g.id ? 'translateX(4px)' : 'none'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = g.color; e.currentTarget.style.background = `${g.color}15`; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = goal === g.id ? g.color : 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = goal === g.id ? `${g.color}15` : 'rgba(255,255,255,0.03)'; }}
                                >
                                    <span style={{ fontSize: 28, flexShrink: 0 }}>{g.icon}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: '#f0f6fc', fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{g.label}</div>
                                        <div style={{ color: 'rgba(240,246,252,0.45)', fontSize: 13 }}>{g.desc}</div>
                                    </div>
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${g.color}`, background: goal === g.id ? g.color : 'transparent', flexShrink: 0, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {goal === g.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Level ── */}
                {step === 2 && (
                    <div style={{ animation: 'fadeSlideIn 0.4s ease' }}>
                        <div style={{ textAlign: 'center', marginBottom: 36 }}>
                            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'rgba(240,246,252,0.4)', cursor: 'pointer', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto 16px' }}>
                                ← Back
                            </button>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{selectedGoal?.icon}</div>
                            <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: '#f0f6fc', margin: '0 0 10px' }}>
                                What's your <span style={{ background: `linear-gradient(135deg, ${selectedGoal?.color}, #8b5cf6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>current level?</span>
                            </h1>
                            <p style={{ color: 'rgba(240,246,252,0.5)', fontSize: 15, margin: 0 }}>This helps us pick the right difficulty for your roadmap</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {LEVELS.map(l => (
                                <button key={l.id} onClick={() => { setLevel(l.id); setStep(3); }}
                                    style={{
                                        background: level === l.id ? `${l.color}18` : 'rgba(255,255,255,0.03)',
                                        border: `1.5px solid ${level === l.id ? l.color : 'rgba(255,255,255,0.08)'}`,
                                        borderRadius: 18, padding: '22px 26px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 18, transition: 'all 0.25s ease', textAlign: 'left'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = l.color; e.currentTarget.style.background = `${l.color}15`; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = level === l.id ? l.color : 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = level === l.id ? `${l.color}15` : 'rgba(255,255,255,0.03)'; }}
                                >
                                    <span style={{ fontSize: 32 }}>{l.icon}</span>
                                    <div>
                                        <div style={{ color: '#f0f6fc', fontWeight: 700, fontSize: 17 }}>{l.label}</div>
                                        <div style={{ color: 'rgba(240,246,252,0.45)', fontSize: 13, marginTop: 3 }}>{l.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── STEP 3: Profile ── */}
                {step === 3 && (
                    <div style={{ animation: 'fadeSlideIn 0.4s ease' }}>
                        <div style={{ textAlign: 'center', marginBottom: 36 }}>
                            <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: 'rgba(240,246,252,0.4)', cursor: 'pointer', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto 16px' }}>
                                ← Back
                            </button>
                            <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: '#f0f6fc', margin: '0 0 10px' }}>
                                Tell us about <span style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>yourself</span>
                            </h1>
                            <p style={{ color: 'rgba(240,246,252,0.5)', fontSize: 15, margin: 0 }}>Optional — helps personalize your experience further</p>
                        </div>

                        {/* Summary card */}
                        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 22 }}>{selectedGoal?.icon}</span>
                            <span style={{ color: '#a5b4fc', fontWeight: 600, fontSize: 14 }}>{selectedGoal?.label}</span>
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                            <span style={{ fontSize: 18 }}>{selectedLevel?.icon}</span>
                            <span style={{ color: '#c4b5fd', fontWeight: 600, fontSize: 14 }}>{selectedLevel?.label}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ color: 'rgba(240,246,252,0.6)', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>UNIVERSITY / COLLEGE</label>
                                <input
                                    type="text" placeholder="e.g. IIT Delhi, VIT Vellore, BITS Pilani"
                                    value={university}
                                    onChange={e => setUniversity(e.target.value)}
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12, padding: '14px 18px', color: '#f0f6fc', fontSize: 15,
                                        outline: 'none', transition: 'border-color 0.2s',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                            <div>
                                <label style={{ color: 'rgba(240,246,252,0.6)', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>COURSE / BRANCH</label>
                                <input
                                    type="text" placeholder="e.g. B.Tech CSE, MCA, BCA, B.Sc IT"
                                    value={course}
                                    onChange={e => setCourse(e.target.value)}
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12, padding: '14px 18px', color: '#f0f6fc', fontSize: 15,
                                        outline: 'none', transition: 'border-color 0.2s',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleFinish}
                            style={{
                                width: '100%', marginTop: 28, padding: '16px', borderRadius: 14, cursor: 'pointer', border: 'none',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: '0.05em',
                                boxShadow: '0 8px 32px rgba(99,102,241,0.35)', transition: 'all 0.25s ease',
                                fontFamily: 'inherit'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.5)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.35)'; }}
                        >
                            🚀 Generate My Personalized Roadmap
                        </button>
                        <button onClick={() => navigate('/dashboard')} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: 'rgba(240,246,252,0.35)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                            Skip for now →
                        </button>
                    </div>
                )}

                {/* ── STEP 4: Generating / Done ── */}
                {step === 4 && (
                    <div style={{ textAlign: 'center', animation: 'fadeSlideIn 0.4s ease' }}>
                        {loading ? (
                            <>
                                {/* Spinning rings */}
                                <div style={{ width: 90, height: 90, margin: '0 auto 32px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.15)', borderTop: '3px solid #6366f1', animation: 'spin 1s linear infinite' }} />
                                    <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '3px solid rgba(139,92,246,0.15)', borderTop: '3px solid #8b5cf6', animation: 'spin 1.4s linear infinite reverse' }} />
                                    <div style={{ position: 'absolute', inset: 22, borderRadius: '50%', border: '3px solid rgba(236,72,153,0.15)', borderTop: '3px solid #ec4899', animation: 'spin 0.7s linear infinite' }} />
                                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 24 }}>🤖</span>
                                </div>
                                <h2 style={{ color: '#f0f6fc', fontSize: 24, fontWeight: 800, margin: '0 0 10px' }}>Building Your Roadmap{'.'.repeat(dots)}</h2>
                                <p style={{ color: 'rgba(240,246,252,0.5)', fontSize: 15, margin: '0 0 32px' }}>
                                    AI is crafting a personalized <strong style={{ color: '#a5b4fc' }}>30-day {goal}</strong> plan for <strong style={{ color: '#c4b5fd' }}>{level}s</strong>
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                                    {['Analyzing your goal and level...', 'Structuring 30 days of content...', 'Creating daily missions and XP rewards...', 'Setting milestone badges...'].map((msg, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', animation: `pulse ${0.8 + i * 0.2}s ease-in-out infinite alternate` }} />
                                            <span style={{ color: 'rgba(240,246,252,0.6)', fontSize: 14 }}>{msg}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : roadmap ? (
                            <>
                                {/* Success state */}
                                <div style={{ width: 80, height: 80, margin: '0 auto 28px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}>
                                    🎉
                                </div>
                                <h2 style={{ color: '#f0f6fc', fontSize: 26, fontWeight: 800, margin: '0 0 10px' }}>Your Roadmap is Ready!</h2>
                                <p style={{ color: 'rgba(240,246,252,0.55)', fontSize: 15, margin: '0 0 28px' }}>
                                    <strong style={{ color: '#a5b4fc' }}>{roadmap.title}</strong>
                                </p>

                                {/* Milestones preview */}
                                {roadmap.milestones && (
                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
                                        {roadmap.milestones.map((m, i) => (
                                            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: 'rgba(240,246,252,0.7)' }}>
                                                {m.badge} <span style={{ color: 'rgba(240,246,252,0.4)', marginLeft: 4 }}>Day {m.day}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Today's mission */}
                                {roadmap.todayMission && (
                                    <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1.5px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: '18px 22px', marginBottom: 28, textAlign: 'left' }}>
                                        <div style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>⚡ Today's First Mission</div>
                                        <div style={{ color: '#f0f6fc', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{roadmap.todayMission.title}</div>
                                        <div style={{ color: 'rgba(240,246,252,0.6)', fontSize: 14, marginBottom: 10 }}>{roadmap.todayMission.task}</div>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.2)', borderRadius: 8, padding: '4px 10px' }}>
                                            <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 600 }}>+{roadmap.todayMission.xp} XP</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => navigate('/dashboard')}
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: 14, cursor: 'pointer', border: 'none',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#fff', fontSize: 16, fontWeight: 700,
                                        boxShadow: '0 8px 32px rgba(99,102,241,0.35)', fontFamily: 'inherit'
                                    }}
                                >
                                    🚀 Let's Go! Open Dashboard
                                </button>
                            </>
                        ) : (
                            // Error state
                            <div style={{ color: '#f87171', fontSize: 15 }}>{error || 'Something went wrong...'}</div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    from { opacity: 0.3; transform: scale(0.9); }
                    to   { opacity: 1;   transform: scale(1.2); }
                }
                input::placeholder { color: rgba(240,246,252,0.2); }
            `}</style>
        </div>
    );
}
