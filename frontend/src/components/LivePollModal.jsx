import React, { useState, useEffect } from 'react';
import { HelpCircle, Clock, CheckCircle, BarChart2, Plus, Trash2, X, Award } from 'lucide-react';

export default function LivePollModal({
    isOpen,
    onClose,
    socket,
    roomId,
    user,
    isHost = false
}) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['Option 1', 'Option 2']);
    const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
    const [activePoll, setActivePoll] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);

    // Listen to poll creation & vote updates
    useEffect(() => {
        if (!socket || !roomId) return;

        const handlePollCreated = (pollData) => {
            setActivePoll(pollData);
            setHasVoted(false);
        };

        const handlePollUpdated = (pollData) => {
            setActivePoll(pollData);
        };

        const handlePollClosed = () => {
            setActivePoll(null);
            setHasVoted(false);
        };

        socket.on('room:pollCreated', handlePollCreated);
        socket.on('room:pollUpdated', handlePollUpdated);
        socket.on('room:pollClosed', handlePollClosed);

        return () => {
            socket.off('room:pollCreated', handlePollCreated);
            socket.off('room:pollUpdated', handlePollUpdated);
            socket.off('room:pollClosed', handlePollClosed);
        };
    }, [socket, roomId]);

    if (!isOpen && !activePoll) return null;

    const handleAddOption = () => {
        if (options.length < 5) {
            setOptions([...options, `Option ${options.length + 1}`]);
        }
    };

    const handleRemoveOption = (idx) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== idx));
        }
    };

    const handleLaunchPoll = () => {
        if (!question.trim() || options.some(o => !o.trim())) return;

        const pollData = {
            id: 'poll_' + Date.now(),
            roomId,
            question,
            options: options.map(text => ({ text, votes: 0 })),
            correctIndex: correctOptionIdx,
            totalVotes: 0,
            voters: []
        };

        socket.emit('room:createPoll', pollData);
        setActivePoll(pollData);
    };

    const handleVote = (optionIdx) => {
        if (hasVoted || !activePoll || !socket) return;

        socket.emit('room:votePoll', {
            roomId,
            pollId: activePoll.id,
            optionIndex: optionIdx,
            userId: user?._id || user?.id
        });
        setHasVoted(true);
    };

    const handleClosePoll = () => {
        if (socket && roomId) {
            socket.emit('room:closePoll', { roomId });
        }
        setActivePoll(null);
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
            <div className="bg-[#181825] border border-violet-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#242437] border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white">
                            <BarChart2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base">Live Classroom Poll & Quiz</h3>
                            <p className="text-gray-400 text-xs">Real-time interactive question & leaderboard boost</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Active Poll Viewing & Voting */}
                    {activePoll ? (
                        <div className="space-y-5">
                            <div className="bg-[#1e1e2e] border border-violet-500/20 p-4 rounded-xl">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">Live MCQ Question</span>
                                <h4 className="text-white font-bold text-base">{activePoll.question}</h4>
                            </div>

                            {/* Options & Live Percentages */}
                            <div className="space-y-3">
                                {activePoll.options.map((opt, idx) => {
                                    const percentage = activePoll.totalVotes > 0 
                                        ? Math.round((opt.votes / activePoll.totalVotes) * 100) 
                                        : 0;

                                    return (
                                        <button
                                            key={idx}
                                            disabled={hasVoted || isHost}
                                            onClick={() => handleVote(idx)}
                                            className={`w-full relative overflow-hidden p-3.5 rounded-xl border text-left transition-all ${
                                                hasVoted 
                                                    ? 'bg-[#1e1e2e] border-white/10 cursor-default'
                                                    : 'bg-[#242437] border-violet-500/20 hover:border-violet-400 text-white cursor-pointer'
                                            }`}
                                        >
                                            {/* Progress Fill Bar */}
                                            <div
                                                style={{ width: `${percentage}%` }}
                                                className="absolute left-0 top-0 bottom-0 bg-violet-600/30 transition-all duration-500"
                                            />

                                            <div className="relative z-10 flex items-center justify-between text-xs font-semibold">
                                                <span className="text-gray-200">{opt.text}</span>
                                                <span className="text-violet-300 font-bold">{percentage}% ({opt.votes})</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {isHost && (
                                <button
                                    onClick={handleClosePoll}
                                    className="w-full py-2.5 bg-rose-600/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold hover:bg-rose-600/30 transition-all"
                                >
                                    End Poll & Show Results
                                </button>
                            )}
                        </div>
                    ) : isHost ? (
                        /* Creation Form for Host */
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Poll / Quiz Question:</label>
                                <input
                                    type="text"
                                    placeholder="e.g. What is the time complexity of Binary Search?"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    className="w-full bg-[#242437] text-white text-xs rounded-xl p-3 border border-violet-500/20 focus:outline-none focus:border-violet-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-300 block">Options:</label>
                                {options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="correctOption"
                                            checked={correctOptionIdx === idx}
                                            onChange={() => setCorrectOptionIdx(idx)}
                                            className="text-amber-500 focus:ring-amber-500"
                                            title="Mark as correct answer"
                                        />
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                                const updated = [...options];
                                                updated[idx] = e.target.value;
                                                setOptions(updated);
                                            }}
                                            className="flex-1 bg-[#242437] text-white text-xs rounded-xl p-2.5 border border-violet-500/20 focus:outline-none focus:border-violet-400"
                                        />
                                        {options.length > 2 && (
                                            <button
                                                onClick={() => handleRemoveOption(idx)}
                                                className="p-2 text-rose-400 hover:text-rose-300"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {options.length < 5 && (
                                <button
                                    onClick={handleAddOption}
                                    className="text-xs text-violet-400 font-semibold flex items-center gap-1 hover:underline"
                                >
                                    <Plus size={13} /> Add Another Option
                                </button>
                            )}

                            <button
                                onClick={handleLaunchPoll}
                                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-900/30"
                            >
                                Launch Poll to Class
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-8 text-sm">
                            No active poll at the moment. Wait for the host to launch a question!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
