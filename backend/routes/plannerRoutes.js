const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');

// Optional auth middleware: proceeds if user is present, or falls back smoothly
const optionalAuth = (req, res, next) => {
    next();
};

// Full Planner State
router.get('/full-state', optionalAuth, plannerController.getFullPlannerState);
router.get('/overview', optionalAuth, plannerController.getFullPlannerState);

// Tasks Routes
router.route('/tasks')
    .get(optionalAuth, plannerController.getTasks)
    .post(optionalAuth, plannerController.createTask);

router.route('/tasks/:id')
    .delete(optionalAuth, plannerController.deleteTask);

router.patch('/tasks/:taskId/status', optionalAuth, plannerController.updateTaskLifecycle);

// AI Plan Builder
router.post('/ai-plan-builder', optionalAuth, plannerController.buildAIPlan);

// Goals Routes
router.route('/goals')
    .get(optionalAuth, plannerController.getGoals)
    .post(optionalAuth, plannerController.createGoal);

router.route('/goals/:id')
    .put(optionalAuth, plannerController.updateGoal)
    .delete(optionalAuth, plannerController.deleteGoal);

// Deadlines Routes
router.route('/deadlines')
    .post(optionalAuth, plannerController.createDeadline);

router.route('/deadlines/:id')
    .delete(optionalAuth, plannerController.deleteDeadline);

module.exports = router;
