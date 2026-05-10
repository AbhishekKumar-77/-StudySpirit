import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    ArrowLeft, Briefcase, MapPin, DollarSign, ExternalLink,
    Search, Star, Clock, RefreshCw, Building2,
    Trophy, BookOpen, TrendingUp, Globe, Zap, X,
    FileText, CheckCircle, Loader, Copy, Sparkles,
    ChevronDown, ChevronUp, Wifi, Columns,
    Plus, Trash2, ArrowRight, AlertCircle
} from 'lucide-react';
import { API_BASE } from '../config';

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'careersprint_bookmarks';
const TRACKER_KEY = 'careersprint_tracker';
const USER_SKILLS_KEY = 'careersprint_user_skills';

function loadJSON(key, fallback) {
    try { return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : fallback; }
    catch { return fallback; }
}
function saveJSON(key, obj) { try { localStorage.setItem(key, JSON.stringify(obj)); } catch { } }

const TYPE_CONFIG = {
    job: { label: 'Full-time', color: 'from-blue-500 to-cyan-500', badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: Briefcase },
    internship: { label: 'Internship', color: 'from-purple-500 to-pink-500', badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: BookOpen },
    hackathon: { label: 'Hackathon', color: 'from-yellow-500 to-orange-500', badgeBg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: Trophy },
};

const KANBAN_COLS = [
    { id: 'saved', label: 'Saved', color: 'border-slate-500', dot: 'bg-slate-400' },
    { id: 'applied', label: 'Applied', color: 'border-blue-500', dot: 'bg-blue-400' },
    { id: 'interviewing', label: 'Interviewing', color: 'border-yellow-500', dot: 'bg-yellow-400' },
    { id: 'offer', label: 'Offer 🎉', color: 'border-emerald-500', dot: 'bg-emerald-400' },
];

function scoreColor(score) {
    if (score >= 80) return { text: 'text-emerald-400', ring: 'stroke-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 60) return { text: 'text-cyan-400', ring: 'stroke-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
    if (score >= 40) return { text: 'text-yellow-400', ring: 'stroke-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' };
    return { text: 'text-red-400', ring: 'stroke-slate-500', bg: 'bg-slate-500/10 border-slate-500/30' };
}

// ─── Mini Donut Chart ─────────────────────────────────────────────────────────
function DonutScore({ score, size = 52 }) {
    const r = 20; const cx = size / 2; const cy = size / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (score / 100) * circumference;
    const c = scoreColor(score);
    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
            <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset}
                className={`${c.ring} transition-all duration-700`} strokeLinecap="round" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                className={`${c.text} font-black fill-current`} style={{ fontSize: 11, transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px` }}>
                {score}%
            </text>
        </svg>
    );
}

// ─── Cover Letter Modal ───────────────────────────────────────────────────────
function CoverLetterModal({ job, userName, userSkills, onClose }) {
    const [letter, setLetter] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const gen = async () => {
            try {
                const res = await fetch(`${API_BASE}/career/cover-letter`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        userName,
                        userSkills,
                        jobTitle: job.title,
                        company: job.company,
                        jobDescription: job.description,
                        jobTags: job.tags
                    })
                });
                const data = await res.json();
                setLetter(data.letter || 'Could not generate letter. Please try again.');
            } catch { setLetter('Error generating cover letter.'); }
            finally { setLoading(false); }
        };
        gen();
    }, []);

    const copy = () => {
        navigator.clipboard.writeText(letter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                            <FileText size={18} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-base">AI Cover Letter</h3>
                            <p className="text-xs text-slate-400">{job.title} · {job.company}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <X size={18} className="text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full bg-purple-500/20 animate-pulse flex items-center justify-center">
                                    <Sparkles className="text-purple-400 animate-bounce" size={24} />
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm animate-pulse">Aria is writing your cover letter...</p>
                        </div>
                    ) : (
                        <textarea
                            value={letter}
                            onChange={e => setLetter(e.target.value)}
                            className="w-full h-72 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 leading-relaxed resize-none focus:border-purple-500/50 focus:outline-none font-sans"
                        />
                    )}
                </div>

                {/* Footer */}
                {!loading && (
                    <div className="p-6 pt-0 flex gap-3">
                        <button onClick={copy}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                            {copied ? <><CheckCircle size={15} /> Copied!</> : <><Copy size={15} /> Copy to Clipboard</>}
                        </button>
                        <a href={job.link} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:opacity-90 transition-all">
                            Apply Now <ExternalLink size={15} />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Match Score Panel (inside card, expandable) ──────────────────────────────
function MatchPanel({ job, userSkills, apiBase }) {
    const [state, setState] = useState('idle'); // idle | loading | done | error
    const [result, setResult] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const analyze = async () => {
        setState('loading');
        try {
            const res = await fetch(`${apiBase}/career/analyze-match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userSkills, jobTitle: job.title, jobDescription: job.description, jobTags: job.tags })
            });
            const data = await res.json();
            if (data.success) { setResult(data.result); setState('done'); setExpanded(true); }
            else setState('error');
        } catch { setState('error'); }
    };

    if (state === 'idle') {
        return (
            <button onClick={analyze}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-500/40 transition-all mt-3">
                <Zap size={12} /> AI Match Score
            </button>
        );
    }

    if (state === 'loading') {
        return (
            <div className="flex items-center justify-center gap-2 py-2 mt-3 text-xs text-slate-400">
                <Loader size={12} className="animate-spin text-cyan-400" /> Analyzing fit...
            </div>
        );
    }

    if (state === 'error') {
        return (
            <div className="flex items-center gap-2 py-2 mt-3 text-xs text-red-400">
                <AlertCircle size={12} /> Analysis failed. <button onClick={analyze} className="underline">Retry</button>
            </div>
        );
    }

    const c = scoreColor(result.matchScore);

    return (
        <div className={`mt-3 rounded-xl border p-3 ${c.bg} animate-fade-in`}>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-3">
                    <DonutScore score={result.matchScore} size={52} />
                    <div>
                        <div className={`font-black text-sm ${c.text}`}>{result.verdict}</div>
                        <div className="text-xs text-slate-400">{result.matchScore}% compatibility</div>
                    </div>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {expanded && (
                <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                    {result.matchedSkills?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1.5">✓ You have</p>
                            <div className="flex flex-wrap gap-1.5">
                                {result.matchedSkills.map(s => (
                                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {result.missingSkills?.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1.5">✗ Missing</p>
                            <div className="flex flex-wrap gap-1.5">
                                {result.missingSkills.map(s => (
                                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {result.tip && (
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                            <Sparkles size={12} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-yellow-300">{result.tip}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Application Tracker (Kanban) ─────────────────────────────────────────────
function AppTracker({ listings }) {
    const [tracker, setTracker] = useState(() => loadJSON(TRACKER_KEY, {}));

    useEffect(() => { saveJSON(TRACKER_KEY, tracker); }, [tracker]);

    const moveCard = (jobId, toCol) => {
        setTracker(prev => {
            const next = { ...prev };
            if (toCol === null) { delete next[jobId]; return next; }
            next[jobId] = toCol;
            return next;
        });
    };

    const jobsInCol = (colId) => Object.entries(tracker)
        .filter(([, col]) => col === colId)
        .map(([id]) => listings.find(l => l.id === id))
        .filter(Boolean);

    const allTracked = Object.keys(tracker).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-black text-white">Application Tracker</h2>
                    <p className="text-sm text-slate-400">{allTracked} applications tracked</p>
                </div>
                {allTracked === 0 && (
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                        <AlertCircle size={14} /> Star a job and move it here to track
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {KANBAN_COLS.map(col => {
                    const cards = jobsInCol(col.id);
                    return (
                        <div key={col.id} className={`bg-white/3 border ${col.color} border-opacity-30 rounded-2xl p-4 min-h-[280px]`}>
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                                <span className="text-sm font-black text-white">{col.label}</span>
                                <span className="ml-auto text-xs px-2 py-0.5 rounded-lg bg-white/10 text-slate-400 font-bold">{cards.length}</span>
                            </div>
                            <div className="space-y-3">
                                {cards.map(job => {
                                    const tc = TYPE_CONFIG[job.type] || TYPE_CONFIG.job;
                                    const otherCols = KANBAN_COLS.filter(c => c.id !== col.id);
                                    return (
                                        <div key={job.id} className="group bg-[var(--bg-secondary)] border border-white/10 rounded-xl p-3 hover:border-white/20 transition-all">
                                            <div className="flex items-start gap-2 mb-2">
                                                <img src={job.logo} alt={job.company}
                                                    className="w-8 h-8 rounded-lg object-contain bg-white/5 flex-shrink-0"
                                                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${job.company[0]}&background=0f172a&color=94a3b8&size=32`; }} />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-white truncate leading-tight">{job.title}</p>
                                                    <p className="text-[11px] text-slate-400">{job.company}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {otherCols.map(oc => (
                                                    <button key={oc.id} onClick={() => moveCard(job.id, oc.id)}
                                                        className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all flex items-center gap-1">
                                                        <ArrowRight size={9} /> {oc.label}
                                                    </button>
                                                ))}
                                                <button onClick={() => moveCard(job.id, null)}
                                                    className="text-[10px] ml-auto p-0.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all">
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {cards.length === 0 && (
                                    <div className="text-center py-8 text-slate-600 text-xs">Drop applications here</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Skills Setup Modal ───────────────────────────────────────────────────────
function SkillsModal({ initialSkills, onSave, onClose }) {
    const [input, setInput] = useState('');
    const [skills, setSkills] = useState(initialSkills || []);
    const suggestSkills = ['React', 'Node.js', 'Python', 'Java', 'TypeScript', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'DSA', 'System Design', 'Flutter', 'SQL', 'Redis'];

    const addSkill = (s) => {
        const trimmed = s.trim();
        if (trimmed && !skills.includes(trimmed)) setSkills(prev => [...prev, trimmed]);
        setInput('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-white">Your Skills Profile</h3>
                        <p className="text-xs text-slate-400">Used for AI Match scoring</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl"><X size={18} className="text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex gap-2">
                        <input value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(input); } }}
                            placeholder="Add a skill (press Enter)..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none" />
                        <button onClick={() => addSkill(input)} className="px-4 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all">
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Current Skills */}
                    <div className="flex flex-wrap gap-2 min-h-[60px]">
                        {skills.map(s => (
                            <span key={s} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                                {s}
                                <button onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="hover:text-red-400 transition-colors">
                                    <X size={11} />
                                </button>
                            </span>
                        ))}
                        {skills.length === 0 && <p className="text-slate-600 text-sm">No skills added yet</p>}
                    </div>

                    {/* Suggestions */}
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Quick Add</p>
                        <div className="flex flex-wrap gap-1.5">
                            {suggestSkills.filter(s => !skills.includes(s)).map(s => (
                                <button key={s} onClick={() => addSkill(s)}
                                    className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/15 hover:text-white transition-all">
                                    + {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 pt-0">
                    <button onClick={() => { onSave(skills); onClose(); }}
                        className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-cyan-500 to-teal-600 text-white hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20">
                        Save Skills Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Skill Passport View ──────────────────────────────────────
function SkillPassportView({ profile }) {
    if (!profile) return <div className="p-12 text-center text-slate-400 animate-pulse flex flex-col items-center gap-4"><Loader size={24} className="animate-spin" /> Fetching your verified stats...</div>;

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-6 sm:p-10 max-w-5xl mx-auto shadow-2xl shadow-cyan-500/10 backdrop-blur-xl animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/20">
                        🎓
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Verified Skill Passport</h2>
                        <p className="text-cyan-400 text-sm font-bold flex items-center gap-1.5 mt-1">
                            <CheckCircle size={14} /> StudySpirit Authenticated Profile
                        </p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all w-full sm:w-auto justify-center">
                    <ExternalLink size={15} /> Public Link
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Technical Skills */}
                <div className="bg-black/20 rounded-2xl p-6 sm:p-8 border border-white/5 flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Zap size={16} className="text-cyan-400" /> Technical Verification
                    </h3>
                    {profile.verifiedSkills && profile.verifiedSkills.length > 0 ? (
                        <div className="space-y-5 flex-1">
                            {profile.verifiedSkills.map((s, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <span className="text-white font-bold block leading-tight">{s.skillName}</span>
                                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">via {s.verifiedBy}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-cyan-400 font-black text-lg leading-none block">{s.score}%</span>
                                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{s.level}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80" style={{ width: `${s.score}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-500 text-sm">
                            <BookOpen size={32} className="mb-3 opacity-30" />
                            <p className="font-bold mb-1 text-slate-400">No skills verified yet</p>
                            <p className="text-xs text-center max-w-[200px]">Take CodeSpirit Exams or Quizzes to build your technical passport.</p>
                        </div>
                    )}
                </div>

                {/* Soft Skills */}
                <div className="bg-black/20 rounded-2xl p-6 sm:p-8 border border-white/5 flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Globe size={16} className="text-purple-400" /> Communication & Soft Skills
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-6 flex-1">
                        <DonutScore score={profile.softSkillsProfile?.communicationScore || 0} size={100} />
                        <div className="space-y-4 text-center sm:text-left">
                            <div>
                                <p className="text-white font-black text-lg leading-tight">AI Communication Score</p>
                                <p className="text-sm text-slate-400">Analyzed via Extempore & Interviews</p>
                            </div>
                            <div className="inline-block px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <p className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-0.5">CEFR English Level</p>
                                <p className="text-xl font-black text-white">{profile.softSkillsProfile?.vocabularyLevel || 'Unrated'}</p>
                            </div>
                        </div>
                    </div>
                    {(!profile.softSkillsProfile || profile.softSkillsProfile.communicationScore === 0) && (
                        <div className="mt-auto p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                            <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-300/90 leading-relaxed">
                                Stand out to recruiters by completing the AI Extempore module to unlock your communication badge.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CareerSprint() {
    const navigate = useNavigate();
    const { user } = useApp();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [bookmarks, setBookmarks] = useState(() => loadJSON(STORAGE_KEY, []));
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sources, setSources] = useState([]);
    const [error, setError] = useState(null);
    const [remoteOnly, setRemoteOnly] = useState(false);
    const [coverLetterJob, setCoverLetterJob] = useState(null);
    const [userSkills, setUserSkills] = useState(() => loadJSON(USER_SKILLS_KEY, []));
    const [showSkillsModal, setShowSkillsModal] = useState(false);
    const [mainView, setMainView] = useState('browse'); // browse | tracker | passport
    const [careerProfile, setCareerProfile] = useState(null);

    useEffect(() => { saveJSON(STORAGE_KEY, bookmarks); }, [bookmarks]);
    useEffect(() => { saveJSON(USER_SKILLS_KEY, userSkills); }, [userSkills]);

    const fetchData = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        try {
            const url = forceRefresh ? `${API_BASE}/career?forceRefresh=true` : `${API_BASE}/career`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) { setListings(data.data || []); setSources(data.sources || []); }
            else setError('Failed to load listings.');
        } catch { setError('Could not connect to server.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { 
        fetchData(); 
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE}/career/profile`, { credentials: 'include' });
                const data = await res.json();
                if (data.success) setCareerProfile(data.profile);
            } catch (err) { console.error('Failed to load profile', err); }
        };
        fetchProfile();
    }, []);

    const handleApplyToJob = async (jobId) => {
        try {
            const res = await fetch(`${API_BASE}/recruiter/jobs/apply`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ jobId })
            });
            const data = await res.json();
            if (data.success) {
                alert('Application submitted with your Skill Passport! Recruiter will see your verified scores.');
            } else {
                alert(data.error || 'Failed to apply');
            }
        } catch (err) {
            alert('Service unavailable');
        }
    };

    const handleApplyToJob = async (jobId) => {
        try {
            const res = await fetch(`${API_BASE}/recruiter/jobs/apply`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ jobId })
            });
            const data = await res.json();
            if (data.success) {
                alert('Application submitted with your Skill Passport! Recruiter will see your verified scores.');
            } else {
                alert(data.error || 'Failed to apply');
            }
        } catch (err) {
            alert('Service unavailable');
        }
    };

    const toggleBookmark = (id) => {
        setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
    };

    const tabs = [
        { id: 'all', label: 'All', icon: Globe, count: listings.length },
        { id: 'job', label: 'Jobs', icon: Briefcase, count: listings.filter(l => l.type === 'job').length },
        { id: 'internship', label: 'Internships', icon: BookOpen, count: listings.filter(l => l.type === 'internship').length },
        { id: 'hackathon', label: 'Hackathons', icon: Trophy, count: listings.filter(l => l.type === 'hackathon').length },
        { id: 'bookmarks', label: 'Saved', icon: Star, count: bookmarks.length },
    ];

    const filteredListings = useMemo(() => {
        return listings.filter(item => {
            if (activeTab === 'bookmarks') return bookmarks.includes(item.id);
            if (activeTab !== 'all' && item.type !== activeTab) return false;
            if (remoteOnly && !item.isRemote) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (item.title || '').toLowerCase().includes(q) ||
                    (item.company || '').toLowerCase().includes(q) ||
                    (item.location || '').toLowerCase().includes(q) ||
                    (item.tags || []).some(t => t.toLowerCase().includes(q));
            }
            return true;
        });
    }, [listings, activeTab, searchQuery, bookmarks, remoteOnly]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-20 font-sans text-[var(--text-primary)] relative overflow-x-hidden">
            {/* BG blobs */}
            <div className="absolute top-[5%] left-[5%] w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[5%] right-[5%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[130px] pointer-events-none" />

            {/* Modals */}
            {coverLetterJob && (
                <CoverLetterModal job={coverLetterJob} userName={user?.name} userSkills={userSkills}
                    onClose={() => setCoverLetterJob(null)} />
            )}
            {showSkillsModal && (
                <SkillsModal initialSkills={userSkills} onSave={setUserSkills}
                    onClose={() => setShowSkillsModal(false)} />
            )}

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
                    <button onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-slate-300 font-semibold transition-all text-sm flex-shrink-0">
                        <ArrowLeft size={15} /> Back
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-cyan-500 to-teal-600 p-2 rounded-xl">
                            <RocketIcon size={18} className="text-white" />
                        </div>
                        <span className="text-base font-black hidden sm:block">CareerSprint</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Skills Badge */}
                        <button onClick={() => setShowSkillsModal(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm font-bold">
                            <Zap size={14} />
                            <span className="hidden sm:block">My Skills</span>
                            {userSkills.length > 0 && (
                                <span className="bg-cyan-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{userSkills.length}</span>
                            )}
                        </button>

                        {/* View Toggle */}
                        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                            <button onClick={() => setMainView('browse')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mainView === 'browse' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                Browse
                            </button>
                            <button onClick={() => setMainView('tracker')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mainView === 'tracker' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                <span className="flex items-center gap-1"><Columns size={12} /> Tracker</span>
                            </button>
                            <button onClick={() => setMainView('passport')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mainView === 'passport' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                <span className="flex items-center gap-1"><CheckCircle size={12} /> Passport</span>
                            </button>
                        </div>

                        <button onClick={() => fetchData(true)} disabled={loading}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all disabled:opacity-50">
                            <RefreshCw size={15} className={loading ? 'animate-spin text-cyan-400' : ''} />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

                {mainView === 'tracker' ? (
                    <AppTracker listings={listings} />
                ) : mainView === 'passport' ? (
                    <SkillPassportView profile={careerProfile} />
                ) : (
                    <>
                        {/* Hero Banner */}
                        <div className="relative bg-gradient-to-r from-cyan-500/10 via-teal-500/5 to-transparent rounded-3xl p-6 sm:p-8 mb-8 border border-cyan-500/15 overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="flex-1">
                                    <div className="text-[10px] text-cyan-400 font-black tracking-[0.3em] uppercase mb-2 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Opportunities
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">CareerSprint Hub</h1>
                                    <p className="text-slate-400 text-sm">AI-powered job matching · Instant cover letters · Application tracking</p>
                                </div>
                                {/* Stats */}
                                <div className="flex gap-3 flex-wrap">
                                    {[
                                        { label: 'Listings', value: listings.length, color: 'text-cyan-400' },
                                        { label: 'Jobs', value: listings.filter(l => l.type === 'job').length, color: 'text-blue-400' },
                                        { label: 'Intern', value: listings.filter(l => l.type === 'internship').length, color: 'text-purple-400' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-center">
                                            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Skills CTA if no skills set */}
                            {userSkills.length === 0 && (
                                <div className="mt-5 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <div className="flex items-center gap-2 text-sm text-yellow-400">
                                        <Sparkles size={16} />
                                        <span className="font-bold">Set up your skills profile to unlock AI Match Scores on every job listing!</span>
                                    </div>
                                    <button onClick={() => setShowSkillsModal(true)}
                                        className="flex-shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white text-sm font-black shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all">
                                        Set Up Skills →
                                    </button>
                                </div>
                            )}

                            {sources.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                                    <span className="text-[10px] text-slate-600 self-center uppercase font-bold tracking-wider">Sources:</span>
                                    {sources.slice(0, 6).map(s => (
                                        <span key={s} className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400">{s}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch md:items-center bg-white/3 backdrop-blur-xl p-3 rounded-2xl border border-white/5">
                            {/* Tabs */}
                            <div className="flex gap-1.5 overflow-x-auto pb-0 flex-shrink-0">
                                {tabs.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${activeTab === tab.id
                                            ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                        <tab.icon size={12} />
                                        {tab.label}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'}`}>{tab.count}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                                <input type="text" placeholder="Search title, company, skills..."
                                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500/40 focus:outline-none transition-all placeholder:text-slate-600" />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Remote Toggle */}
                            <button onClick={() => setRemoteOnly(!remoteOnly)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm flex-shrink-0 transition-all border ${remoteOnly
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
                                <Wifi size={14} /> Remote Only
                            </button>
                        </div>

                        {/* Results count */}
                        {!loading && !error && (
                            <p className="text-xs text-slate-600 mb-4 font-medium">
                                Showing <span className="text-cyan-400 font-black">{filteredListings.length}</span> listings
                                {userSkills.length > 0 && <span> · AI Match enabled for <span className="text-cyan-400">{userSkills.length} skills</span></span>}
                            </p>
                        )}

                        {/* Loading Skeleton */}
                        {loading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white/3 rounded-2xl p-6 border border-white/5 animate-pulse">
                                        <div className="flex gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/10" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-white/10 rounded-lg w-3/4" />
                                                <div className="h-3 bg-white/5 rounded-lg w-1/2" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-white/5 rounded-lg w-full" />
                                            <div className="h-3 bg-white/5 rounded-lg w-4/5" />
                                            <div className="h-8 bg-white/5 rounded-xl w-full mt-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {!loading && error && (
                            <div className="text-center py-20">
                                <div className="text-5xl mb-4">⚠️</div>
                                <p className="text-slate-400 mb-6">{error}</p>
                                <button onClick={() => fetchData()} className="px-6 py-3 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all font-bold">
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Job Grid */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredListings.length > 0 ? filteredListings.map(item => {
                                    const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.job;
                                    const TypeIcon = tc.icon;
                                    const isBookmarked = bookmarks.includes(item.id);

                                    return (
                                        <div key={item.id}
                                            className="group relative bg-white/3 backdrop-blur-xl rounded-2xl p-5 border border-white/8 hover:border-cyan-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/5 flex flex-col">
                                            {/* Top gradient on hover */}
                                            <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${tc.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        <img src={item.logo} alt={item.company}
                                                            className="w-10 h-10 object-contain"
                                                            onError={e => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }} />
                                                        <div className="hidden w-full h-full items-center justify-center text-base font-black text-slate-400">
                                                            {(item.company || '?')[0].toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-sm leading-tight text-white group-hover:text-cyan-400 transition-colors truncate">{item.title}</h3>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1 truncate mt-0.5">
                                                            <Building2 size={10} className="flex-shrink-0" /> {item.company}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button onClick={() => toggleBookmark(item.id)}
                                                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-all">
                                                    <Star size={16} fill={isBookmarked ? 'currentColor' : 'none'}
                                                        className={isBookmarked ? 'text-yellow-400' : 'text-slate-600 hover:text-slate-400'} />
                                                </button>
                                            </div>

                                            {/* Badge */}
                                            <div className="mb-3">
                                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${tc.badgeBg}`}>
                                                    <TypeIcon size={10} /> {tc.label}
                                                    {item.isRemote && <span className="ml-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-1.5 rounded-md text-[10px]">Remote</span>}
                                                </span>
                                            </div>

                                            {/* Details */}
                                            <div className="space-y-1.5 mb-3 text-xs text-slate-500">
                                                {item.location && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={11} className="text-cyan-600 flex-shrink-0" />
                                                        <span className="truncate">{item.location}</span>
                                                    </div>
                                                )}
                                                {item.salary && item.salary !== 'Not Disclosed' && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign size={11} className="text-emerald-600 flex-shrink-0" />
                                                        <span className="text-emerald-400 font-semibold">{item.salary}</span>
                                                    </div>
                                                )}
                                                {item.posted && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={11} className="text-orange-600 flex-shrink-0" />
                                                        <span>{item.posted}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Description */}
                                            {item.description && (
                                                <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">{item.description}</p>
                                            )}

                                            {/* Tags */}
                                            {item.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {item.tags.slice(0, 4).map(tag => (
                                                        <span key={tag} className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/8 text-slate-500">{tag}</span>
                                                    ))}
                                                    {item.tags.length > 4 && (
                                                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/8 text-slate-600">+{item.tags.length - 4}</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* AI Match Panel */}
                                            {userSkills.length > 0 && (
                                                <MatchPanel job={item} userSkills={userSkills} apiBase={API_BASE} />
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                                <span className="text-[10px] text-slate-600 font-bold">via {item.source}</span>
                                                <div className="flex items-center gap-2">
                                                    {/* Cover Letter */}
                                                    <button onClick={() => { setCoverLetterJob(item); }}
                                                        title="Generate AI Cover Letter"
                                                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all">
                                                        <FileText size={11} /> Letter
                                                    </button>
                                                    {/* Apply */}
                                                    <button onClick={() => {
                                                            if (item.isInternalHackathon) {
                                                                if (item.hackathonQuizCode) navigate(`/quiz?preview=1&code=${item.hackathonQuizCode}`);
                                                                else navigate('/quiz');
                                                            } else {
                                                                window.open(item.link, '_blank', 'noopener');
                                                            }
                                                        }}
                                                        className={`flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-xl bg-gradient-to-r ${tc.color} text-white hover:opacity-90 transition-all shadow-lg`}>
                                                        {item.isInternalHackathon ? 'Start Hackathon' : 'Apply'} {item.isInternalHackathon ? <Zap size={12} /> : <ExternalLink size={12} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="col-span-full py-24 text-center">
                                        <Search size={48} className="mx-auto mb-4 text-slate-700" />
                                        <p className="text-slate-400 text-lg font-bold mb-2">No results found</p>
                                        <p className="text-slate-600 text-sm mb-6">Try different keywords or clear the filters</p>
                                        <button onClick={() => { setSearchQuery(''); setActiveTab('all'); setRemoteOnly(false); }}
                                            className="px-6 py-3 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all font-bold">
                                            Clear All Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function RocketIcon({ size = 24, className = '' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    );
}
