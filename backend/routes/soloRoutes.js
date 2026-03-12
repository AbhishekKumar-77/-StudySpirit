const express = require('express');
const router = express.Router();
const soloController = require('../controllers/soloController');
const aiController = require('../controllers/aiController');
const multer = require('multer');
const { aiLimiter } = require('../middleware/rateLimiter');

// Configure Multer for PDF Uploads (Memory Storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

// All routes require authentication (handled by middleware in main app)

// Dashboard & Stats

// Dashboard & Stats
router.get('/stats', soloController.getDashboardData);
router.post('/heartbeat', soloController.logHeartbeat);

// Study Sessions
router.post('/session/start', soloController.startStudySession);
router.post('/session/end', soloController.endStudySession);

// Learning Path
router.post('/learning-path/update', soloController.updateLearningPath);

// Contest Reminders
router.post('/contest/reminder', soloController.addContestReminder);

// Activity Logging
router.post('/activity/log', soloController.logActivity);

// Tasks
router.post('/tasks', soloController.createTask);
router.patch('/tasks/:taskId/toggle', soloController.toggleTask);

// AI Chat (rate limited: 20 req/min per IP)
router.post('/ai/chat', aiLimiter, soloController.chatWithAI);

// Learning Path Generator (Skill Tree)
router.post('/learning-path/generate', aiLimiter, soloController.generateSkillTree);

// Study Suggestions (based on workload, days, pressure)
router.post('/ai/study-suggestions', aiLimiter, soloController.getStudySuggestions);

// Platform Connection & Management
router.post('/platform/connect', soloController.connectPlatform);
router.post('/platform/disconnect', soloController.disconnectPlatform);
router.get('/platform/refresh/:platform', soloController.refreshPlatformData);

// Contests (real-time from APIs)
router.get('/contests', soloController.getUpcomingContests);

// AI Interview (with PDF upload support)
router.post('/ai/interview', (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error("Multer Error:", err);
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error("Upload Error:", err);
            return res.status(500).json({ message: `Upload error: ${err.message}` });
        }
        // Everything went fine.
        next();
    });
}, aiController.interviewWithAI);

// End Interview & Generate Report
router.post('/ai/interview/end', aiController.endInterview);

// Interview History
router.get('/ai/interview/history', aiController.getInterviewHistory);

// Single Interview Session Detail
router.get('/ai/interview/:sessionId', aiController.getInterviewSession);

// Soft Skills AI Conversation (Real-time)
router.post('/ai/softskills', aiLimiter, aiController.softSkillsAI);

// Vocabulary Generation (50 words)
router.get('/vocabulary', aiLimiter, aiController.generateVocabulary);

// Writing Routes
router.get('/writing/topic', aiLimiter, aiController.generateWritingTopic);
router.post('/writing/evaluate', aiLimiter, aiController.evaluateWriting);

// Speaking Routes
router.get('/speaking/topic', aiLimiter, aiController.generateSpeakingTopic);
router.post('/speaking/evaluate', aiLimiter, aiController.evaluateSpeech);

// ATS Resume Checker
router.post('/ai/ats/check', (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err) return res.status(400).json({ message: "File upload error" });
        next();
    });
}, aiLimiter, aiController.checkATSScore);

module.exports = router;
