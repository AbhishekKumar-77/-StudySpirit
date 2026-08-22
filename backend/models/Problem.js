const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    input: mongoose.Schema.Types.Mixed,
    output: mongoose.Schema.Types.Mixed,
    explanation: String
}, { _id: false });

const problemSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium', index: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],
    functionName: { type: String, default: 'solution' },
    
    // Skeleton starter code per language
    starterCode: {
        python: String,
        javascript: String,
        typescript: String,
        cpp: String,
        java: String,
        c: String
    },

    // Sample visible test cases shown to the user
    visibleTestCases: [testCaseSchema],

    // Hidden stress-test cases for contest evaluation
    hiddenTestCases: [testCaseSchema],

    hints: [{ type: String }],
    editorial: String,
    
    // Stats tracking
    totalSubmissions: { type: Number, default: 0 },
    totalAccepted: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 100 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', problemSchema);
