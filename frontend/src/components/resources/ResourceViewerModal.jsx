import React, { useState } from 'react';
import {
    X, Sparkles, Send, FileText, Video, HelpCircle, BookOpen, Layers,
    Zap, CheckCircle2, Copy, Download, Loader2, ArrowLeft, Bot, MessageSquare
} from 'lucide-react';
import resourceApi from '../../services/resourceApi';

export default function ResourceViewerModal({ resource, onClose, onSaveToggle, isSaved }) {
    const [activeAiTool, setActiveAiTool] = useState('ask-ai'); // 'ask-ai', 'summary', 'notes', 'flashcards', 'explain', 'quiz'
    const [aiQuestion, setAiQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', content: `Hello! I am your AI Study Assistant for "${resource?.title || resource?.name || 'this resource'}". Ask me anything or click a tool above to generate notes, flashcards, or a summary!` }
    ]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResultText, setAiResultText] = useState('');

    const isVideo = (resource?.type || resource?.resourceType || '').toUpperCase() === 'VIDEO';

    // Handle Grounded Q&A Chat ("Ask AI About This Resource")
    const handleAskAi = async () => {
        if (!aiQuestion.trim() || isAiLoading) return;
        const qText = aiQuestion.trim();
        setChatHistory(prev => [...prev, { role: 'user', content: qText }]);
        setAiQuestion('');
        setIsAiLoading(true);

        try {
            const data = await resourceApi.askAIAboutResource({
                resourceId: resource?.id,
                resourceTitle: resource?.title || resource?.name,
                resourceContent: resource?.content || resource?.description,
                question: qText
            });

            if (data && data.answer) {
                setChatHistory(prev => [...prev, { role: 'ai', content: data.answer }]);
            }
        } catch (err) {
            console.error('Ask AI error:', err);
            setChatHistory(prev => [...prev, { role: 'ai', content: 'Connection error answering your question. Please try again.' }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Handle AI Summarize / Notes / Explainer Tool Triggers
    const handleTriggerAiTool = async (toolName) => {
        setActiveAiTool(toolName);
        setIsAiLoading(true);
        setAiResultText('');

        try {
            if (toolName === 'summary' || toolName === 'notes') {
                const data = await resourceApi.generateNotes({
                    topic: resource?.title || 'Resource Summary',
                    content: resource?.content || resource?.description || 'Database Normalization 1NF 2NF 3NF BCNF'
                });
                if (data && data.result) setAiResultText(data.result);
            } else if (toolName === 'explain') {
                const data = await resourceApi.explainConcept({
                    topic: resource?.title || 'Normalization'
                });
                if (data && data.result) setAiResultText(data.result);
            } else if (toolName === 'flashcards') {
                const data = await resourceApi.generateFlashcards({
                    topic: resource?.title || 'Database Concepts',
                    count: 8
                });
                if (data && data.flashcards) {
                    setAiResultText(JSON.stringify(data.flashcards, null, 2));
                }
            } else if (toolName === 'quiz') {
                setAiResultText(`### Practice Quiz for ${resource?.title || 'Resource'}\n\n1. **What is the main goal of Normalization?**\n- A) Increase storage space\n- B) Eliminate data redundancy and update anomalies ✓\n- C) Speed up unindexed reads\n- D) Replace primary keys\n\n2. **Which normal form requires removing transitive functional dependencies?**\n- A) 1NF\n- B) 2NF\n- C) 3NF ✓\n- D) BCNF`);
            }
        } catch (err) {
            console.error('Tool error:', err);
            setAiResultText('Failed to generate AI response. Please try again.');
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 md:p-6 overflow-hidden">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <header className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                                {resource?.courseCode || 'CSE101'} · {resource?.unit || 'Unit 3'}
                            </span>
                            <h2 className="text-base font-bold text-white leading-tight">
                                {resource?.title || resource?.name || 'Resource Document'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {resource?.verificationBadge && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {resource.verificationBadge}
                            </span>
                        )}

                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Main Split Body: Left Viewer (60%) + Right AI Tools (40%) */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
                    {/* Left Stage (Document Preview / Video Player) */}
                    <div className="lg:col-span-7 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
                        {isVideo ? (
                            <div className="flex flex-col gap-4 h-full">
                                {/* Video Player Frame */}
                                <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 relative flex items-center justify-center shadow-2xl">
                                    <video
                                        controls
                                        className="w-full h-full object-cover"
                                        poster={resource?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                                    >
                                        <source src={resource?.fileUrl || resource?.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                                    <h3 className="font-bold text-white">Lecture Transcript & Highlights</h3>
                                    <p className="text-slate-300 leading-relaxed">
                                        "Welcome back to Database Systems. In today's lecture on Normalization, we explore 1NF, 2NF, 3NF and Boyce-Codd Normal Form (BCNF). Eliminating data redundancy ensures query efficiency..."
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full overflow-y-auto text-slate-200 text-xs font-mono leading-relaxed shadow-inner">
                                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-slate-400">
                                    <span className="font-bold text-white">📄 {resource?.title || 'Document Viewer'}</span>
                                    <span>Page 1 of {resource?.pageCount || 24}</span>
                                </div>

                                <h2 className="text-base font-bold text-cyan-400 mb-3">Unit 3: Database Normalization (1NF to BCNF)</h2>
                                <p className="mb-4">
                                    Normalization is a systematic approach of decomposing tables to eliminate data redundancy and insertion, update, and deletion anomalies.
                                </p>
                                <h3 className="text-sm font-bold text-white mb-2">1. First Normal Form (1NF)</h3>
                                <p className="mb-4">
                                    A table is in 1NF if every column contains atomic (indivisible) values and each record is unique.
                                </p>
                                <h3 className="text-sm font-bold text-white mb-2">2. Second Normal Form (2NF)</h3>
                                <p className="mb-4">
                                    A table is in 2NF if it is in 1NF and all non-key attributes are fully functionally dependent on the primary key.
                                </p>
                                <h3 className="text-sm font-bold text-white mb-2">3. Third Normal Form (3NF)</h3>
                                <p className="mb-4">
                                    A table is in 3NF if it is in 2NF and no non-key attribute is transitively dependent on the primary key.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: ✨ Contextual AI Study Tools (40%) */}
                    <div className="lg:col-span-5 bg-slate-900 flex flex-col justify-between overflow-hidden">
                        {/* Contextual AI Tool Buttons */}
                        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-2 overflow-x-auto shrink-0">
                            <button
                                onClick={() => setActiveAiTool('ask-ai')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                    activeAiTool === 'ask-ai' ? 'bg-cyan-600 text-white shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                            >
                                <Bot className="w-3.5 h-3.5" />
                                <span>Ask AI</span>
                            </button>

                            <button
                                onClick={() => handleTriggerAiTool('summary')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                    activeAiTool === 'summary' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Summarize</span>
                            </button>

                            <button
                                onClick={() => handleTriggerAiTool('notes')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                    activeAiTool === 'notes' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                <span>AI Notes</span>
                            </button>

                            <button
                                onClick={() => handleTriggerAiTool('flashcards')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                    activeAiTool === 'flashcards' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Flashcards</span>
                            </button>

                            <button
                                onClick={() => handleTriggerAiTool('explain')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                    activeAiTool === 'explain' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Explain</span>
                            </button>
                        </div>

                        {/* Tool Display Workspace */}
                        <div className="flex-1 p-4 overflow-y-auto">
                            {/* Option A: Ask AI Chat Mode */}
                            {activeAiTool === 'ask-ai' && (
                                <div className="flex flex-col h-full justify-between space-y-4">
                                    <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
                                        {chatHistory.map((m, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                                                    m.role === 'user'
                                                        ? 'bg-cyan-600 text-white ml-8 font-medium'
                                                        : 'bg-slate-950 text-slate-200 border border-slate-800 mr-4'
                                                }`}
                                            >
                                                {m.role === 'ai' && (
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 mb-1">
                                                        <Sparkles className="w-3 h-3" /> StudySpirit AI Assistant
                                                    </div>
                                                )}
                                                {m.content}
                                            </div>
                                        ))}
                                        {isAiLoading && (
                                            <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium p-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Reading resource context & generating answer...</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Q&A Input Prompt */}
                                    <div className="pt-3 border-t border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={aiQuestion}
                                                onChange={(e) => setAiQuestion(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                                                placeholder="Ask anything about this resource..."
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                                            />
                                            <button
                                                onClick={handleAskAi}
                                                disabled={isAiLoading || !aiQuestion.trim()}
                                                className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs p-2.5 rounded-xl transition"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Option B: AI Tool Generated Output (Summary / Notes / Flashcards / Explainer) */}
                            {activeAiTool !== 'ask-ai' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                            {activeAiTool.toUpperCase()} GENERATOR
                                        </span>
                                        {aiResultText && (
                                            <button
                                                onClick={() => navigator.clipboard.writeText(aiResultText)}
                                                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
                                            >
                                                <Copy className="w-3.5 h-3.5" /> Copy
                                            </button>
                                        )}
                                    </div>

                                    {isAiLoading ? (
                                        <div className="py-12 text-center space-y-2">
                                            <Loader2 className="w-6 h-6 animate-spin text-purple-500 mx-auto" />
                                            <p className="text-xs text-slate-400 font-medium">Generating {activeAiTool} from resource content...</p>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 leading-relaxed max-h-[55vh] overflow-y-auto whitespace-pre-wrap">
                                            {aiResultText || 'Click a tool above to generate AI notes, flashcards, or a summary.'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
