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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans">
            {/* Minimal Navbar */}
            <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-xl font-bold flex items-center gap-2">
                        <Terminal className="text-violet-500" />
                        CodeSpirit <span className="opacity-50 font-normal">| Daily Practice</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="h-[calc(100vh-73px)] flex flex-col items-center justify-center p-6 animate-fade-in text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-violet-500/20 rounded-3xl flex items-center justify-center mb-8 ring-4 ring-violet-500/10">
                    <Sparkles size={40} className="text-violet-400" />
                </div>

                <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Generate Coding Challenges
                </h1>
                <p className="text-slate-400 text-lg mb-10 max-w-lg">
                    Choose a topic, difficulty, and how many questions you want. Solve them one by one in the Code Editor.
                </p>

                <div className="w-full bg-slate-900/50 border border-white/10 p-8 rounded-3xl backdrop-blur-sm shadow-2xl">
                    <div className="flex flex-col gap-5">
                        {/* Topic Input */}
                        <div className="text-left">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Topic / Concept</label>
                            <input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Recursion, Dynamic Programming, Arrays..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-lg focus:outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>

                        {/* Difficulty Level */}
                        <div className="text-left">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Difficulty Level</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['easy', 'medium', 'hard'].map(lvl => (
                                    <button
                                        key={lvl}
                                        onClick={() => setDifficulty(lvl)}
                                        className={`py-3 rounded-xl border font-bold capitalize transition-all ${difficulty === lvl
                                            ? 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-500/25'
                                            : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'
                                            }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question Count */}
                        <div className="text-left">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                                <Hash size={14} /> Number of Questions
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {countOptions.map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setQuestionCount(num)}
                                        className={`w-14 h-12 rounded-xl border font-bold text-lg transition-all ${questionCount === num
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                            : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-600 mt-2">Select how many coding questions to generate</p>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic}
                            className="mt-4 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg"
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
