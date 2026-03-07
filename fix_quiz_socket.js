const fs = require('fs');
const fp = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Quiz.jsx';
let c = fs.readFileSync(fp, 'utf8');

// 1. Add socket import after API_BASE import
c = c.replace(
    `import { API_BASE } from "../config";`,
    `import { API_BASE } from "../config";\nimport { connectSocket, getSocket } from "../services/groupAPI";`
);

// 2. Patch startExam to emit quiz:join
const oldStart = `    const startExam = () => {
        if (!joinedQuiz || joinedQuiz.questions.length === 0) {
            alert("No quiz joined or no questions available!");
            return;
        }
        setTimeLeft(joinedQuiz.settings.timeLimit * 60);
        setExamStarted(true);
        setExamSubmitted(false);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setShowResult(false);
    };`;

const newStart = `    const startExam = () => {
        if (!joinedQuiz || joinedQuiz.questions.length === 0) {
            alert("No quiz joined or no questions available!");
            return;
        }
        setTimeLeft(joinedQuiz.settings.timeLimit * 60);
        setExamStarted(true);
        setExamSubmitted(false);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setShowResult(false);

        // Notify teacher: student joined exam
        try {
            const socket = connectSocket();
            const doJoin = () => socket.emit('quiz:join', {
                quizCode: studentQuizCodeInput,
                studentId: user?._id || user?.id || 'guest',
                studentName: user?.name || 'Student'
            });
            if (socket.connected) doJoin(); else socket.once('connect', doJoin);
        } catch (e) { console.error('Socket join error', e); }
    };`;

if (c.includes(oldStart)) {
    c = c.replace(oldStart, newStart);
    console.log('✅ startExam patched');
} else {
    // Try a more forgiving match
    const idx = c.indexOf("const startExam = () => {");
    if (idx !== -1) {
        const endIdx = c.indexOf('\n    };', idx) + '\n    };'.length;
        const extracted = c.substring(idx, endIdx);
        console.log('startExam block found:', extracted.substring(0, 200));
    } else {
        console.log('❌ startExam not found');
    }
}

// 3. Patch submitExam to emit quiz:submitted + quiz:leave
// Find the fetch call inside submitExam and add socket emit after it
const oldSubmitFetch = `        try {
            await fetch(\`\${API_BASE}/quiz/submit\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    score: correctCount, // Sending correct count as score for backend calculation
                    totalQuestions: quizQs.length,
                    timeTaken: joinedQuiz.settings.timeLimit * 60 - timeLeft
                })
            });
            // Don't update local leaderboard state here, it will refresh on tab view
        } catch (e) {
            console.error("Submit error", e);
        }`;

const newSubmitFetch = `        try {
            await fetch(\`\${API_BASE}/quiz/submit\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    score: correctCount,
                    totalQuestions: quizQs.length,
                    timeTaken: joinedQuiz.settings.timeLimit * 60 - timeLeft
                })
            });

            // Notify teacher: student submitted result (real-time)
            try {
                const socket = getSocket();
                if (socket) {
                    const taken = joinedQuiz.settings.timeLimit * 60 - timeLeft;
                    socket.emit('quiz:submitted', {
                        quizCode: studentQuizCodeInput,
                        studentId: user?._id || user?.id || 'guest',
                        studentName: user?.name || 'Student',
                        score: Math.round(finalScore),
                        timeTaken: taken,
                        totalQuestions: quizQs.length
                    });
                    socket.emit('quiz:leave', {
                        quizCode: studentQuizCodeInput,
                        studentId: user?._id || user?.id || 'guest'
                    });
                }
            } catch (se) { console.error('Socket submit error', se); }
        } catch (e) {
            console.error("Submit error", e);
        }`;

if (c.includes(oldSubmitFetch)) {
    c = c.replace(oldSubmitFetch, newSubmitFetch);
    console.log('✅ submitExam fetch patched');
} else {
    const idx = c.indexOf('quiz/submit');
    console.log('quiz/submit found at index:', idx);
    if (idx !== -1) console.log('Context:', c.substring(idx - 50, idx + 200));
}

fs.writeFileSync(fp, c);
console.log('Done writing Quiz.jsx');
