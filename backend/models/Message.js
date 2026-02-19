const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxLength: 2000
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Either group or studyRoom should be set
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    studyRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudyRoom'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'system', 'announcement'],
        default: 'text'
    },
    attachments: [{
        name: String,
        url: String,
        type: String,
        size: Number
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    reactions: [{
        emoji: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
messageSchema.index({ group: 1, createdAt: -1 });
messageSchema.index({ studyRoom: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
