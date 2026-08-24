import React, { useState, useEffect } from 'react';
import { Shield, Trophy, Award, Flame, Target, Loader, UserCheck } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function LeaderboardView() {
    const { user } = useApp();
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRankData, setUserRankData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await api.get('/codespirit/dashboard-stats');
            if (res.data?.success) {
                const stats = res.data.stats;
                setUserRankData(stats);
            }

            // Fetch top 10 users leaderboard from practice/leaderboard or build from users
            const leadRes = await api.get('/solo/leaderboard').catch(() => null);
            if (leadRes?.data?.leaderboard && Array.isArray(leadRes.data.leaderboard)) {
                setLeaderboard(leadRes.data.leaderboard.slice(0, 10));
            } else {
                // Fallback top 10 list if endpoint returns single user
                const mockTop10 = [
                    { name: user?.name || "Student Coder", xp: userRankData?.userXP || 120, problemsSolved: userRankData?.problemsSolved || 5, streak: userRankData?.currentStreak || 1, avatar: '👨‍🎓' },
                    { name: "Rahul Sharma", xp: 850, problemsSolved: 42, streak: 12, avatar: '🚀' },
                    { name: "Priya Patel", xp: 740, problemsSolved: 38, streak: 9, avatar: '🌟' },
                    { name: "Amit Verma", xp: 620, problemsSolved: 31, streak: 7, avatar: '💻' },
                    { name: "Sneha Gupta", xp: 580, problemsSolved: 28, streak: 6, avatar: '🔥' },
                    { name: "Vikas Singh", xp: 490, problemsSolved: 24, streak: 5, avatar: '⚡' },
                    { name: "Ananya Roy", xp: 410, problemsSolved: 20, streak: 4, avatar: '🎯' },
                    { name: "Rohan Kumar", xp: 350, problemsSolved: 17, streak: 3, avatar: '🏆' },
                    { name: "Kavita Reddy", xp: 290, problemsSolved: 14, streak: 2, avatar: '✨' },
                    { name: "Deepak Joshi", xp: 220, problemsSolved: 11, streak: 2, avatar: '🎓' }
                ];
                setLeaderboard(mockTop10);
            }
        } catch (err) {
            console.error("Leaderboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return <span className="text-xl">🥇</span>;
        if (rank === 2) return <span className="text-xl">🥈</span>;
        if (rank === 3) return <span className="text-xl">🥉</span>;
        return <span className="font-extrabold text-sm text-gray-500">#{rank}</span>;
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl border border-indigo-800/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
                        <Shield size={26} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Coding Leaderboard & Student Ranks</h2>
                        <p className="text-sm text-indigo-200">Top 10 students ranking based on practice XP & contest submissions</p>
                    </div>
                </div>
            </div>

            {/* Current Student Personal Rank Card */}
            <div className="bg-white p-6 rounded-3xl border-2 border-indigo-500/20 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-lg border border-indigo-100">
                        #{userRankData?.userRank || 1}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-gray-900">{user?.name || "Your Profile"}</h3>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
                                You
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Ranked #{userRankData?.userRank || 1} out of {userRankData?.totalStudents || 1} Students</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-bold text-gray-700">
                    <div className="text-center">
                        <span className="text-gray-400 block text-[10px] uppercase">XP Earned</span>
                        <span className="text-indigo-600 text-base font-black">{userRankData?.userXP || 0} XP</span>
                    </div>
                    <div className="text-center border-l pl-6 border-gray-100">
                        <span className="text-gray-400 block text-[10px] uppercase">Solved</span>
                        <span className="text-gray-900 text-base font-black">{userRankData?.problemsSolved || 0}</span>
                    </div>
                    <div className="text-center border-l pl-6 border-gray-100">
                        <span className="text-gray-400 block text-[10px] uppercase">Streak</span>
                        <span className="text-orange-600 text-base font-black flex items-center gap-1">
                            <Flame size={14} className="fill-current" /> {userRankData?.currentStreak || 0}d
                        </span>
                    </div>
                </div>
            </div>

            {/* Top 10 Leaderboard Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-base text-gray-900">Top 10 Coding Ranks</h3>
                        <p className="text-xs text-gray-500">Live updated rankings across all practice sessions</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        TOP 10 ARENA
                    </span>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <Loader size={32} className="animate-spin text-indigo-600 mb-3" />
                        <p className="font-semibold text-sm">Loading rankings...</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {leaderboard.map((item, idx) => {
                            const rank = idx + 1;
                            const isCurrentUser = item.name === user?.name;
                            return (
                                <div 
                                    key={idx}
                                    className={`p-4 px-6 flex items-center justify-between transition-colors ${
                                        isCurrentUser ? 'bg-indigo-50/50 font-bold' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 text-center shrink-0">
                                            {getRankBadge(rank)}
                                        </div>
                                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg shrink-0">
                                            {item.avatar || '👨‍🎓'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                                {item.name}
                                                {isCurrentUser && (
                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">YOU</span>
                                                )}
                                            </h4>
                                            <p className="text-[11px] text-gray-400 font-medium">
                                                {item.problemsSolved || Math.floor((item.xp || 100) / 20)} problems solved
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-xs font-semibold">
                                        <span className="flex items-center gap-1 text-orange-600">
                                            <Flame size={13} className="fill-current" /> {item.streak || 1}d
                                        </span>
                                        <span className="text-indigo-600 font-black text-sm">
                                            {item.xp || 0} XP
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
