const express = require('express');
const router = express.Router();

// Controllers
const groupController = require('../controllers/groupController');
const studyRoomController = require('../controllers/studyRoomController');
const challengeController = require('../controllers/challengeController');
const resourceController = require('../controllers/resourceController');
const messageController = require('../controllers/messageController');
const activityController = require('../controllers/activityController');

// Auth middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    // For testing, allow if user is set
    if (req.user) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Please login to continue' });
};

// ============== GROUP ROUTES ==============
router.post('/groups', isAuthenticated, groupController.createGroup);
router.get('/groups', isAuthenticated, groupController.getAllGroups);
router.get('/groups/my', isAuthenticated, groupController.getMyGroups);
router.get('/groups/:groupId', isAuthenticated, groupController.getGroupById);
router.put('/groups/:groupId', isAuthenticated, groupController.updateGroup);
router.delete('/groups/:groupId', isAuthenticated, groupController.deleteGroup);

// Group membership
router.post('/groups/:groupId/join', isAuthenticated, groupController.joinGroup);
router.post('/groups/join-code', isAuthenticated, groupController.joinGroupByCode);
router.post('/groups/:groupId/leave', isAuthenticated, groupController.leaveGroup);
router.get('/groups/:groupId/leaderboard', isAuthenticated, groupController.getGroupLeaderboard);

// Member management
router.put('/groups/:groupId/members/:memberId/role', isAuthenticated, groupController.updateMemberRole);
router.delete('/groups/:groupId/members/:memberId', isAuthenticated, groupController.removeMember);

// Join Requests
router.get('/groups/:groupId/requests', isAuthenticated, groupController.getJoinRequests);
router.post('/groups/:groupId/requests/:requestId', isAuthenticated, groupController.handleJoinRequest);

// ============== STUDY ROOM ROUTES ==============
router.post('/rooms', isAuthenticated, studyRoomController.createStudyRoom);
router.get('/rooms/live', isAuthenticated, studyRoomController.getLiveRooms);
router.get('/rooms/group/:groupId', isAuthenticated, studyRoomController.getGroupRooms);
router.get('/rooms/:roomId', isAuthenticated, studyRoomController.getStudyRoom);
router.post('/rooms/:roomId/join', isAuthenticated, studyRoomController.joinStudyRoom);
router.post('/rooms/:roomId/leave', isAuthenticated, studyRoomController.leaveStudyRoom);
router.put('/rooms/:roomId/status', isAuthenticated, studyRoomController.updateParticipantStatus);
router.put('/rooms/:roomId/pomodoro', isAuthenticated, studyRoomController.updatePomodoroTimer);
router.post('/rooms/:roomId/end', isAuthenticated, studyRoomController.endStudyRoom);

// ============== CHALLENGE ROUTES ==============
router.post('/challenges', isAuthenticated, challengeController.createChallenge);
router.get('/challenges', isAuthenticated, challengeController.getAllActiveChallenges);
router.get('/challenges/public', isAuthenticated, challengeController.getPublicChallenges);
router.get('/challenges/my', isAuthenticated, challengeController.getMyChallenges);
router.get('/challenges/group/:groupId', isAuthenticated, challengeController.getGroupChallenges);
router.get('/challenges/:challengeId', isAuthenticated, challengeController.getChallengeById);
router.get('/challenges/:challengeId/leaderboard', isAuthenticated, challengeController.getChallengeLeaderboard);
router.post('/challenges/:challengeId/join', isAuthenticated, challengeController.joinChallenge);
router.put('/challenges/:challengeId/progress', isAuthenticated, challengeController.updateProgress);
router.delete('/challenges/:challengeId', isAuthenticated, challengeController.deleteChallenge);


// ============== RESOURCE ROUTES ==============
router.post('/resources', isAuthenticated, resourceController.createResource);
router.get('/resources/group/:groupId', isAuthenticated, resourceController.getGroupResources);
router.post('/resources/:resourceId/download', isAuthenticated, resourceController.downloadResource);
router.post('/resources/:resourceId/like', isAuthenticated, resourceController.toggleLike);
router.delete('/resources/:resourceId', isAuthenticated, resourceController.deleteResource);

// ============== MESSAGE ROUTES ==============
router.get('/messages', isAuthenticated, messageController.getMessages);
router.post('/messages', isAuthenticated, messageController.sendMessage);
router.post('/messages/:messageId/reaction', isAuthenticated, messageController.addReaction);
router.delete('/messages/:messageId', isAuthenticated, messageController.deleteMessage);

// ============== ACTIVITY ROUTES ==============
router.get('/activity/group/:groupId', isAuthenticated, activityController.getGroupActivity);
router.get('/activity/user', isAuthenticated, activityController.getUserActivity);

module.exports = router;
