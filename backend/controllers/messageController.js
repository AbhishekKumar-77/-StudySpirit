const Message = require('../models/Message');
const Activity = require('../models/Activity');
const User = require('../models/User');

// Get messages for group or room
exports.getMessages = async (req, res) => {
    try {
        const { groupId, roomId } = req.query;
        const { page = 1, limit = 50 } = req.query;

        const query = {};
        if (groupId) query.group = groupId;
        if (roomId) query.studyRoom = roomId;

        const messages = await Message.find(query)
            .populate('sender', 'name avatar')
            .populate('replyTo')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({ success: true, messages: messages.reverse() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed', error: error.message });
    }
};

// Send message
exports.sendMessage = async (req, res) => {
    try {
        const { content, groupId, roomId, messageType, replyTo } = req.body;
        const userId = req.user._id;

        const message = new Message({
            content, sender: userId,
            group: groupId, studyRoom: roomId,
            messageType: messageType || 'text',
            replyTo
        });

        await message.save();
        await message.populate('sender', 'name avatar');

        res.status(201).json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed', error: error.message });
    }
};

// Add reaction to message
exports.addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ success: false, message: 'Not found' });

        const existingReaction = message.reactions.find(
            r => r.user.toString() === userId.toString() && r.emoji === emoji
        );

        if (existingReaction) {
            message.reactions = message.reactions.filter(
                r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
            );
        } else {
            message.reactions.push({ emoji, user: userId });
        }

        await message.save();
        res.json({ success: true, reactions: message.reactions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed', error: error.message });
    }
};

// Delete message
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) return res.status(404).json({ success: false, message: 'Not found' });

        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        message.isDeleted = true;
        message.content = 'Message deleted';
        await message.save();

        res.json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed', error: error.message });
    }
};
