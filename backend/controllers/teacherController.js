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
        const existing = await Classroom.findOne({ code });
        if (existing) return res.status(400).json({ error: 'Class code already exists' });
        
        const newClass = new Classroom({
            name, description, code, teacher: req.user._id, students: []
        });
        await newClass.save();
        res.status(201).json(newClass);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.joinClassroom = async (req, res) => {
    try {
        const { code } = req.body;
        const classroom = await Classroom.findOne({ code });
        if (!classroom) return res.status(404).json({ error: 'Class not found' });
        
        if (!classroom.students.includes(req.user._id)) {
            classroom.students.push(req.user._id);
            await classroom.save();
        }
        res.json({ success: true, classroom });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getClassrooms = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'teacher') query.teacher = req.user._id;
        else query.students = req.user._id;
        
        const classes = await Classroom.find(query).populate('teacher', 'name').populate('students', 'name avatar');
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        } else {
            // All students? (For simplicity, just skipping the massive update here, or doing it conditionally)
        }
        
        if (targetStudents.length > 0) {
            await User.updateMany(
                { _id: { $in: targetStudents } },
                { $push: { notifications: {
                    message: `📢 Announcement: ${title}`, type: 'system', read: false, createdAt: new Date()
                }}}
            );
        }

        res.status(201).json(announcement);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAnnouncements = async (req, res) => {
    try {
        // If student, get global announcements or announcements for their classes
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
            
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── AI Quiz Insight ──
exports.getQuizInsight = async (req, res) => {
    try {
        const { quizData } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY_QUIZ || process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) return res.status(503).json({ error: 'AI not configured' });

        const prompt = `Analyze this quiz performance data: ${JSON.stringify(quizData)}. 
Identify which specific concepts the students are struggling with the most, and provide 2 actionable recommendations for the teacher. Keep it under 3 sentences.`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 150
            })
        });

        const data = await groqRes.json();
        const insight = data.choices?.[0]?.message?.content?.trim() || "Unable to generate insight.";
        res.json({ insight });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── Student Progress ──
exports.getStudentProgress = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const student = await User.findById(studentId).select('-password');
        if (!student) return res.status(404).json({ error: 'Student not found' });
        
        // Return full profile stats
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
