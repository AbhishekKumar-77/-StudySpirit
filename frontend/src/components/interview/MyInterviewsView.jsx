import React, { useState, useEffect } from 'react';
import { History, Calendar, Award, ArrowRight, Eye, CheckCircle2, AlertCircle, FileText, X } from 'lucide-react';
import soloApi from '../../services/soloApi';

export default function MyInterviewsView({ onSelectSession }) {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const data = await soloApi.getInterviewHistory();
                if (data && data.sessions) {
                    setSessions(data.sessions);
                }
            } catch (err) {
                console.error('Error fetching interview history:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleViewDetail = async (sess) => {
        try {
            const data = await soloApi.getInterviewSession(sess._id);
            if (data && data.session) {
                setSelectedSessionDetail(data.session);
            }
        } catch (err) {
            console.error('Error fetching session detail:', err);
        }
    };

    return (
        <div className="flex-1 bg-slate-50 text-slate-800 p-6 md:p-8 min-h-screen overflow-y-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                    <History className="w-4 h-4" />
                    <span>Interview History</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Interviews</h1>
                <p className="text-sm text-slate-500 mt-1">Review past sessions, transcripts, AI feedback, and improvement progress</p>
            </div>

            {/* Session List */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-400 text-xs font-semibold">Loading history...</div>
            ) : sessions.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">No Interview History Yet</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Complete your first mock interview session to see your progress reports here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((sess) => {
                        const dateStr = sess.startedAt ? new Date(sess.startedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';
                        return (
                            <div key={sess._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-purple-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex flex-col items-center justify-center font-black text-base shrink-0">
                                        {sess.overallScore || 78}
                                        <span className="text-[8px] font-bold text-slate-400">/100</span>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-extrabold text-slate-900">{sess.targetCompany || 'Google'}</h3>
                                            <span className="text-slate-400">•</span>
                                            <span className="text-xs font-bold text-slate-600">{sess.targetRole || 'Software Engineer'}</span>
                                        </div>

                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                            <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                {sess.mode || 'Technical'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {dateStr}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleViewDetail(sess)}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition self-end sm:self-center"
                                >
                                    <Eye className="w-4 h-4 text-purple-600" />
                                    <span>View Transcript & Plan</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Session Detail Modal */}
            {selectedSessionDetail && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 border border-slate-200 shadow-2xl relative">
                        <button
                            onClick={() => setSelectedSessionDetail(null)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Interview Session Transcript</span>
                            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                                {selectedSessionDetail.targetCompany} — {selectedSessionDetail.targetRole}
                            </h2>
                            <p className="text-xs text-slate-500">Overall Score: <strong className="text-purple-600">{selectedSessionDetail.overallScore}/100</strong></p>
                        </div>

                        {/* Exchanges */}
                        <div className="space-y-4 mb-6">
                            <h3 className="text-sm font-bold text-slate-900">Questions & Answers</h3>
                            {selectedSessionDetail.exchanges && selectedSessionDetail.exchanges.length > 0 ? (
                                selectedSessionDetail.exchanges.map((ex, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                                        <p className="font-bold text-slate-900">Q{idx + 1}: {ex.question}</p>
                                        <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-100">A: {ex.answer}</p>
                                        {ex.feedback && (
                                            <p className="text-purple-700 font-medium"><strong>Feedback:</strong> {ex.feedback}</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-500 italic">No exchange transcript recorded for this session.</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setSelectedSessionDetail(null)}
                                className="bg-purple-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
