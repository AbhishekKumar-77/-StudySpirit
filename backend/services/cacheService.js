/**
 * CacheService — High-performance distributed cache service.
 * Supports Redis when configured, with fallback to an in-memory TTL/LRU cache.
 */

const crypto = require('crypto');

let redisClient = null;
try {
    const redis = require('../config/redis');
    if (redis && redis.isReady) {
        redisClient = redis;
    }
} catch (e) {
    // Redis optional or not configured
}

class CacheService {
    constructor(maxMemoryItems = 2000, defaultTTLMs = 300000) {
        this.memoryCache = new Map();
        this.maxMemoryItems = maxMemoryItems;
        this.defaultTTLMs = defaultTTLMs;

        // Periodic cleanup every 2 minutes to prevent RAM growth
        setInterval(() => this.purgeExpired(), 120000).unref();
    }

    generateKey(namespace, payload) {
        const hash = crypto.createHash('sha256').update(typeof payload === 'string' ? payload : JSON.stringify(payload)).digest('hex');
        return `${namespace}:${hash}`;
    }

    async get(key) {
        if (redisClient && redisClient.isReady) {
            try {
                const val = await redisClient.get(key);
                return val ? JSON.parse(val) : null;
            } catch (err) {
                console.warn("[CacheService] Redis get error, falling back to memory:", err.message);
            }
        }

        const item = this.memoryCache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiresAt) {
            this.memoryCache.delete(key);
            return null;
        }

        return item.value;
    }

    async set(key, value, ttlSeconds = 300) {
        const ttlMs = ttlSeconds * 1000;

        if (redisClient && redisClient.isReady) {
            try {
                await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
                return;
            } catch (err) {
                console.warn("[CacheService] Redis set error, falling back to memory:", err.message);
            }
        }

        // LRU Eviction check
        if (this.memoryCache.size >= this.maxMemoryItems) {
            const firstKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(firstKey);
        }

        this.memoryCache.set(key, {
            value,
            expiresAt: Date.now() + ttlMs
        });
    }

    async delete(key) {
        if (redisClient && redisClient.isReady) {
            try {
                await redisClient.del(key);
            } catch (err) {
                // Ignore fallback error
            }
        }
        this.memoryCache.delete(key);
    }

    purgeExpired() {
        const now = Date.now();
        for (const [key, item] of this.memoryCache.entries()) {
            if (now > item.expiresAt) {
                this.memoryCache.delete(key);
            }
        }
    }
}

module.exports = new CacheService();
