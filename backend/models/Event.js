const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    platform: {
        type: String, // 'LinkedIn', 'Unstop', 'CodeChef', 'Hackerrank', 'Other'
        required: true
    },
    description: String,
    date: {
        type: Date,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Hackathon', 'Webinar', 'Contest', 'Workshop', 'Conference'],
        default: 'Contest'
    },
    imageUrl: String,
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    monitors: [{ // users who are tracking this event
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);
