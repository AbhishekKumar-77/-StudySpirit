const fs = require('fs');
const fp = 'c:/Users/abhis/Desktop/StudySpirit/frontend/src/pages/Quiz.jsx';
let c = fs.readFileSync(fp, 'utf8');

// ── FIX 1: Also emit quiz:join inside joinQuiz() after successful quiz fetch ──
// Find the joinQuiz function's success case
const joinSuccessOld = `                setJoinedQuiz({
                    questions: settings.randomizeQuestions ? [...data.quiz.questions].sort(() => Math.random() - 0.5) : data.quiz.questions,
                    settings: data.quiz.settings
                });
                setExamSubmitted(false);
                setUserAnswers({});
                setCurrentQuestionIndex(0);
                setShowResult(false);
                setIsReviewingAnswers(false);
                setWarnings(0);
                // Also update local quiz code display if needed, or just keep input`;

const joinSuccessNew = `                setJoinedQuiz({
                    questions: settings.randomizeQuestions ? [...data.quiz.questions].sort(() => Math.random() - 0.5) : data.quiz.questions,
                    settings: data.quiz.settings
                });
                setExamSubmitted(false);
                setUserAnswers({});
                setCurrentQuestionIndex(0);
                setShowResult(false);
                setIsReviewingAnswers(false);
                setWarnings(0);

                // Pre-connect socket so teacher sees student joining
                try {
                    const socket = connectSocket();
                    const doJoin = () => socket.emit('quiz:join', {
                        quizCode: studentQuizCodeInput,
                        studentId: user?._id || user?.id || 'guest',
                        studentName: user?.name || 'Student'
                    });
                    if (socket.connected) doJoin(); else socket.once('connect', doJoin);
                } catch (_e) {}
                // Also update local quiz code display if needed, or just keep input`;

if (c.includes(joinSuccessOld.replace(/\r\n/g, '\n').replace(/\r/g, '\n'))) {
    c = c.replace(joinSuccessOld, joinSuccessNew);
    console.log('✅ joinQuiz patched');
} else {
    // Try CRLF version
    const crlf = joinSuccessOld.replace(/\n/g, '\r\n');
    if (c.includes(crlf)) {
        c = c.replace(crlf, joinSuccessNew.replace(/\n/g, '\r\n'));
        console.log('✅ joinQuiz patched (CRLF)');
    } else {
        // Manual search
        const idx = c.indexOf('setIsReviewingAnswers(false);\r\n                setWarnings(0);\r\n                // Also update local quiz code display');
        if (idx !== -1) {
            const insert = `\r\n\r\n                // Pre-connect socket so teacher sees student joining\r\n                try {\r\n                    const socket = connectSocket();\r\n                    const doJoin = () => socket.emit('quiz:join', {\r\n                        quizCode: studentQuizCodeInput,\r\n                        studentId: user?._id || user?.id || 'guest',\r\n                        studentName: user?.name || 'Student'\r\n                    });\r\n                    if (socket.connected) doJoin(); else socket.once('connect', doJoin);\r\n                } catch (_e) {}`;
            c = c.substring(0, idx + 'setIsReviewingAnswers(false);\r\n                setWarnings(0);'.length) + insert + c.substring(idx + 'setIsReviewingAnswers(false);\r\n                setWarnings(0);'.length);
            console.log('✅ joinQuiz patched (manual idx)');
        } else {
            console.log('❌ joinQuiz pattern not found');
            // Show context
            const i2 = c.indexOf('setIsReviewingAnswers(false)');
            if (i2 !== -1) console.log('Context:', JSON.stringify(c.substring(i2, i2 + 150)));
        }
    }
}

// ── FIX 2: Add console.log to quiz:submitted so we can debug ──
// Already present, just verify

// ── FIX 3: Make sure the quiz:join in startExam also runs even if already joined ──
// This is a duplicate of joinQuiz, which is fine (idempotent on server side)

fs.writeFileSync(fp, c);
console.log('Done');
