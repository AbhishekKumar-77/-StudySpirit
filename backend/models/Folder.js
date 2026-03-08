const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    color: {
        type: String,
        default: '#6366f1' // Indigo-500 default
    },
    icon: {
        type: String,
        default: 'Folder'
    },
    parentFolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster lookups
folderSchema.index({ owner: 1, parentFolder: 1 });

module.exports = mongoose.model('Folder', folderSchema);
