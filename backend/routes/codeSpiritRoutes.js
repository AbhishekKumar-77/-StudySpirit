const express = require('express');
const router = express.Router();
const codeSpiritController = require('../controllers/codeSpiritController');

const auth = require('../middleware/auth');

// Generate challenges
router.post('/generate', auth, codeSpiritController.generateDailyChallenge);

// Get past sessions (with optional query filters: ?difficulty=&language=&completed=)
router.get('/history', auth, codeSpiritController.getHistory);

// Get topic categories
router.get('/topics', codeSpiritController.getTopicCategories);

// Get or generate daily challenge
router.get('/daily', auth, codeSpiritController.getDailyChallenge);

// Get a specific session
router.get('/session/:id', auth, codeSpiritController.getSession);

// Submit a completed challenge
router.post('/submit', auth, codeSpiritController.submitChallenge);

// Execute code via Piston (REAL execution) — auth protected
router.post('/execute', auth, codeSpiritController.executeCode);

// Verify code against test cases
router.post('/verify', auth, codeSpiritController.verifyCode);

// AI code review
router.post('/review', auth, codeSpiritController.reviewCode);

// Delete a session
router.delete('/session/:id', auth, codeSpiritController.deleteSession);

module.exports = router;
