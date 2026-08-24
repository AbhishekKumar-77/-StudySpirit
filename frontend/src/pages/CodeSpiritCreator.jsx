import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { API_BASE } from "../config";
import Editor from "@monaco-editor/react";
import {
    ArrowLeft, ArrowRight, FilePlus, Code, CheckCircle, Award,
    Trash2, Brain, Save, Settings, Edit, Play, Check, X, BookOpen, Crown, ChevronRight,
    Layers, Plus, Filter, CheckCircle2, Sparkles, Folder
} from "lucide-react";
import {
    PYTHON_MODULE_1_QUESTIONS,
    PYTHON_MODULE_2_VARIABLES_QUESTIONS,
    PYTHON_MODULE_2_DATA_QUESTIONS,
    PYTHON_CODING_QUESTIONS
} from "../data/pythonQuestions";

export default function CodeSpiritCreator() {
    const { user } = useApp();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1 = MCQ, 2 = Coding, 3 = Verify, 4 = Publish
    const [questions, setQuestions] = useState([]);
    const [quizTitle, setQuizTitle] = useState("CodeSpirit Exam");
    const [settings, setSettings] = useState({
        timeLimit: 30,
        difficulty: "medium",
        negativeMarking: 0,
        secureMode: true
    });
    const [drafts, setDrafts] = useState([]);

    // Mode toggles for MCQ and Coding sections (ai | manual | bank)
    const [mcqMode, setMcqMode] = useState("bank"); // default to bank for easy creation
    const [codingMode, setCodingMode] = useState("bank");

    // Question Bank Filters
    const [selectedMcqModule, setSelectedMcqModule] = useState("all");
    const [selectedCodingModule, setSelectedCodingModule] = useState("all");

    // Manual Question Forms
    const [mcqForm, setMcqForm] = useState({ question: "", options: ["", "", "", ""], correct: null, type: "mcq" });
    const [codingForm, setCodingForm] = useState({ question: "", starterCode: "", testCases: [{ input: "", expectedOutput: "" }] });

    // AI Variables
    const [aiTopic, setAiTopic] = useState("");
    const [aiCount, setAiCount] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Verification Modal
    const [verifyingQ, setVerifyingQ] = useState(null);
    const [teacherCode, setTeacherCode] = useState("");
    const [teacherLang, setTeacherLang] = useState("python");
    const [verifyResults, setVerifyResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        fetchDrafts();
    }, []);

    const fetchDrafts = async () => {
        try {
            const res = await fetch(`${API_BASE}/quiz/my-quizzes`, { credentials: "include" });
            const data = await res.json();
            if (data.success) setDrafts(data.quizzes || []);
        } catch (e) { console.error(e); }
    };

    const handleAiGenerate = async (type) => {
        if (!aiTopic.trim()) return alert("Enter a topic!");
        setIsGenerating(true);
        try {
            const res = await fetch(`${API_BASE}/quiz/generate-ai`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: aiTopic,
                    difficulty: settings.difficulty,
                    mcqCount: type === "mcq" ? aiCount : 0,
                    codingCount: type === "coding" ? aiCount : 0
                })
            });
            const data = await res.json();
            if (data.success && data.questions) {
                setQuestions((prev) => [...prev, ...data.questions]);
                setAiTopic("");
                alert(`${data.questions.length} ${type.toUpperCase()} Questions generated!`);
            } else {
                alert("Generation failed: " + data.message);
            }
        } catch (e) { alert("Error generating AI questions."); }
        setIsGenerating(false);
    };

    const addMcq = () => {
        if (!mcqForm.question || mcqForm.correct === null || mcqForm.options.some((o) => !o.trim())) {
            return alert("Fill all MCQ fields securely!");
        }
        setQuestions([...questions, { ...mcqForm, id: Date.now() }]);
        setMcqForm({ question: "", options: ["", "", "", ""], correct: null, type: "mcq" });
    };

    const addMcqFromBank = (q) => {
        const newMcq = {
            id: Date.now() + Math.random(),
            type: "mcq",
            question: q.question,
            options: [...q.options],
            correct: q.correct,
            explanation: q.explanation
        };
        setQuestions(prev => [...prev, newMcq]);
    };

    const addAllMcqsInModule = (qsList) => {
        const formatted = qsList.map((q, idx) => ({
            id: Date.now() + idx + Math.random(),
            type: "mcq",
            question: q.question,
            options: [...q.options],
            correct: q.correct,
            explanation: q.explanation
        }));
        setQuestions(prev => [...prev, ...formatted]);
    };

    const addCodingQ = () => {
        if (!codingForm.question || codingForm.testCases.some((t) => !t.input && t.input !== "" && !t.expectedOutput)) {
            return alert("Fill all Coding fields securely including test cases!");
        }
        setQuestions([...questions, { ...codingForm, type: "coding", id: Date.now() }]);
        setCodingForm({ question: "", starterCode: "", testCases: [{ input: "", expectedOutput: "" }] });
    };

    const addCodingFromBank = (q) => {
        const newCoding = {
            id: Date.now() + Math.random(),
            type: "coding",
            title: q.title,
            question: `${q.title}\n\n${q.description}`,
            starterCode: q.starterCode || "# TODO: Write code\n",
            testCases: q.testCases.map(t => ({
                input: t.input || "",
                expectedOutput: t.output || t.expectedOutput || ""
            }))
        };
        setQuestions(prev => [...prev, newCoding]);
    };

    const addAllCodingInModule = (qsList) => {
        const formatted = qsList.map((q, idx) => ({
            id: Date.now() + idx + Math.random(),
            type: "coding",
            title: q.title,
            question: `${q.title}\n\n${q.description}`,
            starterCode: q.starterCode || "# TODO: Write code\n",
            testCases: q.testCases.map(t => ({
                input: t.input || "",
                expectedOutput: t.output || t.expectedOutput || ""
            }))
        }));
        setQuestions(prev => [...prev, ...formatted]);
    };

    const deleteQuestion = (id) => {
        setQuestions(questions.filter((q) => q.id !== id));
    };

    const verifyCodeForQuestion = async () => {
        if (!verifyingQ || !teacherCode.trim()) return;
        setIsRunning(true);
        const results = [];
        for (let i = 0; i < verifyingQ.testCases.length; i++) {
            const tc = verifyingQ.testCases[i];
            try {
                const executeRes = await fetch(`${API_BASE}/codespirit/execute`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ language: teacherLang, code: teacherCode, stdin: tc.input || "" })
                });
                const result = await executeRes.json();
                const out = (result.run?.stdout || "").trim();
                const outNormalized = out.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n').map(l => l.trim()).join('\n');
                const expNormalized = (tc.expectedOutput || tc.output || "").replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n').map(l => l.trim()).join('\n');

                const passed = outNormalized === expNormalized && result.success && (result.run?.exitCode === 0 || result.run?.code === 0 || result.run?.code === null);
                results.push({
                    pass: passed,
                    actual: out,
                    expected: tc.expectedOutput || tc.output || "",
                    input: tc.input || "(None)",
                    error: result.run?.stderr || ""
                });
            } catch (e) {
                results.push({ pass: false, error: e.message });
            }
        }
        setVerifyResults(results);
        setIsRunning(false);
    };

    const publishExam = async (status = "published") => {
        if (questions.length === 0) return alert("Please add questions first!");
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/quiz/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: quizTitle,
                    questions,
                    settings,
                    creatorName: user?.name,
                    status
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Exam ${status} successfully! Code: ${data.quizCode}`);
                if (status === "draft") fetchDrafts();
                navigate('/teacher-codespirit');
            } else { alert("Failed: " + data.message); }
        } catch (e) { }
        setIsSaving(false);
    };

    const mcqs = questions.filter(q => q.type !== "coding");
    const codings = questions.filter(q => q.type === "coding");

    // Filter MCQ Bank questions
    const allMcqBank = [
        ...PYTHON_MODULE_1_QUESTIONS,
        ...PYTHON_MODULE_2_VARIABLES_QUESTIONS,
        ...PYTHON_MODULE_2_DATA_QUESTIONS
    ];

    const getFilteredMcqBank = () => {
        if (selectedMcqModule === "m1") return PYTHON_MODULE_1_QUESTIONS;
        if (selectedMcqModule === "m2_var") return PYTHON_MODULE_2_VARIABLES_QUESTIONS;
        if (selectedMcqModule === "m2_data") return PYTHON_MODULE_2_DATA_QUESTIONS;
        return allMcqBank;
    };

    // Filter Coding Bank questions
    const getFilteredCodingBank = () => {
        if (selectedCodingModule === "m1") return PYTHON_CODING_QUESTIONS.filter(q => q.module.includes("Module 1"));
        if (selectedCodingModule === "m2") return PYTHON_CODING_QUESTIONS.filter(q => q.module.includes("Module 2"));
        if (selectedCodingModule === "m3") return PYTHON_CODING_QUESTIONS.filter(q => q.module.includes("Module 3"));
        return PYTHON_CODING_QUESTIONS;
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] relative overflow-x-hidden">
            {/* Background Glow */}
            <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[100px] z-0 pointer-events-none"></div>

            <nav className="sticky top-0 z-50 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--border-color)] px-8 py-4">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <button onClick={() => navigate("/teacher-codespirit")} className="flex items-center gap-3 bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl text-sm font-semibold hover:border-cyan-500/50 hover:-translate-x-1 transition-all">
                        <ArrowLeft size={18} /> Back to CodeSpirit Dashboard
                    </button>
                    <div className="text-xl font-black bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text">CodeSpirit Creator</div>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-6 py-10 relative z-10">
                {/* Stepper */}
                <div className="flex flex-wrap items-center justify-between mb-10 bg-[var(--glass-bg)] p-4 rounded-2xl border border-[var(--border-color)]">
                    {["MCQ Section", "Coding Section", "Verify Code", "Publish"].map((lbl, idx) => (
                        <div key={idx} onClick={() => setStep(idx + 1)} className={`cursor-pointer flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${step === idx + 1 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold' : 'text-[var(--text-secondary)] opacity-60 hover:opacity-100'}`}>
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center font-black">{idx + 1}</div>
                            {lbl}
                        </div>
                    ))}
                </div>

                {/* STEP 1: MCQ */}
                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
                        <div className="lg:col-span-7 space-y-6 bg-[var(--glass-bg)] p-8 rounded-3xl border border-[var(--border-color)] shadow-xl">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <h2 className="text-2xl font-black flex items-center gap-3 text-[var(--text-primary)]">
                                    <BookOpen className="text-cyan-400" /> Objective MCQs
                                </h2>
                                {/* Mode Selector Switch */}
                                <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)]">
                                    <button
                                        onClick={() => setMcqMode("bank")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            mcqMode === "bank" ? "bg-cyan-500 text-white shadow-md" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        <Layers size={14} /> Question Bank (60)
                                    </button>
                                    <button
                                        onClick={() => setMcqMode("ai")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            mcqMode === "ai" ? "bg-violet-600 text-white shadow-md" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        <Brain size={14} /> AI Generator
                                    </button>
                                    <button
                                        onClick={() => setMcqMode("manual")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            mcqMode === "manual" ? "bg-emerald-600 text-white shadow-md" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        <Edit size={14} /> Manual Add
                                    </button>
                                </div>
                            </div>

                            {/* QUESTION BANK MODE */}
                            {mcqMode === "bank" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                            {[
                                                { id: "all", label: "All Modules (60)" },
                                                { id: "m1", label: "Mod 1: Intro (20)" },
                                                { id: "m2_var", label: "Mod 2: Variables (20)" },
                                                { id: "m2_data", label: "Mod 2: Data Types (20)" }
                                            ].map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setSelectedMcqModule(m.id)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                        selectedMcqModule === m.id
                                                            ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                                                            : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-cyan-500/30"
                                                    }`}
                                                >
                                                    {m.label}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => addAllMcqsInModule(getFilteredMcqBank())}
                                            className="px-3 py-1.5 bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Add All {getFilteredMcqBank().length}
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                        {getFilteredMcqBank().map((q, idx) => (
                                            <div key={q.id || idx} className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-cyan-500/30 rounded-2xl transition-all flex flex-col gap-2">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <span className="text-[10px] font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md uppercase mr-2">
                                                            {q.topic || 'Python'}
                                                        </span>
                                                        <p className="text-sm font-bold text-[var(--text-primary)] mt-1 whitespace-pre-line">
                                                            {q.question}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => addMcqFromBank(q)}
                                                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1 shrink-0"
                                                    >
                                                        <Plus size={14} /> Add
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    {q.options.map((opt, oi) => (
                                                        <div key={oi} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border ${oi === q.correct ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold' : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}>
                                                            {String.fromCharCode(65 + oi)}. {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI GENERATOR MODE */}
                            {mcqMode === "ai" && (
                                <div className="bg-gradient-to-br from-violet-500/10 to-transparent p-6 rounded-2xl border border-violet-500/20">
                                    <h3 className="font-bold flex items-center gap-2 mb-4"><Brain size={18} className="text-violet-400" /> AI MCQ Generation</h3>
                                    <div className="flex gap-2">
                                        <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} type="text" placeholder="e.g. Python Loops, OOPs" className="flex-1 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-violet-500 outline-none text-sm" />
                                        <input type="number" min="1" max="15" value={aiCount} onChange={(e) => setAiCount(e.target.value)} className="w-20 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center focus:border-violet-500 text-sm" />
                                        <button onClick={() => handleAiGenerate('mcq')} disabled={isGenerating} className="px-6 rounded-lg bg-violet-600 text-white font-bold hover:bg-violet-700 disabled:opacity-50 text-sm">Generate</button>
                                    </div>
                                </div>
                            )}

                            {/* MANUAL ADD MODE */}
                            {mcqMode === "manual" && (
                                <div>
                                    <h3 className="font-bold flex items-center gap-2 mb-4"><Edit size={18} className="text-cyan-400" /> Manual Add MCQ</h3>
                                    <textarea value={mcqForm.question} onChange={e => setMcqForm({ ...mcqForm, question: e.target.value })} placeholder="Question details..." className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:border-cyan-500 outline-none h-28 resize-none mb-4 text-sm" />
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        {mcqForm.options.map((opt, i) => (
                                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${mcqForm.correct === i ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'}`}>
                                                <input type="radio" name="mcqCorrect" checked={mcqForm.correct === i} onChange={() => setMcqForm({ ...mcqForm, correct: i })} className="accent-emerald-500" />
                                                <input value={opt} onChange={(e) => { const n = [...mcqForm.options]; n[i] = e.target.value; setMcqForm({ ...mcqForm, options: n }) }} placeholder={`Option ${i + 1}`} className="bg-transparent outline-none w-full text-sm" />
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={addMcq} className="w-full py-3 bg-[var(--bg-secondary)] border border-cyan-500/30 text-cyan-400 rounded-xl font-bold hover:bg-cyan-500/10 transition-colors">Add Manually</button>
                                </div>
                            )}

                            <button onClick={() => setStep(2)} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-black rounded-xl hover:scale-[1.02] flex items-center justify-center gap-2 mt-8">Proceed to Coding <ArrowRight size={20} /></button>
                        </div>
                        <div className="lg:col-span-5">
                            <QuestionList questions={mcqs} deleteQuestion={deleteQuestion} title="Added MCQs" />
                        </div>
                    </div>
                )}

                {/* STEP 2: CODING */}
                {step === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
                        <div className="lg:col-span-7 space-y-6 bg-[var(--glass-bg)] p-8 rounded-3xl border border-[var(--border-color)] shadow-xl">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <h2 className="text-2xl font-black flex items-center gap-3 text-[var(--text-primary)]">
                                    <Code className="text-pink-400" /> Coding Section
                                </h2>
                                {/* Mode Selector Switch */}
                                <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)]">
                                    <button
                                        onClick={() => setCodingMode("bank")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            codingMode === "bank" ? "bg-pink-500 text-white shadow-md" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        <Layers size={14} /> Question Bank (25)
                                    </button>
                                    <button
                                        onClick={() => setCodingMode("ai")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            codingMode === "ai" ? "bg-violet-600 text-white shadow-md" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        <Brain size={14} /> AI Generator
                                    </button>
                                    <button
                                        onClick={() => setCodingMode("manual")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            codingMode === "manual" ? "bg-emerald-600 text-white shadow-md" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        <Edit size={14} /> Manual Add
                                    </button>
                                </div>
                            </div>

                            {/* CODING QUESTION BANK MODE */}
                            {codingMode === "bank" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                            {[
                                                { id: "all", label: "All Modules (25)" },
                                                { id: "m1", label: "Mod 1: Intro (5)" },
                                                { id: "m2", label: "Mod 2: Variables (10)" },
                                                { id: "m3", label: "Mod 3: Data Types (10)" }
                                            ].map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setSelectedCodingModule(m.id)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                        selectedCodingModule === m.id
                                                            ? "bg-pink-500/20 text-pink-400 border-pink-500/40"
                                                            : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-pink-500/30"
                                                    }`}
                                                >
                                                    {m.label}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => addAllCodingInModule(getFilteredCodingBank())}
                                            className="px-3 py-1.5 bg-pink-500/15 text-pink-400 border border-pink-500/30 hover:bg-pink-500/25 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Add All {getFilteredCodingBank().length}
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                        {getFilteredCodingBank().map((q, idx) => (
                                            <div key={q.id || idx} className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-pink-500/30 rounded-2xl transition-all flex flex-col gap-2">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <span className="text-[10px] font-extrabold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md uppercase mr-2">
                                                            {q.module}
                                                        </span>
                                                        <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">
                                                            {q.title}
                                                        </h4>
                                                        <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                                                            {q.description}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => addCodingFromBank(q)}
                                                        className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1 shrink-0"
                                                    >
                                                        <Plus size={14} /> Add
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mt-1 font-mono">
                                                    <span>{q.testCases?.length || 1} Test Case(s)</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{q.difficulty}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI GENERATOR MODE */}
                            {codingMode === "ai" && (
                                <div className="bg-gradient-to-br from-violet-500/10 to-transparent p-6 rounded-2xl border border-violet-500/20">
                                    <h3 className="font-bold flex items-center gap-2 mb-4"><Brain size={18} className="text-violet-400" /> AI Coding Problem Generation</h3>
                                    <div className="flex gap-2">
                                        <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} type="text" placeholder="e.g. Dynamic Programming, Recursion" className="flex-1 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-violet-500 outline-none text-sm" />
                                        <input type="number" min="1" max="5" value={aiCount} onChange={(e) => setAiCount(e.target.value)} className="w-20 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center focus:border-violet-500 text-sm" />
                                        <button onClick={() => handleAiGenerate('coding')} disabled={isGenerating} className="px-6 rounded-lg bg-violet-600 text-white font-bold hover:bg-violet-700 disabled:opacity-50 text-sm">Generate</button>
                                    </div>
                                </div>
                            )}

                            {/* MANUAL ADD MODE */}
                            {codingMode === "manual" && (
                                <div>
                                    <h3 className="font-bold flex items-center gap-2 mb-4"><Edit size={18} className="text-pink-400" /> Manual Add Coding Problem</h3>
                                    <textarea value={codingForm.question} onChange={e => setCodingForm({ ...codingForm, question: e.target.value })} placeholder="Problem statement..." className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:border-pink-500 outline-none h-24 resize-none mb-3 text-sm" />
                                    <textarea value={codingForm.starterCode} onChange={e => setCodingForm({ ...codingForm, starterCode: e.target.value })} placeholder="Starter Code Template... (e.g. print('Hello'))" className="w-full p-4 bg-black/50 font-mono text-sm border border-[var(--border-color)] rounded-xl focus:border-pink-500 text-amber-500 outline-none h-24 mb-3" />

                                    <div className="space-y-3 mb-4">
                                        {codingForm.testCases.map((tc, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input value={tc.input} onChange={e => { const n = [...codingForm.testCases]; n[idx].input = e.target.value; setCodingForm({ ...codingForm, testCases: n }); }} placeholder="Input (stdin)" className="flex-1 p-2 bg-[var(--bg-secondary)] font-mono text-sm rounded border border-[var(--border-color)] outline-none" />
                                                <input value={tc.expectedOutput} onChange={e => { const n = [...codingForm.testCases]; n[idx].expectedOutput = e.target.value; setCodingForm({ ...codingForm, testCases: n }); }} placeholder="Output (stdout)" className="flex-1 p-2 bg-[var(--bg-secondary)] font-mono text-sm rounded border border-[var(--border-color)] outline-none" />
                                            </div>
                                        ))}
                                        <button onClick={() => setCodingForm({ ...codingForm, testCases: [...codingForm.testCases, { input: "", expectedOutput: "" }] })} className="text-xs text-pink-400 hover:text-pink-300 font-bold px-1">+ Add Test Case</button>
                                    </div>
                                    <button onClick={addCodingQ} className="w-full py-3 bg-[var(--bg-secondary)] border border-pink-500/30 text-pink-400 rounded-xl font-bold hover:bg-pink-500/10 transition-colors">Add Manually</button>
                                </div>
                            )}

                            <button onClick={() => setStep(3)} className="w-full py-4 bg-gradient-to-r from-pink-500 to-amber-500 text-white font-black rounded-xl hover:scale-[1.02] flex items-center justify-center gap-2 mt-8">Proceed to Verify <ArrowRight size={20} /></button>
                        </div>
                        <div className="lg:col-span-5">
                            <QuestionList questions={codings} deleteQuestion={deleteQuestion} title="Added Coding Problems" />
                        </div>
                    </div>
                )}

                {/* STEP 3: VERIFY AND TEST */}
                {step === 3 && (
                    <div className="bg-[var(--glass-bg)] p-8 rounded-3xl border border-[var(--border-color)] shadow-xl animate-fade-in-up">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-color)]">
                            <div>
                                <h2 className="text-3xl font-black flex items-center gap-3 text-[var(--text-primary)]"><CheckCircle className="text-amber-400" /> Verify Coding Logic</h2>
                                <p className="text-[var(--text-secondary)] mt-2">Before publishing, test the generated code challenges yourself to make sure they are solvable.</p>
                            </div>
                            <button onClick={() => setStep(4)} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl hover:scale-105 transition-all">Go to Publish</button>
                        </div>

                        {codings.length === 0 ? (
                            <div className="text-center py-20 text-[var(--text-muted)]">No coding questions added. You can skip this step.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {codings.map((cq, i) => (
                                    <div key={cq.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl hover:border-amber-500/40 transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="font-bold text-amber-500 mb-2">Problem {i + 1}</div>
                                            <p className="line-clamp-3 text-[var(--text-primary)] mb-4">{cq.question}</p>
                                        </div>
                                        <button onClick={() => { setVerifyingQ(cq); setTeacherCode(cq.starterCode || "# Write code here\n"); setVerifyResults([]); }} className="w-full py-2 bg-amber-500/10 text-amber-500 rounded-xl font-bold hover:bg-amber-500/20 flex items-center justify-center gap-2"><Code size={16} /> Load Editor & Verify</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 4: PUBLISH */}
                {step === 4 && (
                    <div className="max-w-3xl mx-auto bg-[var(--glass-bg)] p-8 rounded-3xl border border-[var(--border-color)] shadow-xl animate-fade-in-up">
                        <h2 className="text-3xl font-black flex items-center gap-3 text-[var(--text-primary)] mb-8 pb-4 border-b border-[var(--border-color)]"><Award className="text-emerald-400" /> Publish Exam</h2>

                        <div className="mb-6">
                            <label className="text-sm text-[var(--text-secondary)] block mb-2 font-bold">Exam Title</label>
                            <input value={quizTitle} onChange={e => setQuizTitle(e.target.value)} className="w-full p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xl font-bold focus:border-emerald-500 outline-none" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                <label className="text-sm text-[var(--text-secondary)] font-bold block mb-2">Total Questions</label>
                                <div className="text-3xl font-black text-[var(--text-primary)]">{questions.length}</div>
                            </div>
                            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                <label className="text-sm text-[var(--text-secondary)] font-bold block mb-2">Estimated Time Limitation (mins)</label>
                                <input type="number" value={settings.timeLimit} onChange={e => setSettings({ ...settings, timeLimit: e.target.value })} className="w-full p-2 bg-[var(--glass-bg)] font-bold text-lg rounded outline-none border border-[var(--border-color)]" />
                            </div>
                            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                <label className="text-sm text-[var(--text-secondary)] font-bold block mb-2">Negative Marking</label>
                                <input type="number" step="0.25" value={settings.negativeMarking} onChange={e => setSettings({ ...settings, negativeMarking: e.target.value })} className="w-full p-2 bg-[var(--glass-bg)] font-bold text-lg rounded outline-none border border-[var(--border-color)]" />
                            </div>
                            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                                <label className="text-sm text-[var(--text-secondary)] font-bold">Secure Browser Mode</label>
                                <input type="checkbox" checked={settings.secureMode} onChange={e => setSettings({ ...settings, secureMode: e.target.checked })} className="w-6 h-6 accent-emerald-500" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => publishExam('draft')} disabled={isSaving} className="flex-1 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--glass-bg)] flex items-center justify-center gap-2"><Save size={20} /> Save Draft</button>
                            <button onClick={() => publishExam('published')} disabled={isSaving} className="flex-[2] py-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-[var(--text-primary)] font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"><Award size={20} /> Publish Exam Live</button>
                        </div>
                    </div>
                )}
            </div>

            {/* VERIFICATION MODAL OVERLAY - RICH CODESPIRIT EDITOR */}
            {verifyingQ && step === 3 && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 flex flex-col backdrop-blur-md animate-fade-in">
                    {/* Header */}
                    <div className="px-6 py-4 flex justify-between items-center bg-slate-900 border-b border-slate-800">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setVerifyingQ(null)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Code className="text-emerald-400" size={20} /> CodeSpirit Verification Editor
                                </h2>
                                <p className="text-xs text-slate-400">{verifyingQ.title || "Coding Challenge Verification"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <select value={teacherLang} onChange={e => setTeacherLang(e.target.value)} className="bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 outline-none">
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                            </select>
                            <button onClick={verifyCodeForQuestion} disabled={isRunning} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2">
                                <Play size={16} className="fill-current" /> {isRunning ? "Running Test Cases..." : "Run Asserts & Test Code"}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                        {/* Left Column: Problem & Assert Results */}
                        <div className="lg:col-span-5 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto space-y-6">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Problem Statement</h3>
                                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-800/50 p-4 rounded-xl border border-slate-800">{verifyingQ.question}</p>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                                    <span>Test Case Assertions</span>
                                    {verifyResults.length > 0 && (
                                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${verifyResults.every(r => r.pass) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {verifyResults.filter(r => r.pass).length} / {verifyResults.length} Passed
                                        </span>
                                    )}
                                </h3>

                                {verifyResults.length === 0 ? (
                                    <div className="space-y-3">
                                        {verifyingQ.testCases && verifyingQ.testCases.map((tc, idx) => (
                                            <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-800/30 space-y-2">
                                                <div className="font-bold text-xs text-cyan-400">Test Case {idx + 1} (Pending)</div>
                                                <div className="text-xs text-slate-400 space-y-1 font-mono">
                                                    <div><span className="text-slate-500">Input:</span> {tc.input || "(None)"}</div>
                                                    <div><span className="text-slate-500">Expected:</span> <span className="text-emerald-400">{tc.expectedOutput || tc.output || "N/A"}</span></div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-slate-500 text-xs italic text-center py-2">Click "Run Asserts & Test Code" to verify solution against test cases.</div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {verifyResults.map((r, i) => (
                                            <div key={i} className={`p-4 rounded-xl border transition-all ${r.pass ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-red-500/40 bg-red-500/10'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {r.pass ? <CheckCircle2 size={18} className="text-emerald-400" /> : <X size={18} className="text-red-400" />}
                                                        <span className={`font-bold text-xs ${r.pass ? 'text-emerald-400' : 'text-red-400'}`}>Test Case {i + 1}: {r.pass ? "Passed" : "Failed"}</span>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-300 space-y-1 font-mono">
                                                    <div><span className="text-slate-500">Input:</span> {r.input}</div>
                                                    <div><span className="text-slate-500">Expected:</span> <span className="text-emerald-400">{r.expected}</span></div>
                                                    <div><span className="text-slate-500">Got:</span> <span className={r.pass ? "text-emerald-400" : "text-red-400 font-bold"}>{r.actual || "(No output)"}</span></div>
                                                    {r.error && <div className="text-red-400 text-xs mt-2 bg-red-900/40 p-2 rounded border border-red-500/30 overflow-x-auto">{r.error}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Code Editor */}
                        <div className="lg:col-span-7 h-full flex flex-col bg-[#1e1e1e]">
                            <div className="px-4 py-2 bg-[#252526] border-b border-[#333] flex items-center justify-between text-xs text-slate-400 font-mono">
                                <span>Code Editor (Solution Verification)</span>
                                <span>{teacherLang.toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                                <Editor
                                    height="100%"
                                    language={teacherLang}
                                    theme="vs-dark"
                                    value={teacherCode}
                                    onChange={v => setTeacherCode(v)}
                                    options={{
                                        fontSize: 15,
                                        fontFamily: "'Fira Code', 'Consolas', monospace",
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        padding: { top: 12, bottom: 12 }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const QuestionList = ({ questions, deleteQuestion, title }) => (
    <div className="bg-[var(--bg-secondary)] rounded-3xl p-6 border border-[var(--border-color)] shadow-inner h-[80vh] overflow-y-auto">
        <h3 className="font-bold text-xl mb-4 text-[var(--text-primary)]">{title} ({questions.length})</h3>
        {questions.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] mt-10 opacity-60">No items added yet</div>
        ) : (
            <div className="space-y-3">
                {questions.map((q, i) => (
                    <div key={q.id} className="bg-[var(--glass-bg)] border border-[var(--border-color)] p-4 rounded-xl flex justify-between gap-4 group">
                        <div className="flex-1">
                            <span className="font-bold text-cyan-400 mr-2">Q{i + 1}:</span>
                            <span className="text-[var(--text-primary)] text-sm">{q.question}</span>
                            {q.type === 'coding' ? (
                                <div className="text-xs font-mono text-pink-400 mt-2 p-2 bg-black/30 rounded inline-block">{q.testCases?.length} Test Cases configured</div>
                            ) : (
                                <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-[var(--text-secondary)]">
                                    {q.options?.map((opt, oIdx) => (
                                        <div key={oIdx} className={q.correct === oIdx ? 'text-emerald-400 font-bold' : ''}>• {opt}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={() => deleteQuestion(q.id)} className="text-red-500 opacity-50 hover:opacity-100 hover:bg-red-500/10 p-2 h-max rounded-lg"><Trash2 size={16} /></button>
                    </div>
                ))}
            </div>
        )}
    </div>
);
