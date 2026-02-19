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

module.exports = router;
