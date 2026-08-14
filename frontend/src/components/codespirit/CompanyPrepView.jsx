import React from 'react';
import { Award, Building2, Play, CheckCircle2 } from 'lucide-react';

export default function CompanyPrepView({ onStartPractice }) {
    const companies = [
        { name: 'Virtusa', readiness: 72, icon: '🏢', topics: ['Arrays', 'Strings', 'Sorting', 'Recursion'] },
        { name: 'TCS', readiness: 85, icon: '💼', topics: ['Numerical', 'Strings', 'C/C++ Basics'] },
        { name: 'Infosys', readiness: 78, icon: '🌐', topics: ['Data Structures', 'Algorithms', 'SQL'] },
        { name: 'Accenture', readiness: 80, icon: '⚡', topics: ['Pseudo Code', 'Arrays', 'Strings'] },
        { name: 'Amazon', readiness: 58, icon: '📦', topics: ['Trees', 'Graphs', 'Dynamic Programming'] },
        { name: 'Google', readiness: 52, icon: '🔍', topics: ['Advanced DP', 'Graphs', 'Segment Trees'] }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 rounded-3xl text-white shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300">
                        <Award size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Company Preparation Modules</h2>
                        <p className="text-sm text-blue-200">Practice company-specific coding questions and interview sets</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((c, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{c.icon}</span>
                                    <h3 className="font-bold text-lg text-gray-900">{c.name}</h3>
                                </div>
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600">
                                    {c.readiness}% Readiness
                                </span>
                            </div>

                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Common Topics</p>
                            <div className="flex flex-wrap gap-1.5 mb-6">
                                {c.topics.map((t, tidx) => (
                                    <span key={tidx} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => onStartPractice('dsa', `${c.name} Prep`)}
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Play size={14} className="fill-white" />
                            <span>Start {c.name} Preparation</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
