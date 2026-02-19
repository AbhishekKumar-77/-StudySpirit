const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Generate AI Questions
router.post('/generate-ai', quizController.generateAIQuestions);

// Create Quiz (Save)
router.post('/create', quizController.createQuiz);

// Get Leaderboard
router.get('/leaderboard', quizController.getLeaderboard);

// Submit Result
router.post('/submit', quizController.submitResult);

// Get Quiz by Code
router.get('/:code', quizController.getQuiz);

module.exports = router;
