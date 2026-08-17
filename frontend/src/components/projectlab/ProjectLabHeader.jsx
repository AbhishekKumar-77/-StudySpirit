import React from 'react';
import { Search, Bell, Flame, Star } from 'lucide-react';

export default function ProjectLabHeader({ user, searchQuery, setSearchQuery }) {
    const userName = user?.name || 'Abhishek Kumar';
    const userRole = user?.department || 'B.Tech CSE';
    const userAvatar = user?.avatar || '👨‍💻';

    return (
        <header className="bg-white border-b border-slate-200/80 px-6 py-3 sticky top-0 z-20 flex items-center justify-between gap-4">
            {/* Center Search Input */}
            <div className="flex-1 max-w-xl relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                    placeholder="Search projects, technologies, skills..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                />
            </div>

            {/* Right Top Status & Profile Row */}
            <div className="flex items-center gap-4 flex-shrink-0">
                {/* Notification Bell */}
                <div className="relative cursor-pointer">
                    <div className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600">
                        <Bell className="w-4 h-4" />
                    </div>
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white">
                        3
                    </span>
                </div>

                {/* 7 day streak */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/80 border border-amber-200/60 rounded-xl text-amber-700 text-xs font-bold shadow-2xs">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>7 day streak</span>
                </div>

                {/* 320 XP */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50/80 border border-yellow-200/60 rounded-xl text-yellow-700 text-xs font-bold shadow-2xs">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    <span>320 XP</span>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        {userAvatar}
                    </div>
                    <div className="hidden sm:block">
                        <h4 className="font-bold text-slate-900 text-xs leading-none">{userName}</h4>
                        <span className="text-[10px] font-medium text-slate-400">{userRole}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
