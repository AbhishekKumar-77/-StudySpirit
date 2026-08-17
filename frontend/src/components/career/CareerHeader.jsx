import React from 'react';
import { Search, Bell, Flame, Star } from 'lucide-react';

export default function CareerHeader({ user, searchQuery, setSearchQuery }) {
    const studentName = user?.name || 'Abhishek Kumar';

    return (
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-30 flex items-center justify-between gap-4">
            {/* Search Input Bar */}
            <div className="flex-1 max-w-xl relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs, internships, companies..."
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-800 transition"
                />
            </div>

            {/* Header Controls Right */}
            <div className="flex items-center gap-3">
                {/* Notifications Bell */}
                <button className="relative p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-slate-600 transition">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>

                {/* 7 Day Streak Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-2xl text-xs font-extrabold text-orange-600">
                    <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                    <span>7 day streak</span>
                </div>

                {/* 320 XP Counter */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-2xl text-xs font-extrabold text-amber-600">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>320 XP</span>
                </div>

                {/* Student Profile Pill */}
                <div className="flex items-center gap-2.5 pl-2">
                    <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                        {studentName.charAt(0)}
                    </div>
                    <div className="hidden md:block text-left">
                        <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{studentName}</h4>
                        <p className="text-[10px] font-bold text-slate-400">B.Tech CSE</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
