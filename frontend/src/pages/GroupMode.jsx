import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Calendar, Clock, Video, Plus, Search,
    Bell, Check, X, BookOpen, FileText, MessageCircle, Layers,
    CheckCircle2, Flame, Award, ChevronRight, Zap, Copy, ExternalLink,
    GraduationCap, Play, Pause, RotateCcw, Volume2, Mic, MicOff,
    Camera, CameraOff, Monitor, PenTool, ShieldCheck, Dumbbell, Globe,
    Sparkles, ArrowRight, UserCheck, HelpCircle, Hand, Paperclip, Send,
    File, Download, Image as ImageIcon, Lock, Shield, BarChart2
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

    const isHost = user?.role === 'teacher';

    // Navigation & View States
    const [activeTab, setActiveTab] = useState('overview');
    const [classFilter, setClassFilter] = useState('all'); // all, live, upcoming, completed
    const [searchQuery, setSearchQuery] = useState('');

    // Modals & Join Code States
    const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
    const [showCreateClassModal, setShowCreateClassModal] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [joinStatusMsg, setJoinStatusMsg] = useState('');

    // Study Room & WebRTC Overlay States
    const [showStudyRoom, setShowStudyRoom] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [currentRoomName, setCurrentRoomName] = useState('Live Classroom');
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [showCodingBoard, setShowCodingBoard] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [showInClassChatDrawer, setShowInClassChatDrawer] = useState(false);

    // Advanced Feature Modals
    const [showStudentMatrixModal, setShowStudentMatrixModal] = useState(false);
    const [showBreakoutsModal, setShowBreakoutsModal] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [showAISummarizerModal, setShowAISummarizerModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    // Host Controls & Permissions System
    const [showHostControlsDrawer, setShowHostControlsDrawer] = useState(false);
    const [hasRaisedHand, setHasRaisedHand] = useState(false);
    const [handRaisedUsers, setHandRaisedUsers] = useState([]); // [{ userId, userName }]
    const [studentPermissions, setStudentPermissions] = useState({
        mic: false,
        camera: false,
        whiteboard: false,
        codeEditor: false,
        screenShare: false
    });

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

    // Listen for Permissions, Hand Raises, and Room Chat
    useEffect(() => {
        const socket = connectSocket();
        if (!socket) return;

        const handlePermissionUpdate = (data) => {
            const { targetUserId, permissions } = data;
            if (targetUserId === currentUserId || targetUserId === 'all') {
                console.log('🔒 Permissions updated:', permissions);
                setStudentPermissions(prev => {
                    const updated = { ...prev, ...permissions };
                    // Force shut off media if revoked by teacher
                    if (permissions.mic === false) {
                        setIsMicOn(false);
                        webrtcService.toggleMicrophone(false);
                    }
                    if (permissions.camera === false) {
                        setIsCameraOn(false);
                        webrtcService.toggleCamera(false);
                    }
                    return updated;
                });
            }
        };

        const handleHandRaised = (data) => {
            const { userId, userName, raised } = data;
            console.log('✋ Hand raise event:', data);
            setHandRaisedUsers(prev => {
                if (raised) {
                    if (prev.some(u => u.userId === userId)) return prev;
                    return [...prev, { userId, userName }];
                } else {
                    return prev.filter(u => u.userId !== userId);
                }
            });
        };

        const handleNewMessage = (msg) => {
            setChatMessages(prev => [...prev, msg]);
        };

        socket.on('room:permissionUpdate', handlePermissionUpdate);
        socket.on('room:handRaised', handleHandRaised);
        socket.on('room:newMessage', handleNewMessage);

        return () => {
            socket.off('room:permissionUpdate', handlePermissionUpdate);
            socket.off('room:handRaised', handleHandRaised);
            socket.off('room:newMessage', handleNewMessage);
        };
    }, [currentUserId]);

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

    // Toggle Mic/Camera/Screen Share with Permission Enforcement
    const toggleMic = () => {
        if (!isHost && !studentPermissions.mic) {
            alert("🔒 Mic permission is locked by the Instructor. Click '✋ Raise Hand' to request permission to speak!");
            return;
        }
        const nextState = !isMicOn;
        setIsMicOn(nextState);
        webrtcService.toggleMicrophone(nextState);
    };

    const toggleCam = () => {
        if (!isHost && !studentPermissions.camera) {
            alert("🔒 Camera permission is locked by the Instructor. Click '✋ Raise Hand' to request camera access!");
            return;
        }
        const nextState = !isCameraOn;
        setIsCameraOn(nextState);
        webrtcService.toggleCamera(nextState);
    };

    const toggleScreenShare = async () => {
        if (!isHost && !studentPermissions.screenShare) {
            alert("🔒 Screen Sharing permission is locked by the Instructor.");
            return;
        }
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

    // Toggle Hand Raise for Students
    const handleToggleRaiseHand = () => {
        const socket = getSocket();
        const nextState = !hasRaisedHand;
        setHasRaisedHand(nextState);
        if (socket && currentRoomId) {
            socket.emit('room:handRaise', {
                roomId: currentRoomId,
                userId: currentUserId,
                userName: user?.name || 'Student',
                raised: nextState
            });
        }
    };

    // Host Grant / Revoke Permission Handler
    const handleUpdatePermission = (targetUserId, permissionsObj) => {
        const socket = getSocket();
        if (socket && currentRoomId) {
            socket.emit('room:permissionUpdate', {
                roomId: currentRoomId,
                targetUserId,
                permissions: permissionsObj
            });
        }
    };

    // In-Class Chat Message Send Handler
    const handleSendChatMessage = (e) => {
        if (e) e.preventDefault();
        if (!currentMessage.trim()) return;
        const socket = getSocket();
        if (socket && currentRoomId) {
            socket.emit('room:message', {
                roomId: currentRoomId,
                message: currentMessage.trim(),
                sender: user?.name || 'User',
                senderId: currentUserId,
                senderAvatar: user?.avatar || '👤'
            });
            setCurrentMessage('');
        }
    };

    // In-Class Chat File Attachment Handler
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const socket = getSocket();
            if (socket && currentRoomId) {
                socket.emit('room:fileShare', {
                    roomId: currentRoomId,
                    sender: user?.name || 'User',
                    senderAvatar: user?.avatar || '👤',
                    fileName: file.name,
                    fileUrl: reader.result,
                    fileType: file.type.includes('image') ? 'image' : (file.type.includes('pdf') ? 'pdf' : 'document'),
                    fileSize: Math.round(file.size / 1024) + ' KB'
                });
            }
        };
        reader.readAsDataURL(file);
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

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* Host Controls Button (Teacher Only) */}
                            {isHost && (
                                <button
                                    style={{ padding: '6px 14px', background: '#4338ca', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}
                                    onClick={() => setShowHostControlsDrawer(true)}
                                >
                                    <ShieldCheck size={16} /> Host Controls
                                    {handRaisedUsers.length > 0 && (
                                        <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 900, padding: '1px 6px', borderRadius: '999px', animation: 'pulse 1.5s infinite' }}>
                                            ✋ {handRaisedUsers.length}
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* Hand Raise Button (Student Only) */}
                            {!isHost && (
                                <button
                                    style={{ padding: '6px 14px', background: hasRaisedHand ? '#d97706' : '#334155', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    onClick={handleToggleRaiseHand}
                                >
                                    <Hand size={16} /> {hasRaisedHand ? 'Hand Raised ✋' : 'Raise Hand'}
                                </button>
                            )}

                            {/* In-Class Live Polls Button */}
                            <button
                                style={{ padding: '6px 12px', background: '#d97706', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={() => setShowPollModal(true)}
                            >
                                <BarChart2 size={15} /> Polls & Quiz
                            </button>

                            {/* In-Class Live Chat Button */}
                            <button
                                style={{ padding: '6px 12px', background: '#2563eb', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={() => setShowInClassChatDrawer(true)}
                            >
                                <MessageCircle size={15} /> Chat & Notes
                            </button>

                            {/* Media Controls */}
                            <button
                                style={{ padding: '6px 12px', background: isMicOn ? '#334155' : '#ef4444', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={toggleMic}
                            >
                                {isMicOn ? <Mic size={14} /> : <MicOff size={14} />} {!isHost && !studentPermissions.mic && <Lock size={12} />} {isMicOn ? 'Mic On' : 'Muted'}
                            </button>

                            <button
                                style={{ padding: '6px 12px', background: isCameraOn ? '#334155' : '#ef4444', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={toggleCam}
                            >
                                {isCameraOn ? <Camera size={14} /> : <CameraOff size={14} />} {!isHost && !studentPermissions.camera && <Lock size={12} />} {isCameraOn ? 'Cam On' : 'Cam Off'}
                            </button>

                            <button
                                style={{ padding: '6px 12px', background: isScreenSharing ? '#2563eb' : '#334155', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={toggleScreenShare}
                            >
                                <Monitor size={14} /> {!isHost && !studentPermissions.screenShare && <Lock size={12} />} {isScreenSharing ? 'Sharing' : 'Share'}
                            </button>

                            <button style={{ padding: '6px 12px', background: '#334155', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setShowWhiteboard(!showWhiteboard)}>
                                🎨 {!isHost && !studentPermissions.whiteboard && <Lock size={12} />} Whiteboard
                            </button>
                            
                            <button style={{ padding: '6px 12px', background: '#334155', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setShowCodingBoard(!showCodingBoard)}>
                                💻 {!isHost && !studentPermissions.codeEditor && <Lock size={12} />} Code Editor
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

                        {/* TEACHER HOST CONTROLS DRAWER / MODAL */}
                        {showHostControlsDrawer && (
                            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '420px', background: '#1e1e2e', borderLeft: '1px solid #313244', zIndex: 300, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 25px rgba(0,0,0,0.5)', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #313244', pb: '12px', marginBottom: '16px' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShieldCheck size={20} className="text-violet-400" /> Host Permission Controls
                                    </div>
                                    <X size={20} cursor="pointer" onClick={() => setShowHostControlsDrawer(false)} />
                                </div>

                                {/* Hand Raise Requests Section */}
                                {handRaisedUsers.length > 0 && (
                                    <div style={{ background: '#313244', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #f59e0b' }}>
                                        <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            ✋ Hand Raise Requests ({handRaisedUsers.length})
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {handRaisedUsers.map(u => (
                                                <div key={u.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#181825', padding: '8px 12px', borderRadius: '8px' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{u.userName}</span>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            style={{ padding: '4px 8px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                            onClick={() => handleUpdatePermission(u.userId, { mic: true })}
                                                        >
                                                            Grant Mic
                                                        </button>
                                                        <button
                                                            style={{ padding: '4px 8px', background: '#4338ca', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                            onClick={() => handleUpdatePermission(u.userId, { mic: true, camera: true, whiteboard: true, codeEditor: true, screenShare: true })}
                                                        >
                                                            Grant All
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Batch Controls */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                                    <button
                                        style={{ padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                                        onClick={() => handleUpdatePermission('all', { mic: false, camera: false })}
                                    >
                                        🔇 Mute All Students
                                    </button>
                                    <button
                                        style={{ padding: '8px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                                        onClick={() => handleUpdatePermission('all', { mic: true })}
                                    >
                                        🎙️ Allow All Mics
                                    </button>
                                    <button
                                        style={{ padding: '8px', background: '#4338ca', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', gridColumn: 'span 2' }}
                                        onClick={() => handleUpdatePermission('all', { mic: true, camera: true, whiteboard: true, codeEditor: true, screenShare: true })}
                                    >
                                        ⚡ Grant Full Access to All
                                    </button>
                                </div>

                                {/* Participant Permissions List */}
                                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#a6adc8', textTransform: 'uppercase' }}>Connected Students</div>
                                    {liveParticipants.length === 0 ? (
                                        <div style={{ textTransform: 'capitalize', color: '#6c7086', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>Waiting for students to join...</div>
                                    ) : (
                                        liveParticipants.map(p => (
                                            <div key={p.id} style={{ background: '#181825', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span>{p.avatar || '👤'}</span>
                                                    <span>{p.name}</span>
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    <button
                                                        style={{ padding: '4px 8px', background: '#313244', border: '1px solid #45475a', color: 'white', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                                                        onClick={() => handleUpdatePermission(p.id, { mic: true })}
                                                    >
                                                        🎙️ Mic
                                                    </button>
                                                    <button
                                                        style={{ padding: '4px 8px', background: '#313244', border: '1px solid #45475a', color: 'white', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                                                        onClick={() => handleUpdatePermission(p.id, { camera: true })}
                                                    >
                                                        📹 Cam
                                                    </button>
                                                    <button
                                                        style={{ padding: '4px 8px', background: '#313244', border: '1px solid #45475a', color: 'white', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                                                        onClick={() => handleUpdatePermission(p.id, { whiteboard: true })}
                                                    >
                                                        🎨 Board
                                                    </button>
                                                    <button
                                                        style={{ padding: '4px 8px', background: '#313244', border: '1px solid #45475a', color: 'white', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                                                        onClick={() => handleUpdatePermission(p.id, { codeEditor: true })}
                                                    >
                                                        💻 Editor
                                                    </button>
                                                    <button
                                                        style={{ padding: '4px 8px', background: '#313244', border: '1px solid #45475a', color: 'white', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                                                        onClick={() => handleUpdatePermission(p.id, { screenShare: true })}
                                                    >
                                                        🖥️ Screen
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* IN-CLASS LIVE CHAT & FILE SHARING DRAWER */}
                        {showInClassChatDrawer && (
                            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '380px', background: '#181825', borderLeft: '1px solid #313244', zIndex: 300, display: 'flex', flexDirection: 'column', padding: '16px', boxShadow: '-10px 0 25px rgba(0,0,0,0.5)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #313244', paddingBottom: '12px', marginBottom: '12px' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MessageCircle size={18} className="text-blue-400" /> In-Class Live Chat & Notes
                                    </div>
                                    <X size={18} cursor="pointer" onClick={() => setShowInClassChatDrawer(false)} />
                                </div>

                                {/* Message feed */}
                                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px', paddingRight: '4px' }}>
                                    {chatMessages.length === 0 ? (
                                        <div style={{ color: '#6c7086', fontSize: '0.82rem', textAlign: 'center', marginTop: '40px' }}>No messages yet. Start the conversation or share lecture notes!</div>
                                    ) : (
                                        chatMessages.map(msg => (
                                            <div key={msg.id} style={{ background: '#1e1e2e', padding: '10px', borderRadius: '10px', border: '1px solid #313244' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cdd6f4', fontWeight: 700, marginBottom: '4px' }}>
                                                    <span>{msg.sender?.name || 'User'}</span>
                                                    <span style={{ color: '#6c7086' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>

                                                {/* Text Message */}
                                                {msg.message && <p style={{ fontSize: '0.85rem', color: '#a6adc8', margin: 0, wordBreak: 'break-word' }}>{msg.message}</p>}

                                                {/* File Attachment */}
                                                {msg.file && (
                                                    <div style={{ marginTop: '8px', background: '#313244', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                                            {msg.file.type === 'image' ? <ImageIcon size={16} className="text-emerald-400" /> : <File size={16} className="text-indigo-400" />}
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, truncate: true, color: 'white' }}>{msg.file.name}</div>
                                                                <div style={{ fontSize: '0.68rem', color: '#a6adc8' }}>{msg.file.size}</div>
                                                            </div>
                                                        </div>
                                                        <a href={msg.file.url} download={msg.file.name} target="_blank" rel="noreferrer" style={{ padding: '4px 8px', background: '#4338ca', color: 'white', borderRadius: '6px', fontSize: '0.72rem', textDecoration: 'none', fontWeight: 700 }}>
                                                            Download
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Chat Input & File Attachment Form */}
                                <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <label style={{ cursor: 'pointer', padding: '10px', background: '#313244', borderRadius: '10px', color: '#cdd6f4' }} title="Attach PDF, Image or Notes">
                                        <Paperclip size={16} />
                                        <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*,.pdf,.doc,.docx" />
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Type a message to class..."
                                        value={currentMessage}
                                        onChange={e => setCurrentMessage(e.target.value)}
                                        style={{ flex: 1, padding: '10px 12px', background: '#1e1e2e', border: '1px solid #313244', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                                    />

                                    <button type="submit" style={{ padding: '10px', background: '#4338ca', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>
                                        <Send size={16} />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* LIVE POLL MODAL INTEGRATION */}
            <LivePollModal
                isOpen={showPollModal}
                onClose={() => setShowPollModal(false)}
                socket={getSocket()}
                roomId={currentRoomId}
                user={user}
                isHost={isHost}
            />
        </div>
    );
}
