const fs = require('fs');
const fp = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Quiz.jsx';
let c = fs.readFileSync(fp, 'utf8');

// Fix the leaderboard stats row
const oldStats = `                                            <div className="flex gap-6 text-sm font-medium text-[var(--text-secondary)]">
                                                <span className="flex items-center gap-1.5"><Clock size={16} className="text-cyan-400" /> {player.time}</span>
                                                <span className="flex items-center gap-1.5"><Flame size={16} className="text-orange-500" /> {player.streak} Streak</span>
                                            </div>`;
const newStats = `                                            <div className="flex gap-4 text-sm font-medium text-[var(--text-secondary)] flex-wrap">
                                                <span className="flex items-center gap-1.5"><Clock size={16} className="text-cyan-600 dark:text-cyan-400" /> Best: {player.time}</span>
                                                <span className="flex items-center gap-1.5"><Flame size={16} className="text-orange-500" /> {player.streak} Streak</span>
                                                <span className="flex items-center gap-1.5"><Target size={16} className="text-indigo-500" /> {player.quizzesTaken || 0} Quizzes</span>
                                                <span className="flex items-center gap-1.5"><TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" /> Avg {player.averageScore || 0}%</span>
                                            </div>`;

if (c.includes('text-cyan-400" /> {player.time}')) {
    c = c.replace(oldStats, newStats);
    console.log('Leaderboard stats updated');
} else {
    // Try a simpler replacement
    c = c.replace(/<Clock size={16} className="text-cyan-400" \/> {player\.time}<\/span>/, `<Clock size={16} className="text-cyan-600 dark:text-cyan-400" /> Best: {player.time}</span>`);
    // Add extra stats after streak
    c = c.replace(
        `<span className="flex items-center gap-1.5"><Flame size={16} className="text-orange-500" /> {player.streak} Streak</span>
                                            </div>`,
        `<span className="flex items-center gap-1.5"><Flame size={16} className="text-orange-500" /> {player.streak} Streak</span>
                                                <span className="flex items-center gap-1.5"><Target size={16} className="text-indigo-500" /> {player.quizzesTaken || 0} Quizzes</span>
                                                <span className="flex items-center gap-1.5"><TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" /> Avg {player.averageScore || 0}%</span>
                                            </div>`
    );
    console.log('Leaderboard stats updated (fallback)');
}
fs.writeFileSync(fp, c);
