const mongoose = require('mongoose');

const LearningTaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    dayLabel: { type: String }, // e.g., 'Mon 12', 'Tue 13'
    dayOfWeek: { type: String }, // 'Mon', 'Tue'
    durationMinutes: { type: Number, default: 60 },
    taskType: {
        type: String,
        enum: ['LEARN', 'PRACTICE', 'QUIZ', 'ASSESSMENT', 'PROJECT'],
        default: 'LEARN'
    },
    status: {
        type: String,
        enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ASSESSED', 'MASTERED', 'NEEDS_REVIEW'],
        default: 'NOT_STARTED'
    },
    completed: { type: Boolean, default: false },
    score: { type: Number },
    topic: { type: String },
    courseName: { type: String },
    skillName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LearningTask', LearningTaskSchema);
