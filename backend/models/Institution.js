const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    domain: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    subscriptionPlan: {
        type: String,
        enum: ['free', 'premium', 'enterprise'],
        default: 'free'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Institution', institutionSchema);
