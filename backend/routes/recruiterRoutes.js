const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const auth = require('../middleware/auth');

// Make sure only recruiters can access these (add simple role check)
const isRecruiter = (req, res, next) => {
    if (req.user && req.user.role === 'recruiter') return next();
    return res.status(403).json({ error: 'Recruiter access required' });
};

// Public Profile (No auth required to view a public profile, or just student/recruiter auth)
router.get('/profile/:id', recruiterController.getPublicProfile);

// Search Students
router.get('/students/search', auth, isRecruiter, recruiterController.searchStudents);

// Saved Candidates
router.post('/candidates/save', auth, isRecruiter, recruiterController.saveCandidate);
router.get('/candidates/saved', auth, isRecruiter, recruiterController.getSavedCandidates);

// Campus Drives
router.post('/drives', auth, isRecruiter, recruiterController.createCampusDrive);
router.get('/drives', auth, isRecruiter, recruiterController.getCampusDrives);

// Post a Job / Internship
router.post('/jobs', auth, isRecruiter, recruiterController.createJob);
router.get('/my-jobs', auth, isRecruiter, recruiterController.getMyJobs);
router.get('/jobs/:jobId/reverse-match', auth, isRecruiter, recruiterController.getReverseMatch);
router.post('/jobs/apply', auth, recruiterController.applyToJob); // Open to students

// Badge Verification
router.get('/verify/badge/:code', recruiterController.verifyBadge);

// Analytics
router.get('/analytics', auth, isRecruiter, recruiterController.getAnalytics);

module.exports = router;
