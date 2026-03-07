const fs = require('fs');
const filepath = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Planner.jsx';
let content = fs.readFileSync(filepath, 'utf8');

// Replace dark rgb container backgrounds
content = content.replace(/rgba\(\s*30\s*,\s*34\s*,\s*54\s*,\s*0\.[0-9]+\s*\)/g, "'var(--bg-secondary)'"); // the uncompleted task background
content = content.replace(/rgba\(\s*15\s*,\s*23\s*,\s*42\s*,\s*0\.[0-9]+\s*\)/g, "'var(--bg-primary)'");
content = content.replace(/background:\s*['"]#0a0e27['"]/g, "background: 'var(--bg-primary)'");
content = content.replace(/background:\s*['"]#1e2236['"]/g, "background: 'var(--bg-secondary)'");

// Replace hardcoded text colors 
content = content.replace(/color:\s*task\.completed\s*\?\s*['"]#[a-zA-Z0-9]+['"]\s*:\s*['"]white['"]/g, "color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)'");
content = content.replace(/color:\s*['"]white['"]/g, "color: 'var(--text-primary)'");
content = content.replace(/color:\s*['"]#8892a6['"]/g, "color: 'var(--text-secondary)'");
content = content.replace(/color:\s*['"]#a3b3c7['"]/g, "color: 'var(--text-muted)'");
content = content.replace(/color:\s*['"]#60a5fa['"]/g, "color: 'var(--neon-secondary)'");
content = content.replace(/color:\s*['"]#f59e0b['"]/g, "color: 'var(--neon-warning)'");

// Checkmarks background issue
content = content.replace(/<Check size=\{16\} color="white" \/>/g, '<Check size={16} color="#ffffff" />'); // Keep checkmark white inside green circle
content = content.replace(/background:\s*['"]linear-gradient\(135deg, #10b981, #059669\)['"]/g, "background: 'var(--neon-primary)'");


// Make sure there are no other rogue absolute whites remaining in color definition
content = content.replace(/color:\s*'white'/g, "color: 'var(--text-primary)'");

fs.writeFileSync(filepath, content);
console.log('Final Light Mode Polish applied');
