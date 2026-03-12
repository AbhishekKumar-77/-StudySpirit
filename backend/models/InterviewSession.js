const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mode: {
        type: String,
        enum: ['technical', 'behavioral', 'resume'],
        default: 'technical'
    },
    totalQuestions: {
        type: Number,
        default: 5
    },
    questionsAsked: {
        type: Number,
        default: 0
    },
    // Per-question data
    exchanges: [{
        questionNumber: Number,
        question: String,
        answer: String,
        score: { type: Number, default: 0 }, // 1-10
        feedback: String,
        idealAnswer: String,
        timestamp: { type: Date, default: Date.now }
    }],
    // Config
    targetRole: String,
    targetCompany: String,
    // Final report
    overallScore: {
        type: Number,
        default: 0
    },
    strengths: [String],
    improvements: [String],
    finalFeedback: String,
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'abandoned'],
        default: 'in-progress'
    },
    resumeText: String,
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    duration: Number // in seconds
});

interviewSessionSchema.index({ userId: 1, startedAt: -1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
