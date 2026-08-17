const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// ── NEW SPECIALIZED ENDPOINTS (placed before :projectId parameters) ──
router.get('/stats', projectController.getProjectStats);
router.get('/search', projectController.searchProjects);
router.get('/portfolio/:userId', projectController.getPortfolio);

// ── CORE ENDPOINTS ──
router.get('/my', projectController.getMyProjects);
router.get('/explore', projectController.exploreProjects);
router.get('/user/:userId', projectController.getUserProjects);

// Create new project
router.post('/', projectController.createProject);

// Single project operations
router.get('/:projectId', projectController.getProject);
router.patch('/:projectId', projectController.updateProject);
router.delete('/:projectId', projectController.deleteProject);

// File operations
router.post('/:projectId/files', projectController.addFile);
router.delete('/:projectId/files/:filePath', projectController.deleteFile);

// Interactions & Actions
router.post('/:projectId/star', projectController.toggleStar);
router.post('/:projectId/fork', projectController.forkProject);
router.post('/:projectId/featured', projectController.toggleFeatured);
router.post('/:projectId/build-log', projectController.addBuildLog);
router.post('/:projectId/import-github', projectController.importGithub);
router.post('/:projectId/generate-readme', projectController.generateReadme);
router.post('/:projectId/ai-summary', projectController.generateProjectSummary);

module.exports = router;
