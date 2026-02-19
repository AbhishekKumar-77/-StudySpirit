const express = require('express');
const router = express.Router();
const discussController = require('../controllers/discussController');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Not authenticated' });
};

// Trending
router.get('/trending', discussController.getTrendingTopics);

// Channels
router.get('/channels/stats', discussController.getChannelStats);

// Posts
router.get('/posts', discussController.getPosts);
router.post('/posts', isAuthenticated, discussController.createPost);
router.post('/posts/:id/upvote', isAuthenticated, discussController.toggleUpvote);

// Direct Messages & Users
router.get('/users', isAuthenticated, discussController.getUsers);
router.get('/dms/:userId', isAuthenticated, discussController.getDirectMessages);
router.post('/dms', isAuthenticated, discussController.sendDirectMessage);

// Connections
router.get('/network', isAuthenticated, discussController.getNetwork);
router.post('/connections/request', isAuthenticated, discussController.sendConnectionRequest);
router.post('/connections/accept', isAuthenticated, discussController.acceptConnectionRequest);
router.post('/connections/reject', isAuthenticated, discussController.rejectConnectionRequest);

// Comments
router.get('/posts/:postId/comments', discussController.getComments);
router.post('/posts/:postId/comments', isAuthenticated, discussController.postComment);

module.exports = router;
