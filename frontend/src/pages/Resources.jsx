import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from '../config';
import {
    ArrowLeft, Library, FileText, Brain, Sparkles, Folder,
    Upload, Download, Search, Plus, Trash2, Edit3, BookOpen, Users,
    Zap, Mic, Video, Image as ImageIcon, Link as LinkIcon,
    Share2, Star, Clock, CheckCircle, X, Copy, Check
} from "lucide-react";

// ========== Markdown Renderer ==========
const RenderedMarkdown = ({ content }) => {
    if (!content) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
    };

    const downloadAsFile = () => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'study-notes.md';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Parse markdown into rendered elements
    const renderContent = () => {
        const lines = content.split('\n');
        const elements = [];
        let i = 0;
        let listItems = [];
        let listType = null; // 'ul' or 'ol'
        let codeBlock = null;
        let codeLines = [];

        const flushList = () => {
            if (listItems.length > 0) {
                if (listType === 'ol') {
                    elements.push(
                        <ol key={`ol-${elements.length}`} className="my-4 ml-6 space-y-2 list-decimal">
                            {listItems.map((item, idx) => (
                                <li key={idx} className="text-[var(--text-secondary)] leading-relaxed pl-2">
                                    <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
                                </li>
                            ))}
                        </ol>
                    );
                } else {
                    elements.push(
                        <ul key={`ul-${elements.length}`} className="my-4 ml-6 space-y-2 list-disc">
                            {listItems.map((item, idx) => (
                                <li key={idx} className="text-[var(--text-secondary)] leading-relaxed pl-2">
                                    <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
                                </li>
                            ))}
                        </ul>
                    );
                }
                listItems = [];
                listType = null;
            }
        };

        // Format inline markdown: bold, italic, inline code, links
        const formatInline = (text) => {
            return text
                // Code inline `code`
                .replace(/`([^`]+)`/g, '<code class="bg-indigo-500/20 text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
                // Bold + Italic ***text***
                .replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="text-[var(--text-primary)]"><em>$1</em></strong>')
                // Bold **text**
                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[var(--text-primary)] font-semibold">$1</strong>')
                // Italic *text*
                .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em class="text-cyan-200 italic">$1</em>')
                // Links [text](url)
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-cyan-400 underline hover:text-cyan-300">$1</a>');
        };

        while (i < lines.length) {
            const line = lines[i];

            // Code blocks ```
            if (line.trim().startsWith('```')) {
                if (codeBlock !== null) {
                    // End of code block
                    flushList();
                    elements.push(
                        <div key={`code-${elements.length}`} className="my-5 rounded-xl overflow-hidden border border-indigo-500/20">
                            <div className="bg-[var(--bg-secondary)] px-4 py-2 flex items-center justify-between border-b border-[var(--border-color)]">
                                <span className="text-xs text-[var(--text-secondary)] font-mono uppercase">{codeBlock || 'code'}</span>
                                <button onClick={() => navigator.clipboard.writeText(codeLines.join('\n'))} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Copy</button>
                            </div>
                            <pre className="bg-[var(--bg-secondary)]/80 p-4 overflow-x-auto text-sm font-mono leading-relaxed text-emerald-300">
                                {codeLines.join('\n')}
                            </pre>
                        </div>
                    );
                    codeBlock = null;
                    codeLines = [];
                } else {
                    flushList();
                    codeBlock = line.trim().replace('```', '').trim() || 'code';
                }
                i++;
                continue;
            }

            if (codeBlock !== null) {
                codeLines.push(line);
                i++;
                continue;
            }

            // Empty line
            if (line.trim() === '') {
                flushList();
                i++;
                continue;
            }

            // Headings
            if (line.startsWith('### ')) {
                flushList();
                elements.push(
                    <h3 key={`h3-${elements.length}`} className="text-lg font-bold text-cyan-400 mt-8 mb-3 flex items-center gap-2 border-b border-cyan-500/20 pb-2">
                        <span className="w-1.5 h-5 bg-cyan-500 rounded-full inline-block" />
                        <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('### ', '')) }} />
                    </h3>
                );
                i++;
                continue;
            }

            if (line.startsWith('## ')) {
                flushList();
                elements.push(
                    <h2 key={`h2-${elements.length}`} className="text-xl font-bold text-indigo-300 mt-8 mb-4 flex items-center gap-2.5 border-b border-indigo-500/20 pb-2.5">
                        <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block" />
                        <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('## ', '')) }} />
                    </h2>
                );
                i++;
                continue;
            }

            if (line.startsWith('# ')) {
                flushList();
                elements.push(
                    <h1 key={`h1-${elements.length}`} className="text-2xl font-black text-[var(--text-primary)] mt-6 mb-5 flex items-center gap-3 border-b border-[var(--border-color)] pb-3">
                        <span className="w-2.5 h-7 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-full inline-block" />
                        <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('# ', '')) }} />
                    </h1>
                );
                i++;
                continue;
            }

            // Horizontal rule
            if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
                flushList();
                elements.push(<hr key={`hr-${elements.length}`} className="my-6 border-[var(--border-color)]" />);
                i++;
                continue;
            }

            // Blockquote
            if (line.startsWith('> ')) {
                flushList();
                elements.push(
                    <blockquote key={`bq-${elements.length}`} className="my-4 border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-500/5 rounded-r-lg italic text-[var(--text-secondary)]">
                        <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('> ', '')) }} />
                    </blockquote>
                );
                i++;
                continue;
            }

            // Unordered list items: -, *, +
            const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)/);
            if (ulMatch) {
                if (listType !== 'ul') flushList();
                listType = 'ul';
                listItems.push(ulMatch[2]);
                i++;
                continue;
            }

            // Ordered list items: 1. 2. etc.
            const olMatch = line.match(/^(\s*)\d+[.)]\s+(.+)/);
            if (olMatch) {
                if (listType !== 'ol') flushList();
                listType = 'ol';
                listItems.push(olMatch[2]);
                i++;
                continue;
            }

            // Regular paragraph
            flushList();
            elements.push(
                <p key={`p-${elements.length}`} className="text-[var(--text-secondary)] leading-relaxed my-3 text-[15px]">
                    <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
                </p>
            );
            i++;
        }

        flushList();
        return elements;
    };

    return (
        <div className="rendered-markdown">
            {renderContent()}
        </div>
    );
};

export default function Resources() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("library");
    const [copied, setCopied] = useState(false);

    // AI States
    const [aiTopic, setAiTopic] = useState("");
    const [aiContent, setAiContent] = useState(""); // For generating notes
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResult, setGeneratedResult] = useState(""); // Markdown/Text output

    // Video Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [videoResults, setVideoResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`${API_BASE}/resources/search-youtube`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery })
            });
            const data = await res.json();
            if (data.success) {
                // Filter out non-video items just in case backend didn't
                setVideoResults(data.videos.filter(v => v.type === 'video'));
            } else {
                alert("Failed to fetch videos: " + data.message);
            }
        } catch (e) {
            console.error("Search error", e);
            alert("Error searching YouTube.");
        } finally {
            setIsSearching(false);
        }
    };

    const [flashcards, setFlashcards] = useState([]);
    const [flashcardFlipped, setFlashcardFlipped] = useState(null);

    // Flashcard Deck State
    const [decks, setDecks] = useState([]);
    const [showCreateDeck, setShowCreateDeck] = useState(false);
    const [editingDeckIdx, setEditingDeckIdx] = useState(null);
    const [deckName, setDeckName] = useState('');
    const [deckCards, setDeckCards] = useState([]);
    const [createMode, setCreateMode] = useState('ai'); // 'ai' or 'manual'
    const [newCardFront, setNewCardFront] = useState('');
    const [newCardBack, setNewCardBack] = useState('');
    const [flashcardTopic, setFlashcardTopic] = useState('');
    const [flashcardDifficulty, setFlashcardDifficulty] = useState('medium');
    const [flashcardCount, setFlashcardCount] = useState(8);
    const [isGeneratingCards, setIsGeneratingCards] = useState(false);
    const [studyingDeck, setStudyingDeck] = useState(null);
    const [studyCardIndex, setStudyCardIndex] = useState(0);

    // AI Flashcard Generation
    const handleGenerateFlashcards = async () => {
        if (!flashcardTopic.trim()) return;
        setIsGeneratingCards(true);
        try {
            const res = await fetch(`${API_BASE}/resources/generate-flashcards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: flashcardTopic,
                    count: flashcardCount,
                    difficulty: flashcardDifficulty
                })
            });
            const data = await res.json();
            if (data.success && data.flashcards.length > 0) {
                setDeckCards(prev => [...prev, ...data.flashcards]);
                if (!deckName.trim()) {
                    setDeckName(flashcardTopic);
                }
            } else {
                alert("Failed to generate flashcards: " + (data.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Flashcard Gen Error:", err);
            alert("Error connecting to AI service.");
        } finally {
            setIsGeneratingCards(false);
        }
    };

    // AI Handlers - Connect to backend
    const handleGenerate = async (type) => {
        if (!aiTopic.trim()) {
            alert("Please enter a topic!");
            return;
        }
        setIsGenerating(true);
        setGeneratedResult("");

        try {
            const endpoint = type === 'notes' ? 'generate-notes' : 'explain';
            const body = type === 'notes' ? { topic: aiTopic, content: aiContent } : { topic: aiTopic };

            const res = await fetch(`${API_BASE}/resources/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.success) {
                setGeneratedResult(data.result);
            } else {
                setGeneratedResult("Error: " + (data.message || "Failed to generate."));
            }
        } catch (err) {
            console.error("AI Error:", err);
            setGeneratedResult("Network error connecting to AI service.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyNotes = () => {
        navigator.clipboard.writeText(generatedResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadNotes = () => {
        const blob = new Blob([generatedResult], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${aiTopic || 'study-notes'}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative pb-20 overflow-hidden font-sans text-[var(--text-primary)]">
            {/* Background Effects */}
            <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-indigo-500/10 px-8 py-5">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-indigo-400 hover:text-[var(--text-primary)] transition-colors">
                        <ArrowLeft size={20} /> Back to Dashboard
                    </button>
                    <div className="text-2xl font-black flex items-center gap-3">
                        <Library size={32} className="text-indigo-500" /> Study Resource Hub
                    </div>
                    <div className="w-[100px]"></div> {/* Spacer */}
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-8 py-10 relative z-10">

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 backdrop-blur-xl rounded-3xl p-10 mb-8 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black text-[var(--text-primary)] mb-2">Centralized Knowledge Base</h1>
                        <p className="text-[var(--text-secondary)] text-lg">Manage your notes, generate study materials, and simplify concepts with AI.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: 'library', label: 'My Library', icon: Folder },
                        { id: 'notes', label: 'AI Note Gen', icon: FileText },
                        { id: 'flashcards', label: 'Smart Flashcards', icon: Zap },
                        { id: 'explainer', label: 'Concept Explainer', icon: Brain },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all
                                ${activeTab === tab.id
                                    ? "bg-gradient-to-br from-indigo-500 to-cyan-600 text-[var(--text-primary)] shadow-lg shadow-indigo-500/25"
                                    : "bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"}
                            `}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">

                    {/* VIDEO SEARCH TAB (WAS LIBRARY) */}
                    {activeTab === 'library' && (
                        <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl border border-[var(--border-color)] p-6 animate-fade-in">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                                <Video className="text-red-500" /> YouTube Video Search
                            </h2>

                            {/* Search Bar */}
                            <div className="flex gap-4 mb-8">
                                <div className="flex-1 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl px-4 py-4 flex items-center gap-3 focus-within:border-red-500/50 transition-colors">
                                    <Search size={20} className="text-[var(--text-muted)]" />
                                    <input
                                        type="text"
                                        placeholder="Search topics (e.g. React Hooks, Python Basics)..."
                                        className="bg-transparent outline-none text-[var(--text-primary)] w-full placeholder:text-[var(--text-primary)]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-[var(--text-primary)] font-bold transition-all shadow-lg hover:shadow-red-500/20 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSearching ? <Sparkles className="animate-spin" /> : <Search />}
                                    Search
                                </button>
                            </div>

                            {/* Results Grid */}
                            {videoResults.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {videoResults.map((video, idx) => (
                                        <a
                                            key={idx}
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[var(--glass-bg)] rounded-xl overflow-hidden border border-[var(--border-color)] hover:border-red-500/40 hover:scale-105 transition-all group flex flex-col"
                                        >
                                            <div className="relative aspect-video">
                                                <img src={video.bestThumbnail?.url || video.thumbnails?.[0]?.url} alt={video.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-[var(--bg-secondary)]lack/20 group-hover:bg-[var(--bg-secondary)]lack/0 transition-colors" />
                                                <div className="absolute bottom-2 right-2 bg-[var(--bg-secondary)]lack/80 text-[var(--text-primary)] text-xs font-bold px-2 py-1 rounded">
                                                    {video.duration}
                                                </div>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className="text-[var(--text-primary)] font-bold text-sm line-clamp-2 mb-2 group-hover:text-red-400 transition-colors" title={video.title}>{video.title}</h3>
                                                <div className="mt-auto flex justify-between items-center text-xs text-[var(--text-muted)]">
                                                    <span className="flex items-center gap-1 truncate max-w-[100px]"><Users size={12} /> {video.author?.name}</span>
                                                    <span>{typeof video.views === 'number' ? video.views.toLocaleString() : video.views} views</span>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-[var(--glass-bg)] rounded-xl border border-dashed border-[var(--border-color)]">
                                    <Video size={64} className="text-[var(--text-primary)] mx-auto mb-4" />
                                    <p className="text-[var(--text-muted)] text-lg">Search for any topic to find study videos used for research and learning.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI NOTES GEN TAB */}
                    {activeTab === 'notes' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl border border-[var(--border-color)] p-6">
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <Edit3 className="text-cyan-400" /> Input Content
                                </h3>
                                <div className="space-y-4">
                                    <input
                                        value={aiTopic}
                                        onChange={(e) => setAiTopic(e.target.value)}
                                        placeholder="Topic Name (e.g. Photosynthesis)"
                                        className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                                    />
                                    <textarea
                                        value={aiContent}
                                        onChange={(e) => setAiContent(e.target.value)}
                                        placeholder="Paste text, article content, or rough notes here..."
                                        className="w-full h-[300px] bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-cyan-500 outline-none resize-none"
                                    />
                                    <button
                                        onClick={() => handleGenerate('notes')}
                                        disabled={isGenerating}
                                        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-[var(--text-primary)] hover:opacity-90 transition-all flex justify-center items-center gap-2"
                                    >
                                        {isGenerating ? <Sparkles className="animate-spin" /> : <Sparkles />}
                                        {isGenerating ? "Analyzing..." : "Generate Magic Notes"}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl border border-[var(--border-color)] p-6 relative">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                        <FileText className="text-indigo-400" /> Generated Notes
                                    </h3>
                                    {generatedResult && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleCopyNotes}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--border-color)]/50 hover:bg-[var(--border-color)] rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all border border-[var(--border-color)]"
                                            >
                                                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                            <button
                                                onClick={handleDownloadNotes}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-xs font-semibold text-indigo-300 hover:text-[var(--text-primary)] transition-all border border-indigo-500/20"
                                            >
                                                <Download size={14} /> Download
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-[var(--glass-bg)] rounded-xl h-[450px] overflow-y-auto p-6 border border-[var(--border-color)] leading-relaxed text-[var(--text-secondary)] scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 transparent' }}>
                                    {generatedResult ? (
                                        <RenderedMarkdown content={generatedResult} />
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
                                            <Sparkles size={48} className="mb-4" />
                                            <p>Notes will appear here...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FLASHCARDS TAB */}
                    {activeTab === 'flashcards' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                                    <Zap size={28} className="text-amber-500" /> Your Flashcard Decks
                                    <span className="text-sm text-[var(--text-muted)] font-normal ml-2">({decks.length} decks)</span>
                                </h2>
                                <button
                                    onClick={() => setShowCreateDeck(true)}
                                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl text-[var(--text-primary)] font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                                >
                                    <Plus size={18} /> Create Deck
                                </button>
                            </div>

                            {/* Study Mode */}
                            {studyingDeck !== null && decks[studyingDeck] && (
                                <div className="fixed inset-0 z-[200] bg-[var(--bg-secondary)]/98 flex flex-col items-center justify-center p-6">
                                    <div className="w-full max-w-3xl">
                                        {/* Study Header */}
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <h2 className="text-2xl font-black text-[var(--text-primary)]">{decks[studyingDeck].name}</h2>
                                                <p className="text-[var(--text-secondary)] text-sm mt-1">Card {studyCardIndex + 1} of {decks[studyingDeck].cards.length}</p>
                                            </div>
                                            <button
                                                onClick={() => { setStudyingDeck(null); setStudyCardIndex(0); setFlashcardFlipped(null); }}
                                                className="p-3 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full mb-10 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                                                style={{ width: `${((studyCardIndex + 1) / decks[studyingDeck].cards.length) * 100}%` }}
                                            />
                                        </div>

                                        {/* Flashcard */}
                                        <div
                                            onClick={() => setFlashcardFlipped(flashcardFlipped === 'study' ? null : 'study')}
                                            className="h-[320px] perspective cursor-pointer mx-auto max-w-xl group"
                                        >
                                            <div className={`
                                                relative w-full h-full duration-600 preserve-3d transition-all
                                                ${flashcardFlipped === 'study' ? "rotate-y-180" : ""}
                                            `}>
                                                {/* Front */}
                                                <div className="absolute w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl shadow-indigo-500/10 group-hover:border-indigo-500/60 transition-colors">
                                                    <div className="absolute top-5 left-5 px-3 py-1 bg-indigo-500/20 rounded-lg text-indigo-400 text-xs font-bold uppercase tracking-wider">Question</div>
                                                    <h3 className="text-2xl font-bold text-[var(--text-primary)] leading-relaxed px-4">{decks[studyingDeck].cards[studyCardIndex]?.front}</h3>
                                                    <p className="absolute bottom-5 text-xs text-[var(--text-muted)] flex items-center gap-1">Click to reveal answer</p>
                                                </div>
                                                {/* Back */}
                                                <div className="absolute w-full h-full bg-gradient-to-br from-indigo-900/60 to-cyan-900/60 backdrop-blur-xl border border-cyan-500/40 rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-2xl shadow-cyan-500/10">
                                                    <div className="absolute top-5 left-5 px-3 py-1 bg-cyan-500/20 rounded-lg text-cyan-400 text-xs font-bold uppercase tracking-wider">Answer</div>
                                                    <p className="text-xl font-medium text-[var(--text-primary)] leading-relaxed px-4">{decks[studyingDeck].cards[studyCardIndex]?.back}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="flex justify-center gap-4 mt-10">
                                            <button
                                                onClick={() => { setStudyCardIndex(Math.max(0, studyCardIndex - 1)); setFlashcardFlipped(null); }}
                                                disabled={studyCardIndex === 0}
                                                className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold rounded-xl hover:bg-[var(--border-color)] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                            >
                                                <ArrowLeft size={18} /> Previous
                                            </button>
                                            <span className="px-6 py-3 bg-[var(--glass-bg)] text-[var(--text-secondary)] font-bold rounded-xl border border-[var(--border-color)]">
                                                {studyCardIndex + 1} / {decks[studyingDeck].cards.length}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    if (studyCardIndex < decks[studyingDeck].cards.length - 1) {
                                                        setStudyCardIndex(studyCardIndex + 1);
                                                        setFlashcardFlipped(null);
                                                    } else {
                                                        setStudyingDeck(null);
                                                        setStudyCardIndex(0);
                                                        setFlashcardFlipped(null);
                                                    }
                                                }}
                                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-[var(--text-primary)] font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
                                            >
                                                {studyCardIndex < decks[studyingDeck].cards.length - 1 ? 'Next →' : '✓ Finish'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Deck Grid */}
                            {decks.length === 0 ? (
                                <div className="text-center py-20 bg-[var(--glass-bg)] rounded-2xl border border-dashed border-[var(--border-color)]">
                                    <Zap size={64} className="text-[var(--text-primary)] mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-[var(--text-muted)] mb-2">No Flashcard Decks Yet</h3>
                                    <p className="text-[var(--text-primary)] mb-6">Create your first deck with AI or add cards manually.</p>
                                    <button
                                        onClick={() => setShowCreateDeck(true)}
                                        className="px-6 py-3 bg-indigo-600 rounded-xl text-[var(--text-primary)] font-bold hover:bg-indigo-700 transition-all"
                                    >
                                        <Plus size={18} className="inline mr-2" /> Create Your First Deck
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {decks.map((deck, deckIdx) => (
                                        <div key={deck.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-[var(--border-color)] hover:border-indigo-500/40 transition-all group overflow-hidden">
                                            {/* Deck Header */}
                                            <div className="p-5 border-b border-[var(--border-color)]">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-indigo-300 transition-colors">{deck.name}</h3>
                                                        <p className="text-sm text-[var(--text-muted)] mt-1">{deck.cards.length} cards</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Delete this deck?')) {
                                                                setDecks(decks.filter((_, i) => i !== deckIdx));
                                                            }
                                                        }}
                                                        className="p-2 text-[var(--text-primary)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Preview Cards */}
                                            <div className="p-4 space-y-2 max-h-[200px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
                                                {deck.cards.slice(0, 4).map((card, cardIdx) => (
                                                    <div key={card.id} className="flex items-start gap-3 p-3 bg-[var(--glass-bg)] rounded-xl border border-[var(--border-color)] text-sm">
                                                        <span className="text-indigo-400 font-bold shrink-0 mt-0.5">Q{cardIdx + 1}</span>
                                                        <p className="text-[var(--text-secondary)] line-clamp-2">{card.front}</p>
                                                    </div>
                                                ))}
                                                {deck.cards.length > 4 && (
                                                    <p className="text-xs text-[var(--text-primary)] text-center py-1">+{deck.cards.length - 4} more cards</p>
                                                )}
                                            </div>

                                            {/* Deck Actions */}
                                            <div className="p-4 border-t border-[var(--border-color)] flex gap-2">
                                                <button
                                                    onClick={() => { setStudyingDeck(deckIdx); setStudyCardIndex(0); setFlashcardFlipped(null); }}
                                                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl text-[var(--text-primary)] font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <BookOpen size={16} /> Study
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingDeckIdx(deckIdx);
                                                        setShowCreateDeck(true);
                                                        setDeckName(deck.name);
                                                        setDeckCards([...deck.cards]);
                                                    }}
                                                    className="px-4 py-2.5 bg-[var(--border-color)]/50 rounded-xl text-[var(--text-secondary)] font-bold text-sm hover:bg-[var(--border-color)] transition-all flex items-center gap-1"
                                                >
                                                    <Edit3 size={16} /> Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* CREATE DECK MODAL */}
                            {showCreateDeck && (
                                <div className="fixed inset-0 z-[100] bg-[var(--bg-secondary)]lack/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowCreateDeck(false); setEditingDeckIdx(null); setDeckName(''); setDeckCards([]); setNewCardFront(''); setNewCardBack(''); }}>
                                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-indigo-500/20 shadow-2xl shadow-indigo-500/10" onClick={e => e.stopPropagation()}>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3">
                                                <Zap size={28} className="text-amber-500" />
                                                {editingDeckIdx !== null ? 'Edit Deck' : 'Create New Deck'}
                                            </h2>
                                            <button onClick={() => { setShowCreateDeck(false); setEditingDeckIdx(null); setDeckName(''); setDeckCards([]); setNewCardFront(''); setNewCardBack(''); }} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                                <X size={24} />
                                            </button>
                                        </div>

                                        {/* Deck Name */}
                                        <input
                                            value={deckName}
                                            onChange={e => setDeckName(e.target.value)}
                                            placeholder="Deck Name (e.g. React Fundamentals)"
                                            className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] text-lg font-semibold mb-6 focus:border-indigo-500 outline-none transition-all"
                                        />

                                        {/* Mode Toggle */}
                                        <div className="flex gap-2 mb-6">
                                            <button
                                                onClick={() => setCreateMode('ai')}
                                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${createMode === 'ai' ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-[var(--text-primary)] shadow-lg' : 'bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                            >
                                                <Sparkles size={16} /> AI Generate
                                            </button>
                                            <button
                                                onClick={() => setCreateMode('manual')}
                                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${createMode === 'manual' ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-[var(--text-primary)] shadow-lg' : 'bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                            >
                                                <Edit3 size={16} /> Manual
                                            </button>
                                        </div>

                                        {/* AI Mode */}
                                        {createMode === 'ai' && (
                                            <div className="bg-[var(--glass-bg)] rounded-2xl p-5 mb-6 border border-indigo-500/10">
                                                <h4 className="text-[var(--text-primary)] font-bold mb-4 flex items-center gap-2 text-sm">
                                                    <Brain size={18} className="text-indigo-400" /> Generate with AI
                                                </h4>
                                                <input
                                                    value={flashcardTopic}
                                                    onChange={e => setFlashcardTopic(e.target.value)}
                                                    placeholder="Topic (e.g. JavaScript Promises, Cell Biology)"
                                                    className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-3.5 text-[var(--text-primary)] mb-3 focus:border-indigo-500 outline-none transition-all"
                                                />
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    <select
                                                        value={flashcardDifficulty}
                                                        onChange={e => setFlashcardDifficulty(e.target.value)}
                                                        className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:border-indigo-500 outline-none"
                                                    >
                                                        <option value="easy">Easy</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="hard">Hard</option>
                                                    </select>
                                                    <input
                                                        type="number"
                                                        min="3"
                                                        max="20"
                                                        value={flashcardCount}
                                                        onChange={e => setFlashcardCount(parseInt(e.target.value) || 8)}
                                                        placeholder="Number of cards"
                                                        className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:border-indigo-500 outline-none text-center"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleGenerateFlashcards}
                                                    disabled={isGeneratingCards || !flashcardTopic.trim()}
                                                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-[var(--text-primary)] hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/20"
                                                >
                                                    {isGeneratingCards ? (
                                                        <><Sparkles size={18} className="animate-spin" /> Generating...</>
                                                    ) : (
                                                        <><Sparkles size={18} /> Generate {flashcardCount} Cards</>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {/* Manual Mode */}
                                        {createMode === 'manual' && (
                                            <div className="bg-[var(--glass-bg)] rounded-2xl p-5 mb-6 border border-[var(--border-color)]">
                                                <h4 className="text-[var(--text-primary)] font-bold mb-4 flex items-center gap-2 text-sm">
                                                    <Edit3 size={18} className="text-cyan-400" /> Add Card Manually
                                                </h4>
                                                <input
                                                    value={newCardFront}
                                                    onChange={e => setNewCardFront(e.target.value)}
                                                    placeholder="Question (Front side)"
                                                    className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-3.5 text-[var(--text-primary)] mb-3 focus:border-cyan-500 outline-none transition-all"
                                                />
                                                <textarea
                                                    value={newCardBack}
                                                    onChange={e => setNewCardBack(e.target.value)}
                                                    placeholder="Answer (Back side)"
                                                    className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-3.5 text-[var(--text-primary)] mb-3 focus:border-cyan-500 outline-none transition-all resize-none h-24"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (!newCardFront.trim() || !newCardBack.trim()) {
                                                            alert("Both front and back are required!");
                                                            return;
                                                        }
                                                        setDeckCards([...deckCards, { id: Date.now(), front: newCardFront.trim(), back: newCardBack.trim() }]);
                                                        setNewCardFront('');
                                                        setNewCardBack('');
                                                    }}
                                                    className="w-full py-3 bg-cyan-600 rounded-xl font-bold text-[var(--text-primary)] hover:bg-cyan-700 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={18} /> Add Card
                                                </button>
                                            </div>
                                        )}

                                        {/* Cards Preview */}
                                        {deckCards.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="text-[var(--text-primary)] font-bold mb-3 flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-emerald-400" /> Cards ({deckCards.length})</span>
                                                </h4>
                                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 transparent' }}>
                                                    {deckCards.map((card, idx) => (
                                                        <div key={card.id} className="flex items-start gap-3 bg-[var(--glass-bg)] rounded-xl p-3.5 border border-[var(--border-color)] group">
                                                            <span className="text-indigo-400 font-bold text-sm shrink-0 mt-0.5">{idx + 1}.</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[var(--text-primary)] text-sm font-medium truncate">{card.front}</p>
                                                                <p className="text-[var(--text-muted)] text-xs truncate mt-1">{card.back}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setDeckCards(deckCards.filter((_, i) => i !== idx))}
                                                                className="p-1.5 text-[var(--text-primary)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Save Deck Button */}
                                        <button
                                            onClick={() => {
                                                if (!deckName.trim()) {
                                                    alert("Please enter a deck name!");
                                                    return;
                                                }
                                                if (deckCards.length === 0) {
                                                    alert("Add at least one card!");
                                                    return;
                                                }
                                                if (editingDeckIdx !== null) {
                                                    // Update existing deck
                                                    const updatedDecks = [...decks];
                                                    updatedDecks[editingDeckIdx] = { ...updatedDecks[editingDeckIdx], name: deckName, cards: deckCards };
                                                    setDecks(updatedDecks);
                                                } else {
                                                    // New deck
                                                    setDecks([...decks, { id: Date.now(), name: deckName, cards: deckCards }]);
                                                }
                                                setShowCreateDeck(false);
                                                setEditingDeckIdx(null);
                                                setDeckName('');
                                                setDeckCards([]);
                                                setNewCardFront('');
                                                setNewCardBack('');
                                                setFlashcardTopic('');
                                            }}
                                            disabled={deckCards.length === 0 || !deckName.trim()}
                                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl font-black text-[var(--text-primary)] text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20"
                                        >
                                            <CheckCircle size={22} /> {editingDeckIdx !== null ? 'Update Deck' : 'Save Deck'} ({deckCards.length} cards)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* EXPLAINER TAB */}
                    {activeTab === 'explainer' && (
                        <div className="max-w-3xl mx-auto bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl border border-[var(--border-color)] p-8 animate-fade-in">
                            <div className="text-center mb-8">
                                <Brain size={48} className="text-pink-500 mx-auto mb-4" />
                                <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2">Concept Simplifier</h2>
                                <p className="text-[var(--text-secondary)]">Stuck on a complex topic? Let AI explain it like you're 5.</p>
                            </div>

                            <div className="flex gap-4 mb-8">
                                <input
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                    placeholder="Enter complex concept (e.g. Quantum Entanglement)"
                                    className="flex-1 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-primary)] focus:border-pink-500 outline-none"
                                />
                                <button
                                    onClick={() => handleGenerate('explain')}
                                    disabled={isGenerating}
                                    className="px-8 bg-pink-600 hover:bg-pink-700 rounded-xl font-bold text-[var(--text-primary)] transition-all disabled:opacity-50"
                                >
                                    Explain
                                </button>
                            </div>

                            {generatedResult && activeTab === 'explainer' && (
                                <div className="bg-[var(--glass-bg)] rounded-xl p-6 border border-pink-500/30">
                                    <div className="flex items-center gap-2 mb-4 text-pink-400 font-bold">
                                        <Sparkles size={20} /> Explanation
                                    </div>
                                    <div className="leading-relaxed text-lg">
                                        <RenderedMarkdown content={generatedResult} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .perspective { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}
            </style>
        </div>
    );
}
