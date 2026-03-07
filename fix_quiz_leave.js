const fs = require('fs');
let c = fs.readFileSync('c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Quiz.jsx', 'utf8');

const sIdx = c.indexOf('        return () => {\r\n                document.removeEventListener("visibilitychange"');
if (sIdx !== -1) {
    const endStr = '                if (document.fullscreenElement) {\r\n                    document.exitFullscreen().catch(() => { });\r\n                }\r\n            };';
    const eIdx = c.indexOf(endStr, sIdx);
    if (eIdx !== -1) {
        c = c.substring(0, eIdx + endStr.length) + '\r\n\r\n                // Cleanup socket room if student leaves the page mid-exam\r\n                try {\r\n                    const socket = getSocket();\r\n                    if (socket) {\r\n                        socket.emit("quiz:leave", {\r\n                            quizCode: studentQuizCodeInput,\r\n                            studentId: user?._id || user?.id || "guest"\r\n                        });\r\n                    }\r\n                } catch(e) {}' + c.substring(eIdx + endStr.length);

        fs.writeFileSync('c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Quiz.jsx', c);
        console.log('Unmount emit added!');
    } else {
        console.log('End str not found');
    }
} else {
    console.log('Start index not found');
}
