const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    description: {
        type: String,
        trim: true,
        maxLength: 500
    },
    avatar: {
        type: String,
        default: '📚'
    },
    color: {
        type: String,
        enum: ['violet', 'cyan', 'emerald', 'pink', 'amber', 'blue', 'red'],
        default: 'violet'
    },
    goal: {
        type: String,
        required: true,
        maxLength: 200
    },
    category: {
        type: String,
        enum: ['DSA', 'Web Dev', 'AI/ML', 'System Design', 'Mobile Dev', 'DevOps', 'General'],
        default: 'General'
    },
    privacy: {
        type: String,
        enum: ['public', 'private', 'invite-only'],
        default: 'public'
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['admin', 'moderator', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        xpContributed: {
            type: Number,
            default: 0
        },
        streak: {
            type: Number,
            default: 0
        },
        lastActive: {
            type: Date,
            default: Date.now
        }
    }],
    maxMembers: {
        type: Number,
        default: 50
    },
    stats: {
        totalXp: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        sessionsCompleted: { type: Number, default: 0 },
        challengesCompleted: { type: Number, default: 0 },
        resourcesShared: { type: Number, default: 0 }
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    inviteCode: {
        type: String,
        unique: true,
        sparse: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    joinRequests: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate invite code before saving
groupSchema.pre('save', async function () {
    if (!this.inviteCode) {
        this.inviteCode = generateInviteCode();
    }
    this.updatedAt = new Date();
});

function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Virtual for member count
groupSchema.virtual('memberCount').get(function () {
    return this.members.length;
});

// Virtual for active members (online in last 5 minutes)
groupSchema.virtual('activeNow').get(function () {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.members.filter(m => m.lastActive > fiveMinutesAgo).length;
});

groupSchema.set('toJSON', { virtuals: true });
groupSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Group', groupSchema);
