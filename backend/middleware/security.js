const helmet = require('helmet');
const compression = require('compression');

/**
 * Security middleware stack for production
 * Protects against common web vulnerabilities
 * 
 * Note: express-mongo-sanitize is NOT used because Express v5
 * makes req.query read-only. Instead, we sanitize at the 
 * controller/model level via Mongoose schema validation.
 */
module.exports = function applySecurityMiddleware(app) {
    // Helmet: Sets various HTTP security headers
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false // Disable CSP for API server
    }));

    // Gzip compression — reduces response sizes by 60-80%
    // Critical for 1000+ users to reduce bandwidth
    app.use(compression());

    // Custom NoSQL injection sanitizer (Express v5 compatible)
    // Strips $ and . from req.body keys to prevent MongoDB injection
    app.use((req, res, next) => {
        if (req.body && typeof req.body === 'object') {
            sanitizeObject(req.body);
        }
        // req.params is already safe (defined by route patterns)
        // req.query is read-only in Express v5, handled by Mongoose schema validation
        next();
    });
};

/**
 * Recursively sanitize an object by removing keys starting with $ or containing .
 * This prevents MongoDB operator injection (e.g., { "$gt": "" } in login forms)
 */
function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return;

    for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
            delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
        }
    }
}
