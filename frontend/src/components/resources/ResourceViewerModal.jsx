import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X, Sparkles, Send, BookOpen, Zap, Copy, Loader2, ArrowLeft, Bot, MessageSquare, Flame, CheckCircle2, Award
} from 'lucide-react';
import resourceApi from '../../services/resourceApi';
import { PYTHON_MODULES } from '../../data/pythonModulesData';
import { NOSQL_MONGO_MODULES, NOSQL_COURSE_INFO } from '../../data/nosqlMongoModulesData';
import { NOSQL_MONGO_ASSESSMENT_QUESTIONS } from '../../data/nosqlMongoQuestions';

import RichNotesRenderer from './RichNotesRenderer';
import MongoNotesRenderer from './MongoNotesRenderer';
import CourseCertificateModal from './CourseCertificateModal';

export default function ResourceViewerModal({ resource, onClose }) {
    const navigate = useNavigate();
    const [showCertificateModal, setShowCertificateModal] = useState(false);

    const isMongo = resource?.id?.startsWith('mongo-') ||
        resource?.courseCode === 'INT252' ||
        (resource?.unit && resource.unit.toLowerCase().includes('unit')) ||
        (resource?.title && resource.title.toLowerCase().includes('nosql')) ||
        (resource?.title && resource.title.toLowerCase().includes('mongodb'));

    // Find matching module from MongoDB or Python data
    const matchedModule = isMongo
        ? (NOSQL_MONGO_MODULES.find(m =>
            m.id === resource?.id ||
            (resource?.unit && m.unit.toLowerCase().includes(resource.unit.toLowerCase())) ||
            (resource?.title && m.title.toLowerCase().includes(resource.title.toLowerCase()))
        ) || NOSQL_MONGO_MODULES[0])
        : (PYTHON_MODULES.find(m =>
            m.id === resource?.id ||
            (resource?.unit && m.unit.toLowerCase().includes(resource.unit.toLowerCase())) ||
            (resource?.title && m.title.toLowerCase().includes(resource.title.toLowerCase())) ||
            (resource?.name && m.title.toLowerCase().includes(resource.name.toLowerCase()))
        ) || PYTHON_MODULES[0]);

    // AI Tool View: 'notes' (Full Notes), 'summary' (Short Notes), 'ask-ai' (AI Chat), 'flashcards' (Flashcards)
    const [activeAiTool, setActiveAiTool] = useState('notes');

    // Ask AI Chat State
    const [aiQuestion, setAiQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', content: `Hello! I am your StudySpirit AI Academic Tutor for "${matchedModule.title}". Ask me any question about these notes!` }
    ]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [flashcardsList, setFlashcardsList] = useState([]);

    // Open Module Quiz Action
    const handleOpenQuiz = () => {
        if (isMongo) {
            navigate('/quiz', {
                state: {
                    subject: 'Intelligent NoSQL Databases with MongoDB',
                    course: 'INT252',
                    module: matchedModule.unit,
                    title: matchedModule.title,
                    questions: NOSQL_MONGO_ASSESSMENT_QUESTIONS
                }
            });
        } else {
            navigate('/quiz', {
                state: {
                    subject: 'Python Programming',
                    module: matchedModule.unit,
                    title: matchedModule.title
                }
            });
        }
        if (onClose) onClose();
    };

    // Handle Grounded Q&A Chat connected to backend Groq API (.env GROQ_API_KEY_RESOURCE)
    const handleAskAi = async () => {
        if (!aiQuestion.trim() || isAiLoading) return;
        const qText = aiQuestion.trim();
        setChatHistory(prev => [...prev, { role: 'user', content: qText }]);
        setAiQuestion('');
        setIsAiLoading(true);

        try {
            const data = await resourceApi.askAIAboutResource({
                resourceTitle: matchedModule.title,
                resourceContent: matchedModule.fullNotes,
                question: qText
            });

            if (data && (data.answer || data.result)) {
                setChatHistory(prev => [...prev, { role: 'ai', content: data.answer || data.result }]);
            } else {
                setChatHistory(prev => [...prev, { role: 'ai', content: 'Could not generate an answer right now. Please try again.' }]);
            }
        } catch (err) {
            console.error('Ask AI error:', err);
            setChatHistory(prev => [...prev, { role: 'ai', content: 'Connection error connecting to StudySpirit AI. Please verify network or API keys.' }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Handle AI Flashcards Trigger
    const handleGenerateFlashcards = async () => {
        setActiveAiTool('flashcards');
        setIsAiLoading(true);
        try {
            const data = await resourceApi.generateFlashcards({
                topic: matchedModule.title,
                count: 6
            });
            if (data && data.flashcards) {
                setFlashcardsList(data.flashcards);
            }
        } catch (err) {
            console.error('Flashcards error:', err);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 md:p-4 overflow-hidden">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-[96vw] h-[95vh] flex flex-col shadow-2xl overflow-hidden">
                
                {/* Fullscreen Header */}
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

                    {/* Header Controls & Action Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Course Certificate Button */}
                        <button
                            onClick={() => setShowCertificateModal(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition"
                        >
                            <Award className="w-4 h-4" />
                            <span className="hidden sm:inline">16h Certificate</span>
                        </button>

                        {/* Direct Module Quiz Button */}
                        <button
                            onClick={handleOpenQuiz}
                            className="bg-[#ff5733] hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition"
                        >
                            <Zap className="w-4 h-4 fill-white" />
                            <span>Module Quiz</span>
                        </button>

                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Sub-Header AI Navigation Toolbar */}
                <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4 overflow-x-auto shrink-0">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveAiTool('notes')}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                                activeAiTool === 'notes'
                                    ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                                    : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                        >
                            <BookOpen className="w-4 h-4 text-cyan-400" />
                            <span>Full Notes</span>
                        </button>

                        <button
                            onClick={() => setActiveAiTool('summary')}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                                activeAiTool === 'summary'
                                    ? 'bg-[#ff5733] text-white shadow-xs'
                                    : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                        >
                            <Zap className="w-4 h-4 fill-current text-amber-300" />
                            <span>⚡ Summarize / Short Notes</span>
                        </button>

                        <button
                            onClick={() => setActiveAiTool('ask-ai')}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                                activeAiTool === 'ask-ai'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                        >
                            <Bot className="w-4 h-4 text-purple-300" />
                            <span>🤖 Ask AI</span>
                        </button>

                        <button
                            onClick={handleGenerateFlashcards}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                                activeAiTool === 'flashcards'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-slate-900 text-slate-400 hover:text-white'
                            }`}
                        >
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>🎴 Flashcards</span>
                        </button>
                    </div>

                    <span className="text-xs text-slate-400 font-semibold hidden md:inline">
                        {matchedModule.readTime} · 100% Fullscreen View
                    </span>
                </div>

                {/* Main Fullscreen Stage */}
                <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto min-h-0">
                    
                    {/* VIEW 1: Full Course Notes (Rich Modern Interactive Renderer) */}
                    {activeAiTool === 'notes' && (
                        isMongo ? (
                            <MongoNotesRenderer
                                moduleData={matchedModule}
                                onStartQuiz={handleOpenQuiz}
                                onOpenCertificate={() => setShowCertificateModal(true)}
                            />
                        ) : (
                            <RichNotesRenderer moduleData={matchedModule} onStartQuiz={handleOpenQuiz} />
                        )
                    )}

                    {/* VIEW 2: Summarize / Short Notes (100% Width) */}
                    {activeAiTool === 'summary' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-slate-200 text-xs md:text-sm font-sans leading-relaxed shadow-inner max-w-5xl mx-auto space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-orange-400 fill-orange-400" />
                                    <span className="font-extrabold text-white text-base">⚡ Short Revision Notes & Module Summary</span>
                                </div>
                                <span className="text-xs bg-orange-950 text-orange-400 border border-orange-800 px-3 py-1 rounded-full font-bold">
                                    Exam Cram Kit
                                </span>
                            </div>

                            <div className="whitespace-pre-wrap font-sans text-xs md:text-sm text-slate-200 leading-relaxed space-y-3 bg-slate-950/70 p-6 rounded-2xl border border-slate-800">
                                {matchedModule.shortNotes}
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={handleOpenQuiz}
                                    className="bg-[#ff5733] hover:bg-orange-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2"
                                >
                                    <Zap className="w-4 h-4 fill-white" />
                                    <span>Take Module Quiz →</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* VIEW 3: Ask AI Tutor (100% Width connected to backend Groq API) */}
                    {activeAiTool === 'ask-ai' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-4xl mx-auto flex flex-col h-[75vh] justify-between shadow-2xl">
                            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                                    <Bot className="w-5 h-5" />
                                    <span>Ask StudySpirit AI Tutor</span>
                                </div>
                                <span className="text-[11px] text-slate-400">Connected to GROQ AI Engine</span>
                            </div>

                            {/* Chat Log */}
                            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
                                {chatHistory.map((m, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                                            m.role === 'user'
                                                ? 'bg-[#ff5733] text-white ml-12 font-medium shadow-sm'
                                                : 'bg-slate-950 text-slate-200 border border-slate-800 mr-12'
                                        }`}
                                    >
                                        {m.role === 'ai' && (
                                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-400 mb-1.5">
                                                <Sparkles className="w-3.5 h-3.5" /> StudySpirit AI Tutor
                                            </div>
                                        )}
                                        <div className="whitespace-pre-wrap">{m.content}</div>
                                    </div>
                                ))}
                                {isAiLoading && (
                                    <div className="flex items-center gap-2 text-xs text-orange-400 font-medium p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Analyzing module notes & formulating AI answer...</span>
                                    </div>
                                )}
                            </div>

                            {/* Q&A Input Box */}
                            <div className="pt-3 border-t border-slate-800">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={aiQuestion}
                                        onChange={(e) => setAiQuestion(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                                        placeholder={`Ask any doubt about ${matchedModule.title}...`}
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-[#ff5733]"
                                    />
                                    <button
                                        onClick={handleAskAi}
                                        disabled={isAiLoading || !aiQuestion.trim()}
                                        className="bg-[#ff5733] hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition flex items-center gap-1.5"
                                    >
                                        <span>Ask</span>
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEW 4: Flashcards */}
                    {activeAiTool === 'flashcards' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-4xl mx-auto space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                    <span>AI Revision Flashcards ({matchedModule.unit})</span>
                                </h3>
                                <button
                                    onClick={handleGenerateFlashcards}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-bold"
                                >
                                    Regenerate Cards
                                </button>
                            </div>

                            {isAiLoading ? (
                                <div className="py-16 text-center space-y-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                                    <p className="text-xs text-slate-400">Generating flashcards from module notes...</p>
                                </div>
                            ) : flashcardsList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {flashcardsList.map((card, i) => (
                                        <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
                                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                                                Card {i + 1}
                                            </span>
                                            <h4 className="font-bold text-white text-xs leading-snug">{card.front || card.question}</h4>
                                            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-850">
                                                {card.back || card.answer}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-400 text-xs">
                                    Click "Regenerate Cards" to generate AI flashcards.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Official 16-Hour Course Certificate Generator Modal */}
            {showCertificateModal && (
                <CourseCertificateModal
                    course={NOSQL_COURSE_INFO}
                    studentName="Abhishek Kumar"
                    onClose={() => setShowCertificateModal(false)}
                />
            )}
        </div>
    );
}
