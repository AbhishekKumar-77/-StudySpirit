const Classroom = require('../models/Classroom');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

// ── Classroom Management ──
exports.createClassroom = async (req, res) => {
    try {
        const { name, description, code } = req.body;
        const normalizedCode = (code || '').trim().toUpperCase();
        if (!normalizedCode) return res.status(400).json({ success: false, error: 'Class code is required' });
        
        const existing = await Classroom.findOne({ code: normalizedCode });
        if (existing) return res.status(400).json({ success: false, error: 'Class code already exists' });
        
        const newClass = new Classroom({
            name, description, code: normalizedCode, teacher: req.user._id, students: []
        });
        await newClass.save();
        res.status(201).json({ success: true, classroom: newClass });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.joinClassroom = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ success: false, error: 'Class code is required' });
        
        const classroom = await Classroom.findOne({ code: code.trim().toUpperCase() });
        if (!classroom) return res.status(404).json({ success: false, error: 'Class not found. Please check the code and try again.' });
        
        const userId = req.user._id.toString();
        const alreadyEnrolled = classroom.students.some(s => s.toString() === userId);
        
        if (!alreadyEnrolled) {
            classroom.students.push(req.user._id);
            await classroom.save();
        }

        const activeLecture = classroom.lectures.find(l => l.isLive);
        const liveRoomId = activeLecture ? activeLecture.liveRoomId : null;

        res.json({ success: true, classroom, alreadyEnrolled, liveRoomId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getClassrooms = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'teacher') query.teacher = req.user._id;
        else query.students = req.user._id;
        
        const classes = await Classroom.find(query).populate('teacher', 'name').populate('students', 'name avatar email stats');
        res.json({ success: true, classrooms: classes });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getClassroomDetails = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.classroomId)
            .populate('teacher', 'name email')
            .populate('students', 'name email avatar stats');
        if (!classroom) return res.status(404).json({ success: false, error: 'Classroom not found' });
        res.json({ success: true, classroom });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteClassroom = async (req, res) => {
    try {
        const classroom = await Classroom.findOneAndDelete({
            _id: req.params.classroomId,
            teacher: req.user._id
        });
        if (!classroom) return res.status(404).json({ success: false, error: 'Classroom not found or unauthorized' });
        
        // Clean up announcements associated with this classroom
        await Announcement.deleteMany({ classroom: req.params.classroomId });
        
        res.json({ success: true, message: 'Classroom deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Lectures Management ──
exports.scheduleLecture = async (req, res) => {
    try {
        const { title, description, scheduledStart, duration } = req.body;
        const classroom = await Classroom.findById(req.params.classroomId);
        if (!classroom) return res.status(404).json({ success: false, error: 'Classroom not found' });

        classroom.lectures.push({
            title,
            description,
            scheduledStart: new Date(scheduledStart),
            duration: parseInt(duration) || 60,
            isLive: false
        });
        await classroom.save();
        res.status(201).json({ success: true, classroom });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteLecture = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.classroomId);
        if (!classroom) return res.status(404).json({ success: false, error: 'Classroom not found' });

        classroom.lectures = classroom.lectures.filter(l => l._id.toString() !== req.params.lectureId);
        await classroom.save();
        res.json({ success: true, classroom });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.startLecture = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.classroomId);
        if (!classroom) return res.status(404).json({ success: false, error: 'Classroom not found' });

        const lecture = classroom.lectures.id(req.params.lectureId);
        if (!lecture) return res.status(404).json({ success: false, error: 'Lecture not found' });

        lecture.isLive = true;
        lecture.liveRoomId = `${classroom.code}-${lecture._id}`;
        await classroom.save();

        // Notify enrolled students
        if (classroom.students && classroom.students.length > 0) {
            await User.updateMany(
                { _id: { $in: classroom.students } },
                { $push: { notifications: {
                    message: `🎥 Live class "${lecture.title}" started for batch ${classroom.name}!`,
                    type: 'system',
                    read: false,
                    link: `/group-mode?roomId=${lecture.liveRoomId}`,
                    createdAt: new Date()
                }}}
            );
        }

        res.json({ success: true, liveRoomId: lecture.liveRoomId, classroom });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.stopLecture = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.classroomId);
        if (!classroom) return res.status(404).json({ success: false, error: 'Classroom not found' });

        const lecture = classroom.lectures.id(req.params.lectureId);
        if (!lecture) return res.status(404).json({ success: false, error: 'Lecture not found' });

        lecture.isLive = false;
        await classroom.save();
        res.json({ success: true, classroom });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Announcements ──
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, classroomId } = req.body;
        const announcement = new Announcement({
            title, content, classroom: classroomId || null, teacher: req.user._id
        });
        await announcement.save();

        // Notify students
        let targetStudents = [];
        if (classroomId) {
            const cls = await Classroom.findById(classroomId);
            if (cls) targetStudents = cls.students;
        }
        
        if (targetStudents.length > 0) {
            await User.updateMany(
                { _id: { $in: targetStudents } },
                { $push: { notifications: {
                    message: `📢 Announcement: ${title}`, type: 'system', read: false, createdAt: new Date()
                }}}
            );
        }

        res.status(201).json({ success: true, announcement });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAnnouncements = async (req, res) => {
    try {
        let classes = [];
        if (req.user.role === 'student') {
            const studentClasses = await Classroom.find({ students: req.user._id });
            classes = studentClasses.map(c => c._id);
        }
        
        const query = req.user.role === 'teacher' 
            ? { teacher: req.user._id } 
            : { $or: [{ classroom: null }, { classroom: { $in: classes } }] };

        const announcements = await Announcement.find(query)
            .populate('teacher', 'name avatar')
            .populate('classroom', 'name')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, announcements });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getClassroomAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ classroom: req.params.classroomId })
            .populate('teacher', 'name avatar')
            .sort({ createdAt: -1 });
        res.json({ success: true, announcements });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── AI Quiz Insight ──
exports.getQuizInsight = async (req, res) => {
    try {
        const { quizData } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY_QUIZ || process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) return res.status(503).json({ success: false, error: 'AI not configured' });

        const prompt = `Analyze this quiz performance data: ${JSON.stringify(quizData)}. 
Identify which specific concepts the students are struggling with the most, and provide 2 actionable recommendations for the teacher. Keep it under 3 sentences.`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen/qwen3.6-27b',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 150
            })
        });

        const data = await groqRes.json();
        const insight = data.choices?.[0]?.message?.content?.trim() || "Unable to generate insight.";
        res.json({ success: true, insight });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ── Student Progress ──
exports.getStudentProgress = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const student = await User.findById(studentId).select('-password');
        if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
        
        res.json({ success: true, student });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
