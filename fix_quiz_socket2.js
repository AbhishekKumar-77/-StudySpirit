const fs = require('fs');
const fp = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Quiz.jsx';
let c = fs.readFileSync(fp, 'utf8');

// ── 1. Add socket import if not already added ──
if (!c.includes('connectSocket, getSocket')) {
    c = c.replace(
        `import { API_BASE } from "../config";`,
        `import { API_BASE } from "../config";\r\nimport { connectSocket, getSocket } from "../services/groupAPI";`
    );
    console.log('✅ Socket import added');
} else {
    console.log('⏭ Socket import already exists');
}

// ── 2. Patch startExam ──
// Find block using indexOf approach with CRLF
const startIdx = c.indexOf('    const startExam = () => {\r\n');
if (startIdx === -1) {
    console.log('❌ startExam not found');
} else {
    // Find the closing }; of startExam
    const closeIdx = c.indexOf('\r\n    };', startIdx) + '\r\n    };'.length;
    const block = c.substring(startIdx, closeIdx);

    if (!block.includes('quiz:join')) {
        const newBlock = block.replace(
            '        setShowResult(false);\r\n    };',
            `        setShowResult(false);\r\n\r\n        // Notify teacher: student joined exam\r\n        try {\r\n            const socket = connectSocket();\r\n            const doJoin = () => socket.emit('quiz:join', {\r\n                quizCode: studentQuizCodeInput,\r\n                studentId: user?._id || user?.id || 'guest',\r\n                studentName: user?.name || 'Student'\r\n            });\r\n            if (socket.connected) doJoin(); else socket.once('connect', doJoin);\r\n        } catch (e) { console.error('Socket join error', e); }\r\n    };`
        );
        c = c.substring(0, startIdx) + newBlock + c.substring(closeIdx);
        console.log('✅ startExam patched with quiz:join');
    } else {
        console.log('⏭ startExam already patched');
    }
}

// ── 3. Patch submitExam ──
const submitFetchIdx = c.indexOf("await fetch(`${API_BASE}/quiz/submit`");
if (submitFetchIdx === -1) {
    console.log('❌ submit fetch not found');
} else {
    // Find the end of the try/catch block containing submit fetch
    const tryStart = c.lastIndexOf('        try {\r\n', submitFetchIdx);
    const catchEnd = c.indexOf('\r\n        }', c.indexOf('} catch (e) {', submitFetchIdx)) + '\r\n        }'.length;
    const submitBlock = c.substring(tryStart, catchEnd);

    if (!submitBlock.includes('quiz:submitted')) {
        const newSubmitBlock = submitBlock.replace(
            `            // Don't update local leaderboard state here, it will refresh on tab view\r\n        } catch (e) {`,
            `            // Notify teacher: student submitted (real-time)\r\n            try {\r\n                const socket = getSocket();\r\n                if (socket) {\r\n                    const taken = (joinedQuiz.settings.timeLimit * 60) - timeLeft;\r\n                    socket.emit('quiz:submitted', {\r\n                        quizCode: studentQuizCodeInput,\r\n                        studentId: user?._id || user?.id || 'guest',\r\n                        studentName: user?.name || 'Student',\r\n                        score: Math.round(finalScore),\r\n                        timeTaken: taken,\r\n                        totalQuestions: quizQs.length\r\n                    });\r\n                    socket.emit('quiz:leave', {\r\n                        quizCode: studentQuizCodeInput,\r\n                        studentId: user?._id || user?.id || 'guest'\r\n                    });\r\n                }\r\n            } catch (se) { console.error('Socket submit error', se); }\r\n        } catch (e) {`
        );
        c = c.substring(0, tryStart) + newSubmitBlock + c.substring(catchEnd);
        console.log('✅ submitExam patched with quiz:submitted');
    } else {
        console.log('⏭ submitExam already patched');
    }
}

fs.writeFileSync(fp, c);
console.log('Done');
