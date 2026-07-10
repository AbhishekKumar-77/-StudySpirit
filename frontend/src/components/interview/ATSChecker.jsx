import React from 'react';
import { 
    FileText, UploadCloud, Activity, Loader, Trophy, AlertCircle, CheckCircle, X, Sparkles 
} from 'lucide-react';

export default function ATSChecker({
    atsFile,
    setAtsFile,
    atsJobDescription,
    setAtsJobDescription,
    atsResult,
    isCheckingAts,
    checkATS,
    isJourneyMode,
    nextJourneyStep
}) {
    return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-6 animate-fade-in-up">
            {/* Left: Input Form */}
            <div className="w-full lg:w-1/3 bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col text-left overflow-y-auto">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-cyan-400">
                    <FileText className="text-cyan-400" /> ATS CV Checker
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">Upload your CV in PDF format to run it through our AI-powered ATS simulator.</p>
                
                <label className="w-full h-32 border-2 border-dashed border-cyan-500/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-500/5 transition-all mb-6">
                    <UploadCloud className="w-8 h-8 text-cyan-500 mb-2" />
                    <span className="font-bold text-cyan-400">{atsFile ? atsFile.name : "Select PDF Resume"}</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setAtsFile(e.target.files[0])} />
                </label>

                <div className="mb-6 flex-1 flex flex-col">
                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Target Job Description (Optional)</label>
                    <textarea
                        value={atsJobDescription}
                        onChange={(e) => setAtsJobDescription(e.target.value)}
                        placeholder="Paste the job description here for a tailored Keyword Match Rate and fit analysis..."
                        className="w-full flex-1 min-h-[150px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50 resize-y"
                    />
                </div>

                <button
                    onClick={checkATS}
                    disabled={isCheckingAts || !atsFile}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCheckingAts ? <Loader className="animate-spin" /> : <Activity />} Analyze ATS Score
                </button>
            </div>

            {/* Right: Results */}
            <div className="w-full lg:w-2/3 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] overflow-y-auto p-8 relative">
                {atsResult ? (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Overall Score Banner */}
                        <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-[var(--border-color)]">
                            <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-4xl font-black shrink-0 shadow-lg ${atsResult.overallScore >= 80 ? 'bg-emerald-500/10 text-emerald-500 border-4 border-emerald-500/50 shadow-emerald-500/10' : atsResult.overallScore >= 50 ? 'bg-amber-500/10 text-amber-500 border-4 border-amber-500/50 shadow-amber-500/10' : 'bg-red-500/10 text-red-500 border-4 border-red-500/50 shadow-red-500/10'}`}>
                                {atsResult.overallScore}
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Overall</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-2">ATS Score Result</h2>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {atsJobDescription && (
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${atsResult.matchRate >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>JD Match: {atsResult.matchRate}%</span>
                                    )}
                                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-cyan-500/10 border-cyan-500/30 text-cyan-500">Formats: {atsResult.subScores?.formatting || 0}/100</span>
                                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-blue-500/10 border-blue-500/30 text-blue-500">Impact: {atsResult.subScores?.impactMetrics || 0}/100</span>
                                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-pink-500/10 border-pink-500/30 text-pink-500">Keywords: {atsResult.subScores?.keywordDensity || 0}/100</span>
                                </div>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{atsResult.summary}</p>
                            </div>
                        </div>

                        {isJourneyMode && (
                            <div className={`p-6 rounded-2xl border flex items-center justify-between transition-all ${atsResult.overallScore >= 50 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                                <div>
                                    <h4 className={`font-bold ${atsResult.overallScore >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {atsResult.overallScore >= 50 ? 'Application Success!' : 'Review & Proceed'}
                                    </h4>
                                    <p className="text-sm opacity-70">
                                        {atsResult.overallScore >= 50 
                                            ? "Your CV is strong! You've been advanced to the HR Interview round."
                                            : "Your CV could use work, but you can still proceed to the HR round for practice."}
                                    </p>
                                </div>
                                <button 
                                    onClick={nextJourneyStep} 
                                    className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95 ${atsResult.overallScore >= 50 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'}`}
                                >
                                    Go to HR Interview
                                </button>
                            </div>
                        )}
                        
                        {/* Advanced Keyword Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border-color)]">
                                <h3 className="font-bold text-gray-400 mb-4 flex items-center gap-2"><Trophy size={18} /> Strong Action Verbs Found</h3>
                                <div className="flex flex-wrap gap-2">
                                    {atsResult.strongVerbsFound?.length > 0 ? atsResult.strongVerbsFound.map((item, i) => (
                                        <span key={i} className="text-xs font-bold bg-white/5 text-blue-400 px-3 py-1.5 rounded border border-blue-500/20">{item}</span>
                                    )) : <span className="text-xs text-red-400 italic">None detected. Use verbs like 'Led', 'Architected', 'Spearheaded'.</span>}
                                </div>
                            </div>
                            <div className="bg-red-500/5 p-6 rounded-xl border border-red-500/10">
                                <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2"><AlertCircle size={18} /> Crucial Missing Keywords</h3>
                                <div className="flex flex-wrap gap-2">
                                    {atsResult.missingKeywords?.length > 0 ? atsResult.missingKeywords.map((item, i) => (
                                        <span key={i} className="text-xs font-bold bg-white/5 text-red-400 px-3 py-1.5 rounded border border-red-500/20">{item}</span>
                                    )) : <span className="text-xs text-emerald-400 italic">No major keywords missing!</span>}
                                </div>
                            </div>
                        </div>

                        {/* Pros Cons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-emerald-500/5 p-6 rounded-xl border border-emerald-500/10">
                                <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2"><CheckCircle size={18} /> Strengths</h3>
                                <ul className="space-y-2">
                                    {atsResult.strengths?.map((str, i) => (
                                        <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                            <span className="text-emerald-500 font-bold mt-0.5">•</span> {str}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-amber-500/5 p-6 rounded-xl border border-amber-500/10">
                                <h3 className="font-bold text-amber-500 mb-4 flex items-center gap-2"><X size={18} /> Weaknesses</h3>
                                <ul className="space-y-2">
                                    {atsResult.weaknesses?.map((wk, i) => (
                                        <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                            <span className="text-amber-500 font-bold mt-0.5">•</span> {wk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Action Plan */}
                        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6 rounded-xl border border-cyan-500/20">
                            <h3 className="font-bold text-cyan-400 mb-4 flex items-center gap-2"><Sparkles size={18} /> Recommended Action Plan</h3>
                            <ul className="space-y-3">
                                {atsResult.improvements?.map((imp, i) => (
                                    <li key={i} className="text-sm text-[var(--text-primary)] flex items-start gap-3 bg-[var(--bg-primary)] p-4 rounded-lg shadow-sm border border-[var(--border-color)]">
                                        <div className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">{i+1}</div>
                                        <span className="flex-1 mt-0.5 opacity-90">{imp}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <Activity size={64} className="mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Awaiting Upload</h3>
                        <p className="text-sm max-w-sm">Upload your CV (and optional Job Description) to reveal exactly how ATS algorithms will parse and grade your application.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
