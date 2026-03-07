const fs = require('fs');
const filepath = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Planner.jsx';
let c = fs.readFileSync(filepath, 'utf8');

c = c.replace(/''var\(--bg-primary\)''/g, "'var(--bg-primary)'");
c = c.replace(/''var\(--bg-secondary\)''/g, "'var(--bg-secondary)'");

fs.writeFileSync(filepath, c);
console.log('Fixed nested quotes');
