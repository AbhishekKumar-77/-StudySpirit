const express = require('express');
const router = express.Router();
const codeSpiritController = require('../controllers/codeSpiritController');

// Generate daily challenge
router.post('/generate', codeSpiritController.generateDailyChallenge);

// Execute code (replaces Piston API)
router.post('/execute', codeSpiritController.executeCode);

module.exports = router;
