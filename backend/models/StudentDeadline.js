const mongoose = require('mongoose');

const StudentDeadlineSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    date: { type: String, required: true },
    category: {
        type: String,
        enum: ['Academic', 'Projects', 'Career'],
        default: 'Academic'
    },
    urgency: { type: String, default: 'Due this week' }
}, { timestamps: true });

module.exports = mongoose.model('StudentDeadline', StudentDeadlineSchema);
