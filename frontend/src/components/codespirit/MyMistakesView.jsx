import React from 'react';
import { AlertTriangle, Zap, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function MyMistakesView({ onStartPractice }) {
    const mistakeCategories = [
        {
            category: 'Recursion Base Cases',
            failures: 9,
            severity: 'High',
            description: 'Missing or incorrect base condition causing Infinite recursion / StackOverflowError.',
            recommendation: 'Practice simple single-branch and multi-branch recursion problems.'
        },
        {
            category: 'Off-By-One Errors',
            failures: 6,
            severity: 'Medium',
            description: 'Incorrect loop bounds (e.g., using <= length instead of < length).',
            recommendation: 'Practice array boundary verification and prefix sum problems.'
        },
        {
            category: 'Null & Empty Array Handling',
            failures: 5,
            severity: 'Medium',
            description: 'NullPointerException or accessing empty collection elements without validation.',
            recommendation: 'Practice defensive programming and edge-case testing.'
        },
        {
            category: 'Incorrect Loop Termination',
            failures: 4,
            severity: 'Low',
            description: 'Loop terminating prematurely before processing all elements.',
            recommendation: 'Practice two-pointer traversal techniques.'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-rose-900 text-white p-8 rounded-3xl shadow-xl bg-gradient-to-r from-rose-900 via-purple-900 to-slate-900 border border-rose-800/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Mistake Intelligence</h2>
                        <p className="text-sm text-rose-200">Automatically detected coding pitfalls and failure patterns</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mistakeCategories.map((m, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                    m.severity === 'High' ? 'bg-rose-50 text-rose-600' :
                                    m.severity === 'Medium' ? 'bg-amber-50 text-amber-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                    {m.severity} Priority
                                </span>
                                <span className="text-xs font-bold text-gray-500">{m.failures} Failures Recorded</span>
                            </div>

                            <h3 className="font-bold text-base text-gray-900 mb-1">{m.category}</h3>
                            <p className="text-xs text-gray-500 mb-4">{m.description}</p>
                            
                            <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-700 font-medium mb-4">
                                <span className="font-bold text-purple-700">Recommendation: </span>
                                {m.recommendation}
                            </div>
                        </div>

                        <button
                            onClick={() => onStartPractice('dsa', m.category)}
                            className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Zap size={14} className="fill-current" />
                            <span>Practice This Weakness</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
