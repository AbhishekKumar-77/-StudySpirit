const DeviceFingerprint = require('../models/DeviceFingerprint');
const ProctorSession = require('../models/ProctorSession');

// Middleware to verify StudySpirit Browser Header
exports.verifySecureBrowser = (req, res, next) => {
    const isBrowser = req.headers['x-studyspirit-browser'];
    const token = req.headers['x-studyspirit-token'];

    if (!isBrowser || token !== 'SSB-2024-SECURE-TOKEN-XK9P2M7Q4N') {
        return res.status(403).json({ success: false, message: 'Forbidden: Requests must originate from StudySpirit Secure Browser.' });
    }
    next();
};

// POST /api/proctor/device/register
exports.registerDevice = async (req, res) => {
    try {
        const { deviceId, fingerprint } = req.body;
        
        if (!deviceId) return res.status(400).json({ success: false, message: 'Device ID required' });

        let device = await DeviceFingerprint.findOne({ deviceId });

        if (device) {
            // Update last seen
            device.lastSeen = Date.now();
            if (fingerprint) device.fingerprint = fingerprint;
            await device.save();
        } else {
            // Register new device
            device = new DeviceFingerprint({ deviceId, fingerprint });
            await device.save();
        }

        if (device.isBanned) {
            return res.status(403).json({ success: false, message: 'Device is banned from exams.' });
        }

        res.status(200).json({ success: true, message: 'Device registered successfully.' });
    } catch (error) {
        console.error('Device Registration Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// POST /api/proctor/heartbeat
exports.heartbeat = async (req, res) => {
    try {
        const { examId, studentId, deviceId, timestamp, flags } = req.body;

        if (!examId || !studentId || !deviceId) {
            return res.status(400).json({ success: false, message: 'Missing required session info.' });
        }

        // Find active session or create one
        let session = await ProctorSession.findOne({ examId, studentId, deviceId, status: 'active' });

        if (!session) {
            session = new ProctorSession({
                examId,
                examModel: 'Quiz', // Defaulting to Quiz for now, can be dynamic
                studentId,
                deviceId,
                flags: flags || {},
            });
        } else {
            session.lastHeartbeat = timestamp || Date.now();
            if (flags) {
                // Update flags with highest values (since flags are cumulative on client side)
                session.flags.fullscreenExits = Math.max(session.flags.fullscreenExits || 0, flags.fullscreenExits || 0);
                session.flags.screenshotAttempts = Math.max(session.flags.screenshotAttempts || 0, flags.screenshotAttempts || 0);
                session.flags.clipboardAttempts = Math.max(session.flags.clipboardAttempts || 0, flags.clipboardAttempts || 0);
                session.flags.networkBlockCount = Math.max(session.flags.networkBlockCount || 0, flags.networkBlockCount || 0);
                session.flags.isVmDetected = session.flags.isVmDetected || flags.isVmDetected;
                session.flags.isVirtualCamDetected = session.flags.isVirtualCamDetected || flags.isVirtualCamDetected;
                
                if (flags.appsKilled && Array.isArray(flags.appsKilled)) {
                    // merge unique
                    session.flags.appsKilled = [...new Set([...(session.flags.appsKilled || []), ...flags.appsKilled])];
                }
            }
        }

        await session.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Proctor Heartbeat Error:', error);
        res.status(500).json({ success: false });
    }
};

// POST /api/proctor/log
exports.logEvent = async (req, res) => {
    try {
        const { examId, studentId, deviceId, event, timestamp, ...metadata } = req.body;

        if (!examId || !studentId || !deviceId || !event) {
            return res.status(400).json({ success: false, message: 'Missing required log info.' });
        }

        const session = await ProctorSession.findOne({ examId, studentId, deviceId, status: 'active' });

        if (session) {
            session.logs.push({
                event,
                timestamp: timestamp || Date.now(),
                metadata
            });
            await session.save();
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Proctor Log Error:', error);
        res.status(500).json({ success: false });
    }
};

// POST /api/proctor/session-end
exports.endSession = async (req, res) => {
    try {
        const { examId, studentId, deviceId, finalFlags } = req.body;

        const session = await ProctorSession.findOne({ examId, studentId, deviceId, status: 'active' });

        if (session) {
            session.status = 'completed';
            session.endTime = Date.now();
            if (finalFlags) {
                session.flags = finalFlags;
            }
            await session.save();
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Proctor Session End Error:', error);
        res.status(500).json({ success: false });
    }
};
