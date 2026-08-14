import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Flame, TrendingUp, Award, Users, Star, Sparkles } from 'lucide-react';
import { API_BASE } from '../../config';

export default function LeaderboardView() {
    const [activeTab, setActiveTab] = useState('global'); // 'global' | 'university' | 'most_improved' | 'weekly'
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const fetchLB = async () => {
            try {
                const res = await fetch(`${API_BASE}/quiz/leaderboard`, { credentials: 'include' });
                const data = await res.json();
                if (data.success) {
                    setLeaderboard(data.leaderboard);
                }
            } catch (e) {
                console.error("Leaderboard Fetch Error:", e);
            }
        };
        fetchLB();
    }, [activeTab]);

    // Demo Most Improved fallback list if selected
    const displayList = activeTab === 'most_improved' ? [
        { rank: 1, name: "Rahul Sharma", avatar: "👨‍🎓", previousScore: 45, currentScore: 78, improvement: "+33%", streak: 9 },
        { rank: 2, name: "Priya Patel", avatar: "👩‍🎓", previousScore: 52, currentScore: 84, improvement: "+32%", streak: 11 },
        { rank: 3, name: "Abhishek Kumar", avatar: "👨‍🎓", previousScore: 55, currentScore: 82, improvement: "+27%", streak: 8 },
        { rank: 4, name: "Ananya Singh", avatar: "👩‍🎓", previousScore: 60, currentScore: 85, improvement: "+25%", streak: 6 }
    ] : leaderboard;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                        <Trophy className="w-6 h-6 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800">Student Competition & Leaderboard</h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Recognizing top performers, consistent streak holders, and most improved learners.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                {[
                    { id: 'global', label: 'Global Rank' },
                    { id: 'university', label: 'University' },
                    { id: 'most_improved', label: '🌟 Most Improved' },
                    { id: 'weekly', label: 'Weekly Leaders' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Leaderboard Table / Cards */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-1">
                {displayList.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-400">Loading leaderboard rankings...</div>
                ) : (
                    displayList.map((userItem, idx) => {
                        const isTop3 = idx < 3;
                        const rankBadge = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

                        return (
                            <div 
                                key={idx}
                                className={`p-4 flex items-center justify-between border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${
                                    userItem.isYou ? 'bg-indigo-50/60 font-bold border-l-4 border-l-indigo-600' : ''
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="w-8 text-center text-sm font-black text-slate-700">
                                        {rankBadge}
                                    </span>
                                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg">
                                        {userItem.avatar || '👨‍🎓'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                            {userItem.name}
                                            {userItem.isYou && <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[9px] rounded font-extrabold">YOU</span>}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {activeTab === 'most_improved' ? `Improved from ${userItem.previousScore}% → ${userItem.currentScore}%` : `${userItem.quizzesTaken || 12} Quizzes Completed`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs font-black text-indigo-600">
                                            {activeTab === 'most_improved' ? userItem.improvement : `${userItem.score || 88}%`}
                                        </p>
                                        <p className="text-[9px] text-slate-400 uppercase font-bold">
                                            {activeTab === 'most_improved' ? 'Growth' : 'Accuracy'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                                        <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                                        <span>{userItem.streak || 8}d</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
