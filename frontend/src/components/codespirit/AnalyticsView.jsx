import React from 'react';
import { BarChart3, TrendingUp, Award, Clock, Target, Layers } from 'lucide-react';

export default function AnalyticsView({ stats }) {
    const subjectBreakdown = [
        { name: 'Python', mastery: 82, solved: 42, color: 'bg-blue-500' },
        { name: 'C', mastery: 74, solved: 36, color: 'bg-indigo-500' },
        { name: 'C++', mastery: 71, solved: 58, color: 'bg-blue-600' },
        { name: 'Java', mastery: 58, solved: 29, color: 'bg-orange-500' },
        { name: 'JavaScript', mastery: 46, solved: 24, color: 'bg-yellow-500' },
        { name: 'DSA', mastery: 64, solved: 71, color: 'bg-purple-500' },
        { name: 'SQL', mastery: 69, solved: 18, color: 'bg-sky-500' }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-1">CodeSpirit Analytics</h2>
                <p className="text-xs text-gray-500">Comprehensive breakdown of performance and subject mastery</p>
            </div>

            {/* Subject Mastery Progress Bars */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900">Subject Mastery Breakdown</h3>
                <div className="space-y-4">
                    {subjectBreakdown.map((s, idx) => (
                        <div key={idx}>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                                <span>{s.name} ({s.solved} Problems Solved)</span>
                                <span>{s.mastery}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${s.color} rounded-full transition-all duration-500`}
                                    style={{ width: `${s.mastery}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
