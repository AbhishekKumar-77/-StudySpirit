const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    readme: {
        type: String,
        default: '# Project Title\n\nDescribe your project here...'
    },
    techStack: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        enum: ['web', 'mobile', 'ai-ml', 'backend', 'fullstack', 'devops', 'blockchain', 'game', 'other'],
        default: 'other'
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    githubUrl: {
        type: String,
        trim: true
    },
    liveUrl: {
        type: String,
        trim: true
    },
    thumbnail: {
        type: String, // URL or base64
        default: null
    },
    files: [{
        name: String,
        path: String,
        content: String, // For small text files
        type: String, // 'file' or 'folder'
        size: Number,
        language: String
    }],
    stars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    forks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    forkedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    views: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'archived'],
        default: 'in-progress'
    },
    collaborators: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['viewer', 'contributor', 'admin'],
            default: 'viewer'
        }
    }],
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Index for search
projectSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for star count
projectSchema.virtual('starCount').get(function () {
    return this.stars ? this.stars.length : 0;
});

// Virtual for fork count
projectSchema.virtual('forkCount').get(function () {
    return this.forks ? this.forks.length : 0;
});

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
