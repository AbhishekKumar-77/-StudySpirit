const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// All admin routes require admin authentication
router.use(adminAuth);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);

// Block / Unblock
router.patch('/users/:id/block', adminController.blockUser);
router.patch('/users/:id/unblock', adminController.unblockUser);

// Role management
router.patch('/users/:id/role', adminController.changeRole);

// Admin promotion
router.patch('/users/:id/make-admin', adminController.makeAdmin);
router.patch('/users/:id/remove-admin', adminController.removeAdmin);

// Delete user
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
