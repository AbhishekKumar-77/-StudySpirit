import React, { useState, useEffect } from 'react';
import { Users, Search, Code, Play, CheckCircle, AlertTriangle, Eye, Edit3, X, RefreshCw, Terminal, ExternalLink } from 'lucide-react';
import CollaborativeCodeEditor from './CollaborativeCodeEditor';

export default function StudentCodeMatrix({
    roomId,
    socket,
    user,
    participants = [],
    isHost = false
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'error'
    const [studentSnapshots, setStudentSnapshots] = useState({});
    const [selectedStudentForPair, setSelectedStudentForPair] = useState(null);

    // Listen to real-time student code heartbeats
    useEffect(() => {
        if (!socket || !roomId) return;

        const handleStudentHeartbeat = (data) => {
            const { studentId, studentName, code, language, status, lastRun } = data;
            setStudentSnapshots(prev => ({
                ...prev,
                [studentId]: {
                    id: studentId,
                    name: studentName,
                    code: code || '',
                    language: language || 'javascript',
                    status: status || 'idle', // 'idle', 'running', 'success', 'error'
                    lastRun: lastRun || null,
                    updatedAt: Date.now()
                }
            }));
        };

        socket.on('room:studentCodeHeartbeat', handleStudentHeartbeat);

        // Request current matrix snapshot from room
        socket.emit('room:requestMatrixSnapshots', { roomId });

        return () => {
            socket.off('room:studentCodeHeartbeat', handleStudentHeartbeat);
        };
    }, [socket, roomId]);

    // Filter students
    const studentList = participants.filter(p => p.id !== user?._id && p.id !== user?.id);
    const filteredStudents = studentList.filter(student => {
        const snap = studentSnapshots[student.id] || {};
        const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || snap.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="bg-[#181825] border border-violet-500/20 rounded-2xl p-6 shadow-2xl">
            {/* Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-violet-900/30">
                        <Users size={22} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            CodeTantra Multi-Student Matrix
                            <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 text-xs font-semibold rounded-full border border-violet-500/30">
                                Live Lab Monitor
                            </span>
                        </h3>
                        <p className="text-gray-400 text-xs">Real-time view of all student code editors & execution status</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#242437] text-gray-200 text-xs rounded-xl pl-9 pr-3 py-2 border border-violet-500/20 focus:outline-none focus:border-violet-400 w-44"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-[#242437] text-gray-200 text-xs rounded-xl px-3 py-2 border border-violet-500/20 focus:outline-none focus:border-violet-400"
                    >
                        <option value="all">All Statuses</option>
                        <option value="success">Passing Code</option>
                        <option value="error">Errors / Stuck</option>
                        <option value="idle">Idle / Writing</option>
                    </select>
                </div>
            </div>

            {/* Grid Matrix */}
            {filteredStudents.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">
                    <Code size={36} className="mx-auto mb-2 opacity-30 text-violet-400" />
                    No active student sessions found matching filter.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => {
                        const snap = studentSnapshots[student.id] || {
                            name: student.name,
                            code: '// Student has not started typing...',
                            language: 'javascript',
                            status: 'idle'
                        };

                        return (
                            <div
                                key={student.id}
                                className="bg-[#1e1e2e] border border-violet-500/20 rounded-xl overflow-hidden hover:border-violet-500/40 transition-all flex flex-col group shadow-lg"
                            >
                                {/* Student Card Header */}
                                <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#242437] border-b border-white/5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-400/40 flex items-center justify-center font-bold text-xs text-violet-300">
                                            {student.name?.charAt(0)?.toUpperCase() || 'S'}
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-white">{student.name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-mono">{snap.language}</div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    {snap.status === 'success' && (
                                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium rounded-full">
                                            <CheckCircle size={11} /> Pass
                                        </span>
                                    )}
                                    {snap.status === 'error' && (
                                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium rounded-full">
                                            <AlertTriangle size={11} /> Error
                                        </span>
                                    )}
                                    {snap.status === 'idle' && (
                                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-gray-500/10 border border-gray-500/30 text-gray-400 font-medium rounded-full">
                                            Idle
                                        </span>
                                    )}
                                </div>

                                {/* Code Preview Thumbnail */}
                                <div className="p-3 bg-[#11111b] font-mono text-[11px] text-gray-300 h-28 overflow-hidden relative">
                                    <pre className="whitespace-pre-wrap line-clamp-5 leading-snug">
                                        {snap.code || '// Empty editor'}
                                    </pre>
                                </div>

                                {/* Action Bar */}
                                <div className="p-2 bg-[#181825] border-t border-white/5 flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => setSelectedStudentForPair(student)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-violet-900/30"
                                    >
                                        <Edit3 size={12} /> Intervene & Pair Edit
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pair Edit Intervention Modal */}
            {selectedStudentForPair && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#181825] border border-violet-500/30 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 bg-[#242437] border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-600 rounded-lg text-white">
                                    <Edit3 size={18} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-base flex items-center gap-2">
                                        Pair Programming with {selectedStudentForPair.name}
                                    </h4>
                                    <p className="text-gray-400 text-xs">Live CRDT joint session — Changes reflect instantly on student's screen</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedStudentForPair(null)}
                                className="p-2 text-gray-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 p-4 bg-[#1e1e2e]">
                            <CollaborativeCodeEditor
                                roomId={`${roomId}_student_${selectedStudentForPair.id}`}
                                user={user}
                                isHost={true}
                                readOnly={false}
                                language="javascript"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
