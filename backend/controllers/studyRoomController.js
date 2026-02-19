const StudyRoom = require('../models/StudyRoom');
const Group = require('../models/Group');
const Activity = require('../models/Activity');
const User = require('../models/User');

// Create a new study room
exports.createStudyRoom = async (req, res) => {
    try {
        const {
            name, description, topic, category, difficulty, language,
            maxParticipants, groupId, isPublic, scheduledStart, scheduledEnd, avatar, tags
        } = req.body;
        const userId = req.user._id;

        const studyRoom = new StudyRoom({
            name,
            description,
            topic,
            category: category || 'General',
            difficulty: difficulty || 'Intermediate',
            language: language || 'English',
            maxParticipants: maxParticipants || 20,
            group: groupId,
            host: userId,
            isPublic: isPublic !== false,
            scheduledStart,
            scheduledEnd,
            avatar: avatar || '📖',
            tags: tags || [],
            status: scheduledStart ? 'scheduled' : 'live',
            participants: [{
                user: userId,
                joinedAt: new Date(),
                isMuted: false,
                isCameraOn: true,
                status: 'active'
            }]
        });

        await studyRoom.save();

        // Create activity if group exists
        if (groupId) {
            const user = await User.findById(userId);
            await Activity.create({
                user: userId,
                group: groupId,
                actionType: 'started_session',
                description: `${user.name} started a study session: "${name}"`,
                metadata: {
                    itemId: studyRoom._id,
                    itemType: 'StudyRoom',
                    itemName: name
                },
                xpAwarded: 20
            });

            await User.findByIdAndUpdate(userId, { $inc: { 'stats.xp': 20 } });
        }

        await studyRoom.populate('host', 'name avatar');
        await studyRoom.populate('participants.user', 'name avatar');

        res.status(201).json({
            success: true,
            message: 'Study room created successfully!',
            studyRoom
        });
    } catch (error) {
        console.error('Create study room error:', error);
        res.status(500).json({ success: false, message: 'Failed to create study room', error: error.message });
    }
};

// Get all live study rooms
exports.getLiveRooms = async (req, res) => {
    try {
        const { category, difficulty, search, page = 1, limit = 20 } = req.query;
        const query = { status: 'live', isPublic: true };

        if (category && category !== 'all') {
            query.category = category;
        }
        if (difficulty) {
            query.difficulty = difficulty;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { topic: { $regex: search, $options: 'i' } }
            ];
        }

        const studyRooms = await StudyRoom.find(query)
            .populate('host', 'name avatar')
            .populate('participants.user', 'name avatar')
            .populate('group', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await StudyRoom.countDocuments(query);

        res.json({
            success: true,
            studyRooms,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get live rooms error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch live rooms', error: error.message });
    }
};

// Get study rooms by group
exports.getGroupRooms = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { status } = req.query;

        const query = { group: groupId };
        if (status) {
            query.status = status;
        }

        const studyRooms = await StudyRoom.find(query)
            .populate('host', 'name avatar')
            .populate('participants.user', 'name avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            studyRooms
        });
    } catch (error) {
        console.error('Get group rooms error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch group rooms', error: error.message });
    }
};

// Get single study room
exports.getStudyRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const studyRoom = await StudyRoom.findById(roomId)
            .populate('host', 'name email avatar')
            .populate('participants.user', 'name email avatar stats')
            .populate('group', 'name avatar');

        if (!studyRoom) {
            return res.status(404).json({ success: false, message: 'Study room not found' });
        }

        res.json({ success: true, studyRoom });
    } catch (error) {
        console.error('Get study room error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch study room', error: error.message });
    }
};

// Join a study room
exports.joinStudyRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        const studyRoom = await StudyRoom.findById(roomId);

        if (!studyRoom) {
            return res.status(404).json({ success: false, message: 'Study room not found' });
        }

        if (studyRoom.status !== 'live') {
            return res.status(400).json({ success: false, message: 'This study room is not currently live' });
        }

        // Check if already a participant
        const isParticipant = studyRoom.participants.some(p => p.user.toString() === userId.toString());
        if (isParticipant) {
            return res.status(400).json({ success: false, message: 'You are already in this study room' });
        }

        // Check max participants
        if (studyRoom.participants.length >= studyRoom.maxParticipants) {
            return res.status(400).json({ success: false, message: 'Study room is full' });
        }

        studyRoom.participants.push({
            user: userId,
            joinedAt: new Date(),
            isMuted: true,
            isCameraOn: false,
            status: 'active'
        });

        await studyRoom.save();

        // Create activity if group exists
        if (studyRoom.group) {
            const user = await User.findById(userId);
            await Activity.create({
                user: userId,
                group: studyRoom.group,
                actionType: 'joined_session',
                description: `${user.name} joined the study session`,
                metadata: {
                    itemId: studyRoom._id,
                    itemType: 'StudyRoom',
                    itemName: studyRoom.name
                },
                xpAwarded: 10
            });

            await User.findByIdAndUpdate(userId, { $inc: { 'stats.xp': 10 } });
        }

        await studyRoom.populate('participants.user', 'name avatar');

        res.json({
            success: true,
            message: 'Successfully joined the study room!',
            studyRoom
        });
    } catch (error) {
        console.error('Join study room error:', error);
        res.status(500).json({ success: false, message: 'Failed to join study room', error: error.message });
    }
};

// Leave a study room
exports.leaveStudyRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        const studyRoom = await StudyRoom.findById(roomId);

        if (!studyRoom) {
            return res.status(404).json({ success: false, message: 'Study room not found' });
        }

        // Remove user from participants
        studyRoom.participants = studyRoom.participants.filter(
            p => p.user.toString() !== userId.toString()
        );

        // If host leaves and no more participants, end the room
        if (studyRoom.host.toString() === userId.toString()) {
            if (studyRoom.participants.length === 0) {
                studyRoom.status = 'ended';
                studyRoom.actualEndTime = new Date();
            } else {
                // Transfer host to first participant
                studyRoom.host = studyRoom.participants[0].user;
            }
        }

        await studyRoom.save();

        res.json({
            success: true,
            message: 'Successfully left the study room'
        });
    } catch (error) {
        console.error('Leave study room error:', error);
        res.status(500).json({ success: false, message: 'Failed to leave study room', error: error.message });
    }
};

// Update participant status (mute, camera, etc.)
exports.updateParticipantStatus = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { isMuted, isCameraOn, isScreenSharing, status } = req.body;
        const userId = req.user._id;

        const studyRoom = await StudyRoom.findById(roomId);

        if (!studyRoom) {
            return res.status(404).json({ success: false, message: 'Study room not found' });
        }

        const participant = studyRoom.participants.find(
            p => p.user.toString() === userId.toString()
        );

        if (!participant) {
            return res.status(404).json({ success: false, message: 'You are not in this study room' });
        }

        if (isMuted !== undefined) participant.isMuted = isMuted;
        if (isCameraOn !== undefined) participant.isCameraOn = isCameraOn;
        if (isScreenSharing !== undefined) participant.isScreenSharing = isScreenSharing;
        if (status) participant.status = status;

        await studyRoom.save();

        res.json({
            success: true,
            message: 'Status updated',
            participant
        });
    } catch (error) {
        console.error('Update participant status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
    }
};

// Update pomodoro timer
exports.updatePomodoroTimer = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { isRunning, currentPhase, timeRemaining, focusDuration, breakDuration } = req.body;
        const userId = req.user._id;

        const studyRoom = await StudyRoom.findById(roomId);

        if (!studyRoom) {
            return res.status(404).json({ success: false, message: 'Study room not found' });
        }

        // Only host can control timer
        if (studyRoom.host.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Only the host can control the timer' });
        }

        if (isRunning !== undefined) studyRoom.pomodoroSettings.isRunning = isRunning;
        if (currentPhase) studyRoom.pomodoroSettings.currentPhase = currentPhase;
        if (timeRemaining !== undefined) studyRoom.pomodoroSettings.timeRemaining = timeRemaining;
        if (focusDuration) studyRoom.pomodoroSettings.focusDuration = focusDuration;
        if (breakDuration) studyRoom.pomodoroSettings.breakDuration = breakDuration;

        await studyRoom.save();

        res.json({
            success: true,
            message: 'Pomodoro timer updated',
            pomodoroSettings: studyRoom.pomodoroSettings
        });
    } catch (error) {
        console.error('Update pomodoro error:', error);
        res.status(500).json({ success: false, message: 'Failed to update timer', error: error.message });
    }
};

// End study room (host only)
exports.endStudyRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        const studyRoom = await StudyRoom.findById(roomId);

        if (!studyRoom) {
            return res.status(404).json({ success: false, message: 'Study room not found' });
        }

        if (studyRoom.host.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Only the host can end the study room' });
        }

        studyRoom.status = 'ended';
        studyRoom.actualEndTime = new Date();

        await studyRoom.save();

        // Create activity if group exists
        if (studyRoom.group) {
            await Activity.create({
                user: userId,
                group: studyRoom.group,
                actionType: 'ended_session',
                description: `Study session "${studyRoom.name}" ended`,
                metadata: {
                    itemId: studyRoom._id,
                    itemType: 'StudyRoom',
                    itemName: studyRoom.name
                }
            });

            // Award XP to all participants
            const xpPerParticipant = Math.floor(studyRoom.duration / 60); // 1 XP per minute
            for (const participant of studyRoom.participants) {
                await User.findByIdAndUpdate(participant.user, {
                    $inc: { 'stats.xp': xpPerParticipant, 'stats.totalStudyTime': studyRoom.duration }
                });
            }

            // Update group stats
            await Group.findByIdAndUpdate(studyRoom.group, {
                $inc: { 'stats.sessionsCompleted': 1 }
            });
        }

        res.json({
            success: true,
            message: 'Study room ended',
            duration: studyRoom.duration
        });
    } catch (error) {
        console.error('End study room error:', error);
        res.status(500).json({ success: false, message: 'Failed to end study room', error: error.message });
    }
};
