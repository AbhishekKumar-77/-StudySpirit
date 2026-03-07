const fs = require('fs');
const filepath = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Quiz.jsx';
let content = fs.readFileSync(filepath, 'utf8');

// ─────────────────────────────────────────────
// 1. Fix broken Tailwind classes (missing numbers after cyan-)
// ─────────────────────────────────────────────
content = content.replace(/text-cyan-(?!\d)/g, 'text-cyan-400 ');
content = content.replace(/bg-cyan-(?!\d)/g, 'bg-cyan-500 ');
content = content.replace(/from-cyan-(?!\d)/g, 'from-cyan-500 ');
content = content.replace(/to-cyan-(?!\d)/g, 'to-cyan-400 ');
content = content.replace(/hover:bg-cyan-(?!\d)/g, 'hover:bg-cyan-500/30 ');

// ─────────────────────────────────────────────
// 2. Fix CSS typo: bg-[var(--bg-secondary)]lack/40
// ─────────────────────────────────────────────
content = content.replace(/bg-\[var\(--bg-secondary\)\]lack\/40/g, 'bg-[var(--bg-secondary)]/80');

// ─────────────────────────────────────────────
// 3. Fix full page dark gradient background to use CSS vars
// ─────────────────────────────────────────────
content = content.replace(
    'className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative pb-20 overflow-hidden font-sans text-[var(--text-primary)]"',
    'className="min-h-screen bg-[var(--bg-primary)] relative pb-20 overflow-hidden font-sans text-[var(--text-primary)]"'
);

// ─────────────────────────────────────────────
// 4. Add isGeneratingPractice state + loading UI
// ─────────────────────────────────────────────
// Insert state variable after the practiceFinished state
content = content.replace(
    'const [practiceFinished, setPracticeFinished] = useState(false); // To show results',
    'const [practiceFinished, setPracticeFinished] = useState(false); // To show results\n    const [isGeneratingPractice, setIsGeneratingPractice] = useState(false); // Loading for AI Practice'
);

// Wrap the generateAIQuestionsForPractice in loading state
content = content.replace(
    `    const generateAIQuestionsForPractice = async () => {
        if (!studentPracticeTopic.trim()) {
            alert("Please enter a topic for AI practice questions.");
            return;
        }

        try {`,
    `    const generateAIQuestionsForPractice = async () => {
        if (!studentPracticeTopic.trim()) {
            alert("Please enter a topic for AI practice questions.");
            return;
        }
        setIsGeneratingPractice(true);
        try {`
);

// Add finally block to reset loading state
content = content.replace(
    `        } catch (err) {
            console.error("Practice Gen Error:", err);
            alert("Error connecting to AI service.");
        }
    };

    const answerPractice`,
    `        } catch (err) {
            console.error("Practice Gen Error:", err);
            alert("Error connecting to AI service.");
        } finally {
            setIsGeneratingPractice(false);
        }
    };

    const answerPractice`
);

// Update the Generate button to show loading state
content = content.replace(
    `                                 <button
                                    onClick={generateAIQuestionsForPractice}
                                    className="px-12 py-5 bg-gradient-to-br from-cyan-500  to-indigo-600 text-[var(--text-primary)] font-bold rounded-2xl shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-105 hover:shadow-violet-500/50 flex items-center gap-3 mx-auto text-xl"
                                >
                                    <Sparkles size={24} /> Generate Questions
                                </button>`,
    `                                 <button
                                    onClick={generateAIQuestionsForPractice}
                                    disabled={isGeneratingPractice}
                                    className="px-12 py-5 bg-gradient-to-br from-cyan-500  to-indigo-600 text-[var(--text-primary)] font-bold rounded-2xl shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-105 hover:shadow-violet-500/50 flex items-center gap-3 mx-auto text-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    {isGeneratingPractice ? (
                                        <>
                                            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                            </svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <><Sparkles size={24} /> Generate Questions</>
                                    )}
                                </button>`
);

// ─────────────────────────────────────────────
// 5. Wire up Export Scorecard button
// ─────────────────────────────────────────────
content = content.replace(
    `                                <button className="px-6 py-3 bg-white/10 text-[var(--text-primary)] rounded-xl hover:bg-white/15 transition-all duration-300 flex items-center gap-2">
                                    <Download size={20} /> Export Scorecard
                                </button>`,
    `                                <button
                                    onClick={() => {
                                        if (!joinedQuiz) return;
                                        const lines = [
                                            \`StudySprint Quiz Scorecard\`,
                                            \`Quiz Code: \${studentQuizCodeInput}\`,
                                            \`Score: \${score}%\`,
                                            \`Correct: \${Object.values(userAnswers).filter((a, idx) => a === joinedQuiz.questions[idx]?.correct).length} / \${joinedQuiz.questions.length}\`,
                                            \`Difficulty: \${joinedQuiz.settings.difficulty}\`,
                                            \`Time Limit: \${joinedQuiz.settings.timeLimit} min\`,
                                            '',
                                            ...joinedQuiz.questions.map((q, idx) => {
                                                const ua = userAnswers[q.id];
                                                return \`Q\${idx+1}: \${q.question}\\nYour Answer: \${ua !== undefined ? q.options[ua] : 'Skipped'}\\nCorrect: \${q.options[q.correct]}\\nResult: \${ua === q.correct ? 'CORRECT' : ua === undefined ? 'SKIPPED' : 'WRONG'}\\n\`;
                                            })
                                        ];
                                        const blob = new Blob([lines.join('\\n')], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = \`scorecard_\${studentQuizCodeInput}_\${score}pct.txt\`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    className="px-6 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--border-color)] transition-all duration-300 flex items-center gap-2"
                                >
                                    <Download size={20} /> Export Scorecard
                                </button>`
);

// ─────────────────────────────────────────────
// 6. Light mode: fix hardcoded dark backgrounds
// ─────────────────────────────────────────────
// Fix dark absolute background blobs (remove dark hardcoded colors from blobs)
content = content.replace(
    'className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-cyan-/15 rounded-full blur-[100px] z-0 pointer-events-none"',
    'className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] z-0 pointer-events-none"'
);
content = content.replace(
    'className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-pink-500/15 rounded-full blur-[100px] z-0 pointer-events-none"',
    'className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[100px] z-0 pointer-events-none"'
);

// Fix hardcoded text colors in review section
content = content.replace(/text-emerald-300 font-bold/g, 'text-emerald-600 dark:text-emerald-300 font-bold');
content = content.replace(/text-red-300 font-bold/g, 'text-red-600 dark:text-red-300 font-bold');
content = content.replace(/text-emerald-100/g, 'text-emerald-700 dark:text-emerald-100');
content = content.replace(/text-red-100/g, 'text-red-700 dark:text-red-100');
content = content.replace(/text-red-200/g, 'text-red-700 dark:text-red-200');

// Also add scroll to top on mount
content = content.replace(
    '    const { user } = useApp();\n    const navigate = useNavigate();',
    `    const { user } = useApp();
    const navigate = useNavigate();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);`
);

fs.writeFileSync(filepath, content);
console.log('Quiz.jsx fully patched!');
