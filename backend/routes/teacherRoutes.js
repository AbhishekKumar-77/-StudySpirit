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
router.get('/classroom', auth, teacherController.getClassrooms); // Fallback GET

// Classroom Sub-Routes for Details, Lectures, Announcements
router.get('/classroom/:classroomId', auth, isTeacher, teacherController.getClassroomDetails);
router.delete('/classroom/:classroomId', auth, isTeacher, teacherController.deleteClassroom);
router.post('/classroom/:classroomId/lecture', auth, isTeacher, teacherController.scheduleLecture);
router.delete('/classroom/:classroomId/lecture/:lectureId', auth, isTeacher, teacherController.deleteLecture);
router.post('/classroom/:classroomId/lecture/:lectureId/start', auth, isTeacher, teacherController.startLecture);
router.post('/classroom/:classroomId/lecture/:lectureId/stop', auth, isTeacher, teacherController.stopLecture);
router.get('/classroom/:classroomId/announcements', auth, teacherController.getClassroomAnnouncements);

// Announcement Routes
router.post('/announcement', auth, isTeacher, teacherController.createAnnouncement);
router.get('/announcements', auth, teacherController.getAnnouncements);
router.get('/announcement', auth, teacherController.getAnnouncements); // Fallback GET

// AI Insight
router.post('/quiz-insight', auth, isTeacher, teacherController.getQuizInsight);

// Student Progress
router.get('/student/:studentId', auth, isTeacher, teacherController.getStudentProgress);

// CodeSpirit Creator Version Control
router.post('/challenge/:challengeId/duplicate', auth, isTeacher, challengeController.duplicateChallenge);
router.put('/challenge/:challengeId/archive', auth, isTeacher, challengeController.archiveChallenge);

module.exports = router;
