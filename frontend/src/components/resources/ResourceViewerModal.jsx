import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X, Sparkles, Send, FileText, Video, HelpCircle, BookOpen, Layers,
    Zap, CheckCircle2, Copy, Download, Loader2, ArrowLeft, Bot, MessageSquare, Flame
} from 'lucide-react';
import resourceApi from '../../services/resourceApi';
import { PYTHON_MODULES } from '../../data/pythonModulesData';

export default function ResourceViewerModal({ resource, onClose, onSaveToggle, isSaved }) {
    const navigate = useNavigate();

    // Find matching Python module from data
    const matchedModule = PYTHON_MODULES.find(m =>
        m.id === resource?.id ||
        (resource?.unit && m.unit.toLowerCase().includes(resource.unit.toLowerCase())) ||
        (resource?.title && m.title.toLowerCase().includes(resource.title.toLowerCase())) ||
        (resource?.name && m.title.toLowerCase().includes(resource.name.toLowerCase()))
    ) || PYTHON_MODULES[0];

    // Mode: 'full' (Detailed Notes) or 'short' (Short Revision Notes)
    const [viewMode, setViewMode] = useState('full');

    // Right AI Tools Panel State
    const [activeAiTool, setActiveAiTool] = useState('ask-ai'); // 'ask-ai', 'summary', 'notes', 'flashcards', 'explain'
    const [aiQuestion, setAiQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', content: `Hello! I am your AI Study Assistant for "${matchedModule.title}". Ask me anything or click a tool above to generate notes, flashcards, or explanations!` }
    ]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResultText, setAiResultText] = useState('');

    const isVideo = (resource?.type || resource?.resourceType || '').toUpperCase() === 'VIDEO';

    // Open Module Quiz Action
    const handleOpenQuiz = () => {
        navigate('/quiz', {
            state: {
                subject: 'Python Programming',
                module: matchedModule.unit,
                title: matchedModule.title
            }
        });
        if (onClose) onClose();
    };

    // Handle Grounded Q&A Chat
    const handleAskAi = async () => {
        if (!aiQuestion.trim() || isAiLoading) return;
        const qText = aiQuestion.trim();
        setChatHistory(prev => [...prev, { role: 'user', content: qText }]);
        setAiQuestion('');
        setIsAiLoading(true);

        try {
            const data = await resourceApi.askAIAboutResource({
                resourceId: matchedModule.id,
                resourceTitle: matchedModule.title,
                resourceContent: matchedModule.fullNotes,
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
                    topic: matchedModule.title,
                    content: matchedModule.fullNotes
                });
                if (data && data.result) setAiResultText(data.result);
            } else if (toolName === 'explain') {
                const data = await resourceApi.explainConcept({
                    topic: matchedModule.title
                });
                if (data && data.result) setAiResultText(data.result);
            } else if (toolName === 'flashcards') {
                const data = await resourceApi.generateFlashcards({
                    topic: matchedModule.title,
                    count: 8
                });
                if (data && data.flashcards) {
                    setAiResultText(JSON.stringify(data.flashcards, null, 2));
                }
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
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400">
                                {matchedModule.courseCode} · {matchedModule.unit}
                            </span>
                            <h2 className="text-base font-bold text-white leading-tight">
                                {matchedModule.title}
                            </h2>
                        </div>
                    </div>

                    {/* Header Controls & Short Notes / Quiz Buttons */}
                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle: Full Notes vs Short Notes */}
                        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
                            <button
                                onClick={() => setViewMode('full')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                    viewMode === 'full'
                                        ? 'bg-slate-800 text-white shadow-xs'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                📖 Detailed Notes
                            </button>
                            <button
                                onClick={() => setViewMode('short')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                    viewMode === 'short'
                                        ? 'bg-[#ff5733] text-white shadow-xs'
                                        : 'text-orange-400 hover:text-orange-300'
                                }`}
                            >
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                <span>⚡ Short Notes</span>
                            </button>
                        </div>

                        {/* Direct Module Quiz Launcher */}
                        <button
                            onClick={handleOpenQuiz}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition"
                        >
                            <HelpCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Module Quiz</span>
                        </button>

                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Main Split Body: Left Viewer (60%) + Right AI Tools (40%) */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
                    {/* Left Stage (Document Notes Reader) */}
                    <div className="lg:col-span-7 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full overflow-y-auto text-slate-200 text-xs font-sans leading-relaxed shadow-inner">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-slate-400">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">
                                        {viewMode === 'short' ? '⚡ Short Revision Notes' : '📄 Full Course Notes'}
                                    </span>
                                    {viewMode === 'short' && (
                                        <span className="text-[10px] bg-orange-950 text-orange-400 border border-orange-800 px-2 py-0.5 rounded font-extrabold">
                                            Quick Exam Revision
                                        </span>
                                    )}
                                </div>
                                <span>{matchedModule.unit} · {matchedModule.readTime}</span>
                            </div>

                            {/* Rendered Notes Content */}
                            <div className="whitespace-pre-wrap font-sans text-xs md:text-sm text-slate-200 leading-relaxed space-y-2">
                                {viewMode === 'short' ? matchedModule.shortNotes : matchedModule.fullNotes}
                            </div>

                            {/* Quiz Prompt Callout Banner */}
                            <div className="bg-gradient-to-r from-orange-950/60 to-purple-950/60 border border-orange-800/60 rounded-2xl p-4 mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div>
                                    <h4 className="font-extrabold text-orange-400 text-sm">🎉 Completed {matchedModule.unit}?</h4>
                                    <p className="text-xs text-slate-300">Test your mastery of {matchedModule.title} in the Quiz feature!</p>
                                </div>
                                <button
                                    onClick={handleOpenQuiz}
                                    className="bg-[#ff5733] hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition shrink-0 flex items-center gap-1.5"
                                >
                                    <Zap className="w-4 h-4 fill-white" />
                                    <span>Start Module Quiz →</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: ✨ Contextual AI Study Tools (40%) */}
                    <div className="lg:col-span-5 bg-slate-900 flex flex-col justify-between overflow-hidden">
                        {/* Contextual AI Tool Buttons */}
                        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-2 overflow-x-auto shrink-0">
                            <button
                                onClick={() => setActiveAiTool('ask-ai')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                                    activeAiTool === 'ask-ai' ? 'bg-orange-600 text-white shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-white'
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
                                                        ? 'bg-[#ff5733] text-white ml-8 font-medium'
                                                        : 'bg-slate-950 text-slate-200 border border-slate-800 mr-4'
                                                }`}
                                            >
                                                {m.role === 'ai' && (
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400 mb-1">
                                                        <Sparkles className="w-3 h-3" /> StudySpirit AI Assistant
                                                    </div>
                                                )}
                                                {m.content}
                                            </div>
                                        ))}
                                        {isAiLoading && (
                                            <div className="flex items-center gap-2 text-xs text-orange-400 font-medium p-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Reading module notes & generating answer...</span>
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
                                                placeholder="Ask anything about Python Module 1, 2, or 3..."
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ff5733]"
                                            />
                                            <button
                                                onClick={handleAskAi}
                                                disabled={isAiLoading || !aiQuestion.trim()}
                                                className="bg-[#ff5733] hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs p-2.5 rounded-xl transition"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Option B: AI Tool Generated Output */}
                            {activeAiTool !== 'ask-ai' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
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
                                            <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
                                            <p className="text-xs text-slate-400 font-medium">Generating {activeAiTool} from module notes...</p>
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
