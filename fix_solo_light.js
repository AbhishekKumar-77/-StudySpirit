const fs = require('fs');
const filepath = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/SoloMode.jsx';
let content = fs.readFileSync(filepath, 'utf8');

// The Fullscreen Focus Mode Background
content = content.replace(/backgroundColor:\s*['"]#09090b['"]/g, "backgroundColor: 'var(--bg-primary)'");

// bg-white/5 -> empty/translucent bg, better use generic glass or border color
content = content.replace(/bg-white\/5/g, "bg-[var(--border-color)]");
content = content.replace(/bg-white\/10/g, "bg-[var(--glass-bg)] border border-[var(--border-color)]");
content = content.replace(/bg-white\/20/g, "bg-[var(--glass-bg)] border-2 border-[var(--border-color)]");

// Some buttons or text might be hardcoded as white
content = content.replace(/text-white\/50/g, "text-[var(--text-secondary)]");
content = content.replace(/text-white\/70/g, "text-[var(--text-muted)]");
content = content.replace(/text-white\/80/g, "text-[var(--text-primary)]");

// Fix generic typos from previous script
content = content.replace(/bg-\[var\(--bg-secondary\)\]lack\/80/g, "bg-black/80");
content = content.replace(/bg-\[var\(--bg-secondary\)\]lue-400/g, "bg-blue-400");
content = content.replace(/text-\[var\(--bg-secondary\)\]lue-400/g, "text-blue-400");

// Fix buttons text color which were "text-white"
// I don't recall exactly where text-white was, but let's replace exact Tailwind utilities:
content = content.replace(/text-white(?![\w\-\/])/g, "text-[var(--text-primary)]");

fs.writeFileSync(filepath, content);
console.log('Fixed inline focus mode background and white classes');
