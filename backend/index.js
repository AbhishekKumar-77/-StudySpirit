require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const morgan = require('morgan');
const dns = require('dns');

// Fix for some network environments where IPv6 fails for Google APIs
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// Middleware imports
const applySecurityMiddleware = require('./middleware/security');
const { generalLimiter, authLimiter, aiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

// Socket handler
const setupSocketHandlers = require('./sockets');

// Config
const passport = require('./config/passport');

// ============== APP SETUP ==============
const app = express();
// Trust proxy is required for secure cookies on Render/Vercel/Heroku
app.set('trust proxy', 1);
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Dynamic CORS — works in dev AND production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://study-spirit.vercel.app',
    'https://study-spirit-wv4j.vercel.app'
];

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
if (FRONTEND_URL && !allowedOrigins.includes(FRONTEND_URL)) {
    allowedOrigins.push(FRONTEND_URL);
}

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    },
    // Production Socket.io settings
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6 // 1MB max message size
});

// ============== MIDDLEWARE STACK ==============

// CORS
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Security middleware (helmet, sanitize, compression)
applySecurityMiddleware(app);

// Request logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body parsing (after security middleware which also sets limits)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session — stored in MongoDB (survives server restarts!)
app.use(session({
    secret: process.env.SESSION_SECRET || 'spirit_key_super_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60, // Session TTL: 1 day
        autoRemove: 'native',
        touchAfter: 24 * 3600 // Only update session once per day unless data changes
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevents XSS attacks
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Global rate limiter (applied to all routes)
app.use('/api/', generalLimiter);

// ============== DATABASE ==============
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    // Connection pool for handling many concurrent users
    maxPoolSize: 100, // Supports ~10000 concurrent DB operations
    minPoolSize: 10,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000
}).catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
});

mongoose.connection.on('connected', () => console.log("✅ Connected to MongoDB Atlas!"));
mongoose.connection.on('error', err => console.error("⚠️ MongoDB Runtime Error:", err.message));

// ============== GRACEFUL SHUTDOWN ==============
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error.message);
    // Give server time to finish ongoing requests before dying
    server.close(() => {
        process.exit(1);
    });
    // Force exit after 5 seconds if graceful shutdown fails
    setTimeout(() => process.exit(1), 5000);
});

// Graceful shutdown on SIGTERM (PM2, Docker, etc.)
process.on('SIGTERM', () => {
    console.log('📛 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        mongoose.connection.close(false).then(() => {
            console.log('✅ MongoDB connection closed.');
            process.exit(0);
        });
    });
});

// ============== ROUTES ==============
const authRoutes = require('./routes/authRoutes');
const soloRoutes = require('./routes/soloRoutes');
const groupRoutes = require('./routes/groupRoutes');
const quizRoutes = require('./routes/quizRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const discussRoutes = require('./routes/discussRoutes');
const careerRoutes = require('./routes/careerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const codeSpiritRoutes = require('./routes/codeSpiritRoutes');
const eventRoutes = require('./routes/eventRoutes');
const healthRoutes = require('./routes/healthRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Auth routes get stricter rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// AI-powered routes get AI rate limiting
app.use('/api/solo', soloRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/codespirit', aiLimiter, codeSpiritRoutes);

// Standard routes
app.use('/api/group', groupRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/discuss', discussRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/events', eventRoutes);

// Health check (no rate limiting)
app.use('/api/health', healthRoutes);

// Admin panel (admin auth handled inside routes)
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'StudySpirit API',
        version: '1.0.0',
        status: 'running',
        environment: process.env.NODE_ENV || 'development'
    });
});

// ============== SOCKET.IO ==============
const { onlineUsers } = setupSocketHandlers(io);

// Make io and onlineUsers accessible to routes
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// ============== ERROR HANDLING ==============
// 404 handler — must be after all routes
app.use(notFoundHandler);

// Global error handler — must be the very last middleware
app.use(globalErrorHandler);

// ============== START SERVER ==============
server.listen(port, () => {
    console.log(`🚀 StudySpirit Backend v1.0.0`);
    console.log(`📡 Server: http://localhost:${port}`);
    console.log(`🌐 CORS: ${FRONTEND_URL}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Socket.io ready for real-time connections`);
});
