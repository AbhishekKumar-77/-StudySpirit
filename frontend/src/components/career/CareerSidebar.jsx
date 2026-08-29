import React from 'react';
import {
    LayoutDashboard, Bookmark, Clock, Briefcase, GraduationCap,
    Trophy, Award, Building, FileText
} from 'lucide-react';

export default function CareerSidebar({ activeTab, setActiveTab, applicationCounts = {} }) {
    const navSections = [
        {
            title: 'HOME',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'saved-opps', label: 'Saved', icon: Bookmark },
                { id: 'deadlines', label: 'Upcoming Deadlines', icon: Clock }
            ]
        },
        {
            title: 'OPPORTUNITIES',
            items: [
                { id: 'jobs', label: 'Jobs', icon: Briefcase },
                { id: 'internships', label: 'Internships', icon: GraduationCap },
                { id: 'hackathons', label: 'Hackathons', icon: Trophy },
                { id: 'competitions', label: 'Competitions', icon: Award },
                { id: 'campus', label: 'Campus Opportunities', icon: Building }
            ]
        },
        {
            title: 'RESUME',
            items: [
                { id: 'resume', label: 'Resume', icon: FileText }
            ]
        },
        {
            title: 'APPLICATIONS',
            items: [
                { id: 'app-saved', label: 'Saved', badge: applicationCounts.saved || 0, color: 'text-slate-500 bg-slate-100' },
                { id: 'app-preparing', label: 'Preparing', badge: applicationCounts.preparing || 0, color: 'text-amber-600 bg-amber-50' },
                { id: 'app-applied', label: 'Applied', badge: applicationCounts.applied || 0, color: 'text-blue-600 bg-blue-50' },
                { id: 'app-assessment', label: 'Assessment', badge: applicationCounts.assessment || 0, color: 'text-purple-600 bg-purple-50' },
                { id: 'app-interview', label: 'Interview', badge: applicationCounts.interview || 0, color: 'text-cyan-600 bg-cyan-50' },
                { id: 'app-offer', label: 'Offer', badge: applicationCounts.offer || 0, color: 'text-emerald-600 bg-emerald-50' },
                { id: 'app-rejected', label: 'Rejected', badge: applicationCounts.rejected || 0, color: 'text-rose-600 bg-rose-50' },
                { id: 'app-withdrawn', label: 'Withdrawn', badge: applicationCounts.withdrawn || 0, color: 'text-slate-400 bg-slate-100' }
            ]
        }
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 z-40 select-none overflow-y-auto shrink-0 shadow-xs">
            <div>
                {/* Brand Header */}
                <div 
                    onClick={() => setActiveTab('dashboard')}
                    className="p-5 border-b border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-slate-50/60 transition"
                >
                    <img 
                        src="/logo-icon.png" 
                        alt="StudySpirit Logo" 
                        className="w-9 h-9 object-contain shrink-0" 
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <div>
                        <div className="text-base font-black text-slate-900 tracking-tight leading-tight">
                            <span className="text-cyan-600">Study</span><span>Spirit</span>
                        </div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">CareerSprint</p>
                    </div>
                </div>

                {/* Navigation Sections */}
                <div className="p-4 space-y-6">
                    {navSections.map((sec, secIdx) => (
                        <div key={secIdx}>
                            <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-3 mb-2">
                                {sec.title}
                            </h2>

                            <div className="space-y-1">
                                {sec.items.map((item) => {
                                    const isSel = activeTab === item.id;
                                    const IconComponent = item.icon;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                                isSel
                                                    ? 'bg-cyan-50 text-cyan-700 font-extrabold shadow-xs border border-cyan-100'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                {IconComponent ? (
                                                    <IconComponent className={`w-4 h-4 shrink-0 ${isSel ? 'text-cyan-600' : 'text-slate-400'}`} />
                                                ) : (
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${isSel ? 'bg-cyan-500' : 'bg-slate-300'}`} />
                                                )}
                                                <span className="truncate">{item.label}</span>
                                            </div>

                                            {item.badge !== undefined && (
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.color}`}>
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
            </div>

            {/* Quick Footer */}
            <div className="p-4 border-t border-slate-100 text-center">
                <p className="text-[11px] font-bold text-slate-400">StudySpirit Career Hub</p>
                <p className="text-[10px] text-slate-300">Verified Skills & Opportunities</p>
            </div>
        </aside>
    );
}
