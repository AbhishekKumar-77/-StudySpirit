const JobListing = require('../models/JobListing');
const CareerProfile = require('../models/CareerProfile');

// In-memory cache
let cachedJobs = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// ──────────────────────────────────────────
// 1. Remotive API — Free, no key needed
//    Real remote tech jobs, many open to India
// ──────────────────────────────────────────
async function fetchRemotiveJobs() {
    try {
        const res = await fetch('https://remotive.com/api/remote-jobs?limit=30&category=software-dev', {
            headers: { 'User-Agent': 'StudySpirit/1.0' }
        });
        if (!res.ok) return [];
        const data = await res.json();
        const jobs = data.jobs || [];
        return jobs.slice(0, 20).map(job => ({
            id: `RMT_${job.id}`,
            type: detectJobType(job.job_type, job.title),
            title: job.title || 'Untitled',
            company: job.company_name || 'Unknown',
            location: job.candidate_required_location || 'Worldwide / Remote',
            salary: job.salary || 'Not Disclosed',
            source: 'Remotive',
            posted: job.publication_date ? formatPostedDate(job.publication_date) : 'Recently',
            logo: job.company_logo || `https://logo.clearbit.com/${(job.company_name || '').toLowerCase().replace(/\s/g, '')}.com`,
            tags: job.tags || [job.job_type || 'Remote'],
            link: job.url || 'https://remotive.com',
            description: (job.description || '').replace(/<[^>]*>/g, '').substring(0, 200),
            isRemote: true,
            employmentType: job.job_type || 'FULLTIME'
        }));
    } catch (err) {
        console.error('❌ Remotive fetch error:', err.message);
        return [];
    }
}

// ──────────────────────────────────────────
// 2. The Muse API — Free, no key needed
//    Real company jobs with good descriptions
// ──────────────────────────────────────────
async function fetchTheMuseJobs() {
    try {
        const res = await fetch('https://www.themuse.com/api/public/jobs?category=Computer+and+IT&level=Entry+Level&level=Mid+Level&page=0&descending=true', {
            headers: { 'User-Agent': 'StudySpirit/1.0' }
        });
        if (!res.ok) return [];
        const data = await res.json();
        const jobs = data.results || [];
        return jobs.slice(0, 15).map((job, idx) => ({
            id: `MUS_${job.id || idx}`,
            type: detectJobType('', job.name),
            title: job.name || 'Untitled',
            company: job.company?.name || 'Unknown',
            location: job.locations?.map(l => l.name).join(', ') || 'Remote / Flexible',
            salary: 'Not Disclosed',
            source: 'The Muse',
            posted: job.publication_date ? formatPostedDate(job.publication_date) : 'Recently',
            logo: job.company?.refs?.landing_page
                ? `https://logo.clearbit.com/${(job.company.name || '').toLowerCase().replace(/\s/g, '')}.com`
                : `https://logo.clearbit.com/${(job.company?.name || '').toLowerCase().replace(/\s/g, '')}.com`,
            tags: job.categories?.map(c => c.name) || ['Tech'],
            link: job.refs?.landing_page || 'https://www.themuse.com/jobs',
            description: (job.contents || '').replace(/<[^>]*>/g, '').substring(0, 200),
            isRemote: (job.locations || []).some(l => l.name?.toLowerCase().includes('remote')),
            employmentType: 'FULLTIME'
        }));
    } catch (err) {
        console.error('❌ The Muse fetch error:', err.message);
        return [];
    }
}

// ──────────────────────────────────────────
// 3. Jobicy API — Free, India filter
// ──────────────────────────────────────────
async function fetchJobicyJobs() {
    try {
        const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=20&geo=india', {
            headers: { 'User-Agent': 'StudySpirit/1.0' }
        });
        if (!res.ok) return [];
        const data = await res.json();
        const jobs = data.jobs || [];
        return jobs.map(job => ({
            id: `JBC_${job.id}`,
            type: detectJobType(job.jobType, job.jobTitle),
            title: job.jobTitle || 'Untitled',
            company: job.companyName || 'Unknown',
            location: job.jobGeo || 'Remote (India)',
            salary: (job.annualSalaryMin && job.annualSalaryMax)
                ? `${job.annualSalaryMin}–${job.annualSalaryMax} ${job.salaryCurrency || 'USD'}`
                : 'Not Disclosed',
            source: 'Jobicy',
            posted: job.pubDate ? formatPostedDate(job.pubDate) : 'Recently',
            logo: job.companyLogo || `https://logo.clearbit.com/${(job.companyName || '').toLowerCase().replace(/\s/g, '')}.com`,
            tags: job.jobIndustry ? [job.jobIndustry] : ['Remote'],
            link: job.url || '#',
            description: (job.jobDescription || '').replace(/<[^>]*>/g, '').substring(0, 200),
            isRemote: true,
            employmentType: job.jobType || 'FULLTIME'
        }));
    } catch (err) {
        console.error('❌ Jobicy fetch error:', err.message);
        return [];
    }
}

// ──────────────────────────────────────────
// 4. RemoteOK — Free, relaxed filter
// ──────────────────────────────────────────
async function fetchRemoteOKJobs() {
    try {
        const res = await fetch('https://remoteok.com/api', {
            headers: { 'User-Agent': 'StudySpirit/1.0' }
        });
        if (!res.ok) return [];
        const data = await res.json();
        // Accept Worldwide/Anywhere/India jobs
        const allowed = ['india', 'worldwide', 'anywhere', 'global', 'remote'];
        const jobs = Array.isArray(data)
            ? data.filter(j => j.id && j.position && j.location &&
                allowed.some(k => j.location.toLowerCase().includes(k)))
            : [];
        return jobs.slice(0, 15).map(job => ({
            id: `ROK_${job.id}`,
            type: detectJobType('', job.position),
            title: job.position || 'Untitled',
            company: job.company || 'Unknown',
            location: job.location || 'Remote',
            salary: job.salary || 'Not Disclosed',
            source: 'RemoteOK',
            posted: job.date ? formatPostedDate(job.date) : 'Recently',
            logo: job.company_logo || `https://logo.clearbit.com/${(job.company || '').toLowerCase().replace(/\s/g, '')}.com`,
            tags: job.tags || [],
            link: job.url || `https://remoteok.com/l/${job.id}`,
            description: (job.description || '').replace(/<[^>]*>/g, '').substring(0, 200),
            isRemote: true,
            employmentType: 'FULLTIME'
        }));
    } catch (err) {
        console.error('❌ RemoteOK fetch error:', err.message);
        return [];
    }
}

// ──────────────────────────────────────────
// 5. Curated Real Indian Tech Jobs (Fallback)
//    Always shown — real companies, real links
// ──────────────────────────────────────────
function getCuratedIndianJobs() {
    return [
        {
            id: 'CUR_001', type: 'job',
            title: 'Software Engineer (Full Stack)', company: 'Infosys',
            location: 'Bengaluru, India', salary: '₹6–12 LPA', source: 'Infosys Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/infosys.com',
            tags: ['Java', 'React', 'Spring Boot', 'Full Stack'],
            link: 'https://career.infosys.com/jobdesc?jobReferenceCode=INFSYS-EXTERNAL-197093',
            description: 'Join Infosys as a Full Stack Developer. Work on enterprise-grade applications using Java, React, and Spring Boot.',
            isRemote: false, employmentType: 'FULLTIME'
        },
        {
            id: 'CUR_002', type: 'internship',
            title: 'Software Engineering Intern', company: 'Microsoft India',
            location: 'Hyderabad, India', salary: '₹80,000/month', source: 'Microsoft Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/microsoft.com',
            tags: ['C#', '.NET', 'Azure', 'Intern'],
            link: 'https://careers.microsoft.com/students/us/en/india-internship',
            description: 'Microsoft India internship for engineering students. Work on real products used by millions worldwide.',
            isRemote: false, employmentType: 'INTERNSHIP'
        },
        {
            id: 'CUR_003', type: 'job',
            title: 'Backend Engineer (Node.js)', company: 'Razorpay',
            location: 'Bengaluru, India (Hybrid)', salary: '₹15–30 LPA', source: 'Razorpay Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/razorpay.com',
            tags: ['Node.js', 'PostgreSQL', 'Redis', 'Microservices'],
            link: 'https://razorpay.com/jobs/',
            description: 'Build the payment infrastructure that powers India\'s digital economy. Work with Node.js, PostgreSQL, and distributed systems.',
            isRemote: false, employmentType: 'FULLTIME'
        },
        {
            id: 'CUR_004', type: 'job',
            title: 'Frontend Developer (React)', company: 'Flipkart',
            location: 'Bengaluru, India', salary: '₹12–25 LPA', source: 'Flipkart Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/flipkart.com',
            tags: ['React', 'TypeScript', 'Redux', 'Performance'],
            link: 'https://www.flipkartcareers.com/#!/joblist',
            description: 'Work on Flipkart\'s consumer-facing web apps serving 400M+ users. Focus on performance, accessibility, and scale.',
            isRemote: false, employmentType: 'FULLTIME'
        },
        {
            id: 'CUR_005', type: 'internship',
            title: 'Data Science Intern', company: 'Google India',
            location: 'Hyderabad / Bengaluru, India', salary: '₹1,00,000/month', source: 'Google Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/google.com',
            tags: ['Python', 'ML', 'TensorFlow', 'Data Science'],
            link: 'https://careers.google.com/students/',
            description: 'Google India internship for students passionate about data science and machine learning. Work on real Google products.',
            isRemote: false, employmentType: 'INTERNSHIP'
        },
        {
            id: 'CUR_006', type: 'job',
            title: 'DevOps Engineer', company: 'Zomato',
            location: 'Gurugram, India (Hybrid)', salary: '₹18–35 LPA', source: 'Zomato Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/zomato.com',
            tags: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
            link: 'https://www.zomato.com/careers',
            description: 'Manage infrastructure for one of India\'s largest food delivery platforms. Work with Kubernetes, AWS, and Terraform at scale.',
            isRemote: false, employmentType: 'FULLTIME'
        },
        {
            id: 'CUR_007', type: 'job',
            title: 'Android Developer (Kotlin)', company: 'PhonePe',
            location: 'Bengaluru, India', salary: '₹20–40 LPA', source: 'PhonePe Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/phonepe.com',
            tags: ['Kotlin', 'Android', 'Jetpack Compose', 'UPI'],
            link: 'https://www.phonepe.com/careers/',
            description: 'Build the PhonePe Android app used by 500M+ Indians for payments. Work on Kotlin, Jetpack Compose, and real-time systems.',
            isRemote: false, employmentType: 'FULLTIME'
        },
        {
            id: 'CUR_008', type: 'internship',
            title: 'Full Stack Developer Intern', company: 'Swiggy',
            location: 'Bengaluru, India', salary: '₹60,000/month', source: 'Swiggy Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/swiggy.com',
            tags: ['React', 'Node.js', 'MongoDB', 'Intern'],
            link: 'https://careers.swiggy.com/',
            description: 'Intern at Swiggy and work on features used by millions of food lovers daily. Full stack role with React and Node.js.',
            isRemote: false, employmentType: 'INTERNSHIP'
        },
        {
            id: 'CUR_009', type: 'job',
            title: 'Machine Learning Engineer', company: 'Ola',
            location: 'Bengaluru, India', salary: '₹25–50 LPA', source: 'Ola Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/olacabs.com',
            tags: ['Python', 'PyTorch', 'MLOps', 'Computer Vision'],
            link: 'https://www.olacabs.com/careers',
            description: 'Build ML models for route optimization, demand forecasting, and driver matching at Ola. Work with PyTorch and MLOps pipelines.',
            isRemote: false, employmentType: 'FULLTIME'
        },
        {
            id: 'CUR_010', type: 'hackathon',
            title: 'Smart India Hackathon 2025', company: 'Govt. of India',
            location: 'Pan India (Online + Offline)', salary: '₹1,00,000 Prize', source: 'SIH',
            posted: 'Recently', logo: 'https://logo.clearbit.com/sih.gov.in',
            tags: ['Hackathon', 'Students', 'Innovation', 'Prize'],
            link: 'https://www.sih.gov.in/',
            description: 'India\'s biggest hackathon for students. Solve real government problems and win prizes up to ₹1 lakh. Open to all engineering students.',
            isRemote: false, employmentType: 'HACKATHON'
        },
        {
            id: 'CUR_011', type: 'job',
            title: 'Cloud Solutions Architect', company: 'TCS',
            location: 'Mumbai / Pune, India', salary: '₹10–20 LPA', source: 'TCS Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/tcs.com',
            tags: ['AWS', 'Azure', 'Cloud', 'Architecture'],
            link: 'https://ibegin.tcs.com/iBegin/',
            description: 'Design and implement cloud solutions for TCS enterprise clients. Work with AWS, Azure, and GCP across multiple industries.',
            isRemote: false, employmentType: 'FULLTIME'
        },
        {
            id: 'CUR_012', type: 'internship',
            title: 'Product Management Intern', company: 'CRED',
            location: 'Bengaluru, India', salary: '₹75,000/month', source: 'CRED Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/cred.club',
            tags: ['Product', 'Analytics', 'Fintech', 'Intern'],
            link: 'https://careers.cred.club/',
            description: 'Intern in CRED\'s product team. Work on fintech products used by India\'s premium credit card users. Data-driven product decisions.',
            isRemote: false, employmentType: 'INTERNSHIP'
        },
        {
            id: 'CUR_013', type: 'job',
            title: 'iOS Developer (Swift)', company: 'Paytm',
            location: 'Noida, India', salary: '₹15–28 LPA', source: 'Paytm Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/paytm.com',
            tags: ['Swift', 'iOS', 'Objective-C', 'Payments'],
            link: 'https://paytm.com/careers/',
            description: 'Build the Paytm iOS app for 350M+ users. Work on payments, banking, and commerce features using Swift and SwiftUI.',
            isRemote: false, employmentType: 'FULLTIME'
        },
        {
            id: 'CUR_014', type: 'hackathon',
            title: 'Unstop Hackathon Series', company: 'Unstop',
            location: 'Online', salary: 'Multiple Prizes', source: 'Unstop',
            posted: 'Ongoing', logo: 'https://logo.clearbit.com/unstop.com',
            tags: ['Hackathon', 'Online', 'Students', 'Competitions'],
            link: 'https://unstop.com/hackathons',
            description: 'Browse 100+ active hackathons on Unstop. Compete, win prizes, and get noticed by top recruiters across India.',
            isRemote: true, employmentType: 'HACKATHON'
        },
        {
            id: 'CUR_015', type: 'job',
            title: 'Data Engineer (Python + Spark)', company: 'Meesho',
            location: 'Bengaluru, India (Hybrid)', salary: '₹20–38 LPA', source: 'Meesho Careers',
            posted: 'Recently', logo: 'https://logo.clearbit.com/meesho.com',
            tags: ['Python', 'Apache Spark', 'Airflow', 'Data Engineering'],
            link: 'https://meesho.io/careers',
            description: 'Build data pipelines for Meesho\'s e-commerce platform serving 150M+ users. Work with Python, Spark, and Airflow.',
            isRemote: false, employmentType: 'FULLTIME'
        }
    ];
}

// ──────────────────────────────────────────
// Helper Functions
// ──────────────────────────────────────────
function detectJobType(jobType, title) {
    const t = (title || '').toLowerCase();
    const e = (jobType || '').toLowerCase();
    if (e.includes('intern') || t.includes('intern') || t.includes('trainee')) return 'internship';
    if (t.includes('hackathon') || t.includes('challenge') || t.includes('contest')) return 'hackathon';
    return 'job';
}

function formatPostedDate(dateStr) {
    if (!dateStr) return 'Recently';
    try {
        const posted = new Date(dateStr);
        const now = new Date();
        const diffMs = now - posted;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    } catch {
        return 'Recently';
    }
}

// ──────────────────────────────────────────
// Main Controller: GET /api/career
// ──────────────────────────────────────────
exports.getJobs = async (req, res) => {
    try {
        const { forceRefresh } = req.query;
        const now = Date.now();

        // Serve from cache if fresh
        if (cachedJobs.length > 0 && (now - cacheTimestamp) < CACHE_DURATION && !forceRefresh) {
            console.log('📦 Serving cached jobs:', cachedJobs.length);
            const dbJobs = await JobListing.find().sort({ createdAt: -1 }).lean();
            return res.status(200).json({
                success: true,
                count: dbJobs.length + cachedJobs.length,
                data: [...dbJobs, ...cachedJobs],
                sources: ['cache', 'database'],
                cached: true
            });
        }

        console.log('🔄 Fetching fresh jobs from all sources...');

        // Fetch from all free APIs in parallel
        const [remotiveJobs, theMuseJobs, jobicyJobs, remoteOKJobs, dbJobs] = await Promise.allSettled([
            fetchRemotiveJobs(),
            fetchTheMuseJobs(),
            fetchJobicyJobs(),
            fetchRemoteOKJobs(),
            JobListing.find().sort({ createdAt: -1 }).lean()
        ]);

        const remotive = remotiveJobs.status === 'fulfilled' ? remotiveJobs.value : [];
        const muse = theMuseJobs.status === 'fulfilled' ? theMuseJobs.value : [];
        const jobicy = jobicyJobs.status === 'fulfilled' ? jobicyJobs.value : [];
        const remoteOK = remoteOKJobs.status === 'fulfilled' ? remoteOKJobs.value : [];
        const db = dbJobs.status === 'fulfilled' ? dbJobs.value : [];

        console.log(`✅ Remotive: ${remotive.length} | Muse: ${muse.length} | Jobicy: ${jobicy.length} | RemoteOK: ${remoteOK.length} | DB: ${db.length}`);

        // Combine API results
        let apiJobs = [...remotive, ...muse, ...jobicy, ...remoteOK];

        // Deduplicate by title+company
        const seen = new Set();
        apiJobs = apiJobs.filter(job => {
            const key = `${(job.title || '').toLowerCase().substring(0, 25)}_${(job.company || '').toLowerCase().substring(0, 15)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Always include curated Indian jobs — they are real listings with real links
        const curated = getCuratedIndianJobs();

        // Merge: DB jobs first, then API jobs, then curated (deduplicated)
        const allJobs = [...db, ...apiJobs, ...curated];

        // Cache API results
        cachedJobs = [...apiJobs, ...curated];
        cacheTimestamp = now;

        const activeSources = [...new Set(allJobs.map(j => j.source).filter(Boolean))];

        res.status(200).json({
            success: true,
            count: allJobs.length,
            data: allJobs,
            sources: activeSources,
            cached: false
        });

    } catch (error) {
        console.error('❌ Error fetching jobs:', error);
        // Always return curated jobs as fallback
        const curated = getCuratedIndianJobs();
        res.status(200).json({ success: true, count: curated.length, data: curated, sources: ['Curated'] });
    }
};

// POST /api/career — Add a new listing
exports.addJob = async (req, res) => {
    try {
        const { type, title, company, location, salary, source, tags, link } = req.body;
        const newJob = new JobListing({
            id: `DB_${Date.now()}`,
            type, title, company, location, salary, source, tags, link,
            logo: `https://logo.clearbit.com/${company.toLowerCase().replace(/\s/g, '')}.com`
        });
        await newJob.save();
        cacheTimestamp = 0; // Invalidate cache
        res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        console.error('Error adding job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ──────────────────────────────────────────
// AI: Analyze Match Score
// POST /api/career/analyze-match
// Body: { userSkills, jobTitle, jobDescription, jobTags }
// ──────────────────────────────────────────
exports.analyzeMatch = async (req, res) => {
    try {
        const { userSkills, jobTitle, jobDescription, jobTags } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY || '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';

        if (!GROQ_API_KEY) return res.status(500).json({ message: 'AI service not configured.' });
        if (!jobTitle) return res.status(400).json({ message: 'Job details required.' });

        let skillsStr = Array.isArray(userSkills) ? userSkills.join(', ') : (userSkills || 'Not specified');
        let verifiedContext = '';

        if (req.isAuthenticated && req.isAuthenticated()) {
            const CareerProfile = require('../models/CareerProfile');
            const profile = await CareerProfile.findOne({ user: req.user._id });
            if (profile && profile.verifiedSkills && profile.verifiedSkills.length > 0) {
                const verifiedStr = profile.verifiedSkills.map(s => `${s.skillName} (${s.score}% - ${s.level})`).join(', ');
                skillsStr = `${skillsStr}\nVERIFIED PLATFORM SKILLS: ${verifiedStr}`;
                verifiedContext = `\nNOTE: The 'VERIFIED PLATFORM SKILLS' are verified through our proctored exams. Give high weightage to these verified skills over the self-reported ones.`;
            }
        }

        const tagsStr = Array.isArray(jobTags) ? jobTags.join(', ') : (jobTags || '');

        const prompt = `You are an expert tech career coach and recruiter. Analyze how well this candidate matches the job.

CANDIDATE SKILLS: ${skillsStr} ${verifiedContext}

JOB TITLE: ${jobTitle}
JOB TAGS/REQUIRED SKILLS: ${tagsStr}
JOB DESCRIPTION: ${(jobDescription || '').substring(0, 600)}

Return ONLY a JSON object like this:
{
  "matchScore": <number 0-100>,
  "verdict": "<one of: 'Strong Match', 'Good Match', 'Fair Match', 'Weak Match'>",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "tip": "<one short actionable tip to improve the match, max 15 words>"
}`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a career advisor. Return ONLY valid JSON, no extra text.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 400,
                response_format: { type: 'json_object' }
            })
        });

        const data = await groqRes.json();
        const result = JSON.parse(data.choices[0].message.content);
        res.json({ success: true, result });
    } catch (err) {
        console.error('❌ analyzeMatch error:', err);
        res.status(500).json({ success: false, message: 'AI analysis failed.' });
    }
};

// ──────────────────────────────────────────
// AI: Generate Cover Letter
// POST /api/career/cover-letter
// Body: { userName, userSkills, jobTitle, company, jobDescription, jobTags }
// ──────────────────────────────────────────
exports.generateCoverLetter = async (req, res) => {
    try {
        const { userName, userSkills, jobTitle, company, jobDescription, jobTags } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY || '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';

        if (!GROQ_API_KEY) return res.status(500).json({ message: 'AI service not configured.' });
        if (!jobTitle || !company) return res.status(400).json({ message: 'Job title and company required.' });

        let skillsStr = Array.isArray(userSkills) ? userSkills.join(', ') : (userSkills || 'various technical skills');
        let verifiedContext = '';

        if (req.isAuthenticated && req.isAuthenticated()) {
            const CareerProfile = require('../models/CareerProfile');
            const profile = await CareerProfile.findOne({ user: req.user._id });
            if (profile && profile.verifiedSkills && profile.verifiedSkills.length > 0) {
                const verifiedStr = profile.verifiedSkills.map(s => `${s.skillName} (${s.score}% verified)`).join(', ');
                skillsStr = `${skillsStr}\nVERIFIED PLATFORM SKILLS: ${verifiedStr}`;
                verifiedContext = `\nIMPORTANT: Mention that the 'VERIFIED PLATFORM SKILLS' are verified through rigorous proctored exams on our platform. Emphasize these verified skills.`;
            }
        }

        const tagsStr = Array.isArray(jobTags) ? jobTags.join(', ') : (jobTags || '');

        const prompt = `Write a compelling, personalized cover letter for the following:

CANDIDATE NAME: ${userName || 'the candidate'}
CANDIDATE SKILLS: ${skillsStr} ${verifiedContext}
APPLYING FOR: ${jobTitle} at ${company}
REQUIRED SKILLS: ${tagsStr}
JOB DESCRIPTION SNIPPET: ${(jobDescription || '').substring(0, 500)}

Write a professional cover letter (3 short paragraphs, under 250 words). 
- Opening: Express enthusiasm for the specific role and company.
- Middle: Connect 2-3 of the candidate's skills to the job requirements with impact.
- Closing: Strong call to action.
Do NOT include addresses or dates. Start directly with "Dear Hiring Manager,". Be genuine, concise, and powerful.`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a professional career writer. Write compelling, tailored cover letters.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 600
            })
        });

        const data = await groqRes.json();
        const letter = data.choices[0].message.content.trim();
        res.json({ success: true, letter });
    } catch (err) {
        console.error('❌ generateCoverLetter error:', err);
        res.status(500).json({ success: false, message: 'Cover letter generation failed.' });
    }
};

// ──────────────────────────────────────────
// GET /api/career/profile - Get User's Skill Passport
// ──────────────────────────────────────────
exports.getCareerProfile = async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });
    try {
        let profile = await CareerProfile.findOne({ user: req.user._id });
        if (!profile) {
            // Auto generate basic profile
            profile = new CareerProfile({ user: req.user._id });
            await profile.save();
        }
        res.json({ success: true, profile });
    } catch (err) {
        console.error('Error fetching career profile:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
