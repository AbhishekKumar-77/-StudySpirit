const mongoose = require('mongoose');

const englishProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    cefrLevel: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        default: 'B1'
    },
    assessmentCompleted: {
        type: Boolean,
        default: false
    },
    scores: {
        speakingScore: { type: Number, default: 68 },
        pronunciationScore: { type: Number, default: 61 },
        grammarScore: { type: Number, default: 72 },
        vocabularyScore: { type: Number, default: 58 },
        fluencyScore: { type: Number, default: 64 },
        confidenceScore: { type: Number, default: 70 },
        overallConfidence: { type: Number, default: 64 }
    },
    weakAreas: [{
        type: String,
        trim: true
    }],
    recurringMistakes: [{
        pattern: { type: String, required: true },
        wrongExample: { type: String, default: '' },
        correctExample: { type: String, default: '' },
        explanation: { type: String, default: '' },
        category: { type: String, enum: ['grammar', 'pronunciation', 'vocabulary', 'fluency'], default: 'grammar' },
        occurrences: { type: Number, default: 1 },
        masteryScore: { type: Number, default: 40 },
        status: { type: String, enum: ['Needs Practice', 'Improving', 'Mastered'], default: 'Needs Practice' },
        lastOccurred: { type: Date, default: Date.now }
    }],
    savedVocabulary: [{
        word: { type: String, required: true, trim: true },
        meaning: { type: String, default: '' },
        usage: { type: String, default: '' },
        context: { type: String, default: 'General' },
        status: { type: String, enum: ['Learning', 'Practicing', 'Mastered'], default: 'Learning' },
        addedAt: { type: Date, default: Date.now }
    }],
    practiceMinutes: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 1
    },
    lastPracticeDate: {
        type: Date,
        default: Date.now
    },
    weeklyGoals: {
        speakingDaysTarget: { type: Number, default: 5 },
        speakingDaysCompleted: { type: Number, default: 4 },
        wordsTarget: { type: Number, default: 20 },
        wordsCompleted: { type: Number, default: 12 },
        writingTarget: { type: Number, default: 3 },
        writingCompleted: { type: Number, default: 2 },
        minutesTarget: { type: Number, default: 60 },
        minutesCompleted: { type: Number, default: 42 }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EnglishProfile', englishProfileSchema);
