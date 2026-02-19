const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// Standard resource routes (existing logic placeholder)
// router.post('/create', resourceController.createResource); // If auth middleware is needed, add it
// router.get('/group/:groupId', resourceController.getGroupResources);

// AI Routes
router.post('/generate-notes', resourceController.generateNotes);
router.post('/explain', resourceController.explainConcept);

router.post('/search-youtube', resourceController.searchYoutube);
router.post('/generate-flashcards', resourceController.generateFlashcards);

module.exports = router;
