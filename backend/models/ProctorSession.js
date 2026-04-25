const mongoose = require("mongoose");

const proctorLogSchema = new mongoose.Schema({
    event: { type: String, required: true }, // e.g., 'fullscreen-exit', 'clipboard-attempt', 'screenshot-attempt', 'killed-app'
    timestamp: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed // Any additional data
});

const proctorSessionSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'examModel' },
    examModel: { type: String, required: true, enum: ['Quiz', 'Challenge', 'InterviewExam'] },
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    deviceId: { type: String, required: true },
    
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    status: { type: String, enum: ['active', 'completed', 'terminated'], default: 'active' },
    
    // Heartbeat tracking
    lastHeartbeat: { type: Date, default: Date.now },
    
    // Aggregated Violation Flags
    flags: {
        fullscreenExits: { type: Number, default: 0 },
        appsKilled: [{ type: String }],
        screenshotAttempts: { type: Number, default: 0 },
        clipboardAttempts: { type: Number, default: 0 },
        networkBlockCount: { type: Number, default: 0 },
        isVmDetected: { type: Boolean, default: false },
        isVirtualCamDetected: { type: Boolean, default: false }
    },

    // Individual Logs
    logs: [proctorLogSchema]
});

module.exports = mongoose.model("ProctorSession", proctorSessionSchema);
