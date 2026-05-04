const mongoose = require('mongoose');

const CareerProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    
    // Verified scores from StudySpirit modules
    verifiedSkills: [{
        skillName: { type: String, required: true }, // e.g., 'React', 'JavaScript', 'Communication'
        score: { type: Number, default: 0 },         // 0-100 percentage
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Pro'] },
        verifiedBy: { type: String },                // 'CodeSpirit Exam', 'AI Extempore', 'Quiz'
        lastTestedAt: { type: Date, default: Date.now }
    }],

    // AI Assessed Soft Skills
    softSkillsProfile: {
        communicationScore: { type: Number, default: 0 }, // from Extempore/Interview
        confidenceScore: { type: Number, default: 0 },
        vocabularyLevel: { type: String, default: 'A1' }, // A1 to C2
        overallRating: { type: Number, default: 0 } // out of 10
    },

    // StudySpirit Activity
    consistencyScore: { type: Number, default: 0 }, // Calculated based on daily activity
    completedProjects: [{
        title: String,
        description: String,
        repoLink: String,
        verified: { type: Boolean, default: false } // e.g., submitted as an assignment
    }],

    // Job Match Preferences
    preferences: {
        roles: [{ type: String }],
        locations: [{ type: String }],
        expectedSalary: String,
        remoteOnly: { type: Boolean, default: false }
    },

    isPublic: { type: Boolean, default: true }, // Whether employers can see their passport
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CareerProfile', CareerProfileSchema);
