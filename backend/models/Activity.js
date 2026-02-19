const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    actionType: {
        type: String,
        enum: [
            'joined_group',
            'left_group',
            'completed_challenge',
            'joined_challenge',
            'shared_resource',
            'uploaded_file',
            'started_session',
            'ended_session',
            'achieved_goal',
            'earned_badge',
            'reached_milestone',
            'sent_message',
            'completed_pomodoro',
            'streak_milestone'
        ],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        itemId: mongoose.Schema.Types.ObjectId,
        itemType: String,
        itemName: String,
        xpEarned: Number,
        badgeEarned: String,
        milestoneValue: Number
    },
    xpAwarded: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
activitySchema.index({ group: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
