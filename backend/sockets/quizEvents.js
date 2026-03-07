/**
 * Quiz Socket Events
 * Handles real-time quiz monitoring for teachers:
 * - quiz:join    → student enters exam room
 * - quiz:leave   → student exits/auto-submits
 * - quiz:submitted → student finished, broadcast score to teacher
 * - quiz:teacher:watch → teacher joins the monitor room for a quiz code
 */

// In-memory store: quizCode → { students: Map<userId, {name, joinedAt, status, score}> }
const activeQuizRooms = new Map();

module.exports = function registerQuizEvents(socket, io) {

    // ── STUDENT: joins exam room ──────────────────────────────────
    socket.on('quiz:join', ({ quizCode, studentId, studentName }) => {
        if (!quizCode || !studentId) return;

        const room = `quiz:${quizCode}`;
        socket.join(room);

        if (!activeQuizRooms.has(quizCode)) {
            activeQuizRooms.set(quizCode, new Map());
        }

        activeQuizRooms.get(quizCode).set(studentId, {
            name: studentName || 'Student',
            joinedAt: Date.now(),
            status: 'active',   // active | submitted
            score: null
        });

        // Notify teacher monitor room
        const students = Array.from(activeQuizRooms.get(quizCode).values());
        io.to(`teacher:${quizCode}`).emit('quiz:students:update', {
            quizCode,
            count: students.length,
            students
        });

        console.log(`📝 ${studentName} joined quiz room ${quizCode}`);
    });

    // ── STUDENT: leaves exam room (tab close / manual exit) ───────
    socket.on('quiz:leave', ({ quizCode, studentId }) => {
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
    socket.on('quiz:submitted', ({ quizCode, studentId, studentName, score, timeTaken, totalQuestions }) => {
        if (!quizCode || !studentId) return;

        if (activeQuizRooms.has(quizCode)) {
            const room = activeQuizRooms.get(quizCode);
            if (room.has(studentId)) {
                room.get(studentId).status = 'submitted';
                room.get(studentId).score = score;
                room.get(studentId).timeTaken = timeTaken;
            } else {
                // Add if not joined already (e.g. quick submit)
                room.set(studentId, {
                    name: studentName || 'Student',
                    status: 'submitted',
                    score,
                    timeTaken,
                    joinedAt: Date.now()
                });
            }
        }

        console.log(`✅ ${studentName} submitted quiz ${quizCode} with score ${score}%`);

        // Push live leaderboard update to teacher monitor room
        const students = Array.from((activeQuizRooms.get(quizCode) || new Map()).values());
        io.to(`teacher:${quizCode}`).emit('quiz:students:update', {
            quizCode,
            count: students.length,
            students
        });

        // Also emit a "submission alert" to teacher
        io.to(`teacher:${quizCode}`).emit('quiz:new:submission', {
            studentName: studentName || 'A student',
            score,
            timeTaken,
            totalQuestions,
            quizCode
        });
    });

    // ── TEACHER: starts watching a quiz room ─────────────────────
    socket.on('quiz:teacher:watch', ({ quizCode }) => {
        if (!quizCode) return;

        socket.join(`teacher:${quizCode}`);
        console.log(`👁 Teacher monitoring quiz ${quizCode}`);

        // Send current state immediately
        const students = Array.from((activeQuizRooms.get(quizCode) || new Map()).values());
        socket.emit('quiz:students:update', {
            quizCode,
            count: students.length,
            students
        });
    });

    // ── TEACHER: stops watching ───────────────────────────────────
    socket.on('quiz:teacher:unwatch', ({ quizCode }) => {
        if (quizCode) socket.leave(`teacher:${quizCode}`);
    });
};
