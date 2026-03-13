const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    channelId: { type: String, required: true }, // e.g., 'general', 'dsa'
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isSolved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
