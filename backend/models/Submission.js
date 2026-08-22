const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', index: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodeSession', index: true },
    challengeId: String,
    
    language: { type: String, required: true },
    code: { type: String, required: true },
    
    status: { 
        type: String, 
        enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Compilation Error', 'Runtime Error'], 
        required: true,
        index: true 
    },
    
    runtimeMs: { type: Number, default: 0 },
    memoryKb: { type: Number, default: 0 },
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    
    testResults: Array,
    
    createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Submission', submissionSchema);
