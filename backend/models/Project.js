const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    // ── Core (existing) ──────────────────────────────────────────
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
    // Legacy flat tech stack — preserved for backward compatibility
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
        enum: ['public', 'private', 'recruiter-only', 'institution-only'],
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
        type: String,
        default: null
    },
    files: [{
        name: String,
        path: String,
        content: String,
        type: String,
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
        enum: ['draft', 'in-progress', 'completed', 'archived', 'published'],
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
    }],

    // ── New Fields (all optional, non-breaking) ──────────────────

    // Project type & domain classification
    projectType: {
        type: String,
        enum: ['personal', 'academic', 'hackathon', 'capstone', 'team', 'open-source', 'freelance', 'research', 'startup', 'other'],
        default: 'personal'
    },
    domain: {
        type: String,
        enum: ['ai-ml', 'web', 'mobile', 'cloud', 'cybersecurity', 'data-science', 'blockchain', 'iot', 'devops', 'game', 'other'],
        default: 'other'
    },

    // Structured project story
    story: {
        problem: { type: String, default: '' },
        solution: { type: String, default: '' },
        implementation: { type: String, default: '' },
        impact: { type: String, default: '' }
    },

    // Structured technology stack (grouped by category)
    technologies: [{
        category: { type: String, trim: true }, // e.g. "Frontend", "Backend"
        items: [{ type: String, trim: true }]   // e.g. ["React", "Tailwind CSS"]
    }],

    // Team members
    teamMembers: [{
        name: { type: String, trim: true },
        role: { type: String, trim: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    }],

    // Owner's contribution
    myContribution: {
        roles: [{ type: String }], // ['Frontend', 'Backend', 'AI', ...]
        description: { type: String, default: '' }
    },

    // Project evidence
    evidence: {
        screenshots: [{ type: String }],          // URLs
        demoVideoUrl: { type: String, default: '' },
        documentationUrl: { type: String, default: '' },
        presentationUrl: { type: String, default: '' },
        figmaUrl: { type: String, default: '' }
    },

    // Featured flag (shown in portfolio)
    featured: {
        type: Boolean,
        default: false
    },

    // Build log / development timeline
    buildLogs: [{
        date: { type: Date, default: Date.now },
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        commitUrl: { type: String, default: '' },
        mediaUrl: { type: String, default: '' }
    }],

    // Cached project strength score (0-100)
    strengthScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // Cached AI summary for recruiter view
    aiSummary: {
        type: String,
        default: ''
    },

    // GitHub metadata (imported from public API)
    githubMeta: {
        languages: { type: Object, default: {} },
        topics: [{ type: String }],
        stars: { type: Number, default: 0 },
        forks: { type: Number, default: 0 },
        lastPushed: { type: Date, default: null }
    },

    // Teacher review
    teacherReview: {
        reviewed: { type: Boolean, default: false },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        feedback: { type: String, default: '' },
        approved: { type: Boolean, default: false },
        reviewedAt: { type: Date, default: null }
    },

    // Recruiter bookmarks (array of recruiter user IDs)
    bookmarkedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

}, {
    timestamps: true
});

// ── Indexes ──────────────────────────────────────────────────────
projectSchema.index({ name: 'text', description: 'text', tags: 'text' });
projectSchema.index({ owner: 1, featured: 1 });
projectSchema.index({ visibility: 1, strengthScore: -1 });
projectSchema.index({ domain: 1, projectType: 1 });

// ── Virtuals ─────────────────────────────────────────────────────
projectSchema.virtual('starCount').get(function () {
    return this.stars ? this.stars.length : 0;
});
projectSchema.virtual('forkCount').get(function () {
    return this.forks ? this.forks.length : 0;
});

// Compute strength score from project data
projectSchema.methods.computeStrength = function () {
    let score = 0;
    // Name + description (10pts)
    if (this.name && this.name.trim()) score += 5;
    if (this.description && this.description.length > 30) score += 5;
    // Story (30pts)
    if (this.story?.problem && this.story.problem.length > 20) score += 8;
    if (this.story?.solution && this.story.solution.length > 20) score += 8;
    if (this.story?.implementation && this.story.implementation.length > 20) score += 7;
    if (this.story?.impact && this.story.impact.length > 20) score += 7;
    // Tech stack (10pts)
    const techCount = this.technologies?.reduce((a, t) => a + (t.items?.length || 0), 0) || this.techStack?.length || 0;
    score += Math.min(10, techCount * 2);
    // GitHub (15pts)
    if (this.githubUrl && this.githubUrl.trim()) score += 15;
    // Live Demo (15pts)
    if (this.liveUrl && this.liveUrl.trim()) score += 15;
    // Screenshots (10pts)
    const shots = this.evidence?.screenshots?.length || 0;
    score += Math.min(10, shots * 5);
    // Documentation (5pts)
    if (this.evidence?.documentationUrl) score += 5;
    return Math.min(100, Math.round(score));
};

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
