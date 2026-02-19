const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth'); // If you have auth middleware

// Get all events (public or secured)
router.get('/', eventController.getEvents);

// Monitor toggle
router.post('/monitor', auth, eventController.toggleMonitor);

// Get monitored list
router.get('/monitored', auth, eventController.getMonitoredEvents);

module.exports = router;
