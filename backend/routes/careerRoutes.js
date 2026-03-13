const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');

// GET /api/career - Get all listings
router.get('/', careerController.getJobs);

// POST /api/career - Add a new listing (admin style)
router.post('/', careerController.addJob);

// AI Tools
router.post('/analyze-match', careerController.analyzeMatch);
router.post('/cover-letter', careerController.generateCoverLetter);

module.exports = router;
