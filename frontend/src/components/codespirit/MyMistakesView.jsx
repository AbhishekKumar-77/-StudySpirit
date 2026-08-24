import React, { useState, useEffect } from 'react';
import { AlertTriangle, Zap, Loader } from 'lucide-react';
import api from '../../services/api';

export default function MyMistakesView({ onStartPractice }) {
    const [mistakes, setMistakes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMistakes();
    }, []);

    const fetchMistakes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/codespirit/mistakes');
            if (res.data?.success && res.data?.mistakes) {
                setMistakes(res.data.mistakes);
            }
        } catch (err) {
            console.error("Failed to fetch mistake analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-rose-900 text-white p-8 rounded-3xl shadow-xl bg-gradient-to-r from-rose-900 via-purple-900 to-slate-900 border border-rose-800/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Mistake Intelligence</h2>
                        <p className="text-sm text-rose-200">Automatically detected coding pitfalls logged during real student practice</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <Loader size={32} className="animate-spin text-rose-600 mb-3" />
                    <p className="font-semibold text-sm">Analyzing real submission history...</p>
                </div>
            ) : mistakes.length === 0 ? (
                <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <AlertTriangle size={40} className="mx-auto text-rose-400 mb-3" />
                    <h3 className="font-bold text-base text-gray-900">No Failure Patterns Logged Yet</h3>
                    <p className="text-xs text-gray-500 mt-1">Keep solving challenges! Any failed test cases or errors will be tracked here to target weak areas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mistakes.map((m, idx) => (
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
            )}
        </div>
    );
}
