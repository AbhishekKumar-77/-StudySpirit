const mongoose = require('mongoose');

const englishSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['conversation', 'extempore', 'pronunciation', 'grammar', 'writing', 'scenario', 'assessment'],
        required: true
    },
    topic: {
        type: String,
        trim: true,
        default: 'General Practice'
    },
    transcript: {
        type: String,
        default: ''
    },
    durationSeconds: {
        type: Number,
        default: 0
    },
    wpm: {
        type: Number,
        default: 0
    },
    fillerCount: {
        type: Number,
        default: 0
    },
    scores: {
        fluency: { type: Number, default: 70 },
        pronunciation: { type: Number, default: 70 },
        grammar: { type: Number, default: 70 },
        vocabulary: { type: Number, default: 70 },
        confidence: { type: Number, default: 70 },
        overall: { type: Number, default: 70 }
    },
    grammarErrors: [{
        wrong: String,
        better: String,
        reason: String
    }],
    pronunciationErrors: [{
        sound: String,
        word: String,
        score: Number
    }],
    fillerWords: [{
        type: String
    }],
    aiFeedback: {
        strengths: [{ type: String }],
        improvements: [{ type: String }],
        overallSummary: { type: String, default: '' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EnglishSession', englishSessionSchema);
