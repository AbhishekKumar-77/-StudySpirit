const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    dueDate: {
        type: Date
    }
});

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a goal title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    targetDate: {
        type: Date,
        required: [true, 'Please provide a target date']
    },
    category: {
        type: String, // e.g., Academic, Career, Skill, Health
        default: 'Academic'
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'archived'],
        default: 'active'
    },
    milestones: [milestoneSchema],
    completedAt: {
        type: Date
    }
}, { timestamps: true });

// Check if model exists before creating
module.exports = mongoose.models.Goal || mongoose.model('Goal', goalSchema);
