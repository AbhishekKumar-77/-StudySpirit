
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Frontend URL — always use studyspirit.in in production
// Override any vercel.app URL left in env vars
const getFrontendUrl = () => {
    const envUrl = process.env.FRONTEND_URL;
    if (!envUrl || envUrl.includes('vercel.app')) {
        return 'https://studyspirit.in';
    }
    return envUrl;
};

const FRONTEND_URL = getFrontendUrl();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/social-login', authController.socialLogin); // Keep for manual testing if needed

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { session: true, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
    (req, res) => {
        // Pass user data to frontend via URL params
        const userData = encodeURIComponent(JSON.stringify({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isAdmin: req.user.isAdmin,
            avatar: req.user.avatar,
            stats: req.user.stats
        }));
        res.redirect(`${FRONTEND_URL}/dashboard?user=${userData}`);
    }
);

// GitHub Auth Routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
    passport.authenticate('github', { session: true, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
    (req, res) => {
        const userData = encodeURIComponent(JSON.stringify({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isAdmin: req.user.isAdmin,
            avatar: req.user.avatar,
            stats: req.user.stats,
            githubProfile: req.user.githubProfile
        }));
        res.redirect(`${FRONTEND_URL}/dashboard?user=${userData}`);
    }
);

// Get Current User (Session based - fetch fresh from DB)
router.get('/me', async (req, res) => {
    if (req.isAuthenticated() && req.user) {
        try {
            const User = require('../models/User');
            const freshUser = await User.findById(req.user._id);
            if (!freshUser) {
                return res.status(401).json({ message: 'User not found' });
            }

            // If user is blocked, destroy their session
            if (freshUser.isBlocked) {
                req.logout((err) => {
                    return res.status(403).json({
                        message: 'Your account has been blocked.',
                        reason: freshUser.blockReason || 'Contact admin for details.'
                    });
                });
                return;
            }

            res.json({
                user: {
                    id: freshUser._id,
                    name: freshUser.name,
                    email: freshUser.email,
                    role: freshUser.role,
                    avatar: freshUser.avatar,
                    stats: freshUser.stats,
                    university: freshUser.university,
                    course: freshUser.course,
                    isVerified: freshUser.isVerified,
                    isAdmin: freshUser.isAdmin || false,
                    onboardingCompleted: freshUser.onboardingCompleted || false,
                    studyGoal: freshUser.studyGoal || '',
                    difficultyLevel: freshUser.difficultyLevel || ''
                }
            });

        } catch (err) {
            console.error('Error fetching user:', err);
            res.status(500).json({ message: 'Server error' });
        }
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// Logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect(`${FRONTEND_URL}/`);
    });
});

module.exports = router;
