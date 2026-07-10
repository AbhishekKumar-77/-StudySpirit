import React from 'react';
import { 
    CheckCircle, FileText, User, Users, Cpu, MessageSquare, AlertCircle, History 
} from 'lucide-react';

export function JourneyProgressBar({ journeyStep, journeyModesList }) {
    return (
        <div className="w-full max-w-4xl mx-auto mb-8 px-4">
            <div className="flex items-center justify-between relative">
                {/* Connecting Lines */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
                <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-pink-500 -translate-y-1/2 z-0 transition-all duration-1000" 
                    style={{ width: `${((journeyStep - 1) / Math.max(1, journeyModesList.length - 1)) * 100}%` }}
                />
                
                {journeyModesList.map((mKey, idx) => {
                    const step = idx + 1;
                    const labels = {
                        'ats-checker': { label: 'CV Check', icon: <FileText size={16} /> },
                        'behavioral': { label: 'HR Round', icon: <User size={16} /> },
                        'gd': { label: 'GD Round', icon: <Users size={16} /> },
                        'technical': { label: 'Tech Round', icon: <Cpu size={16} /> },
                        'resume': { label: 'Resume Round', icon: <FileText size={16} /> }
                    };
                    const item = labels[mKey] || { label: mKey.toUpperCase(), icon: <MessageSquare size={16} /> };

                    return (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700 ${journeyStep === step ? 'bg-gradient-to-br from-cyan-400 to-blue-500 scale-125 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse' : journeyStep > step ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800 border border-white/10'}`}>
                                {journeyStep > step ? <CheckCircle size={20} className="text-white" /> : item.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${journeyStep === step ? 'text-cyan-400' : journeyStep > step ? 'text-emerald-400' : 'text-slate-500'}`}>{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function JourneyFinalReport({ journeyReports, resetSessionState }) {
    const avgScore = journeyReports.length > 0 
        ? Math.round((journeyReports.reduce((sum, r) => sum + r.overallScore, 0) / journeyReports.length) * 10) / 10 
        : 0;
        
    const isHired = avgScore >= 7;

    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in-up">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Complete Recruitment Journey Concluded</h2>
                <p className="text-[var(--text-secondary)] mb-8">You have successfully navigated the entire hiring cycle: ATS, Behavioral, Group Discussion, and Technical Assessment.</p>
                
                <div className="flex flex-col items-center">
                    <div className={`w-40 h-40 rounded-full flex flex-col items-center justify-center text-5xl font-black shrink-0 shadow-2xl mb-6 relative ${isHired ? 'bg-emerald-500/10 text-emerald-500 border-4 border-emerald-500 shadow-emerald-500/30' : 'bg-red-500/10 text-red-500 border-4 border-red-500 shadow-red-500/30'}`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-full pointer-events-none" />
                        {avgScore}
                        <span className="text-[12px] font-bold uppercase tracking-widest opacity-80 mt-2">Overall Score</span>
                    </div>
                    <div className={`px-8 py-3 rounded-full font-bold text-xl uppercase tracking-widest shadow-lg ${isHired ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                        {isHired ? 'Status: Recommended for Hire!' : 'Status: Needs Improvement'}
                    </div>
                </div>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {['behavioral', 'gd', 'technical'].map((reportMode, idx) => {
                    const report = journeyReports.find(r => r.sessionMode === reportMode);
                    const icons = [<User key="user" className="w-6 h-6 text-cyan-400" />, <Users key="users" className="w-6 h-6 text-emerald-400" />, <Cpu key="cpu" className="w-6 h-6 text-blue-400" />];
                    const labels = ["HR / Behavioral", "Group Discussion", "Technical Round"];
                    const colors = ["text-cyan-400", "text-emerald-400", "text-blue-400"];
                    
                    return (
                        <div key={idx} className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden group hover:border-white/20 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="flex justify-between items-start mb-6 border-b border-[var(--border-color)] pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-black/40 rounded-xl">{icons[idx]}</div>
                                    <h3 className={`font-bold text-lg ${colors[idx]}`}>{labels[idx]}</h3>
                                </div>
                                {report && (
                                    <span className={`text-2xl font-black ${report.overallScore >= 7 ? 'text-emerald-500' : report.overallScore >= 5 ? 'text-amber-500' : 'text-red-500'}`}>
                                        {report.overallScore}/10
                                    </span>
                                )}
                            </div>
                            
                            {report ? (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs uppercase tracking-widest font-bold text-[var(--text-muted)] mb-2">Key Strengths</h4>
                                        <ul className="text-sm space-y-1">
                                            {report.strengths?.slice(0, 2).map((s, i) => <li key={i} className="text-emerald-400/80 truncate">• {s}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-xs uppercase tracking-widest font-bold text-[var(--text-muted)] mb-2">Areas for Growth</h4>
                                        <ul className="text-sm space-y-1">
                                            {report.improvements?.slice(0, 2).map((s, i) => <li key={i} className="text-amber-400/80 truncate">• {s}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 opacity-40">
                                    <AlertCircle size={32} className="mb-2" />
                                    <p className="text-sm text-center">Report missing or step skipped</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="flex justify-center">
                <button onClick={resetSessionState} className="px-10 py-4 bg-white hover:bg-gray-200 text-black rounded-xl font-bold transition-all shadow-xl shadow-white/10 flex items-center gap-2 relative overflow-hidden group">
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center gap-2"><History /> Finish & Back to Dashboard</span>
                </button>
            </div>
        </div>
    );
}
