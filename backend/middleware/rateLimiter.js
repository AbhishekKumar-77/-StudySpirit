const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware to prevent abuse
 * Critical for production — prevents DDoS and brute force
 */

// General API rate limit: 200 requests per 15 minutes per IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: {
        success: false,
        message: 'Too many requests. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in development
    skip: () => process.env.NODE_ENV === 'development'
});

// Auth routes: 10 requests per 15 minutes per IP (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in development
    skip: () => process.env.NODE_ENV === 'development'
});

// AI/Groq routes: 20 requests per minute per IP (expensive API calls)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: {
        success: false,
        message: 'AI request limit reached. Please wait a minute before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Socket connection limiter: 50 connections per minute per IP
const socketLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 50,
    message: {
        success: false,
        message: 'Too many connection attempts.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    generalLimiter,
    authLimiter,
    aiLimiter,
    socketLimiter
};
