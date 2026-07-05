/**
 * Socket.io Events — Study Rooms
 * Handles room join/leave, participant tracking, pomodoro sync, and room chat
 */

module.exports = function registerRoomEvents(socket, io, roomParticipants) {
    // Join a study room
    socket.on('room:join', async (data) => {
        const { roomId, userId, userName, userAvatar } = data;
        socket.join(`room:${roomId}`);

        if (!roomParticipants.has(roomId)) {
            roomParticipants.set(roomId, new Map());
        }
        roomParticipants.get(roomId).set(userId, {
            socketId: socket.id,
            name: userName,
            avatar: userAvatar,
            isMuted: false,
            isCameraOn: true,
            status: 'active'
        });

        io.to(`room:${roomId}`).emit('room:participants',
            Array.from(roomParticipants.get(roomId).entries())
        );
    });

    // Leave study room
    socket.on('room:leave', (data) => {
        const { roomId, userId } = data;
        socket.leave(`room:${roomId}`);

        if (roomParticipants.has(roomId)) {
            roomParticipants.get(roomId).delete(userId);
            io.to(`room:${roomId}`).emit('room:participants',
                Array.from(roomParticipants.get(roomId).entries())
            );
        }
    });

    // Update participant status in room
    socket.on('room:updateStatus', (data) => {
        const { roomId, userId, status } = data;

        if (roomParticipants.has(roomId) && roomParticipants.get(roomId).has(userId)) {
            const participant = roomParticipants.get(roomId).get(userId);
            Object.assign(participant, status);
            io.to(`room:${roomId}`).emit('room:participantUpdate', { userId, ...participant });
        }
    });

    // Pomodoro timer sync
    socket.on('room:pomodoroUpdate', (data) => {
        const { roomId, pomodoroState } = data;
        socket.to(`room:${roomId}`).emit('room:pomodoroSync', pomodoroState);
    });

    // Chat message in study room
    socket.on('room:message', (data) => {
        const { roomId, message, sender, senderId, senderAvatar, createdAt } = data;
        const messageData = {
            id: Date.now(),
            message,
            sender: { name: sender, avatar: senderAvatar || '👤' },
            senderId: senderId || null,  // Pass through for system message identification
            createdAt: createdAt || new Date().toISOString()
        };
        io.to(`room:${roomId}`).emit('room:newMessage', messageData);
    });

    // ============== COLLABORATIVE WHITEBOARD EVENT SYNC ==============
    socket.on('room:whiteboardDraw', (data) => {
        const { roomId, startPoint, endPoint, color, brushSize, tool } = data;
        socket.to(`room:${roomId}`).emit('room:whiteboardDraw', { startPoint, endPoint, color, brushSize, tool });
    });

    socket.on('room:whiteboardClear', (data) => {
        const { roomId } = data;
        socket.to(`room:${roomId}`).emit('room:whiteboardClear');
    });

    socket.on('room:whiteboardText', (data) => {
        const { roomId, text, x, y, color, fontSize, fontFamily, id } = data;
        socket.to(`room:${roomId}`).emit('room:whiteboardText', { text, x, y, color, fontSize, fontFamily, id });
    });

    socket.on('room:whiteboardDeleteText', (data) => {
        const { roomId, id } = data;
        socket.to(`room:${roomId}`).emit('room:whiteboardDeleteText', { id });
    });

    // ============== COLLABORATIVE CODE EDITOR SYNC ==============
    socket.on('room:codeUpdate', (data) => {
        const { roomId, code, language, senderId, senderName } = data;
        socket.to(`room:${roomId}`).emit('room:codeUpdate', { code, language, senderId, senderName });
    });

    socket.on('room:codeOutput', (data) => {
        const { roomId, stdout, stderr, runCleanly, senderName } = data;
        socket.to(`room:${roomId}`).emit('room:codeOutput', { stdout, stderr, runCleanly, senderName });
    });

    socket.on('room:requestStudentCode', (data) => {
        const { roomId, studentId, teacherId } = data;
        socket.to(`room:${roomId}`).emit('room:requestStudentCode', { studentId, teacherId });
    });

    socket.on('room:replyStudentCode', (data) => {
        const { roomId, teacherId, studentId, studentName, code, language } = data;
        socket.to(`room:${roomId}`).emit('room:replyStudentCode', { teacherId, studentId, studentName, code, language });
    });
};
