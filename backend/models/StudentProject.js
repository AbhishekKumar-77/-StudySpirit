const mongoose = require('mongoose');

const StudentProjectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'In Progress' },
    progress: { type: Number, default: 0 },
    dueDate: { type: String },
    relatedSkills: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('StudentProject', StudentProjectSchema);
