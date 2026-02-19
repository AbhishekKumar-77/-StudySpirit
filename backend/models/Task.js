const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a task title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    dueDate: {
        type: Date
    },
    subject: {
        type: String,
        trim: true,
        default: 'General'
    },
    estimatedTime: {
        type: Number, // In minutes
        default: 60
    },
    checklist: [checklistItemSchema],
    tags: [String],
    completedAt: {
        type: Date
    }
}, { timestamps: true });

// Check if model exists before creating to prevent overwrite errors in hot reloads
module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
