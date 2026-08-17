import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle, AlertCircle, Trophy, Brain, MessageSquare, Users, Zap, FileText,
    Mic, User, ChevronRight, ArrowRight, ExternalLink, Sparkles, Target
} from 'lucide-react';

export default function ReportView({
    sessionReport,
    isJourneyMode,
    journeyStep,
    nextJourneyStep,
    resetSessionState,
    setMode,
    setView
}) {
    const navigate = useNavigate();

    const overallScore = sessionReport?.overallScore || 78;

    // 7-Dimension score defaults
    const dimensionScores = sessionReport?.dimensionScores || {
        answerQuality: 82,
        technicalDepth: 76,
        problemSolving: 85,
        communication: 71,
        confidence: 79,
        structure: 73,
        pacing: 81
    };

    // STAR Evaluation defaults
    const starEvaluation = sessionReport?.starEvaluation || {
        situation: 85,
        task: 80,
        action: 82,
        result: 55,
        missingElements: ['Result component was incomplete in Q2', 'Action needs quantitative metrics']
    };

    // Actionable AI Improvement Plan items linking into StudySpirit modules
    const defaultImprovementPlan = [
        {
            title: '1. System Design',
            priority: 'High Priority',
            category: 'Architecture',
            actionUrl: '/resources',
            actionText: 'Practice'
        },
        {
            title: '2. STAR Responses',
            priority: 'Medium Priority',
            category: 'Behavioral',
            actionUrl: '/soft-skills',
            actionText: 'Practice'
        },
        {
            title: '3. Filler Words',
            priority: 'Medium Priority',
            category: 'Communication',
            actionUrl: '/soft-skills',
            actionText: 'Speaking Drill'
        },
        {
            title: '4. Graph Algorithms',
            priority: 'High Priority',
            category: 'Coding',
            actionUrl: '/codespirit',
            actionText: 'Practice in CodeSpirit'
        }
    ];

    const improvementPlan = (sessionReport?.improvementPlan && sessionReport.improvementPlan.length > 0)
        ? sessionReport.improvementPlan
        : defaultImprovementPlan;

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-white text-slate-800 rounded-3xl border border-slate-200 shadow-xl my-6">
            {/* Header Banner */}
            <div className="text-center border-b border-slate-100 pb-6 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100 text-xs font-bold mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Interview Performance Report</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                    {sessionReport?.targetCompany || 'Google'} — {sessionReport?.targetRole || 'Backend Developer'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">Detailed evaluation across 7 core dimensions & personalized improvement roadmap</p>
            </div>

            {/* Score Overview Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Score Card */}
                <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl text-center flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                    <div className="w-24 h-24 rounded-full border-4 border-purple-400 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md mb-2 shadow-inner">
                        <span className="text-3xl font-black text-white">{overallScore}</span>
                        <span className="text-[10px] font-bold text-purple-200">/100</span>
                    </div>
                    <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                        {overallScore >= 80 ? 'Excellent Performance' : overallScore >= 70 ? 'Good Performance' : 'Needs Practice'}
                    </span>
                    <p className="text-[10px] text-purple-300/80 mt-1 max-w-xs">
                        System Design and answer structure need improvement.
                    </p>
                </div>

                {/* 7-Dimension Score Breakdown */}
                <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-3xl p-6">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        7-Dimension Score Breakdown
                    </h3>

                    <div className="space-y-2.5">
                        {Object.entries(dimensionScores).map(([key, val]) => {
                            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            return (
                                <div key={key} className="flex items-center gap-3">
                                    <span className="w-32 text-xs font-bold text-slate-600 shrink-0">{formattedKey}</span>
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${val}%` }} />
                                    </div>
                                    <span className="w-8 text-right text-xs font-black text-slate-800">{val}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Strengths & Weaknesses Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* What You Did Well */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        What you did well
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                        {(sessionReport?.strengths?.length ? sessionReport.strengths : [
                            'Explained your project clearly',
                            'Strong technical reasoning',
                            'Good confidence and eye contact',
                            'Good practical code examples'
                        ]).map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-emerald-500 font-bold">✓</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Areas to Improve */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Areas to improve
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                        {(sessionReport?.improvements?.length ? sessionReport.improvements : [
                            'Answers were too long and lacked structure',
                            'Weak STAR structure (missing quantifiable results)',
                            'System-design trade-offs unclear',
                            'Frequent filler words during pauses'
                        ]).map((imp, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">⚠</span>
                                <span>{imp}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* AI Improvement Plan */}
            <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 mb-8 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Learning Loop</span>
                        <h3 className="text-lg font-extrabold text-white mt-0.5">Your AI Improvement Plan</h3>
                    </div>
                    <span className="text-xs text-slate-400">Connected to StudySpirit modules</span>
                </div>

                <div className="space-y-3">
                    {improvementPlan.map((plan, idx) => (
                        <div key={idx} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-white">{plan.title}</h4>
                                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                                        plan.priority?.includes('High') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    }`}>
                                        {plan.priority || 'Medium Priority'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(plan.actionUrl || '/codespirit')}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition"
                            >
                                <span>{plan.actionText || 'Practice'}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100">
                <button
                    onClick={resetSessionState}
                    className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                    Back to Dashboard
                </button>

                <button
                    onClick={() => { setMode(sessionReport?.mode || 'technical'); setView('wizard'); }}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
                >
                    Retake Interview
                </button>
            </div>
        </div>
    );
}
