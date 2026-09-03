import React from 'react';
import { BarChart3, TrendingUp, Award, Clock, BrainCircuit } from 'lucide-react';

export default function ProgressAnalytics({ state }) {
    const stats = state.stats || {};
    const profile = state.profile || {};

    return (
        <div className="sp-section-card">
            <div className="sp-section-title-row">
                <div>
                    <div className="sp-section-title">Progress & Insights Analytics</div>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                        Performance metrics, learning consistency, and AI diagnostic insights.
                    </p>
                </div>
            </div>

            {/* Performance Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '20px 0' }}>
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Overall Curriculum Progress</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', margin: '6px 0' }}>
                        {stats.overallProgressPercent || 68}%
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Ahead of {stats.percentileRank || 65}% of learners in your cohort
                    </div>
                </div>

                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Weekly Hours Invested</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7', margin: '6px 0' }}>
                        {stats.weeklyHoursSpent || '0h 0m'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Target: {stats.weeklyHoursTarget || '7h 0m'}
                    </div>
                </div>

                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Task Completion Rate</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#7e22ce', margin: '6px 0' }}>
                        {stats.completionRate || 0}%
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {stats.completionRate >= 70 ? 'On Track for Semester Milestones 🚀' : 'Keep practicing daily!'}
                    </div>
                </div>
            </div>

            {/* AI Diagnostics Banner */}
            <div style={{
                padding: '24px',
                background: '#f0fdf4',
                borderRadius: '16px',
                border: '1px solid #bbf7d0',
                marginTop: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '1rem', marginBottom: '8px' }}>
                    <BrainCircuit size={20} color="#16a34a" />
                    <span>AI Diagnostic Insights</span>
                </div>
                <p style={{ fontSize: '0.92rem', color: '#15803d', lineHeight: 1.6 }}>
                    {stats.aiStatusMessage || "Your study cadence is positive. Focus on practicing complex algorithms and data structures to maximize upcoming exam scores."}
                </p>
                <div style={{ marginTop: '14px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.8rem', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                        Current Focus: {profile.currentFocus?.course || 'Data Structures'} ({profile.currentFocus?.topic || 'Linked List'})
                    </div>
                    <div style={{ fontSize: '0.8rem', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                        Topic Mastery: {profile.currentFocus?.masteryPercent || 66}%
                    </div>
                </div>
            </div>
        </div>
    );
}
