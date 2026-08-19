import React from "react";
import { Users, ShieldAlert, CheckCircle, Clock, Lock, Unlock, Printer, Trophy } from "lucide-react";

export default function LiveProctorPanel({
    quizCode = "",
    quizTitle = "",
    isClosed = false,
    activeStudents = [],
    onToggleCloseExam = () => {},
    onPrintPaper = () => {},
    onViewLeaderboard = () => {}
}) {
    const activeCount = activeStudents.filter(s => s.status === 'active').length;
    const submittedCount = activeStudents.filter(s => s.status === 'submitted').length;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                        <Users className="w-4 h-4" /> Live Proctoring Control Room
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">{quizTitle} ({quizCode})</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={onPrintPaper}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                    >
                        <Printer className="w-3.5 h-3.5 text-blue-400" /> Export PDF/Print
                    </button>

                    <button
                        onClick={onViewLeaderboard}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                    >
                        <Trophy className="w-3.5 h-3.5 text-amber-400" /> Leaderboard
                    </button>

                    <button
                        onClick={onToggleCloseExam}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isClosed
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                                : "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
                        }`}
                    >
                        {isClosed ? (
                            <>
                                <Unlock className="w-3.5 h-3.5" /> Re-Open Exam
                            </>
                        ) : (
                            <>
                                <Lock className="w-3.5 h-3.5" /> Lock & Close Exam
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-blue-400">{activeStudents.length}</div>
                    <div className="text-xs text-slate-400 font-medium">Total Joined</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-amber-400">{activeCount}</div>
                    <div className="text-xs text-slate-400 font-medium">Active Now</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-emerald-400">{submittedCount}</div>
                    <div className="text-xs text-slate-400 font-medium">Completed</div>
                </div>
            </div>

            {/* Live Student Telemetry List */}
            <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                    <span>Live Student Roster</span>
                    <span className="text-[10px] text-slate-500 font-mono">Realtime WebSockets</span>
                </div>

                {activeStudents.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                        Waiting for students to join using code <strong>{quizCode}</strong>...
                    </div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {activeStudents.map((s, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                                        {s.name ? s.name.charAt(0).toUpperCase() : "S"}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-200">{s.name || "Student"}</div>
                                        <div className="text-[10px] text-slate-500">{s.registrationNumber || "Reg No: N/A"}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {s.status === 'submitted' ? (
                                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">
                                            Score: {s.score !== null && s.score !== undefined ? `${s.score}%` : 'Submitted'}
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-medium flex items-center gap-1 animate-pulse">
                                            <Clock className="w-3 h-3" /> Taking Exam
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
