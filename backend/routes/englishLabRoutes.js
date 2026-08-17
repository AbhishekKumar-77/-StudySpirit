const express = require('express');
const router = express.Router();
const englishLabController = require('../controllers/englishLabController');

// All routes are scoped under /api/english
router.get('/profile', englishLabController.getProfile);
router.post('/assessment', englishLabController.submitAssessment);
router.get('/recommendations', englishLabController.getRecommendations);
router.post('/session', englishLabController.saveSession);
router.get('/sessions/history', englishLabController.getSessionHistory);
router.post('/vocabulary/save', englishLabController.saveWordToBank);
router.get('/vocabulary/bank', englishLabController.getVocabBank);

module.exports = router;
