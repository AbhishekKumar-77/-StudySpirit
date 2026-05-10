const mongoose = require('mongoose');

const CampusDriveSchema = new mongoose.Schema({
    title: { type: String, required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
    targetUniversities: [{ type: String }],
    assessments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }], // Quizzes attached to this drive
    applicants: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['applied', 'shortlisted', 'rejected', 'hired'], default: 'applied' },
        assessmentScore: { type: Number, default: 0 },
        appliedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CampusDrive', CampusDriveSchema);
