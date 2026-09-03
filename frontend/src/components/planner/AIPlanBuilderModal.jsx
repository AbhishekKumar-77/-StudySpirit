import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

export default function AIPlanBuilderModal({
    isOpen,
    onClose,
    onGenerate,
    aiForm,
    setAiForm,
    loading
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
                maxWidth: '520px',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                position: 'relative',
                animation: 'modalFadeIn 0.2s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7e22ce, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>AI Study Plan Builder</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Powered by Groq LLaMA-3.3 Intelligence</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={onGenerate}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                            Target Career Role
                        </label>
                        <input
                            type="text"
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                            value={aiForm.targetRole}
                            onChange={(e) => setAiForm({ ...aiForm, targetRole: e.target.value })}
                            placeholder="e.g. Backend Developer, AI Engineer, Fullstack Architect"
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                                Daily Study Hours
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="16"
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                                value={aiForm.hoursPerDay}
                                onChange={(e) => setAiForm({ ...aiForm, hoursPerDay: Number(e.target.value) })}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                                Focus Domain
                            </label>
                            <select
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                                value={aiForm.preferredFocus}
                                onChange={(e) => setAiForm({ ...aiForm, preferredFocus: e.target.value })}
                            >
                                <option value="Data Structures & Algorithms">DSA & Problem Solving</option>
                                <option value="Web Development & APIs">Fullstack & Web Tech</option>
                                <option value="AI & Machine Learning">AI / Machine Learning</option>
                                <option value="Cloud & DevOps">Cloud & Systems</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '0.82rem', color: '#64748b' }}>
                        ✨ The AI will automatically construct a custom 5-step career progression roadmap and populate your weekly schedule with tailored study sessions.
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="sp-btn-continue"
                        style={{
                            padding: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.8 : 1
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Generating AI Roadmap...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                <span>Generate Personalized Plan</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
