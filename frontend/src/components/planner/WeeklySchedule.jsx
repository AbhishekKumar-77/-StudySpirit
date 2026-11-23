import React from 'react';
import { Plus, Check, Trash2, Clock, Calendar as CalendarIcon, BookOpen, Code, FileQuestion, Award, Rocket } from 'lucide-react';

const TASK_TYPE_CONFIG = {
    LEARN: { icon: '📖', color: '#0284c7', bg: '#eff6ff', label: 'LEARN' },
    PRACTICE: { icon: '💻', color: '#7e22ce', bg: '#faf5ff', label: 'PRACTICE' },
    QUIZ: { icon: '❓', color: '#d97706', bg: '#fffbeb', label: 'QUIZ' },
    ASSESSMENT: { icon: '📝', color: '#dc2626', bg: '#fef2f2', label: 'ASSESSMENT' },
    PROJECT: { icon: '🚀', color: '#059669', bg: '#ecfdf5', label: 'PROJECT' }
};

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklySchedule({
    state,
    handleToggleTask,
    handleDeleteTask,
    setShowAddTaskModal,
    searchQuery
}) {
    const allTasks = (state.tasks || []).filter(t =>
        t.title.toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    // Group tasks by day for a structured view
    const tasksByDay = {};
    allTasks.forEach(t => {
        const day = (t.dayLabel || 'Mon').replace(/\s*\d+$/, '').trim(); // "Mon 12" -> "Mon"
        if (!tasksByDay[day]) tasksByDay[day] = [];
        tasksByDay[day].push(t);
    });

    const completedCount = allTasks.filter(t => t.completed).length;
    const totalMinutes = allTasks.reduce((s, t) => s + (t.durationMinutes || 60), 0);
    const completedMinutes = allTasks.filter(t => t.completed).reduce((s, t) => s + (t.durationMinutes || 60), 0);

    return (
        <div className="sp-section-card">
            <div className="sp-section-title-row">
                <div>
                    <div className="sp-section-title">This Week's Study Schedule</div>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                        Your personalized daily study plan with specific chapters, topics, and practice sessions.
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

            {/* Weekly Summary Metrics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '14px',
                margin: '20px 0',
                background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
                padding: '18px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0'
            }}>
                <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Tasks</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{allTasks.length}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Completed</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{completedCount} / {allTasks.length}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Study Time</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7e22ce' }}>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Time Completed</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7' }}>{Math.floor(completedMinutes / 60)}h {completedMinutes % 60}m</div>
                </div>
            </div>

            {/* Tasks grouped by day */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {allTasks.map((t, idx) => {
                    const typeConf = TASK_TYPE_CONFIG[t.taskType] || TASK_TYPE_CONFIG.LEARN;
                    return (
                        <div
                            key={t._id || idx}
                            className="sp-task-row"
                            style={{
                                padding: '16px 20px',
                                background: t.completed ? '#f0fdf4' : '#ffffff',
                                border: t.completed ? '1.5px solid #bbf7d0' : '1px solid #e2e8f0',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {/* Left: Day + Content */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>
                                {/* Day badge */}
                                <div style={{
                                    minWidth: '52px',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    background: t.completed ? '#dcfce7' : '#f1f5f9',
                                    textAlign: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    color: t.completed ? '#166534' : '#334155'
                                }}>
                                    {t.dayLabel || 'Day'}
                                </div>

                                {/* Task details */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 700,
                                        color: t.completed ? '#166534' : '#0f172a',
                                        textDecoration: t.completed ? 'line-through' : 'none',
                                        lineHeight: 1.4
                                    }}>
                                        {t.title}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', flexWrap: 'wrap' }}>
                                        {t.courseName && (
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: '#6366f1',
                                                background: '#eef2ff',
                                                padding: '2px 8px',
                                                borderRadius: '6px'
                                            }}>
                                                📚 {t.courseName}
                                            </span>
                                        )}
                                        {t.topic && (
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: '#7c3aed',
                                                background: '#f5f3ff',
                                                padding: '2px 8px',
                                                borderRadius: '6px'
                                            }}>
                                                🏷️ {t.topic}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Duration, Type, Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                <div style={{
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    color: '#64748b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <Clock size={14} />
                                    {t.durationMinutes || 60} min
                                </div>

                                <span style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    color: typeConf.color,
                                    background: typeConf.bg,
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.03em'
                                }}>
                                    {typeConf.icon} {typeConf.label}
                                </span>

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
                    );
                })}

                {allTasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                        <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>📅</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: '8px' }}>No study tasks scheduled yet</div>
                        <p style={{ fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
                            Use the <strong>AI Plan Builder</strong> to generate a personalized weekly study plan with specific chapters and topics, or add tasks manually.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
