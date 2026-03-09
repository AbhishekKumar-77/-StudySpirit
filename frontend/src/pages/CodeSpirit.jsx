import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import {
    ArrowLeft, Send, Sparkles, Terminal, Cpu, Hash, History, CheckCircle, Code,
    Flame, Star, Clock, Trash2, Filter, Search, ChevronRight, Zap, Trophy,
    Calendar, RefreshCw, X, BookOpen, BarChart3, ChevronDown, ArrowRight
} from "lucide-react";
import { useApp } from "../context/AppContext";

// ============== SUBJECTS WITH SYLLABUS ==============
const SUBJECTS = [
    {
        id: 'python',
        name: 'Python',
        icon: '🐍',
        color: '#3b82f6',
        gradient: 'from-blue-600 to-cyan-500',
        lang: 'python',
        topics: [
            '🌱 Level 0 — Developer Setup (History, Installing Python, First Program)',
            '🧠 Level 1 — Variables & Data Types (Naming, Assignments, Keywords, Expressions)',
            '⚙️ Level 2 — Operators & Expressions (Arithmetic, Relational, Logical, Precedence)',
            '🔀 Level 3 — Conditional Statements (if/else, elif, Nested Conditions)',
            '🔁 Level 4 — Iterative Statements (for, while, Nested Loops, break/continue)',
            '🧩 Level 5 — Functions & Recursion (Parameters, Type Conversion, Recursive Functions)',
            '🔤 Level 6 — Strings (Slicing, Traversal, find(), Formatting, Comparison)',
            '📦 Level 7 — Lists (Slicing, Membership, Nested Lists, List Operations)',
            '📚 Level 8 — Tuples & Dictionaries (Immutability, Key-Value, Aliasing, Copying)',
            '🏗 Level 9 — OOP (Classes, __init__, Inheritance, Polymorphism, Encapsulation)',
            '📂 Level 10 — File Handling (Read/Write, File Modes, Directories, Pickling)',
            '⚠️ Level 11 — Exception Handling (try/except/else/finally, Custom Exceptions)',
            '🔍 Level 12 — Regular Expressions (match, search, findall, Pattern Matching)',
            '🌐 Level 13 — Web Scraping (requests, BeautifulSoup, Data Extraction)',
            '🧠 Level 14 — Advanced Python (Lambda, List Comprehensions, Generators, Decorators)'
        ]
    },
    {
        id: 'c',
        name: 'C',
        icon: '🔧',
        color: '#64748b',
        gradient: 'from-slate-600 to-gray-500',
        lang: 'c',
        topics: [
            '🌱 Level 0 — Developer Setup (History, How C Works, First Program)',
            '🧠 Level 1 — C Foundations (Tokens, Keywords, Variables, Data Types, Type Casting)',
            '⚙️ Level 2 — Operators & Expressions (Arithmetic, Relational, Logical, Bitwise)',
            '🔀 Level 3 — Decision Making (if/else, switch, Ternary Operator)',
            '🔁 Level 4 — Loops & Iterations (for, while, do-while, break, continue, goto)',
            '📥 Level 5 — Input & Output (printf, scanf, Format Specifiers, Escape Sequences)',
            '🧩 Level 6 — Functions (Call by Value/Reference, Recursion, Math Library)',
            '📦 Level 7 — Arrays (1D, 2D, Linear Search, Binary Search, Bubble Sort)',
            '🧭 Level 8 — Pointers (Arithmetic, Pointer to Array/Function, Dangling/Null/Void)',
            '🧠 Level 9 — Dynamic Memory (malloc, calloc, realloc, free)',
            '🔤 Level 10 — Strings (strlen, strcpy, strcmp, strcat, Palindrome)',
            '🏗 Level 11 — Structures (Nested, Array of Structs, Pointer to Struct)',
            '🔄 Level 12 — Unions & Macros (Union vs Struct, Object/Function/Chain Macros)',
            '🧱 Level 13 — Storage Classes (auto, extern, register, static)'
        ]
    },
    {
        id: 'cpp',
        name: 'C++',
        icon: '⚙️',
        color: '#8b5cf6',
        gradient: 'from-violet-600 to-purple-500',
        lang: 'cpp',
        topics: [
            '🌱 Level 0 — Developer Setup (First Program, Compilation Process)',
            '🧠 Level 1 — C++ Foundations (Syntax, cin/cout, I/O Streams)',
            '📦 Level 2 — Variables & Data Types (Constants, Type Casting, auto, Enums)',
            '⚙️ Level 3 — Operators & Expressions (Arithmetic, Logical, Bitwise, Precedence)',
            '🔀 Level 4 — Control Flow (if/else, switch, Ternary Operator)',
            '🔁 Level 5 — Loops (for, while, do-while, break, continue, Nested Loops)',
            '🧩 Level 6 — Functions (Overloading, Default Args, Inline, Recursion)',
            '📚 Level 7 — Arrays & Strings (Multidimensional, char[], string class)',
            '🧭 Level 8 — Pointers & Memory (Pointer Arithmetic, this, Dangling/Null Ptr)',
            '🏗 Level 9 — OOP Basics (Classes, Objects, Access Specifiers, Static Members)',
            '🧱 Level 10 — Constructors & Destructors (Copy, Parameterized, Initializer List)',
            '🧠 Level 11 — Operator Overloading (Unary, Binary, Friend Functions)',
            '🔄 Level 12 — Type Conversion (Basic↔Class, Conversion Constructors)',
            '🧬 Level 13 — Inheritance (Single, Multiple, Multilevel, Virtual Base Class)',
            '🎭 Level 14 — Polymorphism (Virtual Functions, Abstract Classes, Binding)',
            '🧠 Level 15 — Dynamic Memory (new/delete, Memory Leak, Self-Referential)',
            '📂 Level 16 — File Handling (File Streams, Binary Files, Random Access)',
            '⚠️ Level 17 — Exception Handling (try/catch/throw, Rethrowing)',
            '🧬 Level 18 — Templates (Function & Class Templates, Specialization)',
            '📦 Level 19 — STL (Vector, List, Stack, Queue, Map, Set, Iterators, Algorithms)'
        ]
    },
    {
        id: 'java',
        name: 'Java',
        icon: '☕',
        color: '#f97316',
        gradient: 'from-orange-500 to-amber-500',
        lang: 'java',
        topics: [
            '🌱 Level 0 — Developer Environment (JVM/JDK/JRE, First Program)',
            '🧠 Level 1 — Java Fundamentals (Keywords, Data Types, Wrapper Classes, static)',
            '⚙️ Level 2 — Operators & Expressions (Arithmetic, Logical, Bitwise, Precedence)',
            '🔀 Level 3 — Decision Making (if/else, switch-case)',
            '🔁 Level 4 — Loops & Iterations (for, while, do-while, for-each)',
            '📦 Level 5 — Arrays & Enums (1D, Multi-D, varargs, Enumerations)',
            '🧱 Level 6 — OOP Basics (Classes, Constructors, Methods, Overloading, this)',
            '🧬 Level 7 — Inheritance & Polymorphism (Overriding, super, final, instanceof)',
            '🎭 Level 8 — Abstract Classes & Interfaces (Default Methods, Static Methods)',
            '🧩 Level 9 — Nested Classes & Lambdas (Anonymous, Functional Interfaces)',
            '🔤 Level 10 — String Handling (String, StringBuilder, StringBuffer, Immutability)',
            '📅 Level 11 — Utility Classes (Date/Time, Formatting)',
            '⚠️ Level 12 — Exception Handling (try/catch/finally, throw/throws, Custom Exceptions)',
            '📂 Level 13 — I/O & Serialization (File Handling, Object Serialization)',
            '🧬 Level 14 — Generics (Generic Classes/Methods, Bounded Types, Wildcards)',
            '📦 Level 15 — Collections Framework (ArrayList, LinkedList, HashMap, TreeSet, Queue)',
            '🗄 Level 16 — Database Programming (JDBC, CRUD, Prepared Statements)',
            '🧵 Level 17 — Multithreading (Threads, Runnable, Synchronization, Lifecycle)'
        ]
    },
    {
        id: 'dsa',
        name: 'DSA',
        icon: '🧠',
        color: '#10b981',
        gradient: 'from-emerald-500 to-teal-500',
        lang: null, // user chooses language
        topics: [
            '🌱 Level 0 — Programming Foundations (Time/Space Complexity, Big O, Asymptotic Analysis)',
            '🧠 Level 1 — Recursion & Math (Factorial, Fibonacci, Tower of Hanoi, Backtracking)',
            '📦 Level 2 — Arrays (Prefix Sum, Sliding Window, Kadane\'s, Two Sum, Rotate)',
            '🔤 Level 3 — Strings (Pattern Searching, Rabin Karp, KMP Algorithm)',
            '🧱 Level 4 — Linked Lists (Singly, Doubly, Circular, Cycle Detection, LRU Cache)',
            '📚 Level 5 — Stack (Balanced Parentheses, Infix to Postfix, Next Greater Element)',
            '📥 Level 6 — Queue (Circular Queue, Priority Queue, Deque, Sliding Window Max)',
            '🌳 Level 7 — Trees (Binary Tree, Traversals, Height, Diameter, Tree Views)',
            '🌲 Level 8 — Binary Search Trees (Insert/Delete/Search, LCA, Validate BST)',
            '⚖️ Level 9 — Balanced Trees (AVL, Red-Black, B/B+ Trees, DB Indexing)',
            '🧠 Level 10 — Heaps & Priority Queues (Min/Max Heap, Heap Sort, Top K Elements)',
            '🕸 Level 11 — Hashing (Hash Tables, Collision Handling, Two Sum, Longest Consecutive)',
            '🌐 Level 12 — Graphs (BFS, DFS, Connected Components, Cycle Detection, Topological Sort)',
            '🚀 Level 13 — Advanced Graphs (Dijkstra, Bellman Ford, Floyd Warshall, Kruskal, Prim)',
            '⚙️ Level 14 — Sorting (Bubble, Selection, Insertion, Merge, Quick, Heap Sort)',
            '🔎 Level 15 — Searching (Linear, Binary Search, Rotated Array, First/Last Occurrence)',
            '🧩 Level 16 — Dynamic Programming (Memoization, Knapsack, LCS, LIS, Matrix Chain)',
            '🎯 Level 17 — Greedy Algorithms (Activity Selection, Huffman, Fractional Knapsack)',
            '🔄 Level 18 — Backtracking (N-Queens, Sudoku Solver, Subset Sum, Permutations)',
            '🧠 Level 19 — Bit Manipulation (Bit Masking, XOR Tricks, Single Number, Power of 2)'
        ]
    },
    {
        id: 'javascript',
        name: 'JavaScript',
        icon: '⚡',
        color: '#eab308',
        gradient: 'from-yellow-500 to-orange-400',
        lang: 'javascript',
        topics: [
            'Variables (let, const, var)',
            'Data Types & Type Coercion',
            'Functions & Closures',
            'Arrays & Array Methods',
            'Objects & Prototypes',
            'ES6+ Features',
            'Destructuring & Spread',
            'Promises & Async/Await',
            'Error Handling',
            'Classes & Modules',
            'Map, Set & WeakMap',
            'Regular Expressions',
            'Higher Order Functions',
            'Event Loop & Callbacks',
            'Recursion in JS'
        ]
    }
];

export default function CodeSpirit() {
    const navigate = useNavigate();
    const { user } = useApp();

    const [activeTab, setActiveTab] = useState("generate");

    // Generation State
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("medium");
    const [questionCount, setQuestionCount] = useState(5);
    const [language, setLanguage] = useState("python");
    const [isGenerating, setIsGenerating] = useState(false);

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

    useEffect(() => { fetchDailyChallenge(); }, []);

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

    const handleSubjectClick = (subject) => {
        if (selectedSubject?.id === subject.id) {
            setSelectedSubject(null);
            return;
        }
        setSelectedSubject(subject);
        setTopic("");
        // Auto-set language for language-specific subjects
        if (subject.lang) {
            setLanguage(subject.lang);
        }
    };

    const handleTopicClick = (topicName) => {
        setTopic(topicName);
    };

    const handleGenerate = async () => {
        if (!topic.trim()) return alert("Please select a topic first!");
        setIsGenerating(true);

        // Build the full topic context
        const fullTopic = selectedSubject
            ? `${topic} (${selectedSubject.name})`
            : topic;

        try {
            const res = await fetch(`${API_BASE}/codespirit/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ topic: fullTopic, difficulty, count: questionCount, language })
            });
            const data = await res.json();
            if (data.success && data.challenges?.length > 0) {
                navigate('/code-editor', {
                    state: { sessionId: data.sessionId, challenges: data.challenges, totalCount: data.totalCount, topic: fullTopic, difficulty }
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
            await fetch(`${API_BASE}/codespirit/session/${sessionId}`, { method: 'DELETE', credentials: 'include' });
            setHistory(prev => prev.filter(s => s._id !== sessionId));
        } catch (err) { console.error(err); }
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
    const dsaLanguages = [
        { id: "python", name: "Python", icon: "🐍" },
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
                        <Sparkles size={16} /> Practice
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-cyan-500 text-white shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        <History size={16} /> History
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-6 animate-fade-in">

                {activeTab === 'generate' && (
                    <>
                        {/* Daily Challenge Banner */}
                        {dailyChallenge && (
                            <div className="mb-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 cursor-pointer hover:border-amber-500/40 transition-all"
                                onClick={() => resumeSession(dailyChallenge)}>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                                            <Flame className="text-amber-500" size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Daily Challenge</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${dailyChallenge.difficulty === 'hard' ? 'bg-rose-500/20 text-rose-500' : dailyChallenge.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{dailyChallenge.difficulty}</span>
                                            </div>
                                            <h3 className="text-lg font-bold">{dailyChallenge.topic}</h3>
                                        </div>
                                    </div>
                                    <button className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2">
                                        {dailyChallenge.completed ? 'Review' : 'Solve Now'} <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Section Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-black mb-1">Choose a Subject</h2>
                            <p className="text-[var(--text-secondary)] text-sm">Select a subject to explore topics, then generate coding challenges.</p>
                        </div>

                        {/* ============ SUBJECT CARDS GRID ============ */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                            {SUBJECTS.map(subject => (
                                <button
                                    key={subject.id}
                                    onClick={() => handleSubjectClick(subject)}
                                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 group hover:scale-[1.03] ${selectedSubject?.id === subject.id
                                        ? 'border-cyan-500 shadow-lg shadow-cyan-500/20 bg-cyan-500/5'
                                        : 'border-[var(--border-color)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)]'
                                        }`}
                                >
                                    {/* Active Indicator */}
                                    {selectedSubject?.id === subject.id && (
                                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-cyan-500 rounded-full border-2 border-[var(--bg-primary)] animate-pulse" />
                                    )}
                                    <div className="text-3xl mb-3">{subject.icon}</div>
                                    <div className="font-bold text-sm">{subject.name}</div>
                                    <div className="text-xs text-[var(--text-muted)] mt-1">{subject.topics.length} topics</div>
                                    {/* Subtle gradient overlay on hover */}
                                    <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${subject.gradient}`} />
                                </button>
                            ))}
                        </div>

                        {/* ============ SYLLABUS / TOPICS PANEL ============ */}
                        {selectedSubject && (
                            <div className="mb-8 animate-slide-down">
                                <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
                                    {/* Subject Header */}
                                    <div className={`bg-gradient-to-r ${selectedSubject.gradient} p-5 flex items-center justify-between`}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{selectedSubject.icon}</span>
                                            <div>
                                                <h3 className="text-xl font-black text-white">{selectedSubject.name} Syllabus</h3>
                                                <p className="text-white/70 text-sm">Pick a topic to generate practice questions</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedSubject(null)}
                                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* Topic Grid */}
                                    <div className="p-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                            {selectedSubject.topics.map((t, idx) => (
                                                <button
                                                    key={t}
                                                    onClick={() => handleTopicClick(t)}
                                                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all hover:scale-[1.01] ${topic === t
                                                        ? 'border-cyan-500 bg-cyan-500/10 text-[var(--text-primary)] shadow-md shadow-cyan-500/10'
                                                        : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/50 text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                                        }`}
                                                >
                                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${topic === t
                                                        ? 'bg-cyan-500 text-white'
                                                        : 'bg-[var(--border-color)] text-[var(--text-muted)]'
                                                        }`}>
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-sm font-semibold">{t}</span>
                                                    {topic === t && <CheckCircle size={16} className="ml-auto text-cyan-500 shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ============ CONFIGURATION PANEL (shown when topic is selected) ============ */}
                        {topic && (
                            <div className="mb-8 animate-slide-down">
                                <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] p-6 rounded-2xl backdrop-blur-sm">
                                    {/* Selected topic display */}
                                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[var(--border-color)]">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                            <BookOpen size={20} className="text-cyan-500" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Selected Topic</div>
                                            <div className="font-bold text-lg">{topic} <span className="text-[var(--text-muted)] font-normal text-sm">— {selectedSubject?.name || 'Custom'}</span></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Language (only for DSA which is lang-agnostic) */}
                                        {selectedSubject?.lang === null && (
                                            <div>
                                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 block flex items-center gap-2">
                                                    <Code size={14} /> Language
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {dsaLanguages.map(l => (
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
                                        )}

                                        {/* Difficulty */}
                                        <div>
                                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 block flex items-center gap-2">
                                                <BarChart3 size={14} /> Difficulty
                                            </label>
                                            <div className="flex flex-col gap-2">
                                                {[
                                                    { id: 'easy', label: 'Easy', bg: '#10b981' },
                                                    { id: 'medium', label: 'Medium', bg: '#f59e0b' },
                                                    { id: 'hard', label: 'Hard', bg: '#f43f5e' }
                                                ].map(d => (
                                                    <button
                                                        key={d.id}
                                                        onClick={() => setDifficulty(d.id)}
                                                        className={`py-2.5 rounded-xl border font-bold capitalize text-sm transition-all ${difficulty === d.id
                                                            ? 'border-transparent text-white shadow-lg'
                                                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                                                            }`}
                                                        style={difficulty === d.id ? { background: d.bg, borderColor: d.bg } : {}}
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
                                        disabled={isGenerating}
                                        className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg"
                                    >
                                        {isGenerating ? (
                                            <> <Cpu className="animate-spin" /> Generating {questionCount} Challenge{questionCount > 1 ? 's' : ''}... </>
                                        ) : (
                                            <> <Zap size={20} /> Generate {questionCount} Challenge{questionCount > 1 ? 's' : ''} </>
                                        )}
                                    </button>

                                    <p className="text-center text-sm text-[var(--text-secondary)] mt-3">
                                        <span className="font-bold text-cyan-500">{topic}</span> • {difficulty} • {questionCount} question{questionCount > 1 ? 's' : ''} • {dsaLanguages.find(l => l.id === language)?.name || language}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Empty State (no subject selected) */}
                        {!selectedSubject && !topic && (
                            <div className="text-center py-12 opacity-60">
                                <Code size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                                <p className="text-lg font-semibold mb-1">Pick a subject to get started</p>
                                <p className="text-sm text-[var(--text-muted)]">Select from Python, C, C++, Java, DSA, or JavaScript above</p>
                            </div>
                        )}
                    </>
                )}

                {/* ============ HISTORY TAB ============ */}
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
                            <select value={historyFilter.difficulty} onChange={e => setHistoryFilter(p => ({ ...p, difficulty: e.target.value }))}
                                className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-semibold">
                                <option value="all">All Difficulties</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <select value={historyFilter.language} onChange={e => setHistoryFilter(p => ({ ...p, language: e.target.value }))}
                                className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-semibold">
                                <option value="all">All Languages</option>
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="cpp">C++</option>
                                <option value="c">C</option>
                                <option value="java">Java</option>
                            </select>
                            <select value={historyFilter.completed} onChange={e => setHistoryFilter(p => ({ ...p, completed: e.target.value }))}
                                className="px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-semibold">
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
                                        : 'Generate your first session to see it here.'}
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
                                            onClick={() => resumeSession(session)}>
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
                                                                'bg-emerald-500/20 text-emerald-500'}`}>
                                                            {session.difficulty}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-500 text-xs font-bold uppercase tracking-wider">
                                                            {session.language}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{session.topic}</h3>
                                                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Clock size={12} /> {timeAgo(session.createdAt)}</p>
                                                </div>
                                                <div className="flex items-center gap-5">
                                                    <div className="text-center min-w-[80px]">
                                                        <div className="text-xs text-[var(--text-muted)] mb-1">Progress</div>
                                                        <div className="text-lg font-bold">
                                                            <span className={solvedCount === totalCount ? 'text-emerald-500' : 'text-cyan-500'}>{solvedCount}</span>
                                                            <span className="text-[var(--text-muted)]">/{totalCount}</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full mt-1">
                                                            <div className={`h-full rounded-full transition-all ${solvedCount === totalCount ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                                                                style={{ width: `${progress}%` }} />
                                                        </div>
                                                    </div>
                                                    <button onClick={(e) => deleteSession(session._id, e)}
                                                        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100" title="Delete session">
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); resumeSession(session); }}
                                                        className="bg-cyan-500 hover:bg-cyan-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2">
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
                @keyframes slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.4s ease-out; }
                .animate-slide-down { animation: slide-down 0.35s ease-out; }
            `}</style>
        </div>
    );
}
