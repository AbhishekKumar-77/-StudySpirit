/**
 * Quiz Socket Events
 * Handles real-time quiz monitoring for teachers:
 * - quiz:join    → student enters exam room
 * - quiz:leave   → student exits/auto-submits
 * - quiz:submitted → student finished, broadcast score to teacher
 * - quiz:teacher:watch → teacher joins the monitor room for a quiz code
 */

// In-memory store: quizCode → Map<userId, {name, joinedAt, status, score}>
const activeQuizRooms = new Map();

module.exports = function registerQuizEvents(socket, io) {

    // ── STUDENT: joins exam room ──────────────────────────────────
    socket.on('quiz:join', (data) => {
        console.log('📥 quiz:join received:', JSON.stringify(data));
        const { studentId, studentName, registrationNumber } = data || {};
        const quizCode = (data?.quizCode || '').toUpperCase().trim();

        if (!quizCode || !studentId) {
            console.log('⚠️ quiz:join missing data — quizCode:', quizCode, 'studentId:', studentId);
            return;
        }

        socket.join(`quiz:${quizCode}`);

        if (!activeQuizRooms.has(quizCode)) {
            activeQuizRooms.set(quizCode, new Map());
        }

        activeQuizRooms.get(quizCode).set(studentId, {
            name: studentName || 'Student',
            registrationNumber: registrationNumber || '',
            joinedAt: Date.now(),
            status: 'active',
            score: null
        });

        // Notify teacher monitor room
        const students = Array.from(activeQuizRooms.get(quizCode).values());
        console.log(`📝 ${studentName} joined quiz room ${quizCode} — total ${students.length} students`);
        console.log(`📡 Emitting to teacher:${quizCode}`);

        io.to(`teacher:${quizCode}`).emit('quiz:students:update', {
            quizCode,
            count: students.length,
            students
        });
    });

    // ── STUDENT: leaves exam room ─────────────────────────────────
    socket.on('quiz:leave', (data) => {
        console.log('📤 quiz:leave received:', JSON.stringify(data));
        const { studentId } = data || {};
        const quizCode = (data?.quizCode || '').toUpperCase().trim();

        if (!quizCode || !studentId) return;

        if (activeQuizRooms.has(quizCode)) {
            activeQuizRooms.get(quizCode).delete(studentId);
            if (activeQuizRooms.get(quizCode).size === 0) {
                activeQuizRooms.delete(quizCode);
            }
        }

        const students = Array.from((activeQuizRooms.get(quizCode) || new Map()).values());
        io.to(`teacher:${quizCode}`).emit('quiz:students:update', {
            quizCode,
            count: students.length,
            students
        });
    });

    // ── STUDENT: submitted exam ───────────────────────────────────
    socket.on('quiz:submitted', (data) => {
        console.log('✅ quiz:submitted received:', JSON.stringify(data));
        const { studentId, studentName, registrationNumber, score, correctAnswers, timeTaken, totalQuestions } = data || {};
        const quizCode = (data?.quizCode || '').toUpperCase().trim();

        if (!quizCode || !studentId) return;

        if (!activeQuizRooms.has(quizCode)) {
            activeQuizRooms.set(quizCode, new Map());
        }

        const room = activeQuizRooms.get(quizCode);
        if (room.has(studentId)) {
            room.get(studentId).status = 'submitted';
            room.get(studentId).score = score;
            room.get(studentId).correctAnswers = correctAnswers;
            room.get(studentId).timeTaken = timeTaken;
            room.get(studentId).totalQuestions = totalQuestions;
        } else {
            room.set(studentId, {
                name: studentName || 'Student',
                registrationNumber: registrationNumber || '',
                status: 'submitted',
                score,
                correctAnswers,
                totalQuestions,
                timeTaken,
                joinedAt: Date.now()
            });
        }

        console.log(`✅ ${studentName} submitted quiz ${quizCode} with score ${score}%`);

        const students = Array.from(room.values());
        io.to(`teacher:${quizCode}`).emit('quiz:students:update', {
            quizCode,
            count: students.length,
            students
        });

        io.to(`teacher:${quizCode}`).emit('quiz:new:submission', {
            studentName: studentName || 'A student',
            registrationNumber: registrationNumber || '',
            score,
            correctAnswers,
            timeTaken,
            totalQuestions,
            quizCode
        });
    });

    // ── STUDENT: updating live progress ───────────────────────────
    socket.on('quiz:progress', (data) => {
        const { studentId, correctAnswers, totalQuestions } = data || {};
        const quizCode = (data?.quizCode || '').toUpperCase().trim();

        if (!quizCode || !studentId) return;

        if (activeQuizRooms.has(quizCode)) {
            const room = activeQuizRooms.get(quizCode);
            if (room.has(studentId)) {
                room.get(studentId).correctAnswers = correctAnswers;
                room.get(studentId).totalQuestions = totalQuestions;

                const students = Array.from(room.values());
                io.to(`teacher:${quizCode}`).emit('quiz:students:update', {
                    quizCode,
                    count: students.length,
                    students
                });
            }
        }
    });

    // ── TEACHER: starts watching a quiz room ─────────────────────
    socket.on('quiz:teacher:watch', (data) => {
        const quizCode = (data?.quizCode || '').toUpperCase().trim();
        if (!quizCode) return;

        socket.join(`teacher:${quizCode}`);
        console.log(`👁 Teacher monitoring quiz ${quizCode} (socket: ${socket.id})`);

        const students = Array.from((activeQuizRooms.get(quizCode) || new Map()).values());
        console.log(`👁 Sending current state: ${students.length} students`);

        socket.emit('quiz:students:update', {
            quizCode,
            count: students.length,
            students
        });
    });

    // ── TEACHER: stops watching ───────────────────────────────────
    socket.on('quiz:teacher:unwatch', (data) => {
        const quizCode = (data?.quizCode || '').toUpperCase().trim();
        if (quizCode) {
            socket.leave(`teacher:${quizCode}`);
            console.log(`👁 Teacher stopped monitoring ${quizCode}`);
        }
    });

    // ── GAMIFIED LIVE ARENA (Kahoot / Quizizz Mode) ───────────────
    socket.on('quiz:arena:start', (data) => {
        const quizCode = (data?.quizCode || '').toUpperCase().trim();
        if (!quizCode) return;
        console.log(`🎮 Live Arena started for quiz ${quizCode}`);
        io.to(`quiz:${quizCode}`).emit('quiz:arena:started', { quizCode });
    });

    socket.on('quiz:arena:next-question', (data) => {
        const quizCode = (data?.quizCode || '').toUpperCase().trim();
        const { questionIndex, questionData, timeLimit = 30 } = data || {};
        if (!quizCode) return;

        io.to(`quiz:${quizCode}`).emit('quiz:arena:question', {
            quizCode,
            questionIndex,
            questionData,
            timeLimit
        });
    });

    socket.on('quiz:arena:answer', (data) => {
        const quizCode = (data?.quizCode || '').toUpperCase().trim();
        const { studentId, studentName, answer, isCorrect, speedBonus = 0 } = data || {};
        if (!quizCode || !studentId) return;

        // Broadcast to teacher room
        io.to(`teacher:${quizCode}`).emit('quiz:arena:student:answered', {
            studentId,
            studentName,
            answer,
            isCorrect,
            speedBonus
        });
    });

    socket.on('quiz:arena:reveal', (data) => {
        const quizCode = (data?.quizCode || '').toUpperCase().trim();
        const { correctAnswer, leaderboard } = data || {};
        if (!quizCode) return;

        io.to(`quiz:${quizCode}`).emit('quiz:arena:revealed', {
            quizCode,
            correctAnswer,
            leaderboard
        });
    });

    // ── Debug: log all registered quiz events ────────────────────
    console.log(`🎯 Quiz socket events registered for socket: ${socket.id}`);
};
