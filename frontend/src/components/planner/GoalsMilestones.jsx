import React from 'react';
import { Target, CheckCircle2, Lock, Sparkles, Award } from 'lucide-react';

export default function GoalsMilestones({
    state,
    setShowAddGoalModal,
    setShowAIPlanModal
}) {
    const profile = state.profile || {};
    const careerSteps = profile.careerSteps || [
        { step: 1, title: 'Master Core Programming (Python, C++)', completed: true },
        { step: 2, title: 'Build DSA & Problem Solving Skills', completed: false },
        { step: 3, title: 'Learn Web Development & Databases', completed: false },
        { step: 4, title: 'Build Real-World Projects & Portfolio', completed: false },
        { step: 5, title: 'Prepare for Placements & Internships', completed: false }
    ];

    return (
        <div className="sp-section-card">
            <div className="sp-section-title-row">
                <div>
                    <div className="sp-section-title">Career Goals & Milestone Progression</div>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                        Track your career path milestones, certification goals, and target job readiness.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="sp-quick-action-btn primary"
                        style={{ padding: '8px 16px', borderRadius: '10px' }}
                        onClick={() => setShowAIPlanModal(true)}
                    >
                        <Sparkles size={16} />
                        <span>AI Plan Builder</span>
                    </button>
                    <button
                        className="sp-btn-continue"
                        style={{ width: 'auto' }}
                        onClick={() => setShowAddGoalModal(true)}
                    >
                        + Set Career Goal
                    </button>
                </div>
            </div>

            {/* Target Role Card */}
            <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
                borderRadius: '16px',
                border: '1px solid #bfdbfe',
                margin: '20px 0'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Primary Career Target
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                            {profile.targetRole || 'Software Engineer'}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Target Completion</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#7e22ce' }}>{profile.targetDate || 'June 2027'}</div>
                    </div>
                </div>

                {/* Stepper Flow */}
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {careerSteps.map((step, idx) => (
                        <div
                            key={step.step || idx}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '12px 16px',
                                background: step.completed ? '#ffffff' : '#f8fafc',
                                borderRadius: '10px',
                                border: step.completed ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                            }}
                        >
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: step.completed ? '#10b981' : '#e2e8f0',
                                color: step.completed ? '#ffffff' : '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                flexShrink: 0
                            }}>
                                {step.completed ? '✓' : step.step || idx + 1}
                            </div>
                            <span style={{
                                fontSize: '0.92rem',
                                fontWeight: step.completed ? 700 : 500,
                                color: step.completed ? '#0f172a' : '#64748b'
                            }}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Achievement Milestones Grid */}
            <div className="sp-section-title" style={{ marginTop: '28px', marginBottom: '14px' }}>
                Gamified Milestones & Badges
            </div>
            <div className="sp-milestones-grid">
                {(state.milestones || []).map((m, idx) => (
                    <div key={idx} className="sp-milestone-card">
                        <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{m.icon || '🏆'}</div>
                        <div className="sp-milestone-title">{m.title}</div>
                        <div className="sp-milestone-desc">{m.description}</div>
                        {m.completed ? (
                            <div className="sp-milestone-status">✓ Completed</div>
                        ) : m.locked ? (
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>🔒 Locked</div>
                        ) : (
                            <div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                                    {m.current} / {m.target}
                                </div>
                                <div className="sp-progress-bg">
                                    <div className="sp-progress-fill" style={{ width: `${(m.current / m.target) * 100}%` }} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
