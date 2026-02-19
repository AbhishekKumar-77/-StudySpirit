const mongoose = require('mongoose');

const studyRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        trim: true,
        maxLength: 500
    },
    topic: {
        type: String,
        required: true,
        maxLength: 200
    },
    avatar: {
        type: String,
        default: '📖'
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    category: {
        type: String,
        enum: ['DSA', 'Web Dev', 'AI/ML', 'System Design', 'Mobile Dev', 'DevOps', 'General'],
        default: 'General'
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate'
    },
    language: {
        type: String,
        default: 'English'
    },
    maxParticipants: {
        type: Number,
        default: 20
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        isMuted: {
            type: Boolean,
            default: true
        },
        isCameraOn: {
            type: Boolean,
            default: false
        },
        isScreenSharing: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['active', 'away', 'busy'],
            default: 'active'
        }
    }],
    status: {
        type: String,
        enum: ['scheduled', 'live', 'ended'],
        default: 'live'
    },
    scheduledStart: {
        type: Date
    },
    scheduledEnd: {
        type: Date
    },
    actualStartTime: {
        type: Date,
        default: Date.now
    },
    actualEndTime: {
        type: Date
    },
    pomodoroSettings: {
        focusDuration: { type: Number, default: 25 }, // minutes
        breakDuration: { type: Number, default: 5 },
        isRunning: { type: Boolean, default: false },
        currentPhase: { type: String, enum: ['focus', 'break'], default: 'focus' },
        timeRemaining: { type: Number, default: 1500 } // seconds
    },
    isRecording: {
        type: Boolean,
        default: false
    },
    recordingUrl: {
        type: String
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Virtual for participant count
studyRoomSchema.virtual('participantCount').get(function () {
    return this.participants.length;
});

// Virtual for duration
studyRoomSchema.virtual('duration').get(function () {
    if (this.actualEndTime) {
        return Math.floor((this.actualEndTime - this.actualStartTime) / 1000);
    }
    return Math.floor((Date.now() - this.actualStartTime) / 1000);
});

studyRoomSchema.set('toJSON', { virtuals: true });
studyRoomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StudyRoom', studyRoomSchema);
