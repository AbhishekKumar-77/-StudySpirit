const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    displayName: { type: String, default: 'Student' },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    xpToNextLevel: { type: Number, default: 1000 },
    currentSemester: { type: Number, default: 1 },
    batch: { type: String, default: 'CSE — 2026 Batch' },
    department: { type: String, default: 'Computer Science & Engineering' },
    startDate: { type: String, default: 'Jan 2026' },
    endDate: { type: String, default: 'Jun 2026' },
    targetRole: { type: String, default: 'Software Engineer' },
    targetDate: { type: String, default: 'June 2027' },
    overallProgressPercent: { type: Number, default: 0 },
    percentileRank: { type: Number, default: 50 },
    weeklyHoursSpent: { type: String, default: '0h 0m' },
    weeklyHoursTarget: { type: String, default: '6h 0m' },
    weeklyHoursDiff: { type: String, default: '0h vs last week' },
    currentFocus: {
        course: { type: String, default: 'Core Foundations' },
        topic: { type: String, default: 'Programming Fundamentals' },
        masteryPercent: { type: Number, default: 0 }
    },
    careerSteps: [{
        step: Number,
        title: String,
        completed: Boolean
    }]
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
