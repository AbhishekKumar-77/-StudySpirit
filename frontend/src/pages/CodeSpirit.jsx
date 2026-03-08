import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import {
    ArrowLeft, Send, Sparkles, Terminal, Cpu, Hash, History, CheckCircle, Code
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function CodeSpirit() {
    const navigate = useNavigate();
    const { user } = useApp();

    const [activeTab, setActiveTab] = useState("generate"); // generate or history

    // State for Generation
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("medium");
    const [questionCount, setQuestionCount] = useState(5);
    const [language, setLanguage] = useState("python");
    const [isGenerating, setIsGenerating] = useState(false);

    // State for History
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/codespirit/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setHistory(data.sessions);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Generate Questions Handler
    const handleGenerate = async () => {
        if (!topic.trim()) return alert("Please enter a topic!");

        setIsGenerating(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/codespirit/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic, difficulty, count: questionCount, language })
            });

            const data = await res.json();

            if (data.success && data.challenges && data.challenges.length > 0) {
                // Navigate to the Code Editor with ALL challenges
                navigate('/code-editor', {
                    state: {
                        sessionId: data.sessionId,
                        challenges: data.challenges,
                        totalCount: data.totalCount,
                        topic,
                        difficulty
                    }
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

    const countOptions = [1, 2, 3, 5, 7, 10, 15];
    const languages = [
        { id: "python", name: "Python 3" },
        { id: "javascript", name: "JavaScript" },
        { id: "cpp", name: "C++" },
        { id: "java", name: "Java" }
    ];

    const resumeSession = (session) => {
        navigate('/code-editor', {
            state: {
                sessionId: session._id,
                challenges: session.challenges,
                totalCount: session.challenges.length,
                topic: session.topic,
                difficulty: session.difficulty
            }
        });
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300 text-[var(--text-primary)] font-sans">
            {/* Minimal Navbar */}
            <nav className="border-b border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-xl font-bold flex items-center gap-2">
                        <Terminal className="text-cyan-500" />
                        CodeSpirit <span className="opacity-50 font-normal hidden sm:inline">| Daily Practice</span>
                    </div>
                </div>

                <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-color)]">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'generate' ? 'bg-cyan-500 text-white shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        <Sparkles size={16} /> New Server
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-cyan-500 text-white shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        <History size={16} /> History
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center p-6 animate-fade-in text-center max-w-3xl mx-auto">

                {activeTab === 'generate' && (
                    <>
                        <div className="w-20 h-20 bg-cyan-500/20 rounded-3xl flex items-center justify-center mb-8 ring-4 ring-violet-500/10 mt-8">
                            <Sparkles size={40} className="text-cyan-500" />
                        </div>

                        <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-transparent bg-clip-text">
                            Generate Coding Challenges
                        </h1>
                        <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-lg">
                            Choose your preferred language, topic and difficulty. AI will craft unique problems for you to solve right now.
                        </p>

                        <div className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] p-8 rounded-3xl backdrop-blur-sm shadow-2xl mb-12">
                            <div className="flex flex-col gap-6">

                                {/* Language Selection */}
                                <div className="text-left">
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block flex items-center gap-2">
                                        <Code size={14} /> Programming Language
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {languages.map(l => (
                                            <button
                                                key={l.id}
                                                onClick={() => setLanguage(l.id)}
                                                className={`py-3 px-2 rounded-xl border font-bold transition-all ${language === l.id
                                                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                                                    }`}
                                            >
                                                {l.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Topic Input */}
                                <div className="text-left">
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Topic / Concept</label>
                                    <input
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g. Recursion, Dynamic Programming, Arrays..."
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-4 text-lg focus:outline-none focus:border-cyan-500 transition-colors"
                                    />
                                </div>

                                {/* Difficulty Level */}
                                <div className="text-left">
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Difficulty Level</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['easy', 'medium', 'hard'].map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={() => setDifficulty(lvl)}
                                                className={`py-3 rounded-xl border font-bold capitalize transition-all ${difficulty === lvl
                                                    ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                                                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                                                    }`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Count */}
                                <div className="text-left">
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block flex items-center gap-2">
                                        <Hash size={14} /> Number of Questions
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {countOptions.map(num => (
                                            <button
                                                key={num}
                                                onClick={() => setQuestionCount(num)}
                                                className={`w-14 h-12 rounded-xl border font-bold text-lg transition-all ${questionCount === num
                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
                                                    }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !topic}
                                    className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg"
                                >
                                    {isGenerating ? (
                                        <> <Cpu className="animate-spin" /> Generating {questionCount} Challenge{questionCount > 1 ? 's' : ''}... </>
                                    ) : (
                                        <> <Send size={20} /> Generate Sandbox </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'history' && (
                    <div className="w-full h-full flex flex-col justify-start pt-8 pb-12">
                        <div className="text-left mb-8">
                            <h1 className="text-3xl font-black mb-2 text-[var(--text-primary)]">Past Architectures</h1>
                            <p className="text-[var(--text-secondary)]">Resume any of your generated challenge servers.</p>
                        </div>

                        {loadingHistory ? (
                            <div className="flex justify-center p-10"><Cpu className="animate-spin text-cyan-500" size={30} /></div>
                        ) : history.length === 0 ? (
                            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-10 rounded-2xl">
                                <History className="mx-auto mb-4 text-[var(--text-muted)] border opacity-50" size={40} />
                                <h3 className="text-xl font-bold">No History yet</h3>
                                <p className="text-[var(--text-secondary)]">Generate a new session to see it here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 w-full text-left">
                                {history.map(session => {
                                    const solvedCount = session.challenges.filter(c => c.status === 'solved').length;
                                    const totalCount = session.challenges.length;
                                    return (
                                        <div key={session._id} className="bg-[var(--glass-bg)] border border-[var(--border-color)] p-6 rounded-2xl hover:border-cyan-500 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
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
                                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1 break-all">{session.topic}</h3>
                                                <p className="text-sm text-[var(--text-secondary)]">
                                                    {new Date(session.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-6 w-full sm:w-auto mt-4 sm:mt-0">
                                                <div className="text-center">
                                                    <div className="text-sm text-[var(--text-muted)]">Progress</div>
                                                    <div className="text-lg font-bold">
                                                        <span className={solvedCount === totalCount ? 'text-emerald-500' : 'text-cyan-500'}>{solvedCount}</span> / {totalCount}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => resumeSession(session)}
                                                    className="flex-1 sm:flex-none bg-cyan-500 hover:bg-cyan-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/25"
                                                >
                                                    {solvedCount === totalCount ? 'Review Session' : 'Resume Session'}
                                                </button>
                                            </div>
                                        </div>
                                    )
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
