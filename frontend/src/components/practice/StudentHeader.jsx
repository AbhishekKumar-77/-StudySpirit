import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, Bell, ChevronDown, User, Sparkles, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatarHelper';

export default function StudentHeader({ userProfile, onSearch }) {
    const { user } = useApp();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (onSearch) onSearch(val);
    };

    const studentName = user?.name || userProfile?.name || "Abhishek Kumar";
    const avatar = getAvatarUrl(user?.avatar || userProfile?.avatar);
    const streak = userProfile?.summaryCards?.currentStreak?.value || user?.stats?.streak || 8;

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-sm transition-all">
            {/* Left: Brand Logo & Subtitle */}
            <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate('/dashboard')}
                title="Go to Main Dashboard"
            >
                <img
                    src="/logo-icon.png"
                    alt="StudySpirit Logo"
                    className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
                />
                <div>
                    <div className="flex items-center font-black text-lg tracking-tight">
                        <span className="text-indigo-600">Study</span>
                        <span className="text-slate-800">Spirit</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                        Learn • Practice • Grow
                    </p>
                </div>
            </div>

            {/* Center: Global Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search topics, quizzes, questions, subjects..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Right: Streak, Notifications, Profile */}
            <div className="flex items-center gap-4">
                {/* Streak Badge */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-orange-50 border border-orange-200/60 rounded-full text-orange-600 font-semibold text-xs shadow-sm hover:scale-105 transition-transform cursor-pointer">
                    <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
                    <span>{streak} Day Streak</span>
                </div>

                {/* Notifications Bell */}
                <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
                </button>
            </div>
        </header>
    );
}
