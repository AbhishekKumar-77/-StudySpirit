const mongoose = require('mongoose');

const StudentMilestoneSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    description: { type: String },
    current: { type: Number, default: 0 },
    target: { type: Number, default: 1 },
    completed: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
    icon: { type: String, default: '🏆' }
}, { timestamps: true });

module.exports = mongoose.model('StudentMilestone', StudentMilestoneSchema);
