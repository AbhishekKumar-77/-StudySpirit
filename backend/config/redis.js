/**
 * Redis Configuration & Connection Manager
 * =========================================
 * Provides a high-performance Redis client for caching, rate limiting, and 
 * multi-worker Socket.io scaling.
 * 
 * Behavior:
 * - If REDIS_URL or REDIS_HOST is set: Connects with automatic reconnection.
 * - If NOT set: Gracefully logs info and exports null (app uses in-memory fallbacks).
 */
const { createClient } = require('redis');

let redisClient = null;

const REDIS_URL = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : null);

if (REDIS_URL) {
    try {
        redisClient = createClient({
            url: REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 5) {
                        console.warn('⚠️ Redis: Exceeded max reconnect attempts. Using in-memory fallback.');
                        return false;
                    }
                    return Math.min(retries * 500, 3000);
                }
            }
        });

        redisClient.on('error', (err) => {
            console.warn('⚠️ Redis Runtime Warning:', err.message);
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis connected successfully (Multi-worker cache active)');
        });

        redisClient.connect().catch((err) => {
            console.warn('⚠️ Redis initial connection failed:', err.message, '— Running with in-memory fallbacks.');
        });
    } catch (err) {
        console.warn('⚠️ Redis initialization error:', err.message);
        redisClient = null;
    }
} else {
    // Expected in basic single-instance dev/production when Redis is not provisioned
    // Cache and Socket modules will seamlessly use in-memory Map structures
}

module.exports = redisClient;
