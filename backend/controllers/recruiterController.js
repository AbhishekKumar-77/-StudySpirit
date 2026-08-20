const User = require('../models/User');
const CareerProfile = require('../models/CareerProfile');
const JobListing = require('../models/JobListing');
const CampusDrive = require('../models/CampusDrive');
const BadgeVerification = require('../models/BadgeVerification');
const fetch = require('node-fetch');

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
exports.getPublicProfile = async (req, res) => {
    try {
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
                matchRate: '78%'
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
            type: type || 'job', title, company, location, salary, description, tags, link, requiredSkills,
            source: 'StudySpirit',
            postedBy: req.user._id,
            logo: `https://logo.clearbit.com/${company.toLowerCase().replace(/\s/g, '')}.com`
        });
        
        await newJob.save();
        res.status(201).json({ success: true, job: newJob });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── 6b. Get Recruiter's Own Jobs ──
exports.getMyJobs = async (req, res) => {
    try {
        const jobs = await JobListing.find({ source: 'StudySpirit' }).sort({ createdAt: -1 });
        res.json({ success: true, jobs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── 7. Reverse Match (Recruiter AI) ──
exports.getReverseMatch = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await JobListing.findOne({ id: jobId });
        if (!job) return res.status(404).json({ error: 'Job not found' });

        const profiles = await CareerProfile.find({ isPublic: true })
            .populate('user', 'name email university course stats');

        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;

        const candidatesData = profiles.map(p => ({
            id: p.user._id,
            name: p.user.name,
            skills: p.verifiedSkills.map(s => `${s.skillName}:${s.score}%`),
            softSkills: p.softSkillsProfile,
            uni: p.user.university
        }));

        const prompt = `
        Job Title: ${job.title}
        Requirements: ${job.description} ${job.tags?.join(', ')}
        
        Candidates:
        ${JSON.stringify(candidatesData)}
        
        Task: Rank the top 5 candidates for this job. Return ONLY a JSON array of objects with {id, matchPercentage, reason}. Format: {"rankings": [{"id": "...", "matchPercentage": 90, "reason": "..."}]}
        `;

        const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            })
        });

        const aiData = await aiRes.json();
        const rankings = JSON.parse(aiData.choices[0].message.content).rankings || [];

        const results = rankings.map(rank => {
            const profile = profiles.find(p => p.user._id.toString() === rank.id);
            return {
                ...rank,
                name: profile?.user.name,
                university: profile?.user.university,
                avatar: profile?.user.avatar
            };
        });

        res.json({ success: true, topMatches: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── 8. One-Click Apply ──
exports.applyToJob = async (req, res) => {
    try {
        const { jobId } = req.body;
        const studentId = req.user._id;

        const job = await JobListing.findOne({ id: jobId });
        if (!job) return res.status(404).json({ error: 'Job not found' });

        if (job.applicants.includes(studentId)) {
            return res.status(400).json({ error: 'Already applied' });
        }

        job.applicants.push(studentId);
        await job.save();

        res.json({ success: true, message: 'Application submitted with your Skill Passport!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── 9. Badge Verification ──
exports.verifyBadge = async (req, res) => {
    try {
        const { code } = req.params;
        const verification = await BadgeVerification.findOne({ verificationCode: code })
            .populate('student', 'name avatar university course stats')
            .populate('metadata.examId', 'title code');
            
        if (!verification) return res.status(404).json({ error: 'Invalid verification code' });
        
        res.json({ success: true, verification });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
