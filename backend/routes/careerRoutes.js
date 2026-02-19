const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');

// GET /api/career - Get all listings
router.get('/', careerController.getJobs);

// POST /api/career - Add a new listing (admin style)
router.post('/', careerController.addJob);

module.exports = router;
