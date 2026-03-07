const fs = require('fs');
const fp = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Quiz.jsx';
let c = fs.readFileSync(fp, 'utf8');

// Remove the "StudySprint Quiz Pro" title and "Quiz Code" section from navbar
// Replace the entire inner navbar div content
const oldNav = `                <div className="max-w-[1400px] mx-auto flex items-center justify-between">`;
const newNav = `                <div className="max-w-[1400px] mx-auto flex items-center">`;
c = c.replace(oldNav, newNav);

// Remove the title div 
c = c.replace(`
                    <div className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3">
                        <Zap size={32} className="text-amber-500" />
                        StudySprint Quiz Pro
                    </div>

                    <div className="flex items-center gap-4 text-cyan-400  font-semibold">
                        <span>Quiz Code: <strong className="text-[var(--text-primary)]">{quizCode}</strong></span>
                        <button
                            onClick={generateQuizCode}
                            className="bg-cyan-500 /20 p-2 rounded-lg transition-all duration-300 hover:bg-cyan-500 /30"
                        >
                            <RotateCcw size={16} className="text-cyan-400 " />
                        </button>
                    </div>`, '');

// Fix back button styling
c = c.replace(
    `className="flex items-center gap-3 bg-cyan-500 /10 text-cyan-400  px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-cyan-500 /20 hover:-translate-x-1"`,
    `className="flex items-center gap-3 bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:border-cyan-500/50 hover:-translate-x-1"`
);

fs.writeFileSync(fp, c);
console.log('Navbar cleaned up');
