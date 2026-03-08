const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({
    quizCode: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: { type: String },
    registrationNumber: { type: String },
    score: { type: Number }, // Absolute marks / correct count
    totalQuestions: { type: Number },
    percentage: { type: Number },
    timeTaken: { type: Number },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);
