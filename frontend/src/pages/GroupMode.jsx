import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    const location = useLocation();

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
    const [currentRoomName, setCurrentRoomName] = useState('Live Classroom');
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
    
    const currentUserId = useMemo(() => {
        if (user?._id) return String(user._id);
        if (!window.__tempUserId) {
            window.__tempUserId = 'usr_' + Math.random().toString(36).substring(2, 9);
        }
        return window.__tempUserId;
    }, [user?._id]);

    // Listen for WebRTC remote streams & user disconnects
    useEffect(() => {
        const handleRemoteStream = (e) => {
            const { userId, stream } = e.detail;
            console.log('🎥 GroupMode UI: Received remote stream for', userId);
            setRemoteStreams(prev => new Map(prev).set(userId, stream));
            setLiveParticipants(prev => {
                if (prev.some(p => p.id === userId)) return prev;
                return [...prev, { id: userId, name: `Participant (${userId.slice(-4)})`, avatar: '👤', isMuted: false, isCameraOn: true }];
            });
        };

        const handleUserLeft = (e) => {
            const { userId } = e.detail;
            console.log('❌ GroupMode UI: User left room', userId);
            setRemoteStreams(prev => {
                const next = new Map(prev);
                next.delete(userId);
                return next;
            });
            setLiveParticipants(prev => prev.filter(p => p.id !== userId));
        };

        window.addEventListener('webrtc:remoteStream', handleRemoteStream);
        window.addEventListener('webrtc:userLeft', handleUserLeft);

        return () => {
            window.removeEventListener('webrtc:remoteStream', handleRemoteStream);
            window.removeEventListener('webrtc:userLeft', handleUserLeft);
        };
    }, []);

    // Real API Data States
    const [classrooms, setClassrooms] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loadingClassrooms, setLoadingClassrooms] = useState(true);

    // Online Classmates Data
    const onlineClassmates = [
        { name: 'Aman', online: true, color: '#dcfce7', text: '#15803d' },
        { name: 'Priya', online: true, color: '#f3e8ff', text: '#7c3aed' },
        { name: 'Rohit', online: true, color: '#e0f2fe', text: '#0369a1' },
        { name: 'Sneha', online: false, color: '#ffe4e6', text: '#e11d48' },
        { name: 'Vikram', online: true, color: '#e0e7ff', text: '#4338ca' }
    ];

    // Fetch Classrooms & Announcements from Backend API
    const fetchClassrooms = useCallback(async () => {
        setLoadingClassrooms(true);
        try {
            const res = await fetch(`${API_BASE}/teacher/classroom`, { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.classrooms) {
                const formatted = data.classrooms.map((c, index) => {
                    const activeLecture = c.lectures?.find(l => l.isLive);
                    const nextLecture = c.lectures?.find(l => !l.isLive);
                    
                    const colors = [
                        { bg: '#f3e8ff', text: '#7c3aed', icon: '💻' },
                        { bg: '#d1fae5', text: '#059669', icon: '🗄️' },
                        { bg: '#fef3c7', text: '#d97706', icon: '</>' },
                        { bg: '#eff6ff', text: '#2563eb', icon: '⚡' }
                    ];
                    const colorScheme = colors[index % colors.length];

                    return {
                        id: c._id,
                        code: c.code,
                        name: c.name,
                        teacher: c.teacher?.name ? `Prof. ${c.teacher.name}` : 'Instructor',
                        dept: c.description || 'University Course',
                        schedule: nextLecture ? `Next: ${new Date(nextLecture.scheduledStart).toLocaleDateString()} ${new Date(nextLecture.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Regular Schedule',
                        studentsCount: c.students?.length || 0,
                        progress: 65,
                        status: activeLecture ? 'live' : (nextLecture ? 'upcoming' : 'scheduled'),
                        liveRoomId: activeLecture ? activeLecture.liveRoomId : null,
                        activeLectureTitle: activeLecture ? activeLecture.title : null,
                        nextClassTime: nextLecture ? new Date(nextLecture.scheduledStart).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'To be announced',
                        iconBg: colorScheme.bg,
                        iconColor: colorScheme.text,
                        icon: colorScheme.icon,
                        rawClassroom: c
                    };
                });
                setClassrooms(formatted);
            }
        } catch (err) {
            console.error('Error fetching student classrooms:', err);
        } finally {
            setLoadingClassrooms(false);
        }
    }, []);

    const fetchAnnouncements = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/teacher/announcement`, { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.announcements) {
                const formatted = data.announcements.map(a => ({
                    id: a._id,
                    title: a.title,
                    desc: a.content,
                    teacher: a.teacher?.name ? `Prof. ${a.teacher.name}` : 'Instructor',
                    time: new Date(a.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    classroomName: a.classroom?.name || 'Global'
                }));
                setAnnouncements(formatted);
            }
        } catch (err) {
            console.error('Error fetching announcements:', err);
        }
    }, []);

    // Effect on Mount & URL query parsing
    useEffect(() => {
        fetchClassrooms();
        fetchAnnouncements();

        // Connect Socket
        const socket = connectSocket();
        socket.on('room:newMessage', (msg) => {
            setChatMessages(prev => [...prev, msg]);
        });

        // Parse ?roomId= query param for auto-launch live session
        const queryParams = new URLSearchParams(location.search);
        const roomIdParam = queryParams.get('roomId');
        if (roomIdParam) {
            launchLiveClass(roomIdParam, 'Live Lecture Room');
        }

        return () => {
            socket.off('room:newMessage');
        };
    }, [fetchClassrooms, fetchAnnouncements, location.search]);

    // Derived Schedule Data from Enrolled Classrooms
    const todaySchedule = useMemo(() => {
        const schedule = [];
        classrooms.forEach(c => {
            const lectures = c.rawClassroom?.lectures || [];
            lectures.forEach(l => {
                schedule.push({
                    id: l._id,
                    title: `${c.name} - ${l.title}`,
                    teacher: c.teacher,
                    time: new Date(l.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    duration: `${l.duration || 60}m`,
                    badge: l.isLive ? 'LIVE' : 'UPCOMING',
                    badgeColor: l.isLive ? 'live' : 'upcoming',
                    liveRoomId: l.liveRoomId,
                    isLive: l.isLive
                });
            });
        });
        return schedule.slice(0, 5);
    }, [classrooms]);

    // Join Class with Invite Code handler
    const handleJoinWithCode = async (e) => {
        e.preventDefault();
        if (!joinCodeInput.trim()) return;

        setJoinStatusMsg('Joining classroom...');
        try {
            const res = await fetch(`${API_BASE}/teacher/classroom/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: joinCodeInput.trim().toUpperCase() }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success || data.classroom) {
                setJoinStatusMsg('Successfully joined classroom! 🎉');
                fetchClassrooms();
                setTimeout(() => {
                    setShowJoinCodeModal(false);
                    setJoinStatusMsg('');
                    setJoinCodeInput('');
                }, 1000);
            } else {
                setJoinStatusMsg(data.error || data.message || 'Invalid class code. Try again.');
            }
        } catch (err) {
            setJoinStatusMsg('Error joining classroom. Check your connection.');
        }
    };

    // Launch Live Room WebRTC Session
    const launchLiveClass = async (courseId, courseName) => {
        const targetRoomId = courseId || 'room_live_default';
        setCurrentRoomId(targetRoomId);
        setCurrentRoomName(courseName || 'Live Classroom');
        setShowStudyRoom(true);

        try {
            const stream = await webrtcService.initializeLocalMedia({ video: true, audio: true });
            setLocalStream(stream);
            await webrtcService.joinRoom(targetRoomId, currentUserId, true);
        } catch (e) {
            console.log('WebRTC init fallback:', e);
        }
    };

    // Toggle Mic/Camera/Screen Share
    const toggleMic = () => {
        const nextState = !isMicOn;
        setIsMicOn(nextState);
        webrtcService.toggleMicrophone(nextState);
    };

    const toggleCam = () => {
        const nextState = !isCameraOn;
        setIsCameraOn(nextState);
        webrtcService.toggleCamera(nextState);
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                await webrtcService.startScreenShare();
                setIsScreenSharing(true);
            } catch (err) { console.error(err); }
        } else {
            webrtcService.stopScreenShare();
            setIsScreenSharing(false);
        }
    };

    // Exit Live Room
    const leaveLiveClass = () => {
        try {
            webrtcService.leaveRoom();
        } catch (e) { }
        setShowStudyRoom(false);
        setLocalStream(null);
    };

    // Filter classes
    const filteredClassrooms = classrooms.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.teacher.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = classFilter === 'all' ? true : c.status === classFilter;
        return matchesSearch && matchesFilter;
    });

    const activeLiveClass = classrooms.find(c => c.status === 'live');

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

                    {/* Upcoming / Active Live Class Widget */}
                    <div className="gh-live-widget">
                        <div className="gh-widget-badge">
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: activeLiveClass ? '#e11d48' : '#3b82f6', display: 'inline-block' }} />
                            {activeLiveClass ? 'LIVE CLASS NOW' : 'Next Scheduled Class'}
                        </div>
                        <div className="gh-widget-title">{activeLiveClass ? activeLiveClass.name : (classrooms[0]?.name || 'Web Development')}</div>
                        <div className="gh-widget-sub">{activeLiveClass ? activeLiveClass.teacher : (classrooms[0]?.teacher || 'Instructor')}</div>
                        <button
                            className="gh-btn-join-purple"
                            style={{ marginTop: '10px' }}
                            onClick={() => launchLiveClass(activeLiveClass?.liveRoomId || 'room_live_demo', activeLiveClass?.name || 'Live Class')}
                        >
                            {activeLiveClass ? '📹 Join Live Class Now' : 'Join Classroom Room'}
                        </button>
                    </div>

                    {/* Quick Actions Title & Buttons */}
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', padding: '12px 20px 6px', letterSpacing: '0.05em' }}>
                        Quick Actions
                    </div>
                    <button className="gh-nav-item" onClick={() => setShowJoinCodeModal(true)}>
                        <Plus size={16} color="#6366f1" />
                        <span>Join with Code</span>
                    </button>
                    <button className="gh-nav-item" onClick={() => navigate('/resources')}>
                        <FileText size={16} color="#f59e0b" />
                        <span>Study Resources</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="gh-main-container">
                {/* Top Header */}
                <header className="gh-top-header">
                    <div>
                        <div className="gh-top-left-title">Welcome back, {user?.name || 'Student'} 👋</div>
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
                                <h2 className="gh-banner-title">Your Enrolled Batches & Classes</h2>
                                <p className="gh-banner-sub">Join live classes, collaborate with classmates and track your progress.</p>
                            </div>
                        </div>

                        <div className="gh-banner-stats">
                            <div className="gh-stat-box">
                                <div className="gh-stat-num">{classrooms.length}</div>
                                <div className="gh-stat-lbl">Enrolled Batches</div>
                            </div>
                            <div className="gh-stat-box">
                                <div className="gh-stat-num" style={{ color: activeLiveClass ? '#e11d48' : '#6366f1' }}>
                                    {activeLiveClass ? 1 : 0}
                                </div>
                                <div className="gh-stat-lbl">Live Classes Now</div>
                            </div>
                            <div className="gh-stat-box">
                                <div className="gh-stat-num" style={{ color: '#10b981' }}>95%</div>
                                <div className="gh-stat-lbl">Attendance Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* OVERVIEW TAB CONTENT */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="gh-split-grid">
                                {/* Left Main Area: My Classes */}
                                <div className="gh-classes-card">
                                    <div className="gh-filter-bar">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>My Enrolled Batches</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338ca', backgroundColor: '#e0e7ff', padding: '2px 8px', borderRadius: '10px' }}>
                                                {classrooms.length} Active
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
                                                {['all', 'live', 'upcoming', 'scheduled'].map(f => (
                                                    <button
                                                        key={f}
                                                        className={`gh-tab-btn ${classFilter === f ? 'active' : ''}`}
                                                        onClick={() => setClassFilter(f)}
                                                    >
                                                        {f === 'all' ? 'All' : f === 'live' ? 'Live Now' : f === 'upcoming' ? 'Upcoming' : 'Scheduled'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Loading / Empty State or Real Classrooms List */}
                                    {loadingClassrooms ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                                            Loading your enrolled classrooms...
                                        </div>
                                    ) : filteredClassrooms.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                                            <GraduationCap size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>No Enrolled Classrooms Found</h3>
                                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 16px' }}>Ask your teacher for a Class Join Code to enroll in a batch.</p>
                                            <button className="gh-btn-join-purple" style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowJoinCodeModal(true)}>
                                                <Plus size={16} /> Enter Class Join Code
                                            </button>
                                        </div>
                                    ) : (
                                        filteredClassrooms.map(c => (
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
                                                                    {c.status === 'live' ? '● Live Now' : c.status}
                                                                </span>
                                                            </div>
                                                            <div className="gh-course-sub">{c.teacher} &nbsp;•&nbsp; Code: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{c.code}</span></div>
                                                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                                                                🕒 {c.schedule} &nbsp;|&nbsp; 👥 {c.studentsCount} Enrolled Students
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Countdown / Next Class Box */}
                                                    <div className="gh-countdown-box">
                                                        <div className="gh-countdown-lbl">Schedule</div>
                                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{c.nextClassTime}</div>
                                                        {c.status === 'live' ? (
                                                            <button className="gh-btn-join-purple" style={{ marginTop: '8px', fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => launchLiveClass(c.liveRoomId || c.id, c.name)}>
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
                                                        <span>Batch Completion Progress</span>
                                                        <span style={{ fontWeight: 800, color: '#6366f1' }}>{c.progress}%</span>
                                                    </div>
                                                    <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${c.progress}%`, background: 'linear-gradient(90deg, #6366f1, #4f46e5)', borderRadius: '4px' }} />
                                                    </div>

                                                    <div className="gh-action-pills">
                                                        <button className="gh-action-pill" onClick={() => navigate('/resources')}><FileText size={12} /> Materials</button>
                                                        <button className="gh-action-pill" onClick={() => setActiveTab('discussions')}><MessageCircle size={12} /> Class Discussion</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', marginTop: '16px' }}>
                                        Showing {filteredClassrooms.length} of {classrooms.length} batches
                                    </div>
                                </div>

                                {/* Right Column Stacked Cards */}
                                <div className="gh-right-column">
                                    {/* Today's Schedule Card */}
                                    <div className="gh-side-card">
                                        <div className="gh-side-card-title">
                                            <span>📅 Class Lectures Schedule</span>
                                        </div>

                                        {todaySchedule.length === 0 ? (
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '12px 0' }}>
                                                No lectures scheduled for today.
                                            </div>
                                        ) : (
                                            todaySchedule.map(s => (
                                                <div key={s.id} className="gh-schedule-item">
                                                    <div>
                                                        <span className={`gh-status-pill ${s.badgeColor}`}>{s.badge}</span>
                                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginTop: '4px' }}>{s.title}</div>
                                                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.teacher}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.time}</div>
                                                        {s.isLive && (
                                                            <button
                                                                className="gh-btn-join-purple"
                                                                style={{ padding: '4px 8px', fontSize: '0.72rem', marginTop: '4px' }}
                                                                onClick={() => launchLiveClass(s.liveRoomId, s.title)}
                                                            >
                                                                Join
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Class Announcements Card */}
                                    <div className="gh-side-card">
                                        <div className="gh-side-card-title">
                                            <span>📢 Batch Announcements</span>
                                        </div>

                                        {announcements.length === 0 ? (
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '12px 0' }}>
                                                No batch announcements posted yet.
                                            </div>
                                        ) : (
                                            announcements.slice(0, 4).map(a => (
                                                <div key={a.id} className="gh-announcement-item">
                                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{a.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0' }}>{a.desc}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{a.teacher} • {a.classroomName} • {a.time}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Study Together Card */}
                                    <div className="gh-side-card">
                                        <div className="gh-side-card-title">
                                            <span>👥 Online Classmates</span>
                                        </div>

                                        <div className="gh-avatars-row">
                                            {onlineClassmates.map((user, idx) => (
                                                <div key={idx} className="gh-user-circle">
                                                    <div className="gh-avatar-bubble" style={{ backgroundColor: user.color, color: user.text }}>
                                                        {user.name.charAt(0)}
                                                        {user.online && <div className="gh-online-dot" />}
                                                    </div>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{user.name}</span>
                                                    <span style={{ fontSize: '0.65rem', color: user.online ? '#10b981' : '#94a3b8' }}>{user.online ? 'Online' : 'Offline'}</span>
                                                </div>
                                            ))}
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
                                Details and resources for {activeTab}.
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
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>+ Join Batch with Class Code</div>
                            <X size={20} cursor="pointer" onClick={() => setShowJoinCodeModal(false)} />
                        </div>
                        <form onSubmit={handleJoinWithCode}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Enter Class Join Code</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                                    placeholder="e.g. CL-X89A2B"
                                    value={joinCodeInput}
                                    onChange={(e) => setJoinCodeInput(e.target.value)}
                                    required
                                />
                            </div>
                            {joinStatusMsg && (
                                <div style={{ fontSize: '0.82rem', color: '#4338ca', marginBottom: '12px', fontWeight: 600 }}>{joinStatusMsg}</div>
                            )}
                            <button type="submit" className="gh-btn-join-purple" style={{ padding: '12px' }}>
                                Enroll in Batch Now
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* LIVE STUDY ROOM OVERLAY (WebRTC Video Grid, Whiteboard, Monaco Editor, Controls) */}
            {showStudyRoom && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: '#0f172a', zIndex: 200, display: 'flex', flexDirection: 'column', color: 'white' }}>
                    {/* Live Room Header */}
                    <div style={{ height: '60px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#0b0f19' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', background: '#ffe4e6', padding: '2px 8px', borderRadius: '10px' }}>● LIVE CLASSROOM</span>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{currentRoomName}</span>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>(Room: {currentRoomId})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                style={{ padding: '6px 12px', background: isMicOn ? '#334155' : '#ef4444', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={toggleMic}
                            >
                                {isMicOn ? <Mic size={14} /> : <MicOff size={14} />} {isMicOn ? 'Mic On' : 'Muted'}
                            </button>

                            <button
                                style={{ padding: '6px 12px', background: isCameraOn ? '#334155' : '#ef4444', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={toggleCam}
                            >
                                {isCameraOn ? <Camera size={14} /> : <CameraOff size={14} />} {isCameraOn ? 'Cam On' : 'Cam Off'}
                            </button>

                            <button
                                style={{ padding: '6px 12px', background: isScreenSharing ? '#2563eb' : '#334155', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={toggleScreenShare}
                            >
                                <Monitor size={14} /> {isScreenSharing ? 'Sharing Screen' : 'Share Screen'}
                            </button>

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
                                currentUserId={currentUserId}
                                currentUserName={user?.name || 'You'}
                                currentUserAvatar={user?.avatar || '👤'}
                            />
                        </div>

                        {/* Interactive Whiteboard Overlay */}
                        {showWhiteboard && (
                            <div style={{ position: 'absolute', inset: '16px', background: '#ffffff', borderRadius: '16px', zIndex: 250, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                                <div style={{ height: '44px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', color: '#0f172a', fontWeight: 700 }}>
                                    <span>Interactive Classroom Whiteboard</span>
                                    <X size={18} cursor="pointer" onClick={() => setShowWhiteboard(false)} />
                                </div>
                                <div style={{ height: 'calc(100% - 44px)' }}>
                                    <Whiteboard roomId={currentRoomId} socket={getSocket()} isHost={user?.role === 'teacher'} />
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
