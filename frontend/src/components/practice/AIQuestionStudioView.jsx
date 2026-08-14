import React, { useState } from 'react';
import { Sparkles, FileText, Image, Code, CheckCircle, AlertTriangle, Play, Settings } from 'lucide-react';
import { API_BASE } from '../../config';

export default function AIQuestionStudioView({ onStartSession }) {
    const [sourceType, setSourceType] = useState('topic'); // 'topic' | 'text' | 'notes'
    const [topicInput, setTopicInput] = useState('Python OOP & Inheritance');
    const [textInput, setTextInput] = useState('');
    const [cognitiveLevel, setCognitiveLevel] = useState('Understand');
    const [difficulty, setDifficulty] = useState('medium');
    const [questionCount, setQuestionCount] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResult, setGeneratedResult] = useState(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch(`${API_BASE}/practice/ai-studio/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    sourceType,
                    sourceContent: sourceType === 'text' ? textInput : topicInput,
                    topic: topicInput,
                    cognitiveLevel,
                    difficulty,
                    count: questionCount
                })
            });
            const data = await res.json();
            if (data.success) {
                setGeneratedResult(data);
            } else {
                alert("Generation failed: " + data.message);
            }
        } catch (e) {
            console.error("AI Studio Error:", e);
            alert("Error connecting to AI Question Studio.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800">AI Question Studio</h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Generate practice material from Topic, Notes, Text or Code with automated pedagogical validation.
                        </p>
                    </div>
                </div>
            </div>

            {/* Generator Form Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                {/* Source Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Material Source</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'topic', label: 'Topic / Course' },
                            { id: 'text', label: 'Pasted Notes / Text' },
                            { id: 'notes', label: 'PDF / Image Material' }
                        ].map((src) => (
                            <button
                                key={src.id}
                                onClick={() => setSourceType(src.id)}
                                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                                    sourceType === src.id
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                {src.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Fields */}
                {sourceType === 'topic' ? (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Topic or Subject Name</label>
                        <input 
                            type="text"
                            value={topicInput}
                            onChange={(e) => setTopicInput(e.target.value)}
                            placeholder="e.g. Python OOP, SQL Joins, Operating Systems Deadlock..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                ) : (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Pasted Notes / Material Text</label>
                        <textarea 
                            rows={4}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Paste textbook excerpt, lecture notes, or code here..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                )}

                {/* Controls: Difficulty & Cognitive Level */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Difficulty</label>
                        <select 
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        >
                            <option value="easy">Easy (Recall & Definitions)</option>
                            <option value="medium">Medium (Comprehension & Application)</option>
                            <option value="hard">Hard (Analysis & Edge Cases)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Cognitive Bloom Level</label>
                        <select 
                            value={cognitiveLevel}
                            onChange={(e) => setCognitiveLevel(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        >
                            <option value="Recall">Recall (Basic facts)</option>
                            <option value="Understand">Understand (Comprehension)</option>
                            <option value="Apply">Apply (Problem solving)</option>
                            <option value="Analyze">Analyze (Complex trade-offs)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Questions Count</label>
                        <select 
                            value={questionCount}
                            onChange={(e) => setQuestionCount(Number(e.target.value))}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                        >
                            <option value={5}>5 Questions</option>
                            <option value={10}>10 Questions</option>
                            <option value={20}>20 Questions</option>
                        </select>
                    </div>
                </div>

                <button 
                    disabled={isGenerating}
                    onClick={handleGenerate}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>{isGenerating ? 'AI is Generating & Validating Questions...' : 'Generate Questions with AI Studio'}</span>
                </button>
            </div>

            {/* AI Validation Check Results */}
            {generatedResult && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div>
                            <h3 className="text-sm font-black text-slate-800">
                                {generatedResult.summary.totalGenerated} Questions Generated
                            </h3>
                            <p className="text-xs text-slate-500">Pedagogical AI Validation Status:</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-lg flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {generatedResult.summary.readyCount} Ready
                            </span>
                            {generatedResult.summary.reviewCount > 0 && (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 font-extrabold text-xs rounded-lg flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {generatedResult.summary.reviewCount} Need Review
                                </span>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={() => onStartSession({ mode: 'ai_studio', questions: generatedResult.questions })}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Start Practice Session with Generated Questions
                    </button>
                </div>
            )}
        </div>
    );
}
