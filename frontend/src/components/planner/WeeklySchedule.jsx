import React from 'react';
import { Plus, Check, Trash2, Clock, Calendar as CalendarIcon } from 'lucide-react';

export default function WeeklySchedule({
    state,
    handleToggleTask,
    handleDeleteTask,
    setShowAddTaskModal,
    searchQuery
}) {
    const tasks = (state.tasks || []).filter(t =>
        t.title.toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    return (
        <div className="sp-section-card">
            <div className="sp-section-title-row">
                <div>
                    <div className="sp-section-title">This Week's Detailed Learning Schedule</div>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                        Track daily topics, practice sessions, quizzes, and project coding tasks.
                    </p>
                </div>
                <button
                    className="sp-btn-continue"
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => setShowAddTaskModal(true)}
                >
                    <Plus size={16} />
                    <span>Add New Task</span>
                </button>
            </div>

            {/* Weekly Metrics Banner */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '14px',
                margin: '20px 0',
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
            }}>
                <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Total Tasks</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{tasks.length}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Target Study Time</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7e22ce' }}>{state.stats?.weeklyHoursTarget || '7h 0m'}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Completed Time</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{state.stats?.weeklyHoursSpent || '0h 0m'}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Completion Rate</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7' }}>{state.stats?.completionRate || 0}%</div>
                </div>
            </div>

            {/* Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tasks.map((t, idx) => (
                    <div
                        key={t._id || idx}
                        className="sp-task-row"
                        style={{
                            padding: '16px 20px',
                            background: t.completed ? '#f0fdf4' : '#ffffff',
                            border: t.completed ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                        }}
                    >
                        <div className="sp-task-left">
                            <div className="sp-task-date" style={{ width: '80px', fontSize: '0.9rem', fontWeight: 700 }}>
                                {t.dayLabel || 'Day'}
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '0.98rem',
                                    fontWeight: 700,
                                    color: t.completed ? '#166534' : '#0f172a',
                                    textDecoration: t.completed ? 'line-through' : 'none'
                                }}>
                                    {t.title}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                    {t.courseName && <span>Course: {t.courseName}</span>}
                                    {t.topic && <span>• Topic: {t.topic}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="sp-task-right">
                            <div className="sp-task-duration">{t.durationMinutes || 60} min</div>
                            <span className={`sp-type-badge ${t.taskType || 'LEARN'}`}>{t.taskType || 'LEARN'}</span>
                            
                            <div
                                className={`sp-checkbox ${t.completed ? 'checked' : ''}`}
                                onClick={() => handleToggleTask(t._id, t.status)}
                                title={t.completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                            >
                                {t.completed && <Check size={14} />}
                            </div>

                            {handleDeleteTask && (
                                <button
                                    onClick={() => handleDeleteTask(t._id)}
                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                    title="Delete task"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📅</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>No tasks scheduled for this week</div>
                        <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Add tasks manually or use AI Plan Builder to create your schedule.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
