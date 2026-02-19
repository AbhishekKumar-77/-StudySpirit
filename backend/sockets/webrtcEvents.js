/**
 * Socket.io Events — WebRTC Signaling
 * Handles peer-to-peer video call signaling (offer/answer/ICE candidates)
 */

module.exports = function registerWebRTCEvents(socket, io, webrtcRooms) {
    // Map userId -> socketId for direct routing of WebRTC signals
    // This is shared across all sockets via the webrtcRooms structure
    if (!webrtcRooms.userSocketMap) {
        webrtcRooms.userSocketMap = new Map();
    }
    const userSocketMap = webrtcRooms.userSocketMap;

    // Helper: send signal directly to a target user's socket
    const sendToUser = (targetUserId, event, data) => {
        const targetSocketId = userSocketMap.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit(event, data);
            return true;
        }
        // Fallback: broadcast to room (less ideal but ensures delivery)
        console.warn(`⚠️ WebRTC: No socket found for user ${targetUserId}, broadcasting to room`);
        return false;
    };

    // User joins WebRTC room
    socket.on('webrtc:join', (data) => {
        const { roomId, userId } = data;
        console.log(`🎥 WebRTC: ${userId} joining room ${roomId} (socket: ${socket.id})`);

        // Register userId -> socketId mapping
        userSocketMap.set(userId, socket.id);

        socket.join(`webrtc:${roomId}`);

        if (!webrtcRooms.has(roomId)) {
            webrtcRooms.set(roomId, new Set());
        }

        // Send existing users to the new user
        const existingUsers = Array.from(webrtcRooms.get(roomId));
        socket.emit('webrtc:existingUsers', existingUsers);

        // Add user to room
        webrtcRooms.get(roomId).add(userId);

        // Notify others in the room
        socket.to(`webrtc:${roomId}`).emit('webrtc:userJoined', { userId });
    });

    // WebRTC offer — route ONLY to the target user
    socket.on('webrtc:offer', (data) => {
        const { from, to, offer, roomId } = data;
        console.log(`📡 WebRTC offer: ${from} -> ${to}`);
        if (!sendToUser(to, 'webrtc:offer', { from, to, offer })) {
            // Fallback: broadcast to room (recipient will filter by `to` field)
            socket.to(`webrtc:${roomId}`).emit('webrtc:offer', { from, to, offer });
        }
    });

    // WebRTC answer — route ONLY to the target user
    socket.on('webrtc:answer', (data) => {
        const { from, to, answer, roomId } = data;
        console.log(`📡 WebRTC answer: ${from} -> ${to}`);
        if (!sendToUser(to, 'webrtc:answer', { from, to, answer })) {
            socket.to(`webrtc:${roomId}`).emit('webrtc:answer', { from, to, answer });
        }
    });

    // ICE candidate — route ONLY to the target user
    socket.on('webrtc:iceCandidate', (data) => {
        const { from, to, candidate, roomId } = data;
        if (!sendToUser(to, 'webrtc:iceCandidate', { from, to, candidate })) {
            socket.to(`webrtc:${roomId}`).emit('webrtc:iceCandidate', { from, to, candidate });
        }
    });

    // User leaves WebRTC room
    socket.on('webrtc:leave', (data) => {
        const { roomId, userId } = data;
        console.log(`🎥 WebRTC: ${userId} leaving room ${roomId}`);

        // Remove from userId->socketId map
        userSocketMap.delete(userId);

        socket.leave(`webrtc:${roomId}`);

        if (webrtcRooms.has(roomId)) {
            webrtcRooms.get(roomId).delete(userId);
            if (webrtcRooms.get(roomId).size === 0) {
                webrtcRooms.delete(roomId);
            }
        }

        socket.to(`webrtc:${roomId}`).emit('webrtc:userLeft', { userId });
    });

    // Clean up on socket disconnect
    socket.on('disconnect', () => {
        // Remove this socket's userId from the map
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                console.log(`🎥 WebRTC: Cleaned up userId ${userId} on disconnect`);
                break;
            }
        }
    });

    // Whiteboard draw events — broadcast to room (collaborative drawing)
    socket.on('whiteboard:draw', (data) => {
        const { roomId, drawData } = data;
        socket.to(`room:${roomId}`).emit('whiteboard:update', drawData);
    });
};
