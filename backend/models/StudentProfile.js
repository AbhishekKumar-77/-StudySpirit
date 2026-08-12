const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    displayName: { type: String, default: 'sasa' },
    level: { type: Number, default: 3 },
    xp: { type: Number, default: 4630 },
    xpToNextLevel: { type: Number, default: 6000 },
    currentSemester: { type: Number, default: 2 },
    batch: { type: String, default: 'CSE — 2026 Batch' },
    department: { type: String, default: 'Computer Science & Engineering' },
    startDate: { type: String, default: 'Feb 2026' },
    endDate: { type: String, default: 'Jun 2026' },
    targetRole: { type: String, default: 'Software Engineer' },
    targetDate: { type: String, default: 'June 2027' },
    overallProgressPercent: { type: Number, default: 68 },
    percentileRank: { type: Number, default: 65 },
    weeklyHoursSpent: { type: String, default: '6h 20m' },
    weeklyHoursTarget: { type: String, default: '7h 15m' },
    weeklyHoursDiff: { type: String, default: '+1h 30m vs last week' },
    currentFocus: {
        course: { type: String, default: 'Data Structures' },
        topic: { type: String, default: 'Linked List' },
        masteryPercent: { type: Number, default: 66 }
    },
    careerSteps: [{
        step: Number,
        title: String,
        completed: Boolean
    }]
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
