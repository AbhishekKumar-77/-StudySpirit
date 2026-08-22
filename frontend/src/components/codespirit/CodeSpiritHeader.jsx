import React from 'react';
import { Flame, Shield, Bell, Search, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CodeSpiritHeader({ stats, selectedSubject, setSelectedSubject }) {
    const { user } = useApp();
    const userName = user?.name ? user.name.split(' ')[0] : 'Abhishek';

    const subjects = [
        { id: 'python', name: 'Python', icon: '🐍' },
        { id: 'c', name: 'C', icon: '⚡' },
        { id: 'cpp', name: 'C++', icon: '🔷' },
        { id: 'java', name: 'Java', icon: '☕' },
        { id: 'javascript', name: 'JavaScript', icon: '🟨' },
        { id: 'dsa', name: 'DSA', icon: '🌳' },
        { id: 'sql', name: 'SQL', icon: '🗄️' }
    ];

    const currentSubjectObj = subjects.find(s => s.id === selectedSubject?.toLowerCase()) || subjects[0];

    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-gray-100/80 shadow-sm">
            {/* Left Branding, Greeting & Subtitle */}
            <div className="flex items-center gap-3.5">
                <img
                    src="/logo-icon.png"
                    alt="StudySpirit Logo"
                    className="w-11 h-11 object-contain hidden sm:block"
                />
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Good morning, {userName} <span className="animate-bounce inline-block">👋</span>
                        </h1>
                        
                        {/* Subject Switcher Context Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-medium text-xs border border-purple-100 hover:bg-purple-100 transition-colors">
                                <span>{currentSubjectObj.icon}</span>
                                <span>{currentSubjectObj.name}</span>
                                <ChevronDown size={12} />
                            </button>
                            <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 hidden group-hover:block z-30 animate-in fade-in slide-in-from-top-1">
                                <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">Switch Context</p>
                                {subjects.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedSubject(s.id)}
                                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-gray-50 ${
                                            selectedSubject?.toLowerCase() === s.id ? 'font-bold text-purple-600 bg-purple-50/50' : 'text-gray-700'
                                        }`}
                                    >
                                        <span>{s.icon}</span>
                                        <span>{s.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 font-normal">
                        Code, practice and master together on <strong className="text-indigo-600 font-bold">StudySpirit</strong>.
                    </p>
                </div>
            </div>

            {/* Right Side Widgets: Streak, Rating, Notifications, Profile */}
            <div className="flex items-center gap-3 self-end md:self-auto">
                {/* Streak Badge */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-orange-50/80 border border-orange-100/80 text-orange-700 shadow-sm">
                    <div className="w-7 h-7 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Flame size={18} className="fill-orange-500" />
                    </div>
                    <div>
                        <div className="text-xs font-bold leading-tight">{stats?.currentStreak || 12}</div>
                        <div className="text-[10px] text-orange-600 font-medium">day streak</div>
                    </div>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-teal-50/80 border border-teal-100/80 text-teal-800 shadow-sm">
                    <div className="w-7 h-7 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                        <Shield size={18} />
                    </div>
                    <div>
                        <div className="text-xs font-bold leading-tight">{stats?.rating || 1428}</div>
                        <div className="text-[10px] text-teal-600 font-medium">CodeSpirit Rating</div>
                    </div>
                </div>

                {/* Notification Bell */}
                <button className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-md transition-all relative">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border-2 border-white" />
                </button>

                {/* User Avatar */}
                <div className="flex items-center gap-2 pl-1">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-md shadow-purple-500/20 border-2 border-white">
                        {user?.avatar || '👨‍🎓'}
                    </div>
                </div>
            </div>
        </header>
    );
}
