const mongoose = require('mongoose');

const interviewExamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, unique: true, required: true },
    mode: {
        type: String,
        enum: ['technical', 'behavioral', 'resume', 'gd'],
        default: 'technical'
    },
    totalQuestions: { type: Number, default: 5, min: 3, max: 20 },
    targetRole: { type: String, default: 'Software Engineer' },
    targetCompany: { type: String, default: 'General Tech' },
    settings: {
        scheduledStart: { type: Date, default: null },
        scheduledEnd: { type: Date, default: null },
        allowReAttempt: { type: Boolean, default: false }
    },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    creatorName: { type: String, default: 'Teacher' },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    createdAt: { type: Date, default: Date.now }
});

interviewExamSchema.index({ code: 1 });
interviewExamSchema.index({ creatorId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewExam', interviewExamSchema);
