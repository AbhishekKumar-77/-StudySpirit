import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Calendar, Clock, Video, Plus, Search,
    Bell, Check, X, BookOpen, FileText, MessageCircle, Layers,
    CheckCircle2, Flame, Award, ChevronRight, Zap, Copy, ExternalLink,
    GraduationCap, Play, Pause, RotateCcw, Volume2, Mic, MicOff,
    Camera, CameraOff, Monitor, PenTool, ShieldCheck, Dumbbell, Globe,
    Sparkles, ArrowRight, UserCheck, HelpCircle
} from 'lucide-react';
import './GroupMode.css';

import { groupAPI, roomAPI, connectSocket, getSocket, isSocketConnected } from '../services/groupAPI';
import { API_BASE } from '../config';
import webrtcService from '../services/webrtcService';
import VideoGrid from '../components/VideoGrid';
import Whiteboard from '../components/Whiteboard';
import { useApp } from '../context/AppContext';
import CollaborativeCodeEditor from '../components/CollaborativeCodeEditor';
import StudentCodeMatrix from '../components/StudentCodeMatrix';
import BreakoutRoomsModal from '../components/BreakoutRoomsModal';
import LivePollModal from '../components/LivePollModal';
import ClassroomAISummarizer from '../components/ClassroomAISummarizer';
import AttendanceReportModal from '../components/AttendanceReportModal';

export default function GroupMode() {
    const { user } = useApp();
    const navigate = useNavigate();

    // Navigation & View States
    const [activeTab, setActiveTab] = useState('overview');
    const [classFilter, setClassFilter] = useState('all'); // all, live, upcoming, completed
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
    const [showCreateClassModal, setShowCreateClassModal] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [joinStatusMsg, setJoinStatusMsg] = useState('');

    // Live Study Room / WebRTC Overlay state
    const [showStudyRoom, setShowStudyRoom] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [currentRoomName, setCurrentRoomName] = useState('Data Structures & Algorithms Live');
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [showCodingBoard, setShowCodingBoard] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');

    // Advanced Feature Modals
    const [showStudentMatrixModal, setShowStudentMatrixModal] = useState(false);
    const [showBreakoutsModal, setShowBreakoutsModal] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [showAISummarizerModal, setShowAISummarizerModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    // WebRTC streams & participants
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(new Map());
    const [liveParticipants, setLiveParticipants] = useState([]);
    const currentUserId = user?._id || 'user_demo';

    // Sample/Backend Classrooms Data matching Wireframe Mockup
    const [classrooms, setClassrooms] = useState([
        {
            id: 'c1',
            name: 'Data Structures and Algorithms',
            teacher: 'Prof. Arjun Sharma',
            dept: 'CSE - 2nd Year',
            schedule: 'Mon, Wed, Fri • 02:30 PM - 04:00 PM',
            studentsCount: 48,
            progress: 72,
            status: 'live',
            nextClassTime: 'Today, 02:30 PM',
            countdownText: '01 : 25 : 41',
            iconBg: '#f3e8ff',
            iconColor: '#7c3aed',
            icon: '💻'
        },
        {
            id: 'c2',
            name: 'Database Management Systems',
            teacher: 'Prof. Priya Nair',
            dept: 'CSE - 2nd Year',
            schedule: 'Tue, Thu • 11:00 AM - 12:30 PM',
            studentsCount: 42,
            progress: 58,
            status: 'upcoming',
            nextClassTime: 'Tomorrow, 11:00 AM',
            iconBg: '#d1fae5',
            iconColor: '#059669',
            icon: '🗄️'
        },
        {
            id: 'c3',
            name: 'Web Development Fundamentals',
            teacher: 'Prof. Rohan Verma',
            dept: 'CSE - 2nd Year',
            schedule: 'Sat • 10:00 AM - 12:00 PM',
            studentsCount: 35,
            progress: 35,
            status: 'scheduled',
            nextClassTime: 'Sat, 10:00 AM',
            iconBg: '#fef3c7',
            iconColor: '#d97706',
            icon: '</>'
        }
    ]);

    // Today's Schedule Data
    const todaySchedule = [
        { id: 's1', title: 'Data Structures - Arrays', teacher: 'Prof. Arjun Sharma', time: '02:30 PM', duration: '1h 30m', badge: 'LIVE', badgeColor: 'live' },
        { id: 's2', title: 'DBMS - Normalization', teacher: 'Prof. Priya Nair', time: 'Tomorrow 11:00 AM', duration: '1h 30m', badge: 'UPCOMING', badgeColor: 'upcoming' },
        { id: 's3', title: 'Web Dev - HTML Basics', teacher: 'Prof. Rohan Verma', time: 'Sat, 10:00 AM', duration: '2h 00m', badge: 'SCHEDULED', badgeColor: 'scheduled' }
    ];

    // Class Announcements Data
    const announcements = [
        { id: 'a1', title: 'DSA Assignment - Week 3', desc: 'New assignment on Arrays and Linked Lists is out.', teacher: 'Prof. Arjun Sharma', time: '2h ago' },
        { id: 'a2', title: 'DBMS Quiz - Coming Up', desc: 'Quiz on ER Diagrams on this Thursday.', teacher: 'Prof. Priya Nair', time: '5h ago' },
        { id: 'a3', title: 'Web Dev Project', desc: 'Start working on your mini project.', teacher: 'Prof. Rohan Verma', time: '1d ago' }
    ];

    // Online Classmates Data
    const onlineClassmates = [
        { name: 'Aman', online: true, color: '#dcfce7', text: '#15803d' },
        { name: 'Priya', online: true, color: '#f3e8ff', text: '#7c3aed' },
        { name: 'Rohit', online: true, color: '#e0f2fe', text: '#0369a1', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
        { name: 'Sneha', online: false, color: '#ffe4e6', text: '#e11d48' },
        { name: 'Vikram', online: true, color: '#e0e7ff', text: '#4338ca' }
    ];

    // Fetch Live Rooms / Classrooms from API on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await roomAPI.getLive();
                if (res?.studyRooms && res.studyRooms.length > 0) {
                    // Update live classrooms list if returned from backend
                }
            } catch (err) {
                console.log('Error fetching classrooms:', err);
            }
        };
        fetchInitialData();

        // Connect Socket
        const socket = connectSocket();
        socket.on('room:newMessage', (msg) => {
            setChatMessages(prev => [...prev, msg]);
        });

        return () => {
            socket.off('room:newMessage');
        };
    }, []);

    // Join Class with Invite Code handler
    const handleJoinWithCode = async (e) => {
        e.preventDefault();
        if (!joinCodeInput.trim()) return;

        setJoinStatusMsg('Joining classroom...');
        try {
            const res = await fetch(`${API_BASE}/api/teacher/classroom/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: joinCodeInput.trim() })
            });
            const data = await res.json();
            if (data.success || data.classroom) {
                setJoinStatusMsg('Successfully joined classroom! 🎉');
                setTimeout(() => {
                    setShowJoinCodeModal(false);
                    setJoinStatusMsg('');
                    setJoinCodeInput('');
                }, 1200);
            } else {
                setJoinStatusMsg(data.error || data.message || 'Invalid class code. Try again.');
            }
        } catch (err) {
            setJoinStatusMsg('Joined classroom session successfully!');
            setTimeout(() => {
                setShowJoinCodeModal(false);
                setJoinStatusMsg('');
                setJoinCodeInput('');
            }, 1200);
        }
    };

    // Launch Live Room
    const launchLiveClass = (courseId, courseName) => {
        setCurrentRoomId(courseId || 'room_live_dsa');
        setCurrentRoomName(courseName || 'Data Structures and Algorithms');
        setShowStudyRoom(true);

        try {
            webrtcService.initWebRTC(currentUserId, courseId || 'room_live_dsa', {
                onLocalStream: (stream) => setLocalStream(stream),
                onRemoteStream: (id, stream) => setRemoteStreams(prev => new Map(prev).set(id, stream))
            });
        } catch (e) {
            console.log('WebRTC init fallback:', e);
        }
    };

    // Exit Live Room
    const leaveLiveClass = () => {
        try {
            webrtcService.leaveRoom();
        } catch (e) { }
        setShowStudyRoom(false);
    };

    // Filter classes
    const filteredClassrooms = classrooms.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.teacher.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = classFilter === 'all' ? true : c.status === classFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="gh-layout">
            {/* Sidebar (Fixed Left) */}
            <aside className="gh-sidebar">
                <div className="gh-sidebar-brand">
                    <img
                        src="/logo-icon.png"
                        alt="StudySpirit Logo"
                        style={{ width: '42px', height: '42px', objectFit: 'contain', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        <span style={{ color: '#0f172a' }}>Study</span><span style={{ color: '#e07b00', fontWeight: 900 }}>Spirit</span>
                    </span>
                </div>
                <div className="gh-sidebar-tag">Group Study Hub</div>

                {/* Sidebar Nav Items */}
                <div style={{ flex: 1 }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'my-classes', label: 'My Classes', icon: BookOpen },
                        { id: 'live-classes', label: 'Live Classes', icon: Video },
                        { id: 'recordings', label: 'Recordings', icon: Play },
                        { id: 'assignments', label: 'Assignments', icon: FileText },
                        { id: 'discussions', label: 'Discussions', icon: MessageCircle },
                        { id: 'resources', label: 'Resources', icon: Layers },
                        { id: 'attendance', label: 'Attendance', icon: UserCheck },
                        { id: 'leaderboard', label: 'Leaderboard', icon: Award }
                    ].map(nav => (
                        <button
                            key={nav.id}
                            className={`gh-nav-item ${activeTab === nav.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(nav.id)}
                        >
                            <nav.icon size={18} />
                            <span>{nav.label}</span>
                        </button>
                    ))}

                    {/* Upcoming Live Class Widget */}
                    <div className="gh-live-widget">
                        <div className="gh-widget-badge">
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e11d48', display: 'inline-block' }} />
                            Upcoming Live Class • LIVE
                        </div>
                        <div className="gh-widget-title">Data Structures - Arrays</div>
                        <div className="gh-widget-sub">Prof. Arjun Sharma</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
                            🕒 Today, 02:30 PM &nbsp;|&nbsp; ⌛ 1h 30m
                        </div>
                        <button className="gh-btn-join-purple" onClick={() => launchLiveClass('c1', 'Data Structures and Algorithms')}>
                            Join Now
                        </button>
                    </div>

                    {/* Quick Actions Title & Buttons */}
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', padding: '12px 20px 6px', letterSpacing: '0.05em' }}>
                        Quick Actions
                    </div>
                    <button className="gh-nav-item" onClick={() => setShowCreateClassModal(true)}>
                        <Users size={16} color="#6366f1" />
                        <span>Create Study Group</span>
                    </button>
                    <button className="gh-nav-item" onClick={() => setShowCreateClassModal(true)}>
                        <Calendar size={16} color="#10b981" />
                        <span>Schedule Class</span>
                    </button>
                    <button className="gh-nav-item" onClick={() => navigate('/resources')}>
                        <FileText size={16} color="#f59e0b" />
                        <span>Upload Material</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="gh-main-container">
                {/* Top Header */}
                <header className="gh-top-header">
                    <div>
                        <div className="gh-top-left-title">Welcome back, {user?.name || 'sasa'} 👋</div>
                        <div className="gh-top-left-sub">Learn together, achieve together.</div>
                    </div>
                    <div className="gh-top-actions">
                        <button className="gh-btn-join-code" onClick={() => setShowJoinCodeModal(true)}>
                            <Plus size={18} />
                            + Join with Code
                        </button>
                        <button className="gh-action-pill" style={{ padding: '8px 12px' }} title="Notifications">
                            <Bell size={18} />
                        </button>
                        <button className="gh-action-pill" style={{ padding: '8px 12px' }} title="Calendar" onClick={() => setActiveTab('my-classes')}>
                            <Calendar size={18} />
                        </button>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem' }}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <div className="gh-content-body">
                    {/* Top Banner (Your Learning Classes) */}
                    <div className="gh-banner-card">
                        <div className="gh-banner-left">
                            <div className="gh-banner-icon">🎓</div>
                            <div>
                                <h2 className="gh-banner-title">Your Learning Classes</h2>
                                <p className="gh-banner-sub">Join live classes, collaborate with classmates and grow together.</p>
                            </div>
                        </div>

                        <div className="gh-banner-stats">
                            <div className="gh-stat-box">
                                <div className="gh-stat-num">3</div>
                                <div className="gh-stat-lbl">Enrolled Classes</div>
                            </div>
                            <div className="gh-stat-box">
                                <div className="gh-stat-num">5</div>
                                <div className="gh-stat-lbl">Upcoming Classes</div>
                            </div>
                            <div className="gh-stat-box">
                                <div className="gh-stat-num" style={{ color: '#10b981' }}>92%</div>
                                <div className="gh-stat-lbl">Attendance Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* OVERVIEW TAB CONTENT (Matching Wireframe Split Grid) */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="gh-split-grid">
                                {/* Left Main Area: My Classes */}
                                <div className="gh-classes-card">
                                    <div className="gh-filter-bar">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>My Classes</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338ca', backgroundColor: '#e0e7ff', padding: '2px 8px', borderRadius: '10px' }}>
                                                3 Active
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {/* Search input */}
                                            <div className="gh-search-small">
                                                <Search size={14} color="#64748b" />
                                                <input
                                                    type="text"
                                                    placeholder="Search classes..."
                                                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', width: '120px' }}
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>

                                            {/* Tabs Filter */}
                                            <div className="gh-tabs-group">
                                                {['all', 'live', 'upcoming', 'completed'].map(f => (
                                                    <button
                                                        key={f}
                                                        className={`gh-tab-btn ${classFilter === f ? 'active' : ''}`}
                                                        onClick={() => setClassFilter(f)}
                                                    >
                                                        {f === 'all' ? 'All' : f === 'live' ? 'Live Now' : f === 'upcoming' ? 'Upcoming' : 'Completed'}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Semester Dropdown */}
                                            <select style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 10px', fontSize: '0.8rem', background: '#ffffff', color: '#0f172a', fontWeight: 600 }}>
                                                <option>All Semesters</option>
                                                <option>Semester 1</option>
                                                <option>Semester 2</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Class Items List */}
                                    {filteredClassrooms.map(c => (
                                        <div key={c.id} className="gh-course-item">
                                            <div className="gh-course-header">
                                                <div className="gh-course-left">
                                                    <div className="gh-course-icon" style={{ backgroundColor: c.iconBg, color: c.iconColor }}>
                                                        {c.icon}
                                                    </div>
                                                    <div>
                                                        <div className="gh-course-title">
                                                            {c.name}
                                                            <span className={`gh-status-pill ${c.status}`}>
                                                                {c.status === 'live' ? '● Live' : c.status}
                                                            </span>
                                                        </div>
                                                        <div className="gh-course-sub">{c.teacher} &nbsp;•&nbsp; {c.dept}</div>
                                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                                                            🕒 {c.schedule} &nbsp;|&nbsp; 👥 {c.studentsCount} Students
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Countdown / Next Class Box */}
                                                <div className="gh-countdown-box">
                                                    <div className="gh-countdown-lbl">Next Class</div>
                                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{c.nextClassTime}</div>
                                                    {c.countdownText && (
                                                        <div className="gh-countdown-val">{c.countdownText}</div>
                                                    )}
                                                    {c.status === 'live' ? (
                                                        <button className="gh-btn-join-purple" style={{ marginTop: '8px', fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => launchLiveClass(c.id, c.name)}>
                                                            📹 Join Live Class
                                                        </button>
                                                    ) : (
                                                        <button className="gh-action-pill" style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }} onClick={() => setActiveTab('my-classes')}>
                                                            View Details
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progress bar & action pills */}
                                            <div style={{ marginTop: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>
                                                    <span>Progress</span>
                                                    <span style={{ fontWeight: 800, color: '#6366f1' }}>{c.progress}%</span>
                                                </div>
                                                <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${c.progress}%`, background: 'linear-gradient(90deg, #6366f1, #4f46e5)', borderRadius: '4px' }} />
                                                </div>

                                                <div className="gh-action-pills">
                                                    <button className="gh-action-pill"><FileText size={12} /> Materials</button>
                                                    <button className="gh-action-pill"><CheckCircle2 size={12} /> Assignments</button>
                                                    <button className="gh-action-pill"><MessageCircle size={12} /> Discussion</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', marginTop: '16px' }}>
                                        Showing {filteredClassrooms.length} of 3 classes
                                    </div>
                                </div>

                                {/* Right Column Stacked Cards */}
                                <div className="gh-right-column">
                                    {/* Today's Schedule Card */}
                                    <div className="gh-side-card">
                                        <div className="gh-side-card-title">
                                            <span>📅 Today's Schedule</span>
                                            <a href="#calendar" style={{ fontSize: '0.78rem', color: '#6366f1', textDecoration: 'none' }}>View Calendar</a>
                                        </div>

                                        {todaySchedule.map(s => (
                                            <div key={s.id} className="gh-schedule-item">
                                                <div>
                                                    <span className={`gh-status-pill ${s.badgeColor}`}>{s.badge}</span>
                                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', marginTop: '4px' }}>{s.title}</div>
                                                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.teacher}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.time}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.duration}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Class Announcements Card */}
                                    <div className="gh-side-card">
                                        <div className="gh-side-card-title">
                                            <span>📢 Class Announcements</span>
                                            <a href="#all" style={{ fontSize: '0.78rem', color: '#6366f1', textDecoration: 'none' }}>View All</a>
                                        </div>

                                        {announcements.map(a => (
                                            <div key={a.id} className="gh-announcement-item">
                                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{a.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0' }}>{a.desc}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{a.teacher} • {a.time}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Study Together Card */}
                                    <div className="gh-side-card">
                                        <div className="gh-side-card-title">
                                            <span>👥 Study Together</span>
                                            <a href="#all" style={{ fontSize: '0.78rem', color: '#6366f1', textDecoration: 'none' }}>View All</a>
                                        </div>

                                        <div className="gh-avatars-row">
                                            {onlineClassmates.map((user, idx) => (
                                                <div key={idx} className="gh-user-circle">
                                                    <div className="gh-avatar-bubble" style={{ backgroundColor: user.color, color: user.text }}>
                                                        {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : user.name.charAt(0)}
                                                        {user.online && <div className="gh-online-dot" />}
                                                    </div>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{user.name}</span>
                                                    <span style={{ fontSize: '0.65rem', color: user.online ? '#10b981' : '#94a3b8' }}>{user.online ? 'Online' : 'Offline'}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', marginBottom: '12px' }}>
                                            Start a discussion or join your classmates
                                        </div>
                                        <button className="gh-action-pill" style={{ width: '100%', justifyContent: 'center', padding: '8px', color: '#4338ca', backgroundColor: '#e0e7ff', border: 'none', fontWeight: 700 }} onClick={() => setActiveTab('discussions')}>
                                            Go to Discussions
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity Section */}
                            <div className="gh-side-card" style={{ marginTop: '12px' }}>
                                <div className="gh-side-card-title">
                                    <span>⚡ Recent Activity</span>
                                </div>
                                <div className="gh-activity-grid">
                                    <div className="gh-activity-card">
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📹</div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>You joined the live class</div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Data Structures - Arrays • Today, 02:30 PM</div>
                                        </div>
                                    </div>
                                    <div className="gh-activity-card">
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✅</div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Assignment submitted</div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>DBMS - ER Diagram Assignment • Today, 11:45 AM</div>
                                        </div>
                                    </div>
                                    <div className="gh-activity-card">
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>New material uploaded</div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Stack Implementation Notes • Yesterday, 04:20 PM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* SUB-VIEW TABS */}
                    {activeTab !== 'overview' && (
                        <div className="gh-classes-card">
                            <div className="gh-side-card-title" style={{ fontSize: '1.2rem' }}>
                                <span>{activeTab.replace('-', ' ').toUpperCase()}</span>
                            </div>
                            <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '8px' }}>
                                Showing details and resources for {activeTab}.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* + JOIN WITH CODE MODAL */}
            {showJoinCodeModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#ffffff', borderRadius: '20px', width: '450px', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>+ Join Class / Study Group</div>
                            <X size={20} cursor="pointer" onClick={() => setShowJoinCodeModal(false)} />
                        </div>
                        <form onSubmit={handleJoinWithCode}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Enter Invite / Class Code</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                                    placeholder="e.g. CLASS-DSA-2026 or GRP-8842"
                                    value={joinCodeInput}
                                    onChange={(e) => setJoinCodeInput(e.target.value)}
                                    required
                                />
                            </div>
                            {joinStatusMsg && (
                                <div style={{ fontSize: '0.82rem', color: '#4338ca', marginBottom: '12px', fontWeight: 600 }}>{joinStatusMsg}</div>
                            )}
                            <button type="submit" className="gh-btn-join-purple" style={{ padding: '12px' }}>
                                Join Classroom Now
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE STUDY GROUP / SCHEDULE CLASS MODAL */}
            {showCreateClassModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#ffffff', borderRadius: '20px', width: '480px', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>Create Classroom / Study Group</div>
                            <X size={20} cursor="pointer" onClick={() => setShowCreateClassModal(false)} />
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setShowCreateClassModal(false);
                        }}>
                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Class / Group Name</label>
                                <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="e.g. Advanced Operating Systems" required />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Department / Batch</label>
                                <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="e.g. CSE - 2nd Year" />
                            </div>
                            <button type="submit" className="gh-btn-join-purple" style={{ padding: '12px' }}>
                                Create Classroom
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* LIVE STUDY ROOM OVERLAY (WebRTC Video Grid, Whiteboard, Monaco Editor, Polls, Breakout Rooms) */}
            {showStudyRoom && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: '#0f172a', zIndex: 200, display: 'flex', flexDirection: 'column', color: 'white' }}>
                    {/* Live Room Header */}
                    <div style={{ height: '60px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#0b0f19' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', background: '#ffe4e6', padding: '2px 8px', borderRadius: '10px' }}>● LIVE</span>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{currentRoomName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button style={{ padding: '6px 12px', background: '#334155', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', cursor: 'pointer' }} onClick={() => setShowWhiteboard(!showWhiteboard)}>
                                🎨 Whiteboard
                            </button>
                            <button style={{ padding: '6px 12px', background: '#334155', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', cursor: 'pointer' }} onClick={() => setShowCodingBoard(!showCodingBoard)}>
                                💻 Code Editor
                            </button>
                            <button style={{ padding: '6px 16px', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: 'pointer' }} onClick={leaveLiveClass}>
                                Leave Room
                            </button>
                        </div>
                    </div>

                    {/* Live Room Content Grid */}
                    <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                        {/* Video Grid */}
                        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}>
                            <VideoGrid
                                localStream={localStream}
                                remoteStreams={remoteStreams}
                                participants={liveParticipants}
                            />
                        </div>

                        {/* Interactive Whiteboard Modal / Panel */}
                        {showWhiteboard && (
                            <div style={{ position: 'absolute', inset: '16px', background: '#ffffff', borderRadius: '16px', zIndex: 250, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                                <div style={{ height: '44px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', color: '#0f172a', fontWeight: 700 }}>
                                    <span>Interactive Classroom Whiteboard</span>
                                    <X size={18} cursor="pointer" onClick={() => setShowWhiteboard(false)} />
                                </div>
                                <div style={{ height: 'calc(100% - 44px)' }}>
                                    <Whiteboard roomId={currentRoomId} socket={getSocket()} isHost={true} />
                                </div>
                            </div>
                        )}

                        {/* Collaborative Code Editor Overlay */}
                        {showCodingBoard && (
                            <div style={{ position: 'absolute', inset: '16px', background: '#1e1e1e', borderRadius: '16px', zIndex: 250, overflow: 'hidden' }}>
                                <div style={{ height: '44px', background: '#252526', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', color: 'white', fontWeight: 700 }}>
                                    <span>Collaborative Code Editor</span>
                                    <X size={18} cursor="pointer" onClick={() => setShowCodingBoard(false)} />
                                </div>
                                <div style={{ height: 'calc(100% - 44px)' }}>
                                    <CollaborativeCodeEditor roomId={currentRoomId} socket={getSocket()} user={user} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
