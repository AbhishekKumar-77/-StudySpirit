const mongoose = require('mongoose');

const questionAttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    options: [{ type: String }],
    selectedAnswer: { type: mongoose.Schema.Types.Mixed },
    correctAnswer: { type: mongoose.Schema.Types.Mixed },
    isCorrect: { type: Boolean, required: true },
    subject: { type: String, default: 'General Programming', index: true },
    topic: { type: String, default: 'General', index: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    timeTaken: { type: Number, default: 0 }, // seconds
    confidence: { 
        type: String, 
        enum: ['guessing', 'unsure', 'fairly_sure', 'very_confident', 'none'], 
        default: 'none' 
    },
    explanationGiven: { type: String, default: '' },
    keyConcept: { type: String, default: '' },
    isMistake: { type: Boolean, default: false, index: true },
    resolved: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now, index: true }
});

questionAttemptSchema.index({ userId: 1, subject: 1, topic: 1 });
questionAttemptSchema.index({ userId: 1, isMistake: 1, resolved: 1 });

module.exports = mongoose.model('QuestionAttempt', questionAttemptSchema);
