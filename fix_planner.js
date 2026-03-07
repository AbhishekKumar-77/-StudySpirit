const fs = require('fs');
const filepath = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Planner.jsx';
let content = fs.readFileSync(filepath, 'utf8');

// Outermost background
content = content.replace(/background: focusMode[\s\S]*?100%\)',/g, "background: 'var(--bg-primary)',");

// Hardcoded background colors to CSS variables
content = content.replace(/rgba\(30,\s*34,\s*54,\s*0\.6\)/g, "var(--bg-secondary)");
content = content.replace(/rgba\(15,\s*23,\s*42,\s*0\.8\)/g, "var(--bg-primary)");

// Hardcoded text colors
content = content.replace(/color:\s*['"]white['"]/g, "color: 'var(--text-primary)'");
content = content.replace(/color:\s*['"]#8892a6['"]/g, "color: 'var(--text-secondary)'");
content = content.replace(/color:\s*['"]#a3b3c7['"]/g, "color: 'var(--text-muted)'");

// Hardcoded border colors
content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, "var(--border-color)");

// Grid layout spacing logic to be responsive (flex wrap instead of hard grid columns, or proper widths)
// Using responsive flex properties where we used display: flex across the board.
content = content.replace(/display:\s*['"]flex['"],\s*alignItems:\s*['"]center['"],\s*gap:\s*['"]24px['"],\s*flexWrap:\s*['"]wrap['"]/g, "display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', width: '100%', flexDirection: window.innerWidth < 768 ? 'column' : 'row'"); // Safe basic inline responsive attempt for main header stats

// We don't have direct access to tailwind classes if they are in style={}, but we can add className instead and remove style props where appropriate, or just keep it simple inline for light mode.
content = content.replace(/background:\s*['"]#1e2236['"]/g, "background: 'var(--bg-secondary)'");

fs.writeFileSync(filepath, content);
console.log('Fixed inline dark mode bugs in Planner');
