import React from 'react';
import { Compass, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export default function SkillGraph({
    state,
    selectedSemesterNum,
    setSelectedSemesterNum
}) {
    const skills = state.semesterData?.[selectedSemesterNum]?.skills || [];

    return (
        <div className="sp-section-card">
            <div className="sp-section-title-row">
                <div>
                    <div className="sp-section-title">Dependency-Aware Skill Graph & Competencies</div>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                        Prerequisites, mastery levels, and core domain skills mapped for your engineering progression.
                    </p>
                </div>
            </div>

            {/* Semester Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '20px 0' }}>
                {(state.semesters || []).map(sem => (
                    <button
                        key={sem.number}
                        onClick={() => setSelectedSemesterNum(sem.number)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: selectedSemesterNum === sem.number ? '2px solid #7e22ce' : '1px solid #e2e8f0',
                            background: selectedSemesterNum === sem.number
                                ? 'linear-gradient(135deg, #7e22ce, #a855f7)'
                                : '#f8fafc',
                            color: selectedSemesterNum === sem.number ? '#fff' : '#64748b',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Semester {sem.number}
                    </button>
                ))}
            </div>

            {/* Grid of Skill Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {skills.map((sk, idx) => (
                    <div
                        key={idx}
                        style={{
                            padding: '18px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>{sk.name}</div>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: sk.color || '#10b981' }}>
                                {sk.mastery}%
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="sp-progress-bg" style={{ height: '8px', borderRadius: '4px' }}>
                            <div
                                className="sp-progress-fill"
                                style={{ width: `${sk.mastery}%`, backgroundColor: sk.color || '#10b981' }}
                            />
                        </div>

                        {/* Metadata Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.78rem' }}>
                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                {sk.category || 'Core'}
                            </span>
                            <span style={{
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                color: sk.status === 'Completed' ? '#166534' : sk.status === 'In Progress' ? '#0284c7' : sk.status === 'Recommended Next' ? '#d97706' : '#94a3b8',
                                background: sk.status === 'Completed' ? '#dcfce7' : sk.status === 'In Progress' ? '#e0f2fe' : sk.status === 'Recommended Next' ? '#fef3c7' : '#f1f5f9'
                            }}>
                                {sk.status}
                            </span>
                        </div>

                        {/* Prerequisites if any */}
                        {sk.prerequisites && sk.prerequisites.length > 0 && (
                            <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#64748b' }}>
                                <strong>Prerequisites:</strong> {sk.prerequisites.join(', ')}
                            </div>
                        )}
                    </div>
                ))}

                {skills.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No skills configured for Semester {selectedSemesterNum}.
                    </div>
                )}
            </div>
        </div>
    );
}
