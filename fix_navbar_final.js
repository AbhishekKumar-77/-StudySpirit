const fs = require('fs');
const fp = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Quiz.jsx';
let c = fs.readFileSync(fp, 'utf8');

// Find and replace the navbar block directy using indexOf
const navComment = '            {/* Navbar */}';
const navStart = c.indexOf(navComment);
const navEnd = c.indexOf('</nav>', navStart) + '</nav>'.length;

console.log('Found nav at:', navStart, '-', navEnd);

const newNav = `            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--border-color)] px-8 py-4 transition-all duration-300">
                <div className="max-w-[1400px] mx-auto flex items-center">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-3 bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:border-cyan-500/50 hover:-translate-x-1"
                    >
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>
                </div>
            </nav>`;

c = c.substring(0, navStart) + newNav + c.substring(navEnd);
fs.writeFileSync(fp, c);
console.log('Done! Navbar cleaned.');
