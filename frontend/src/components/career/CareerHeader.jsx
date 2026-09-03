import React from 'react';
import { Search, Bell, Flame, Star } from 'lucide-react';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatarHelper';

export default function CareerHeader({ user, searchQuery, setSearchQuery }) {
    const studentName = user?.name || 'Abhishek Kumar';
    const streak = user?.stats?.streak || 7;
    const xp = user?.stats?.xp || 320;
    const course = user?.course || 'B.Tech CSE';
    const avatarUrl = getAvatarUrl(user?.avatar);

    return (
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-30 flex items-center justify-between gap-4">
            {/* Search Input Bar */}
            <div className="flex-1 max-w-xl relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs, internships, companies, skills..."
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-800 transition"
                />
            </div>

            {/* Header Controls Right */}
            <div className="flex items-center gap-3">
                {/* Streak Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-2xl text-xs font-extrabold text-orange-600">
                    <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                    <span>{streak} day streak</span>
                </div>

                {/* XP Counter */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-2xl text-xs font-extrabold text-amber-600">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>{xp} XP</span>
                </div>

                {/* Student Profile Pill */}
                <div className="flex items-center gap-2.5 pl-2">
                    <img
                        src={avatarUrl}
                        alt={studentName}
                        className="w-9 h-9 rounded-2xl object-cover shadow-xs border border-slate-200"
                        onError={handleAvatarError}
                    />
                    <div className="hidden md:block text-left">
                        <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{studentName}</h4>
                        <p className="text-[10px] font-bold text-slate-400">{course}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
