const fs = require('fs');
const filepath = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/SoloMode.jsx';
let content = fs.readFileSync(filepath, 'utf8');

// Replace glass-card with explicit Tailwind utility classes
content = content.replace(/glass-card/g, "bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--card-hover)] hover:border-[var(--neon-primary)] hover:shadow-md backdrop-blur-xl transition-all");

// Fix some specific text components that might be too bright in light mode
// Actually, var(--text-primary) on white background is perfect (it's black in light mode).

// Weekly Activity bar chart text is too bright (e.g. text-cyan-400)
// We will leave text-cyan-500 or 600 which is more readable on light mode, but they are gradients.
// Maybe add a text wrapper or adjust nothing else, since the dark bg fixed it.

// One more check: make sure the cards inside "Platform Progress" are strictly picking up a light color
// Key lines like: p-4 bg-[var(--border-color)] -> border-color is very light indigo in light mode, which is fine!
// But wait! bg-[var(--border-color)] is rgba(99, 102, 241, 0.12). It will look beautiful.

// The Yearly Activity Graph
content = content.replace(/bg-red-500\/10/g, "bg-red-500/10 dark:bg-red-500/20");
content = content.replace(/bg-cyan-500\/10/g, "bg-cyan-500/10 dark:bg-cyan-500/20");
content = content.replace(/text-blue-400/g, "text-blue-600 dark:text-blue-400");
content = content.replace(/text-cyan-400/g, "text-cyan-600 dark:text-cyan-400");
content = content.replace(/text-emerald-400/g, "text-emerald-600 dark:text-emerald-400");
content = content.replace(/text-amber-400/g, "text-amber-600 dark:text-amber-400");
content = content.replace(/text-pink-400/g, "text-pink-600 dark:text-pink-400");
content = content.replace(/text-teal-400/g, "text-teal-600 dark:text-teal-400");

// The top tab bar buttons that had "border border-[var(--border-color)]" inside them
content = content.replace(/bg-\[var\(--glass-bg\)\] text-\[var\(--text-primary\)\] border border-\[var\(--border-color\)\] hover:bg-\[var\(--border-color\)\]\/60/g,
    "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--card-hover)]");

fs.writeFileSync(filepath, content);
console.log('Fixed glass-card hardcoded css bug');
