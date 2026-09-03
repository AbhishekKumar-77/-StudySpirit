import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';

export default function AddDeadlineModal({
    isOpen,
    onClose,
    onSubmit,
    deadlineForm,
    setDeadlineForm
}) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            padding: '16px'
        }}>
            <div style={{
                background: '#ffffff',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '480px',
                padding: '28px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>📅 + Add New Deadline</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                            Deadline Title / Exam Name
                        </label>
                        <input
                            type="text"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                            placeholder="e.g. Operating Systems Final Exam"
                            value={deadlineForm.title}
                            onChange={(e) => setDeadlineForm({ ...deadlineForm, title: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                                Category
                            </label>
                            <select
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                value={deadlineForm.category}
                                onChange={(e) => setDeadlineForm({ ...deadlineForm, category: e.target.value })}
                            >
                                <option value="Academic">Academic</option>
                                <option value="Projects">Projects</option>
                                <option value="Career">Career</option>
                                <option value="Exam">Exam</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                                Urgency Level
                            </label>
                            <select
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                value={deadlineForm.urgency}
                                onChange={(e) => setDeadlineForm({ ...deadlineForm, urgency: e.target.value })}
                            >
                                <option value="Due this week">Due this week</option>
                                <option value="Due next week">Due next week</option>
                                <option value="Due this month">Due this month</option>
                                <option value="Upcoming">Upcoming</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                            Due Date
                        </label>
                        <input
                            type="text"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                            placeholder="e.g. May 30, 2026 or Jun 15, 2026"
                            value={deadlineForm.date}
                            onChange={(e) => setDeadlineForm({ ...deadlineForm, date: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="sp-btn-continue" style={{ padding: '12px' }}>
                        Save Deadline
                    </button>
                </form>
            </div>
        </div>
    );
}
