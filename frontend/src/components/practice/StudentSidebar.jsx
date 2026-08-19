import React from 'react';
import { 
    LayoutDashboard, Brain, BookOpen, Target, RefreshCw,
    FileText, Award, Layers, FolderHeart, History, BarChart2,
    Trophy, Swords, Medal, Crown, ChevronRight
} from 'lucide-react';

export default function StudentSidebar({ activeTab, setActiveTab }) {
    const navSections = [
        {
            title: "DASHBOARD",
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
            ]
        },
        {
            title: "PRACTICE",
            items: [
                { id: 'smart_practice', label: 'Smart Practice', icon: Brain, badge: 'AI' },
                { id: 'topic_practice', label: 'Topic Practice', icon: BookOpen },
                { id: 'daily_challenge', label: 'Daily Challenge', icon: Target },
                { id: 'revision', label: 'Revision (Spaced)', icon: RefreshCw }
            ]
        },
        {
            title: "ASSESSMENTS",
            items: [
                { id: 'mock_tests', label: 'Mock Tests', icon: FileText },
                { id: 'exam_simulator', label: 'Exam Simulator', icon: Award },
                { id: 'previous_papers', label: 'Previous Papers', icon: Layers }
            ]
        },
        {
            title: "MY LEARNING",
            items: [
                { id: 'my_library', label: 'Saved Quizzes', icon: FolderHeart },
                { id: 'history', label: 'History', icon: History },
                { id: 'analytics', label: 'Analytics', icon: BarChart2 }
            ]
        },
        {
            title: "COMPETITION",
            items: [
                { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                { id: 'challenges', label: 'Challenges', icon: Swords },
                { id: 'achievements', label: 'Achievements', icon: Medal }
            ]
        }
    ];

    return (
        <aside className="w-64 bg-slate-50 border-r border-slate-200 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between select-none">
            <div className="space-y-6">
                {navSections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-1.5">
                        <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            {section.title}
                        </p>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                            isActive
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 font-bold'
                                                : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                            <span>{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                                                isActive ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Upgrade to Pro Promo Card */}
            <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/80 shadow-sm text-center relative overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2 text-amber-600 shadow-sm">
                    <Crown className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Upgrade to Pro</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Unlock unlimited tests, AI tutor & adaptive engine.
                </p>
                <button className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.02]">
                    Upgrade Now
                </button>
            </div>
        </aside>
    );
}
