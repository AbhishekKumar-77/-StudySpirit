const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['DSA', 'System Design', 'Backend', 'Frontend', 'CS Fundamentals', 'Behavioral', 'HR', 'DBMS', 'OS', 'Networks'],
        required: true
    },
    role: {
        type: String,
        default: 'Software Engineer'
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    questionText: {
        type: String,
        required: true
    },
    sampleAnswer: {
        type: String,
        default: ''
    },
    keyConcepts: [String],
    companyTags: [String],
    timesAsked: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

questionBankSchema.index({ category: 1, difficulty: 1, role: 1 });

module.exports = mongoose.model('QuestionBank', questionBankSchema);
