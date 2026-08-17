import React, { useState } from 'react';
import { Globe, Users, ArrowRight, MessageSquare, Briefcase, GraduationCap, Coffee } from 'lucide-react';
import AIConversationView from './AIConversationView';

export default function RealSituationsView({ profile = {} }) {
    const [selectedScenario, setSelectedScenario] = useState(null);

    const categories = [
        {
            title: 'College & Academic',
            icon: GraduationCap,
            scenarios: [
                { title: 'Talk to Professor', desc: 'Ask for feedback on your course assignment.' },
                { title: 'Group Project Discussion', desc: 'Coordinate task division with your project team.' },
                { title: 'Ask a Question in Class', desc: 'Interrupt politely to clarify a concept.' }
            ]
        },
        {
            title: 'Workplace & Team',
            icon: Briefcase,
            scenarios: [
                { title: 'Team Standup Meeting', desc: 'Give your daily status update in 60 seconds.' },
                { title: 'Explain a Technical Problem', desc: 'Describe a bug or blocker to your teammate.' }
            ]
        },
        {
            title: 'Career & Networking',
            icon: Users,
            scenarios: [
                { title: 'Talk to a Recruiter', desc: 'Introduce yourself and summarize your projects.' },
                { title: 'Professional Networking', desc: 'Connect with an engineer at an industry event.' }
            ]
        },
        {
            title: 'Daily Life',
            icon: Coffee,
            scenarios: [
                { title: 'Ordering at a Cafe', desc: 'Order food and ask for custom preferences.' },
                { title: 'Asking for Directions', desc: 'Navigate a new campus or city area.' }
            ]
        }
    ];

    if (selectedScenario) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Scenario Practice</span>
                        <h2 className="font-bold text-slate-900 text-base">{selectedScenario.title}</h2>
                        <p className="text-xs text-slate-500">{selectedScenario.desc}</p>
                    </div>
                    <button
                        onClick={() => setSelectedScenario(null)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
                    >
                        ← Change Scenario
                    </button>
                </div>

                <AIConversationView profile={profile} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-600" />
                    Real Life Communication Scenarios
                </h2>
                <p className="text-xs text-slate-500">Practice realistic conversations with AI acting as the other person.</p>
            </div>

            <div className="space-y-6">
                {categories.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                        <div key={idx} className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <Icon className="w-4 h-4 text-purple-600" />
                                {cat.title}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {cat.scenarios.map((scen, sIdx) => (
                                    <div
                                        key={sIdx}
                                        onClick={() => setSelectedScenario(scen)}
                                        className="bg-slate-50 hover:bg-purple-50/50 p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-all cursor-pointer space-y-2 group flex flex-col justify-between"
                                    >
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-xs group-hover:text-purple-700 transition-colors">
                                                {scen.title}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 leading-snug mt-1">{scen.desc}</p>
                                        </div>

                                        <button className="text-[11px] font-bold text-purple-600 group-hover:underline flex items-center gap-1 pt-2">
                                            Start Scenario <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
