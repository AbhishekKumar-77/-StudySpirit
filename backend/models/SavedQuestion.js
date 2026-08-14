const mongoose = require('mongoose');

const savedQuestionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questionText: { type: String, required: true },
    options: [{ type: String }],
    correctIndex: { type: Number, default: 0 },
    explanation: { type: String, default: '' },
    keyConcept: { type: String, default: '' },
    subject: { type: String, default: 'General' },
    topic: { type: String, default: 'General' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    category: { type: String, enum: ['saved', 'mistakes', 'difficult', 'important'], default: 'saved', index: true },
    savedAt: { type: Date, default: Date.now }
});

savedQuestionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('SavedQuestion', savedQuestionSchema);
