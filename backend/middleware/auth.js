const User = require('../models/User');

module.exports = async (req, res, next) => {
    // 1. Session authentication via Passport
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        return next();
    }

    // 2. Fallback authentication via custom header or Authorization token
    try {
        const userIdHeader = req.headers['x-user-id'] || req.headers['x-userid'];
        const authHeader = req.headers['authorization'];
        let candidateId = userIdHeader || req.body?.creatorId || req.body?.userId || req.query?.userId;

        if (!candidateId && authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7).trim();
            if (token && token.match(/^[0-9a-fA-F]{24}$/)) {
                candidateId = token;
            }
        }

        if (candidateId && String(candidateId).match(/^[0-9a-fA-F]{24}$/)) {
            const foundUser = await User.findById(candidateId);
            if (foundUser && !foundUser.isBlocked) {
                req.user = foundUser;
                return next();
            }
        }
    } catch (err) {
        console.warn('Auth fallback error in middleware:', err.message);
    }

    // For API calls, return 401
    return res.status(401).json({ success: false, message: 'Unauthorized access' });
};
