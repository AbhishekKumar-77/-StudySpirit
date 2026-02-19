const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// My projects
router.get('/my', projectController.getMyProjects);

// Explore public projects
router.get('/explore', projectController.exploreProjects);

// Get single project
router.get('/:projectId', projectController.getProject);

// Create new project
router.post('/', projectController.createProject);

// Update project
router.patch('/:projectId', projectController.updateProject);

// Delete project
router.delete('/:projectId', projectController.deleteProject);

// File operations
router.post('/:projectId/files', projectController.addFile);
router.delete('/:projectId/files/:filePath', projectController.deleteFile);

// Star/Unstar
router.post('/:projectId/star', projectController.toggleStar);

// Fork
router.post('/:projectId/fork', projectController.forkProject);

// Get user's public projects
router.get('/user/:userId', projectController.getUserProjects);

module.exports = router;
