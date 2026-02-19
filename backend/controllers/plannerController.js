const Task = require('../models/Task');
const Goal = require('../models/Goal');

// ================== TASKS ==================

// Get all tasks for user
exports.getTasks = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: error.message });
    }
};

// Create new task
exports.createTask = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        req.body.user = req.user._id;
        const task = await Task.create(req.body);

        res.status(201).json({
            success: true,
            task
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ success: false, message: 'Failed to create task', error: error.message });
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this task' });
        }

        // Set completedAt if status changes to completed
        if (req.body.status === 'completed' && task.status !== 'completed') {
            req.body.completedAt = Date.now();
        }
        // Update completed boolean for checkbox behavior
        if (req.body.completed !== undefined) {
            req.body.status = req.body.completed ? 'completed' : 'pending';
            if (req.body.completed) req.body.completedAt = Date.now();
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            task
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this task' });
        }

        await task.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete task', error: error.message });
    }
};


// ================== GOALS ==================

// Get all goals for user
exports.getGoals = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: goals.length,
            goals
        });
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch goals', error: error.message });
    }
};

// Create new goal
exports.createGoal = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        req.body.user = req.user._id;
        const goal = await Goal.create(req.body);

        res.status(201).json({
            success: true,
            goal
        });
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ success: false, message: 'Failed to create goal', error: error.message });
    }
};

// Update goal
exports.updateGoal = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        let goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        if (goal.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this goal' });
        }

        // Check if progress is 100, then mark as completed
        if (req.body.progress === 100) {
            req.body.status = 'completed';
            req.body.completedAt = Date.now();
        }

        goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            goal
        });
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ success: false, message: 'Failed to update goal', error: error.message });
    }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        if (goal.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this goal' });
        }

        await goal.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Goal deleted successfully'
        });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete goal', error: error.message });
    }
};


// ================== ANALYTICS ==================

exports.getPlannerOverview = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const userId = req.user._id;

        // Calculate start of current week (Sunday)
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // Get tasks created or completed this week
        const tasks = await Task.find({
            user: userId,
            $or: [
                { createdAt: { $gte: startOfWeek } },
                { completedAt: { $gte: startOfWeek } }
            ]
        });

        const goals = await Goal.find({ user: userId });

        // Initialize Weekly Activity Data Structure
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyActivity = days.map(day => ({ day, created: 0, completed: 0 }));

        tasks.forEach(task => {
            // Count Creations
            if (new Date(task.createdAt) >= startOfWeek) {
                const dayIndex = new Date(task.createdAt).getDay();
                weeklyActivity[dayIndex].created++;
            }

            // Count Completions
            if (task.completedAt && new Date(task.completedAt) >= startOfWeek) {
                const dayIndex = new Date(task.completedAt).getDay();
                weeklyActivity[dayIndex].completed++;
            }
        });

        // Performance Trends (Total Counts)
        const totalTasks = await Task.countDocuments({ user: userId });
        const completedTasks = await Task.countDocuments({ user: userId, status: 'completed' });
        const totalGoals = goals.length;
        const completedGoals = goals.filter(g => g.status === 'completed' || g.progress === 100).length;

        // AI Insights Logic
        const insights = [];

        // Task Completion Rate Insight
        if (totalTasks > 0) {
            const rate = (completedTasks / totalTasks) * 100;
            if (rate < 30) {
                insights.push({
                    type: 'warning',
                    text: `You've completed ${rate.toFixed(0)}% of your tasks. Try focusing on one task at a time to build momentum.`
                });
            } else if (rate > 80) {
                insights.push({
                    type: 'success',
                    text: `Outstanding! You're crushing it with a ${rate.toFixed(0)}% completion rate. Keep it up!`
                });
            } else {
                insights.push({
                    type: 'info',
                    text: `You're making steady progress with a ${rate.toFixed(0)}% completion rate.`
                });
            }
        } else {
            insights.push({ type: 'info', text: "Start by adding your first task to see personalized insights!" });
        }

        // Goal Deadline Insight
        const upcomingGoals = goals.filter(g => {
            const diff = new Date(g.targetDate) - new Date();
            const daysRemaining = diff / (1000 * 60 * 60 * 24);
            return g.status === 'active' && daysRemaining > 0 && daysRemaining <= 7;
        });

        if (upcomingGoals.length > 0) {
            insights.push({
                type: 'alert',
                text: `You have ${upcomingGoals.length} goal(s) due within a week. Review them now!`
            });
        }

        res.status(200).json({
            success: true,
            overview: {
                weeklyActivity,
                performance: {
                    totalTasks,
                    completedTasks,
                    totalGoals,
                    completedGoals
                },
                insights
            }
        });
    } catch (error) {
        console.error('Get planner overview error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch overview', error: error.message });
    }
};
