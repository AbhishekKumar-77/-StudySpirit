/**
 * Socket.io Main Setup
 * Registers all socket event handlers and manages shared state
 */
const registerGroupEvents = require('./groupEvents');
const registerRoomEvents = require('./roomEvents');
const registerWebRTCEvents = require('./webrtcEvents');
const registerQuizEvents = require('./quizEvents');
const User = require('../models/User');

// Shared state — tracked per-process
const onlineUsers = new Map();      // userId -> Set(socketId)
const socketUserMap = new Map();    // socketId -> userId  (for disconnect lookup)
const roomParticipants = new Map();
const webrtcRooms = new Map();

module.exports = function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log('🔌 Socket connected:', socket.id);

        // User comes online — update DB status + broadcast
        socket.on('user:online', async (userId) => {
            if (!onlineUsers.has(userId)) {
                onlineUsers.set(userId, new Set());
            }
            onlineUsers.get(userId).add(socket.id);
            socketUserMap.set(socket.id, userId);

            // Update status in MongoDB
            try {
                await User.findByIdAndUpdate(userId, { status: 'online' });
            } catch (e) {
                console.error('Failed to set user online:', e.message);
            }

            // Broadcast updated online list
            io.emit('users:online', Array.from(onlineUsers.keys()));
            console.log(`✅ User ${userId} is now online`);
        });

        // ──── Real-time DM messaging ────
        // When user sends a DM, forward it to the recipient instantly
        socket.on('dm:send', (data) => {
            // data = { recipientId, message: { _id, content, timestamp, createdAt, senderId, senderName, senderAvatar } }
            const { recipientId, message } = data;
            if (!recipientId || !message) return;

            const recipientSocketIds = onlineUsers.get(String(recipientId));
            if (recipientSocketIds && recipientSocketIds.size > 0) {
                // emit to all the sockets for the recipient
                for (const recipientSocketId of recipientSocketIds) {
                    io.to(recipientSocketId).emit('dm:receive', {
                        senderId: message.senderId,
                        senderName: message.senderName,
                        senderAvatar: message.senderAvatar,
                        message: {
                            _id: message._id,
                            content: message.content,
                            isMine: false,  // For the recipient, it's NOT their message
                            timestamp: message.timestamp,
                            createdAt: message.createdAt
                        }
                    });
                }
                console.log(`💬 DM forwarded from ${message.senderId} to ${recipientId}`);
            }
        });

        // Typing indicator
        socket.on('dm:typing', (data) => {
            const { recipientId, isTyping, senderId, senderName } = data;
            if (!recipientId) return;
            const recipientSocketIds = onlineUsers.get(String(recipientId));
            if (recipientSocketIds && recipientSocketIds.size > 0) {
                for (const recipientSocketId of recipientSocketIds) {
                    io.to(recipientSocketId).emit('dm:typing', { senderId, senderName, isTyping });
                }
            }
        });

        // Register all event modules
        registerGroupEvents(socket, io);
        registerRoomEvents(socket, io, roomParticipants);
        registerWebRTCEvents(socket, io, webrtcRooms);
        registerQuizEvents(socket, io);

        // Disconnect handler
        socket.on('disconnect', async () => {
            const userId = socketUserMap.get(socket.id);

            if (userId) {
                const userSockets = onlineUsers.get(userId);
                if (userSockets) {
                    userSockets.delete(socket.id);
                    if (userSockets.size === 0) {
                        onlineUsers.delete(userId);

                        // Update status in MongoDB
                        try {
                            await User.findByIdAndUpdate(userId, { status: 'offline' });
                        } catch (e) {
                            console.error('Failed to set user offline:', e.message);
                        }

                        console.log(`❌ User ${userId} went offline completely`);
                    }
                }
                socketUserMap.delete(socket.id);
            }

            // Clean up room participants
            for (const [roomId, participants] of roomParticipants.entries()) {
                for (const [uid, participant] of participants.entries()) {
                    if (participant.socketId === socket.id) {
                        participants.delete(uid);
                        io.to(`room:${roomId}`).emit('room:participants',
                            Array.from(participants.entries())
                        );
                        break;
                    }
                }
                if (participants.size === 0) roomParticipants.delete(roomId);
            }

            // Clean up WebRTC rooms
            for (const [roomId, users] of webrtcRooms.entries()) {
                if (users.size === 0) webrtcRooms.delete(roomId);
            }

            io.emit('users:online', Array.from(onlineUsers.keys()));
            console.log('🔌 Socket disconnected:', socket.id);
        });
    });

    return { onlineUsers, roomParticipants, webrtcRooms };
};
