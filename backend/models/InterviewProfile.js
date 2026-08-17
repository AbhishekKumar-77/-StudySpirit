const mongoose = require('mongoose');

const interviewProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    targetRole: {
        type: String,
        default: 'Backend Developer'
    },
    targetCompany: {
        type: String,
        default: 'Google'
    },
    jobDescription: {
        type: String,
        default: ''
    },
    resumeText: {
        type: String,
        default: ''
    },
    // Dynamic interview readiness (0-100%)
    readiness: {
        technical: { type: Number, default: 78 },
        communication: { type: Number, default: 72 },
        behavioral: { type: Number, default: 78 },
        confidence: { type: Number, default: 74 },
        problemSolving: { type: Number, default: 80 }
    },
    // CodeSpirit performance ties (detected weak areas)
    codeSpiritWeakAreas: [{
        topic: String,
        score: Number
    }],
    upcomingInterviews: [{
        company: String,
        role: String,
        roundType: String,
        scheduledDate: Date,
        status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
    }],
    totalInterviewsTaken: {
        type: Number,
        default: 0
    },
    weeklyGoal: {
        completed: { type: Number, default: 3 },
        target: { type: Number, default: 5 }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

interviewProfileSchema.index({ userId: 1 });

module.exports = mongoose.model('InterviewProfile', interviewProfileSchema);
