const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

// Generate AI Questions
router.post('/generate-ai', quizController.generateAIQuestions);

// Create Quiz (Save) - allow drafts, optionally track auth 
router.post('/create', quizController.createQuiz);

// Get My Quizzes/Drafts
router.get('/my-quizzes', auth, quizController.getMyQuizzes);

// Publish Draft
router.put('/:code/publish', auth, quizController.publishDraft);

// Get Leaderboard
router.get('/leaderboard', quizController.getLeaderboard);

// Submit Result
router.post('/submit', quizController.submitResult);

// Get Quiz by Code
router.get('/:code', quizController.getQuiz);

module.exports = router;
