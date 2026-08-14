const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');
const auth = require('../middleware/auth');

// Dashboard Summary & Realtime Stats
router.get('/dashboard', auth, practiceController.getDashboardSummary);

// Question Attempts & Mastery Updates
router.post('/attempt', auth, practiceController.submitQuestionAttempt);

// Practice Modes
router.get('/smart', auth, practiceController.getSmartPractice);
router.get('/mistakes', auth, practiceController.getMistakes);
router.get('/topics', practiceController.getTopicTree);

// Analytics
router.get('/analytics', auth, practiceController.getAnalytics);

// Question Bank
router.get('/question-bank', auth, practiceController.getQuestionBank);
router.post('/save-question', auth, practiceController.saveQuestion);
router.delete('/save-question/:id', auth, practiceController.removeSavedQuestion);

// AI Question Studio
router.post('/ai-studio/generate', auth, practiceController.generateAIStudioQuestions);

module.exports = router;
