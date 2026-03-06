const fs = require('fs');
const filepath = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/SoloMode.jsx';
let c = fs.readFileSync(filepath, 'utf8');

// Fix text-cyan without numbers
c = c.replace(/text-cyan-(?=[\" \/])/g, 'text-cyan-400');
c = c.replace(/bg-cyan-(?=[\" \/])/g, 'bg-cyan-500');

// Fix dark mode overrides causing light mode to fail
c = c.replace(/bg-\[var\(\-\-bg\-secondary\)\]lue-/g, 'bg-blue-');
c = c.replace(/bg-\[var\(\-\-bg\-secondary\)\]lack\//g, 'bg-black/');
c = c.replace(/min-h-screen bg-gradient-to-br    relative/g, 'min-h-screen bg-[var(--bg-primary)] relative transition-colors duration-300');

// Fix missing responsive grid configurations and flex wraps

c = c.replace(/className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8"/g, 'className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"');
c = c.replace(/className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8"/g, 'className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8"');
c = c.replace(/className="w-64 flex-shrink-0"/g, 'className="w-full lg:w-64 flex-shrink-0"');
c = c.replace(/className="flex gap-8"/g, 'className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full"');
c = c.replace(/className="flex-1 min-w-0"/g, 'className="flex-1 w-full min-w-0"');
c = c.replace(/className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"/g, 'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"');
c = c.replace(/className="grid grid-cols-3 gap-6"/g, 'className="grid grid-cols-1 md:grid-cols-3 gap-6"');
c = c.replace(/className="grid grid-cols-2 gap-3"/g, 'className="grid grid-cols-1 sm:grid-cols-2 gap-3"');
c = c.replace(/className="flex justify-between items-center mb-6"/g, 'className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0"');
c = c.replace(/className="flex items-center gap-4"/g, 'className="flex flex-col sm:flex-row items-start sm:items-center gap-4"');
c = c.replace(/className="flex items-center justify-between mb-8"/g, 'className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 sm:gap-0"');
c = c.replace(/className="flex items-center gap-6"/g, 'className="flex flex-wrap items-center gap-4 sm:gap-6"');
c = c.replace(/className="grid lg:grid-cols-3 gap-6"/g, 'className="grid grid-cols-1 lg:grid-cols-3 gap-6"');
c = c.replace(/className="absolute right-6 top-20 /g, 'className="absolute right-4 sm:right-6 top-20 z-[101] max-w-[90vw] ');

// Modal responsiveness
c = c.replace(/className="w-\[90%\]/g, 'className="w-[95%] sm:w-[90%]"');
c = c.replace(/w-\[400px\]/g, 'w-full sm:w-[400px]');
c = c.replace(/right-0 top-\[88px\] bottom-0/g, 'right-0 top-[88px] bottom-0 sm:right-4 sm:top-24 sm:bottom-4 h-[calc(100vh-88px)] sm:h-auto rounded-tl-2xl sm:rounded-2xl');

fs.writeFileSync(filepath, c);
console.log('Responsiveness and theming fixed.');
