import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, Clock, Play, Loader, Code, Flame } from 'lucide-react';
import api from '../../services/api';

export default function HistoryView({ onStartPractice }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/codespirit/history');
            if (res.data?.success && res.data?.sessions) {
                setSessions(res.data.sessions);
            }
        } catch (err) {
            console.error("Failed to load session history:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl border border-purple-800/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                        <History size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Practice History</h2>
                        <p className="text-sm text-purple-200">Chronological history of coding problems solved and attempted</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <Loader size={32} className="animate-spin text-purple-600 mb-3" />
                    <p className="font-semibold text-sm">Fetching practice history...</p>
                </div>
            ) : sessions.length === 0 ? (
                <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <History size={40} className="mx-auto text-purple-400 mb-3" />
                    <h3 className="font-bold text-base text-gray-900">No Practice History Recorded</h3>
                    <p className="text-xs text-gray-500 mt-1">Start a practice session in any topic or daily challenge to record your completed problems!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((sess, idx) => {
                        const solvedCount = sess.challenges?.filter(c => c.status === 'solved').length || 0;
                        const totalCount = sess.challenges?.length || 1;
                        const dateStr = new Date(sess.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return (
                            <div key={sess._id || idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                            sess.completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}>
                                            {sess.completed ? 'Completed ✓' : 'In Progress'}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-400 uppercase">
                                            {sess.language || 'Python'} • {sess.difficulty || 'Medium'}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-base text-gray-900">{sess.topic}</h3>
                                    
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 size={14} className="text-emerald-600" />
                                            {solvedCount} / {totalCount} Problems Solved
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} className="text-gray-400" />
                                            {dateStr}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onStartPractice(sess.language || 'python', sess.topic, sess.difficulty || 'medium', totalCount)}
                                    className="px-5 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2 self-start md:self-center shrink-0"
                                >
                                    <Play size={13} className="fill-current" />
                                    <span>Re-Practice Session</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
