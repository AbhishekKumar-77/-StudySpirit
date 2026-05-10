
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        // Not required if using social login, but we'll handle that logic in controller
        required: function () { return !this.googleId && !this.githubId; }
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'recruiter'],
        default: 'student'
    },
    // Onboarding
    onboardingCompleted: {
        type: Boolean,
        default: false
    },
    studyGoal: {
        type: String,
        enum: ['DSA', 'Web Dev', 'AI/ML', 'Interview Prep', 'Competitive', ''],
        default: ''
    },
    difficultyLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', ''],
        default: ''
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockReason: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        select: false // Hide by default
    },
    verificationCodeExpires: {
        type: Date,
        select: false
    },
    university: {
        type: String,
        trim: true
    },
    course: {
        type: String, // e.g., "Computer Science", "B.Tech"
        trim: true
    },
    reputation: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'away'],
        default: 'offline'
    },
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    pendingConnections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    avatar: {
        type: String,
        default: '👨‍🎓'
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
    githubProfile: {
        username: String,
        publicRepos: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        following: { type: Number, default: 0 },
        bio: String,
        location: String,
        company: String,
        blog: String,
        avatarUrl: String,
        profileUrl: String,
        repositories: [{
            name: String,
            description: String,
            language: String,
            stars: Number,
            forks: Number,
            url: String
        }]
    },
    stats: {
        streak: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        dailyGoals: { type: Number, default: 5 },
        completionRate: { type: Number, default: 0 },
        totalProblems: { type: Number, default: 0 },
        totalStudyTime: { type: Number, default: 0 } // in seconds
    },
    quizStats: {
        totalScore: { type: Number, default: 0 },
        quizzesTaken: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        highestScore: { type: Number, default: 0 },
        bestTime: { type: Number, default: null } // Best time in seconds (lowest = best)
    },
    lastLoginDate: {
        type: Date,
        default: Date.now
    },
    // Daily activity tracking for heatmap (last 365 days)
    activityLog: [{
        date: { type: String, required: true }, // YYYY-MM-DD format
        problemsSolved: { type: Number, default: 0 },
        studyTime: { type: Number, default: 0 }, // in seconds
        xpEarned: { type: Number, default: 0 },
        focusSessions: { type: Number, default: 0 }
    }],
    // Study session tracking
    studySessions: [{
        startTime: { type: Date, required: true },
        endTime: Date,
        duration: { type: Number, default: 0 }, // in seconds
        sessionType: { type: String, enum: ['focus', 'break'], default: 'focus' },
        completed: { type: Boolean, default: false }
    }],
    // Learning Path Progress
    learningPath: {
        currentTopic: { type: String, default: 'Arrays & Hashing' },
        overallProgress: { type: Number, default: 0 },
        topics: [{
            name: String,
            completed: { type: Number, default: 0 },
            total: Number,
            status: { type: String, enum: ['locked', 'active', 'completed'], default: 'locked' },
            lastAccessed: Date
        }]
    },
    platformProfiles: {
        leetcode: {
            username: String,
            connected: { type: Boolean, default: false },
            rating: { type: Number, default: 0 },
            problemsSolved: { type: Number, default: 0 },
            rank: String,
            easy: { type: Number, default: 0 },
            medium: { type: Number, default: 0 },
            hard: { type: Number, default: 0 }
        },
        codeforces: {
            username: String,
            connected: { type: Boolean, default: false },
            rating: { type: Number, default: 0 },
            problemsSolved: { type: Number, default: 0 },
            rank: String,
            maxRating: { type: Number, default: 0 }
        },
        codechef: {
            username: String,
            connected: { type: Boolean, default: false },
            rating: { type: Number, default: 0 },
            problemsSolved: { type: Number, default: 0 },
            stars: String,
            maxRating: { type: Number, default: 0 }
        },
        hackerrank: {
            username: String,
            connected: { type: Boolean, default: false },
            points: { type: Number, default: 0 },
            problemsSolved: { type: Number, default: 0 }
        }
    },
    // Contest Reminders
    contestReminders: [{
        contestName: String,
        platform: String,
        startTime: Date,
        reminded: { type: Boolean, default: false }
    }],
    tasks: [{
        title: String,
        completed: { type: Boolean, default: false },
        priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
        xp: { type: Number, default: 25 },
        category: { type: String, default: 'general' },
        createdAt: { type: Date, default: Date.now }
    }],
    chatHistory: [{
        role: { type: String, enum: ['user', 'ai'], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    badges: [{
        name: { type: String, required: true },
        icon: { type: String, default: '🏆' },
        description: String,
        dateEarned: { type: Date, default: Date.now }
    }],
    notifications: [{
        message: String,
        type: { type: String, enum: ['quiz', 'exam', 'group', 'forum', 'system'], default: 'system' },
        read: { type: Boolean, default: false },
        link: String,
        createdAt: { type: Date, default: Date.now }
    }],
    recruiterProfile: {
        companyName: String,
        designation: String,
        savedCandidates: [{
            candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            savedAt: { type: Date, default: Date.now },
            notes: String
        }]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-award badges based on milestones
userSchema.pre('save', function(next) {
    const user = this;
    if (!user.badges) user.badges = [];
    
    const awardBadge = (name, icon, description) => {
        if (!user.badges.some(b => b.name === name)) {
            user.badges.push({ name, icon, description, dateEarned: new Date() });
            
            // Also generate a notification for the new badge
            if (!user.notifications) user.notifications = [];
            user.notifications.push({
                message: `🎉 Milestone Reached: You earned the "${name}" badge!`,
                type: 'system',
                read: false,
                link: '/career',
                createdAt: new Date()
            });
        }
    };

    if (user.stats) {
        if (user.stats.level >= 5) awardBadge('Rookie Coder', '🌟', 'Reached Level 5. Unlock Group Mode challenges.');
        if (user.stats.level >= 10) awardBadge('Code Warrior', '⚔️', 'Reached Level 10. Unlock exclusive code rooms.');
        if (user.stats.streak >= 7) awardBadge('Week Warrior', '🔥', 'Maintained a 7-day study streak.');
        if (user.stats.streak >= 30) awardBadge('Iron Will', '🛡️', 'Maintained a 30-day study streak.');
    }

    next();
});

module.exports = mongoose.model('User', userSchema);
