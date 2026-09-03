import React from 'react';
import { ChevronRight, Check, Sparkles, BookOpen, Clock, BarChart3, Target, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';

export default function PlannerOverview({
    state,
    selectedSemesterNum,
    setSelectedSemesterNum,
    setActiveTab,
    setShowAIPlanModal,
    handleToggleTask,
    searchQuery
}) {
    const currentSemData = state.semesterData?.[selectedSemesterNum] || state.semesterData?.[2] || { courses: [], skills: [], projects: [] };

    const filteredCourses = (currentSemData.courses || []).filter(c =>
        c.name.toLowerCase().includes((searchQuery || '').toLowerCase())
    );
    const filteredSkills = (currentSemData.skills || []).filter(s =>
        s.name.toLowerCase().includes((searchQuery || '').toLowerCase())
    );
    const filteredTasks = (state.tasks || []).filter(t =>
        t.title.toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    return (
        <>
            {/* Main Header & Dynamic AI Status Banner */}
            <div className="sp-page-header-row">
                <div>
                    <h1 className="sp-page-title">Your Study Planner ✨</h1>
                    <p className="sp-page-subtitle">Your personalized roadmap to learn, practice, and achieve your academic goals.</p>
                </div>

                {/* Dynamic AI Status Card */}
                <div className="sp-ai-status-card" onClick={() => setShowAIPlanModal(true)} title="Click to customize with AI">
                    <div className="sp-ai-icon-box">🤖</div>
                    <div>
                        <div className="sp-ai-status-title">AI Study Assistant</div>
                        <div className="sp-ai-status-desc">{state.stats?.aiStatusMessage || "AI is keeping you on track for success."}</div>
                    </div>
                    <ChevronRight size={18} color="#7e22ce" style={{ marginLeft: 'auto' }} />
                </div>
            </div>

            {/* Top 4 Summary Metric Cards */}
            <div className="sp-summary-grid">
                {/* Card 1: Current Semester */}
                <div className="sp-summary-card">
                    <div className="sp-summary-card-header">
                        <span className="sp-summary-title">Current Semester</span>
                        <div className="sp-summary-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>🎓</div>
                    </div>
                    <div className="sp-summary-value">Semester {state.profile?.currentSemester || 2}</div>
                    <div className="sp-summary-subtext">{state.profile?.batch || 'CSE — 2026 Batch'}</div>
                    <button className="sp-summary-link" onClick={() => setActiveTab('roadmap')}>View Roadmap →</button>
                </div>

                {/* Card 2: Overall Progress */}
                <div className="sp-summary-card">
                    <div className="sp-summary-card-header">
                        <span className="sp-summary-title">Overall Progress</span>
                        <div className="sp-summary-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>📊</div>
                    </div>
                    <div className="sp-summary-value">{state.stats?.overallProgressPercent || 68}%</div>
                    <div className="sp-summary-subtext">Ahead of {state.stats?.percentileRank || 65}% of peer learners</div>
                    <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>Keep it up! 🚀</div>
                </div>

                {/* Card 3: Weekly Progress */}
                <div className="sp-summary-card">
                    <div className="sp-summary-card-header">
                        <span className="sp-summary-title">Weekly Study Time</span>
                        <div className="sp-summary-icon" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>📈</div>
                    </div>
                    <div className="sp-summary-value">{state.stats?.weeklyHoursSpent || '0h 0m'}</div>
                    <div className="sp-summary-subtext">Target: {state.stats?.weeklyHoursTarget || '7h 0m'}</div>
                </div>

                {/* Card 4: Upcoming Deadlines */}
                <div className="sp-summary-card">
                    <div className="sp-summary-card-header">
                        <span className="sp-summary-title">Upcoming Deadlines</span>
                        <div className="sp-summary-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>📅</div>
                    </div>
                    <div className="sp-summary-value">{state.deadlines?.length || 0}</div>
                    <div className="sp-summary-subtext">Active exams & projects</div>
                    <button className="sp-summary-link" onClick={() => setActiveTab('deadlines')}>View All →</button>
                </div>
            </div>

            {/* Academic Roadmap Timeline */}
            <div className="sp-section-card">
                <div className="sp-section-title-row">
                    <div className="sp-section-title">Academic Roadmap (Semesters 1 — 8)</div>
                    <button className="sp-rec-action" onClick={() => setActiveTab('roadmap')}>Explore All Semesters →</button>
                </div>
                <div className="sp-roadmap-track">
                    <div className="sp-roadmap-line" />
                    {(state.semesters || []).map(sem => (
                        <div
                            key={sem.number}
                            className={`sp-roadmap-node ${sem.status}`}
                            onClick={() => {
                                setSelectedSemesterNum(sem.number);
                                setActiveTab('roadmap');
                            }}
                            title={`Click to view Semester ${sem.number}`}
                        >
                            <div className="sp-node-circle">
                                {sem.status === 'completed' ? <Check size={14} /> : sem.number}
                            </div>
                            <div className="sp-node-label">Sem {sem.number}</div>
                            <div className="sp-node-status">
                                {sem.status === 'completed' ? 'Completed' : sem.status === 'current' ? 'Current' : 'Upcoming'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Grid: Semester Details + AI Recommendations */}
            <div className="sp-main-grid">
                {/* Left: Semester Details (3 Columns) */}
                <div className="sp-section-card">
                    <div className="sp-semester-header">
                        Semester {state.profile?.currentSemester || 2} Curriculum — Current
                        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500, marginLeft: '8px' }}>
                            ({state.profile?.startDate || 'Feb 2026'} → {state.profile?.endDate || 'Jun 2026'})
                        </span>
                    </div>

                    <div className="sp-3col-grid">
                        {/* Col 1: Academic Courses */}
                        <div>
                            <div className="sp-col-title">Academic Courses</div>
                            {filteredCourses.map((c, i) => (
                                <div key={i} className="sp-list-item">
                                    <span className="sp-item-name">{c.name}</span>
                                    <span className="sp-item-pct" style={{ color: c.color }}>{c.mastery}%</span>
                                </div>
                            ))}
                            {filteredCourses.length === 0 && (
                                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>No courses matching search</div>
                            )}
                        </div>

                        {/* Col 2: Skills to Build */}
                        <div>
                            <div className="sp-col-title">Skills to Build</div>
                            {filteredSkills.slice(0, 4).map((sk, i) => (
                                <div key={i} className="sp-list-item">
                                    <span className="sp-item-name">{sk.name}</span>
                                    <span className="sp-item-pct" style={{ color: sk.color }}>{sk.mastery}%</span>
                                </div>
                            ))}
                        </div>

                        {/* Col 3: Projects */}
                        <div>
                            <div className="sp-col-title">Projects</div>
                            {(currentSemData.projects || []).map((p, i) => (
                                <div key={i} style={{ marginBottom: '14px' }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', margin: '4px 0', color: '#64748b' }}>
                                        <span style={{ color: p.status === 'Completed' ? '#10b981' : '#0284c7', fontWeight: 600 }}>{p.status}</span>
                                        <span style={{ fontWeight: 700 }}>{p.progress}%</span>
                                    </div>
                                    <div className="sp-progress-bg">
                                        <div className="sp-progress-fill" style={{ width: `${p.progress}%`, backgroundColor: p.status === 'Completed' ? '#10b981' : '#7e22ce' }} />
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Due: {p.dueDate}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: AI Recommendations Side Panel */}
                <div className="sp-ai-panel">
                    <div className="sp-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        AI Recommendations ✨
                    </div>
                    {(state.recommendations || []).map((rec, i) => (
                        <div key={i} className={`sp-recommend-card ${rec.recType}`}>
                            <div className="sp-rec-badge">{rec.badgeLabel || 'Recommendation'}</div>
                            <div className="sp-rec-title">{rec.title}</div>
                            <div className="sp-rec-desc">{rec.description}</div>
                            <button className="sp-rec-action" onClick={() => setActiveTab('week')}>
                                {rec.actionText || 'Explore →'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Split Grid: This Week's Plan vs Skills & Learning Path */}
            <div className="sp-weekly-split-grid">
                {/* Left: This Week's Plan */}
                <div className="sp-section-card">
                    <div className="sp-section-title-row">
                        <div className="sp-section-title">This Week's Plan</div>
                        <button className="sp-rec-action" onClick={() => setActiveTab('week')}>View Full Schedule →</button>
                    </div>

                    {filteredTasks.slice(0, 7).map((t, idx) => (
                        <div key={t._id || idx} className="sp-task-row">
                            <div className="sp-task-left">
                                <div className="sp-task-date">{t.dayLabel}</div>
                                <div className="sp-task-title">{t.title}</div>
                            </div>
                            <div className="sp-task-right">
                                <div className="sp-task-duration">{t.durationMinutes} min</div>
                                <span className={`sp-type-badge ${t.taskType}`}>{t.taskType}</span>
                                <div
                                    className={`sp-checkbox ${t.completed ? 'checked' : ''}`}
                                    onClick={() => handleToggleTask(t._id, t.status)}
                                    title={t.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                                >
                                    {t.completed && <Check size={12} />}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Task Summary Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8fafc', borderRadius: '12px', marginTop: '16px' }}>
                        <div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Planned Time</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{state.stats?.weeklyHoursTarget || '7h 0m'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Completed</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>{state.stats?.weeklyHoursSpent || '0h 0m'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Completion Rate</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>{state.stats?.completionRate || 0}%</div>
                        </div>
                    </div>
                </div>

                {/* Right: Skills & Learning Path */}
                <div className="sp-section-card">
                    <div className="sp-section-title-row">
                        <div className="sp-section-title">Skills & Learning Path</div>
                        <button className="sp-rec-action" onClick={() => setActiveTab('skills')}>View Path →</button>
                    </div>

                    {(currentSemData.skills || []).slice(0, 6).map((sk, idx) => (
                        <div key={idx} style={{ marginBottom: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>{sk.name}</span>
                                <span style={{ fontWeight: 700, color: sk.color }}>{sk.mastery}%</span>
                            </div>
                            <div className="sp-progress-bg">
                                <div className="sp-progress-fill" style={{ width: `${sk.mastery}%`, backgroundColor: sk.color }} />
                            </div>
                            {sk.status === 'Recommended Next' && (
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                                    Recommended Next
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Milestones Section */}
            <div className="sp-section-card">
                <div className="sp-section-title-row">
                    <div className="sp-section-title">Milestones</div>
                    <button className="sp-rec-action" onClick={() => setActiveTab('goals')}>View All Goals →</button>
                </div>
                <div className="sp-milestones-grid">
                    {(state.milestones || []).map((m, idx) => (
                        <div key={idx} className="sp-milestone-card">
                            <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{m.icon}</div>
                            <div className="sp-milestone-title">{m.title}</div>
                            <div className="sp-milestone-desc">{m.description}</div>
                            {m.completed ? (
                                <div className="sp-milestone-status">✓ Completed</div>
                            ) : m.locked ? (
                                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>🔒 Locked</div>
                            ) : (
                                <div>
                                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>{m.current} / {m.target}</div>
                                    <div className="sp-progress-bg">
                                        <div className="sp-progress-fill" style={{ width: `${(m.current / m.target) * 100}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
