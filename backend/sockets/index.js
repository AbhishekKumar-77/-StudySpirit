/**
 * Socket.io Main Setup
 * Registers all socket event handlers and manages shared state
 * 
 * High-Concurrency Optimizations:
 * 1. Batched Database Status Updates: Aggregates connect/disconnect status changes
 *    into 5-second bulk operations instead of thousands of single Mongo writes.
 * 2. Throttled Presence Broadcasts: Removes quadratic O(N^2) global broadcasts.
 * 3. Fast In-Memory Lookups: Constant time O(1) user and socket mappings.
 */
const registerGroupEvents = require('./groupEvents');
const registerRoomEvents = require('./roomEvents');
const registerWebRTCEvents = require('./webrtcEvents');
const registerQuizEvents = require('./quizEvents');
const User = require('../models/User');

// Shared state — tracked per-process
const onlineUsers = new Map();      // userId -> Set(socketId)
const socketUserMap = new Map();    // socketId -> userId (for disconnect lookup)
const roomParticipants = new Map();
const webrtcRooms = new Map();

// Queues for batch DB status updates
const pendingOnlineUsers = new Set();
const pendingOfflineUsers = new Set();

// Batch flush online/offline status to MongoDB every 5 seconds
setInterval(async () => {
    if (pendingOnlineUsers.size > 0) {
        const userIds = Array.from(pendingOnlineUsers);
        pendingOnlineUsers.clear();
        try {
            await User.updateMany({ _id: { $in: userIds } }, { $set: { status: 'online' } });
        } catch (e) {
            console.error('[Socket] Batch online status error:', e.message);
        }
    }

    if (pendingOfflineUsers.size > 0) {
        const userIds = Array.from(pendingOfflineUsers);
        pendingOfflineUsers.clear();
        try {
            await User.updateMany({ _id: { $in: userIds } }, { $set: { status: 'offline' } });
        } catch (e) {
            console.error('[Socket] Batch offline status error:', e.message);
        }
    }
}, 5000).unref();

module.exports = function setupSocketHandlers(io) {
    // Throttled presence notifier (fires at most once per 15 seconds)
    let presenceBroadcastTimer = null;
    const schedulePresenceBroadcast = () => {
        if (!presenceBroadcastTimer) {
            presenceBroadcastTimer = setTimeout(() => {
                presenceBroadcastTimer = null;
                // Emit lightweight online count to all connected clients
                io.emit('users:count', onlineUsers.size);
            }, 15000);
        }
    };

    io.on('connection', (socket) => {
        // User comes online — update queue + register socket
        socket.on('user:online', (userId) => {
            if (!userId) return;
            const strUserId = String(userId);

            if (!onlineUsers.has(strUserId)) {
                onlineUsers.set(strUserId, new Set());
            }
            onlineUsers.get(strUserId).add(socket.id);
            socketUserMap.set(socket.id, strUserId);

            // Queue for batch DB update (removes immediate DB round-trip)
            pendingOfflineUsers.delete(strUserId);
            pendingOnlineUsers.add(strUserId);

            // Schedule throttled count broadcast
            schedulePresenceBroadcast();
        });

        // ──── Real-time DM messaging ────
        socket.on('dm:send', (data) => {
            const { recipientId, message } = data || {};
            if (!recipientId || !message) return;

            const recipientSocketIds = onlineUsers.get(String(recipientId));
            if (recipientSocketIds && recipientSocketIds.size > 0) {
                for (const recipientSocketId of recipientSocketIds) {
                    io.to(recipientSocketId).emit('dm:receive', {
                        senderId: message.senderId,
                        senderName: message.senderName,
                        senderAvatar: message.senderAvatar,
                        message: {
                            _id: message._id,
                            content: message.content,
                            isMine: false,
                            timestamp: message.timestamp,
                            createdAt: message.createdAt
                        }
                    });
                }
            }
        });

        // Typing indicator
        socket.on('dm:typing', (data) => {
            const { recipientId, isTyping, senderId, senderName } = data || {};
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
        socket.on('disconnect', () => {
            const userId = socketUserMap.get(socket.id);

            if (userId) {
                const userSockets = onlineUsers.get(userId);
                if (userSockets) {
                    userSockets.delete(socket.id);
                    if (userSockets.size === 0) {
                        onlineUsers.delete(userId);

                        // Queue for batch offline DB update
                        pendingOnlineUsers.delete(userId);
                        pendingOfflineUsers.add(userId);
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

            // Schedule throttled presence broadcast
            schedulePresenceBroadcast();
        });
    });

    return { onlineUsers, roomParticipants, webrtcRooms };
};
