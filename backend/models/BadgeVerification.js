const mongoose = require('mongoose');

const BadgeVerificationSchema = new mongoose.Schema({
    badgeId: { type: String, required: true }, // e.g., 'react-advanced'
    name: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issuedAt: { type: Date, default: Date.now },
    verifiedBy: { type: String, default: 'StudySpirit AI Proctor' },
    score: { type: Number },
    totalScore: { type: Number },
    verificationCode: { type: String, unique: true, required: true }, // Unique ID for the URL
    metadata: {
        examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        examType: String
    }
});

module.exports = mongoose.model('BadgeVerification', BadgeVerificationSchema);
