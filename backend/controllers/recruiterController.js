const User = require('../models/User');
const CareerProfile = require('../models/CareerProfile');
const JobListing = require('../models/JobListing');
const CampusDrive = require('../models/CampusDrive');

// ── 1. Search Students & Skill Passport Explorer ──
exports.searchStudents = async (req, res) => {
    try {
        const { query, university, skill, minScore } = req.query;

        // Build base match for CareerProfile
        let matchStage = { isPublic: true };
        
        if (skill) {
            matchStage['verifiedSkills.skillName'] = new RegExp(skill, 'i');
            if (minScore) {
                matchStage['verifiedSkills.score'] = { $gte: parseInt(minScore) };
            }
        }

        // Aggregate to filter by user populated fields (like university)
        const pipeline = [
            { $match: matchStage },
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userData' } },
            { $unwind: '$userData' }
        ];

        if (university) {
            pipeline.push({ $match: { 'userData.university': new RegExp(university, 'i') } });
        }
        
        if (query) {
            pipeline.push({ 
                $match: { 
                    $or: [
                        { 'userData.name': new RegExp(query, 'i') },
                        { 'userData.course': new RegExp(query, 'i') }
                    ] 
                } 
            });
        }

        // Projection
        pipeline.push({
            $project: {
                _id: 1,
                userId: '$userData._id',
                name: '$userData.name',
                avatar: '$userData.avatar',
                university: '$userData.university',
                course: '$userData.course',
                verifiedSkills: 1,
                softSkillsProfile: 1,
                consistencyScore: 1
            }
        });

        const students = await CareerProfile.aggregate(pipeline);
        res.json({ success: true, students });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── 2. Public Skill Passport ──
// GET /api/recruiter/profile/:id (Or /api/career/public-profile/:id)
exports.getPublicProfile = async (req, res) => {
    try {
        // Can be searched by user ID
        const userId = req.params.id;
        const profile = await CareerProfile.findOne({ user: userId, isPublic: true })
            .populate('user', 'name avatar university course stats githubProfile');
            
        if (!profile) return res.status(404).json({ error: 'Profile not found or is private' });
        
        res.json({ success: true, profile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── 3. Saved Candidates (Shortlist) ──
exports.saveCandidate = async (req, res) => {
    try {
        const { candidateId, notes } = req.body;
        const recruiter = await User.findById(req.user._id);
        
        if (!recruiter.recruiterProfile) recruiter.recruiterProfile = { savedCandidates: [] };
        if (!recruiter.recruiterProfile.savedCandidates) recruiter.recruiterProfile.savedCandidates = [];
        
        // Prevent duplicates
        const exists = recruiter.recruiterProfile.savedCandidates.find(c => c.candidate.toString() === candidateId);
        if (!exists) {
            recruiter.recruiterProfile.savedCandidates.push({ candidate: candidateId, notes });
            await recruiter.save();
        }
        
        res.json({ success: true, savedCandidates: recruiter.recruiterProfile.savedCandidates });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSavedCandidates = async (req, res) => {
    try {
        const recruiter = await User.findById(req.user._id)
            .populate('recruiterProfile.savedCandidates.candidate', 'name avatar university course');
            
        res.json({ success: true, savedCandidates: recruiter.recruiterProfile?.savedCandidates || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── 4. Campus Drive Management ──
exports.createCampusDrive = async (req, res) => {
    try {
        const { title, company, description, date, targetUniversities, assessments } = req.body;
        
        const drive = new CampusDrive({
            title, company, description, date, targetUniversities, assessments,
            recruiter: req.user._id
        });
        await drive.save();
        res.status(201).json({ success: true, drive });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCampusDrives = async (req, res) => {
    try {
        const drives = await CampusDrive.find({ recruiter: req.user._id })
            .populate('assessments', 'title')
            .populate('applicants.student', 'name avatar university');
        res.json({ success: true, drives });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── 5. Recruiter Analytics ──
exports.getAnalytics = async (req, res) => {
    try {
        // Mocked or calculated analytics for the recruiter dashboard
        const recruiterId = req.user._id;
        
        const jobsPosted = await JobListing.countDocuments({ source: 'StudySpirit', company: req.user.recruiterProfile?.companyName || 'Unknown' });
        const drives = await CampusDrive.find({ recruiter: recruiterId });
        
        let totalApplicants = 0;
        drives.forEach(d => totalApplicants += d.applicants.length);
        
        const recruiter = await User.findById(recruiterId);
        const shortlisted = recruiter.recruiterProfile?.savedCandidates?.length || 0;
        
        res.json({
            success: true,
            analytics: {
                jobsPosted,
                campusDrives: drives.length,
                totalApplicants,
                shortlistedCandidates: shortlisted,
                matchRate: '78%' // Simulated placeholder
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── 6. Post Job/Internship ──
exports.createJob = async (req, res) => {
    try {
        const { type, title, location, salary, description, tags, link, requiredSkills } = req.body;
        
        const company = req.user.recruiterProfile?.companyName || 'StudySpirit Partner';
        
        const newJob = new JobListing({
            id: `REC_${Date.now()}`,
            type, title, company, location, salary, description, tags, link, requiredSkills,
            source: 'StudySpirit',
            logo: `https://logo.clearbit.com/${company.toLowerCase().replace(/\s/g, '')}.com`
        });
        
        await newJob.save();
        res.status(201).json({ success: true, job: newJob });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
