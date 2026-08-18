/**
 * Socket.io Events — Study Rooms
 * Handles room join/leave, participant tracking, pomodoro sync, and room chat
 */

module.exports = function registerRoomEvents(socket, io, roomParticipants) {
    // Join a study room
    socket.on('room:join', async (data) => {
        const { roomId, userId, userName, userAvatar, role } = data;
        socket.join(`room:${roomId}`);

        if (!roomParticipants.has(roomId)) {
            roomParticipants.set(roomId, new Map());
        }
        roomParticipants.get(roomId).set(userId, {
            socketId: socket.id,
            name: userName,
            avatar: userAvatar,
            role: role || 'student',
            isMuted: role === 'teacher' ? false : true,
            isCameraOn: role === 'teacher' ? true : false,
            status: 'active',
            permissions: {
                mic: true,
                camera: role === 'teacher' ? true : false,
                whiteboard: role === 'teacher' ? true : false,
                codeEditor: role === 'teacher' ? true : false,
                screenShare: role === 'teacher' ? true : false
            }
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

    // ============== COLLABORATIVE CODE EDITOR SYNC (LEGACY & YJS CRDT) ==============
    // Store Yjs binary updates in memory per room
    const roomYjsUpdates = new Map(); // roomId -> Array of Uint8Arrays

    socket.on('room:yjsJoin', (data) => {
        const { roomId } = data;
        if (roomId && roomYjsUpdates.has(roomId)) {
            const updates = roomYjsUpdates.get(roomId);
            // Send existing updates to newly joined client
            for (const update of updates) {
                socket.emit('room:yjsInit', { roomId, state: update });
            }
        }
    });

    socket.on('room:yjsUpdate', (data) => {
        const { roomId, update } = data;
        if (roomId && update) {
            if (!roomYjsUpdates.has(roomId)) {
                roomYjsUpdates.set(roomId, []);
            }
            const updates = roomYjsUpdates.get(roomId);
            // Store up to 500 recent delta chunks
            if (updates.length > 500) updates.shift();
            updates.push(update);

            socket.to(`room:${roomId}`).emit('room:yjsUpdate', { roomId, update });
        }
    });

    socket.on('room:yjsAwareness', (data) => {
        const { roomId, update } = data;
        if (roomId && update) {
            socket.to(`room:${roomId}`).emit('room:yjsAwareness', { roomId, update });
        }
    });

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

    // ============== STUDENT MATRIX HEARTBEAT ==============
    const roomMatrixSnapshots = new Map(); // roomId -> Map(studentId -> snapshot)

    socket.on('room:studentCodeHeartbeat', (data) => {
        const { roomId, studentId, studentName, code, language, status } = data;
        if (roomId && studentId) {
            if (!roomMatrixSnapshots.has(roomId)) {
                roomMatrixSnapshots.set(roomId, new Map());
            }
            roomMatrixSnapshots.get(roomId).set(studentId, {
                studentId, studentName, code, language, status, updatedAt: Date.now()
            });

            socket.to(`room:${roomId}`).emit('room:studentCodeHeartbeat', data);
        }
    });

    socket.on('room:requestMatrixSnapshots', (data) => {
        const { roomId } = data;
        if (roomId && roomMatrixSnapshots.has(roomId)) {
            const snapshots = Array.from(roomMatrixSnapshots.get(roomId).values());
            socket.emit('room:matrixSnapshotsInit', { roomId, snapshots });
        }
    });

    // ============== BREAKOUT ROOMS SOCKET EVENTS ==============
    socket.on('room:createBreakouts', (data) => {
        const { roomId } = data;
        io.to(`room:${roomId}`).emit('room:breakoutsCreated', data);
    });

    socket.on('room:broadcastBreakouts', (data) => {
        const { roomId, message } = data;
        io.to(`room:${roomId}`).emit('room:breakoutBroadcast', { message });
    });

    socket.on('room:closeBreakouts', (data) => {
        const { roomId } = data;
        io.to(`room:${roomId}`).emit('room:breakoutsClosed');
    });

    // ============== LIVE POLLS & QUIZZES SOCKET EVENTS ==============
    const activeRoomPolls = new Map(); // roomId -> pollData

    socket.on('room:createPoll', (data) => {
        const { roomId } = data;
        activeRoomPolls.set(roomId, data);
        io.to(`room:${roomId}`).emit('room:pollCreated', data);
    });

    socket.on('room:votePoll', (data) => {
        const { roomId, pollId, optionIndex, userId } = data;
        console.log('🗳️ Backend received votePoll:', data);
        if (roomId && activeRoomPolls.has(roomId)) {
            const poll = activeRoomPolls.get(roomId);
            if (poll) {
                if (!poll.voters) poll.voters = [];
                const voterKey = userId || socket.id;
                if (!poll.voters.includes(voterKey)) {
                    poll.voters.push(voterKey);
                    if (poll.options && poll.options[optionIndex]) {
                        poll.options[optionIndex].votes = (poll.options[optionIndex].votes || 0) + 1;
                        poll.totalVotes = (poll.totalVotes || 0) + 1;
                    }
                    console.log('📊 Poll updated state:', poll);
                    io.to(`room:${roomId}`).emit('room:pollUpdated', poll);
                }
            }
        }
    });

    socket.on('room:closePoll', (data) => {
        const { roomId } = data;
        activeRoomPolls.delete(roomId);
        io.to(`room:${roomId}`).emit('room:pollClosed');
    });

    socket.on('room:publishPoll', (data) => {
        const { roomId, poll } = data;
        if (roomId && poll) {
            const sortedOptions = [...(poll.options || [])].sort((a, b) => b.votes - a.votes);
            const topOption = sortedOptions[0] || { text: 'N/A', votes: 0 };
            const percent = poll.totalVotes > 0 ? Math.round((topOption.votes / poll.totalVotes) * 100) : 0;

            const messageData = {
                id: Date.now(),
                message: `📊 POLL RESULTS PUBLISHED: "${poll.question}" | Top Answer: ${topOption.text} (${percent}% - ${topOption.votes} votes)`,
                pollResults: {
                    question: poll.question,
                    options: poll.options,
                    totalVotes: poll.totalVotes
                },
                sender: { name: 'INSTRUCTOR / POLL SYSTEM', avatar: '📊' },
                createdAt: new Date().toISOString()
            };

            io.to(`room:${roomId}`).emit('room:newMessage', messageData);
            io.to(`room:${roomId}`).emit('room:pollPublished', poll);
        }
    });

    // ============== LOBBY / WAITING ROOM SOCKET EVENTS ==============
    socket.on('room:lobbyJoin', (data) => {
        const { roomId, user } = data;
        socket.to(`room:${roomId}`).emit('room:lobbyParticipantWaiting', { user, socketId: socket.id });
    });

    socket.on('room:lobbyApprove', (data) => {
        const { targetSocketId, roomId } = data;
        io.to(targetSocketId).emit('room:lobbyApproved', { roomId });
    });

    socket.on('room:lobbyDeny', (data) => {
        const { targetSocketId } = data;
        io.to(targetSocketId).emit('room:lobbyDenied');
    });

    // ============== PERMISSIONS & HOST CONTROL EVENTS ==============
    socket.on('room:permissionUpdate', (data) => {
        const { roomId, targetUserId, permissions } = data;
        if (roomParticipants.has(roomId)) {
            const roomMap = roomParticipants.get(roomId);
            if (targetUserId === 'all') {
                roomMap.forEach((participant) => {
                    if (participant.role !== 'teacher') {
                        participant.permissions = { ...(participant.permissions || {}), ...permissions };
                        if (permissions.camera === false) participant.isCameraOn = false;
                        if (permissions.mic === false) participant.isMuted = true;
                        if (permissions.camera === true) participant.isCameraOn = true;
                        if (permissions.mic === true) participant.isMuted = false;
                    }
                });
            } else if (roomMap.has(targetUserId)) {
                const p = roomMap.get(targetUserId);
                p.permissions = { ...(p.permissions || {}), ...permissions };
                if (permissions.camera === false) p.isCameraOn = false;
                if (permissions.mic === false) p.isMuted = true;
                if (permissions.camera === true) p.isCameraOn = true;
                if (permissions.mic === true) p.isMuted = false;
            }
            io.to(`room:${roomId}`).emit('room:participants', Array.from(roomMap.entries()));
        }
        io.to(`room:${roomId}`).emit('room:permissionUpdate', { targetUserId, permissions });
    });

    socket.on('room:handRaise', (data) => {
        const { roomId, userId, userName, raised } = data;
        io.to(`room:${roomId}`).emit('room:handRaised', { userId, userName, raised, timestamp: Date.now() });
    });

    socket.on('room:fileShare', (data) => {
        const { roomId, sender, senderAvatar, fileName, fileUrl, fileType, fileSize } = data;
        const messageData = {
            id: Date.now(),
            message: `Shared a file: ${fileName}`,
            file: { name: fileName, url: fileUrl, type: fileType, size: fileSize },
            sender: { name: sender, avatar: senderAvatar || '👤' },
            createdAt: new Date().toISOString()
        };
        io.to(`room:${roomId}`).emit('room:newMessage', messageData);
    });
};
