const Group = require('../models/Group');
const Activity = require('../models/Activity');
const User = require('../models/User');

// Create a new group
exports.createGroup = async (req, res) => {
    try {
        // Ensure user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        console.log('📝 Creating group. Body:', req.body);
        const userId = req.user._id;
        const { name, description, goal, category, privacy, avatar, color, tags, maxMembers, inviteCode } = req.body;

        // Check if invite code is provided and unique
        if (inviteCode) {
            const existingGroup = await Group.findOne({ inviteCode: inviteCode.toUpperCase() });
            if (existingGroup) {
                return res.status(400).json({ success: false, message: 'Invite code already taken' });
            }
        }

        // Construct group data safely casting types
        const groupData = {
            name: String(name || '').trim(),
            description: String(description || '').trim(),
            goal: String(goal || '').trim(),
            category: String(category || 'General'),
            privacy: String(privacy || 'public'),
            avatar: String(avatar || '📚'),
            color: String(color || 'violet'),
            tags: Array.isArray(tags) ? tags : [],
            maxMembers: Number(maxMembers) || 50,
            creator: userId,
            admins: [userId],
            members: [{
                user: userId,
                role: 'admin',
                joinedAt: new Date()
            }]
        };

        if (inviteCode && inviteCode.trim()) {
            groupData.inviteCode = String(inviteCode).toUpperCase();
        }

        console.log('🛠️ Sanitized Group Data:', groupData);

        const group = new Group(groupData);

        await group.save();

        // Perform secondary updates (Activity log, XP) non-blockingly or safely
        try {
            // Create activity log
            await Activity.create({
                user: userId,
                group: group._id,
                actionType: 'joined_group',
                description: `Created and joined the group "${name}"`,
                xpAwarded: 50
            });

            // Update user XP
            await User.findByIdAndUpdate(userId, { $inc: { 'stats.xp': 50 } });
        } catch (secondaryErr) {
            console.error('Secondary group creation operations failed:', secondaryErr);
            // Continue execution - group was created successfully
        }

        await group.populate('members.user', 'name email avatar');

        res.status(201).json({
            success: true,
            message: 'Group created successfully!',
            group
        });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ success: false, message: 'Failed to create group', error: error.message });
    }
};

// Get all groups (with filters)
exports.getAllGroups = async (req, res) => {
    try {
        const { category, search, privacy, page = 1, limit = 20 } = req.query;
        const query = { isActive: true };

        if (category && category !== 'all') {
            query.category = category;
        }
        if (privacy) {
            query.privacy = privacy;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const groups = await Group.find(query)
            .populate('creator', 'name avatar')
            .populate('members.user', 'name avatar')
            .sort({ 'stats.totalXp': -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Group.countDocuments(query);

        res.json({
            success: true,
            groups,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch groups', error: error.message });
    }
};

// Get user's groups
exports.getMyGroups = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated', groups: [] });
        }
        const userId = req.user._id;

        const groups = await Group.find({
            'members.user': userId,
            isActive: true
        })
            .populate('creator', 'name avatar')
            .populate('members.user', 'name avatar')
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            groups
        });
    } catch (error) {
        console.error('Get my groups error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch your groups', error: error.message });
    }
};

// Get single group by ID
exports.getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId)
            .populate('creator', 'name email avatar')
            .populate('admins', 'name avatar')
            .populate('moderators', 'name avatar')
            .populate('members.user', 'name email avatar stats');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        res.json({ success: true, group });
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch group', error: error.message });
    }
};

// Join a group
exports.joinGroup = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if already a member
        const isMember = group.members.some(m => m.user.toString() === userId.toString());
        if (isMember) {
            return res.status(400).json({ success: false, message: 'You are already a member of this group' });
        }

        // Check max members
        if (group.members.length >= group.maxMembers) {
            return res.status(400).json({ success: false, message: 'Group is full' });
        }

        // Check privacy - if private or invite-only, prevent direct join unless they have a code (handled by joinByCode)
        // Allowing 'request to join' for private groups
        if (group.privacy === 'private' || group.privacy === 'invite-only') {
            // Check if already requested
            const hasRequested = group.joinRequests && group.joinRequests.some(r => r.user && r.user.toString() === userId.toString());
            if (hasRequested) {
                return res.status(400).json({ success: false, message: 'You have already requested to join this group' });
            }

            group.joinRequests.push({ user: userId });
            await group.save();

            return res.json({
                success: true,
                message: 'Request sent to group admins for approval',
                status: 'pending'
            });
        }

        group.members.push({
            user: userId,
            role: 'member',
            joinedAt: new Date()
        });

        await group.save();

        // Create activity log
        const user = await User.findById(userId);
        await Activity.create({
            user: userId,
            group: group._id,
            actionType: 'joined_group',
            description: `${user.name} joined the group`,
            xpAwarded: 25
        });

        // Update user XP
        await User.findByIdAndUpdate(userId, { $inc: { 'stats.xp': 25 } });

        await group.populate('members.user', 'name avatar');

        res.json({
            success: true,
            message: 'Successfully joined the group!',
            group
        });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({ success: false, message: 'Failed to join group', error: error.message });
    }
};

// Join group via invite code — DIRECTLY joins group, bypassing approval
exports.joinGroupByCode = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const { inviteCode } = req.body;
        const userId = req.user._id;

        const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase() });

        if (!group) {
            return res.status(404).json({ success: false, message: 'Invalid invite code' });
        }

        // Check if already a member
        const isMember = group.members.some(m => m.user && m.user.toString() === userId.toString());
        if (isMember) {
            return res.status(400).json({ success: false, message: 'You are already a member of this group' });
        }

        // Check if the user is the creator (auto-join)
        if (group.creator.toString() === userId.toString()) {
            group.members.push({ user: userId, role: 'admin', joinedAt: new Date() });
            await group.save();
            await group.populate('members.user', 'name avatar');
            return res.json({ success: true, message: 'Rejoined your own group!', group });
        }

        // Check max members
        if (group.members.length >= group.maxMembers) {
            return res.status(400).json({ success: false, message: 'Group is full' });
        }

        // If user has a pending request, remove it (code overrides request)
        if (group.joinRequests && group.joinRequests.length > 0) {
            const requestIndex = group.joinRequests.findIndex(r => r.user && r.user.toString() === userId.toString());
            if (requestIndex !== -1) {
                group.joinRequests.splice(requestIndex, 1);
            }
        }

        // Add member directly
        group.members.push({
            user: userId,
            role: 'member',
            joinedAt: new Date()
        });

        await group.save();

        // Create activity log
        try {
            const user = await User.findById(userId);
            if (user) {
                await Activity.create({
                    user: userId,
                    group: group._id,
                    actionType: 'joined_group',
                    description: `${user.name} joined the group via invite code`,
                    xpAwarded: 25
                });
            }

            // Update user XP
            await User.findByIdAndUpdate(userId, { $inc: { 'stats.xp': 25 } });
        } catch (err) {
            console.error('Secondary operations failed:', err);
        }

        await group.populate('members.user', 'name avatar');

        res.json({
            success: true,
            message: 'Successfully joined the group!',
            group
        });
    } catch (error) {
        console.error('Join group by code error:', error);
        res.status(500).json({ success: false, message: 'Failed to join group', error: error.message });
    }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if user is the creator
        if (group.creator.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Group creator cannot leave. Transfer ownership or delete the group.'
            });
        }

        // Remove from members
        group.members = group.members.filter(m => m.user.toString() !== userId.toString());
        group.admins = group.admins.filter(a => a.toString() !== userId.toString());
        group.moderators = group.moderators.filter(m => m.toString() !== userId.toString());

        await group.save();

        // Create activity log
        const user = await User.findById(userId);
        await Activity.create({
            user: userId,
            group: group._id,
            actionType: 'left_group',
            description: `${user.name} left the group`
        });

        res.json({
            success: true,
            message: 'Successfully left the group'
        });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({ success: false, message: 'Failed to leave group', error: error.message });
    }
};

// Update group (admin only)
exports.updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if user is admin
        const isAdmin = group.admins.some(a => a.toString() === userId.toString());
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Only admins can update group settings' });
        }

        // Update allowed fields
        const allowedUpdates = ['name', 'description', 'goal', 'category', 'privacy', 'avatar', 'color', 'tags', 'maxMembers'];
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                group[field] = updates[field];
            }
        });

        await group.save();
        await group.populate('members.user', 'name avatar');

        res.json({
            success: true,
            message: 'Group updated successfully',
            group
        });
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({ success: false, message: 'Failed to update group', error: error.message });
    }
};

// Delete group (creator only)
exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if user is creator
        if (group.creator.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Only the group creator can delete the group' });
        }

        group.isActive = false;
        await group.save();

        res.json({
            success: true,
            message: 'Group deleted successfully'
        });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete group', error: error.message });
    }
};

// Get group leaderboard
exports.getGroupLeaderboard = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId)
            .populate('members.user', 'name avatar stats');

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Sort members by XP contributed
        const leaderboard = group.members
            .map(m => ({
                user: m.user,
                xpContributed: m.xpContributed,
                streak: m.streak,
                role: m.role,
                joinedAt: m.joinedAt
            }))
            .sort((a, b) => b.xpContributed - a.xpContributed)
            .map((member, index) => ({
                ...member,
                rank: index + 1
            }));

        res.json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch leaderboard', error: error.message });
    }
};

// Update member role (admin only)
exports.updateMemberRole = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const { role } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if user is admin
        const isAdmin = group.admins.some(a => a.toString() === userId.toString());
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Only admins can change member roles' });
        }

        // Find and update member role
        const member = group.members.find(m => m.user.toString() === memberId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        member.role = role;

        // Update admins/moderators arrays
        if (role === 'admin') {
            if (!group.admins.includes(memberId)) {
                group.admins.push(memberId);
            }
            group.moderators = group.moderators.filter(m => m.toString() !== memberId);
        } else if (role === 'moderator') {
            if (!group.moderators.includes(memberId)) {
                group.moderators.push(memberId);
            }
            group.admins = group.admins.filter(a => a.toString() !== memberId);
        } else {
            group.admins = group.admins.filter(a => a.toString() !== memberId);
            group.moderators = group.moderators.filter(m => m.toString() !== memberId);
        }

        await group.save();

        res.json({
            success: true,
            message: 'Member role updated successfully'
        });
    } catch (error) {
        console.error('Update member role error:', error);
        res.status(500).json({ success: false, message: 'Failed to update member role', error: error.message });
    }
};

// Remove member (admin only)
exports.removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if user is admin
        const isAdmin = group.admins.some(a => a.toString() === userId.toString());
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Only admins can remove members' });
        }

        // Cannot remove creator
        if (group.creator.toString() === memberId) {
            return res.status(400).json({ success: false, message: 'Cannot remove the group creator' });
        }

        group.members = group.members.filter(m => m.user.toString() !== memberId);
        group.admins = group.admins.filter(a => a.toString() !== memberId);
        group.moderators = group.moderators.filter(m => m.toString() !== memberId);

        await group.save();

        res.json({
            success: true,
            message: 'Member removed successfully'
        });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove member', error: error.message });
    }
};

// Handle Join Request (Admins Only)
exports.handleJoinRequest = async (req, res) => {
    try {
        const { groupId, requestId } = req.params; // requesting user ID
        const { action } = req.body; // 'accept' or 'reject'
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

        // Admin check
        const isAdmin = group.admins.some(a => a.toString() === userId.toString());
        if (!isAdmin) return res.status(403).json({ success: false, message: 'Only admins can handle requests' });

        // Find request
        const requestIndex = group.joinRequests.findIndex(r => r.user.toString() === requestId);
        if (requestIndex === -1) return res.status(404).json({ success: false, message: 'Request not found' });

        if (action === 'accept') {
            // Check max members
            if (group.members.length >= group.maxMembers) {
                return res.status(400).json({ success: false, message: 'Group is full' });
            }

            // Add member
            group.members.push({
                user: requestId,
                role: 'member',
                joinedAt: new Date()
            });

            // Activity log for user joining
            await Activity.create({
                user: requestId,
                group: group._id,
                actionType: 'joined_group',
                description: `Request accepted to join ${group.name}`,
                xpAwarded: 25
            });

            // Update user XP
            await User.findByIdAndUpdate(requestId, { $inc: { 'stats.xp': 25 } });
        }

        // Remove request
        group.joinRequests.splice(requestIndex, 1);
        await group.save();
        await group.populate('members.user', 'name avatar');

        res.json({
            success: true,
            message: `Request ${action}ed successfully`,
            group
        });
    } catch (error) {
        console.error('Handle join request error:', error);
        res.status(500).json({ success: false, message: 'Failed to handle request', error: error.message });
    }
};

// Get Join Requests
exports.getJoinRequests = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId).populate('joinRequests.user', 'name avatar');
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

        // Admin check
        const isAdmin = group.admins.some(a => a.toString() === userId.toString());
        if (!isAdmin) return res.status(403).json({ success: false, message: 'Only admins can view requests' });

        res.json({ success: true, requests: group.joinRequests });
    } catch (error) {
        console.error('Get join requests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch requests', error: error.message });
    }
};
