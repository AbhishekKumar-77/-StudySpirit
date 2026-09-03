import React from 'react';
import {
    Sparkles, ArrowRight, MessageSquare, Volume2, Mic, Globe,
    FileText, CheckCircle2, AlertCircle, ShieldCheck, Flame, Star,
    PlayCircle, Trophy, BarChart3, Clock, ChevronRight, Presentation,
    PenTool, BookOpen, Layers
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

    const modules = [
        {
            number: '01',
            title: 'Spoken Fluency & AI Coach',
            desc: 'Real-time spoken dialogue with Aria, phonetic pronunciation training, and 2-min extempore drills.',
            color: 'from-purple-600 to-indigo-600',
            submodules: [
                { id: 'conversation', label: 'AI Spoken Coach', icon: MessageSquare, action: 'Live Voice Chat' },
                { id: 'pronunciation', label: 'Pronunciation & Phonetics', icon: Volume2, action: 'IPA Drills' },
                { id: 'extempore', label: 'Extempore Impromptu Talk', icon: Mic, action: '2-Min Challenge' }
            ]
        },
        {
            number: '02',
            title: 'Career & Workplace Communication',
            desc: 'Real-life roleplay scenarios with professors and tech leads, professional writing lab, and presentation coaching.',
            color: 'from-blue-600 to-cyan-600',
            submodules: [
                { id: 'situations', label: 'Real-Life Roleplay', icon: Globe, action: 'Agile & Academic' },
                { id: 'writing', label: 'Professional Writing Lab', icon: FileText, action: 'Tone & Emails' },
                { id: 'presentation', label: 'Presentation & Body Language', icon: Presentation, action: 'Pitch Drills' }
            ]
        },
        {
            number: '03',
            title: 'Language Mechanics & Vocabulary',
            desc: 'Targeted grammar exercises from your logged mistakes, high-impact tech vocabulary decks, and flashcards.',
            color: 'from-emerald-600 to-teal-600',
            submodules: [
                { id: 'grammar', label: 'Targeted Grammar Coach', icon: PenTool, action: 'Mistake Quizzes' },
                { id: 'vocabulary', label: 'Vocabulary & Idiom Builder', icon: BookOpen, action: 'Flashcards' }
            ]
        },
        {
            number: '04',
            title: 'Progress Analytics & Mistake Bank',
            desc: '6-axis skills radar, error logs with direct practice links, personal vocabulary bank, and weekly targets.',
            color: 'from-amber-600 to-orange-600',
            submodules: [
                { id: 'progress', label: 'Skills Radar & Reports', icon: BarChart3, action: 'View Metrics' }
            ]
        }
    ];

    const todayMicroHabits = [
        { title: 'Free Spoken Talk', duration: '5 min', tab: 'conversation', icon: MessageSquare, tag: 'Fluency' },
        { title: 'Sound Drill: /r/ & /th/', duration: '3 min', tab: 'pronunciation', icon: Volume2, tag: 'Phonetics' },
        { title: 'Learn 5 Tech Verbs', duration: '3 min', tab: 'vocabulary', icon: BookOpen, tag: 'Vocab' },
        { title: 'Draft a Sprint Email', duration: '4 min', tab: 'writing', icon: FileText, tag: 'Writing' }
    ];

    return (
        <div className="space-y-6">
            {/* Top Greeting Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Soft Skills & Communication Lab 👋
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Welcome, <strong>{studentName}</strong>. Build conversational fluency, professional presence, and language mechanics.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenLevelTest}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 shadow-2xs transition-all"
                    >
                        <Trophy className="w-4 h-4 text-purple-600" />
                        Diagnostic Level Test
                    </button>
                    <button
                        onClick={onStartPracticePlan}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-purple-600/20 transition-all"
                    >
                        <PlayCircle className="w-4 h-4" />
                        Start 15-Min Daily Habit
                    </button>
                </div>
            </div>

            {/* Top Banner: Aria Assistant + CEFR Level Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Aria Persistent Spotlight */}
                <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 lg:col-span-2">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <span className="px-2.5 py-1 bg-white/20 text-purple-200 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                AI Spoken Coach Active
                            </span>
                            <h2 className="text-xl font-black leading-snug">
                                Ready to practice today's soft skills session?
                            </h2>
                            <p className="text-xs text-purple-200 leading-relaxed max-w-lg">
                                Aria listens in real-time, gently highlights subtle grammar corrections, and prepares you for technical interviews, agile standups, and college presentations.
                            </p>
                        </div>

                        <div className="w-14 h-14 rounded-2xl border-2 border-purple-400 overflow-hidden shadow-lg flex-shrink-0">
                            <AriaAvatar isSpeaking={false} className="w-full h-full" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={() => onNavigateTab('conversation')}
                            className="px-5 py-2.5 bg-white text-purple-900 font-black text-xs rounded-xl hover:bg-purple-50 shadow-md transition-all flex items-center gap-1.5"
                        >
                            <MessageSquare className="w-4 h-4 text-purple-600" /> Talk with Aria Now
                        </button>
                        <button
                            onClick={() => onNavigateTab('extempore')}
                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                        >
                            <Mic className="w-4 h-4" /> 2-Min Extempore Challenge
                        </button>
                    </div>
                </div>

                {/* CEFR Level & 6-Axis Overview */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CEFR Readiness</span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold text-[10px] rounded-md">
                                Level {profile.cefrLevel || 'B1'}
                            </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 mt-1">Overall Soft Skills Rating</h3>
                    </div>

                    <div className="space-y-2">
                        {[
                            { label: 'Fluency', val: scores.fluencyScore, color: 'bg-purple-600' },
                            { label: 'Pronunciation', val: scores.pronunciationScore, color: 'bg-cyan-500' },
                            { label: 'Grammar', val: scores.grammarScore, color: 'bg-emerald-500' },
                            { label: 'Vocabulary', val: scores.vocabularyScore, color: 'bg-amber-500' }
                        ].map((m, idx) => (
                            <div key={idx} className="space-y-0.5">
                                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                                    <span>{m.label}</span>
                                    <span>{m.val}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.val}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => onNavigateTab('progress')}
                        className="text-xs font-bold text-purple-700 hover:underline flex items-center justify-between pt-1 border-t border-slate-100"
                    >
                        <span>View Full Skills Radar & Bank</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Daily 15-Minute Micro-Habit Plan */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            Today's 15-Minute Micro-Practice Plan
                        </h3>
                        <p className="text-[11px] text-slate-500">4 focused micro-drills to build daily English confidence.</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-700 rounded-lg">
                        🔥 7 Day Streak
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {todayMicroHabits.map((habit, idx) => {
                        const Icon = habit.icon;
                        return (
                            <div
                                key={idx}
                                onClick={() => onNavigateTab(habit.tab)}
                                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all cursor-pointer space-y-2 group flex flex-col justify-between"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                            {habit.duration}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-purple-700 transition-colors">
                                        {habit.title}
                                    </h4>
                                </div>
                                <span className="text-[11px] font-bold text-purple-600 group-hover:underline flex items-center gap-1 pt-2">
                                    Start Drill <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 4 ORGANIZED MODULES CARDS GRID */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    Structured Learning Modules & Submodules
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {modules.map((mod, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center">
                                        {mod.number}
                                    </span>
                                    <h4 className="font-black text-slate-900 text-base">{mod.title}</h4>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">{mod.desc}</p>
                            </div>

                            {/* Submodule Action Buttons */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                {mod.submodules.map((sub, sIdx) => {
                                    const Icon = sub.icon;
                                    return (
                                        <button
                                            key={sIdx}
                                            onClick={() => onNavigateTab(sub.id)}
                                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-4 h-4 text-slate-500 group-hover:text-purple-600" />
                                                <div>
                                                    <span className="font-bold text-slate-900 text-xs group-hover:text-purple-700 block">
                                                        {sub.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-purple-700 group-hover:border-purple-300">
                                                {sub.action} →
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
