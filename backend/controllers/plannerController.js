const StudentProfile = require('../models/StudentProfile');
const AcademicCourse = require('../models/AcademicCourse');
const StudentSkill = require('../models/StudentSkill');
const StudentProject = require('../models/StudentProject');
const LearningTask = require('../models/LearningTask');
const StudentMilestone = require('../models/StudentMilestone');
const StudentDeadline = require('../models/StudentDeadline');
const AIRecommendation = require('../models/AIRecommendation');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const User = require('../models/User');
const fetch = typeof globalThis.fetch === 'function' ? globalThis.fetch : require('node-fetch');

// Helper to reliably retrieve the user ID
const getUserId = async (req) => {
    if (req.user && req.user._id) return req.user._id;
    if (req.session?.passport?.user) return req.session.passport.user;
    if (req.headers['x-user-id']) return req.headers['x-user-id'];
    
    // Find first student user as fallback to ensure real DB link
    const firstUser = await User.findOne({ role: 'student' }).select('_id');
    if (firstUser) return firstUser._id;
    return '64f1a2b3c4d5e6f7a8b9c0d1';
};

// ═══════════════════════════════════════════════════════════════════
// SEMESTER-WISE ACADEMIC ROADMAP BLUEPRINT (8 Semesters, B.Tech CSE)
// ═══════════════════════════════════════════════════════════════════
const SEMESTER_BLUEPRINT = {
    1: {
        courses: [
            { name: 'Python Programming', code: 'CS101', mastery: 85, color: '#10b981' },
            { name: 'HTML & CSS', code: 'CS102', mastery: 90, color: '#8b5cf6' },
            { name: 'JavaScript', code: 'CS103', mastery: 78, color: '#f59e0b' },
            { name: 'Computer Fundamentals', code: 'CS104', mastery: 92, color: '#06b6d4' },
            { name: 'Mathematics-I', code: 'MA101', mastery: 75, color: '#ef4444' }
        ],
        skills: [
            { name: 'Python Programming', category: 'Programming', mastery: 85, status: 'Completed', color: '#10b981' },
            { name: 'Web Development', category: 'Development', mastery: 80, status: 'Completed', color: '#8b5cf6' },
            { name: 'Problem Solving', category: 'Core', mastery: 70, status: 'Completed', color: '#f59e0b' },
            { name: 'Computer Fundamentals', category: 'Core', mastery: 92, status: 'Completed', color: '#06b6d4' }
        ],
        projects: [
            { name: 'Personal Portfolio Website', description: 'Responsive portfolio using HTML, CSS, JavaScript.', status: 'Completed', progress: 100, dueDate: 'Dec 15, 2025', relatedSkills: ['HTML', 'CSS', 'JavaScript'] },
            { name: 'Python Mini Project', description: 'Python-based automation/utility project.', status: 'Completed', progress: 100, dueDate: 'Dec 20, 2025', relatedSkills: ['Python', 'Problem Solving'] }
        ]
    },
    2: {
        courses: [
            { name: 'Data Structures', code: 'CS201', mastery: 72, color: '#10b981' },
            { name: 'Object Oriented Programming', code: 'CS202', mastery: 65, color: '#8b5cf6' },
            { name: 'Database Management Systems', code: 'CS203', mastery: 40, color: '#f59e0b' },
            { name: 'Discrete Mathematics', code: 'CS204', mastery: 65, color: '#06b6d4' },
            { name: 'Computer Organization', code: 'CS205', mastery: 30, color: '#ef4444' }
        ],
        skills: [
            { name: 'Programming Fundamentals', category: 'Core', mastery: 100, status: 'Completed', color: '#10b981' },
            { name: 'Data Structures', category: 'DSA', mastery: 68, status: 'In Progress', color: '#10b981' },
            { name: 'Algorithms', category: 'DSA', mastery: 30, status: 'Recommended Next', color: '#f59e0b' },
            { name: 'C++ Programming', category: 'Programming', mastery: 70, status: 'In Progress', color: '#8b5cf6' }
        ],
        projects: [
            { name: 'Library Management System', description: 'Full C++ console app using OOP and file handling.', status: 'In Progress', progress: 45, dueDate: 'May 30, 2026', relatedSkills: ['C++', 'OOP', 'Database', 'Git'] },
            { name: 'Student Database Project', description: 'DBMS & SQL based student management system.', status: 'Not Started', progress: 0, dueDate: 'Jun 15, 2026', relatedSkills: ['DBMS', 'SQL', 'C++'] }
        ]
    },
    3: {
        courses: [
            { name: 'C++ Programming', code: 'CS301', mastery: 0, color: '#94a3b8' },
            { name: 'Computer Networks', code: 'CS302', mastery: 0, color: '#94a3b8' },
            { name: 'Object Oriented Programming', code: 'CS303', mastery: 0, color: '#94a3b8' },
            { name: 'Computer Organization & Architecture', code: 'CS304', mastery: 0, color: '#94a3b8' },
            { name: 'Theory of Computation', code: 'CS305', mastery: 0, color: '#94a3b8' }
        ],
        skills: [
            { name: 'Advanced C++', category: 'Programming', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Computer Networking', category: 'Systems', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'OOP Concepts', category: 'Core', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Problem Solving', category: 'Core', mastery: 0, status: 'Locked', color: '#94a3b8' }
        ],
        projects: [
            { name: 'Network Simulation Project', description: 'Simulate network topologies.', status: 'Not Started', progress: 0, dueDate: 'Dec 2026', relatedSkills: ['Networking', 'C++'] },
            { name: 'C++ Application Project', description: 'Build a C++ app with advanced OOP.', status: 'Not Started', progress: 0, dueDate: 'Dec 2026', relatedSkills: ['C++', 'OOP'] }
        ]
    },
    4: {
        courses: [
            { name: 'Java Programming', code: 'CS401', mastery: 0, color: '#94a3b8' },
            { name: 'Operating Systems', code: 'CS402', mastery: 0, color: '#94a3b8' },
            { name: 'Design & Analysis of Algorithms', code: 'CS403', mastery: 0, color: '#94a3b8' },
            { name: 'Software Engineering', code: 'CS404', mastery: 0, color: '#94a3b8' },
            { name: 'Probability & Statistics', code: 'MA401', mastery: 0, color: '#94a3b8' }
        ],
        skills: [
            { name: 'Java Programming', category: 'Programming', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Operating Systems', category: 'Systems', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Advanced Algorithms', category: 'DSA', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Software Development', category: 'Development', mastery: 0, status: 'Locked', color: '#94a3b8' }
        ],
        projects: [
            { name: 'Java Application', description: 'Java OOP-based desktop application.', status: 'Not Started', progress: 0, dueDate: 'Jun 2027', relatedSkills: ['Java', 'OOP'] },
            { name: 'Operating System Simulation', description: 'Simulate CPU scheduling and memory management.', status: 'Not Started', progress: 0, dueDate: 'Jun 2027', relatedSkills: ['OS', 'C'] }
        ]
    },
    5: {
        courses: [
            { name: 'Artificial Intelligence', code: 'CS501', mastery: 0, color: '#94a3b8' },
            { name: 'Machine Learning', code: 'CS502', mastery: 0, color: '#94a3b8' },
            { name: 'Web Technologies', code: 'CS503', mastery: 0, color: '#94a3b8' },
            { name: 'Computer Graphics', code: 'CS504', mastery: 0, color: '#94a3b8' },
            { name: 'Professional Elective-I', code: 'PE501', mastery: 0, color: '#94a3b8' }
        ],
        skills: [
            { name: 'AI Fundamentals', category: 'AI/ML', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Machine Learning', category: 'AI/ML', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Advanced Web Development', category: 'Development', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Data Analysis', category: 'Data', mastery: 0, status: 'Locked', color: '#94a3b8' }
        ],
        projects: [
            { name: 'AI-Based Project', description: 'AI-based application using Python.', status: 'Not Started', progress: 0, dueDate: 'Dec 2027', relatedSkills: ['AI', 'Python', 'ML'] },
            { name: 'Full-Stack Web Application', description: 'End-to-end web app with React + Node.js.', status: 'Not Started', progress: 0, dueDate: 'Dec 2027', relatedSkills: ['React', 'Node.js', 'MongoDB'] }
        ]
    },
    6: {
        courses: [
            { name: 'Cloud Computing', code: 'CS601', mastery: 0, color: '#94a3b8' },
            { name: 'Cyber Security', code: 'CS602', mastery: 0, color: '#94a3b8' },
            { name: 'Data Science', code: 'CS603', mastery: 0, color: '#94a3b8' },
            { name: 'Mobile Application Development', code: 'CS604', mastery: 0, color: '#94a3b8' },
            { name: 'Professional Elective-II', code: 'PE601', mastery: 0, color: '#94a3b8' }
        ],
        skills: [
            { name: 'Cloud Computing', category: 'Cloud', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Cyber Security', category: 'Security', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Data Science', category: 'Data', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Mobile Development', category: 'Development', mastery: 0, status: 'Locked', color: '#94a3b8' }
        ],
        projects: [
            { name: 'Cloud-Based Application', description: 'Deploy an app on AWS/GCP.', status: 'Not Started', progress: 0, dueDate: 'Jun 2028', relatedSkills: ['AWS', 'Docker', 'Node.js'] },
            { name: 'Mobile Application', description: 'Cross-platform mobile app.', status: 'Not Started', progress: 0, dueDate: 'Jun 2028', relatedSkills: ['React Native', 'Firebase'] }
        ]
    },
    7: {
        courses: [
            { name: 'Big Data Analytics', code: 'CS701', mastery: 0, color: '#94a3b8' },
            { name: 'DevOps', code: 'CS702', mastery: 0, color: '#94a3b8' },
            { name: 'Distributed Systems', code: 'CS703', mastery: 0, color: '#94a3b8' },
            { name: 'Professional Elective-III', code: 'PE701', mastery: 0, color: '#94a3b8' },
            { name: 'Project-I', code: 'PR701', mastery: 0, color: '#94a3b8' }
        ],
        skills: [
            { name: 'Big Data', category: 'Data', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'DevOps', category: 'Operations', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Docker & Kubernetes', category: 'Operations', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'System Design', category: 'Architecture', mastery: 0, status: 'Locked', color: '#94a3b8' }
        ],
        projects: [
            { name: 'Major Project-I', description: 'Full-stack major project.', status: 'Not Started', progress: 0, dueDate: 'Dec 2028', relatedSkills: ['Full-Stack', 'DevOps'] },
            { name: 'DevOps Deployment Project', description: 'CI/CD pipeline and containerization.', status: 'Not Started', progress: 0, dueDate: 'Dec 2028', relatedSkills: ['Docker', 'Kubernetes', 'CI/CD'] }
        ]
    },
    8: {
        courses: [
            { name: 'Major Project-II', code: 'PR801', mastery: 0, color: '#94a3b8' },
            { name: 'Professional Elective-IV', code: 'PE801', mastery: 0, color: '#94a3b8' },
            { name: 'Professional Elective-V', code: 'PE802', mastery: 0, color: '#94a3b8' },
            { name: 'Industry Internship', code: 'IN801', mastery: 0, color: '#94a3b8' }
        ],
        skills: [
            { name: 'Advanced Software Development', category: 'Development', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'System Design', category: 'Architecture', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Project Management', category: 'Management', mastery: 0, status: 'Locked', color: '#94a3b8' },
            { name: 'Industry Skills', category: 'Professional', mastery: 0, status: 'Locked', color: '#94a3b8' }
        ],
        projects: [
            { name: 'Final Year Major Project', description: 'Capstone project using modern stack.', status: 'Not Started', progress: 0, dueDate: 'Jun 2029', relatedSkills: ['Full-Stack', 'AI/ML', 'Cloud'] },
            { name: 'Industry Internship', description: 'Industry internship experience.', status: 'Not Started', progress: 0, dueDate: 'Jun 2029', relatedSkills: ['Industry', 'Professional Skills'] }
        ]
    }
};

// Helper to get active default focus for a given semester
const getDefaultFocusForSem = (sem) => {
    const semInt = Math.max(1, Math.min(8, Number(sem) || 1));
    switch(semInt) {
        case 1: return { course: 'Python Programming', topic: 'Programming Fundamentals', masteryPercent: 0 };
        case 2: return { course: 'Data Structures', topic: 'Arrays & Linked Lists', masteryPercent: 0 };
        case 3: return { course: 'C++ Programming', topic: 'Object Oriented Programming', masteryPercent: 0 };
        case 4: return { course: 'Operating Systems', topic: 'Processes & Concurrency', masteryPercent: 0 };
        case 5: return { course: 'Artificial Intelligence', topic: 'Search & ML Foundations', masteryPercent: 0 };
        case 6: return { course: 'Cloud Computing', topic: 'Containerization & Cloud Arch', masteryPercent: 0 };
        case 7: return { course: 'Big Data Analytics', topic: 'Distributed Data Processing', masteryPercent: 0 };
        case 8: return { course: 'Capstone Project', topic: 'Industry Project Deployment', masteryPercent: 0 };
        default: return { course: 'Core Foundations', topic: 'Programming Fundamentals', masteryPercent: 0 };
    }
};

// ═══════════════════════════════════════════════════════════════════
// SEED DEFAULT DATA (Dynamically tailored to the student's semester)
// ═══════════════════════════════════════════════════════════════════
const seedDefaultData = async (userId) => {
    const u = await User.findById(userId).catch(() => null);
    const userSem = Math.max(1, Math.min(8, Number(u?.semester || u?.currentSemester || 1)));
    const userName = u?.name || 'Student';
    const userCourse = u?.course || 'Computer Science & Engineering';
    const userGoal = u?.studyGoal || 'Software Engineer';

    let profile = await StudentProfile.findOne({ user: userId });
    if (!profile) {
        profile = await StudentProfile.create({
            user: userId,
            displayName: userName,
            level: u?.stats?.level || 1,
            xp: u?.stats?.xp || 0,
            xpToNextLevel: 1000,
            currentSemester: userSem,
            batch: `${userCourse} — ${(new Date().getFullYear())} Batch`,
            department: userCourse,
            startDate: 'Jan 2026',
            endDate: 'Jun 2026',
            targetRole: `${userGoal} Specialist`,
            targetDate: 'June 2027',
            overallProgressPercent: userSem > 1 ? Math.min(100, Math.round(((userSem - 1) / 8) * 100)) : 0,
            percentileRank: 50,
            weeklyHoursSpent: '0h 0m',
            weeklyHoursTarget: '6h 0m',
            weeklyHoursDiff: '0h vs last week',
            currentFocus: getDefaultFocusForSem(userSem),
            careerSteps: [
                { step: 1, title: 'Master Core Programming & Problem Solving', completed: userSem > 1 },
                { step: 2, title: 'Core Computer Science & Data Structures', completed: userSem > 2 },
                { step: 3, title: 'Frameworks, Database Systems & APIs', completed: userSem > 4 },
                { step: 4, title: 'Real-World Production Projects & Architecture', completed: userSem > 6 },
                { step: 5, title: 'Placement Preparation, System Design & Mock Interviews', completed: userSem >= 8 }
            ]
        });
    } else if (u?.semester && profile.currentSemester !== u.semester) {
        profile.currentSemester = u.semester;
        profile.currentFocus = getDefaultFocusForSem(u.semester);
        await profile.save();
    }

    // Courses, Skills, and Projects for all 8 semesters (clean, zero fake mastery for active semester)
    for (const [semNum, data] of Object.entries(SEMESTER_BLUEPRINT)) {
        const num = Number(semNum);
        const isCompletedSem = num < userSem;
        const isCurrentSem = num === userSem;

        const semCourses = await AcademicCourse.find({ user: userId, semesterNumber: num });
        if (semCourses.length === 0) {
            const coursesToInsert = data.courses.map(c => ({
                user: userId,
                semesterNumber: num,
                name: c.name,
                code: c.code,
                mastery: isCompletedSem ? 100 : 0,
                color: c.color
            }));
            await AcademicCourse.insertMany(coursesToInsert);
        }

        const semSkills = await StudentSkill.find({ user: userId, semesterNumber: num });
        if (semSkills.length === 0) {
            const skillsToInsert = data.skills.map(sk => ({
                user: userId,
                semesterNumber: num,
                name: sk.name,
                category: sk.category,
                mastery: isCompletedSem ? 100 : 0,
                status: isCompletedSem ? 'Completed' : isCurrentSem ? 'In Progress' : 'Locked',
                color: sk.color
            }));
            await StudentSkill.insertMany(skillsToInsert);
        }

        const semProjects = await StudentProject.find({ user: userId, semesterNumber: num });
        if (semProjects.length === 0) {
            const projectsToInsert = data.projects.map(p => ({
                user: userId,
                semesterNumber: num,
                name: p.name,
                description: p.description,
                status: isCompletedSem ? 'Completed' : 'Not Started',
                progress: isCompletedSem ? 100 : 0,
                dueDate: p.dueDate,
                relatedSkills: p.relatedSkills
            }));
            await StudentProject.insertMany(projectsToInsert);
        }
    }

    // Weekly Tasks: clean, personalized tasks for current semester with zero fake completions
    const existingTasks = await LearningTask.find({ user: userId });
    if (existingTasks.length === 0) {
        const currentSemCourses = SEMESTER_BLUEPRINT[userSem]?.courses || SEMESTER_BLUEPRINT[1].courses;
        const c1 = currentSemCourses[0]?.name || 'Core Programming';
        const c2 = currentSemCourses[1]?.name || 'Web Technologies';
        const c3 = currentSemCourses[2]?.name || 'Computer Fundamentals';
        const c4 = currentSemCourses[3]?.name || 'Mathematics';

        await LearningTask.insertMany([
            { user: userId, title: `${c1} — Syntax & Core Concepts`, dayLabel: 'Mon', dayOfWeek: 'Mon', durationMinutes: 60, taskType: 'LEARN', status: 'NOT_STARTED', completed: false, topic: 'Fundamentals', courseName: c1 },
            { user: userId, title: `${c1} — Hands-on Practice Problems`, dayLabel: 'Tue', dayOfWeek: 'Tue', durationMinutes: 90, taskType: 'PRACTICE', status: 'NOT_STARTED', completed: false, topic: 'Problem Solving', courseName: c1 },
            { user: userId, title: `${c2} — Architecture & First Module`, dayLabel: 'Wed', dayOfWeek: 'Wed', durationMinutes: 60, taskType: 'LEARN', status: 'NOT_STARTED', completed: false, topic: 'Architecture', courseName: c2 },
            { user: userId, title: `${c2} — Practice Exercise & Quiz`, dayLabel: 'Thu', dayOfWeek: 'Thu', durationMinutes: 45, taskType: 'QUIZ', status: 'NOT_STARTED', completed: false, topic: 'Assessment', courseName: c2 },
            { user: userId, title: `${c3} — Theory & Concept Drill`, dayLabel: 'Fri', dayOfWeek: 'Fri', durationMinutes: 60, taskType: 'LEARN', status: 'NOT_STARTED', completed: false, topic: 'Foundations', courseName: c3 },
            { user: userId, title: `${c4} — Problem Set & Applications`, dayLabel: 'Sat', dayOfWeek: 'Sat', durationMinutes: 90, taskType: 'PRACTICE', status: 'NOT_STARTED', completed: false, topic: 'Applications', courseName: c4 },
            { user: userId, title: `Weekly Retrospective & Milestone Review`, dayLabel: 'Sun', dayOfWeek: 'Sun', durationMinutes: 45, taskType: 'ASSESSMENT', status: 'NOT_STARTED', completed: false, topic: 'Weekly Review', courseName: c1 }
        ]);
    }

    // Milestones: starting at 0 with no fake achievement claims
    const existingMilestones = await StudentMilestone.find({ user: userId });
    if (existingMilestones.length === 0) {
        await StudentMilestone.insertMany([
            { user: userId, title: 'First Steps', description: 'Complete your first course or practice session.', current: 0, target: 1, completed: false, locked: false, icon: '🎓' },
            { user: userId, title: 'Problem Solver', description: 'Solve 100 coding problems.', current: 0, target: 100, completed: false, locked: false, icon: '📜' },
            { user: userId, title: 'Project Builder', description: 'Build 3 semester projects.', current: 0, target: 3, completed: false, locked: false, icon: '💻' },
            { user: userId, title: 'DSA Master', description: 'Solve 200 DSA problems.', current: 0, target: 200, completed: false, locked: false, icon: '🧠' },
            { user: userId, title: 'Placement Ready', description: 'Complete all required semester requirements.', current: 0, target: 100, completed: false, locked: true, icon: '🔒' }
        ]);
    }

    // Deadlines: clean upcoming milestones for current semester courses
    const existingDeadlines = await StudentDeadline.find({ user: userId });
    if (existingDeadlines.length === 0) {
        const curCourses = SEMESTER_BLUEPRINT[userSem]?.courses || SEMESTER_BLUEPRINT[1].courses;
        const mainCourse = curCourses[0]?.name || 'Core Engineering';
        const secondCourse = curCourses[1]?.name || 'Practical Lab';

        await StudentDeadline.insertMany([
            { user: userId, title: `${mainCourse} Midterm Exam`, date: 'May 20, 2026', category: 'Academic', urgency: 'Due this month' },
            { user: userId, title: `${mainCourse} Practical Assignment 1`, date: 'May 28, 2026', category: 'Academic', urgency: 'Upcoming' },
            { user: userId, title: `${secondCourse} Milestone Submission`, date: 'Jun 15, 2026', category: 'Projects', urgency: 'Upcoming' },
            { user: userId, title: `Semester ${userSem} Comprehensive Assessment`, date: 'Jun 30, 2026', category: 'Career', urgency: 'Upcoming' }
        ]);
    }

    // AI Recommendations
    const existingRecs = await AIRecommendation.find({ user: userId });
    if (existingRecs.length === 0) {
        const curCourses = SEMESTER_BLUEPRINT[userSem]?.courses || SEMESTER_BLUEPRINT[1].courses;
        const focusCourse = curCourses[0]?.name || 'Programming';
        await AIRecommendation.insertMany([
            {
                user: userId,
                recType: 'focus',
                badgeLabel: 'Focus recommendation',
                title: `Focus on ${focusCourse}`,
                description: `Build consistency on ${focusCourse} concepts with daily 45-minute practice intervals.`,
                actionText: 'Practice Now →',
                actionLink: '/planner?tab=week',
                tag: focusCourse
            },
            {
                user: userId,
                recType: 'weak_area',
                badgeLabel: 'Diagnostic recommendation',
                title: 'Structured Problem Solving',
                description: 'Solve interactive coding challenges to build logical confidence and speed.',
                actionText: 'Start Learning →',
                actionLink: '/codespirit',
                tag: 'Practice'
            },
            {
                user: userId,
                recType: 'project',
                badgeLabel: 'Project recommendation',
                title: 'Semester Project Kickoff',
                description: `Plan and build a practical application relevant to Semester ${userSem}.`,
                actionText: 'Explore →',
                actionLink: '/project-lab',
                tag: 'Project'
            }
        ]);
    }
};

// ═══════════════════════════════════════════════════════════════════
// GET FULL PLANNER STATE (Real MongoDB Connected)
// ═══════════════════════════════════════════════════════════════════
exports.getFullPlannerState = async (req, res) => {
    try {
        const userId = await getUserId(req);

        // Seed or sync data if needed
        await seedDefaultData(userId);

        const u = await User.findById(userId).catch(() => null);
        const userSemFromDB = Math.max(1, Math.min(8, Number(u?.semester || u?.currentSemester || 1)));

        let profile = await StudentProfile.findOne({ user: userId });
        if (!profile) {
            profile = {
                displayName: u?.name || 'Student',
                level: u?.stats?.level || 1,
                xp: u?.stats?.xp || 0,
                xpToNextLevel: 1000,
                currentSemester: userSemFromDB,
                batch: `${u?.course || 'CSE'} — ${(new Date().getFullYear())} Batch`,
                department: u?.course || 'Computer Science & Engineering',
                targetRole: u?.studyGoal ? `${u.studyGoal} Specialist` : 'Software Engineer',
                targetDate: 'June 2027',
                currentFocus: getDefaultFocusForSem(userSemFromDB),
                careerSteps: [
                    { step: 1, title: 'Master Core Programming & Problem Solving', completed: userSemFromDB > 1 },
                    { step: 2, title: 'Core Computer Science & Data Structures', completed: userSemFromDB > 2 },
                    { step: 3, title: 'Frameworks, Database Systems & APIs', completed: userSemFromDB > 4 },
                    { step: 4, title: 'Real-World Production Projects & Architecture', completed: userSemFromDB > 6 },
                    { step: 5, title: 'Placement Preparation, System Design & Mock Interviews', completed: userSemFromDB >= 8 }
                ]
            };
        }

        const currSemNum = profile.currentSemester || userSemFromDB || 1;

        const allCourses = await AcademicCourse.find({ user: userId }).sort({ semesterNumber: 1 });
        const allSkills = await StudentSkill.find({ user: userId }).sort({ semesterNumber: 1 });
        const allProjects = await StudentProject.find({ user: userId }).sort({ semesterNumber: 1 });
        const tasks = await LearningTask.find({ user: userId }).sort({ createdAt: 1 });
        const milestones = await StudentMilestone.find({ user: userId });
        const deadlines = await StudentDeadline.find({ user: userId }).sort({ createdAt: 1 });
        const recommendations = await AIRecommendation.find({ user: userId });

        // Organize into 8 semesters map
        const semesterData = {};
        for (let sem = 1; sem <= 8; sem++) {
            const semCourses = allCourses.filter(c => c.semesterNumber === sem);
            const semSkills = allSkills.filter(sk => sk.semesterNumber === sem);
            const semProjects = allProjects.filter(p => p.semesterNumber === sem);

            const isPriorSem = sem < currSemNum;
            semesterData[sem] = {
                courses: semCourses.length > 0 ? semCourses : (SEMESTER_BLUEPRINT[sem]?.courses || []).map(c => ({ ...c, mastery: isPriorSem ? 100 : 0 })),
                skills: semSkills.length > 0 ? semSkills : (SEMESTER_BLUEPRINT[sem]?.skills || []).map(s => ({ ...s, mastery: isPriorSem ? 100 : 0, status: isPriorSem ? 'Completed' : sem === currSemNum ? 'In Progress' : 'Locked' })),
                projects: semProjects.length > 0 ? semProjects : (SEMESTER_BLUEPRINT[sem]?.projects || []).map(p => ({ ...p, progress: isPriorSem ? 100 : 0, status: isPriorSem ? 'Completed' : 'Not Started' }))
            };
        }

        // Calculate dynamic weekly completion rate from real tasks
        const totalPlannedMinutes = tasks.reduce((sum, t) => sum + (t.durationMinutes || 60), 0);
        const completedTasks = tasks.filter(t => t.completed || t.status === 'COMPLETED' || t.status === 'MASTERED');
        const completedMinutes = completedTasks.reduce((sum, t) => sum + (t.durationMinutes || 60), 0);
        const completionRate = totalPlannedMinutes > 0 ? Math.round((completedMinutes / totalPlannedMinutes) * 100) : 0;

        // Dynamic AI Status message
        let aiAdvice = `Keep going! You're ${completionRate}% towards completing this week's plan.`;
        if (tasks.length === 0) {
            aiAdvice = `Let's build your weekly schedule using AI Plan Builder.`;
        } else if (completedTasks.length === 0) {
            aiAdvice = `Welcome to Semester ${currSemNum}! Start your first scheduled task to begin earning XP.`;
        } else if (completionRate < 40) {
            aiAdvice = `You're making progress! Complete scheduled study blocks to stay on track.`;
        } else if (completionRate >= 90 && completionRate < 100) {
            aiAdvice = `Excellent! You're almost finished with this week's schedule.`;
        } else if (completionRate === 100) {
            aiAdvice = `Amazing! All scheduled tasks for this week are completed! 🚀`;
        }

        // Weighted Overall Progress calculation from actual courses and tasks
        const currentSemCourses = semesterData[currSemNum]?.courses || [];
        const currentSemSkills = semesterData[currSemNum]?.skills || [];
        const courseAvg = currentSemCourses.length > 0 ? Math.round(currentSemCourses.reduce((s, c) => s + (c.mastery || 0), 0) / currentSemCourses.length) : 0;
        const skillAvg = currentSemSkills.length > 0 ? Math.round(currentSemSkills.reduce((s, sk) => s + (sk.mastery || 0), 0) / currentSemSkills.length) : 0;
        const priorSemesterProgress = currSemNum > 1 ? Math.round(((currSemNum - 1) / 8) * 100) : 0;
        const currentSemProgress = Math.round((courseAvg * 0.5) + (skillAvg * 0.3) + (completionRate * 0.2));
        const weightedOverall = Math.min(100, Math.round(priorSemesterProgress + (currentSemProgress * (1 / 8))));

        // 8 Semesters nodes reflecting user's real semester
        const semesters = [1, 2, 3, 4, 5, 6, 7, 8].map(num => ({
            number: num,
            label: `Semester ${num}`,
            status: num < currSemNum ? 'completed' : num === currSemNum ? 'current' : 'upcoming'
        }));

        res.status(200).json({
            success: true,
            data: {
                profile,
                semesters,
                semesterData,
                tasks,
                milestones,
                deadlines,
                recommendations,
                stats: {
                    overallProgressPercent: weightedOverall,
                    percentileRank: 50,
                    weeklyHoursSpent: `${Math.floor(completedMinutes / 60)}h ${completedMinutes % 60}m`,
                    weeklyHoursTarget: `${Math.floor(totalPlannedMinutes / 60)}h ${totalPlannedMinutes % 60}m`,
                    weeklyHoursDiff: '+0h vs last week',
                    completionRate,
                    upcomingDeadlinesCount: deadlines.length,
                    aiStatusMessage: aiAdvice
                }
            }
        });
    } catch (error) {
        console.error('Get full planner state error:', error);
        res.status(500).json({ success: false, message: 'Failed to load planner state', error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
// TASK LIFECYCLE STATUS UPDATE (Real DB Sync)
// ═══════════════════════════════════════════════════════════════════
exports.updateTaskLifecycle = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, score } = req.body;

        const task = await LearningTask.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        task.status = status;
        task.completed = (status === 'COMPLETED' || status === 'ASSESSED' || status === 'MASTERED');
        if (score !== undefined) task.score = score;
        await task.save();

        // Increment course mastery dynamically
        if (task.completed && task.courseName) {
            const course = await AcademicCourse.findOne({ user: task.user, name: task.courseName });
            if (course) {
                course.mastery = Math.min(100, course.mastery + 4);
                await course.save();
            }
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update task status', error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
// GET TASKS
// ═══════════════════════════════════════════════════════════════════
exports.getTasks = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const tasks = await LearningTask.find({ user: userId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, count: tasks.length, tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
// CREATE TASK (Real DB Insert)
// ═══════════════════════════════════════════════════════════════════
exports.createTask = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const taskData = { ...req.body, user: userId };
        const task = await LearningTask.create(taskData);

        await Task.create({
            user: userId,
            title: task.title,
            priority: 'medium',
            estimatedTime: task.durationMinutes,
            status: 'pending'
        }).catch(() => {});

        res.status(201).json({ success: true, task });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ success: false, message: 'Failed to create task', error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
// DELETE TASK
// ═══════════════════════════════════════════════════════════════════
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await LearningTask.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete task', error: error.message });
    }
};

// Helper to generate 7-day structured study tasks if AI fails or returns empty
const getRoleWeeklyTasks = (roleTitle, focusArea, dailyHours) => {
    const hours = Math.max(1, Math.min(8, Number(dailyHours) || 3));
    const slot1 = Math.min(90, hours * 20 + 30);
    const slot2 = Math.min(120, hours * 25 + 15);
    const shortSlot = Math.min(60, hours * 12 + 15);

    const ROLE_PLANS = {
        'dsa': [
            { title: 'Arrays & Hashing — Two Sum, Contains Duplicate, Group Anagrams', topic: 'Arrays & Hashing', dayLabel: 'Mon', taskType: 'LEARN', durationMinutes: slot1, courseName: 'Data Structures' },
            { title: 'Linked Lists — Reverse, Merge Two Sorted, Detect Cycle (Floyd)', topic: 'Linked Lists', dayLabel: 'Tue', taskType: 'PRACTICE', durationMinutes: slot2, courseName: 'Data Structures' },
            { title: 'Stacks & Queues — Valid Parentheses, Min Stack, Sliding Window Max', topic: 'Stacks & Queues', dayLabel: 'Wed', taskType: 'LEARN', durationMinutes: slot1, courseName: 'Data Structures' },
            { title: 'Binary Trees — Inorder/Preorder Traversal, Max Depth, Level Order', topic: 'Binary Trees', dayLabel: 'Thu', taskType: 'PRACTICE', durationMinutes: slot2, courseName: 'Data Structures' },
            { title: 'Sorting Algorithms — Quick Sort, Merge Sort, Counting Sort Analysis', topic: 'Sorting', dayLabel: 'Fri', taskType: 'LEARN', durationMinutes: slot1, courseName: 'Algorithms' },
            { title: 'Binary Search — Search Rotated Array, Find Minimum, Koko Bananas', topic: 'Binary Search', dayLabel: 'Sat', taskType: 'PRACTICE', durationMinutes: slot2, courseName: 'Algorithms' },
            { title: 'Weekly Assessment — Solve 5 Mixed Problems (Timed 90 min)', topic: 'Mixed Review', dayLabel: 'Sun', taskType: 'ASSESSMENT', durationMinutes: shortSlot, courseName: 'Problem Solving' }
        ],
        'web': [
            { title: 'HTML5 Semantic Layout — Header, Nav, Main, Footer Structure', topic: 'HTML5 Semantics', dayLabel: 'Mon', taskType: 'LEARN', durationMinutes: slot1, courseName: 'Frontend Development' },
            { title: 'CSS Flexbox & Grid — Build Responsive Dashboard Layout', topic: 'CSS Layout Systems', dayLabel: 'Tue', taskType: 'PRACTICE', durationMinutes: slot2, courseName: 'Frontend Development' },
            { title: 'JavaScript ES6+ — Arrow Functions, Destructuring, Promises, Async/Await', topic: 'Modern JavaScript', dayLabel: 'Wed', taskType: 'LEARN', durationMinutes: slot1, courseName: 'JavaScript' },
            { title: 'React Fundamentals — Components, Props, State, useEffect Hook', topic: 'React.js Core', dayLabel: 'Thu', taskType: 'PRACTICE', durationMinutes: slot2, courseName: 'React.js' },
            { title: 'Node.js & Express — REST API Routes, Middleware, Error Handling', topic: 'Backend with Node.js', dayLabel: 'Fri', taskType: 'PROJECT', durationMinutes: slot2, courseName: 'Backend Development' },
            { title: 'MongoDB CRUD — Schema Design, Mongoose Models, Aggregation Pipeline', topic: 'Database (MongoDB)', dayLabel: 'Sat', taskType: 'PRACTICE', durationMinutes: slot1, courseName: 'Database Systems' },
            { title: 'Weekly Review — Deploy Mini-Project to Vercel/Render + Code Review', topic: 'Deployment & Review', dayLabel: 'Sun', taskType: 'ASSESSMENT', durationMinutes: shortSlot, courseName: 'DevOps Basics' }
        ],
        'ai': [
            { title: 'Python for Data Science — NumPy Arrays, Pandas DataFrames, Matplotlib', topic: 'Python & Libraries', dayLabel: 'Mon', taskType: 'LEARN', durationMinutes: slot1, courseName: 'Python for ML' },
            { title: 'Linear Algebra Essentials — Vectors, Matrices, Eigenvalues for ML', topic: 'Math Foundations', dayLabel: 'Tue', taskType: 'LEARN', durationMinutes: slot1, courseName: 'Mathematics' },
            { title: 'Supervised Learning — Linear Regression, Logistic Regression, Evaluation Metrics', topic: 'Supervised ML', dayLabel: 'Wed', taskType: 'PRACTICE', durationMinutes: slot2, courseName: 'Machine Learning' },
            { title: 'Decision Trees & Random Forests — Entropy, Gini, Feature Importance', topic: 'Tree-Based Models', dayLabel: 'Thu', taskType: 'LEARN', durationMinutes: slot1, courseName: 'Machine Learning' },
            { title: 'Neural Networks — Perceptron, Backpropagation, Activation Functions', topic: 'Deep Learning Intro', dayLabel: 'Fri', taskType: 'PRACTICE', durationMinutes: slot2, courseName: 'Deep Learning' },
            { title: 'Hands-on Kaggle Project — EDA, Feature Engineering, Model Training', topic: 'Applied ML Project', dayLabel: 'Sat', taskType: 'PROJECT', durationMinutes: slot2, courseName: 'Applied AI' },
            { title: 'Weekly Quiz — ML Concepts, Hyperparameter Tuning, Model Comparison', topic: 'Review & Assessment', dayLabel: 'Sun', taskType: 'ASSESSMENT', durationMinutes: shortSlot, courseName: 'ML Review' }
        ],
        'default': [
            { title: `${focusArea || roleTitle} — Chapter 1: Core Concepts & Terminology`, topic: 'Fundamentals', dayLabel: 'Mon', taskType: 'LEARN', durationMinutes: slot1, courseName: focusArea || 'Core Foundations' },
            { title: `${focusArea || roleTitle} — Chapter 2: Hands-on Practice Problems`, topic: 'Practice Set 1', dayLabel: 'Tue', taskType: 'PRACTICE', durationMinutes: slot2, courseName: 'Problem Solving' },
            { title: `${focusArea || roleTitle} — Chapter 3: Intermediate Techniques & Patterns`, topic: 'Intermediate Topics', dayLabel: 'Wed', taskType: 'LEARN', durationMinutes: slot1, courseName: focusArea || 'Advanced Concepts' },
            { title: `${focusArea || roleTitle} — Chapter 4: Implementation & Coding Lab`, topic: 'Coding Lab', dayLabel: 'Thu', taskType: 'PRACTICE', durationMinutes: slot2, courseName: 'Implementation' },
            { title: `${focusArea || roleTitle} — Chapter 5: Build a Mini-Project`, topic: 'Project Work', dayLabel: 'Fri', taskType: 'PROJECT', durationMinutes: slot2, courseName: 'Portfolio Project' },
            { title: `${focusArea || roleTitle} — Chapter 6: Advanced Patterns & Optimization`, topic: 'Advanced Topics', dayLabel: 'Sat', taskType: 'PRACTICE', durationMinutes: slot1, courseName: 'Advanced Practice' },
            { title: 'Weekly Assessment — Concept Review, Quiz & Sprint Planning', topic: 'Review & Planning', dayLabel: 'Sun', taskType: 'ASSESSMENT', durationMinutes: shortSlot, courseName: 'Weekly Review' }
        ]
    };

    const lower = `${roleTitle} ${focusArea}`.toLowerCase();
    let key = 'default';
    if (/dsa|algorithm|data\s*structure|competitive|problem\s*solving/i.test(lower)) key = 'dsa';
    else if (/web|fullstack|full\s*stack|frontend|backend|mern|react|node|html|css/i.test(lower)) key = 'web';
    else if (/ai|ml|machine\s*learn|deep\s*learn|data\s*science|nlp|neural/i.test(lower)) key = 'ai';

    return ROLE_PLANS[key];
};

// ═══════════════════════════════════════════════════════════════════
// AI PLAN BUILDER (Powered by Groq AI API Key with multi-key failover)
// ═══════════════════════════════════════════════════════════════════
exports.buildAIPlan = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const { targetRole, hoursPerDay, preferredFocus } = req.body;

        const roleTitle = targetRole || 'Full Stack Developer';
        const dailyHours = hoursPerDay || 4;
        const focusArea = preferredFocus || 'Data Structures & Web Development';

        let generatedSteps = [];
        let generatedTasks = [];

        try {
            const { callGroqChat } = require('../services/groqClient');
            const prompt = `You are an expert CS study planner creating a DETAILED weekly study plan for a student who wants to become a "${roleTitle}" with ${dailyHours} hours/day study time, focusing on "${focusArea}".

Return a STRICT JSON object (no markdown, no backticks, only valid JSON) in this exact schema:
{
  "careerSteps": [
    { "step": 1, "title": "Week 1-2: Specific topic with chapter names" },
    { "step": 2, "title": "Week 3-4: Next progression topic" },
    { "step": 3, "title": "Week 5-6: Intermediate topic" },
    { "step": 4, "title": "Week 7-8: Advanced topic & projects" },
    { "step": 5, "title": "Week 9-10: Real-world projects & interview prep" }
  ],
  "weeklyTasks": [
    { "title": "Chapter: Arrays & Hashing — Two Sum, Contains Duplicate, Group Anagrams", "topic": "Arrays & Hashing", "dayLabel": "Mon", "taskType": "LEARN", "durationMinutes": 60, "courseName": "Data Structures" },
    { "title": "Practice: Solve 5 Array Problems — Sliding Window & Two Pointers", "topic": "Array Techniques", "dayLabel": "Tue", "taskType": "PRACTICE", "durationMinutes": 90, "courseName": "Problem Solving" },
    { "title": "Chapter: Linked Lists — Singly, Doubly, Reverse, Merge Sorted", "topic": "Linked Lists", "dayLabel": "Wed", "taskType": "LEARN", "durationMinutes": 60, "courseName": "Data Structures" },
    { "title": "Lab: Build REST API with Express.js — CRUD Routes & Middleware", "topic": "Backend Development", "dayLabel": "Thu", "taskType": "PROJECT", "durationMinutes": 90, "courseName": "Node.js & Express" },
    { "title": "Chapter: React Components — Props, State, useEffect, Event Handling", "topic": "React.js Core", "dayLabel": "Fri", "taskType": "LEARN", "durationMinutes": 75, "courseName": "React.js" },
    { "title": "Practice: Build a Todo App with React + Local Storage", "topic": "React Project", "dayLabel": "Sat", "taskType": "PRACTICE", "durationMinutes": 90, "courseName": "React.js" },
    { "title": "Quiz: Weekly Review — 20 MCQs on This Week's Topics + Retrospective", "topic": "Weekly Review", "dayLabel": "Sun", "taskType": "ASSESSMENT", "durationMinutes": 45, "courseName": "Review" }
  ]
}

RULES:
- Each task title MUST include a specific chapter name or specific subtopics (e.g. "Chapter: Binary Trees — BFS, DFS, Level Order Traversal" NOT "Learn data structures").
- Each task MUST have a "topic" field with the specific subtopic name.
- Use REAL chapter/topic names relevant to "${focusArea}" and "${roleTitle}".
- courseName should be a real subject name (e.g. "Data Structures", "React.js", "Machine Learning", "Database Systems").
- durationMinutes should total roughly ${dailyHours * 60} minutes across all 7 days (avg ${dailyHours * 60 / 7 | 0} min/day).
- Generate exactly 7 tasks (Mon to Sun), each with unique actionable content.
- taskType must be one of: LEARN, PRACTICE, QUIZ, ASSESSMENT, PROJECT.`;

            const aiRes = await callGroqChat([
                { role: 'system', content: 'You are an expert AI study planner who generates detailed, chapter-level study schedules. Output ONLY valid JSON with no extra text.' },
                { role: 'user', content: prompt }
            ], {
                temperature: 0.5,
                max_tokens: 3000,
                timeoutMs: 25000
            });

            if (aiRes.success && aiRes.content) {
                let raw = aiRes.content.trim();
                if (raw.startsWith('```')) {
                    raw = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
                }
                const parsed = JSON.parse(raw);
                if (parsed.careerSteps && Array.isArray(parsed.careerSteps)) {
                    generatedSteps = parsed.careerSteps;
                }
                if (parsed.weeklyTasks && Array.isArray(parsed.weeklyTasks)) {
                    generatedTasks = parsed.weeklyTasks.map(t => ({
                        ...t,
                        topic: t.topic || t.courseName || '',
                        title: t.title || `${t.topic || t.courseName || 'Study'} — ${t.taskType || 'LEARN'}`
                    }));
                }
            }
        } catch (aiErr) {
            console.warn('Groq AI Plan call fallback:', aiErr.message);
        }

        // Fallback default roadmap if AI was unavailable
        if (generatedSteps.length === 0) {
            const lower = `${roleTitle} ${focusArea}`.toLowerCase();
            if (/dsa|algorithm|data\s*struct|competitive|problem/i.test(lower)) {
                generatedSteps = [
                    { step: 1, title: 'Week 1-2: Arrays, Strings & Hashing — Two Pointers, Sliding Window' },
                    { step: 2, title: 'Week 3-4: Linked Lists, Stacks, Queues & Binary Trees (BFS/DFS)' },
                    { step: 3, title: 'Week 5-6: Graphs — Adjacency List, Dijkstra, Topological Sort' },
                    { step: 4, title: 'Week 7-8: Dynamic Programming — Knapsack, LCS, Coin Change, Grid DP' },
                    { step: 5, title: 'Week 9-10: Mock Interviews — System Design + 50 Must-Solve Problems' }
                ];
            } else if (/web|fullstack|full\s*stack|frontend|backend|mern|react|node/i.test(lower)) {
                generatedSteps = [
                    { step: 1, title: 'Week 1-2: HTML5 Semantics, CSS Grid/Flexbox & Responsive Design' },
                    { step: 2, title: 'Week 3-4: JavaScript ES6+, DOM, Async/Await & Fetch API' },
                    { step: 3, title: 'Week 5-6: React.js — Components, Hooks, Routing & State Management' },
                    { step: 4, title: 'Week 7-8: Node.js, Express REST APIs, MongoDB & Authentication' },
                    { step: 5, title: 'Week 9-10: Full-Stack Project — Deploy MERN App to Production' }
                ];
            } else if (/ai|ml|machine\s*learn|deep\s*learn|data\s*science/i.test(lower)) {
                generatedSteps = [
                    { step: 1, title: 'Week 1-2: Python, NumPy, Pandas & Data Visualization (Matplotlib)' },
                    { step: 2, title: 'Week 3-4: Supervised Learning — Linear/Logistic Regression, SVM, KNN' },
                    { step: 3, title: 'Week 5-6: Decision Trees, Random Forests, Ensemble Methods & XGBoost' },
                    { step: 4, title: 'Week 7-8: Neural Networks, CNNs, Transfer Learning (TensorFlow/PyTorch)' },
                    { step: 5, title: 'Week 9-10: End-to-End ML Project — EDA to Deployment on Kaggle' }
                ];
            } else {
                generatedSteps = [
                    { step: 1, title: `Week 1-2: ${focusArea || roleTitle} — Core Concepts & Fundamentals` },
                    { step: 2, title: `Week 3-4: Intermediate ${focusArea || roleTitle} — Patterns & Best Practices` },
                    { step: 3, title: `Week 5-6: Advanced ${focusArea || roleTitle} — Real-World Techniques` },
                    { step: 4, title: `Week 7-8: Build a Production Portfolio Project with ${focusArea || roleTitle}` },
                    { step: 5, title: 'Week 9-10: Interview Preparation, System Design & Mock Interviews' }
                ];
            }
        }

        // Fallback default weekly tasks if AI was unavailable or empty
        if (generatedTasks.length === 0) {
            generatedTasks = getRoleWeeklyTasks(roleTitle, focusArea, dailyHours);
        }

        // Save new career goal and steps to StudentProfile in DB
        let profile = await StudentProfile.findOne({ user: userId });
        if (!profile) {
            profile = new StudentProfile({ user: userId });
        }
        profile.targetRole = roleTitle;
        profile.careerSteps = generatedSteps.map((s, idx) => ({
            step: s.step || idx + 1,
            title: s.title,
            completed: idx === 0
        }));
        await profile.save();

        // Clear previous non-completed tasks for a fresh plan
        await LearningTask.deleteMany({ user: userId, status: { $ne: 'COMPLETED' } }).catch(() => {});

        // Insert fresh weekly tasks into DB
        const newTasksToInsert = generatedTasks.map(t => ({
            user: userId,
            title: t.title,
            dayLabel: t.dayLabel || 'Mon',
            dayOfWeek: t.dayLabel || 'Mon',
            durationMinutes: t.durationMinutes || 60,
            taskType: t.taskType || 'LEARN',
            courseName: t.courseName || 'General',
            topic: t.topic || '',
            status: 'NOT_STARTED',
            completed: false
        }));
        const insertedTasks = await LearningTask.insertMany(newTasksToInsert);

        res.status(200).json({
            success: true,
            message: `Personalized study plan created for ${roleTitle}!`,
            targetRole: roleTitle,
            careerSteps: profile.careerSteps,
            generatedTasksCount: insertedTasks.length,
            tasks: insertedTasks
        });
    } catch (error) {
        console.error('AI plan builder error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate AI plan', error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
// DEADLINES MANAGEMENT
// ═══════════════════════════════════════════════════════════════════
exports.createDeadline = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const deadline = await StudentDeadline.create({ ...req.body, user: userId });
        res.status(201).json({ success: true, deadline });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create deadline', error: error.message });
    }
};

exports.deleteDeadline = async (req, res) => {
    try {
        await StudentDeadline.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Deadline deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete deadline' });
    }
};

// ═══════════════════════════════════════════════════════════════════
// GOALS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════
exports.getGoals = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const goals = await Goal.find({ user: userId });
        res.status(200).json({ success: true, goals });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch goals' });
    }
};

exports.createGoal = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const goal = await Goal.create({ ...req.body, user: userId });
        
        // Also update student profile targetRole/targetDate
        if (req.body.title || req.body.role) {
            await StudentProfile.findOneAndUpdate(
                { user: userId },
                {
                    $set: {
                        targetRole: req.body.role || req.body.title,
                        targetDate: req.body.targetDate || 'June 2027'
                    }
                },
                { upsert: true }
            );
        }

        res.status(201).json({ success: true, goal });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create goal' });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, goal });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update goal' });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        await Goal.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Goal deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete goal' });
    }
};

exports.getPlannerOverview = async (req, res) => {
    return exports.getFullPlannerState(req, res);
};
