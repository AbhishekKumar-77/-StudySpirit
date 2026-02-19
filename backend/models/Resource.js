const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    description: {
        type: String,
        maxLength: 500
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resourceType: {
        type: String,
        enum: ['pdf', 'doc', 'video', 'image', 'code', 'link', 'other'],
        default: 'other'
    },
    url: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number, // in bytes
        default: 0
    },
    category: {
        type: String,
        enum: ['DSA', 'Web Dev', 'AI/ML', 'System Design', 'Mobile Dev', 'DevOps', 'General'],
        default: 'General'
    },
    tags: [{
        type: String,
        trim: true
    }],
    downloads: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
resourceSchema.index({ group: 1, createdAt: -1 });
resourceSchema.index({ category: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
