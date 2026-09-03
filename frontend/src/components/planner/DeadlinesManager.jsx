import React from 'react';
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';

export default function DeadlinesManager({
    state,
    setShowAddDeadlineModal,
    handleDeleteDeadline
}) {
    const deadlines = state.deadlines || [];

    return (
        <div className="sp-section-card">
            <div className="sp-section-title-row">
                <div>
                    <div className="sp-section-title">Categorized Deadlines & Important Dates</div>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                        Track your upcoming exams, assignments, project submissions, and career deadlines.
                    </p>
                </div>
                <button
                    className="sp-btn-continue"
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => setShowAddDeadlineModal(true)}
                >
                    <Plus size={16} />
                    <span>Add Deadline</span>
                </button>
            </div>

            {/* List of Deadlines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                {deadlines.map(d => (
                    <div
                        key={d._id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 20px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{d.title}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                                <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                    {d.category || 'Academic'}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: '0.88rem',
                                    color: d.urgency?.includes('this week') ? '#dc2626' : '#d97706'
                                }}>
                                    {d.urgency || 'Upcoming'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>Due: {d.date}</div>
                            </div>

                            {handleDeleteDeadline && (
                                <button
                                    onClick={() => handleDeleteDeadline(d._id)}
                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                    title="Delete deadline"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {deadlines.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No upcoming deadlines recorded. Click "+ Add Deadline" to schedule one.
                    </div>
                )}
            </div>
        </div>
    );
}
