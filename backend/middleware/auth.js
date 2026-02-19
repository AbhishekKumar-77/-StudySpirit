module.exports = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // For API calls, return 401
    return res.status(401).json({ message: 'Unauthorized access' });
};
