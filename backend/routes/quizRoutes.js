const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

// Generate AI Questions
router.post('/generate-ai', quizController.generateAIQuestions);

// Generate questions from Image
router.post('/generate-from-image', quizController.generateFromImage);

// Create Quiz (Save) - allow drafts, optionally track auth
router.post('/create', quizController.createQuiz);

// Get My Quizzes/Drafts
router.get('/my-quizzes', auth, quizController.getMyQuizzes);

// Publish Draft
router.put('/:code/publish', auth, quizController.publishDraft);

// Get Global Leaderboard
router.get('/leaderboard', quizController.getLeaderboard);

// Submit Result
router.post('/submit', quizController.submitResult);

// Delete a Quiz
router.delete('/:code', auth, quizController.deleteQuiz);

// ── NEW ENDPOINTS ────────────────────────────────────────────
// Check if a registration number already submitted this quiz (re-attempt prevention)
router.get('/:code/check-attempt', quizController.checkReAttempt);

// Get per-question analytics for a quiz (teacher only)
router.get('/:code/analytics', auth, quizController.getQuizAnalytics);
// ─────────────────────────────────────────────────────────────

// Get Specific Quiz Leaderboard
router.get('/:code/leaderboard', quizController.getSpecificLeaderboard);

// Get Quiz by Code (must be LAST — catch-all)
router.get('/:code', quizController.getQuiz);

module.exports = router;
