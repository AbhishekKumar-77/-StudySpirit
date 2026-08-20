import React, { useState, useEffect } from 'react';
import { History, Award, CheckCircle2, Clock, RotateCcw, TrendingUp, BarChart2 } from 'lucide-react';
import { API_BASE } from '../../config';

export default function PracticeHistoryView({ onStartSession }) {
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        let list = [];

        // 1. Try loading from localStorage
        try {
            const localHistory = JSON.parse(localStorage.getItem('study_spirit_practice_history') || '[]');
            list = localHistory;
        } catch (e) {
            console.error("Local history load error:", e);
        }

        // 2. Try fetching attempts/summary from backend API
        try {
            const res = await fetch(`${API_BASE}/practice/dashboard`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success && data.summary && data.summary.recentAttempts) {
                // If backend has recent attempts, append them if not duplicate
                data.summary.recentAttempts.forEach(att => {
                    if (!list.some(h => h.topic === att.topic && h.date === att.date)) {
                        list.push({
                            id: att._id || Date.now(),
                            topic: att.topic || att.subject || 'Python Programming',
                            subject: att.subject || 'Python Programming',
                            score: att.score || (att.isCorrect ? 1 : 0),
                            total: att.total || 1,
                            percentage: att.percentage || (att.isCorrect ? 100 : 0),
                            date: new Date(att.createdAt || Date.now()).toLocaleDateString()
                        });
                    }
                });
            }
        } catch (e) {}

        setHistoryList(list);
        setLoading(false);
    };

    const clearHistory = () => {
        if (window.confirm("Are you sure you want to clear your practice history?")) {
            setHistoryList([]);
            try {
                localStorage.removeItem('study_spirit_practice_history');
            } catch (e) {}
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200">
                        <History className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Practice History</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Track your completed topic practice sessions and marks obtained.
                        </p>
                    </div>
                </div>

                {historyList.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-xl transition-all border border-slate-200"
                    >
                        Clear History
                    </button>
                )}
            </div>

            {/* Content List */}
            {loading ? (
                <div className="py-16 text-center text-slate-400 font-medium text-xs">
                    Loading practice history...
                </div>
            ) : historyList.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
                        <History className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-800">No Practice History Yet</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Complete any practice session from Topic Practice, Smart Practice, or Daily Challenge to see your marks and topic performance recorded here!
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {historyList.map((item, idx) => {
                        const pct = Number(item.percentage) || 0;
                        const isPassed = pct >= 60;

                        return (
                            <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-slate-800">
                                            {item.topic || 'Python Programming'}
                                        </span>
                                        {item.subject && item.subject !== item.topic && (
                                            <span className="text-[11px] font-bold text-slate-400">
                                                ({item.subject})
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {item.date}
                                        </span>
                                        <span>•</span>
                                        <span>Total Questions: {item.total || 10}</span>
                                    </div>
                                </div>

                                {/* Marks Displayed Prominently */}
                                <div className="flex items-center gap-4">
                                    <div className="text-right space-y-0.5">
                                        <div className="text-sm font-black text-slate-900">
                                            Score: <span className={isPassed ? 'text-emerald-600' : 'text-amber-600'}>{item.score} / {item.total}</span>
                                        </div>
                                        <div className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md inline-block ${
                                            isPassed 
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}>
                                            {pct}% Accuracy
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
