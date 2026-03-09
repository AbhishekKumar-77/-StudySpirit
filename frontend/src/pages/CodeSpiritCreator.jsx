import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { API_BASE } from "../config";
import Editor from "@monaco-editor/react";
import {
    ArrowLeft, ArrowRight, FilePlus, Code, CheckCircle, Award,
    Trash2, Brain, Save, Settings, Edit, Play, Check, X, BookOpen, Crown, ChevronRight
} from "lucide-react";

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
    const [teacherLang, setTeacherLang] = useState("javascript");
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
                alert(`${data.questions.length} ${type.toUpperCase()} Questions generated!!`);
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

    const addCodingQ = () => {
        if (!codingForm.question || codingForm.testCases.some((t) => !t.input || !t.expectedOutput)) {
            return alert("Fill all Coding fields securely including test cases!");
        }
        setQuestions([...questions, { ...codingForm, type: "coding", id: Date.now() }]);
        setCodingForm({ question: "", starterCode: "", testCases: [{ input: "", expectedOutput: "" }] });
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
                    body: JSON.stringify({ language: teacherLang, code: teacherCode, stdin: tc.input })
                });
                const result = await executeRes.json();
                const out = (result.run?.stdout || "").trim();
                const passed = out === (tc.expectedOutput || "").trim() && result.success && result.run?.code === 0;
                results.push({
                    pass: passed,
                    actual: out,
                    expected: tc.expectedOutput,
                    input: tc.input,
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
                setStep(4);
            } else { alert("Failed: " + data.message); }
        } catch (e) { }
        setIsSaving(false);
    };

    const mcqs = questions.filter(q => q.type !== "coding");
    const codings = questions.filter(q => q.type === "coding");

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] relative overflow-x-hidden">
            {/* Background Glow */}
            <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[100px] z-0 pointer-events-none"></div>

            <nav className="sticky top-0 z-50 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--border-color)] px-8 py-4">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <button onClick={() => navigate("/teacher-toolkit")} className="flex items-center gap-3 bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl text-sm font-semibold hover:border-cyan-500/50 hover:-translate-x-1 transition-all">
                        <ArrowLeft size={18} /> Back to Toolkit
                    </button>
                    <div className="text-xl font-black bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text">CodeSpirit Creator</div>
                </div>
            </nav>

            <div className="max-w-[1200px] mx-auto px-6 py-10 relative z-10">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
                        <div className="space-y-6 bg-[var(--glass-bg)] p-8 rounded-3xl border border-[var(--border-color)] shadow-xl">
                            <h2 className="text-3xl font-black flex items-center gap-3 text-[var(--text-primary)]"><BookOpen className="text-cyan-400" /> Objective MCQs</h2>

                            <div className="bg-gradient-to-br from-violet-500/10 to-transparent p-6 rounded-2xl border border-violet-500/20">
                                <h3 className="font-bold flex items-center gap-2 mb-4"><Brain size={18} className="text-violet-400" /> AI Generation</h3>
                                <div className="flex gap-2">
                                    <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} type="text" placeholder="e.g. Algorithms, Space Complexity" className="flex-1 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-violet-500 outline-none" />
                                    <input type="number" min="1" max="15" value={aiCount} onChange={(e) => setAiCount(e.target.value)} className="w-20 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center focus:border-violet-500" />
                                    <button onClick={() => handleAiGenerate('mcq')} disabled={isGenerating} className="px-6 rounded-lg bg-violet-600 text-white font-bold hover:bg-violet-700 disabled:opacity-50">Generate</button>
                                </div>
                            </div>

                            <hr className="border-[var(--border-color)]" />

                            <div>
                                <h3 className="font-bold flex items-center gap-2 mb-4"><Edit size={18} className="text-cyan-400" /> Manual Add</h3>
                                <textarea value={mcqForm.question} onChange={e => setMcqForm({ ...mcqForm, question: e.target.value })} placeholder="Question details..." className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:border-cyan-500 outline-none h-28 resize-none mb-4" />
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

                            <button onClick={() => setStep(2)} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-black rounded-xl hover:scale-[1.02] flex items-center justify-center gap-2 mt-8">Proceed to Coding <ArrowRight size={20} /></button>
                        </div>
                        <QuestionList questions={mcqs} deleteQuestion={deleteQuestion} title="Added MCQs" />
                    </div>
                )}

                {/* STEP 2: CODING */}
                {step === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
                        <div className="space-y-6 bg-[var(--glass-bg)] p-8 rounded-3xl border border-[var(--border-color)] shadow-xl">
                            <h2 className="text-3xl font-black flex items-center gap-3 text-[var(--text-primary)]"><Code className="text-pink-400" /> Coding Section</h2>

                            <div className="bg-gradient-to-br from-violet-500/10 to-transparent p-6 rounded-2xl border border-violet-500/20">
                                <h3 className="font-bold flex items-center gap-2 mb-4"><Brain size={18} className="text-violet-400" /> AI Generation</h3>
                                <div className="flex gap-2">
                                    <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} type="text" placeholder="e.g. Dynamic Programming" className="flex-1 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-violet-500 outline-none" />
                                    <input type="number" min="1" max="5" value={aiCount} onChange={(e) => setAiCount(e.target.value)} className="w-20 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center focus:border-violet-500" />
                                    <button onClick={() => handleAiGenerate('coding')} disabled={isGenerating} className="px-6 rounded-lg bg-violet-600 text-white font-bold hover:bg-violet-700 disabled:opacity-50">Generate</button>
                                </div>
                            </div>

                            <hr className="border-[var(--border-color)]" />

                            <div>
                                <h3 className="font-bold flex items-center gap-2 mb-4"><Edit size={18} className="text-pink-400" /> Manual Add</h3>
                                <textarea value={codingForm.question} onChange={e => setCodingForm({ ...codingForm, question: e.target.value })} placeholder="Problem statement..." className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:border-pink-500 outline-none h-24 resize-none mb-3" />
                                <textarea value={codingForm.starterCode} onChange={e => setCodingForm({ ...codingForm, starterCode: e.target.value })} placeholder="Starter Code Template... (e.g. function solve(input) {})" className="w-full p-4 bg-black/50 font-mono text-sm border border-[var(--border-color)] rounded-xl focus:border-pink-500 text-amber-500 outline-none h-24 mb-3" />

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

                            <button onClick={() => setStep(3)} className="w-full py-4 bg-gradient-to-r from-pink-500 to-amber-500 text-white font-black rounded-xl hover:scale-[1.02] flex items-center justify-center gap-2 mt-8">Proceed to Verify <ArrowRight size={20} /></button>
                        </div>
                        <QuestionList questions={codings} deleteQuestion={deleteQuestion} title="Added Coding Problems" />
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
                                        <button onClick={() => { setVerifyingQ(cq); setTeacherCode(cq.starterCode || ""); setVerifyResults([]); }} className="w-full py-2 bg-amber-500/10 text-amber-500 rounded-xl font-bold hover:bg-amber-500/20 flex items-center justify-center gap-2"><Code size={16} /> Load Editor & Verify</button>
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

            {/* VERIFICATION MODAL OVERLAY */}
            {verifyingQ && step === 3 && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col backdrop-blur-sm animate-fade-in">
                    <div className="px-6 py-4 flex justify-between items-center bg-[#1e1e1e] border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setVerifyingQ(null)} className="text-white/50 hover:text-white"><X size={24} /></button>
                            <h2 className="text-xl font-bold text-white">Verification Engine</h2>
                        </div>
                        <div className="flex gap-3">
                            <select value={teacherLang} onChange={e => setTeacherLang(e.target.value)} className="bg-black/50 text-white p-2 rounded border border-white/10 outline-none">
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                            </select>
                            <button onClick={verifyCodeForQuestion} disabled={isRunning} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-2">
                                <Play size={16} /> {isRunning ? "Testing..." : "Run Asserts"}
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden grid grid-cols-[1fr_350px]">
                        <div className="h-full">
                            <Editor height="100%" language={teacherLang} theme="vs-dark" value={teacherCode} onChange={v => setTeacherCode(v)} options={{ fontSize: 16 }} />
                        </div>
                        <div className="bg-[#121212] overflow-y-auto p-5 border-l border-white/5">
                            <h3 className="text-white/80 font-bold mb-4">Problem Statement:</h3>
                            <p className="text-sm text-white/60 mb-8 whitespace-pre-wrap">{verifyingQ.question}</p>

                            <h3 className="text-white/80 font-bold mb-4">Test Cases Executed:</h3>
                            {verifyResults.length === 0 ? (
                                <div className="text-white/30 text-sm italic">Run code to see test results</div>
                            ) : (
                                <div className="space-y-4">
                                    {verifyResults.map((r, i) => (
                                        <div key={i} className={`p-4 rounded border ${r.pass ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                {r.pass ? <Check size={18} className="text-emerald-500" /> : <X size={18} className="text-red-500" />}
                                                <span className={`font-bold text-sm ${r.pass ? 'text-emerald-500' : 'text-red-500'}`}>Test Case {i + 1}</span>
                                            </div>
                                            <div className="text-xs text-white/50 space-y-1">
                                                <div><span className="opacity-60">Input:</span> {r.input}</div>
                                                <div><span className="opacity-60">Expected:</span> {r.expected}</div>
                                                <div><span className="opacity-60">Your Output:</span> {r.actual}</div>
                                                {r.error && <div className="text-red-400 mt-2 bg-red-900/20 p-2 rounded overflow-x-auto">{r.error}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                    {q.options.map((opt, oIdx) => (
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
