const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

// ── AI Endpoints ──
router.post('/generate-ai', quizController.generateAIQuestions);
router.post('/generate-from-image', auth, quizController.generateFromImage);
router.post('/grade-subjective', auth, quizController.gradeSubjective);
router.post('/explain-answer', auth, quizController.explainAnswer);
router.post('/adaptive-practice', auth, quizController.adaptivePractice);
router.post('/generate-remedial', auth, quizController.generateRemedialQuiz);
router.get('/:code/export-html', quizController.exportQuizHTML);

// Create Quiz (auth required — prevents anonymous DB flooding)
router.post('/create', auth, quizController.createQuiz);

// Get My Quizzes/Drafts
router.get('/my-quizzes', auth, quizController.getMyQuizzes);

// Publish Draft
router.put('/:code/publish', auth, quizController.publishDraft);

// Get Global Leaderboard
router.get('/leaderboard', quizController.getLeaderboard);

// Submit Result (no auth — guest students can submit with reg number)
router.post('/submit', quizController.submitResult);

// Delete a Quiz
router.delete('/:code', auth, quizController.deleteQuiz);

// Check if a registration number already submitted this quiz (re-attempt prevention)
router.get('/:code/check-attempt', quizController.checkReAttempt);

// Get per-question analytics for a quiz (teacher only)
router.get('/:code/analytics', auth, quizController.getQuizAnalytics);

// Get Specific Quiz Leaderboard
router.get('/:code/leaderboard', quizController.getSpecificLeaderboard);

// Toggle Close/Open an exam (teacher only)
router.put('/:code/close', auth, quizController.toggleCloseExam);

// View a specific student's submitted code (teacher only)
router.get('/:code/submission/:submissionId', auth, quizController.getStudentCode);

// Execute code during an exam (no auth — uses quizCode for validation)
router.post('/execute-exam', quizController.executeCodeExam);

// Get Quiz by Code (must be LAST — catch-all)
router.get('/:code', quizController.getQuiz);

module.exports = router;
