const mongoose = require('mongoose');

const AIRecommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recType: {
        type: String,
        enum: ['focus', 'weak_area', 'project'],
        required: true
    },
    badgeLabel: { type: String }, // e.g. "Focus recommendation", "Weak-area recommendation", "Project recommendation"
    title: { type: String, required: true },
    description: { type: String, required: true },
    actionText: { type: String, default: 'Start Learning →' },
    actionLink: { type: String, default: '#' },
    tag: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AIRecommendation', AIRecommendationSchema);
