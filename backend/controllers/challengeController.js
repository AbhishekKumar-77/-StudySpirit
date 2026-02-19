const Challenge = require('../models/Challenge');
const Group = require('../models/Group');
const Activity = require('../models/Activity');
const User = require('../models/User');

// Create a new challenge (supports public/private/group challenges)
exports.createChallenge = async (req, res) => {
    try {
        const {
            title, description, groupId, challengeType, target, unit,
            reward, deadline, isRecurring, recurringType, icon, visibility, category
        } = req.body;
        const userId = req.user._id;

        // For group challenges, verify group exists and user is a member
        if (groupId && visibility !== 'public' && visibility !== 'private') {
            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(404).json({ success: false, message: 'Group not found' });
            }

            const isMember = group.members.some(m => m.user.toString() === userId.toString());
            if (!isMember) {
                return res.status(403).json({ success: false, message: 'You must be a group member to create challenges' });
            }
        }

        const challenge = new Challenge({
            title,
            description,
            group: groupId || null,
            creator: userId,
            challengeType: challengeType || 'problems',
            target,
            unit: unit || 'problems',
            reward: reward || { xp: 100 },
            deadline: new Date(deadline),
            isRecurring: isRecurring || false,
            recurringType: recurringType || 'weekly',
            icon: icon || '🎯',
            visibility: visibility || 'group',
            category: category || 'General',
            participants: [{
                user: userId,
                progress: 0,
                joinedAt: new Date()
            }]
        });

        await challenge.save();

        // Create activity
        const user = await User.findById(userId);
        if (groupId) {
            await Activity.create({
                user: userId,
                group: groupId,
                actionType: 'joined_challenge',
                description: `${user.name} created a new challenge: "${title}"`,
                metadata: {
                    itemId: challenge._id,
                    itemType: 'Challenge',
                    itemName: title
                },
                xpAwarded: 15
            });
        }

        await User.findByIdAndUpdate(userId, { $inc: { 'stats.xp': 15 } });

        await challenge.populate('creator', 'name avatar');
        await challenge.populate('participants.user', 'name avatar');

        res.status(201).json({
            success: true,
            message: visibility === 'public' ? 'Public challenge created! Others can now join.' : 'Challenge created successfully!',
            challenge
        });
    } catch (error) {
        console.error('Create challenge error:', error);
        res.status(500).json({ success: false, message: 'Failed to create challenge', error: error.message });
    }
};


// Get challenges for a group
exports.getGroupChallenges = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { status } = req.query;

        const query = { group: groupId };
        if (status) {
            query.status = status;
        }

        const challenges = await Challenge.find(query)
            .populate('creator', 'name avatar')
            .populate('participants.user', 'name avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            challenges
        });
    } catch (error) {
        console.error('Get challenges error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch challenges', error: error.message });
    }
};

// Get all active challenges (for explore) - supports public challenges
exports.getAllActiveChallenges = async (req, res) => {
    try {
        const { page = 1, limit = 20, visibility, category } = req.query;

        // Build query
        const query = { status: 'active' };

        // If visibility is 'public', only show public challenges
        if (visibility === 'public') {
            query.visibility = 'public';
        }

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        const challenges = await Challenge.find(query)
            .populate('creator', 'name avatar')
            .populate('group', 'name avatar')
            .populate('participants.user', 'name avatar stats')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Challenge.countDocuments(query);

        res.json({
            success: true,
            challenges,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all challenges error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch challenges', error: error.message });
    }
};

// Get public challenges (visible to all platform users)
exports.getPublicChallenges = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, sort = 'popular' } = req.query;

        const query = { status: 'active', visibility: 'public' };

        if (category && category !== 'all') {
            query.category = category;
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') {
            sortOption = { 'participants.length': -1, createdAt: -1 };
        } else if (sort === 'ending') {
            sortOption = { deadline: 1 };
        }

        const challenges = await Challenge.find(query)
            .populate('creator', 'name avatar')
            .populate('participants.user', 'name avatar stats')
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Increment view count
        await Challenge.updateMany(
            { _id: { $in: challenges.map(c => c._id) } },
            { $inc: { totalViews: 1 } }
        );

        const total = await Challenge.countDocuments(query);

        res.json({
            success: true,
            challenges,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get public challenges error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch public challenges', error: error.message });
    }
};

// Get my created challenges (public & private)
exports.getMyChallenges = async (req, res) => {
    try {
        const userId = req.user._id;

        const challenges = await Challenge.find({
            creator: userId,
            status: { $ne: 'cancelled' }
        })
            .populate('participants.user', 'name avatar stats')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            challenges
        });
    } catch (error) {
        console.error('Get my challenges error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch your challenges', error: error.message });
    }
};

// Get challenge leaderboard
exports.getChallengeLeaderboard = async (req, res) => {
    try {
        const { challengeId } = req.params;

        const challenge = await Challenge.findById(challengeId)
            .populate('participants.user', 'name avatar stats');

        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found' });
        }

        // Sort participants by progress (descending), then by completion date
        const leaderboard = challenge.participants
            .map(p => ({
                rank: 0,
                id: p.user._id,
                name: p.user.name,
                avatar: p.user.avatar,
                progress: p.progress,
                percentage: Math.round((p.progress / challenge.target) * 100),
                completed: p.completed,
                completedAt: p.completedAt,
                joinedAt: p.joinedAt
            }))
            .sort((a, b) => {
                if (a.completed && !b.completed) return -1;
                if (!a.completed && b.completed) return 1;
                if (a.completed && b.completed) {
                    return new Date(a.completedAt) - new Date(b.completedAt);
                }
                return b.progress - a.progress;
            })
            .map((p, index) => ({ ...p, rank: index + 1 }));

        res.json({
            success: true,
            challenge: {
                id: challenge._id,
                title: challenge.title,
                target: challenge.target,
                participantCount: challenge.participants.length,
                deadline: challenge.deadline
            },
            leaderboard
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch leaderboard', error: error.message });
    }
};


// Join a challenge
exports.joinChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const userId = req.user._id;

        const challenge = await Challenge.findById(challengeId);

        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found' });
        }

        if (challenge.status !== 'active') {
            return res.status(400).json({ success: false, message: 'This challenge is no longer active' });
        }

        // Check if already participating
        const isParticipant = challenge.participants.some(p => p.user.toString() === userId.toString());
        if (isParticipant) {
            return res.status(400).json({ success: false, message: 'You are already in this challenge' });
        }

        // For group challenges, verify user is a group member
        // Public challenges can be joined by anyone
        if (challenge.visibility !== 'public' && challenge.group) {
            const group = await Group.findById(challenge.group);
            if (group) {
                const isMember = group.members.some(m => m.user.toString() === userId.toString());
                if (!isMember) {
                    return res.status(403).json({ success: false, message: 'You must be a group member to join this challenge' });
                }
            }
        }


        challenge.participants.push({
            user: userId,
            progress: 0,
            joinedAt: new Date()
        });

        await challenge.save();

        // Create activity
        const user = await User.findById(userId);
        await Activity.create({
            user: userId,
            group: challenge.group,
            actionType: 'joined_challenge',
            description: `${user.name} joined the challenge: "${challenge.title}"`,
            metadata: {
                itemId: challenge._id,
                itemType: 'Challenge',
                itemName: challenge.title
            },
            xpAwarded: 10
        });

        await User.findByIdAndUpdate(userId, { $inc: { 'stats.xp': 10 } });

        await challenge.populate('participants.user', 'name avatar');

        res.json({
            success: true,
            message: 'Successfully joined the challenge!',
            challenge
        });
    } catch (error) {
        console.error('Join challenge error:', error);
        res.status(500).json({ success: false, message: 'Failed to join challenge', error: error.message });
    }
};

// Update progress
exports.updateProgress = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const { progress } = req.body;
        const userId = req.user._id;

        const challenge = await Challenge.findById(challengeId);

        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found' });
        }

        const participant = challenge.participants.find(p => p.user.toString() === userId.toString());
        if (!participant) {
            return res.status(404).json({ success: false, message: 'You are not in this challenge' });
        }

        const previousProgress = participant.progress;
        participant.progress = Math.min(progress, challenge.target);

        // Check if completed
        if (!participant.completed && participant.progress >= challenge.target) {
            participant.completed = true;
            participant.completedAt = new Date();

            // Award XP
            const xpReward = challenge.reward.xp || 100;
            await User.findByIdAndUpdate(userId, { $inc: { 'stats.xp': xpReward } });

            // Create completion activity
            const user = await User.findById(userId);
            await Activity.create({
                user: userId,
                group: challenge.group,
                actionType: 'completed_challenge',
                description: `${user.name} completed the challenge: "${challenge.title}"`,
                metadata: {
                    itemId: challenge._id,
                    itemType: 'Challenge',
                    itemName: challenge.title,
                    xpEarned: xpReward
                },
                xpAwarded: xpReward
            });

            // Update group stats
            await Group.findByIdAndUpdate(challenge.group, {
                $inc: { 'stats.challengesCompleted': 1 }
            });

            // Update group member XP
            const group = await Group.findById(challenge.group);
            const member = group.members.find(m => m.user.toString() === userId.toString());
            if (member) {
                member.xpContributed += xpReward;
                await group.save();
            }
        }

        await challenge.save();
        await challenge.populate('participants.user', 'name avatar');

        res.json({
            success: true,
            message: participant.completed ? 'Challenge completed! 🎉' : 'Progress updated',
            challenge,
            completed: participant.completed
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ success: false, message: 'Failed to update progress', error: error.message });
    }
};

// Get challenge details
exports.getChallengeById = async (req, res) => {
    try {
        const { challengeId } = req.params;

        const challenge = await Challenge.findById(challengeId)
            .populate('creator', 'name avatar')
            .populate('group', 'name avatar')
            .populate('participants.user', 'name avatar stats');

        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found' });
        }

        res.json({ success: true, challenge });
    } catch (error) {
        console.error('Get challenge error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch challenge', error: error.message });
    }
};

// Delete challenge (creator only)
exports.deleteChallenge = async (req, res) => {
    try {
        const { challengeId } = req.params;
        const userId = req.user._id;

        const challenge = await Challenge.findById(challengeId);

        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found' });
        }

        if (challenge.creator.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Only the creator can delete this challenge' });
        }

        challenge.status = 'cancelled';
        await challenge.save();

        res.json({
            success: true,
            message: 'Challenge cancelled'
        });
    } catch (error) {
        console.error('Delete challenge error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete challenge', error: error.message });
    }
};
