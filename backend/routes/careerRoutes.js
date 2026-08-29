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

// Skill Passport / Career Profile
router.get('/profile', careerController.getCareerProfile);

// Unified Resume & Career Metrics Data (Real Student Activity)
router.get('/resume-data', careerController.getResumeData);

// Applications Tracker
router.get('/applications', careerController.getUserApplications);
router.post('/applications', careerController.saveUserApplication);

module.exports = router;
