const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const challengeController = require('../controllers/challengeController');
const auth = require('../middleware/auth');

// Make sure only teachers can access these (add simple role check)
const isTeacher = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') return next();
    return res.status(403).json({ error: 'Teacher access required' });
};

// Classroom Routes
router.post('/classroom', auth, isTeacher, teacherController.createClassroom);
router.post('/classroom/join', auth, teacherController.joinClassroom); // Students can hit this
router.get('/classrooms', auth, teacherController.getClassrooms);

// Announcement Routes
router.post('/announcement', auth, isTeacher, teacherController.createAnnouncement);
router.get('/announcements', auth, teacherController.getAnnouncements);

// AI Insight
router.post('/quiz-insight', auth, isTeacher, teacherController.getQuizInsight);

// Student Progress
router.get('/student/:studentId', auth, isTeacher, teacherController.getStudentProgress);

// CodeSpirit Creator Version Control
router.post('/challenge/:challengeId/duplicate', auth, isTeacher, challengeController.duplicateChallenge);
router.put('/challenge/:challengeId/archive', auth, isTeacher, challengeController.archiveChallenge);

module.exports = router;
