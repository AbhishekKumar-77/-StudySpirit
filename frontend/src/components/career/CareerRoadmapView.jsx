import React from 'react';
import { CheckCircle2, ArrowRight, Sparkles, Map, GraduationCap, Target } from 'lucide-react';

export default function CareerRoadmapView({ targetRole = 'Backend Developer' }) {
    const roadmapSemesters = [
        {
            sem: 'Semester 3',
            status: 'Completed',
            items: [
                { text: 'Programming Fundamentals (Node.js / Java)', done: true },
                { text: 'Git & GitHub Version Control', done: true },
                { text: 'Basic Data Structures', done: true }
            ]
        },
        {
            sem: 'Semester 4',
            status: 'In Progress',
            items: [
                { text: 'Build 2 Full Stack Projects (Project Lab)', done: true },
                { text: 'Improve Advanced DSA & Algorithms', done: false },
                { text: 'Database Design & SQL / MongoDB', done: true }
            ]
        },
        {
            sem: 'Semester 5',
            status: 'Upcoming',
            items: [
                { text: 'Internship Applications (CareerSprint)', done: false },
                { text: 'ATS Resume & Cover Letter Builder', done: false },
                { text: 'AI Interview Preparation (Aria)', done: false }
            ]
        },
        {
            sem: 'Semester 6',
            status: 'Upcoming',
            items: [
                { text: 'Campus Placement Preparation', done: false },
                { text: 'Company-specific Mock Technical Rounds', done: false },
                { text: 'Final Placement & Offer Negotiation', done: false }
            ]
        }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                            Target Role: {targetRole}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-slate-500">Graduation 2027</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-1">Personalized Career Roadmap</h2>
                    <p className="text-xs font-medium text-slate-500">Step-by-step milestones to secure your dream role</p>
                </div>

                <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-2xl px-4 py-2 text-xs font-extrabold text-purple-700">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>72% Overall Roadmap Completion</span>
                </div>
            </div>

            {/* Timeline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {roadmapSemesters.map((s, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-black text-slate-900">{s.sem}</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                    s.status === 'Completed'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : s.status === 'In Progress'
                                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                                        : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {s.status}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {s.items.map((item, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                                        {item.done ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <ArrowRight className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                                        )}
                                        <span className={item.done ? 'line-through text-slate-400 font-normal' : 'text-slate-800'}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
