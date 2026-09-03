import React from 'react';
import { Check, BookOpen, Layers, Award, Calendar } from 'lucide-react';

export default function AcademicRoadmap({
    state,
    selectedSemesterNum,
    setSelectedSemesterNum
}) {
    const semData = state.semesterData?.[selectedSemesterNum] || { courses: [], skills: [], projects: [] };
    const selectedSemObj = (state.semesters || []).find(s => s.number === selectedSemesterNum) || {
        number: selectedSemesterNum,
        status: selectedSemesterNum === 2 ? 'current' : selectedSemesterNum < 2 ? 'completed' : 'upcoming'
    };

    return (
        <div className="sp-section-card">
            <div className="sp-section-title-row">
                <div>
                    <div className="sp-section-title">8-Semester Academic Curriculum Roadmap</div>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                        B.Tech Computer Science curriculum progression, skills, and industry project milestones.
                    </p>
                </div>
            </div>

            {/* Semester Selector Pill Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '20px 0' }}>
                {(state.semesters || []).map(sem => (
                    <button
                        key={sem.number}
                        onClick={() => setSelectedSemesterNum(sem.number)}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '12px',
                            border: selectedSemesterNum === sem.number ? '2px solid #7e22ce' : '1px solid #e2e8f0',
                            background: selectedSemesterNum === sem.number
                                ? 'linear-gradient(135deg, #7e22ce, #a855f7)'
                                : sem.status === 'completed' ? '#f0fdf4' : '#f8fafc',
                            color: selectedSemesterNum === sem.number ? '#ffffff' : sem.status === 'completed' ? '#166534' : '#64748b',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: selectedSemesterNum === sem.number ? '0 4px 12px rgba(126, 34, 206, 0.25)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>Semester {sem.number}</span>
                        {sem.status === 'completed' && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                        {sem.status === 'current' && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: selectedSemesterNum === sem.number ? '#fff' : '#10b981' }} />}
                    </button>
                ))}
            </div>

            {/* Semester Status Banner */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderRadius: '12px',
                marginBottom: '24px',
                background: selectedSemObj.status === 'completed' ? '#f0fdf4' : selectedSemObj.status === 'current' ? '#eff6ff' : '#f8fafc',
                border: `1px solid ${selectedSemObj.status === 'completed' ? '#bbf7d0' : selectedSemObj.status === 'current' ? '#bfdbfe' : '#e2e8f0'}`
            }}>
                <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: selectedSemObj.status === 'completed' ? '#166534' : selectedSemObj.status === 'current' ? '#1e40af' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span>Semester {selectedSemesterNum} Curriculum Overview</span>
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: selectedSemObj.status === 'completed' ? '#dcfce7' : selectedSemObj.status === 'current' ? '#dbeafe' : '#e2e8f0',
                        color: selectedSemObj.status === 'completed' ? '#15803d' : selectedSemObj.status === 'current' ? '#1d4ed8' : '#64748b'
                    }}>
                        {selectedSemObj.status === 'completed' ? 'Completed' : selectedSemObj.status === 'current' ? 'Current Semester' : 'Upcoming'}
                    </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {semData.courses?.length || 0} Courses • {semData.skills?.length || 0} Skills • {semData.projects?.length || 0} Projects
                </div>
            </div>

            {/* 3-Column Structured Grid */}
            <div className="sp-3col-grid">
                {/* Column 1: Academic Courses */}
                <div>
                    <div className="sp-col-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={16} color="#7e22ce" />
                        <span>Academic Courses</span>
                    </div>
                    {(semData.courses || []).map((c, i) => (
                        <div key={i} style={{ padding: '14px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                                    {c.code && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Code: {c.code}</div>}
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: c.color || '#10b981' }}>{c.mastery}%</span>
                            </div>
                            <div className="sp-progress-bg">
                                <div className="sp-progress-fill" style={{ width: `${c.mastery}%`, backgroundColor: c.color || '#10b981' }} />
                            </div>
                        </div>
                    ))}
                    {(semData.courses || []).length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', background: '#f8fafc', borderRadius: '10px' }}>
                            No courses defined for this semester.
                        </div>
                    )}
                </div>

                {/* Column 2: Skills to Build */}
                <div>
                    <div className="sp-col-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={16} color="#0284c7" />
                        <span>Skills to Build</span>
                    </div>
                    {(semData.skills || []).map((sk, i) => (
                        <div key={i} style={{ padding: '14px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>{sk.name}</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: sk.color || '#0284c7' }}>{sk.mastery}%</span>
                            </div>
                            <div className="sp-progress-bg">
                                <div className="sp-progress-fill" style={{ width: `${sk.mastery}%`, backgroundColor: sk.color || '#0284c7' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                    {sk.category || 'Core'}
                                </span>
                                {sk.status && (
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        color: sk.status === 'Completed' ? '#166534' : sk.status === 'In Progress' ? '#0284c7' : sk.status === 'Recommended Next' ? '#d97706' : '#94a3b8',
                                        background: sk.status === 'Completed' ? '#dcfce7' : sk.status === 'In Progress' ? '#e0f2fe' : sk.status === 'Recommended Next' ? '#fef3c7' : '#f1f5f9',
                                        padding: '2px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        {sk.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Column 3: Projects */}
                <div>
                    <div className="sp-col-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={16} color="#d97706" />
                        <span>Projects</span>
                    </div>
                    {(semData.projects || []).map((p, i) => (
                        <div key={i} style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{p.name}</div>
                            {p.description && <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>{p.description}</div>}

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                                <span style={{
                                    fontWeight: 700,
                                    color: p.status === 'Completed' ? '#10b981' : p.status === 'In Progress' ? '#0284c7' : '#94a3b8'
                                }}>
                                    {p.status}
                                </span>
                                <span style={{ fontWeight: 800, color: '#0f172a' }}>{p.progress}%</span>
                            </div>
                            <div className="sp-progress-bg">
                                <div className="sp-progress-fill" style={{
                                    width: `${p.progress}%`,
                                    backgroundColor: p.status === 'Completed' ? '#10b981' : '#7e22ce'
                                }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
                                <span>Due: {p.dueDate || 'End of Semester'}</span>
                            </div>

                            {p.relatedSkills && p.relatedSkills.length > 0 && (
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                                    {p.relatedSkills.map((s, si) => (
                                        <span key={si} style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
