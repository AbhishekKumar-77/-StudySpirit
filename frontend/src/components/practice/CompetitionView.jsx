import React, { useState, useEffect } from 'react';
import { 
    Trophy, Swords, Medal, Crown, Flame, Award, Zap, 
    CheckCircle2, Sparkles, User, ArrowRight, ShieldCheck, Play 
} from 'lucide-react';
import { API_BASE } from '../../config';
import { useApp } from '../../context/AppContext';

export default function CompetitionView({ activeSubTab = 'leaderboard', onStartSession }) {
    const { user } = useApp();
    const [currentTab, setCurrentTab] = useState(activeSubTab);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setCurrentTab(activeSubTab);
    }, [activeSubTab]);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/practice/dashboard`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success && data.leaderboard && data.leaderboard.length > 0) {
                setLeaderboardData(data.leaderboard);
            } else {
                setLeaderboardData(getCleanMockLeaderboard());
            }
        } catch (e) {
            setLeaderboardData(getCleanMockLeaderboard());
        } finally {
            setLoading(false);
        }
    };

    const getCleanMockLeaderboard = () => [
        { name: "Abhishek Kumar", isUser: true, solved: 52, accuracy: 92, streak: 5, points: 1250, rank: 1, avatar: null },
        { name: "Aarav Sharma", isUser: false, solved: 48, accuracy: 88, streak: 4, points: 1120, rank: 2, avatar: null },
        { name: "Priya Patel", isUser: false, solved: 45, accuracy: 85, streak: 3, points: 1040, rank: 3, avatar: null },
        { name: "Rohan Gupta", isUser: false, solved: 39, accuracy: 82, streak: 6, points: 980, rank: 4, avatar: null },
        { name: "Sneha Reddy", isUser: false, solved: 34, accuracy: 79, streak: 2, points: 890, rank: 5, avatar: null }
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-200">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Competition & Student Arena</h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Compete on the leaderboard, attempt live speed challenges, and unlock achievement badges.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm w-fit">
                {[
                    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                    { id: 'challenges', label: 'Live Challenges', icon: Swords },
                    { id: 'achievements', label: 'Achievements & Badges', icon: Medal }
                ].map((tab) => {
                    const IconComp = tab.icon;
                    const isActive = currentTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <IconComp className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: LEADERBOARD */}
            {currentTab === 'leaderboard' && (
                <div className="space-y-6">
                    {/* Top 3 Podium Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {leaderboardData.slice(0, 3).map((student, idx) => {
                            const isFirst = idx === 0;
                            const isSecond = idx === 1;
                            const isThird = idx === 2;

                            return (
                                <div
                                    key={idx}
                                    className={`bg-white rounded-3xl border p-6 text-center space-y-4 shadow-sm relative overflow-hidden ${
                                        isFirst ? 'border-amber-300 ring-2 ring-amber-400/30' : 'border-slate-200/80'
                                    }`}
                                >
                                    {isFirst && (
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                                    )}

                                    <div className="relative inline-block">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center font-black text-indigo-700 mx-auto text-xl shadow-inner">
                                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                                        </div>
                                        <span className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md ${
                                            isFirst ? 'bg-amber-500' : isSecond ? 'bg-slate-400' : 'bg-amber-700'
                                        }`}>
                                            #{idx + 1}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-black text-slate-800 truncate px-2">
                                            {student.name || `Student ${idx + 1}`}
                                        </h3>
                                        <p className="text-[11px] font-bold text-indigo-600 mt-0.5">
                                            {student.points || 1000} Points
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400">Accuracy</p>
                                            <p className="font-extrabold text-slate-800 mt-0.5">{student.accuracy || 90}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400">Solved Qs</p>
                                            <p className="font-extrabold text-slate-800 mt-0.5">{student.solved || 40}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Leaderboard Table (Cleaned layout with NO text overlaps) */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200/80 grid grid-cols-12 text-slate-500 font-bold text-xs">
                            <span className="col-span-1 text-center">Rank</span>
                            <span className="col-span-5">Student</span>
                            <span className="col-span-2 text-center">Questions</span>
                            <span className="col-span-2 text-center">Accuracy</span>
                            <span className="col-span-2 text-right pr-4">Points</span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {leaderboardData.map((item, index) => {
                                const isCurrentUser = item.isUser || (user?.name && item.name === user.name);

                                return (
                                    <div
                                        key={index}
                                        className={`grid grid-cols-12 items-center p-4 text-xs transition-all ${
                                            isCurrentUser ? 'bg-indigo-50/70 font-bold' : 'hover:bg-slate-50/60'
                                        }`}
                                    >
                                        <span className="col-span-1 text-center font-black text-slate-700">
                                            #{index + 1}
                                        </span>

                                        <div className="col-span-5 flex items-center gap-3 min-w-0 pr-2">
                                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                                {item.name ? item.name.charAt(0).toUpperCase() : 'S'}
                                            </div>
                                            <div className="truncate min-w-0">
                                                <p className="font-extrabold text-slate-800 truncate">
                                                    {item.name || 'Anonymous Student'}
                                                </p>
                                                {isCurrentUser && (
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                                                        ( You )
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <span className="col-span-2 text-center font-bold text-slate-700">
                                            {item.solved || 0} Solved
                                        </span>

                                        <span className="col-span-2 text-center font-extrabold text-emerald-600">
                                            {item.accuracy || 0}%
                                        </span>

                                        <span className="col-span-2 text-right pr-4 font-black text-amber-600">
                                            {item.points || 0} XP
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: LIVE CHALLENGES */}
            {currentTab === 'challenges' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-7 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-black border border-amber-300/30 flex items-center gap-1.5">
                                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                                1v1 Speed Battle
                            </span>
                            <span className="text-xs text-indigo-200 font-bold">5 Questions • 60s</span>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black">Speed Sprint Challenge</h3>
                            <p className="text-xs text-indigo-100/90 leading-relaxed font-medium">
                                Test your quick-thinking speed! Answer 5 questions in under 60 seconds to climb the weekly speed leaderboard.
                            </p>
                        </div>

                        <button
                            onClick={() => onStartSession && onStartSession({ mode: 'smart', topic: 'Python Speed Challenge' })}
                            className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4 fill-slate-950" />
                            <span>Start 1v1 Speed Battle</span>
                        </button>
                    </div>

                    <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-black border border-purple-100 flex items-center gap-1.5">
                                <Trophy className="w-4 h-4 text-purple-600" />
                                Weekly Cup
                            </span>
                            <span className="text-xs text-slate-400 font-bold">Ends Sunday</span>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-800">1st Sem Python Cup</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Solve 15 questions covering Module 1, Variables, and Data Types. Highest score wins the 1st Sem Champion badge!
                            </p>
                        </div>

                        <button
                            onClick={() => onStartSession && onStartSession({ mode: 'smart', topic: '1st Sem Python Cup' })}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Enter Semester Tournament</span>
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 3: ACHIEVEMENTS & BADGES */}
            {currentTab === 'achievements' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { title: "Python Explorer", desc: "Completed Module 1 practice questions", unlocked: true, icon: Award, color: "indigo" },
                        { title: "Variables Specialist", desc: "Achieved >80% accuracy in Module 2 Variables", unlocked: true, icon: CheckCircle2, color: "emerald" },
                        { title: "5-Day Streak", desc: "Practiced 5 consecutive days", unlocked: true, icon: Flame, color: "amber" },
                        { title: "Speed Demon", desc: "Answered 5 questions in under 60s", unlocked: false, icon: Zap, color: "purple" },
                        { title: "Accuracy Master", desc: "Scored 100% accuracy in a practice session", unlocked: false, icon: ShieldCheck, color: "rose" },
                        { title: "Tournament Champion", desc: "Top 3 rank in Weekly Semester Cup", unlocked: false, icon: Crown, color: "amber" }
                    ].map((badge, idx) => {
                        const IconComp = badge.icon;

                        return (
                            <div
                                key={idx}
                                className={`p-6 rounded-3xl border text-center space-y-3 transition-all ${
                                    badge.unlocked
                                        ? 'bg-white border-slate-200/80 shadow-sm'
                                        : 'bg-slate-50/70 border-slate-200/50 opacity-60'
                                }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-bold shadow-sm ${
                                    badge.unlocked ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                                }`}>
                                    <IconComp className="w-7 h-7" />
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-sm font-extrabold text-slate-800">
                                        {badge.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                        {badge.desc}
                                    </p>
                                </div>

                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                    badge.unlocked ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {badge.unlocked ? 'Unlocked ✓' : 'Locked'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
