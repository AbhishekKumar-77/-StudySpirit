const express = require('express');
const router = express.Router();
const interviewExamController = require('../controllers/interviewExamController');
const auth = require('../middleware/auth');

// ============== Teacher Routes (require auth) ==============
router.post('/create', auth, interviewExamController.createExam);
router.get('/my', auth, interviewExamController.getMyExams);
router.delete('/:code', auth, interviewExamController.deleteExam);

// ============== Student / Public Routes ==============
router.get('/join/:code', interviewExamController.getExamByCode);
router.post('/join', interviewExamController.startSubmission);
router.get('/check-reattempt/:code', interviewExamController.checkReAttempt);
router.post('/start', interviewExamController.startSubmission);
router.post('/complete', interviewExamController.completeSubmission);

// ============== Results Routes (Teacher) ==============
router.get('/:code/submissions', interviewExamController.getExamSubmissions);
router.get('/:code/leaderboard', interviewExamController.getExamLeaderboard);
router.get('/submission/:submissionId', interviewExamController.getSubmissionDetail);

module.exports = router;
