const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({
    quizCode: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: { type: String },
    registrationNumber: { type: String },
    score: { type: Number }, // Absolute marks / correct count (with neg marking)
    totalQuestions: { type: Number },
    percentage: { type: Number },
    timeTaken: { type: Number },
    // Stores { questionId: chosenOptionIndex } for analytics + student answer review
    userAnswers: { type: mongoose.Schema.Types.Mixed, default: {} },
    submittedAt: { type: Date, default: Date.now }
});

// Compound index: detect if a registrationNumber already submitted this quiz
quizSubmissionSchema.index({ quizCode: 1, registrationNumber: 1 });

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);
