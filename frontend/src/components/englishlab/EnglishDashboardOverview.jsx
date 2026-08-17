import React from 'react';
import {
    Sparkles, ArrowRight, MessageSquare, Volume2, Mic, Globe,
    FileText, CheckCircle2, AlertCircle, ShieldCheck, Flame, Star,
    PlayCircle, Trophy, BarChart3, Clock, ChevronRight
} from 'lucide-react';
import AriaAvatar from '../AriaAvatar';

export default function EnglishDashboardOverview({
    user = {},
    profile = {},
    onNavigateTab,
    onOpenLevelTest,
    onStartPracticePlan
}) {
    const studentName = user?.name ? user.name.split(' ')[0] : 'Abhishek';
    const scores = profile.scores || {
        speakingScore: 68,
        pronunciationScore: 61,
        grammarScore: 72,
        vocabularyScore: 58,
        fluencyScore: 64,
        confidenceScore: 70,
        overallConfidence: 64
    };

    const metricBars = [
        { label: 'Speaking', val: scores.speakingScore, color: 'bg-purple-600', text: 'text-purple-600' },
        { label: 'Pronunciation', val: scores.pronunciationScore, color: 'bg-cyan-500', text: 'text-cyan-600' },
        { label: 'Grammar', val: scores.grammarScore, color: 'bg-emerald-500', text: 'text-emerald-600' },
        { label: 'Vocabulary', val: scores.vocabularyScore, color: 'bg-amber-500', text: 'text-amber-600' },
        { label: 'Fluency', val: scores.fluencyScore, color: 'bg-indigo-600', text: 'text-indigo-600' },
        { label: 'Confidence', val: scores.confidenceScore, color: 'bg-pink-500', text: 'text-pink-600' }
    ];

    const todayPlan = [
        { type: 'Speak', duration: '5 min', title: 'Free Talk', color: 'bg-purple-100 text-purple-700' },
        { type: 'Pronunciation', duration: '3 min', title: 'Sound Practice', color: 'bg-cyan-100 text-cyan-700' },
        { type: 'Vocabulary', duration: '3 min', title: '5 New Words', color: 'bg-amber-100 text-amber-700' },
        { type: 'Conversation', duration: '4 min', title: 'Talk with Aria', color: 'bg-emerald-100 text-emerald-700' }
    ];

    const chooseCards = [
        { id: 'conversation', title: 'AI Conversation', desc: 'Talk with Aria on any topic and improve fluency.', buttonText: 'Start Talking →', icon: MessageSquare, bg: 'bg-purple-50 hover:bg-purple-100/70 border-purple-200' },
        { id: 'pronunciation', title: 'Pronunciation Coach', desc: 'Perfect your pronunciation sound by sound.', buttonText: 'Practice Now →', icon: Volume2, bg: 'bg-cyan-50 hover:bg-cyan-100/70 border-cyan-200' },
        { id: 'extempore', title: 'Extempore', desc: 'Speak on random topics within the given time.', buttonText: 'Start Challenge →', icon: Mic, bg: 'bg-amber-50 hover:bg-amber-100/70 border-amber-200' },
        { id: 'situations', title: 'Real Situations', desc: 'Practice real-life conversations with AI scenarios.', buttonText: 'Explore →', icon: Globe, bg: 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200' },
        { id: 'writing', title: 'Writing Lab', desc: 'Improve your writing with AI feedback.', buttonText: 'Write Now →', icon: FileText, bg: 'bg-pink-50 hover:bg-pink-100/70 border-pink-200' }
    ];

    const recommendations = [
        { title: 'Fluency Drill', category: 'Fluency', desc: 'Improve your speaking pace & reduce pauses', action: 'extempore' },
        { title: 'Grammar Practice', category: 'Grammar', desc: 'Fix subject-verb agreement patterns', action: 'grammar' },
        { title: 'Vocabulary Builder', category: 'Vocabulary', desc: 'Technology & Workplace terms', action: 'vocabulary' }
    ];

    const recentSessions = [
        { title: 'AI Conversation', topic: 'College Project', score: 68, type: 'conversation' },
        { title: 'Pronunciation', topic: '/r/ and /th/ sounds', score: 72, type: 'pronunciation' },
        { title: 'Extempore', topic: 'Should AI replace jobs?', score: 65, type: 'extempore' },
        { title: 'Writing Lab', topic: 'Professional Email', score: 70, type: 'writing' }
    ];

    return (
        <div className="space-y-6">

            {/* Top Header Greeting */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Good evening, {studentName} 👋
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Let's build your confidence and communicate like a pro.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenLevelTest}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 shadow-2xs transition-all"
                    >
                        <Trophy className="w-4 h-4 text-purple-600" />
                        Take CEFR Level Test
                    </button>
                    <button
                        onClick={onStartPracticePlan}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md hover:shadow-purple-600/20 transition-all"
                    >
                        <PlayCircle className="w-4 h-4" />
                        Start Today's 15-Min Practice
                    </button>
                </div>
            </div>

            {/* Top Row: AI Coach Aria Card + Overall English Confidence Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* AI Coach Aria Persistent Card */}
                <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-400/20 flex items-center justify-center text-purple-200">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-white">AI Coach Aria</h3>
                                <p className="text-[11px] text-purple-200">Your Personal English Coach</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex-1 bg-white/10 p-3 rounded-xl border border-white/10 text-xs text-purple-100 leading-relaxed backdrop-blur-xs">
                            "Hi {studentName}! I noticed your grammar is strong ({scores.grammarScore}%), but let's work on vocabulary ({scores.vocabularyScore}%) today."
                        </div>
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-400/60 shadow-md flex-shrink-0">
                            <AriaAvatar isSpeaking={false} className="w-full h-full" />
                        </div>
                    </div>

                    <button
                        onClick={() => onNavigateTab && onNavigateTab('conversation')}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                        Talk with Aria <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Overall English Confidence Card (Gauge + Sub-metrics) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-slate-900 text-base">Overall English Confidence</h2>
                            <p className="text-xs text-slate-500">Evaluated across 6 core communication dimensions</p>
                        </div>

                        {/* Level badge */}
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">CEFR Level</div>
                                <div className="text-xs font-black text-purple-700">{profile.cefrLevel || 'B1'} • Intermediate</div>
                            </div>
                            <button onClick={onOpenLevelTest} className="text-[11px] font-bold text-purple-600 hover:underline">
                                [ Take Level Test ]
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Circle Score Gauge */}
                        <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="text-purple-600 transition-all duration-1000" strokeDasharray={`${scores.overallConfidence}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div className="absolute text-center">
                                <span className="text-2xl font-black text-slate-900 leading-none">{scores.overallConfidence}%</span>
                                <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">Confidence</span>
                            </div>
                        </div>

                        {/* 6 Metric Sub-bars */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 w-full">
                            {metricBars.map((m, idx) => (
                                <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-700">{m.label}</span>
                                        <span className={`font-bold ${m.text}`}>{m.val}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's 15-Minute Practice Plan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            Today's 15-Minute Practice
                        </h2>
                        <p className="text-xs text-slate-500">Personalized sequence generated for your current weak areas</p>
                    </div>

                    <button
                        onClick={onStartPracticePlan}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all"
                    >
                        Start Today's Practice →
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {todayPlan.map((step, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${step.color}`}>
                                    {step.type} • {step.duration}
                                </span>
                                <span className="text-slate-300 font-black text-xs">0{idx + 1}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-xs">{step.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Choose What You Want to Do (5 Feature Cards) */}
            <div className="space-y-3">
                <h2 className="font-bold text-slate-900 text-base">Choose What You Want to Do</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {chooseCards.map(card => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.id}
                                onClick={() => onNavigateTab && onNavigateTab(card.id)}
                                className={`p-5 rounded-2xl border ${card.bg} transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-2xs`}
                            >
                                <div className="space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                                        <Icon className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {card.desc}
                                    </p>
                                </div>

                                <button className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 pt-2 text-left">
                                    {card.buttonText}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Row Grid: AI Feedback Summary + Recommended For You */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* AI Feedback Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            AI Feedback Summary
                        </h3>
                        <button onClick={() => onNavigateTab && onNavigateTab('progress')} className="text-xs font-bold text-purple-600 hover:underline">
                            View Detailed Report →
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5">
                            <span className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider block">Strengths</span>
                            <div className="space-y-1 text-slate-700 font-medium">
                                <div className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Good vocabulary usage</div>
                                <div className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Clear sentence structure</div>
                                <div className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Good speaking confidence</div>
                            </div>
                        </div>

                        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                            <span className="font-bold text-amber-800 text-[11px] uppercase tracking-wider block">Areas to Improve</span>
                            <div className="space-y-1 text-slate-700 font-medium">
                                <div className="flex items-center gap-1.5 text-amber-800"><AlertCircle className="w-3.5 h-3.5" /> Reduce long pauses</div>
                                <div className="flex items-center gap-1.5 text-amber-800"><AlertCircle className="w-3.5 h-3.5" /> Work on /r/ pronunciation</div>
                                <div className="flex items-center gap-1.5 text-amber-800"><AlertCircle className="w-3.5 h-3.5" /> Use linking words</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommended For You Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                        Recommended For You
                    </h3>

                    <div className="space-y-2.5">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-purple-600">{rec.category}</span>
                                    <div className="font-bold text-slate-900 text-xs">{rec.title}</div>
                                    <div className="text-[11px] text-slate-500">{rec.desc}</div>
                                </div>
                                <button
                                    onClick={() => onNavigateTab && onNavigateTab(rec.action)}
                                    className="px-3 py-1.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700"
                                >
                                    Start
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
