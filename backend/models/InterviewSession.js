const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    mode: {
        type: String,
        enum: ['technical', 'behavioral', 'resume', 'gd', 'system-design', 'full-mock', 'teacher-exam'],
        default: 'technical'
    },
    roundType: {
        type: String,
        enum: ['technical', 'system-design', 'behavioral', 'gd', 'full-mock', 'teacher-exam'],
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
        score: { type: Number, default: 0 }, // 1-10 or 1-100
        feedback: String,
        idealAnswer: String,
        codeSubmitted: String,
        complexityAnalysis: String,
        starComponents: {
            situation: Boolean,
            task: Boolean,
            action: Boolean,
            result: Boolean
        },
        timestamp: { type: Date, default: Date.now }
    }],
    // Job Context
    targetRole: String,
    targetCompany: String,
    jobDescription: String,
    detectedSkills: [String],

    // Detailed 7-dimension score breakdown (0-100)
    dimensionScores: {
        answerQuality: { type: Number, default: 75 },
        technicalDepth: { type: Number, default: 75 },
        problemSolving: { type: Number, default: 75 },
        communication: { type: Number, default: 75 },
        confidence: { type: Number, default: 75 },
        structure: { type: Number, default: 75 },
        pacing: { type: Number, default: 75 }
    },

    // Behavioral STAR evaluation
    starEvaluation: {
        situation: { type: Number, default: 80 },
        task: { type: Number, default: 80 },
        action: { type: Number, default: 80 },
        result: { type: Number, default: 60 },
        missingElements: [String]
    },

    // Final report
    overallScore: {
        type: Number,
        default: 0
    },
    strengths: [String],
    improvements: [String],
    finalFeedback: String,
    gdMetrics: {
        logic: Number,
        communication: Number,
        teamwork: Number,
        confidence: Number,
        listening: Number,
        relevance: Number,
        leadership: Number,
        interruptions: Number
    },

    // Actionable AI Improvement Plan (linking into StudySpirit modules)
    improvementPlan: [{
        title: String,
        priority: { type: String, enum: ['High Priority', 'Medium Priority', 'Low Priority'], default: 'Medium Priority' },
        category: String, // 'System Design', 'STAR Responses', 'Filler Words', 'Graph Algorithms', etc.
        actionUrl: String, // e.g. '/codespirit', '/soft-skills', '/resources'
        actionText: String, // e.g. 'Practice in CodeSpirit'
        completed: { type: Boolean, default: false }
    }],

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

