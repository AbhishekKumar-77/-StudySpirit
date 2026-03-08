const express = require('express');
const router = express.Router();
const codeSpiritController = require('../controllers/codeSpiritController');

const auth = require('../middleware/auth');

// Generate daily challenge
router.post('/generate', auth, codeSpiritController.generateDailyChallenge);

// Get past sessions
router.get('/history', auth, codeSpiritController.getHistory);

// Get a specific session
router.get('/session/:id', auth, codeSpiritController.getSession);

// Submit a completed challenge
router.post('/submit', auth, codeSpiritController.submitChallenge);

// Execute code (replaces Piston API)
router.post('/execute', codeSpiritController.executeCode);

module.exports = router;
