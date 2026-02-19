/**
 * Admin Authentication Middleware
 * Checks if the user is authenticated AND is an admin.
 * Must be used AFTER the regular auth middleware or passport session.
 */
module.exports = (req, res, next) => {
    // Check if user is logged in
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: 'Unauthorized — please log in' });
    }

    // Check if user is admin
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden — admin access only' });
    }

    next();
};
