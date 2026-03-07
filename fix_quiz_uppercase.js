const fs = require('fs');
let c = fs.readFileSync('c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Quiz.jsx', 'utf8');

// ── FIX: Uppercase quizCode in all socket emits ──
// There are 4 occurrences of `quizCode: studentQuizCodeInput`
// Replace them all with uppercased version
const old1 = 'quizCode: studentQuizCodeInput,';
const new1 = 'quizCode: (studentQuizCodeInput || "").toUpperCase().trim(),';

let count = 0;
while (c.includes(old1)) {
    c = c.replace(old1, new1);
    count++;
}
console.log(`Replaced ${count} quizCode occurrences`);

// ── ADD: console.log after each socket emit for debugging ──
// After quiz:join emit (in joinQuiz)
if (!c.includes('console.log("📡 Socket quiz:join emitted"')) {
    c = c.replace(
        `if (socket.connected) doJoin(); else socket.once('connect', doJoin);\r\n                } catch (_e) {}`,
        `if (socket.connected) { doJoin(); console.log("📡 Socket quiz:join emitted (connected)"); } else { socket.once('connect', () => { doJoin(); console.log("📡 Socket quiz:join emitted (after connect)"); }); }\r\n                } catch (_e) { console.error("❌ Socket join error:", _e); }`
    );
    console.log('Added debug logs to joinQuiz');
}

// After quiz:join emit (in startExam)
if (c.includes('if (socket.connected) doJoin(); else socket.once(\'connect\', doJoin);')) {
    c = c.replace(
        `if (socket.connected) doJoin(); else socket.once('connect', doJoin);`,
        `if (socket.connected) { doJoin(); console.log("📡 Socket quiz:join emitted from startExam"); } else { socket.once('connect', () => { doJoin(); console.log("📡 Socket quiz:join emitted from startExam (after connect)"); }); }`
    );
    console.log('Added debug logs to startExam');
}

// After quiz:submitted emit
if (!c.includes('console.log("📡 Socket quiz:submitted emitted"')) {
    c = c.replace(
        `socket.emit('quiz:submitted', {`,
        `console.log("📡 Emitting quiz:submitted..."); socket.emit('quiz:submitted', {`
    );
    console.log('Added debug log to submitExam');
}

fs.writeFileSync('c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Quiz.jsx', c);
console.log('Done');
