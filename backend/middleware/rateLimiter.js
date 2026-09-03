const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Middleware — High-Concurrency & Campus-Network Ready
 * ===================================================================
 * Designed to scale to 5,000+ concurrent students without false-positive lockouts.
 * 
 * Key Enhancements:
 * 1. Campus NAT / Shared IP Awareness: In university labs, 500+ students share one public IP.
 *    Keying strictly by IP locks out whole classes. We key by User ID or Registration Number
 *    when available, falling back to IP.
 * 2. Exam Route Isolation: Timed exams, heartbeats, and code executions bypass tight IP caps.
 * 3. Targeted Brute Force Protection: Auth limiter protects individual accounts without
 *    locking down the entire campus network.
 */

// Helper: Extracts a unique student identifier (User ID > Reg No > Token > IP)
const getStudentOrIpKey = (req) => {
    if (req.user && req.user._id) {
        return `user_${req.user._id}`;
    }
    if (req.user && req.user.id) {
        return `user_${req.user.id}`;
    }
    if (req.headers && req.headers['x-student-id']) {
        return `student_${req.headers['x-student-id']}`;
    }
    if (req.body && req.body.registrationNumber) {
        return `reg_${req.body.registrationNumber}`;
    }
    if (req.query && req.query.regNo) {
        return `reg_${req.query.regNo}`;
    }
    return req.ip || 'unknown';
};

// General API Rate Limit: 1,000 requests per 15 minutes per student/IP
// Skips high-throughput exam, proctor, and code-runner routes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    keyGenerator: getStudentOrIpKey,
    validate: { keyGeneratorIpFallback: false },
    message: {
        success: false,
        message: 'Too many requests. Please try again in a few minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        if (process.env.NODE_ENV === 'development') return true;
        const path = req.path || '';
        return path.startsWith('/quiz') ||
               path.startsWith('/proctor') ||
               path.startsWith('/interview-exam') ||
               path.startsWith('/codespirit/execute') ||
               path.startsWith('/health');
    }
});

// Auth Routes: 100 requests per 15 minutes per IP (allowing lab batches to log in)
// Keyed by IP + Email so brute force against a specific account is strictly capped
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    keyGenerator: (req) => {
        const email = req.body && req.body.email ? String(req.body.email).toLowerCase().trim() : '';
        return email ? `auth_${req.ip}_${email}` : `auth_${req.ip}`;
    },
    validate: { keyGeneratorIpFallback: false },
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'development'
});

// Dedicated Exam & Proctor Limiter: Very high throughput (3,000 reqs per 15 mins per student)
// Accommodates 10-second proctor heartbeats, question navigation, and autosaves
const examLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3000,
    keyGenerator: getStudentOrIpKey,
    validate: { keyGeneratorIpFallback: false },
    message: {
        success: false,
        message: 'Exam request threshold exceeded. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'development'
});

// Code Execution Limiter: 120 code runs per minute per student
// Prevents spam while allowing students in coding contests/exams to test frequently
const codeRunnerLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    keyGenerator: getStudentOrIpKey,
    validate: { keyGeneratorIpFallback: false },
    message: {
        success: false,
        message: 'Code run rate limit reached. Please wait a few seconds before testing again.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'development'
});

// AI/Groq Routes: 60 requests per minute per student (expensive API calls)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    keyGenerator: getStudentOrIpKey,
    validate: { keyGeneratorIpFallback: false },
    message: {
        success: false,
        message: 'AI generation limit reached. Please wait a minute before requesting again.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'development'
});

// Socket connection limiter: 200 connections per minute per IP
const socketLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    message: {
        success: false,
        message: 'Too many socket connection attempts.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'development'
});

module.exports = {
    generalLimiter,
    authLimiter,
    examLimiter,
    codeRunnerLimiter,
    aiLimiter,
    socketLimiter,
    getStudentOrIpKey
};
