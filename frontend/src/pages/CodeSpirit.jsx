import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import {
    ArrowLeft, Send, Sparkles, Terminal, Cpu, Hash, History, CheckCircle, Code,
    Flame, Star, Clock, Trash2, Filter, Search, ChevronRight, Zap, Trophy,
    Calendar, RefreshCw, X, BookOpen, BarChart3
} from "lucide-react";
import { useApp } from "../context/AppContext";

const TOPIC_PRESETS = {
    'Arrays & Hashing': { icon: '📦', color: '#6366f1' },
    'Strings': { icon: '🔤', color: '#ec4899' },
    'Two Pointers': { icon: '👆', color: '#f59e0b' },
    'Sliding Window': { icon: '🪟', color: '#10b981' },
    'Stacks & Queues': { icon: '📚', color: '#8b5cf6' },
    'Linked Lists': { icon: '🔗', color: '#06b6d4' },
    'Binary Search': { icon: '🔍', color: '#f43f5e' },
    'Trees': { icon: '🌳', color: '#84cc16' },
    'Graphs': { icon: '🕸️', color: '#f97316' },
    'Dynamic Programming': { icon: '🧩', color: '#14b8a6' },
    'Recursion & Backtracking': { icon: '🔄', color: '#a855f7' },
    'Sorting Algorithms': { icon: '📊', color: '#64748b' },
    'Greedy Algorithms': { icon: '💰', color: '#eab308' },
    'Bit Manipulation': { icon: '🔢', color: '#ef4444' },
    'Math & Number Theory': { icon: '🔬', color: '#0ea5e9' },
    'Heap / Priority Queue': { icon: '⛰️', color: '#d946ef' }
};

export default function CodeSpirit() {
    const navigate = useNavigate();
    const { user } = useApp();

    const [activeTab, setActiveTab] = useState("generate");

    // Generation State
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("medium");
    const [questionCount, setQuestionCount] = useState(5);
    const [language, setLanguage] = useState("python");
    const [isGenerating, setIsGenerating] = useState(false);
    const [showCustomTopic, setShowCustomTopic] = useState(false);

    // History State
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyFilter, setHistoryFilter] = useState({ difficulty: 'all', language: 'all', completed: 'all' });
    const [searchQuery, setSearchQuery] = useState('');

    // Daily Challenge State
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [loadingDaily, setLoadingDaily] = useState(false);

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab, historyFilter]);

    useEffect(() => {
        fetchDailyChallenge();
    }, []);

    const fetchDailyChallenge = async () => {
        setLoadingDaily(true);
        try {
            const res = await fetch(`${API_BASE}/codespirit/daily?language=${language}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setDailyChallenge(data.session);
        } catch (e) {
            console.error("Daily challenge error:", e);
        } finally {
            setLoadingDaily(false);
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const params = new URLSearchParams();
            if (historyFilter.difficulty !== 'all') params.set('difficulty', historyFilter.difficulty);
            if (historyFilter.language !== 'all') params.set('language', historyFilter.language);
            if (historyFilter.completed !== 'all') params.set('completed', historyFilter.completed);

            const res = await fetch(`${API_BASE}/codespirit/history?${params}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setHistory(data.sessions);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleGenerate = async () => {
        if (!topic.trim()) return alert("Please enter or select a topic!");
        setIsGenerating(true);
        try {
            const res = await fetch(`${API_BASE}/codespirit/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ topic, difficulty, count: questionCount, language })
            });
            const data = await res.json();
            if (data.success && data.challenges?.length > 0) {
                navigate('/code-editor', {
                    state: { sessionId: data.sessionId, challenges: data.challenges, totalCount: data.totalCount, topic, difficulty }
                });
            } else {
                alert("Failed to generate: " + (data.message || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to server.");
        } finally {
            setIsGenerating(false);
        }
    };

    const deleteSession = async (sessionId, e) => {
        e.stopPropagation();
        if (!confirm('Delete this session? This cannot be undone.')) return;
        try {
            await fetch(`${API_BASE}/codespirit/session/${sessionId}`, {
                method: 'DELETE', credentials: 'include'
            });
            setHistory(prev => prev.filter(s => s._id !== sessionId));
        } catch (err) {
            console.error(err);
        }
    };

    const resumeSession = (session) => {
        navigate('/code-editor', {
            state: { sessionId: session._id, challenges: session.challenges, totalCount: session.challenges.length, topic: session.topic, difficulty: session.difficulty }
        });
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(dateStr).toLocaleDateString();
    };

    const countOptions = [1, 2, 3, 5, 7, 10, 15];
    const languages = [
        { id: "python", name: "Python 3", icon: "🐍" },
        { id: "javascript", name: "JavaScript", icon: "⚡" },
        { id: "cpp", name: "C++", icon: "⚙️" },
        { id: "c", name: "C", icon: "🔧" },
        { id: "java", name: "Java", icon: "☕" }
    ];

    const filteredHistory = history.filter(s =>
        searchQuery ? s.topic.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300 text-[var(--text-primary)] font-sans">
            {/* Navbar */}
            <nav className="border-b border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-xl font-bold flex items-center gap-2">
                        <Terminal className="text-cyan-500" />
                        CodeSpirit <span className="opacity-50 font-normal hidden sm:inline">| Practice Arena</span>
                    </div>
                </div>

                <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-color)]">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'generate' ? 'bg-cyan-500 text-white shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        <Sparkles size={16} /> Generate
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-cyan-500 text-white shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        <History size={16} /> History
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto p-6 animate-fade-in">

                {activeTab === 'generate' && (
                    <>
                        {/* Daily Challenge Banner */}
                        {dailyChallenge && (
                            <div className="mb-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 cursor-pointer hover:border-amber-500/40 transition-all"
                                onClick={() => resumeSession(dailyChallenge)}>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-2xl">
                                            <Flame className="text-amber-500" size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Daily Challenge</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${dailyChallenge.difficulty === 'hard' ? 'bg-rose-500/20 text-rose-500' :
                                                    dailyChallenge.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-500' :
                                                        'bg-emerald-500/20 text-emerald-500'
                                                    }`}>{dailyChallenge.difficulty}</span>
                                            </div>
                                            <h3 className="text-lg font-bold">{dailyChallenge.topic}</h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {dailyChallenge.completed ? (
                                            <span className="flex items-center gap-2 text-emerald-500 font-bold"><CheckCircle size={18} /> Completed!</span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-amber-500 font-bold">
                                                {dailyChallenge.challenges?.filter(c => c.status === 'solved').length || 0}/{dailyChallenge.challenges?.length || 0} solved
                                            </span>
                                        )}
                                        <button className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2">
                                            {dailyChallenge.completed ? 'Review' : 'Solve Now'} <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Topic Categories Grid */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-black mb-2">Choose a Topic</h2>
                            <p className="text-[var(--text-secondary)] mb-5">Select a category or type your own custom topic below.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {Object.entries(TOPIC_PRESETS).map(([name, config]) => (
                                    <button
                                        key={name}
                                        onClick={() => { setTopic(name); setShowCustomTopic(false); }}
                                        className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${topic === name
                                            ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                                            : 'border-[var(--border-color)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)]'
                                            }`}
                                    >
                                        <span className="text-2xl mb-2 block">{config.icon}</span>
                                        <span className="text-sm font-bold leading-tight block">{name}</span>
                                    </button>
                                ))}
                                {/* Custom Topic Button */}
                                <button
                                    onClick={() => { setShowCustomTopic(true); setTopic(''); }}
                                    className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] border-dashed ${showCustomTopic
                                        ? 'border-cyan-500 bg-cyan-500/10'
                                        : 'border-[var(--border-color)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)]'
                                        }`}
                                >
                                    <span className="text-2xl mb-2 block">✏️</span>
                                    <span className="text-sm font-bold leading-tight block">Custom Topic</span>
                                </button>
                            </div>
                        </div>

                        {/* Custom Topic Input (only if custom selected or typed) */}
                        {(showCustomTopic || (!Object.keys(TOPIC_PRESETS).includes(topic) && topic)) && (
                            <div className="mb-6">
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Custom Topic</label>
                                <input
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. Recursion, Dynamic Programming, Trie..."
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-4 text-lg focus:outline-none focus:border-cyan-500 transition-colors"
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Configuration Card */}
                        <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] p-6 rounded-2xl backdrop-blur-sm mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Language */}
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 block flex items-center gap-2">
                                        <Code size={14} /> Language
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {languages.map(l => (
                                            <button
                                                key={l.id}
                                                onClick={() => setLanguage(l.id)}
                                                className={`py-2.5 px-3 rounded-xl border font-bold text-sm transition-all flex items-center gap-2 ${language === l.id
                                                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                                                    }`}
                                            >
                                                <span>{l.icon}</span> {l.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Difficulty */}
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 block flex items-center gap-2">
                                        <BarChart3 size={14} /> Difficulty
                                    </label>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            { id: 'easy', label: 'Easy', color: 'emerald' },
                                            { id: 'medium', label: 'Medium', color: 'amber' },
                                            { id: 'hard', label: 'Hard', color: 'rose' }
                                        ].map(d => (
                                            <button
                                                key={d.id}
                                                onClick={() => setDifficulty(d.id)}
                                                className={`py-2.5 rounded-xl border font-bold capitalize text-sm transition-all ${difficulty === d.id
                                                    ? `bg-${d.color}-500 border-${d.color}-500 text-white shadow-lg shadow-${d.color}-500/25`
                                                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                                                    }`}
                                                style={difficulty === d.id ? {
                                                    background: d.color === 'emerald' ? '#10b981' : d.color === 'amber' ? '#f59e0b' : '#f43f5e',
                                                    borderColor: d.color === 'emerald' ? '#10b981' : d.color === 'amber' ? '#f59e0b' : '#f43f5e',
                                                    color: 'white'
                                                } : {}}
                                            >
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Count */}
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 block flex items-center gap-2">
                                        <Hash size={14} /> Questions
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {countOptions.map(num => (
                                            <button
                                                key={num}
                                                onClick={() => setQuestionCount(num)}
                                                className={`h-11 rounded-xl border font-bold text-sm transition-all ${questionCount === num
                                                    ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                                                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !topic}
                                className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg"
                            >
                                {isGenerating ? (
                                    <> <Cpu className="animate-spin" /> Generating {questionCount} Challenge{questionCount > 1 ? 's' : ''}... </>
                                ) : (
                                    <> <Zap size={20} /> Generate {questionCount} Challenge{questionCount > 1 ? 's' : ''} </>
                                )}
                            </button>

                            {topic && (
                                <p className="text-center text-sm text-[var(--text-secondary)] mt-3">
                                    <span className="font-bold text-cyan-500">{topic}</span> • {difficulty} • {questionCount} question{questionCount > 1 ? 's' : ''} • {languages.find(l => l.id === language)?.name}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'history' && (
                    <div className="pt-4 pb-12">
                        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-black mb-2">Session History</h1>
                                <p className="text-[var(--text-secondary)]">Resume, review, or manage your past challenge sessions.</p>
                            </div>
                            <button onClick={fetchHistory} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-bold hover:bg-[var(--border-color)] transition">
                                <RefreshCw size={14} /> Refresh
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search topics..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                            <select
                                value={historyFilter.difficulty}
                                onChange={e => setHistoryFilter(p => ({ ...p, difficulty: e.target.value }))}
                                className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-semibold"
                            >
                                <option value="all">All Difficulties</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <select
                                value={historyFilter.language}
                                onChange={e => setHistoryFilter(p => ({ ...p, language: e.target.value }))}
                                className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-semibold"
                            >
                                <option value="all">All Languages</option>
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="cpp">C++</option>
                                <option value="c">C</option>
                                <option value="java">Java</option>
                            </select>
                            <select
                                value={historyFilter.completed}
                                onChange={e => setHistoryFilter(p => ({ ...p, completed: e.target.value }))}
                                className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-semibold"
                            >
                                <option value="all">All Status</option>
                                <option value="true">Completed</option>
                                <option value="false">In Progress</option>
                            </select>
                        </div>

                        {loadingHistory ? (
                            <div className="flex justify-center p-10"><Cpu className="animate-spin text-cyan-500" size={30} /></div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-10 rounded-2xl text-center">
                                <History className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" size={40} />
                                <h3 className="text-xl font-bold mb-2">No Sessions Found</h3>
                                <p className="text-[var(--text-secondary)]">
                                    {searchQuery || historyFilter.difficulty !== 'all' || historyFilter.language !== 'all' || historyFilter.completed !== 'all'
                                        ? 'No sessions match your filters. Try adjusting them.'
                                        : 'Generate your first session to see it here.'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredHistory.map(session => {
                                    const solvedCount = session.challenges.filter(c => c.status === 'solved').length;
                                    const totalCount = session.challenges.length;
                                    const progress = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

                                    return (
                                        <div key={session._id}
                                            className="bg-[var(--glass-bg)] border border-[var(--border-color)] p-5 rounded-2xl hover:border-cyan-500/50 transition-all group cursor-pointer"
                                            onClick={() => resumeSession(session)}
                                        >
                                            <div className="flex items-center justify-between flex-wrap gap-4">
                                                <div className="flex-1 min-w-[200px]">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        {session.isDaily && (
                                                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                                <Flame size={10} /> Daily
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${session.difficulty === 'hard' ? 'bg-rose-500/20 text-rose-500' :
                                                            session.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-500' :
                                                                'bg-emerald-500/20 text-emerald-500'
                                                            }`}>
                                                            {session.difficulty}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-500 text-xs font-bold uppercase tracking-wider">
                                                            {session.language}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{session.topic}</h3>
                                                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                                        <Clock size={12} /> {timeAgo(session.createdAt)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-5">
                                                    {/* Progress */}
                                                    <div className="text-center min-w-[80px]">
                                                        <div className="text-xs text-[var(--text-muted)] mb-1">Progress</div>
                                                        <div className="text-lg font-bold">
                                                            <span className={solvedCount === totalCount ? 'text-emerald-500' : 'text-cyan-500'}>{solvedCount}</span>
                                                            <span className="text-[var(--text-muted)]">/{totalCount}</span>
                                                        </div>
                                                        {/* Mini progress bar */}
                                                        <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full mt-1">
                                                            <div className={`h-full rounded-full transition-all ${solvedCount === totalCount ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                                                                style={{ width: `${progress}%` }} />
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={(e) => deleteSession(session._id, e)}
                                                        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100"
                                                        title="Delete session"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); resumeSession(session); }}
                                                        className="bg-cyan-500 hover:bg-cyan-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                                                    >
                                                        {solvedCount === totalCount ? 'Review' : 'Resume'} <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out; }
            `}</style>
        </div>
    );
}
