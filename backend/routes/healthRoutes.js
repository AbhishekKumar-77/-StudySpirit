/**
 * Health Check Route
 * Used by PM2, load balancers, and monitoring tools
 * to verify the server is alive and all services are connected
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    const health = {
        status: dbState === 1 ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        services: {
            database: {
                status: dbStates[dbState] || 'unknown',
                healthy: dbState === 1
            },
            server: {
                status: 'running',
                healthy: true,
                memoryUsage: {
                    heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                    heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
                    rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
                }
            }
        },
        environment: process.env.NODE_ENV || 'development'
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
});

// Public Stats endpoint for Landing Page
const User = require('../models/User');
const Group = require('../models/Group');

router.get('/stats', async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const teacherCount = await User.countDocuments({ role: 'teacher' });
        const recruiterCount = await User.countDocuments({ role: 'recruiter' });
        const totalUsers = await User.countDocuments();
        const activeGroups = await Group.countDocuments();

        // Base metrics + real live database count (auto-increments when new students/teachers sign up or log in)
        const totalActiveLearners = 200 + studentCount;
        const totalTeachers = 5 + teacherCount;
        const totalInstitutions = 1 + activeGroups;

        const formatNum = (val) => {
            if (val >= 1000) {
                return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
            }
            return val + '+';
        };

        res.json({
            success: true,
            stats: {
                activeLearners: formatNum(totalActiveLearners),
                teachers: totalTeachers >= 1000 ? formatNum(totalTeachers) : `${totalTeachers}`,
                institutions: totalInstitutions >= 1000 ? formatNum(totalInstitutions) : `${totalInstitutions}`,
                placementSuccess: '95%',
                counts: {
                    students: studentCount,
                    teachers: teacherCount,
                    recruiters: recruiterCount,
                    totalUsers,
                    groups: activeGroups
                }
            }
        });
    } catch (error) {
        res.json({
            success: true,
            stats: {
                activeLearners: '200+',
                teachers: '5',
                institutions: '1',
                placementSuccess: '95%'
            }
        });
    }
});

module.exports = router;
