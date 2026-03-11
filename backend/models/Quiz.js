const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.Mixed,
    question: { type: String, required: true },
    options: [{ type: String }],
    correct: { type: Number }, // Index of correct option (optional for coding)
    type: { type: String, default: 'mcq' },
    difficulty: { type: String, default: 'medium' },
    starterCode: { type: String },
    testCases: [{ input: String, expectedOutput: String, output: String }]
}, { strict: false });

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, unique: true, required: true },
    questions: [questionSchema],
    settings: {
        timeLimit: { type: Number, default: 30 },
        difficulty: { type: String, default: 'medium' },
        negativeMarking: { type: Number, default: 0 },
        allowReview: { type: Boolean, default: true },
        showResults: { type: Boolean, default: true },
        randomizeQuestions: { type: Boolean, default: false },
        secureMode: { type: Boolean, default: false }
    },
    creatorName: { type: String, default: 'Anonymous' },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
