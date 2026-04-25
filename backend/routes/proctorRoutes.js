const express = require('express');
const router = express.Router();
const proctorController = require('../controllers/proctorController');

// All proctor routes are protected by the secure browser header check
router.use(proctorController.verifySecureBrowser);

// Device Registration & Verification
router.post('/device/register', proctorController.registerDevice);

// Session Tracking & Logging
router.post('/heartbeat', proctorController.heartbeat);
router.post('/log', proctorController.logEvent);
router.post('/session-end', proctorController.endSession);

module.exports = router;
