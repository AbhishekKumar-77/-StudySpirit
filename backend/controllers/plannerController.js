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

// ═══════════════════════════════════════════════════════════════════
// SEED DEFAULT DATA (Ensures all 8 semesters exist for the user)
// ═══════════════════════════════════════════════════════════════════
const seedDefaultData = async (userId) => {
    let profile = await StudentProfile.findOne({ user: userId });
    if (!profile) {
        const u = await User.findById(userId).catch(() => null);
        profile = await StudentProfile.create({
            user: userId,
            displayName: u?.name || u?.username || 'sasa',
            level: 3,
            xp: 4630,
            xpToNextLevel: 6000,
            currentSemester: 2,
            batch: 'CSE — 2026 Batch',
            department: 'Computer Science & Engineering',
            startDate: 'Feb 2026',
            endDate: 'Jun 2026',
            targetRole: 'Software Engineer',
            targetDate: 'June 2027',
            overallProgressPercent: 68,
            percentileRank: 65,
            weeklyHoursSpent: '6h 20m',
            weeklyHoursTarget: '7h 15m',
            weeklyHoursDiff: '+1h 30m vs last week',
            currentFocus: {
                course: 'Data Structures',
                topic: 'Linked List',
                masteryPercent: 66
            },
            careerSteps: [
                { step: 1, title: 'Master Core Programming (Python, C++)', completed: true },
                { step: 2, title: 'Build DSA & Problem Solving Skills', completed: false },
                { step: 3, title: 'Learn Web Development & Databases', completed: false },
                { step: 4, title: 'Build Real-World Projects & Portfolio', completed: false },
                { step: 5, title: 'Prepare for Placements & Internships', completed: false }
            ]
        });
    }

    // Courses for all 8 semesters (check per semester)
    for (const [semNum, data] of Object.entries(SEMESTER_BLUEPRINT)) {
        const num = Number(semNum);
        const semCourses = await AcademicCourse.find({ user: userId, semesterNumber: num });
        if (semCourses.length === 0) {
            const coursesToInsert = data.courses.map(c => ({
                user: userId,
                semesterNumber: num,
                name: c.name,
                code: c.code,
                mastery: c.mastery,
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
                mastery: sk.mastery,
                status: sk.status,
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
                status: p.status,
                progress: p.progress,
                dueDate: p.dueDate,
                relatedSkills: p.relatedSkills
            }));
            await StudentProject.insertMany(projectsToInsert);
        }
    }

    // Weekly Tasks
    const existingTasks = await LearningTask.find({ user: userId });
    if (existingTasks.length === 0) {
        await LearningTask.insertMany([
            { user: userId, title: 'Arrays & Linked List — Concepts', dayLabel: 'Mon 12', dayOfWeek: 'Mon', durationMinutes: 60, taskType: 'LEARN', status: 'COMPLETED', completed: true, topic: 'Linked List', courseName: 'Data Structures' },
            { user: userId, title: 'Linked List — Practice Problems', dayLabel: 'Tue 13', dayOfWeek: 'Tue', durationMinutes: 90, taskType: 'PRACTICE', status: 'COMPLETED', completed: true, topic: 'Linked List', courseName: 'Data Structures' },
            { user: userId, title: 'Linked List — Quiz', dayLabel: 'Wed 14', dayOfWeek: 'Wed', durationMinutes: 30, taskType: 'QUIZ', status: 'COMPLETED', completed: true, score: 92, topic: 'Linked List', courseName: 'Data Structures' },
            { user: userId, title: 'Stack — Concepts', dayLabel: 'Thu 15', dayOfWeek: 'Thu', durationMinutes: 60, taskType: 'LEARN', status: 'NOT_STARTED', completed: false, topic: 'Stack', courseName: 'Data Structures' },
            { user: userId, title: 'Stack — Practice Problems', dayLabel: 'Fri 16', dayOfWeek: 'Fri', durationMinutes: 90, taskType: 'PRACTICE', status: 'NOT_STARTED', completed: false, topic: 'Stack', courseName: 'Data Structures' },
            { user: userId, title: 'Mini Assessment', dayLabel: 'Sat 17', dayOfWeek: 'Sat', durationMinutes: 45, taskType: 'ASSESSMENT', status: 'NOT_STARTED', completed: false, topic: 'Data Structures', courseName: 'Data Structures' },
            { user: userId, title: 'Project Work — Library Management', dayLabel: 'Sun 18', dayOfWeek: 'Sun', durationMinutes: 120, taskType: 'PROJECT', status: 'NOT_STARTED', completed: false, topic: 'OOP Project', courseName: 'OOP' }
        ]);
    }

    // Milestones
    const existingMilestones = await StudentMilestone.find({ user: userId });
    if (existingMilestones.length === 0) {
        await StudentMilestone.insertMany([
            { user: userId, title: 'First Steps', description: 'Complete your first course.', current: 1, target: 1, completed: true, locked: false, icon: '🎓' },
            { user: userId, title: 'Problem Solver', description: 'Solve 100 problems.', current: 72, target: 100, completed: false, locked: false, icon: '📜' },
            { user: userId, title: 'Project Builder', description: 'Build 3 projects.', current: 1, target: 3, completed: false, locked: false, icon: '💻' },
            { user: userId, title: 'DSA Master', description: 'Solve 200 DSA problems.', current: 72, target: 200, completed: false, locked: false, icon: '🧠' },
            { user: userId, title: 'Placement Ready', description: 'Complete all required requirements.', current: 0, target: 100, completed: false, locked: true, icon: '🔒' }
        ]);
    }

    // Deadlines
    const existingDeadlines = await StudentDeadline.find({ user: userId });
    if (existingDeadlines.length === 0) {
        await StudentDeadline.insertMany([
            { user: userId, title: 'DBMS Midterm Exam', date: 'May 20, 2026', category: 'Academic', urgency: 'Due this week' },
            { user: userId, title: 'DSA Assignment 3', date: 'May 25, 2026', category: 'Academic', urgency: 'Due next week' },
            { user: userId, title: 'Library Management Project', date: 'May 30, 2026', category: 'Projects', urgency: 'Due this month' },
            { user: userId, title: 'Summer Internship Application', date: 'Jun 10, 2026', category: 'Career', urgency: 'Upcoming' }
        ]);
    }

    // AI Recommendations
    const existingRecs = await AIRecommendation.find({ user: userId });
    if (existingRecs.length === 0) {
        await AIRecommendation.insertMany([
            {
                user: userId,
                recType: 'focus',
                badgeLabel: 'Focus recommendation',
                title: 'Focus on Data Structures',
                description: 'Your DSA accuracy is improving but needs more practice on linked lists and trees.',
                actionText: 'Practice Now →',
                actionLink: '/planner?tab=week',
                tag: 'DSA'
            },
            {
                user: userId,
                recType: 'weak_area',
                badgeLabel: 'Weak-area recommendation',
                title: 'Weak Area: Recursion',
                description: 'We recommend 3 interactive lessons and 5 practice problems to build confidence.',
                actionText: 'Start Learning →',
                actionLink: '/codespirit',
                tag: 'Recursion'
            },
            {
                user: userId,
                recType: 'project',
                badgeLabel: 'Project recommendation',
                title: 'Project Suggestion',
                description: 'Build a To-Do App using C++ and File Handling to solidify OOP concepts.',
                actionText: 'Explore →',
                actionLink: '/project-lab',
                tag: 'C++'
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

        // Seed data if this user has not been seeded yet
        await seedDefaultData(userId);

        const profile = (await StudentProfile.findOne({ user: userId })) || {
            displayName: req.user?.username || req.user?.name || 'Student',
            level: 3,
            xp: 4630,
            xpToNextLevel: 6000,
            currentSemester: 2,
            batch: 'CSE — 2026 Batch',
            department: 'Computer Science & Engineering',
            targetRole: 'Software Engineer',
            targetDate: 'June 2027',
            currentFocus: { course: 'Data Structures', topic: 'Linked List', masteryPercent: 66 },
            careerSteps: [
                { step: 1, title: 'Master Core Programming (Python, C++)', completed: true },
                { step: 2, title: 'Build DSA & Problem Solving Skills', completed: false },
                { step: 3, title: 'Learn Web Development & Databases', completed: false },
                { step: 4, title: 'Build Real-World Projects & Portfolio', completed: false },
                { step: 5, title: 'Prepare for Placements & Internships', completed: false }
            ]
        };

        const allCourses = await AcademicCourse.find({ user: userId }).sort({ semesterNumber: 1 });
        const allSkills = await StudentSkill.find({ user: userId }).sort({ semesterNumber: 1 });
        const allProjects = await StudentProject.find({ user: userId }).sort({ semesterNumber: 1 });
        const tasks = await LearningTask.find({ user: userId }).sort({ createdAt: 1 });
        const milestones = await StudentMilestone.find({ user: userId });
        const deadlines = await StudentDeadline.find({ user: userId }).sort({ createdAt: 1 });
        const recommendations = await AIRecommendation.find({ user: userId });

        // Organize into 8 semesters map (ensuring complete fallback to blueprint for any semester)
        const semesterData = {};
        for (let sem = 1; sem <= 8; sem++) {
            const semCourses = allCourses.filter(c => c.semesterNumber === sem);
            const semSkills = allSkills.filter(sk => sk.semesterNumber === sem);
            const semProjects = allProjects.filter(p => p.semesterNumber === sem);

            semesterData[sem] = {
                courses: semCourses.length > 0 ? semCourses : (SEMESTER_BLUEPRINT[sem]?.courses || []),
                skills: semSkills.length > 0 ? semSkills : (SEMESTER_BLUEPRINT[sem]?.skills || []),
                projects: semProjects.length > 0 ? semProjects : (SEMESTER_BLUEPRINT[sem]?.projects || [])
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
        } else if (completionRate < 40) {
            aiAdvice = `You are behind this week's plan. Let's adjust your schedule to stay on track.`;
        } else if (completionRate >= 90 && completionRate < 100) {
            aiAdvice = `Excellent! You're almost finished with this week's schedule.`;
        } else if (completionRate === 100) {
            aiAdvice = `Amazing! All scheduled tasks for this week are completed! 🚀`;
        }

        // Weighted Overall Progress calculation
        const currSemNum = profile.currentSemester || 2;
        const currentSemCourses = semesterData[currSemNum]?.courses || [];
        const currentSemSkills = semesterData[currSemNum]?.skills || [];
        const courseAvg = currentSemCourses.length > 0 ? Math.round(currentSemCourses.reduce((s, c) => s + c.mastery, 0) / currentSemCourses.length) : 50;
        const skillAvg = currentSemSkills.length > 0 ? Math.round(currentSemSkills.reduce((s, sk) => s + sk.mastery, 0) / currentSemSkills.length) : 50;
        const weightedOverall = Math.round((courseAvg * 0.5) + (skillAvg * 0.3) + (completionRate * 0.2));

        // 8 Semesters nodes
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
                    overallProgressPercent: weightedOverall || 68,
                    percentileRank: 65,
                    weeklyHoursSpent: `${Math.floor(completedMinutes / 60)}h ${completedMinutes % 60}m`,
                    weeklyHoursTarget: `${Math.floor(totalPlannedMinutes / 60)}h ${totalPlannedMinutes % 60}m`,
                    weeklyHoursDiff: '+1h 30m vs last week',
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

// ═══════════════════════════════════════════════════════════════════
// AI PLAN BUILDER (Powered by Groq AI API Key from .env)
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
        const GROQ_API_KEY = process.env.GROQ_API_KEY_PLANNER || process.env.GROQ_API_KEY;

        if (GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here') {
            try {
                const prompt = `As an AI Study Planner for a Computer Science student aiming to become a "${roleTitle}" with ${dailyHours} hours/day study time focusing on "${focusArea}":
Return a STRICT JSON object (no markdown, no backticks, only valid JSON) in this exact schema:
{
  "careerSteps": [
    { "step": 1, "title": "Step title description" },
    { "step": 2, "title": "Step title description" },
    { "step": 3, "title": "Step title description" },
    { "step": 4, "title": "Step title description" },
    { "step": 5, "title": "Step title description" }
  ],
  "weeklyTasks": [
    { "title": "Topic or practice name", "dayLabel": "Mon", "taskType": "LEARN", "durationMinutes": 60, "courseName": "Data Structures" },
    { "title": "Topic or practice name", "dayLabel": "Tue", "taskType": "PRACTICE", "durationMinutes": 90, "courseName": "Algorithms" },
    { "title": "Quiz / Review", "dayLabel": "Wed", "taskType": "QUIZ", "durationMinutes": 45, "courseName": "Web Development" },
    { "title": "Topic or practice name", "dayLabel": "Thu", "taskType": "LEARN", "durationMinutes": 60, "courseName": "Database" },
    { "title": "Project Coding", "dayLabel": "Fri", "taskType": "PROJECT", "durationMinutes": 120, "courseName": "Software Engineering" }
  ]
}`;

                const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            { role: 'system', content: 'You are an expert AI Career and Study Roadmap Architect. Always output strictly valid JSON.' },
                            { role: 'user', content: prompt }
                        ],
                        temperature: 0.4,
                        response_format: { type: "json_object" }
                    })
                });

                const groqData = await groqRes.json();
                const content = groqData.choices?.[0]?.message?.content;
                if (content) {
                    const parsed = JSON.parse(content);
                    if (parsed.careerSteps && Array.isArray(parsed.careerSteps)) {
                        generatedSteps = parsed.careerSteps;
                    }
                    if (parsed.weeklyTasks && Array.isArray(parsed.weeklyTasks)) {
                        generatedTasks = parsed.weeklyTasks;
                    }
                }
            } catch (aiErr) {
                console.warn('Groq AI Plan call fallback:', aiErr.message);
            }
        }

        // Fallback default roadmap if AI was unavailable
        if (generatedSteps.length === 0) {
            generatedSteps = [
                { step: 1, title: `Core Foundations for ${roleTitle}` },
                { step: 2, title: 'Data Structures, Algorithms & Problem Solving' },
                { step: 3, title: `Frameworks & Database Systems (${focusArea})` },
                { step: 4, title: 'Fullstack & Production Portfolio Projects' },
                { step: 5, title: 'Interview Preparation, System Design & Placements' }
            ];
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

        // If AI generated new weekly tasks, insert them into DB
        if (generatedTasks.length > 0) {
            const newTasksToInsert = generatedTasks.map(t => ({
                user: userId,
                title: t.title,
                dayLabel: t.dayLabel || 'Mon',
                dayOfWeek: t.dayLabel || 'Mon',
                durationMinutes: t.durationMinutes || 60,
                taskType: t.taskType || 'LEARN',
                courseName: t.courseName || 'Data Structures',
                status: 'NOT_STARTED',
                completed: false
            }));
            await LearningTask.insertMany(newTasksToInsert);
        }

        res.status(200).json({
            success: true,
            targetRole: roleTitle,
            careerSteps: profile.careerSteps,
            generatedTasksCount: generatedTasks.length
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
