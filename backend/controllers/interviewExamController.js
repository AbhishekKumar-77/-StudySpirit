const InterviewExam = require('../models/InterviewExam');
const InterviewSubmission = require('../models/InterviewSubmission');
const InterviewSession = require('../models/InterviewSession');
const User = require('../models/User');

// ============== CREATE INTERVIEW EXAM (Teacher) ==============
exports.createExam = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

        const { title, mode, totalQuestions, targetRole, targetCompany, settings, status } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }

        // Generate unique exam code: IV-XXXX
        const code = "IV" + Math.random().toString(36).substring(2, 6).toUpperCase();

        const exam = await InterviewExam.create({
            title: title.trim(),
            code,
            mode: mode || 'technical',
            totalQuestions: Math.min(Math.max(parseInt(totalQuestions) || 5, 3), 20),
            targetRole: targetRole || 'Software Engineer',
            targetCompany: targetCompany || 'General Tech',
            settings: {
                scheduledStart: settings?.scheduledStart || null,
                scheduledEnd: settings?.scheduledEnd || null,
                allowReAttempt: settings?.allowReAttempt || false
            },
            creatorId: req.user.id,
            creatorName: req.user.name || 'Teacher',
            status: status || 'published'
        });

        res.status(201).json({ success: true, examCode: code, exam, message: "Interview exam created!" });
    } catch (error) {
        console.error("Create Interview Exam Error:", error);
        res.status(500).json({ success: false, message: "Failed to create exam" });
    }
};

// ============== GET MY EXAMS (Teacher) ==============
exports.getMyExams = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

        const exams = await InterviewExam.find({ creatorId: req.user.id }).sort({ createdAt: -1 });

        // Get submission counts for each exam
        const examsWithStats = await Promise.all(exams.map(async (exam) => {
            const submissionCount = await InterviewSubmission.countDocuments({ examCode: exam.code });
            const completedCount = await InterviewSubmission.countDocuments({ examCode: exam.code, status: 'completed' });
            const inProgressCount = await InterviewSubmission.countDocuments({ examCode: exam.code, status: 'in-progress' });

            return {
                ...exam.toObject(),
                stats: {
                    total: submissionCount,
                    completed: completedCount,
                    inProgress: inProgressCount
                }
            };
        }));

        res.json({ success: true, exams: examsWithStats });
    } catch (error) {
        console.error("Get My Exams Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch exams" });
    }
};

// ============== GET EXAM BY CODE (Student joins) ==============
exports.getExamByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const exam = await InterviewExam.findOne({ code: code.toUpperCase().trim() });

        if (!exam) {
            return res.status(404).json({ success: false, message: "Interview exam not found with code: " + code });
        }

        if (exam.status === 'draft') {
            const isCreator = req.user && req.user.id.toString() === exam.creatorId.toString();
            if (!isCreator) {
                return res.status(403).json({ success: false, message: "This exam is not published yet." });
            }
        }

        // Schedule enforcement
        const now = new Date();
        const isTeacher = req.user && exam.creatorId && req.user.id.toString() === exam.creatorId.toString();

        if (!isTeacher) {
            if (exam.settings.scheduledStart && now < new Date(exam.settings.scheduledStart)) {
                const startTime = new Date(exam.settings.scheduledStart).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
                return res.status(403).json({ success: false, message: `This interview hasn't started yet. It opens at ${startTime} IST.` });
            }
            if (exam.settings.scheduledEnd && now > new Date(exam.settings.scheduledEnd)) {
                return res.status(403).json({ success: false, message: "This interview exam has ended." });
            }
        }

        res.json({ success: true, exam });
    } catch (error) {
        console.error("Get Exam Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching exam" });
    }
};

// ============== CHECK RE-ATTEMPT ==============
exports.checkReAttempt = async (req, res) => {
    try {
        const { code } = req.params;
        const { registrationNumber } = req.query;

        if (!registrationNumber) {
            return res.json({ success: true, alreadySubmitted: false });
        }

        const existing = await InterviewSubmission.findOne({
            examCode: code.toUpperCase(),
            registrationNumber: registrationNumber.trim().toUpperCase(),
            status: 'completed'
        });

        res.json({ success: true, alreadySubmitted: !!existing });
    } catch (error) {
        console.error("Check Re-Attempt Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ============== START INTERVIEW SUBMISSION (Student begins) ==============
exports.startSubmission = async (req, res) => {
    try {
        const { examCode, studentName, registrationNumber } = req.body;

        if (!examCode) return res.status(400).json({ success: false, message: "Exam code required" });

        const exam = await InterviewExam.findOne({ code: examCode.toUpperCase().trim() });
        if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

        // Check re-attempt
        if (!exam.settings.allowReAttempt && registrationNumber) {
            const existing = await InterviewSubmission.findOne({
                examCode: examCode.toUpperCase(),
                registrationNumber: registrationNumber.trim().toUpperCase(),
                status: 'completed'
            });
            if (existing) {
                return res.status(409).json({ success: false, message: "You have already completed this interview.", alreadySubmitted: true });
            }
        }

        const submission = await InterviewSubmission.create({
            examCode: examCode.toUpperCase(),
            studentId: req.user ? req.user.id : null,
            studentName: studentName || req.user?.name || 'Student',
            registrationNumber: (registrationNumber || '').trim().toUpperCase(),
            mode: exam.mode,
            status: 'in-progress'
        });

        res.status(201).json({
            success: true,
            submissionId: submission._id,
            exam: {
                title: exam.title,
                mode: exam.mode,
                totalQuestions: exam.totalQuestions,
                targetRole: exam.targetRole,
                targetCompany: exam.targetCompany
            }
        });
    } catch (error) {
        console.error("Start Submission Error:", error);
        res.status(500).json({ success: false, message: "Failed to start interview" });
    }
};

// ============== COMPLETE INTERVIEW SUBMISSION (After interview ends) ==============
exports.completeSubmission = async (req, res) => {
    try {
        const { submissionId, sessionId, overallScore, strengths, improvements, finalFeedback, gdMetrics, duration, questionsAnswered } = req.body;

        if (!submissionId) return res.status(400).json({ success: false, message: "Submission ID required" });

        const submission = await InterviewSubmission.findById(submissionId);
        if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

        submission.sessionId = sessionId || null;
        submission.overallScore = overallScore || 0;
        submission.strengths = strengths || [];
        submission.improvements = improvements || [];
        submission.finalFeedback = finalFeedback || '';
        submission.gdMetrics = gdMetrics || {};
        submission.duration = duration || 0;
        submission.questionsAnswered = questionsAnswered || 0;
        submission.status = 'completed';
        submission.completedAt = new Date();

        await submission.save();

        res.json({ success: true, message: "Interview submission recorded!", submission });
    } catch (error) {
        console.error("Complete Submission Error:", error);
        res.status(500).json({ success: false, message: "Failed to save submission" });
    }
};

// ============== GET SUBMISSIONS FOR EXAM (Teacher views results) ==============
exports.getExamSubmissions = async (req, res) => {
    try {
        const { code } = req.params;
        const submissions = await InterviewSubmission.find({ examCode: code.toUpperCase() })
            .sort({ overallScore: -1, duration: 1 });

        res.json({ success: true, submissions });
    } catch (error) {
        console.error("Get Submissions Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch submissions" });
    }
};

// ============== GET LEADERBOARD FOR EXAM ==============
exports.getExamLeaderboard = async (req, res) => {
    try {
        const { code } = req.params;
        const submissions = await InterviewSubmission.find({
            examCode: code.toUpperCase(),
            status: 'completed'
        }).sort({ overallScore: -1, duration: 1 });

        const leaderboard = submissions.map((sub, idx) => {
            let timeStr = 'N/A';
            if (sub.duration > 0) {
                timeStr = `${Math.floor(sub.duration / 60)}m ${sub.duration % 60}s`;
            }
            return {
                id: sub._id,
                rank: idx + 1,
                name: sub.studentName || 'Student',
                registrationNumber: sub.registrationNumber || '',
                score: sub.overallScore || 0,
                mode: sub.mode,
                time: timeStr,
                questionsAnswered: sub.questionsAnswered || 0,
                strengths: sub.strengths || [],
                improvements: sub.improvements || [],
                feedback: sub.finalFeedback || ''
            };
        });

        res.json({ success: true, leaderboard });
    } catch (error) {
        console.error("Get Leaderboard Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
    }
};

// ============== GET SUBMISSION DETAIL (Teacher views a single student) ==============
exports.getSubmissionDetail = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await InterviewSubmission.findById(submissionId);
        if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

        // Also get the interview session transcript if available
        let session = null;
        if (submission.sessionId) {
            session = await InterviewSession.findById(submission.sessionId);
        }

        res.json({ success: true, submission, session });
    } catch (error) {
        console.error("Get Submission Detail Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch detail" });
    }
};

// ============== DELETE EXAM ==============
exports.deleteExam = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

        const exam = await InterviewExam.findOne({ code: req.params.code });
        if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

        if (exam.creatorId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this exam" });
        }

        await InterviewExam.deleteOne({ code: req.params.code });
        await InterviewSubmission.deleteMany({ examCode: req.params.code });

        res.json({ success: true, message: "Interview exam deleted" });
    } catch (error) {
        console.error("Delete Exam Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete exam" });
    }
};
