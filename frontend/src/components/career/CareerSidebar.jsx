import React from 'react';
import {
    Rocket, LayoutDashboard, Sparkles, Bookmark, Clock, Briefcase, GraduationCap,
    Trophy, Award, Compass, Building, FileText, CheckCircle2, Zap, FileSearch,
    MessageSquare, Map, DollarSign, ChevronRight, UserCheck
} from 'lucide-react';

export default function CareerSidebar({ activeTab, setActiveTab, applicationCounts = {} }) {
    const navSections = [
        {
            title: 'HOME',
            items: [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'recommended', label: 'Recommended', icon: Sparkles },
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
                { id: 'scholarships', label: 'Scholarships', icon: Compass },
                { id: 'campus', label: 'Campus Opportunities', icon: Building }
            ]
        },
        {
            title: 'APPLICATIONS',
            items: [
                { id: 'app-saved', label: 'Saved', badge: applicationCounts.saved || 18, color: 'text-slate-500 bg-slate-100' },
                { id: 'app-preparing', label: 'Preparing', badge: applicationCounts.preparing || 6, color: 'text-amber-600 bg-amber-50' },
                { id: 'app-applied', label: 'Applied', badge: applicationCounts.applied || 24, color: 'text-blue-600 bg-blue-50' },
                { id: 'app-assessment', label: 'Assessment', badge: applicationCounts.assessment || 7, color: 'text-purple-600 bg-purple-50' },
                { id: 'app-interview', label: 'Interview', badge: applicationCounts.interview || 5, color: 'text-cyan-600 bg-cyan-50' },
                { id: 'app-offer', label: 'Offer', badge: applicationCounts.offer || 2, color: 'text-emerald-600 bg-emerald-50' },
                { id: 'app-rejected', label: 'Rejected', badge: applicationCounts.rejected || 4, color: 'text-rose-600 bg-rose-50' },
                { id: 'app-withdrawn', label: 'Withdrawn', badge: applicationCounts.withdrawn || 1, color: 'text-slate-400 bg-slate-100' }
            ]
        },
        {
            title: 'SKILL PASSPORT',
            items: [
                { id: 'passport', label: 'Verified Passport', icon: CheckCircle2 },
                { id: 'my-skills', label: 'My Skills', icon: Zap }
            ]
        },
        {
            title: 'CAREER TOOLS',
            items: [
                { id: 'resume-builder', label: 'Resume Builder', icon: FileText },
                { id: 'resume-analyzer', label: 'Resume Analyzer', icon: FileSearch },
                { id: 'cover-letter', label: 'Cover Letter', icon: MessageSquare },
                { id: 'interview-prep', label: 'Interview Prep', icon: UserCheck },
                { id: 'roadmap', label: 'Career Roadmap', icon: Map },
                { id: 'salary-insights', label: 'Salary Insights', icon: DollarSign }
            ]
        }
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 z-40 select-none overflow-y-auto shrink-0 shadow-xs">
            <div>
                {/* Brand Header */}
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                        <Rocket className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">CareerSprint</h1>
                        <p className="text-[10px] font-bold text-slate-400">Discover. Prepare. Get Hired.</p>
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
                                                    ? 'bg-cyan-50 text-cyan-700 font-extrabold shadow-xs'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                {IconComponent ? (
                                                    <IconComponent className={`w-4 h-4 shrink-0 ${isSel ? 'text-cyan-600' : 'text-slate-400'}`} />
                                                ) : (
                                                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
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

            {/* Bottom Profile Completion Progress Card */}
            <div className="p-4 border-t border-slate-100">
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-center">
                    <h3 className="text-xs font-extrabold text-slate-900 mb-1">Complete Your Profile</h3>
                    <p className="text-[10px] font-medium text-slate-500 mb-3">Get better job matches</p>

                    {/* Circular gauge placeholder */}
                    <div className="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-200"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-cyan-600"
                                strokeDasharray="78, 100"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <span className="absolute text-xs font-black text-slate-900">78%</span>
                    </div>

                    <button
                        onClick={() => setActiveTab('passport')}
                        className="w-full bg-white border border-slate-200 hover:bg-cyan-50 hover:border-cyan-200 text-cyan-700 font-extrabold text-[11px] py-1.5 rounded-xl transition flex items-center justify-center gap-1 shadow-2xs"
                    >
                        <span>Complete Now</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
