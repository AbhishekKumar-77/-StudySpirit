import React, { useState } from 'react';
import { Users, Clock, Radio, Play, Square, Shuffle, Send, X, ArrowRight, ShieldAlert } from 'lucide-react';

export default function BreakoutRoomsModal({
    isOpen,
    onClose,
    participants = [],
    socket,
    roomId,
    isHost = false
}) {
    const [numRooms, setNumRooms] = useState(2);
    const [durationMinutes, setDurationMinutes] = useState(15);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [activeBreakouts, setActiveBreakouts] = useState(null);

    if (!isOpen) return null;

    // Handle auto-split rooms
    const handleStartBreakouts = () => {
        if (!socket || !roomId) return;

        // Filter out host
        const students = participants.filter(p => p.id);
        const rooms = Array.from({ length: numRooms }, (_, i) => ({
            id: `breakout_${roomId}_${i + 1}`,
            name: `Breakout Room ${i + 1}`,
            members: []
        }));

        // Round-robin distribution
        students.forEach((student, index) => {
            const roomIdx = index % numRooms;
            rooms[roomIdx].members.push(student);
        });

        const breakoutData = {
            roomId,
            rooms,
            durationSeconds: durationMinutes * 60,
            startedAt: Date.now()
        };

        socket.emit('room:createBreakouts', breakoutData);
        setActiveBreakouts(breakoutData);
    };

    // Broadcast message to all breakout rooms
    const handleSendBroadcast = () => {
        if (!broadcastMsg.trim() || !socket || !roomId) return;
        socket.emit('room:broadcastBreakouts', {
            roomId,
            message: broadcastMsg
        });
        setBroadcastMsg('');
    };

    // Close breakout rooms
    const handleEndBreakouts = () => {
        if (!socket || !roomId) return;
        socket.emit('room:closeBreakouts', { roomId });
        setActiveBreakouts(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#181825] border border-violet-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#242437] border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl text-white">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base">Breakout Rooms Manager</h3>
                            <p className="text-gray-400 text-xs">Split students into focused group discussion rooms</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {!activeBreakouts ? (
                        /* Setup Configuration */
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Number of Rooms */}
                                <div className="bg-[#1e1e2e] border border-white/5 rounded-xl p-4">
                                    <label className="text-xs font-semibold text-gray-400 block mb-2">Number of Breakout Rooms</label>
                                    <select
                                        value={numRooms}
                                        onChange={(e) => setNumRooms(parseInt(e.target.value))}
                                        className="w-full bg-[#242437] border border-violet-500/30 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-violet-400"
                                    >
                                        <option value={2}>2 Breakout Rooms</option>
                                        <option value={3}>3 Breakout Rooms</option>
                                        <option value={4}>4 Breakout Rooms</option>
                                        <option value={6}>6 Breakout Rooms</option>
                                    </select>
                                </div>

                                {/* Duration */}
                                <div className="bg-[#1e1e2e] border border-white/5 rounded-xl p-4">
                                    <label className="text-xs font-semibold text-gray-400 block mb-2">Session Duration</label>
                                    <select
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                                        className="w-full bg-[#242437] border border-violet-500/30 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-violet-400"
                                    >
                                        <option value={5}>5 Minutes</option>
                                        <option value={10}>10 Minutes</option>
                                        <option value={15}>15 Minutes</option>
                                        <option value={30}>30 Minutes</option>
                                    </select>
                                </div>
                            </div>

                            {/* Participant Distribution Summary */}
                            <div className="bg-[#1e1e2e] border border-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between text-xs text-gray-300 mb-3">
                                    <span className="font-semibold flex items-center gap-1.5">
                                        <Shuffle size={14} className="text-violet-400" />
                                        Auto-Distribution Strategy
                                    </span>
                                    <span>~{Math.ceil(participants.length / numRooms)} students per room</span>
                                </div>
                                <div className="text-xs text-gray-400 bg-[#11111b] p-3 rounded-lg border border-white/5">
                                    Students will be split automatically upon starting. Host can join or move between any breakout room.
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleStartBreakouts}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2"
                            >
                                <Play size={16} fill="currentColor" /> Open Breakout Rooms Now
                            </button>
                        </div>
                    ) : (
                        /* Active Rooms Monitoring & Controls */
                        <div className="space-y-5">
                            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-emerald-400 text-xs font-semibold">
                                <span className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                                    Breakout Rooms Active ({activeBreakouts.rooms?.length} Rooms)
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={13} /> Timer: {durationMinutes}:00
                                </span>
                            </div>

                            {/* Broadcast Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-300">Broadcast Message to All Breakout Rooms:</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. 2 minutes remaining, finish your discussion..."
                                        value={broadcastMsg}
                                        onChange={(e) => setBroadcastMsg(e.target.value)}
                                        className="flex-1 bg-[#242437] text-white text-xs rounded-xl px-3.5 py-2.5 border border-violet-500/20 focus:outline-none focus:border-violet-400"
                                    />
                                    <button
                                        onClick={handleSendBroadcast}
                                        className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
                                    >
                                        <Send size={13} /> Send
                                    </button>
                                </div>
                            </div>

                            {/* End Breakouts Button */}
                            <button
                                onClick={handleEndBreakouts}
                                className="w-full py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Square size={16} fill="currentColor" /> Close All Breakout Rooms & Recall Students
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
