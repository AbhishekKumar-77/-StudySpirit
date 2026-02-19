const User = require('../models/User');

/**
 * Admin Controller
 * Handles all admin-panel operations: list users, view details,
 * block/unblock, change roles, delete users, and dashboard stats.
 */

// ── GET /api/admin/stats ──
// Dashboard summary stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isBlocked: { $ne: true } });
        const blockedUsers = await User.countDocuments({ isBlocked: true });
        const verifiedUsers = await User.countDocuments({ isVerified: true });

        // Users by role
        const students = await User.countDocuments({ role: 'student' });
        const teachers = await User.countDocuments({ role: 'teacher' });
        const recruiters = await User.countDocuments({ role: 'recruiter' });

        // Users joined in last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });

        // Users who logged in today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const loggedInToday = await User.countDocuments({ lastLoginDate: { $gte: todayStart } });

        // Login providers breakdown
        const googleUsers = await User.countDocuments({ googleId: { $exists: true, $ne: null } });
        const githubUsers = await User.countDocuments({ githubId: { $exists: true, $ne: null } });
        const emailUsers = totalUsers - googleUsers - githubUsers;

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                blockedUsers,
                verifiedUsers,
                newUsersThisWeek,
                loggedInToday,
                byRole: { students, teachers, recruiters },
                byProvider: { email: emailUsers, google: googleUsers, github: githubUsers }
            }
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};

// ── GET /api/admin/users ──
// List all users with pagination + search + filters
exports.getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            role = '',
            status = '',       // 'blocked', 'active', 'unverified'
            sort = 'createdAt', // field to sort by
            order = 'desc'     // 'asc' or 'desc'
        } = req.query;

        // Build query
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { university: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) query.role = role;

        if (status === 'blocked') query.isBlocked = true;
        else if (status === 'active') {
            query.isBlocked = { $ne: true };
            query.isVerified = true;
        } else if (status === 'unverified') query.isVerified = { $ne: true };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

        const [users, total] = await Promise.all([
            User.find(query)
                .select('name email role isAdmin isBlocked blockReason isVerified avatar university course status stats quizStats lastLoginDate createdAt googleId githubId')
                .sort(sortObj)
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        res.json({
            success: true,
            users: users.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                isAdmin: u.isAdmin || false,
                isBlocked: u.isBlocked || false,
                blockReason: u.blockReason || '',
                isVerified: u.isVerified || false,
                avatar: u.avatar,
                university: u.university || '',
                course: u.course || '',
                onlineStatus: u.status || 'offline',
                stats: u.stats,
                quizStats: u.quizStats,
                lastLogin: u.lastLoginDate,
                joinedAt: u.createdAt,
                loginProvider: u.googleId ? 'google' : u.githubId ? 'github' : 'email'
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Admin GetUsers Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

// ── GET /api/admin/users/:id ──
// Full user details
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -verificationCode -verificationCodeExpires -chatHistory');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin || false,
                isBlocked: user.isBlocked || false,
                blockReason: user.blockReason || '',
                isVerified: user.isVerified || false,
                avatar: user.avatar,
                university: user.university || '',
                course: user.course || '',
                onlineStatus: user.status || 'offline',
                stats: user.stats,
                quizStats: user.quizStats,
                reputation: user.reputation || 0,
                connections: user.connections?.length || 0,
                lastLogin: user.lastLoginDate,
                joinedAt: user.createdAt,
                loginProvider: user.googleId ? 'google' : user.githubId ? 'github' : 'email',
                githubProfile: user.githubProfile || null,
                platformProfiles: user.platformProfiles || {},
                learningPath: user.learningPath || {},
                taskCount: user.tasks?.length || 0,
                studySessions: user.studySessions?.length || 0,
                activityLog: (user.activityLog || []).slice(-30) // Last 30 days
            }
        });
    } catch (error) {
        console.error('Admin UserDetail Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user details' });
    }
};

// ── PATCH /api/admin/users/:id/block ──
exports.blockUser = async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.isAdmin) return res.status(400).json({ success: false, message: 'Cannot block an admin' });

        user.isBlocked = true;
        user.blockReason = reason || 'Blocked by admin';
        await user.save();

        res.json({ success: true, message: `User ${user.name} has been blocked` });
    } catch (error) {
        console.error('Admin Block Error:', error);
        res.status(500).json({ success: false, message: 'Failed to block user' });
    }
};

// ── PATCH /api/admin/users/:id/unblock ──
exports.unblockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.isBlocked = false;
        user.blockReason = '';
        await user.save();

        res.json({ success: true, message: `User ${user.name} has been unblocked` });
    } catch (error) {
        console.error('Admin Unblock Error:', error);
        res.status(500).json({ success: false, message: 'Failed to unblock user' });
    }
};

// ── PATCH /api/admin/users/:id/role ──
exports.changeRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['student', 'teacher', 'recruiter'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.role = role;
        await user.save();

        res.json({ success: true, message: `Role changed to ${role}` });
    } catch (error) {
        console.error('Admin ChangeRole Error:', error);
        res.status(500).json({ success: false, message: 'Failed to change role' });
    }
};

// ── DELETE /api/admin/users/:id ──
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.isAdmin) return res.status(400).json({ success: false, message: 'Cannot delete an admin' });

        await User.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: `User ${user.name} has been permanently deleted` });
    } catch (error) {
        console.error('Admin Delete Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};

// ── PATCH /api/admin/users/:id/make-admin ──
exports.makeAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.isAdmin = true;
        await user.save();

        res.json({ success: true, message: `${user.name} is now an admin` });
    } catch (error) {
        console.error('Admin MakeAdmin Error:', error);
        res.status(500).json({ success: false, message: 'Failed to promote user' });
    }
};

// ── PATCH /api/admin/users/:id/remove-admin ──
exports.removeAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Prevent removing yourself as admin
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot remove your own admin privileges' });
        }

        user.isAdmin = false;
        await user.save();

        res.json({ success: true, message: `${user.name} is no longer an admin` });
    } catch (error) {
        console.error('Admin RemoveAdmin Error:', error);
        res.status(500).json({ success: false, message: 'Failed to demote user' });
    }
};
