/**
 * Centralized Error Handler Middleware
 * Catches ALL unhandled errors and returns proper responses
 * This prevents the server from crashing on unexpected errors
 */

// Custom application error class
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Marks it as a known/expected error
        Error.captureStackTrace(this, this.constructor);
    }
}

// 404 handler — for routes that don't exist
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
    next(error);
};

// Global error handler — must be the LAST middleware
const globalErrorHandler = (err, req, res, next) => {
    // Default values
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Log error in development, minimal log in production
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', {
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method
        });
    } else {
        // In production, only log unexpected (non-operational) errors
        if (!err.isOperational) {
            console.error('❌ UNEXPECTED ERROR:', err.message);
        }
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            message: `Duplicate value for field: ${field}`
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Authentication token has expired'
        });
    }

    // Send response
    res.status(err.statusCode).json({
        success: false,
        message: err.isOperational ? err.message : 'Something went wrong. Please try again later.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = {
    AppError,
    notFoundHandler,
    globalErrorHandler
};
