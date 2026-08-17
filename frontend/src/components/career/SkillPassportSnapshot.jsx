import React from 'react';
import { ShieldCheck, CheckCircle2, Code, Layers, Award, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

export default function SkillPassportSnapshot({ passportData = {}, onViewPassport }) {
    const technicalSkills = [
        { name: 'Node.js', score: 82, evidence: 'Verified (3 Projects, CodeSpirit Exam)' },
        { name: 'React', score: 78, evidence: 'Verified (2 Projects, Assessment)' },
        { name: 'MongoDB', score: 76, evidence: 'Verified (2 Projects, Course)' },
        { name: 'Python', score: 71, evidence: 'AI Estimated (Coding Activity)' },
        { name: 'System Design', score: 68, evidence: 'Verified (Assessment)' }
    ];

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-100">
                        StudySpirit Career Passport
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight mt-1">Skill Passport Snapshot</h3>
                    <p className="text-xs font-semibold text-slate-500">Your verified skills and achievements</p>
                </div>

                <button
                    onClick={onViewPassport}
                    className="text-xs font-extrabold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
                >
                    <span>View Passport</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* Split Grid: Left Technical Skills (50%) + Right Stats & Communication (50%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Technical Skills */}
                <div className="lg:col-span-6 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-extrabold text-slate-900">Technical Skills</h4>
                        <span className="text-[10px] font-bold text-slate-400">Verified Evidence</span>
                    </div>

                    {technicalSkills.map((sk) => (
                        <div key={sk.name} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-800">{sk.name}</span>
                                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                                        Verified
                                    </span>
                                </div>
                                <span className="text-slate-900 font-extrabold">{sk.score}%</span>
                            </div>

                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-600 rounded-full transition-all duration-700"
                                    style={{ width: `${sk.score}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Side Stats Grid */}
                <div className="lg:col-span-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center">
                            <span className="text-2xl font-black text-slate-900 block">8</span>
                            <span className="text-xs font-extrabold text-slate-700 block">Projects</span>
                            <span className="text-[10px] font-bold text-slate-400">3 Featured</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center">
                            <span className="text-2xl font-black text-slate-900 block">240</span>
                            <span className="text-xs font-extrabold text-slate-700 block">Coding Activity</span>
                            <span className="text-[10px] font-bold text-slate-400">Problems Solved</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center">
                            <span className="text-2xl font-black text-slate-900 block">5</span>
                            <span className="text-xs font-extrabold text-slate-700 block">Assessments</span>
                            <span className="text-[10px] font-bold text-slate-400">Completed</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-center">
                            <span className="text-2xl font-black text-slate-900 block">6</span>
                            <span className="text-xs font-extrabold text-slate-700 block">Certifications</span>
                            <span className="text-[10px] font-bold text-slate-400">Verified</span>
                        </div>
                    </div>

                    {/* Communication Card */}
                    <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider">Communication</span>
                            <h5 className="text-sm font-extrabold text-purple-950">English Level: B1 Intermediate</h5>
                            <p className="text-[11px] font-bold text-purple-800 mt-0.5">Communication Score: 72%</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
