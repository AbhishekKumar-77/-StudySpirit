import React, { useRef } from 'react';
import { 
    Cpu, User, Mic, FileText, Sparkles, Users, 
    UploadCloud, X, Play, Loader, CheckCircle
} from 'lucide-react';

export default function SetupPanel({ 
    mode, setMode, setView,
    examCode, setExamCode,
    registrationNumber, setRegistrationNumber,
    isJoiningExam, handleJoinExam, examData,
    totalQuestionsConfig, setTotalQuestionsConfig,
    targetRole, setTargetRole,
    targetCompany, setTargetCompany,
    selectedVoiceURI, setSelectedVoiceURI,
    availableVoices,
    resumeFile, setResumeFile,
    resumeText, setResumeText,
    startInterview, startJourney, isLoading
}) {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                setResumeFile(file);
            } else {
                alert("Please upload a PDF file.");
                e.target.value = null;
            }
        }
    };

    return (
        <div className="w-full flex flex-col md:flex-row gap-8 animate-fade-in-up">
            <div className="flex-1 space-y-8">
                <div>
                    <h2 className="text-4xl font-bold mb-4">Master Your Interview Skills</h2>
                    <p className="text-[var(--text-secondary)] text-lg mb-8">Practice with Aria, our AI interviewer. Get real-time feedback, scoring, and confidence analysis.</p>

                    {/* Master Journey Card */}
                    <div 
                        onClick={startJourney}
                        className="relative group cursor-pointer overflow-hidden p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/40 via-purple-900/20 to-black hover:border-cyan-500 transition-all duration-500 mb-10"
                    >
                        <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[80px] group-hover:blur-[100px] transition-all" />
                        
                        <div className="relative flex flex-col md:flex-row items-center gap-8">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform">
                                <Sparkles className="w-10 h-10 text-white animate-pulse" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest">Recommended</span>
                                    <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-black uppercase tracking-widest">Full Cycle</span>
                                </div>
                                <h3 className="text-3xl font-black text-white mb-2">Complete Recruitment Journey</h3>
                                <p className="text-slate-400 text-sm max-w-xl">Experience the full hiring loop: ATS CV Check → HR Screening → Group Discussion → Final Technical Round. One complete simulation to make you job-ready.</p>
                            </div>
                            <button className="px-8 py-4 bg-white text-black rounded-xl font-black group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-xl">
                                START JOURNEY
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-6 rounded-2xl border cursor-pointer transition-all ${mode === 'technical' ? 'bg-cyan-500/10 border-cyan-500' : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-cyan-500/50'}`} onClick={() => {setMode('technical'); setView('setup');}}>
                        <Cpu className={`w-8 h-8 mb-4 ${mode === 'technical' ? 'text-cyan-500' : 'text-[var(--text-muted)]'}`} />
                        <h3 className="text-xl font-bold mb-2">Technical Round</h3>
                        <p className="text-sm text-[var(--text-secondary)]">DSA, System Design, and coding concepts. Strict and focused.</p>
                    </div>
                    <div className={`p-6 rounded-2xl border cursor-pointer transition-all ${mode === 'behavioral' ? 'bg-pink-600/10 border-pink-500' : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-pink-500/50'}`} onClick={() => {setMode('behavioral'); setView('setup');}}>
                        <User className={`w-8 h-8 mb-4 ${mode === 'behavioral' ? 'text-pink-400' : 'text-[var(--text-muted)]'}`} />
                        <h3 className="text-xl font-bold mb-2">HR / Behavioral</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Soft skills, STAR method, and cultural fit evaluation.</p>
                    </div>
                    <div className={`p-6 rounded-2xl border cursor-pointer transition-all ${mode === 'gd' ? 'bg-violet-600/10 border-violet-500' : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-violet-500/50'}`} onClick={() => {setMode('gd'); setView('setup');}}>
                        <Mic className={`w-8 h-8 mb-4 ${mode === 'gd' ? 'text-violet-400' : 'text-[var(--text-muted)]'}`} />
                        <h3 className="text-xl font-bold mb-2">Group Discussion</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Virtual GD with AI peers (Alex, Sarah). Test debate & leadership.</p>
                    </div>
                    <div className={`p-6 rounded-2xl border cursor-pointer transition-all ${mode === 'ats-checker' ? 'bg-cyan-600/10 border-cyan-500' : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-cyan-500/50'}`} onClick={() => setView('ats-checker')}>
                        <FileText className={`w-8 h-8 mb-4 ${mode === 'ats-checker' ? 'text-cyan-400' : 'text-[var(--text-muted)]'}`} />
                        <h3 className="text-xl font-bold mb-2">ATS Score Checker</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Upload your CV to check its ATS compatibility and get improvements.</p>
                    </div>
                </div>

                {/* Join Teacher Exam Card */}
                <div className="bg-gradient-to-br from-rose-900/40 via-purple-900/20 to-black border border-rose-500/30 p-6 rounded-3xl mb-10 overflow-hidden relative group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 blur-[40px] group-hover:blur-[60px] transition-all" />
                    <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Users className="text-rose-500" /> Join Teacher's Interview Exam
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-rose-400 mb-2">Exam Code</label>
                            <input 
                                type="text" 
                                value={examCode} 
                                onChange={e => setExamCode(e.target.value.toUpperCase())}
                                placeholder="e.g. IV-ABCD"
                                className="w-full bg-white/5 border border-rose-500/20 rounded-xl p-3 text-white focus:border-rose-500 outline-none font-mono tracking-widest"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-rose-400 mb-2">Reg / Roll Number</label>
                            <input 
                                type="text" 
                                value={registrationNumber} 
                                onChange={e => setRegistrationNumber(e.target.value)}
                                placeholder="e.g. 21BCE001"
                                className="w-full bg-white/5 border border-rose-500/20 rounded-xl p-3 text-white focus:border-rose-500 outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                            <button 
                                onClick={handleJoinExam}
                                disabled={isJoiningExam || !examCode || !registrationNumber}
                                className="h-12 px-8 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-lg shadow-rose-900/20 disabled:opacity-50 transition-all whitespace-nowrap"
                            >
                                {isJoiningExam ? 'JOINING...' : 'JOIN EXAM'}
                            </button>
                        </div>
                    </div>
                    {examData && (
                        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                            <CheckCircle className="text-emerald-500 w-5 h-5" />
                            <div>
                                <div className="text-sm font-bold text-white">Joined: {examData.title}</div>
                                <div className="text-xs text-emerald-400">Settings loaded. Click "Start Interview" to begin.</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)]">
                    <h3 className="font-semibold mb-4">Interview Configuration</h3>
                    <div className="space-y-4">
                        {/* Questions count choice */}
                        <div>
                            <label className="block text-sm text-[var(--text-secondary)] mb-2">Number of Questions</label>
                            <div className="flex gap-2">
                                {[5, 10, 15, 20].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setTotalQuestionsConfig(n)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                                            totalQuestionsConfig === n
                                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-500/40'
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Additional Targeting */}
                        {(mode === 'technical' || mode === 'behavioral') && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm text-[var(--text-secondary)] mb-2">Target Role</label>
                                    <select
                                        value={targetRole}
                                        onChange={e => setTargetRole(e.target.value)}
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-[var(--text-secondary)] focus:border-cyan-500/50 focus:outline-none"
                                    >
                                        <option value="Software Engineer">Software Engineer (SWE)</option>
                                        <option value="Frontend Developer">Frontend Developer</option>
                                        <option value="Backend Developer">Backend Developer</option>
                                        <option value="Data Scientist">Data Scientist</option>
                                        <option value="Product Manager">Product Manager (PM)</option>
                                        <option value="DevOps Engineer">DevOps Engineer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-[var(--text-secondary)] mb-2">Target Company</label>
                                    <select
                                        value={targetCompany}
                                        onChange={e => setTargetCompany(e.target.value)}
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-[var(--text-secondary)] focus:border-cyan-500/50 focus:outline-none"
                                    >
                                        <option value="General Tech">General Tech</option>
                                        <option value="Google">Google (FAANG style)</option>
                                        <option value="Amazon">Amazon (Leadership principles)</option>
                                        <option value="Startup">High-Growth Startup</option>
                                        <option value="Finance">FinTech / Trading</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {mode === 'gd' && (
                            <div className="animate-fade-in">
                                <label className="block text-sm text-[var(--text-secondary)] mb-2">Group Discussion Topic</label>
                                <input
                                    type="text"
                                    value={targetRole === 'Software Engineer' ? '' : targetRole}
                                    onChange={e => setTargetRole(e.target.value)}
                                    placeholder="e.g., The Impact of AI on Future Jobs (Left blank for random)"
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-[var(--text-primary)] focus:border-violet-500/50 focus:outline-none"
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-2">
                                    Aria will moderate a roundtable discussion with two AI peers (Alex & Sarah) over this topic.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-[var(--text-secondary)] mb-2">
                                {mode === 'gd' ? 'Lead Moderator Voice' : 'Interviewer Voice'}
                            </label>
                            <select
                                value={selectedVoiceURI}
                                onChange={e => {
                                    setSelectedVoiceURI(e.target.value);
                                    const u = new SpeechSynthesisUtterance(mode === 'gd' ? "Hi, I will moderate this discussion." : "Hi! I will be your interviewer.");
                                    const v = availableVoices.find(voice => voice.voiceURI === e.target.value);
                                    if (v) u.voice = v;
                                    window.speechSynthesis.speak(u);
                                }}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-[var(--text-secondary)] focus:border-cyan-500/50 focus:outline-none mb-4"
                            >
                                <option value="" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Select a natural human voice...</option>
                                {availableVoices.map((v, i) => (
                                    <option key={i} value={v.voiceURI} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                                        {v.name} ({v.lang})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-[var(--text-secondary)] mb-2">Resume (Optional)</label>
                            <div className="flex gap-4 items-center">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-white/5 border border-[var(--border-color)] rounded-lg text-sm hover:bg-white/10 flex items-center gap-2"
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    {resumeFile ? resumeFile.name : "Upload PDF"}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
                                {resumeFile && <button onClick={() => setResumeFile(null)}><X className="w-4 h-4 text-[var(--text-muted)]" /></button>}
                            </div>
                            <textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Or paste resume text here..."
                                className="w-full mt-3 h-24 bg-[var(--bg-secondary)] rounded-lg p-3 text-sm text-[var(--text-secondary)] border border-[var(--border-color)] focus:border-cyan-500/50 focus:outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => startInterview()}
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-pink-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-violet-500/25 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader className="animate-spin" /> : <Play />} Start Interview
                </button>
            </div>
        </div>
    );
}
