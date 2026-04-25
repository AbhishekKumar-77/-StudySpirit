const mongoose = require("mongoose");

const deviceFingerprintSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional: If we want to tie a device strictly to a user
    fingerprint: {
        cpu: String,
        ramGB: Number,
        os: String,
        arch: String,
        gpu: String,
        macAddressHash: String
    },
    isBanned: { type: Boolean, default: false },
    registeredAt: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DeviceFingerprint", deviceFingerprintSchema);
