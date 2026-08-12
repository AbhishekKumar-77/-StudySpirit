const mongoose = require('mongoose');

const AcademicCourseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    semesterNumber: { type: Number, required: true, default: 2 },
    name: { type: String, required: true },
    code: { type: String },
    mastery: { type: Number, default: 0 },
    color: { type: String, default: '#10b981' },
    credits: { type: Number, default: 4 },
    topics: [{
        name: String,
        mastered: Boolean
    }]
}, { timestamps: true });

module.exports = mongoose.model('AcademicCourse', AcademicCourseSchema);
