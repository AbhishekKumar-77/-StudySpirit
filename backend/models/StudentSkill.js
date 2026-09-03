const mongoose = require('mongoose');

const StudentSkillSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    semesterNumber: { type: Number, default: 2 },
    category: { type: String, default: 'Core CS' },
    mastery: { type: Number, default: 0 },
    status: { type: String, default: 'In Progress' }, // Completed, In Progress, Recommended Next, Locked
    color: { type: String, default: '#10b981' },
    prerequisites: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('StudentSkill', StudentSkillSchema);
