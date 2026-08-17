const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        maxLength: 1000
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicCourse'
    },
    courseCode: {
        type: String,
        default: 'CSE101'
    },
    courseName: {
        type: String,
        default: 'Database Management Systems'
    },
    unit: {
        type: String,
        default: 'Unit 1'
    },
    topic: {
        type: String,
        default: 'General'
    },
    semester: {
        type: Number,
        default: 5
    },
    uploadedBy: {
        type: String,
        default: 'Prof. Sharma (Department of CSE)'
    },
    institution: {
        type: String,
        default: 'LPU'
    },
    verified: {
        type: Boolean,
        default: true
    },
    verificationBadge: {
        type: String,
        enum: ['Teacher Verified', 'Institution Resource', 'Student Shared'],
        default: 'Teacher Verified'
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    resourceType: {
        type: String,
        enum: ['PDF', 'NOTE', 'VIDEO', 'SLIDE', 'QUESTION_BANK', 'ASSIGNMENT', 'PREVIOUS_PAPER', 'REFERENCE', 'DOCUMENT', 'LINK', 'pdf', 'doc', 'video', 'image', 'code', 'link', 'ai_notes', 'flashcards', 'other'],
        default: 'PDF'
    },
    url: {
        type: String
    },
    fileUrl: {
        type: String
    },
    content: {
        type: String // Text / Notes content or document transcript
    },
    transcript: {
        type: String // Video or audio transcript for AI grounding
    },
    metadata: {
        thumbnail: String,
        author: String,
        duration: String,
        pageCount: Number,
        readTime: String,
        questionCount: Number,
        flashcards: [{
            front: String,
            back: String
        }]
    },
    duration: {
        type: String,
        default: '15:00'
    },
    pageCount: {
        type: Number,
        default: 12
    },
    readTime: {
        type: String,
        default: '8 min read'
    },
    questionCount: {
        type: Number,
        default: 20
    },
    fileSize: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        default: 'General'
    },
    tags: [{
        type: String,
        trim: true
    }],
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    progressPercent: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

resourceSchema.index({ courseCode: 1, topic: 1 });
resourceSchema.index({ category: 1 });

module.exports = mongoose.model('Resource', resourceSchema);

