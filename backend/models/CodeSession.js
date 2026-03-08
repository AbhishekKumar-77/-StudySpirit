const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    id: String,
    title: String,
    description: String,
    language: String,
    starterCode: String,
    testCases: Array,
    hints: Array,
    difficulty: String,
    userCode: String,
    status: { type: String, enum: ['pending', 'solved'], default: 'pending' },
    codeOutput: Object,
    solveTime: { type: Number, default: 0 },
    startedAt: { type: Date, default: null },
    verificationResults: Array
});

const codeSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: String,
    difficulty: String,
    language: String, // Preferred language
    challenges: [challengeSchema],
    completed: { type: Boolean, default: false },
    isDaily: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CodeSession', codeSessionSchema);
