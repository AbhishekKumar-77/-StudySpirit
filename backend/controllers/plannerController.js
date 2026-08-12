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

// Seed default state matching exact StudySpirit specification wireframe
const seedDefaultData = async (userId) => {
    // 1. Profile
    let profile = await StudentProfile.findOne({ user: userId });
    if (!profile) {
        profile = await StudentProfile.create({
            user: userId,
            displayName: 'sasa',
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
                { step: 1, title: 'Programming Fundamentals', completed: true },
                { step: 2, title: 'Data Structures & Algorithms', completed: true },
                { step: 3, title: 'Real-world Projects (C++ / Database)', completed: false },
                { step: 4, title: 'Git & Open Source Profile', completed: false },
                { step: 5, title: 'Resume & Portfolio Building', completed: false },
                { step: 6, title: 'Technical Interview Prep', completed: false },
                { step: 7, title: 'Campus Placement & Offers', completed: false }
            ]
        });
    }

    // 2. Academic Courses
    const existingCourses = await AcademicCourse.find({ user: userId });
    if (existingCourses.length === 0) {
        await AcademicCourse.insertMany([
            { user: userId, semesterNumber: 2, name: 'Data Structures', code: 'CS201', mastery: 72, color: '#10b981' },
            { user: userId, semesterNumber: 2, name: 'Object Oriented Programming', code: 'CS202', mastery: 65, color: '#8b5cf6' },
            { user: userId, semesterNumber: 2, name: 'Database Management Systems', code: 'CS203', mastery: 40, color: '#f59e0b' },
            { user: userId, semesterNumber: 2, name: 'Discrete Mathematics', code: 'CS204', mastery: 65, color: '#06b6d4' },
            { user: userId, semesterNumber: 2, name: 'Computer Organization', code: 'CS205', mastery: 30, color: '#ef4444' }
        ]);
    }

    // 3. Skills to Build & Path
    const existingSkills = await StudentSkill.find({ user: userId });
    if (existingSkills.length === 0) {
        await StudentSkill.insertMany([
            { user: userId, name: 'Programming Fundamentals', category: 'Core CS', mastery: 100, status: 'Completed', color: '#10b981' },
            { user: userId, name: 'Data Structures', category: 'Core CS', mastery: 68, status: 'In Progress', color: '#10b981' },
            { user: userId, name: 'Algorithms', category: 'Core CS', mastery: 30, status: 'Recommended Next', color: '#f59e0b', prerequisites: ['Data Structures'] },
            { user: userId, name: 'C++ Programming', category: 'Language', mastery: 70, status: 'In Progress', color: '#10b981' },
            { user: userId, name: 'Git & GitHub', category: 'Tools', mastery: 80, status: 'In Progress', color: '#8b5cf6' },
            { user: userId, name: 'Problem Solving', category: 'General', mastery: 60, status: 'In Progress', color: '#f59e0b' },
            { user: userId, name: 'Web Fundamentals', category: 'Web', mastery: 25, status: 'In Progress', color: '#06b6d4' },
            { user: userId, name: 'Database Systems', category: 'Core CS', mastery: 20, status: 'In Progress', color: '#ef4444' },
            { user: userId, name: 'Software Engineering', category: 'Core CS', mastery: 0, status: 'Locked', color: '#94a3b8' }
        ]);
    }

    // 4. Student Projects
    const existingProjects = await StudentProject.find({ user: userId });
    if (existingProjects.length === 0) {
        await StudentProject.insertMany([
            {
                user: userId,
                name: 'Library Management System',
                description: 'Full-fledged C++ console app using OOP and file handling.',
                status: 'In Progress',
                progress: 45,
                dueDate: 'May 30, 2026',
                relatedSkills: ['C++', 'OOP', 'Database', 'Git', 'Problem Solving']
            }
        ]);
    }

    // 5. Weekly Learning Tasks
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

    // 6. Milestones
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

    // 7. Deadlines
    const existingDeadlines = await StudentDeadline.find({ user: userId });
    if (existingDeadlines.length === 0) {
        await StudentDeadline.insertMany([
            { user: userId, title: 'DBMS Midterm Exam', date: 'May 20, 2026', category: 'Academic', urgency: 'Due this week' },
            { user: userId, title: 'DSA Assignment 3', date: 'May 25, 2026', category: 'Academic', urgency: 'Due next week' },
            { user: userId, title: 'Library Management Project', date: 'May 30, 2026', category: 'Projects', urgency: 'Due this month' },
            { user: userId, title: 'Summer Internship Application', date: 'Jun 10, 2026', category: 'Career', urgency: 'Upcoming' }
        ]);
    }

    // 8. AI Recommendations
    const existingRecs = await AIRecommendation.find({ user: userId });
    if (existingRecs.length === 0) {
        await AIRecommendation.insertMany([
            {
                user: userId,
                recType: 'focus',
                badgeLabel: 'Focus recommendation',
                title: 'Focus on Data Structures',
                description: 'Your DSA accuracy is improving but needs more practice.',
                actionText: 'Practice Now →',
                actionLink: '/planner?tab=week',
                tag: 'DSA'
            },
            {
                user: userId,
                recType: 'weak_area',
                badgeLabel: 'Weak-area recommendation',
                title: 'Weak Area: Recursion',
                description: 'We recommend: 3 lessons and 5 practice problems to improve accuracy.',
                actionText: 'Start Learning →',
                actionLink: '/codespirit',
                tag: 'Recursion'
            },
            {
                user: userId,
                recType: 'project',
                badgeLabel: 'Project recommendation',
                title: 'Project Suggestion',
                description: 'Build a To-Do App using C++ and File Handling.',
                actionText: 'Explore →',
                actionLink: '/project-lab',
                tag: 'C++'
            }
        ]);
    }
};

// GET Full Planner State
exports.getFullPlannerState = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : '64f1a2b3c4d5e6f7a8b9c0d1';

        // Seed if missing
        if (req.user && req.user._id) {
            await seedDefaultData(userId);
        }

        const profile = (await StudentProfile.findOne({ user: userId })) || {
            displayName: req.user?.username || 'sasa',
            level: 3,
            xp: 4630,
            xpToNextLevel: 6000,
            currentSemester: 2,
            batch: 'CSE — 2026 Batch',
            targetRole: 'Software Engineer',
            targetDate: 'June 2027',
            currentFocus: { course: 'Data Structures', topic: 'Linked List', masteryPercent: 66 }
        };

        const courses = await AcademicCourse.find({ user: userId }).sort({ mastery: -1 });
        const skills = await StudentSkill.find({ user: userId });
        const projects = await StudentProject.find({ user: userId });
        const tasks = await LearningTask.find({ user: userId }).sort({ createdAt: 1 });
        const milestones = await StudentMilestone.find({ user: userId });
        const deadlines = await StudentDeadline.find({ user: userId });
        const recommendations = await AIRecommendation.find({ user: userId });

        // Calculate dynamic weekly completion rate
        const totalPlannedMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
        const completedTasks = tasks.filter(t => t.completed || t.status === 'COMPLETED' || t.status === 'MASTERED');
        const completedMinutes = completedTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
        const completionRate = totalPlannedMinutes > 0 ? Math.round((completedMinutes / totalPlannedMinutes) * 100) : 55;

        // Dynamic AI Status Card Advice
        let aiAdvice = `Keep going! You're ${completionRate}% towards completing this week's plan.`;
        if (completionRate < 40) {
            aiAdvice = `You are behind this week's plan. Let's adjust your schedule to stay on track.`;
        } else if (completionRate >= 90 && completionRate < 100) {
            aiAdvice = `Excellent! You're almost finished with this week's plan.`;
        } else if (completionRate === 100) {
            aiAdvice = `Amazing! This week's learning plan is complete. Great job!`;
        }

        // Calculate Weighted Overall Progress
        const courseAvg = courses.length > 0 ? courses.reduce((s, c) => s + c.mastery, 0) / courses.length : 60;
        const skillAvg = skills.length > 0 ? skills.reduce((s, sk) => s + sk.mastery, 0) / skills.length : 55;
        const weightedOverall = Math.round((courseAvg * 0.4) + (skillAvg * 0.3) + (completionRate * 0.2) + 10);

        // Semester Nodes (1 to 8)
        const semesters = [1, 2, 3, 4, 5, 6, 7, 8].map(num => ({
            number: num,
            label: `Semester ${num}`,
            status: num < profile.currentSemester ? 'completed' : num === profile.currentSemester ? 'current' : 'upcoming'
        }));

        res.status(200).json({
            success: true,
            data: {
                profile,
                semesters,
                courses,
                skills,
                projects,
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

// Task Lifecycle Status Update
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

        // Deterministic Logic: Update course and skill progress if task is mastered/completed
        if (task.completed && task.courseName) {
            const course = await AcademicCourse.findOne({ user: task.user, name: task.courseName });
            if (course) {
                course.mastery = Math.min(100, course.mastery + 3);
                await course.save();
            }
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update task status', error: error.message });
    }
};

// Create Task
exports.createTask = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : '64f1a2b3c4d5e6f7a8b9c0d1';
        const taskData = { ...req.body, user: userId };
        const task = await LearningTask.create(taskData);

        // Also save to generic Task model for backward compatibility
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

// Delete Task
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await LearningTask.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete task', error: error.message });
    }
};

// AI Plan Builder
exports.buildAIPlan = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : '64f1a2b3c4d5e6f7a8b9c0d1';
        const { targetRole, availableHoursPerDay, preferredFocus } = req.body;

        const roleTitle = targetRole || 'Backend Developer';

        // Generate tailored roadmap
        const roadmapSteps = [
            { step: 1, title: 'Programming Fundamentals (C++/Java/Python)' },
            { step: 2, title: 'Git & Version Control Mastery' },
            { step: 3, title: 'SQL & Database Design' },
            { step: 4, title: 'Backend Framework & Node.js / Express' },
            { step: 5, title: 'RESTful API Architecture' },
            { step: 6, title: 'MongoDB & NoSQL Data Modeling' },
            { step: 7, title: 'Authentication & JWT Security' },
            { step: 8, title: 'Fullstack / Backend Portfolio Project' },
            { step: 9, title: 'Deployment & CI/CD Pipelines' },
            { step: 10, title: 'Technical Interview & System Design' }
        ];

        // Update profile career goal
        let profile = await StudentProfile.findOne({ user: userId });
        if (profile) {
            profile.targetRole = roleTitle;
            profile.careerSteps = roadmapSteps.map(s => ({ step: s.step, title: s.title, completed: s.step <= 2 }));
            await profile.save();
        }

        res.status(200).json({
            success: true,
            targetRole: roleTitle,
            roadmapSteps
        });
    } catch (error) {
        console.error('AI plan builder error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate AI plan', error: error.message });
    }
};

// Legacy GET Tasks
exports.getTasks = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : '64f1a2b3c4d5e6f7a8b9c0d1';
        const tasks = await LearningTask.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: tasks.length, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: error.message });
    }
};

// Legacy GET Goals & Create Goal
exports.getGoals = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : '64f1a2b3c4d5e6f7a8b9c0d1';
        const goals = await Goal.find({ user: userId });
        res.status(200).json({ success: true, goals });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch goals' });
    }
};

exports.createGoal = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : '64f1a2b3c4d5e6f7a8b9c0d1';
        const goal = await Goal.create({ ...req.body, user: userId });
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
