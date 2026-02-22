import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import {
    ArrowLeft, Send, Sparkles, Terminal, Cpu, Hash
} from "lucide-react";

export default function CodeSpirit() {
    const navigate = useNavigate();

    // State for Generation
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("medium");
    const [questionCount, setQuestionCount] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);

    // Generate Questions Handler
    const handleGenerate = async () => {
        if (!topic.trim()) return alert("Please enter a topic!");

        setIsGenerating(true);

        try {
            const res = await fetch(`${API_BASE}/codespirit/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, difficulty, count: questionCount })
            });

            const data = await res.json();

            if (data.success && data.challenges && data.challenges.length > 0) {
                // Navigate to the Code Editor with ALL challenges
                navigate('/code-editor', {
                    state: {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-[var(--text-primary)] font-sans">
            {/* Minimal Navbar */}
            <nav className="border-b border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-xl font-bold flex items-center gap-2">
                        <Terminal className="text-cyan-" />
                        CodeSpirit <span className="opacity-50 font-normal">| Daily Practice</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="h-[calc(100vh-73px)] flex flex-col items-center justify-center p-6 animate-fade-in text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-cyan-/20 rounded-3xl flex items-center justify-center mb-8 ring-4 ring-violet-500/10">
                    <Sparkles size={40} className="text-cyan-" />
                </div>

                <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Generate Coding Challenges
                </h1>
                <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-lg">
                    Choose a topic, difficulty, and how many questions you want. Solve them one by one in the Code Editor.
                </p>

                <div className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] p-8 rounded-3xl backdrop-blur-sm shadow-2xl">
                    <div className="flex flex-col gap-5">
                        {/* Topic Input */}
                        <div className="text-left">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Topic / Concept</label>
                            <input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Recursion, Dynamic Programming, Arrays..."
                                className="w-full bg-[var(--bg-secondary)]lack/40 border border-[var(--border-color)] rounded-xl px-4 py-4 text-lg focus:outline-none focus:border-cyan-500 transition-colors"
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
                                            ? 'bg-cyan- border-cyan-500 text-[var(--text-primary)] shadow-lg shadow-violet-500/25'
                                            : 'bg-[var(--bg-secondary)]lack/20 border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5'
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
                                            ? 'bg-emerald-500 border-emerald-500 text-[var(--text-primary)] shadow-lg shadow-emerald-500/25'
                                            : 'bg-[var(--bg-secondary)]lack/20 border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-[var(--text-primary)] mt-2">Select how many coding questions to generate</p>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic}
                            className="mt-4 w-full bg-gradient-to-r from-cyan- to-indigo-600 hover:from-cyan- hover:to-indigo-500 text-[var(--text-primary)] font-bold py-4 rounded-xl shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg"
                        >
                            {isGenerating ? (
                                <> <Cpu className="animate-spin" /> Generating {questionCount} Challenge{questionCount > 1 ? 's' : ''}... </>
                            ) : (
                                <> <Send size={20} /> Generate {questionCount} Question{questionCount > 1 ? 's' : ''} </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out; }
            `}</style>
        </div>
    );
}
