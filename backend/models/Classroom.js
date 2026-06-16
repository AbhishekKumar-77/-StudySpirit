const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    code: { type: String, required: true, unique: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lectures: [{
        title: { type: String, required: true },
        description: { type: String },
        scheduledStart: { type: Date, required: true },
        duration: { type: Number, default: 60 }, // duration in minutes
        isLive: { type: Boolean, default: false },
        recordingUrl: { type: String },
        liveRoomId: { type: String }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Classroom', classroomSchema);
