const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/GroupMode.jsx', 'utf8');
content = content.replace(/bg-gradient([^"']+)text-\[var\(--text-primary\)\]/g, 'bg-gradient$1text-white');
content = content.replace(/shadow-xl shadow-emerald-500\/30 text-\[var\(--text-primary\)\]/g, 'shadow-xl shadow-emerald-500/30 text-white');
content = content.replace(/shadow-lg shadow-emerald-500\/30 text-\[var\(--text-primary\)\]/g, 'shadow-lg shadow-emerald-500/30 text-white');
content = content.replace(/shadow-lg shadow-violet-500\/30 text-\[var\(--text-primary\)\]/g, 'shadow-lg shadow-violet-500/30 text-white');
content = content.replace(/shadow-xl shadow-violet-500\/30 text-\[var\(--text-primary\)\]/g, 'shadow-xl shadow-violet-500/30 text-white');
fs.writeFileSync('frontend/src/pages/GroupMode.jsx', content);
