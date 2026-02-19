const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        required: true,
        maxLength: 500
    },
    icon: {
        type: String,
        default: '🎯'
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: false // Not required for public challenges
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    challengeType: {
        type: String,
        enum: ['problems', 'streak', 'time', 'project', 'custom'],
        default: 'problems'
    },
    target: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: 'problems'
    },
    reward: {
        xp: { type: Number, default: 100 },
        badge: String,
        title: String
    },
    deadline: {
        type: Date,
        required: true
    },
    // NEW: Visibility for public/private challenges
    visibility: {
        type: String,
        enum: ['public', 'private', 'group'],
        default: 'group' // 'group' = only group members, 'public' = all platform users, 'private' = only creator
    },
    category: {
        type: String,
        enum: ['DSA', 'Web Dev', 'AI/ML', 'System Design', 'Mobile Dev', 'DevOps', 'General', 'Competitive', 'Interview Prep'],
        default: 'General'
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        progress: {
            type: Number,
            default: 0
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: Date,
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'completed', 'expired', 'cancelled'],
        default: 'active'
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
    },
    // Stats for public challenges
    totalViews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


// Virtual for overall progress
challengeSchema.virtual('overallProgress').get(function () {
    if (this.participants.length === 0) return 0;
    const totalProgress = this.participants.reduce((sum, p) => sum + p.progress, 0);
    return Math.round(totalProgress / this.participants.length);
});

// Virtual for completion percentage
challengeSchema.virtual('completionRate').get(function () {
    if (this.participants.length === 0) return 0;
    const completed = this.participants.filter(p => p.completed).length;
    return Math.round((completed / this.participants.length) * 100);
});

challengeSchema.set('toJSON', { virtuals: true });
challengeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Challenge', challengeSchema);
