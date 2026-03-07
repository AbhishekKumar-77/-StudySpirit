const fs = require('fs');
const fp = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Quiz.jsx';
let c = fs.readFileSync(fp, 'utf8');

// After the Publish/Draft buttons, add quiz code display when saved
const oldPublishSection = `                        {activeTab === "teacher" && questions.length > 0 && (
                            <div className="flex gap-3">
                                <button onClick={() => saveQuiz("draft")} disabled={isSaving} className="px-6 py-4 bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-bold rounded-xl shadow border border-[var(--border-color)] transition-all duration-300 hover:bg-[var(--border-color)] flex items-center gap-2">
                                    <Edit size={20} /> Save as Draft
                                </button>
                                <button onClick={() => saveQuiz("published")} disabled={isSaving} className="px-8 py-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-[var(--text-primary)] font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70">
                                    <Share2 size={20} /> {isSaving ? "Saving..." : "Publish Exam"}
                                </button>
                            </div>
                        )}`;

const newPublishSection = `                        {activeTab === "teacher" && questions.length > 0 && (
                            <div className="flex flex-col items-end gap-3">
                                <div className="flex gap-3">
                                    <button onClick={() => saveQuiz("draft")} disabled={isSaving} className="px-6 py-4 bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-bold rounded-xl shadow border border-[var(--border-color)] transition-all duration-300 hover:bg-[var(--border-color)] flex items-center gap-2">
                                        <Edit size={20} /> Save as Draft
                                    </button>
                                    <button onClick={() => saveQuiz("published")} disabled={isSaving} className="px-8 py-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-[var(--text-primary)] font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70">
                                        <Share2 size={20} /> {isSaving ? "Saving..." : "Publish Exam"}
                                    </button>
                                </div>
                                {quizCode !== "SP1234" && (
                                    <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                        <span className="text-sm text-[var(--text-secondary)] font-medium">Quiz Code:</span>
                                        <span className="text-lg font-black text-emerald-500 tracking-widest">{quizCode}</span>
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(quizCode); alert("Quiz code copied!"); }}
                                            className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-all"
                                            title="Copy code"
                                        >
                                            <Copy size={14} className="text-emerald-500" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}`;

c = c.replace(oldPublishSection, newPublishSection);

fs.writeFileSync(fp, c);
console.log('Quiz code display moved to after publish');
