import React from 'react';
import { Plus, X } from 'lucide-react';

export default function AddTaskModal({
    isOpen,
    onClose,
    onSubmit,
    newTaskForm,
    setNewTaskForm
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
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>+ Add Learning Task</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                            Task Title
                        </label>
                        <input
                            type="text"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                            placeholder="e.g. Binary Search Trees — Practice"
                            value={newTaskForm.title}
                            onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                                Day Label
                            </label>
                            <input
                                type="text"
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                value={newTaskForm.dayLabel}
                                onChange={(e) => setNewTaskForm({ ...newTaskForm, dayLabel: e.target.value })}
                                placeholder="e.g. Thu 15, Mon, Wed"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                                Task Type
                            </label>
                            <select
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                value={newTaskForm.taskType}
                                onChange={(e) => setNewTaskForm({ ...newTaskForm, taskType: e.target.value })}
                            >
                                <option value="LEARN">LEARN</option>
                                <option value="PRACTICE">PRACTICE</option>
                                <option value="QUIZ">QUIZ</option>
                                <option value="ASSESSMENT">ASSESSMENT</option>
                                <option value="PROJECT">PROJECT</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                                Duration (mins)
                            </label>
                            <input
                                type="number"
                                min="10"
                                max="360"
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                value={newTaskForm.durationMinutes}
                                onChange={(e) => setNewTaskForm({ ...newTaskForm, durationMinutes: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                                Course / Topic
                            </label>
                            <input
                                type="text"
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                value={newTaskForm.courseName}
                                onChange={(e) => setNewTaskForm({ ...newTaskForm, courseName: e.target.value })}
                                placeholder="e.g. Data Structures"
                            />
                        </div>
                    </div>

                    <button type="submit" className="sp-btn-continue" style={{ padding: '12px' }}>
                        Add Task to Weekly Schedule
                    </button>
                </form>
            </div>
        </div>
    );
}
