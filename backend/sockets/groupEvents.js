/**
 * Socket.io Events — Group Chat
 * Handles group join/leave and message sending
 */
const Message = require('../models/Message');
const mongoose = require('mongoose');

module.exports = function registerGroupEvents(socket, io) {
    // Join a group chat room
    socket.on('group:join', (groupId) => {
        const roomName = `group:${groupId}`;
        socket.join(roomName);
        const room = io.sockets.adapter.rooms.get(roomName);
        console.log(`✅ Socket ${socket.id} joined group: ${groupId}, total clients: ${room ? room.size : 0}`);
    });

    // Leave a group chat room
    socket.on('group:leave', (groupId) => {
        const roomName = `group:${groupId}`;
        socket.leave(roomName);
        const room = io.sockets.adapter.rooms.get(roomName);
        console.log(`👋 Socket ${socket.id} left group: ${groupId}, remaining: ${room ? room.size : 0}`);
    });

    // Send message to group
    socket.on('message:send', async (data) => {
        try {
            const { content, groupId, senderId, senderName, senderAvatar } = data;

            const messageData = {
                _id: Date.now().toString(),
                content,
                sender: { _id: senderId, name: senderName, avatar: senderAvatar },
                group: groupId,
                createdAt: new Date().toISOString()
            };

            // Save to DB if valid IDs
            const isValidSenderId = senderId && mongoose.Types.ObjectId.isValid(senderId);
            const isValidGroupId = groupId && mongoose.Types.ObjectId.isValid(groupId);

            if (isValidSenderId && isValidGroupId) {
                try {
                    const message = new Message({
                        content,
                        sender: senderId,
                        group: groupId,
                        messageType: 'text'
                    });
                    const savedMessage = await message.save();
                    messageData._id = savedMessage._id;
                    messageData.createdAt = savedMessage.createdAt;
                } catch (dbError) {
                    console.error('⚠️ DB save failed (still broadcasting):', dbError.message);
                }
            }

            // Broadcast to room
            const room = io.sockets.adapter.rooms.get(`group:${groupId}`);
            if (room && room.size > 0) {
                io.to(`group:${groupId}`).emit('message:receive', messageData);
            }
        } catch (error) {
            console.error('❌ Message send error:', error.message);
        }
    });
};
