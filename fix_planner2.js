const fs = require('fs');
const filepath = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Planner.jsx';
let content = fs.readFileSync(filepath, 'utf8');

// Color replacement
content = content.replace(/color:\s*['"]white['"]/g, "color: 'var(--text-primary)'");
content = content.replace(/color:\s*['"]#8892a6['"]/g, "color: 'var(--text-secondary)'");
content = content.replace(/color:\s*['"]#a3b3c7['"]/g, "color: 'var(--text-muted)'");
content = content.replace(/rgba\(30,\s*34,\s*54,\s*0\.6\)/g, "var(--bg-secondary)");
content = content.replace(/rgba\(15,\s*23,\s*42,\s*0\.8\)/g, "var(--bg-primary)");
content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, "var(--border-color)");
// Extra specific fixes
content = content.replace(/background:\s*['"]#1e2236['"]/g, "background: 'var(--bg-secondary)'");
content = content.replace(/background:\s*['"]#0a0e27['"]/g, "background: 'var(--bg-primary)'");

// Responsiveness: convert dangerous min-widths to responsive constraints
content = content.replace(/minmax\(450px/g, "minmax(min(100%, 350px)");
content = content.replace(/minmax\(300px/g, "minmax(min(100%, 250px)");
content = content.replace(/minmax\(240px/g, "minmax(min(100%, 200px)");
content = content.replace(/minmax\(800px/g, "minmax(min(100%, 700px)");

// Convert big fixed widths
content = content.replace(/width:\s*['"]500px['"]/g, "width: 'min(100%, 500px)'");
content = content.replace(/width:\s*['"]400px['"]/g, "width: 'min(100%, 400px)'");

// Padding responsiveness
content = content.replace(/padding:\s*['"]40px 32px['"]/g, "padding: window.innerWidth < 768 ? '20px 16px' : '40px 32px'");
content = content.replace(/padding:\s*['"]20px 32px['"]/g, "padding: window.innerWidth < 768 ? '10px 16px' : '20px 32px'");

// Title font size responsive
content = content.replace(/fontSize:\s*['"]2\.5rem['"]/g, "fontSize: window.innerWidth < 768 ? '1.75rem' : '2.5rem'");
content = content.replace(/fontSize:\s*['"]3rem['"]/g, "fontSize: window.innerWidth < 768 ? '2rem' : '3rem'");

fs.writeFileSync(filepath, content);
console.log('Responsiveness + UI styles injected');
