import React from 'react';
import { Target, X } from 'lucide-react';

export default function SetGoalModal({
    isOpen,
    onClose,
    onSubmit,
    newGoalForm,
    setNewGoalForm
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
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>🎯 Set Primary Career Goal</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                            Target Career Role
                        </label>
                        <input
                            type="text"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                            value={newGoalForm.role}
                            onChange={(e) => setNewGoalForm({ ...newGoalForm, role: e.target.value })}
                            placeholder="e.g. Software Engineer, Machine Learning Engineer"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                            Target Target Date
                        </label>
                        <input
                            type="text"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                            value={newGoalForm.targetDate}
                            onChange={(e) => setNewGoalForm({ ...newGoalForm, targetDate: e.target.value })}
                            placeholder="e.g. June 2027, December 2026"
                            required
                        />
                    </div>

                    <button type="submit" className="sp-btn-continue" style={{ padding: '12px' }}>
                        Save Career Goal
                    </button>
                </form>
            </div>
        </div>
    );
}
