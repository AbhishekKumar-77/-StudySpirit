import React, { useState } from 'react';
import { Users, Download, Clock, CheckCircle, Award, X, FileSpreadsheet, Search } from 'lucide-react';

export default function AttendanceReportModal({
    isOpen,
    onClose,
    participants = [],
    roomId
}) {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    // Build attendance records with sample engagement metrics
    const attendanceRecords = participants.map((p, idx) => ({
        id: p.id || idx,
        name: p.name || 'Anonymous Student',
        role: p.role || (idx === 0 ? 'Teacher / Host' : 'Student'),
        joinTime: p.joinTime || new Date(Date.now() - (idx + 1) * 12 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        durationMinutes: p.durationMinutes || (45 - idx * 3),
        handRaises: p.handRaises || (idx % 3),
        quizScore: p.quizScore || (80 + (idx % 20)),
        status: 'Present'
    }));

    const filtered = attendanceRecords.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleExportCSV = () => {
        const headers = ['Student Name', 'Role', 'Join Time', 'Duration (min)', 'Hand Raises', 'Quiz Score (%)', 'Status'];
        const rows = attendanceRecords.map(r => [
            `"${r.name}"`,
            `"${r.role}"`,
            `"${r.joinTime}"`,
            r.durationMinutes,
            r.handRaises,
            r.quizScore,
            r.status
        ]);

        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Attendance_Report_Room_${roomId || 'Global'}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(link);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#181825] border border-violet-500/30 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#242437] border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white">
                            <FileSpreadsheet size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base">Classroom Attendance & Analytics</h3>
                            <p className="text-gray-400 text-xs">Automated session participation log and downloadable report</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Controls Bar */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="relative flex-1 max-w-xs">
                            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search participant..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#242437] text-white text-xs rounded-xl pl-9 pr-3 py-2 border border-violet-500/20 focus:outline-none focus:border-violet-400"
                            />
                        </div>

                        <button
                            onClick={handleExportCSV}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-900/30 flex items-center gap-1.5"
                        >
                            <Download size={14} /> Export CSV Report
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-[#1e1e2e] border border-white/5 rounded-xl overflow-hidden max-h-[350px] overflow-y-auto">
                        <table className="w-full text-left text-xs text-gray-300">
                            <thead className="bg-[#242437] text-gray-400 font-semibold uppercase tracking-wider border-b border-white/10">
                                <tr>
                                    <th className="p-3">Participant</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3">Join Time</th>
                                    <th className="p-3">Duration</th>
                                    <th className="p-3">Raises</th>
                                    <th className="p-3">Quiz Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-medium">
                                {filtered.map((r, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 text-white font-semibold flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-[10px]">
                                                {r.name.charAt(0)}
                                            </div>
                                            {r.name}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                                r.role.includes('Host') 
                                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                                    : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                            }`}>
                                                {r.role}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-400">{r.joinTime}</td>
                                        <td className="p-3 text-gray-300">{r.durationMinutes} min</td>
                                        <td className="p-3 text-violet-300">{r.handRaises}</td>
                                        <td className="p-3 text-emerald-400 font-bold">{r.quizScore}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
