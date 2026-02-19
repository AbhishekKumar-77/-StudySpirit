const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');

// Auth middleware (same pattern as groupRoutes.js)
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    // For testing, allow if user is set
    if (req.user) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Please login to continue' });
};

// Tasks Routes
router.route('/tasks')
    .get(isAuthenticated, plannerController.getTasks)
    .post(isAuthenticated, plannerController.createTask);

router.route('/tasks/:id')
    .put(isAuthenticated, plannerController.updateTask)
    .delete(isAuthenticated, plannerController.deleteTask);

// Goals Routes
router.route('/goals')
    .get(isAuthenticated, plannerController.getGoals)
    .post(isAuthenticated, plannerController.createGoal);

router.route('/goals/:id')
    .put(isAuthenticated, plannerController.updateGoal)
    .delete(isAuthenticated, plannerController.deleteGoal);

// Analytics Route
router.route('/overview')
    .get(isAuthenticated, plannerController.getPlannerOverview);

module.exports = router;
