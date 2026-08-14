const mongoose = require('mongoose');

const topicMasterySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true, index: true },
    topic: { type: String, required: true, index: true },
    masteryPercentage: { type: Number, default: 0, min: 0, max: 100 },
    accuracy: { type: Number, default: 0, min: 0, max: 100 },
    totalAttempted: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    mistakeCount: { type: Number, default: 0 },
    resolvedMistakesCount: { type: Number, default: 0 },
    lastPracticedAt: { type: Date, default: Date.now },
    revisionDueDate: { type: Date, default: Date.now, index: true },
    confidenceScore: { type: Number, default: 50 }, // 0 to 100 based on user confidence selections
    status: { 
        type: String, 
        enum: ['weak', 'due_for_revision', 'strong', 'new_topic', 'mastered'], 
        default: 'new_topic' 
    }
});

topicMasterySchema.index({ userId: 1, subject: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('TopicMastery', topicMasterySchema);
