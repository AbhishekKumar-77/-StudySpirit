const mongoose = require('mongoose');

const interviewSubmissionSchema = new mongoose.Schema({
    examCode: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: { type: String, default: 'Student' },
    registrationNumber: { type: String, default: '' },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession' },
    mode: { type: String, default: 'technical' },
    overallScore: { type: Number, default: 0 },
    strengths: [String],
    improvements: [String],
    finalFeedback: { type: String, default: '' },
    gdMetrics: {
        logic: Number,
        communication: Number,
        teamwork: Number,
        confidence: Number
    },
    duration: { type: Number, default: 0 }, // seconds
    questionsAnswered: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'abandoned'],
        default: 'in-progress'
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});

interviewSubmissionSchema.index({ examCode: 1, completedAt: -1 });
interviewSubmissionSchema.index({ studentId: 1 });

module.exports = mongoose.model('InterviewSubmission', interviewSubmissionSchema);
