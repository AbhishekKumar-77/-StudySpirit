const Activity = require('../models/Activity');

// Get activity feed for a group
exports.getGroupActivity = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { page = 1, limit = 30 } = req.query;

        const activities = await Activity.find({ group: groupId, isPublic: true })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Activity.countDocuments({ group: groupId, isPublic: true });

        res.json({
            success: true,
            activities,
            pagination: { page: parseInt(page), limit: parseInt(limit), total }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed', error: error.message });
    }
};

// Get user activity
exports.getUserActivity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20 } = req.query;

        const activities = await Activity.find({ user: userId })
            .populate('group', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({ success: true, activities });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed', error: error.message });
    }
};
