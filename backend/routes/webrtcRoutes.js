const express = require('express');
const router = express.Router();
const { AccessToken } = require('livekit-server-sdk');

// Auth middleware (duplicated or imported)
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    if (req.user) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Please login to continue' });
};

router.post('/token', isAuthenticated, async (req, res) => {
    try {
        const { roomName, userId, userName } = req.body;

        if (!roomName || !userId) {
            return res.status(400).json({ success: false, message: 'roomName and userId are required' });
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        // If credentials are not configured, send a helpful mock response for dev testing
        if (!apiKey || !apiSecret || apiKey === 'devkey' || apiSecret === 'secret') {
            console.warn('⚠️ LiveKit credentials not configured. Returning local mock token.');
            return res.json({
                success: true,
                token: `mock_jwt_token_for_${userId}_in_${roomName}`,
                isMock: true,
                serverUrl: process.env.LIVEKIT_URL || 'ws://localhost:7880'
            });
        }

        // Create the AccessToken
        const at = new AccessToken(apiKey, apiSecret, {
            identity: userId,
            name: userName || userId,
            ttl: 2 * 60 * 60, // 2 hours
        });

        // Grant permissions
        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true
        });

        const token = await at.toJwt();
        res.json({
            success: true,
            token,
            isMock: false,
            serverUrl: process.env.LIVEKIT_URL
        });
    } catch (error) {
        console.error('Error generating LiveKit token:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
