import React, { useState, useEffect } from 'react';
import { Bookmark, Play, Trash2, Loader, Tag, Code } from 'lucide-react';
import api from '../../services/api';

export default function SavedProblemsView({ onStartPractice }) {
    const [savedProblems, setSavedProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSavedProblems();
    }, []);

    const fetchSavedProblems = async () => {
        setLoading(true);
        try {
            const res = await api.get('/codespirit/saved-problems');
            if (res.data?.success && res.data?.savedProblems) {
                setSavedProblems(res.data.savedProblems);
            }
        } catch (err) {
            console.error("Error loading saved problems:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (prob) => {
        try {
            const res = await api.post('/codespirit/save-problem', { problem: prob });
            if (res.data?.success && res.data?.savedProblems) {
                setSavedProblems(res.data.savedProblems);
            }
        } catch (err) {
            console.error("Error removing problem:", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl border border-indigo-800/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
                        <Bookmark size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Saved Problems</h2>
                        <p className="text-sm text-indigo-200">Challenges you bookmarked during practice and coding sessions</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <Loader size={32} className="animate-spin text-indigo-600 mb-3" />
                    <p className="font-semibold text-sm">Loading saved problems...</p>
                </div>
            ) : savedProblems.length === 0 ? (
                <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Bookmark size={40} className="mx-auto text-indigo-300 mb-3" />
                    <h3 className="font-bold text-base text-gray-900">No Saved Problems Yet</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        When practicing or writing code in the editor, click the Save button to bookmark important problems here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedProblems.map((prob, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                        prob.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                                        prob.difficulty === 'hard' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                                    }`}>
                                        {prob.difficulty || 'Medium'}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase">
                                            {prob.language || 'Python'}
                                        </span>
                                        <button 
                                            onClick={() => handleRemove(prob)}
                                            className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                                            title="Remove from saved"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-base text-gray-900 mb-2">{prob.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-3 mb-4">{prob.description}</p>
                            </div>

                            <button
                                onClick={() => onStartPractice(prob.language || 'python', prob.topic || prob.title, prob.difficulty || 'medium', 1)}
                                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Play size={13} className="fill-current" />
                                <span>Practice Saved Problem</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
