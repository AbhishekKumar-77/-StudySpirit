import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Users, MessageCircle, TrendingUp,
    Plus, Search, Target, Award, Clock,
    Send, Video, BookOpen, Star, Code,
    Edit, ChevronRight, Mic, MicOff, Camera, CameraOff, Monitor,
    Flame, Radio, Users2, Loader2, RefreshCw, Copy, Check,
    X, Play, Pause, Square, Folder, Download, FileText,
    Settings, Crown, Shield, UserMinus, LogOut, Hash, Maximize2, Minimize2, PenTool,
    Trophy, Globe, Lock, Eye, Calendar, Zap, Medal, TrendingDown, Bell
} from 'lucide-react';

import { groupAPI, roomAPI, challengeAPI, resourceAPI, activityAPI, messageAPI, connectSocket, getSocket, disconnectSocket, setCurrentGroupId, isSocketConnected } from '../services/groupAPI';
import webrtcService from '../services/webrtcService';
import VideoGrid from '../components/VideoGrid';
import Whiteboard from '../components/Whiteboard';
import { useApp } from '../context/AppContext';

export default function GroupMode() {
    const { user } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showStudyRoom, setShowStudyRoom] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [confetti, setConfetti] = useState([]);
    const [showCelebration, setShowCelebration] = useState(false);
    const [groupPomodoroTime, setGroupPomodoroTime] = useState(25 * 60);
    const [isGroupTimerRunning, setIsGroupTimerRunning] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupGoal, setNewGroupGoal] = useState('');
    const [newGroupCategory, setNewGroupCategory] = useState('General');
    const [newGroupColor, setNewGroupColor] = useState('violet');
    const [customInviteCode, setCustomInviteCode] = useState(''); // Custom code state
    const [filterCategory, setFilterCategory] = useState('all');
    const [chatMessages, setChatMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inviteCode, setInviteCode] = useState(''); // For joining
    const [copiedCode, setCopiedCode] = useState(false);
    const [joinRequests, setJoinRequests] = useState([]); // Admin requests

    // Dynamic data from API (fallback to sample data if not logged in)
    const [myGroups, setMyGroups] = useState([]);
    const [liveRooms, setLiveRooms] = useState([]); // Will be set in useEffect with sampleRooms
    const [groupChallenges, setGroupChallenges] = useState([]);
    const [sharedResources, setSharedResources] = useState([]);
    const [groupActivity, setGroupActivity] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [liveParticipants, setLiveParticipants] = useState([]);

    // My Groups - Detailed View States
    const [showGroupDetail, setShowGroupDetail] = useState(false);
    const [groupDetailData, setGroupDetailData] = useState(null);
    const [groupMessages, setGroupMessages] = useState([]);
    const [groupMessageInput, setGroupMessageInput] = useState('');
    const [activeGroupTab, setActiveGroupTab] = useState('chat');
    const [copiedInviteCode, setCopiedInviteCode] = useState(false);
    const [loadingGroupDetail, setLoadingGroupDetail] = useState(false);
    const [showGroupSettings, setShowGroupSettings] = useState(false);
    const [editGroupData, setEditGroupData] = useState({});
    const [showMemberActions, setShowMemberActions] = useState(null);

    // WebRTC states
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(new Map());
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(user?._id || 'user_' + Math.random().toString(36).substr(2, 9));
    const [isWebRTCInitialized, setIsWebRTCInitialized] = useState(false);

    // Spotlight and Whiteboard states
    const [spotlightUserId, setSpotlightUserId] = useState(null);
    const [isWhiteboardFullscreen, setIsWhiteboardFullscreen] = useState(false);

    // Presenter/Viewer mode for whiteboard & screen share
    // When someone presents, viewers see fullscreen of the presenter's content
    const [presenterUserId, setPresenterUserId] = useState(null); // Who is presenting
    const [presenterName, setPresenterName] = useState(''); // Presenter's name
    const [isViewerFullscreen, setIsViewerFullscreen] = useState(false); // Am I a viewer seeing presenter's content
    const [presenterType, setPresenterType] = useState(null); // 'whiteboard' or 'screenshare'

    // Challenge Management States
    const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
    const [publicChallenges, setPublicChallenges] = useState([]);
    const [myChallenges, setMyChallenges] = useState([]);
    const [challengeTab, setChallengeTab] = useState('public'); // 'public', 'my', 'browse'
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [showChallengeLeaderboard, setShowChallengeLeaderboard] = useState(false);
    const [challengeLeaderboard, setChallengeLeaderboard] = useState([]);
    const [loadingChallenges, setLoadingChallenges] = useState(false);
    const [challengeFilterCategory, setChallengeFilterCategory] = useState('all');

    // New Challenge Form
    const [newChallenge, setNewChallenge] = useState({
        title: '',
        description: '',
        target: 30,
        unit: 'problems',
        days: 30,
        category: 'DSA',
        visibility: 'public',
        reward: 500,
        challengeType: 'problems'
    });


    useEffect(() => {
        if (user?._id) {
            setCurrentUserId(user._id);
        }
    }, [user]);


    // Sample data (used as fallback when not connected to backend)
    const sampleGroups = [
        { id: 1, name: 'DSA Masters', members: 8, progress: 75, avatar: '🧠', activeNow: 3, lastActivity: '5 min ago', goal: 'Complete all DSA topics by Dec 31', streak: 12, color: 'violet', totalPoints: 3450 },
        { id: 2, name: 'Web Dev Warriors', members: 12, progress: 62, avatar: '💻', activeNow: 5, lastActivity: '12 min ago', goal: 'Build 5 full-stack projects', streak: 8, color: 'cyan', totalPoints: 2890 },
        { id: 3, name: 'Python Pioneers', members: 6, progress: 88, avatar: '🐍', activeNow: 2, lastActivity: '1 hour ago', goal: 'Master Python for AI/ML', streak: 15, color: 'emerald', totalPoints: 4120 },
        { id: 4, name: 'AI Enthusiasts', members: 10, progress: 55, avatar: '🤖', activeNow: 4, lastActivity: '30 min ago', goal: 'Build 3 AI projects', streak: 5, color: 'pink', totalPoints: 2100 }
    ];

    const sampleRooms = [
        { id: 1, name: 'DSA Problem Solving', host: 'Sarah Chen', participants: 8, topic: 'Dynamic Programming', duration: '1h 23m', isLive: true, language: 'English', difficulty: 'Intermediate', avatar: '🧠', category: 'DSA' },
        { id: 2, name: 'React Deep Dive', host: 'Mike Ross', participants: 12, topic: 'Custom Hooks & Context', duration: '45m', isLive: true, language: 'English', difficulty: 'Advanced', avatar: '⚛️', category: 'Web Dev' },
        { id: 3, name: 'Python ML Workshop', host: 'Emma Watson', participants: 6, topic: 'Neural Networks', duration: '2h 10m', isLive: true, language: 'English', difficulty: 'Advanced', avatar: '🐍', category: 'AI/ML' },
        { id: 4, name: 'System Design Study', host: 'John Doe', participants: 15, topic: 'Scalable Architecture', duration: '1h 05m', isLive: true, language: 'English', difficulty: 'Expert', avatar: '🏗️', category: 'System Design' },
        { id: 5, name: 'Competitive Coding', host: 'Alex Johnson', participants: 20, topic: 'Graph Algorithms', duration: '55m', isLive: true, language: 'Hindi', difficulty: 'Intermediate', avatar: '🏆', category: 'DSA' }
    ];

    const sampleChallenges = [
        { id: 1, title: 'Code 100 Problems This Month', progress: 67, participants: 8, reward: '500 XP', deadline: 'Dec 31', icon: Code, description: 'Solve 100 coding problems across all difficulty levels', completed: 67, total: 100 },
        { id: 2, title: 'Daily Streak Master', progress: 85, participants: 12, reward: '1000 XP', deadline: 'Ongoing', icon: Flame, description: 'Maintain a 30-day study streak without breaking', completed: 25, total: 30 },
        { id: 3, title: 'Build 3 Projects Together', progress: 33, participants: 6, reward: '750 XP', deadline: 'Jan 15', icon: Folder, description: 'Collaborate and build 3 full-stack projects as a team', completed: 1, total: 3 }
    ];

    const sampleActivity = [
        { user: 'Sarah Chen', action: 'completed', item: 'Arrays Chapter', time: '5 min ago', avatar: '👩‍💻', points: 50 },
        { user: 'Mike Ross', action: 'shared', item: 'Study Notes on Trees', time: '15 min ago', avatar: '👨‍💼', points: 20 },
        { user: 'Emma Watson', action: 'joined session', item: 'Live Study Room', time: '30 min ago', avatar: '👩‍🔬', points: 10 },
        { user: 'John Doe', action: 'achieved', item: 'Weekly Goal', time: '1 hour ago', avatar: '👨‍🎓', points: 100 },
        { user: 'Alice Brown', action: 'uploaded', item: 'React Cheat Sheet', time: '2 hours ago', avatar: '👩‍🎨', points: 30 }
    ];

    const sampleLeaderboard = [
        { rank: 1, name: 'Sarah Chen', points: 2450, avatar: '👩‍💻', streak: 15, badge: '👑' },
        { rank: 2, name: 'Alex Johnson', points: 2350, avatar: '👨‍🎓', streak: 12, badge: '🥈' },
        { rank: 3, name: 'Mike Ross', points: 2180, avatar: '👨‍💼', streak: 10, badge: '🥉' },
        { rank: 4, name: 'Emma Watson', points: 1950, avatar: '👩‍🔬', streak: 8, badge: '⭐' },
        { rank: 5, name: 'John Doe', points: 1820, avatar: '👨‍🎓', streak: 7, badge: '⭐' }
    ];

    const sampleResources = [
        { id: 1, name: 'React Hooks Cheat Sheet.pdf', uploader: 'Sarah Chen', type: 'pdf', size: '2.3 MB', downloads: 45, date: '2 days ago', category: 'Web Dev' },
        { id: 2, name: 'DSA Notes - Trees & Graphs.docx', uploader: 'Mike Ross', type: 'doc', size: '1.8 MB', downloads: 32, date: '5 days ago', category: 'DSA' },
        { id: 3, name: 'Python ML Tutorial Video', uploader: 'Emma Watson', type: 'video', size: '120 MB', downloads: 28, date: '1 week ago', category: 'AI/ML' },
        { id: 4, name: 'System Design Mind Map.png', uploader: 'John Doe', type: 'image', size: '450 KB', downloads: 38, date: '3 days ago', category: 'System Design' }
    ];

    const transformMessage = (msg) => {
        if (!msg) return null;

        // Handle both populated and unpopulated sender
        const sender = msg.sender || {};
        const senderId = sender._id || sender.id || sender;
        const currentUserId = user?._id;

        // Improved isMe logic: Check ID first, then fallback to name as a backup
        const isMe = currentUserId ? (senderId?.toString() === currentUserId?.toString()) : (sender.name === user?.name);

        return {
            id: msg._id || msg.id || Date.now() + Math.random(),
            user: sender.name || 'Unknown',
            avatar: sender.avatar || '👤',
            message: msg.content || msg.message || '',
            time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: !!isMe
        };
    };

    const loadInitialData = async () => {
        setLoading(true);
        try {
            // Try to fetch from API
            const [groupsRes, roomsRes] = await Promise.all([
                groupAPI.getMyGroups().catch(() => null),
                roomAPI.getLive().catch(() => null)
            ]);

            if (groupsRes?.groups) setMyGroups(groupsRes.groups);
            else setMyGroups([]); // Explicitly set to empty if API fails

            if (roomsRes?.studyRooms) setLiveRooms(roomsRes.studyRooms);
            else setLiveRooms([]); // Explicitly set to empty if API fails

            // Remove sample data fallbacks completely
            setGroupChallenges([]);
            setGroupActivity([]);
            setLeaderboard([]);
            setSharedResources([]);
            setLiveParticipants([]); // Also remove sample live participants
        } catch (err) {
            console.log('Error loading initial data:', err.message);
            // Ensure states are empty if API calls fail
            setMyGroups([]);
            setLiveRooms([]);
            setGroupChallenges([]);
            setGroupActivity([]);
            setLeaderboard([]);
            setSharedResources([]);
            setLiveParticipants([]);
        } finally {
            setLoading(false);
        }
    };

    // ============== CHALLENGE FUNCTIONS ==============

    // Fetch public challenges
    const fetchPublicChallenges = async () => {
        setLoadingChallenges(true);
        try {
            const params = { sort: 'popular' };
            if (challengeFilterCategory !== 'all') {
                params.category = challengeFilterCategory;
            }
            const res = await challengeAPI.getPublicChallenges(params);
            if (res.success) {
                setPublicChallenges(res.challenges || []);
            }
        } catch (err) {
            console.error('Error fetching public challenges:', err);
        } finally {
            setLoadingChallenges(false);
        }
    };

    // Fetch my created challenges
    const fetchMyChallenges = async () => {
        setLoadingChallenges(true);
        try {
            const res = await challengeAPI.getMyChallenges();
            if (res.success) {
                setMyChallenges(res.challenges || []);
            }
        } catch (err) {
            console.error('Error fetching my challenges:', err);
        } finally {
            setLoadingChallenges(false);
        }
    };

    // Create new challenge
    const handleCreateChallenge = async () => {
        console.log('🎯 Create challenge clicked!', newChallenge);

        if (!newChallenge.title.trim() || !newChallenge.description.trim()) {
            const errorMsg = 'Please fill in all required fields';
            console.error('❌ Validation error:', errorMsg);
            setError(errorMsg);
            setTimeout(() => setError(null), 3000);
            return;
        }

        setLoading(true);
        console.log('⏳ Creating challenge...');

        try {
            // Calculate deadline from days
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + parseInt(newChallenge.days));

            const challengeData = {
                title: newChallenge.title,
                description: newChallenge.description,
                target: parseInt(newChallenge.target),
                unit: newChallenge.unit,
                deadline: deadline.toISOString(),
                category: newChallenge.category,
                visibility: newChallenge.visibility,
                challengeType: newChallenge.challengeType,
                reward: { xp: parseInt(newChallenge.reward) }
            };

            console.log('📤 Sending challenge data:', challengeData);
            const res = await challengeAPI.create(challengeData);
            console.log('📥 Response:', res);

            if (res.success) {
                console.log('✅ Challenge created successfully!');
                // Refresh challenges list
                if (newChallenge.visibility === 'public') {
                    fetchPublicChallenges();
                }
                fetchMyChallenges();
                setShowCreateChallengeModal(false);
                // Reset form
                setNewChallenge({
                    title: '',
                    description: '',
                    target: 30,
                    unit: 'problems',
                    days: 30,
                    category: 'DSA',
                    visibility: 'public',
                    reward: 500,
                    challengeType: 'problems'
                });
            } else {
                console.error('❌ Challenge creation failed:', res);
                setError(res.message || 'Failed to create challenge');
                setTimeout(() => setError(null), 3000);
            }
        } catch (err) {
            console.error('❌ Error creating challenge:', err);
            console.error('Error details:', err.response?.data);
            setError(err.response?.data?.message || err.message || 'Failed to create challenge');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
            console.log('🏁 Create challenge finished');
        }
    };

    // Join a challenge
    const handleJoinChallenge = async (challengeId) => {
        try {
            const res = await challengeAPI.join(challengeId);
            if (res.success) {
                // Refresh to show updated participant count
                fetchPublicChallenges();
                fetchMyChallenges();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join challenge');
            setTimeout(() => setError(null), 3000);
        }
    };

    // View challenge leaderboard
    const handleViewLeaderboard = async (challenge) => {
        setSelectedChallenge(challenge);
        setShowChallengeLeaderboard(true);
        try {
            const res = await challengeAPI.getLeaderboard(challenge._id || challenge.id);
            if (res.success) {
                setChallengeLeaderboard(res.leaderboard || []);
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setChallengeLeaderboard([]);
        }
    };

    // Load challenges when tab is selected
    useEffect(() => {
        if (activeTab === 'challenges') {
            fetchPublicChallenges();
            fetchMyChallenges();
        }
    }, [activeTab, challengeFilterCategory]);


    // Load initial data
    useEffect(() => {
        // Start with empty data - only show real data from API or user-created
        loadInitialData();

        // Connect socket
        const socket = connectSocket();

        // Listen for updates - Use specific listeners that match backend events
        // Note: Group messages are handled in groupDetailData useEffect below


        socket.on('users:online', (users) => {
            // Update online count logic
        });

        // Listen for room participants update
        socket.on('room:participants', (participantsData) => {
            console.log('👥 Room participants updated:', participantsData);

            // Backend sends Array.from(map.entries()) => [[userId, {name, avatar, ...}], ...]
            let participants = [];
            if (Array.isArray(participantsData)) {
                // Check if it's an array of [key, value] entries (from Map.entries())
                if (participantsData.length > 0 && Array.isArray(participantsData[0]) && participantsData[0].length === 2) {
                    // It's Map entries: [[userId, {name, avatar, ...}], ...]
                    participants = participantsData.map(([userId, data]) => ({
                        id: userId,
                        ...(typeof data === 'object' ? data : { name: data })
                    }));
                } else {
                    // It's already an array of objects
                    participants = participantsData.map(p => ({
                        ...p,
                        id: p.id || p.userId || p._id
                    }));
                }
            } else if (typeof participantsData === 'object' && participantsData !== null) {
                // Plain object (key-value pairs)
                participants = Object.entries(participantsData).map(([userId, data]) => ({
                    id: userId,
                    ...(typeof data === 'object' ? data : { name: data })
                }));
            }

            // Deduplicate by ID
            const seen = new Set();
            const uniqueParticipants = participants.filter(p => {
                const key = p.id || p.name;
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            console.log('✅ Parsed participants:', uniqueParticipants);
            setLiveParticipants(uniqueParticipants);
        });

        // Listen for participant status update
        socket.on('room:participantUpdate', (data) => {
            setLiveParticipants(prev => prev.map(p =>
                p.id === data.userId ? { ...p, ...data } : p
            ));
        });

        // Listen for room messages
        socket.on('room:newMessage', (msg) => {
            console.log('💬 New message received:', msg);

            // Handle system commands
            const content = msg.message || msg.content || '';
            const senderName = msg.sender?.name || msg.sender || 'Someone';
            const senderId = msg.senderId || null;

            if (content === 'SYSTEM:WHITEBOARD_OPEN') {
                if (senderName !== (user?.name || 'You')) {
                    setShowWhiteboard(true);
                    setPresenterUserId(senderId || senderName);
                    setPresenterName(senderName);
                    setPresenterType('whiteboard');
                }
                return;
            }

            if (content === 'SYSTEM:WHITEBOARD_CLOSE') {
                if (senderName !== (user?.name || 'You')) {
                    setShowWhiteboard(false);
                    setPresenterUserId(null);
                    setPresenterName('');
                    setPresenterType(null);
                }
                return;
            }

            if (content === 'SYSTEM:SCREENSHARE_START') {
                if (senderName !== (user?.name || 'You')) {
                    setPresenterUserId(senderId || senderName);
                    setPresenterName(senderName);
                    setPresenterType('screenshare');
                    setSpotlightUserId(senderId || senderName); // Spotlight the presenter automatically
                }
                return;
            }

            if (content === 'SYSTEM:SCREENSHARE_STOP') {
                if (presenterType === 'screenshare') {
                    setPresenterUserId(null);
                    setPresenterName('');
                    setPresenterType(null);
                    setSpotlightUserId(null); // Remove spotlight
                }
                return;
            }

            // Transform raw message if needed (handle timestamp)
            const formattedMsg = {
                id: msg.id || Date.now(),
                user: msg.sender?.name || msg.sender || 'Unknown',
                message: content,
                time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: msg.sender?.name === (user?.name || 'You') || msg.sender === (user?.name || 'You')
            };
            setChatMessages(prev => [...prev, formattedMsg]);
        });

        // Listen for Pomodoro sync
        socket.on('room:pomodoroSync', (state) => {
            // Sync state if needed
        });

        return () => {
            socket.off('message:receive');
            socket.off('users:online');
            socket.off('room:participants');
            socket.off('room:participantUpdate');
            socket.off('room:newMessage');
            socket.off('room:pomodoroSync');
            // Don't disconnect socket here - it's needed for real-time messaging across the app
        };
    }, [selectedGroup, user]);



    // Group Pomodoro Timer
    useEffect(() => {
        let interval;
        if (isGroupTimerRunning && groupPomodoroTime > 0) {
            interval = setInterval(() => {
                setGroupPomodoroTime(prev => prev - 1);
            }, 1000);
        } else if (groupPomodoroTime === 0) {
            setIsGroupTimerRunning(false);
            triggerCelebration();
            setGroupPomodoroTime(25 * 60);
        }
        return () => clearInterval(interval);
    }, [isGroupTimerRunning, groupPomodoroTime]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const triggerCelebration = () => {
        setShowCelebration(true);
        const pieces = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 0.5,
            duration: 2 + Math.random() * 2,
            color: ['bg-violet-500', 'bg-pink-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500'][Math.floor(Math.random() * 5)]
        }));
        setConfetti(pieces);

        setTimeout(() => {
            setShowCelebration(false);
            setConfetti([]);
        }, 4000);
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || !newGroupGoal.trim()) return;

        setLoading(true);
        try {
            const groupData = {
                name: newGroupName,
                category: newGroupCategory,
                goal: newGroupGoal,
                privacy: 'public', // Default public
                inviteCode: customInviteCode.trim() || undefined, // custom code
                color: newGroupColor,
                avatar: '📚' // Default avatar for now
            };

            console.log('🔄 Creating group with data:', groupData);
            console.log('👤 User context:', user);

            // Create fallback user if not logged in
            const fallbackUser = {
                _id: currentUserId,
                name: 'Test User',
                email: 'test@example.com',
                avatar: '👤'
            };
            const activeUser = user || fallbackUser;

            const res = await groupAPI.create(groupData);
            console.log('✅ Group creation response:', res);

            if (res.success || res.group) {
                // Add to my groups immediately with default stats for UI
                const newGroupWithStats = {
                    ...res.group,
                    id: res.group._id || res.group.id,
                    members: 1, // Start with just creator
                    progress: 0,
                    activeNow: 0,
                    streak: 0,
                    totalPoints: 0,
                    lastActivity: 'Just now'
                };
                setMyGroups(prev => [newGroupWithStats, ...prev]);

                // Reload live rooms to show newly created group
                try {
                    const roomsRes = await roomAPI.getLive();
                    if (roomsRes?.studyRooms) {
                        setLiveRooms(roomsRes.studyRooms);
                    }
                } catch (err) {
                    console.log('Could not reload live rooms:', err);
                }

                setShowCreateModal(false);
                setNewGroupName('');
                setNewGroupGoal('');
                setCustomInviteCode('');
                setActiveTab('dashboard'); // Switch to My Groups tab
                triggerCelebration();
            } else {
                throw new Error('Group creation failed - no success flag');
            }
        } catch (err) {
            console.error('❌ Group creation error:', err);
            console.error('Error response:', err.response);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to create group';

            if (err.response?.status === 401) {
                alert('Success authentication failed. Please log in again.');
                return;
            } else if (err.response?.status === 400 && errorMsg.includes('Invite code')) {
                alert(errorMsg);
            } else {
                const debugInfo = err.response?.data?.error || JSON.stringify(err.response?.data) || err.message;
                alert('Error creating group: ' + errorMsg + '\n\nDebug Info: ' + debugInfo + '\n\nPlease ensure you are logged in.');
            }

            setError(errorMsg);
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async () => {
        if (!inviteCode.trim()) return;

        setLoading(true);
        try {
            console.log('🔄 Joining group with code:', inviteCode);
            const res = await groupAPI.joinByCode(inviteCode);
            console.log('✅ Join group response:', res);

            if (res.success) {
                if (res.requestSent) {
                    alert(res.message || 'Join request sent successfully!');
                    setShowCreateModal(false);
                    setInviteCode('');
                    return;
                }

                if (res.group) {
                    const joinedGroupWithStats = {
                        ...res.group,
                        id: res.group._id || res.group.id,
                        activeNow: res.group.activeNow || 0,
                        lastActivity: 'Just now'
                    };
                    setMyGroups(prev => [joinedGroupWithStats, ...prev]);

                    // Reload live rooms
                    try {
                        const roomsRes = await roomAPI.getLive();
                        if (roomsRes?.studyRooms) {
                            setLiveRooms(roomsRes.studyRooms);
                        }
                    } catch (err) {
                        console.log('Could not reload live rooms:', err);
                    }

                    setShowCreateModal(false);
                    setInviteCode('');
                    setActiveTab('dashboard'); // Switch to My Groups tab
                }
            } else {
                throw new Error('Failed to join group - no success flag');
            }
        } catch (err) {
            console.error('❌ Join group error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Invalid invite code';



            setError(errorMsg);
            alert('Error joining group: ' + errorMsg);
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async (roomId) => {
        // Clear previous participants when joining a new room
        setLiveParticipants([]);
        setChatMessages([]);

        let joinedViaApi = false;
        try {
            const res = await roomAPI.join(roomId);
            if (res.success) {
                joinedViaApi = true;
                console.log('✅ Joined room via API');
            }
        } catch (err) {
            console.error('Failed to join room via API (might be sample room):', err);
        }

        // Connect socket to room regardless of API success (to support demo/sample rooms)
        const socket = getSocket();
        if (socket) {
            console.log('🔌 Joining socket room:', roomId, 'User:', currentUserId);
            console.log('User data:', { name: user?.name, avatar: user?.avatar });
            socket.emit('room:join', {
                roomId,
                userId: currentUserId,
                userName: user?.name || 'Guest User',
                userAvatar: user?.avatar || '👤'
            });
        }
        setCurrentRoomId(roomId);
        setShowStudyRoom(true);
    };

    const sendMessage = () => {
        if (currentMessage.trim()) {
            const socket = getSocket();
            const msgData = {
                message: currentMessage,
                sender: user?.name || 'You',
                senderAvatar: user?.avatar || '👤',
                roomId: currentRoomId || 'default-room',
                createdAt: new Date().toISOString()
            };

            console.log('📤 Sending message:', msgData);

            // Emit to room
            if (socket) {
                socket.emit('room:message', msgData);
            }

            // Ideally we wait for server to echo back, but for better UX we might optimistic update
            // However, we added a listener for room:newMessage which handles the incoming message
            // So we don't need to manually update local state here if the server echoes it back to sender too.
            // Backend implementation: io.to(room).emit() sends to everyone including sender? yes usually.
            // Let's check backend: io.to(...).emit(...) includes sender.

            setCurrentMessage('');
        }
    };

    // ============== WebRTC FUNCTIONS ==============

    // Initialize WebRTC and join room
    const initializeWebRTC = async (roomId) => {
        try {
            console.log('🎥 Initializing WebRTC for room:', roomId);

            // Initialize local media - Always request video/audio to get the tracks
            const stream = await webrtcService.initializeLocalMedia({
                video: true,
                audio: true
            });

            // Apply initial state to tracks
            stream.getAudioTracks().forEach(track => {
                track.enabled = isMicOn;
            });
            stream.getVideoTracks().forEach(track => {
                track.enabled = isCameraOn;
            });

            setLocalStream(stream);
            setCurrentRoomId(roomId);
            setIsWebRTCInitialized(true);

            // Join WebRTC room
            webrtcService.joinRoom(roomId, currentUserId);

            // Listen for remote streams
            window.addEventListener('webrtc:remoteStream', handleRemoteStream);
            window.addEventListener('webrtc:remoteTrack', handleRemoteTrack);
            window.addEventListener('webrtc:userLeft', handleUserLeft);

            console.log('✅ WebRTC initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize WebRTC:', error);
            alert('Could not access camera/microphone. Please check permissions.');
        }
    };

    // Handle remote stream
    const handleRemoteStream = (event) => {
        const { userId, stream } = event.detail;
        console.log('📹 Received remote stream from:', userId);

        setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            const existing = newStreams.get(userId) || [];

            // Only add if not already present by id
            if (!existing.some(s => s.id === stream.id)) {
                newStreams.set(userId, [...existing, stream]);
            }
            return newStreams;
        });
    };

    // Handle remote track (sometimes needed for modern browsers that fire track events late)
    const handleRemoteTrack = (event) => {
        const { userId, stream } = event.detail;

        setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            const existing = newStreams.get(userId) || [];

            // If the stream is already in the array, replace its reference to force a React re-render of the video component
            const streamIndex = existing.findIndex(s => s.id === stream.id);
            if (streamIndex !== -1) {
                const newArray = [...existing];
                newArray[streamIndex] = stream; // Replace reference
                newStreams.set(userId, newArray);
            } else {
                newStreams.set(userId, [...existing, stream]);
            }
            return newStreams;
        });
    };

    // Handle user left
    const handleUserLeft = (event) => {
        const { userId } = event.detail;
        console.log('👋 User left:', userId);

        setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.delete(userId);
            return newStreams;
        });
    };

    // Toggle microphone with WebRTC
    const toggleMicrophone = async () => {
        const newState = !isMicOn;

        if (newState) {
            // Turning mic ON — check if tracks are still alive
            const currentStream = webrtcService.getLocalStream();
            const audioTrack = currentStream?.getAudioTracks()[0];

            if (!audioTrack || audioTrack.readyState === 'ended') {
                try {
                    console.log('🎤 Re-acquiring audio stream...');
                    const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const newAudioTrack = newStream.getAudioTracks()[0];
                    if (currentStream) {
                        const oldTrack = currentStream.getAudioTracks()[0];
                        if (oldTrack) currentStream.removeTrack(oldTrack);
                        currentStream.addTrack(newAudioTrack);
                    }
                    setLocalStream(currentStream || newStream);
                } catch (err) {
                    console.error('❌ Failed to re-acquire mic:', err);
                    return;
                }
            } else {
                audioTrack.enabled = true;
            }
        } else {
            webrtcService.toggleMicrophone(false);
        }

        setIsMicOn(newState);
    };

    // Toggle camera with WebRTC
    const toggleCamera = async () => {
        const newState = !isCameraOn;

        if (newState) {
            // Turning camera ON — check if tracks are still alive
            const currentStream = webrtcService.getLocalStream();
            const videoTrack = currentStream?.getVideoTracks()[0];

            if (!videoTrack || videoTrack.readyState === 'ended') {
                // Track died — re-acquire camera
                try {
                    console.log('🎥 Re-acquiring camera stream...');
                    const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    const newVideoTrack = newStream.getVideoTracks()[0];
                    const newAudioTrack = newStream.getAudioTracks()[0];

                    if (currentStream) {
                        // Replace dead tracks in existing stream
                        const oldVideoTrack = currentStream.getVideoTracks()[0];
                        if (oldVideoTrack) currentStream.removeTrack(oldVideoTrack);
                        currentStream.addTrack(newVideoTrack);

                        // Also refresh audio if needed
                        const oldAudioTrack = currentStream.getAudioTracks()[0];
                        if (oldAudioTrack && oldAudioTrack.readyState === 'ended') {
                            currentStream.removeTrack(oldAudioTrack);
                            currentStream.addTrack(newAudioTrack);
                        } else {
                            // Stop the new audio track since existing one is fine
                            newAudioTrack.stop();
                        }

                        // Apply mic state to audio track
                        currentStream.getAudioTracks().forEach(t => { t.enabled = isMicOn; });
                    }

                    // Force React to re-render with updated stream
                    setLocalStream(currentStream || newStream);
                    console.log('✅ Camera re-acquired successfully');
                } catch (err) {
                    console.error('❌ Failed to re-acquire camera:', err);
                    alert('Could not access camera. Please check permissions.');
                    return;
                }
            } else {
                // Track is alive, just enable it
                videoTrack.enabled = true;
                // Force re-render
                setLocalStream(prev => prev);
            }
        } else {
            // Turning camera OFF — just disable the track (don't stop it)
            webrtcService.toggleCamera(false);
            // Force re-render
            setLocalStream(prev => prev);
        }

        setIsCameraOn(newState);
    };

    // Start screen sharing with WebRTC
    const startScreenSharing = async () => {
        try {
            await webrtcService.startScreenShare();
            setIsScreenSharing(true);

            // Notify other participants that screen share started
            const socket = getSocket();
            if (socket && currentRoomId) {
                socket.emit('room:message', {
                    roomId: currentRoomId,
                    message: 'SYSTEM:SCREENSHARE_START',
                    sender: user?.name,
                    senderId: currentUserId,
                    senderAvatar: user?.avatar
                });
            }
        } catch (error) {
            console.error('Failed to start screen share:', error);
        }
    };

    // Stop screen sharing
    const stopScreenSharing = () => {
        webrtcService.stopScreenShare();
        setIsScreenSharing(false);

        // Notify other participants that screen share stopped
        const socket = getSocket();
        if (socket && currentRoomId) {
            socket.emit('room:message', {
                roomId: currentRoomId,
                message: 'SYSTEM:SCREENSHARE_STOP',
                sender: user?.name,
                senderId: currentUserId,
                senderAvatar: user?.avatar
            });
        }
    };

    // Leave WebRTC room
    const leaveWebRTCRoom = () => {
        console.log('🚪 Leaving WebRTC room');

        // Clean up event listeners
        window.removeEventListener('webrtc:remoteStream', handleRemoteStream);
        window.removeEventListener('webrtc:userLeft', handleUserLeft);

        // Leave room
        webrtcService.leaveRoom();

        // Reset states
        setLocalStream(null);
        setRemoteStreams(new Map());
        setCurrentRoomId(null);
        setIsWebRTCInitialized(false);
        setIsMicOn(false);
        setIsCameraOn(false);
        setIsScreenSharing(false);

        // Clean up presenter/viewer states
        setPresenterUserId(null);
        setPresenterName('');
        setPresenterType(null);
        setIsViewerFullscreen(false);
        setShowWhiteboard(false);
        setIsWhiteboardFullscreen(false);
    };

    // Handle joining study room with WebRTC
    const joinStudyRoomWithWebRTC = async (roomId = 'default-room') => {
        // Close the group detail modal first so the study room modal is visible
        setShowGroupDetail(false);
        setGroupDetailData(null);

        // Join the socket room first for chat/presence
        await handleJoinRoom(roomId);

        // Initialize WebRTC after a short delay to ensure modal is open
        setTimeout(async () => {
            await initializeWebRTC(roomId);
        }, 500);
    };

    // Handle closing study room
    const closeStudyRoom = () => {
        leaveWebRTCRoom();
        setShowStudyRoom(false);
    };

    // ============== MY GROUPS FUNCTIONS ==============

    // Open Group Detail View
    const openGroupDetail = async (group) => {
        setLoadingGroupDetail(true);
        setShowGroupDetail(true);
        setActiveGroupTab('chat');

        // Create a member object for the current user (fallback)
        const currentUserMember = {
            _id: user?._id || 'local_user',
            user: {
                _id: user?._id || 'local_user',
                name: user?.name || 'You',
                avatar: user?.avatar || '👤'
            },
            role: 'admin',
            xpContributed: 0,
            streak: 0
        };

        try {
            // Try to fetch full group data from API
            // Only attempt fetch if it looks like a real ID (not starting with 'local_')
            if (group._id && !group._id.toString().startsWith('local_')) {
                const res = await groupAPI.getById(group._id || group.id);

                if (res.success) {
                    setGroupDetailData(res.group);
                    // Socket room joining is handled by the useEffect below
                    // to ensure proper connection state management

                    // Load group messages
                    try {
                        const msgRes = await messageAPI.getMessages({ groupId: res.group._id });
                        if (msgRes.success) {
                            setGroupMessages(msgRes.messages.map(transformMessage));
                        } else {
                            setGroupMessages([]);
                        }
                    } catch {
                        setGroupMessages([]);
                    }
                    return; // Successfully loaded from API
                }
            }
            throw new Error('Using local data');
        } catch (err) {
            console.log('Using local group data:', err.message);
            // Fallback to passed group data but with REAL user as member
            setGroupDetailData({
                ...group,
                _id: group.id || group._id, // Ensure ID is consistent
                activeNow: 1, // You are active
                inviteCode: group.inviteCode || 'LOCAL',
                // Show ONLY the current user as a member for local groups
                members: [currentUserMember],
                stats: {
                    totalXp: 0,
                    sessionsCompleted: 0,
                    resourcesShared: 0
                }
            });

            // Empty messages for new/local group - NO STATIC CHAT
            setGroupMessages([]);
        } finally {
            setLoadingGroupDetail(false);
        }
    };

    const generateFakeInviteCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const generateSampleMembers = (count) => {
        const sampleMembers = [
            { user: { _id: '1', name: 'Sarah Chen', avatar: '👩‍💻' }, role: 'admin', xpContributed: 2450, streak: 15 },
            { user: { _id: '2', name: 'Mike Ross', avatar: '👨‍💼' }, role: 'moderator', xpContributed: 2180, streak: 10 },
            { user: { _id: '3', name: 'Emma Watson', avatar: '👩‍🔬' }, role: 'member', xpContributed: 1950, streak: 8 },
            { user: { _id: '4', name: 'John Doe', avatar: '👨‍🎓' }, role: 'member', xpContributed: 1820, streak: 7 },
            { user: { _id: '5', name: 'Alice Brown', avatar: '👩‍🎨' }, role: 'member', xpContributed: 1650, streak: 5 },
            { user: { _id: '6', name: 'Bob Wilson', avatar: '👨‍💻' }, role: 'member', xpContributed: 1420, streak: 4 },
            { user: { _id: '7', name: 'Clara Smith', avatar: '👩‍🏫' }, role: 'member', xpContributed: 1100, streak: 3 },
            { user: { _id: '8', name: 'David Lee', avatar: '👨‍🔧' }, role: 'member', xpContributed: 890, streak: 2 },
        ];
        return sampleMembers.slice(0, typeof count === 'number' ? count : 5);
    };

    // Close Group Detail View
    const closeGroupDetail = () => {
        // Leave socket room
        if (groupDetailData?._id) {
            const socket = getSocket();
            if (socket) {
                socket.emit('group:leave', groupDetailData._id);
            }
        }
        setShowGroupDetail(false);
        setGroupDetailData(null);
        setGroupMessages([]);
        setActiveGroupTab('chat');
    };

    // Copy Invite Code
    const copyInviteCode = async () => {
        const code = groupDetailData?.inviteCode;
        if (code) {
            try {
                await navigator.clipboard.writeText(code);
                setCopiedInviteCode(true);
                setTimeout(() => setCopiedInviteCode(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    // Send Group Message
    const sendGroupMessage = () => {
        if (!groupMessageInput.trim()) return;

        const newMessage = {
            id: Date.now(),
            user: user?.name || 'You',
            avatar: user?.avatar || '👤',
            message: groupMessageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setGroupMessages(prev => [...prev, newMessage]);

        // Emit to socket
        const socket = getSocket();
        console.log('📤 Socket object:', socket ? 'exists' : 'null');
        console.log('📤 Socket connected:', socket?.connected);
        console.log('📤 Socket id:', socket?.id);
        console.log('📤 Group ID:', groupDetailData?._id);

        if (socket?.connected && groupDetailData?._id) {
            const messagePayload = {
                content: groupMessageInput,
                groupId: groupDetailData._id,
                senderId: user?._id,
                senderName: user?.name,
                senderAvatar: user?.avatar
            };
            console.log('📤 Sending message:', messagePayload);
            socket.emit('message:send', messagePayload);
        } else {
            console.log('❌ Cannot send - socket not connected or groupId missing');
            console.log('  Socket exists:', !!socket);
            console.log('  Socket.connected:', socket?.connected);
            console.log('  GroupId:', groupDetailData?._id);
        }

        setGroupMessageInput('');
    };

    // Listen for real-time group messages
    useEffect(() => {
        console.log('🔍 GROUP CHAT USEEFFECT TRIGGERED');
        console.log('🔍 groupDetailData:', groupDetailData);
        console.log('🔍 groupDetailData._id:', groupDetailData?._id);

        if (!groupDetailData?._id) {
            console.log('❌ Skipping - no groupDetailData._id');
            return;
        }

        const socket = getSocket();
        console.log('🔍 Socket from getSocket():', socket);
        console.log('🔍 Socket connected:', socket?.connected);
        console.log('🔍 Socket id:', socket?.id);

        if (!socket) {
            console.log('❌ No socket available - trying to connect...');
            const newSocket = connectSocket();
            console.log('🔍 New socket created:', newSocket);
            console.log('🔍 New socket connected:', newSocket?.connected);
            if (!newSocket) {
                console.log('❌ Could not create socket');
                return;
            }
        }

        const currentSocket = getSocket();
        const groupId = groupDetailData._id;
        console.log('🔍 Using groupId:', groupId);

        // Helper function to join group room
        const joinGroupRoom = () => {
            console.log('🔌 ===== JOINING GROUP CHAT ROOM =====');
            console.log('🔌 GroupId:', groupId);
            console.log('🔌 Socket ID:', currentSocket?.id);
            console.log('🔌 Socket connected:', currentSocket?.connected);
            currentSocket.emit('group:join', groupId);
            // Track current group for auto-rejoin on reconnect
            setCurrentGroupId(groupId);
            console.log('🔌 group:join emitted!');
        };

        // Join immediately if connected, otherwise wait for connection
        if (currentSocket.connected) {
            console.log('✅ Socket already connected, joining immediately');
            joinGroupRoom();
        } else {
            console.log('⏳ Socket not connected, waiting for connect event...');
            console.log('⏳ Socket state:', currentSocket?.readyState);
            currentSocket.once('connect', () => {
                console.log('✅ Socket connect event received!');
                joinGroupRoom();
            });
        }

        const handleMessage = (msg) => {
            console.log('📨 Received message via socket:', msg);

            // Verify this message is for our current group
            if (msg.group && msg.group !== groupId) {
                console.log('⏭️ Message for different group, skipping');
                return;
            }

            const transformed = transformMessage(msg);
            console.log('📝 Transformed message:', transformed);

            // Skip if transform failed
            if (!transformed) {
                console.log('❌ Transform failed, skipping');
                return;
            }

            // Skip only if it's from ME (already added optimistically)
            if (transformed.isMe) {
                console.log('⏭️ Skipping own message (already shown)');
                return;
            }

            console.log('✅ Adding message from other user:', transformed.user);
            setGroupMessages(prev => {
                // Prevent duplicates by checking both id and content+time
                if (prev.some(m => m.id === transformed.id ||
                    (m.message === transformed.message && m.user === transformed.user && m.time === transformed.time))) {
                    console.log('⚠️ Duplicate detected, skipping');
                    return prev;
                }
                return [...prev, transformed];
            });
        };

        socket.on('message:receive', handleMessage);

        return () => {
            console.log('🔌 Leaving Group Chat Room:', groupId);
            socket.emit('group:leave', groupId);
            socket.off('message:receive', handleMessage);
            socket.off('connect', joinGroupRoom);
            // Clear current group when leaving
            setCurrentGroupId(null);
        };
    }, [groupDetailData?._id, user]);

    // Leave Group
    const handleLeaveGroup = async () => {
        if (!groupDetailData?._id) return;

        if (!window.confirm('Are you sure you want to leave this group?')) return;

        setLoading(true);
        try {
            const res = await groupAPI.leave(groupDetailData._id);
            if (res.success) {
                setMyGroups(prev => prev.filter(g => (g._id || g.id) !== groupDetailData._id));
                closeGroupDetail();
                triggerCelebration();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to leave group');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Update Member Role (Admin only)
    const handleUpdateMemberRole = async (memberId, newRole) => {
        if (!groupDetailData?._id) return;

        try {
            const res = await groupAPI.updateMemberRole(groupDetailData._id, memberId, newRole);
            if (res.success) {
                // Update local state
                setGroupDetailData(prev => ({
                    ...prev,
                    members: prev.members.map(m =>
                        (m.user._id || m.user) === memberId ? { ...m, role: newRole } : m
                    )
                }));
                setShowMemberActions(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update role');
            setTimeout(() => setError(null), 3000);
        }
    };

    // Remove Member (Admin only)
    const handleRemoveMember = async (memberId) => {
        if (!groupDetailData?._id) return;
        if (!window.confirm('Are you sure you want to remove this member?')) return;

        try {
            const res = await groupAPI.removeMember(groupDetailData._id, memberId);
            if (res.success) {
                setGroupDetailData(prev => ({
                    ...prev,
                    members: prev.members.filter(m => (m.user._id || m.user) !== memberId)
                }));
                setShowMemberActions(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove member');
            setTimeout(() => setError(null), 3000);
        }
    };

    // Update Group Settings (Admin only)
    const handleUpdateGroupSettings = async () => {
        if (!groupDetailData?._id) return;

        setLoading(true);
        try {
            const res = await groupAPI.update(groupDetailData._id, editGroupData);
            if (res.success) {
                setGroupDetailData(prev => ({ ...prev, ...editGroupData }));
                setMyGroups(prev => prev.map(g =>
                    (g._id || g.id) === groupDetailData._id ? { ...g, ...editGroupData } : g
                ));
                setShowGroupSettings(false);
                setEditGroupData({});
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update group');
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const getColorClasses = (color) => {
        const colors = {
            violet: {
                bg: 'bg-violet-500',
                bgLight: 'bg-violet-500/20',
                border: 'border-violet-500/30',
                text: 'text-violet-400',
                gradient: 'from-violet-500 to-purple-600',
                shadow: 'shadow-violet-500/40'
            },
            cyan: {
                bg: 'bg-cyan-500',
                bgLight: 'bg-cyan-500/20',
                border: 'border-cyan-500/30',
                text: 'text-cyan-400',
                gradient: 'from-cyan-500 to-blue-500',
                shadow: 'shadow-cyan-500/40'
            },
            emerald: {
                bg: 'bg-emerald-500',
                bgLight: 'bg-emerald-500/20',
                border: 'border-emerald-500/30',
                text: 'text-emerald-400',
                gradient: 'from-emerald-500 to-green-600',
                shadow: 'shadow-emerald-500/40'
            },
            pink: {
                bg: 'bg-pink-500',
                bgLight: 'bg-pink-500/20',
                border: 'border-pink-500/30',
                text: 'text-pink-400',
                gradient: 'from-pink-500 to-rose-600',
                shadow: 'shadow-pink-500/40'
            }
        };
        return colors[color] || colors.violet;
    };

    const tabs = [
        { id: 'dashboard', label: 'My Groups', icon: Users },
        { id: 'live-rooms', label: 'Live Rooms', icon: Radio },
        { id: 'challenges', label: 'Challenges', icon: Target },
        { id: 'leaderboard', label: 'Leaderboard', icon: Award }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative pb-16 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-violet-500/15 rounded-full blur-[80px] animate-pulse" />
            <div className="absolute bottom-[10%] right-[10%] w-[700px] h-[700px] bg-pink-500/12 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Grid Background */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}
            />

            {/* Celebration Confetti */}
            {showCelebration && (
                <div className="fixed inset-0 pointer-events-none z-[9999]">
                    {confetti.map(piece => (
                        <div
                            key={piece.id}
                            className={`absolute w-2.5 h-2.5 ${piece.color} animate-bounce`}
                            style={{
                                left: `${piece.left}%`,
                                top: '-10%',
                                animationDuration: `${piece.duration}s`,
                                animationDelay: `${piece.delay}s`,
                                borderRadius: Math.random() > 0.5 ? '50%' : '0'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Error Notification */}
            {error && (
                <div className="fixed top-4 right-4 z-[10000] animate-fadeIn">
                    <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-red-400/50">
                        <X size={20} className="text-red-200" />
                        <div>
                            <div className="font-bold">Error</div>
                            <div className="text-sm">{error}</div>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="ml-4 hover:bg-red-600/50 p-1 rounded transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}


            {/* Create Group Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        className="bg-gradient-to-br from-slate-900/95 to-purple-950/95 rounded-3xl p-10 max-w-[600px] w-[90%] max-h-[80vh] overflow-y-auto border border-violet-500/30 shadow-2xl animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-white flex items-center gap-3">
                                <Users size={32} className="text-violet-500" /> Create / Join Group
                            </h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="bg-red-500/20 text-red-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs for Create / Join */}
                        <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                            <button className="text-white font-bold border-b-2 border-violet-500 pb-2">Create Group</button>
                            <button className="text-slate-400 font-semibold pb-2 hover:text-white transition-colors">Join by Code</button>
                        </div>

                        <div className="mb-6">
                            <label className="text-slate-400 text-sm mb-2 block">Group Name</label>
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="e.g., React Developers Squad"
                                className="w-full p-4 bg-slate-800/80 border border-violet-500/30 rounded-xl text-white text-base focus:outline-none focus:border-violet-500 transition-all"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="text-slate-400 text-sm mb-2 block">Category</label>
                            <select
                                value={newGroupCategory}
                                onChange={(e) => setNewGroupCategory(e.target.value)}
                                className="w-full p-4 bg-slate-800/80 border border-violet-500/30 rounded-xl text-white text-base focus:outline-none focus:border-violet-500 transition-all"
                            >
                                {['General', 'DSA', 'Web Dev', 'AI/ML', 'System Design', 'Mobile Dev', 'DevOps'].map(c => (
                                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="text-slate-400 text-sm mb-2 block">Group Goal</label>
                            <textarea
                                value={newGroupGoal}
                                onChange={(e) => setNewGroupGoal(e.target.value)}
                                placeholder="What do you want to achieve together?"
                                className="w-full min-h-[100px] p-4 bg-slate-800/80 border border-violet-500/30 rounded-xl text-white text-base resize-y focus:outline-none focus:border-violet-500 transition-all"
                            />
                        </div>

                        <div className="mb-8">
                            <label className="text-slate-400 text-sm mb-2 block">Custom Invite Code (Optional)</label>
                            <input
                                type="text"
                                value={customInviteCode}
                                onChange={(e) => setCustomInviteCode(e.target.value.toUpperCase())}
                                placeholder="e.g. DSA123 (Leave empty for auto-generated)"
                                maxLength={10}
                                className="w-full p-4 bg-slate-800/80 border border-violet-500/30 rounded-xl text-white text-base focus:outline-none focus:border-violet-500 transition-all uppercase"
                            />
                        </div>

                        {/* Invide Code Section (for Joining) - To be implemented fully later */}
                        <div className="mb-6 border-t border-white/10 pt-6">
                            <label className="text-slate-400 text-sm mb-2 block">Or Join with Invite Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    placeholder="Enter Code (e.g. DSA12345)"
                                    className="flex-1 p-4 bg-slate-800/80 border border-white/10 rounded-xl text-white text-base focus:outline-none focus:border-emerald-500 transition-all"
                                />
                                <button
                                    onClick={handleJoinGroup}
                                    disabled={loading || !inviteCode}
                                    className="px-6 bg-slate-700 hover:bg-emerald-600 rounded-xl text-white font-bold transition-colors disabled:opacity-50"
                                >
                                    Join
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCreateGroup}
                                disabled={loading}
                                className="flex-1 p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                Create Group
                            </button>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 p-4 bg-slate-800/80 border border-white/10 rounded-xl text-white font-bold hover:bg-slate-700/80 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Challenge Modal */}
            {showCreateChallengeModal && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn"
                    onClick={() => setShowCreateChallengeModal(false)}
                >
                    <div
                        className="bg-gradient-to-br from-slate-900/95 to-purple-950/95 rounded-3xl p-8 max-w-[600px] w-[90%] max-h-[85vh] overflow-y-auto border border-amber-500/30 shadow-2xl animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <Target size={28} className="text-amber-500" />
                                Create Challenge
                            </h2>
                            <button
                                onClick={() => setShowCreateChallengeModal(false)}
                                className="bg-red-500/20 text-red-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Challenge Title */}
                        <div className="mb-5">
                            <label className="text-slate-400 text-sm mb-2 block font-semibold">Challenge Title *</label>
                            <input
                                type="text"
                                value={newChallenge.title}
                                onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Complete 100 DSA Problems"
                                className="w-full p-4 bg-slate-800/80 border border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-5">
                            <label className="text-slate-400 text-sm mb-2 block font-semibold">Description *</label>
                            <textarea
                                value={newChallenge.description}
                                onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe the challenge rules and goals..."
                                rows={3}
                                className="w-full p-4 bg-slate-800/80 border border-amber-500/30 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all resize-none"
                            />
                        </div>

                        {/* Target & Days Row */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="text-slate-400 text-sm mb-2 block font-semibold">Target (number)</label>
                                <input
                                    type="number"
                                    value={newChallenge.target}
                                    onChange={(e) => setNewChallenge(prev => ({ ...prev, target: e.target.value }))}
                                    min="1"
                                    className="w-full p-4 bg-slate-800/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm mb-2 block font-semibold">Days to Complete</label>
                                <input
                                    type="number"
                                    value={newChallenge.days}
                                    onChange={(e) => setNewChallenge(prev => ({ ...prev, days: e.target.value }))}
                                    min="1"
                                    max="365"
                                    className="w-full p-4 bg-slate-800/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div className="mb-5">
                            <label className="text-slate-400 text-sm mb-2 block font-semibold">Category</label>
                            <select
                                value={newChallenge.category}
                                onChange={(e) => setNewChallenge(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full p-4 bg-slate-800/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                            >
                                {['DSA', 'Web Dev', 'AI/ML', 'System Design', 'Mobile Dev', 'DevOps', 'General', 'Competitive', 'Interview Prep'].map(cat => (
                                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Visibility Toggle */}
                        <div className="mb-5">
                            <label className="text-slate-400 text-sm mb-3 block font-semibold">Visibility</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setNewChallenge(prev => ({ ...prev, visibility: 'public' }))}
                                    className={`flex-1 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${newChallenge.visibility === 'public'
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                                        : 'bg-slate-800/60 text-slate-400 border border-white/10 hover:border-emerald-500/50'
                                        }`}
                                >
                                    <Globe size={20} />
                                    Public
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewChallenge(prev => ({ ...prev, visibility: 'private' }))}
                                    className={`flex-1 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${newChallenge.visibility === 'private'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                                        : 'bg-slate-800/60 text-slate-400 border border-white/10 hover:border-amber-500/50'
                                        }`}
                                >
                                    <Lock size={20} />
                                    Private
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {newChallenge.visibility === 'public'
                                    ? '🌍 Anyone on the platform can see and join this challenge'
                                    : '🔒 Only you can see this challenge'}
                            </p>
                        </div>

                        {/* XP Reward */}
                        <div className="mb-6">
                            <label className="text-slate-400 text-sm mb-2 block font-semibold">XP Reward</label>
                            <div className="flex gap-3">
                                {[100, 250, 500, 1000].map(xp => (
                                    <button
                                        key={xp}
                                        type="button"
                                        onClick={() => setNewChallenge(prev => ({ ...prev, reward: xp }))}
                                        className={`flex-1 p-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${newChallenge.reward === xp
                                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                                            : 'bg-slate-800/60 text-slate-400 border border-white/10 hover:border-amber-500/50'
                                            }`}
                                    >
                                        <Zap size={16} />
                                        {xp}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCreateChallenge}
                                disabled={loading}
                                className="flex-1 p-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Target size={20} />}
                                Create Challenge
                            </button>
                            <button
                                onClick={() => setShowCreateChallengeModal(false)}
                                className="flex-1 p-4 bg-slate-800/80 border border-white/10 rounded-xl text-white font-bold hover:bg-slate-700/80 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Challenge Leaderboard Modal */}
            {showChallengeLeaderboard && selectedChallenge && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn"
                    onClick={() => setShowChallengeLeaderboard(false)}
                >
                    <div
                        className="bg-gradient-to-br from-slate-900/95 to-purple-950/95 rounded-3xl p-8 max-w-[600px] w-[90%] max-h-[85vh] overflow-y-auto border border-violet-500/30 shadow-2xl animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Trophy size={28} className="text-amber-500" />
                                    Challenge Leaderboard
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">{selectedChallenge.title}</p>
                            </div>
                            <button
                                onClick={() => setShowChallengeLeaderboard(false)}
                                className="bg-red-500/20 text-red-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Challenge Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-800/50 rounded-xl">
                            <div className="text-center">
                                <div className="text-2xl font-black text-white">{selectedChallenge.target}</div>
                                <div className="text-xs text-slate-400">{selectedChallenge.unit || 'Target'}</div>
                            </div>
                            <div className="text-center border-l border-r border-white/10">
                                <div className="text-2xl font-black text-violet-400">{selectedChallenge.participants?.length || 0}</div>
                                <div className="text-xs text-slate-400">Participants</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-amber-400">{selectedChallenge.reward?.xp || 0}</div>
                                <div className="text-xs text-slate-400">XP Reward</div>
                            </div>
                        </div>

                        {/* Leaderboard List */}
                        <div className="space-y-3">
                            {challengeLeaderboard.length === 0 ? (
                                <div className="text-center py-10">
                                    <Medal size={48} className="mx-auto mb-3 text-slate-600" />
                                    <p className="text-slate-400">No participants yet</p>
                                </div>
                            ) : (
                                challengeLeaderboard.map((participant, index) => (
                                    <div
                                        key={participant.id || index}
                                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${index === 0 ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30' :
                                            index === 1 ? 'bg-slate-700/30 border border-slate-500/30' :
                                                index === 2 ? 'bg-amber-700/20 border border-amber-700/30' :
                                                    'bg-slate-800/50 border border-white/5'
                                            }`}
                                    >
                                        {/* Rank */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' :
                                            index === 1 ? 'bg-slate-400 text-white' :
                                                index === 2 ? 'bg-amber-700 text-white' :
                                                    'bg-slate-700 text-slate-400'
                                            }`}>
                                            {participant.rank || index + 1}
                                        </div>

                                        {/* Avatar */}
                                        <div className="text-3xl">
                                            {participant.avatar?.startsWith('http') || participant.avatar?.startsWith('data:') ? (
                                                <img src={participant.avatar} alt={participant.name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                participant.avatar || '👤'
                                            )}
                                        </div>

                                        {/* Name & Progress */}
                                        <div className="flex-1">
                                            <div className="font-bold text-white flex items-center gap-2">
                                                {participant.name}
                                                {participant.completed && <Check size={16} className="text-emerald-500" />}
                                            </div>
                                            <div className="text-sm text-slate-400">
                                                Progress: {participant.progress || 0}/{selectedChallenge.target} ({participant.percentage || 0}%)
                                            </div>
                                        </div>

                                        {/* Badge */}
                                        {index < 3 && (
                                            <div className="text-2xl">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* Study Room Modal */}
            {showStudyRoom && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn"
                    onClick={() => setShowStudyRoom(false)}
                >
                    <div
                        className="bg-gradient-to-br from-slate-900/95 to-purple-950/95 rounded-3xl p-10 max-w-[1200px] w-[95%] max-h-[90vh] overflow-y-auto border border-violet-500/30 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white">
                                🎥 Live Study Room {isWebRTCInitialized && '- Connected'}
                            </h2>
                            <button
                                onClick={closeStudyRoom}
                                className="bg-red-500/20 text-red-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Video Area */}
                            <div className="lg:col-span-2">
                                <div className="bg-slate-900/80 rounded-2xl p-5 mb-5 min-h-[400px] border border-violet-500/20">
                                    {/* Video Grid */}
                                    <VideoGrid
                                        localStream={localStream}
                                        remoteStreams={remoteStreams}
                                        participants={liveParticipants}
                                        currentUserId={currentUserId}
                                        currentUserName={user?.name || 'You'}
                                        currentUserAvatar={user?.avatar || '👤'}
                                        spotlightUserId={spotlightUserId}
                                        onSpotlightChange={setSpotlightUserId}
                                        localIsCameraOn={isCameraOn}
                                        localIsMicMuted={!isMicOn}
                                    />
                                </div>


                                {/* Controls */}
                                <div className="flex gap-3 justify-center flex-wrap">
                                    <button
                                        onClick={toggleMicrophone}
                                        disabled={!isWebRTCInitialized}
                                        className={`px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all ${isMicOn
                                            ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                                            : 'bg-red-500/20 text-red-400'
                                            } text-white disabled:opacity-50`}
                                    >
                                        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                                        {isMicOn ? 'Mute' : 'Unmute'}
                                    </button>

                                    <button
                                        onClick={toggleCamera}
                                        disabled={!isWebRTCInitialized}
                                        className={`px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all ${isCameraOn
                                            ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                                            : 'bg-red-500/20 text-red-400'
                                            } text-white disabled:opacity-50`}
                                    >
                                        {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
                                        Camera
                                    </button>

                                    <button
                                        onClick={isScreenSharing ? stopScreenSharing : startScreenSharing}
                                        disabled={!isWebRTCInitialized}
                                        className={`px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all border ${isScreenSharing
                                            ? 'bg-gradient-to-r from-violet-500 to-purple-600'
                                            : 'bg-slate-800/80 border-violet-500/30'
                                            } text-white disabled:opacity-50`}
                                    >
                                        <Monitor size={20} />
                                        {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                                    </button>

                                    <button
                                        onClick={() => setShowWhiteboard(!showWhiteboard)}
                                        className={`px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all border ${showWhiteboard
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                            : 'bg-slate-800/80 border-cyan-500/30'
                                            } text-white`}
                                    >
                                        <Edit size={20} />
                                        Whiteboard
                                    </button>
                                </div>

                                {/* Group Pomodoro Timer */}
                                <div className="mt-6 p-6 bg-gradient-to-r from-red-500/15 to-amber-500/15 rounded-2xl border border-red-500/20 text-center">
                                    <h4 className="text-white font-bold mb-4">Group Focus Timer</h4>
                                    <div className="text-5xl font-black bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent mb-4 font-mono">
                                        {formatTime(groupPomodoroTime)}
                                    </div>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => setIsGroupTimerRunning(!isGroupTimerRunning)}
                                            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 ${isGroupTimerRunning
                                                ? 'bg-red-500/30 text-white'
                                                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                                                }`}
                                        >
                                            {isGroupTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                                            {isGroupTimerRunning ? 'Pause' : 'Start'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsGroupTimerRunning(false);
                                                setGroupPomodoroTime(25 * 60);
                                            }}
                                            className="px-5 py-2.5 bg-slate-800/80 border border-white/20 rounded-xl font-bold flex items-center gap-2 text-white"
                                        >
                                            <Square size={16} />
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                {/* Whiteboard Section */}
                                {showWhiteboard && (
                                    <div className="mt-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-white font-bold flex items-center gap-2">
                                                <PenTool size={20} className="text-cyan-400" />
                                                Interactive Whiteboard
                                            </h4>
                                            <button
                                                onClick={() => {
                                                    const newState = !isWhiteboardFullscreen;
                                                    setIsWhiteboardFullscreen(newState);
                                                    const socket = getSocket();
                                                    if (socket && currentRoomId) {
                                                        if (newState) {
                                                            // Entering fullscreen — notify viewers
                                                            socket.emit('room:message', {
                                                                roomId: currentRoomId,
                                                                message: 'SYSTEM:WHITEBOARD_OPEN',
                                                                sender: user?.name,
                                                                senderId: currentUserId,
                                                                senderAvatar: user?.avatar
                                                            });
                                                        } else {
                                                            // Exiting fullscreen — notify viewers to close
                                                            socket.emit('room:message', {
                                                                roomId: currentRoomId,
                                                                message: 'SYSTEM:WHITEBOARD_CLOSE',
                                                                sender: user?.name,
                                                                senderId: currentUserId,
                                                                senderAvatar: user?.avatar
                                                            });
                                                        }
                                                    }
                                                }}
                                                className="px-4 py-2 bg-violet-500/20 text-violet-400 rounded-lg font-bold flex items-center gap-2 hover:bg-violet-500/30 transition-all text-sm"
                                            >
                                                <Maximize2 size={16} />
                                                {isWhiteboardFullscreen ? 'Stop Presenting' : 'Present (Fullscreen)'}
                                            </button>
                                        </div>
                                        <Whiteboard
                                            isOpen={showWhiteboard}
                                            onClose={() => setShowWhiteboard(false)}
                                            isFullscreen={isWhiteboardFullscreen}
                                            onToggleFullscreen={() => setIsWhiteboardFullscreen(!isWhiteboardFullscreen)}
                                            roomId={currentRoomId}
                                        />
                                    </div>
                                )}
                            </div>


                            {/* Participants & Chat Sidebar */}
                            <div>
                                <div className="bg-slate-800/80 rounded-2xl p-5 mb-5 border border-violet-500/20">
                                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <Users size={20} className="text-emerald-500" /> Participants ({liveParticipants.length})
                                    </h4>
                                    <div className="space-y-3">
                                        {liveParticipants.map(user => (
                                            <div key={user.id} className="flex items-center gap-3 p-2.5 bg-slate-900/50 rounded-xl">
                                                <div className="relative">
                                                    {user.avatar && user.avatar.startsWith('http') ? (
                                                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="text-3xl">{user.avatar || '👤'}</div>
                                                    )}
                                                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${user.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-white font-semibold">
                                                        {user.name || user.userName || 'Participant'}
                                                    </div>
                                                    <div className="text-xs text-slate-400">{user.studying || 'In room'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Chat */}
                                <div className="bg-slate-800/80 rounded-2xl p-5 border border-violet-500/20">
                                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                        <MessageCircle size={20} className="text-cyan-500" /> Quick Chat
                                    </h4>
                                    <div className="h-[200px] bg-slate-900/50 rounded-xl p-3 mb-3 overflow-y-auto">
                                        {chatMessages.length === 0 ? (
                                            <div className="text-sm text-slate-400 text-center">
                                                Chat in real-time with participants...
                                            </div>
                                        ) : (
                                            chatMessages.map(msg => (
                                                <div key={msg.id} className="mb-3">
                                                    <div className="text-xs text-slate-400 mb-1">
                                                        {msg.user} • {msg.time}
                                                    </div>
                                                    <div className="text-sm text-white">{msg.message}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={currentMessage}
                                            onChange={(e) => setCurrentMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                            placeholder="Type a message..."
                                            className="flex-1 p-2.5 bg-slate-900/50 border border-violet-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 rounded-lg text-white"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Group Detail Modal */}
            {showGroupDetail && groupDetailData && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn"
                    onClick={closeGroupDetail}
                >
                    <div
                        className="bg-gradient-to-br from-slate-900/95 to-purple-950/95 rounded-3xl max-w-[1200px] w-[95%] max-h-[90vh] overflow-y-auto border border-violet-500/30 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-violet-500/20 p-6 z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-6xl">
                                        {(groupDetailData.avatar && (groupDetailData.avatar.startsWith('http') || groupDetailData.avatar.startsWith('data:'))) ? (
                                            <img src={groupDetailData.avatar} alt={groupDetailData.name} className="w-16 h-16 rounded-2xl object-cover shadow-xl" />
                                        ) : (
                                            groupDetailData.avatar || '👥'
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white mb-1">{groupDetailData.name}</h2>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-slate-400 flex items-center gap-1.5">
                                                <Users size={16} />
                                                {groupDetailData.members?.length || groupDetailData.members || 0} members
                                            </span>
                                            <span className="text-emerald-500 flex items-center gap-1.5">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                {groupDetailData.activeNow || Math.floor((groupDetailData.members?.length || 3) / 2)} online
                                            </span>
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getColorClasses(groupDetailData.color).bgLight} ${getColorClasses(groupDetailData.color).text}`}>
                                                {groupDetailData.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={closeGroupDetail}
                                    className="bg-red-500/20 text-red-500 w-12 h-12 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Invite Code */}
                            <div className="flex items-center gap-3 p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                                <Hash size={20} className="text-violet-400" />
                                <div className="flex-1">
                                    <div className="text-xs text-slate-400 mb-1">Invite Code</div>
                                    <div className="text-lg font-mono font-bold text-white tracking-wider">
                                        {groupDetailData.inviteCode}
                                    </div>
                                </div>
                                <button
                                    onClick={copyInviteCode}
                                    className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${copiedInviteCode
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                                        }`}
                                >
                                    {copiedInviteCode ? (
                                        <>
                                            <Check size={18} />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-3 mt-4 flex-wrap">
                                {['chat', 'members', 'studyroom', 'settings'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveGroupTab(tab)}
                                        className={`px-5 py-2.5 rounded-xl font-bold capitalize transition-all ${activeGroupTab === tab
                                            ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                                            : 'bg-slate-800/60 text-slate-400 hover:bg-violet-500/20 hover:text-white'
                                            }`}
                                    >
                                        {tab === 'chat' && <MessageCircle size={18} className="inline mr-2" />}
                                        {tab === 'members' && <Users size={18} className="inline mr-2" />}
                                        {tab === 'studyroom' && <Video size={18} className="inline mr-2" />}
                                        {tab === 'settings' && <Settings size={18} className="inline mr-2" />}
                                        {tab === 'studyroom' ? 'Study Room' : tab}
                                    </button>
                                ))}
                                {/* Admin Requests Tab */}
                                {(groupDetailData.admins?.some(a => (a._id || a) === currentUserId) || groupDetailData.creator?._id === currentUserId) && (
                                    <button
                                        onClick={() => {
                                            setActiveGroupTab('requests');
                                            // Fetch requests
                                            groupAPI.getJoinRequests(groupDetailData._id).then(res => setJoinRequests(res.requests || []));
                                        }}
                                        className={`px-5 py-2.5 rounded-xl font-bold capitalize transition-all ${activeGroupTab === 'requests'
                                            ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                                            : 'bg-slate-800/60 text-slate-400 hover:bg-violet-500/20 hover:text-white'
                                            }`}
                                    >
                                        <Bell size={18} className="inline mr-2" />
                                        Requests
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Chat Tab */}
                            {activeGroupTab === 'chat' && (
                                <div className="space-y-4">
                                    <div className="bg-slate-800/60 rounded-2xl p-6 border border-violet-500/20 min-h-[400px] max-h-[500px] overflow-y-auto">
                                        {loadingGroupDetail ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="animate-spin text-violet-500" size={32} />
                                            </div>
                                        ) : groupMessages.length === 0 ? (
                                            <div className="text-center text-slate-400 py-20">
                                                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                                                <p>No messages yet. Start the conversation!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {groupMessages.map(msg => (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}
                                                    >
                                                        <div className="text-3xl flex-shrink-0">
                                                            {(msg.avatar && (msg.avatar.startsWith('http') || msg.avatar.startsWith('data:'))) ? (
                                                                <img src={msg.avatar} alt={msg.user} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                                            ) : (
                                                                msg.avatar || '👤'
                                                            )}
                                                        </div>
                                                        <div className={`flex-1 ${msg.isMe ? 'text-right' : ''}`}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-sm font-bold ${msg.isMe ? 'text-violet-400' : 'text-white'}`}>
                                                                    {msg.user}
                                                                </span>
                                                                <span className="text-xs text-slate-500">{msg.time}</span>
                                                            </div>
                                                            <div
                                                                className={`inline-block px-4 py-2.5 rounded-2xl ${msg.isMe
                                                                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                                                                    : 'bg-slate-700/80 text-white'
                                                                    }`}
                                                            >
                                                                {msg.message}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Input */}
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={groupMessageInput}
                                            onChange={(e) => setGroupMessageInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && sendGroupMessage()}
                                            placeholder="Type your message..."
                                            className="flex-1 px-5 py-4 bg-slate-800/80 border border-violet-500/30 rounded-xl text-white focus:outline-none focus:border-violet-500 transition-all"
                                        />
                                        <button
                                            onClick={sendGroupMessage}
                                            className="bg-gradient-to-r from-violet-500 to-purple-600 px-8 py-4 rounded-xl text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                                        >
                                            <Send size={20} />
                                            Send
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Members Tab */}
                            {activeGroupTab === 'members' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-2xl font-bold text-white">
                                            Group Members ({groupDetailData.members?.length || 0})
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(groupDetailData.members || []).map((member, idx) => {
                                            const userData = member.user || member;
                                            const memberId = userData._id || userData.id || idx;
                                            const isCurrentUser = memberId === 'currentUser'; // Replace with actual user check

                                            return (
                                                <div
                                                    key={memberId}
                                                    className="bg-slate-800/60 rounded-2xl p-5 border border-violet-500/20 hover:border-violet-500/40 transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-4xl">
                                                            {(userData.avatar && (userData.avatar.startsWith('http') || userData.avatar.startsWith('data:'))) ? (
                                                                <img src={userData.avatar} alt={userData.name} className="w-10 h-10 rounded-full object-cover" />
                                                            ) : (
                                                                userData.avatar || '👤'
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-lg font-bold text-white">
                                                                    {userData.name || 'Unknown'}
                                                                </span>
                                                                {member.role === 'admin' && (
                                                                    <Crown size={16} className="text-amber-500" />
                                                                )}
                                                                {member.role === 'moderator' && (
                                                                    <Shield size={16} className="text-cyan-500" />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-sm">
                                                                <span className={`px-2.5 py-1 rounded-lg font-bold ${member.role === 'admin'
                                                                    ? 'bg-amber-500/20 text-amber-400'
                                                                    : member.role === 'moderator'
                                                                        ? 'bg-cyan-500/20 text-cyan-400'
                                                                        : 'bg-slate-700/60 text-slate-400'
                                                                    }`}>
                                                                    {member.role || 'member'}
                                                                </span>
                                                                <span className="text-slate-400 flex items-center gap-1">
                                                                    <Star size={14} className="text-violet-400" />
                                                                    {member.xpContributed || 0} XP
                                                                </span>
                                                                <span className="text-slate-400 flex items-center gap-1">
                                                                    <Flame size={14} className="text-amber-400" />
                                                                    {member.streak || 0}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Member Actions (Admin only) */}
                                                        {!isCurrentUser && (
                                                            <div className="relative">
                                                                <button
                                                                    onClick={() => setShowMemberActions(showMemberActions === memberId ? null : memberId)}
                                                                    className="p-2 bg-slate-700/60 rounded-lg hover:bg-slate-700 transition-all"
                                                                >
                                                                    <Settings size={18} className="text-slate-400" />
                                                                </button>

                                                                {showMemberActions === memberId && (
                                                                    <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-violet-500/30 rounded-xl overflow-hidden shadow-2xl z-20 min-w-[180px]">
                                                                        <button
                                                                            onClick={() => handleUpdateMemberRole(memberId, 'admin')}
                                                                            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-violet-500/20 flex items-center gap-2"
                                                                        >
                                                                            <Crown size={16} className="text-amber-500" />
                                                                            Make Admin
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateMemberRole(memberId, 'moderator')}
                                                                            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-violet-500/20 flex items-center gap-2"
                                                                        >
                                                                            <Shield size={16} className="text-cyan-500" />
                                                                            Make Moderator
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateMemberRole(memberId, 'member')}
                                                                            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-violet-500/20 flex items-center gap-2"
                                                                        >
                                                                            <Users size={16} className="text-slate-400" />
                                                                            Make Member
                                                                        </button>
                                                                        <div className="border-t border-white/10" />
                                                                        <button
                                                                            onClick={() => handleRemoveMember(memberId)}
                                                                            className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/20 flex items-center gap-2"
                                                                        >
                                                                            <UserMinus size={16} />
                                                                            Remove Member
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Study Room Tab */}
                            {activeGroupTab === 'studyroom' && (
                                <div className="space-y-6">
                                    {/* Study Room Hero */}
                                    <div className="bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl p-8 border border-violet-500/30 text-center">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 mb-4">
                                            <Video size={40} className="text-white" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2">Group Study Room</h3>
                                        <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                                            Start a live video study session with your group members.
                                            Share screens, use the whiteboard, and stay focused together with the group pomodoro timer!
                                        </p>

                                        <button
                                            onClick={() => joinStudyRoomWithWebRTC(groupDetailData?._id || groupDetailData?.id || 'default-room')}
                                            className="px-8 py-4 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-xl font-bold text-white text-lg flex items-center gap-3 mx-auto hover:scale-105 transition-transform shadow-lg shadow-violet-500/30"
                                        >
                                            <Video size={24} />
                                            Start Study Session
                                        </button>
                                    </div>

                                    {/* Features Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-slate-800/60 rounded-xl p-5 border border-violet-500/20">
                                            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                                                <Camera size={24} className="text-emerald-400" />
                                            </div>
                                            <h4 className="font-bold text-white mb-1">Video Calls</h4>
                                            <p className="text-sm text-slate-400">See your study partners and stay connected face-to-face.</p>
                                        </div>

                                        <div className="bg-slate-800/60 rounded-xl p-5 border border-violet-500/20">
                                            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3">
                                                <Monitor size={24} className="text-cyan-400" />
                                            </div>
                                            <h4 className="font-bold text-white mb-1">Screen Sharing</h4>
                                            <p className="text-sm text-slate-400">Share your screen to explain concepts or solve problems together.</p>
                                        </div>

                                        <div className="bg-slate-800/60 rounded-xl p-5 border border-violet-500/20">
                                            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3">
                                                <Clock size={24} className="text-amber-400" />
                                            </div>
                                            <h4 className="font-bold text-white mb-1">Group Focus Timer</h4>
                                            <p className="text-sm text-slate-400">Synchronized pomodoro timer to keep everyone focused.</p>
                                        </div>
                                    </div>

                                    {/* Active Members Section */}
                                    <div className="bg-slate-800/60 rounded-2xl p-6 border border-violet-500/20">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-white flex items-center gap-2">
                                                <Users size={20} className="text-violet-400" />
                                                Group Members
                                            </h4>
                                            <span className="text-sm text-emerald-400">
                                                {groupDetailData?.members?.length || 0} members
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {(groupDetailData?.members || []).slice(0, 10).map((member, idx) => {
                                                const memberUser = member.user || member;
                                                return (
                                                    <div
                                                        key={memberUser._id || idx}
                                                        className="flex items-center gap-2 bg-slate-700/60 px-3 py-2 rounded-lg"
                                                    >
                                                        <div className="text-xl">
                                                            {(memberUser.avatar && (memberUser.avatar.startsWith('http') || memberUser.avatar.startsWith('data:'))) ? (
                                                                <img src={memberUser.avatar} alt={memberUser.name} className="w-6 h-6 rounded-full object-cover" />
                                                            ) : (
                                                                memberUser.avatar || '👤'
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-white">{memberUser.name}</span>
                                                        {member.role === 'admin' && <Crown size={14} className="text-amber-500" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Settings Tab */}
                            {activeGroupTab === 'settings' && (
                                <div className="space-y-6">
                                    <div className="bg-slate-800/60 rounded-2xl p-6 border border-violet-500/20">
                                        <h3 className="text-xl font-bold text-white mb-4">Group Information</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm text-slate-400 mb-2 block">Group Goal</label>
                                                <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                                                    <p className="text-white">{groupDetailData.goal}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-slate-400 mb-2 block">Progress</label>
                                                    <div className="p-4 bg-slate-700/60 rounded-xl">
                                                        <div className="text-2xl font-black text-white">{groupDetailData.progress || 0}%</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400 mb-2 block">Group Streak</label>
                                                    <div className="p-4 bg-slate-700/60 rounded-xl flex items-center gap-2">
                                                        <Flame size={24} className="text-amber-500" />
                                                        <div className="text-2xl font-black text-white">{groupDetailData.streak || 0} days</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                                                    <div className="text-xs text-slate-400 mb-1">Total XP</div>
                                                    <div className="text-2xl font-black text-emerald-500">
                                                        {groupDetailData.stats?.totalXp || groupDetailData.totalPoints || 0}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-center">
                                                    <div className="text-xs text-slate-400 mb-1">Sessions</div>
                                                    <div className="text-2xl font-black text-cyan-500">
                                                        {groupDetailData.stats?.sessionsCompleted || 0}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-pink-500/10 rounded-xl border border-pink-500/20 text-center">
                                                    <div className="text-xs text-slate-400 mb-1">Resources</div>
                                                    <div className="text-2xl font-black text-pink-500">
                                                        {groupDetailData.stats?.resourcesShared || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Settings */}
                                    <div className="bg-slate-800/60 rounded-2xl p-6 border border-violet-500/20">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Settings size={20} className="text-violet-500" />
                                            Group Settings (Admin Only)
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm text-slate-400 mb-2 block">Group Name</label>
                                                <input
                                                    type="text"
                                                    defaultValue={groupDetailData.name}
                                                    onChange={(e) => setEditGroupData(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full p-3 bg-slate-900/50 border border-violet-500/20 rounded-xl text-white focus:outline-none focus:border-violet-500"
                                                    placeholder="Group name"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm text-slate-400 mb-2 block">Goal/Description</label>
                                                <textarea
                                                    defaultValue={groupDetailData.goal}
                                                    onChange={(e) => setEditGroupData(prev => ({ ...prev, goal: e.target.value }))}
                                                    className="w-full p-3 bg-slate-900/50 border border-violet-500/20 rounded-xl text-white focus:outline-none focus:border-violet-500 min-h-[100px]"
                                                    placeholder="What do you want to achieve?"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-slate-400 mb-2 block">Category</label>
                                                    <select
                                                        defaultValue={groupDetailData.category}
                                                        onChange={(e) => setEditGroupData(prev => ({ ...prev, category: e.target.value }))}
                                                        className="w-full p-3 bg-slate-900/50 border border-violet-500/20 rounded-xl text-white focus:outline-none focus:border-violet-500"
                                                    >
                                                        {['General', 'DSA', 'Web Dev', 'AI/ML', 'System Design', 'Mobile Dev', 'DevOps'].map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400 mb-2 block">Privacy</label>
                                                    <select
                                                        defaultValue={groupDetailData.privacy || 'public'}
                                                        onChange={(e) => setEditGroupData(prev => ({ ...prev, privacy: e.target.value }))}
                                                        className="w-full p-3 bg-slate-900/50 border border-violet-500/20 rounded-xl text-white focus:outline-none focus:border-violet-500"
                                                    >
                                                        <option value="public">Public</option>
                                                        <option value="private">Private</option>
                                                        <option value="invite-only">Invite Only</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleUpdateGroupSettings}
                                                disabled={loading || Object.keys(editGroupData).length === 0}
                                                className="w-full p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white font-bold hover:scale-[1.02] transition-transform disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <Loader2 className="animate-spin inline mr-2" size={20} />
                                                ) : null}
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/30">
                                        <h3 className="text-xl font-bold text-red-500 mb-4">Danger Zone</h3>
                                        <button
                                            onClick={handleLeaveGroup}
                                            disabled={loading}
                                            className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-500 font-bold flex items-center justify-center gap-2 transition-all"
                                        >
                                            <LogOut size={20} />
                                            Leave Group
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Requests Tab */}
                            {activeGroupTab === 'requests' && (
                                <div className="space-y-6">
                                    <div className="bg-slate-800/60 rounded-2xl p-6 border border-violet-500/20">
                                        <h3 className="text-xl font-bold text-white mb-4">Join Requests</h3>
                                        {joinRequests.length === 0 ? (
                                            <p className="text-slate-400">No pending requests.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {joinRequests.map(req => (
                                                    <div key={req._id || req.user._id} className="flex items-center justify-between bg-slate-700/50 p-4 rounded-xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-2xl">
                                                                {(req.user.avatar && (req.user.avatar.startsWith('http') || req.user.avatar.startsWith('data:'))) ? (
                                                                    <img src={req.user.avatar} alt={req.user.name} className="w-10 h-10 rounded-full object-cover" />
                                                                ) : (
                                                                    req.user.avatar || '👤'
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white">{req.user.name}</div>
                                                                <div className="text-xs text-slate-400">Requested: {new Date(req.requestedAt).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await groupAPI.handleJoinRequest(groupDetailData._id, req.user._id, 'accept');
                                                                        setJoinRequests(prev => prev.filter(r => r.user._id !== req.user._id));
                                                                        // Update modal data to show new member count etc
                                                                        const updatedGroup = await groupAPI.getById(groupDetailData._id);
                                                                        setGroupDetailData(updatedGroup.group);
                                                                    } catch (e) {
                                                                        console.error(e);
                                                                    }
                                                                }}
                                                                className="px-4 py-2 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 rounded-lg flex items-center gap-1 font-bold transition-all"
                                                            >
                                                                <Check size={16} /> Accept
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await groupAPI.handleJoinRequest(groupDetailData._id, req.user._id, 'reject');
                                                                        setJoinRequests(prev => prev.filter(r => r.user._id !== req.user._id));
                                                                    } catch (e) {
                                                                        console.error(e);
                                                                    }
                                                                }}
                                                                className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg flex items-center gap-1 font-bold transition-all"
                                                            >
                                                                <X size={16} /> Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-violet-500/10 sticky top-0 z-50 px-8 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={closeGroupDetail}
                        className="flex items-center gap-3 bg-violet-500/10 text-violet-400 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-violet-500/20 hover:-translate-x-1 transition-all"
                    >
                        <ArrowLeft size={18} />
                        Back to Groups
                    </button>

                    <div className="text-2xl font-black bg-gradient-to-r from-white via-violet-400 to-blue-400 bg-clip-text text-transparent">
                        GROUP STUDY HUB
                    </div>

                    <div className="flex gap-3 items-center">
                        <button
                            onClick={() => joinStudyRoomWithWebRTC(groupDetailData?._id || groupDetailData?.id || 'default-room')}
                            className="bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <Radio size={18} />
                            Live Room
                        </button>
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500" />
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-8 py-10 relative z-10">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-10 mb-8 border border-violet-500/20 shadow-2xl shadow-violet-500/20 relative overflow-hidden animate-slideDown">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

                    <div className="flex items-center gap-6 flex-wrap justify-between">
                        <div className="flex items-center gap-6">
                            <div className="bg-gradient-to-r from-violet-500 to-pink-500 p-6 rounded-2xl shadow-xl shadow-violet-500/40 animate-bounce">
                                <Users2 size={48} className="text-white" />
                            </div>
                            <div>
                                <div className="text-sm text-violet-400 font-bold tracking-widest mb-2 uppercase">
                                    🚀 Collaborative Learning Ecosystem
                                </div>
                                <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
                                    Group Study Hub
                                </h1>
                                <p className="text-lg text-slate-400">
                                    Learn together, grow faster with your study groups
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-4 rounded-xl text-base font-bold text-white flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-emerald-500/30"
                        >
                            <Plus size={20} />
                            Create New Group
                        </button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                    <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3.5 rounded-xl shadow-lg">
                                <Users size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-semibold uppercase">Active Groups</div>
                                <div className="text-3xl font-black bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                                    {myGroups.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-3.5 rounded-xl shadow-lg">
                                <Video size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-semibold uppercase">Live Rooms</div>
                                <div className="text-3xl font-black bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                                    {liveRooms.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-3.5 rounded-xl shadow-lg">
                                <Target size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-semibold uppercase">Challenges</div>
                                <div className="text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                                    {groupChallenges.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-3.5 rounded-xl shadow-lg">
                                <Radio size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-semibold uppercase">Live Now</div>
                                <div className="text-3xl font-black bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">
                                    {liveParticipants.length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mb-8 flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-xl shadow-violet-500/30'
                                : 'bg-slate-800/60 text-white hover:bg-violet-500/20 hover:scale-105'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* MY GROUPS TAB */}
                {activeTab === 'dashboard' && (
                    <div className="animate-fadeIn">
                        <div className="mb-8">
                            <div className="relative max-w-xl">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search groups..."
                                    className="w-full py-3.5 pl-12 pr-4 bg-slate-800/60 border border-violet-500/20 rounded-xl text-white focus:outline-none focus:border-violet-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {myGroups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(group => {
                                const colors = getColorClasses(group.color);
                                return (
                                    <div
                                        key={group.id}
                                        className={`bg-slate-800/60 backdrop-blur-xl rounded-2xl p-7 border ${colors.border} hover:-translate-y-3 hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden group`}
                                        onClick={() => openGroupDetail(group)}
                                    >
                                        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colors.gradient}`} />

                                        <div className="text-center mb-5">
                                            <div className="text-6xl mb-3 group-hover:animate-bounce">
                                                {(group.avatar && (group.avatar.startsWith('http') || group.avatar.startsWith('data:'))) ? (
                                                    <img src={group.avatar} alt={group.name} className="w-16 h-16 mx-auto rounded-2xl object-cover shadow-lg" />
                                                ) : (
                                                    group.avatar || '👥'
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>
                                            <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Users size={16} />
                                                    {Array.isArray(group.members) ? group.members.length : group.members} members
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                    {group.activeNow} online
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-5">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-slate-400 font-semibold">Group Progress</span>
                                                <span className="text-sm font-bold text-white">{group.progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-violet-500/20 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-1000`}
                                                    style={{ width: `${group.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className={`p-3 ${colors.bgLight} rounded-xl mb-4`}>
                                            <div className={`text-xs ${colors.text} font-bold uppercase mb-1`}>GROUP GOAL</div>
                                            <div className="text-sm text-white">{group.goal}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="text-center p-3 bg-amber-500/10 rounded-xl">
                                                <Flame size={20} className="text-amber-500 mx-auto mb-1" />
                                                <div className="text-xl font-black text-amber-500">{group.streak}</div>
                                                <div className="text-xs text-slate-400">Day Streak</div>
                                            </div>
                                            <div className="text-center p-3 bg-violet-500/10 rounded-xl">
                                                <Star size={20} className="text-violet-500 mx-auto mb-1" />
                                                <div className="text-xl font-black text-violet-500">{group.totalPoints}</div>
                                                <div className="text-xs text-slate-400">Total XP</div>
                                            </div>
                                        </div>

                                        <button className={`w-full bg-gradient-to-r ${colors.gradient} py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform`}>
                                            <ChevronRight size={18} />
                                            Open Group
                                        </button>

                                        <div className="mt-3 text-center text-xs text-gray-500">
                                            Last activity: {group.lastActivity}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* LIVE ROOMS TAB */}
                {activeTab === 'live-rooms' && (
                    <div className="animate-fadeIn">
                        <div className="mb-8 flex gap-4 flex-wrap items-center">
                            <div className="relative flex-1 min-w-[300px]">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search live rooms..."
                                    className="w-full py-3.5 pl-12 pr-4 bg-slate-800/60 border border-violet-500/20 rounded-xl text-white focus:outline-none focus:border-violet-500 transition-all"
                                />
                            </div>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-5 py-3.5 bg-slate-800/60 border border-violet-500/20 rounded-xl text-white cursor-pointer focus:outline-none"
                            >
                                <option value="all">All Categories</option>
                                <option value="DSA">DSA</option>
                                <option value="Web Dev">Web Development</option>
                                <option value="AI/ML">AI/ML</option>
                                <option value="System Design">System Design</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {liveRooms.filter(r => filterCategory === 'all' || r.category === filterCategory).map(room => (
                                <div
                                    key={room.id}
                                    onClick={() => handleJoinRoom(room.id)}
                                    className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-7 border border-white/5 hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 rounded-full text-xs font-bold text-red-500">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        LIVE
                                    </div>

                                    <div className="mb-5">
                                        <div className="text-5xl mb-3">
                                            {(room.avatar && (room.avatar.startsWith('http') || room.avatar.startsWith('data:'))) ? (
                                                <img src={room.avatar} alt={room.name} className="w-14 h-14 rounded-xl object-cover" />
                                            ) : (
                                                room.avatar || '🎥'
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{room.name}</h3>
                                        <div className="text-sm text-slate-400 mb-1">Host: {room.host}</div>
                                        <div className="text-base text-violet-400">{room.topic}</div>
                                    </div>

                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        <span className="px-3 py-1.5 bg-violet-500/20 rounded-lg text-xs text-violet-400">{room.category}</span>
                                        <span className="px-3 py-1.5 bg-emerald-500/20 rounded-lg text-xs text-emerald-400">{room.difficulty}</span>
                                        <span className="px-3 py-1.5 bg-cyan-500/20 rounded-lg text-xs text-cyan-400">{room.language}</span>
                                    </div>

                                    <div className="flex justify-between mb-4 text-sm">
                                        <span className="text-slate-400 flex items-center gap-1.5">
                                            <Users size={16} />
                                            {Array.isArray(room.participants) ? room.participants.length : room.participants} participants
                                        </span>
                                        <span className="text-slate-400 flex items-center gap-1.5">
                                            <Clock size={16} />
                                            {room.duration}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => joinStudyRoomWithWebRTC(room.id)}
                                        className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-500 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                                    >
                                        <Video size={18} />
                                        Join Room
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CHALLENGES TAB */}
                {activeTab === 'challenges' && (
                    <div className="animate-fadeIn">
                        {/* Header with Create Button */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                                    <Target className="text-amber-500" size={28} />
                                    Challenges Hub
                                </h2>
                                <p className="text-slate-400">Create, join, and complete challenges to earn XP!</p>
                            </div>
                            <button
                                onClick={() => setShowCreateChallengeModal(true)}
                                className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3.5 rounded-xl text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-emerald-500/30"
                            >
                                <Plus size={20} />
                                Create Challenge
                            </button>
                        </div>

                        {/* Challenge Type Tabs */}
                        <div className="flex gap-3 mb-6 flex-wrap">
                            <button
                                onClick={() => setChallengeTab('public')}
                                className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${challengeTab === 'public'
                                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/30'
                                    : 'bg-slate-800/60 text-slate-300 hover:bg-violet-500/20'
                                    }`}
                            >
                                <Globe size={18} />
                                Public Challenges
                            </button>
                            <button
                                onClick={() => setChallengeTab('my')}
                                className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${challengeTab === 'my'
                                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/30'
                                    : 'bg-slate-800/60 text-slate-300 hover:bg-violet-500/20'
                                    }`}
                            >
                                <Lock size={18} />
                                My Challenges
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-3 mb-8 flex-wrap">
                            {['all', 'DSA', 'Web Dev', 'AI/ML', 'System Design', 'Competitive', 'Interview Prep'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setChallengeFilterCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${challengeFilterCategory === cat
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {cat === 'all' ? 'All' : cat}
                                </button>
                            ))}
                        </div>

                        {/* Loading State */}
                        {loadingChallenges && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-violet-500" size={40} />
                            </div>
                        )}

                        {/* Public Challenges */}
                        {challengeTab === 'public' && !loadingChallenges && (
                            <div>
                                {publicChallenges.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-800/40 rounded-2xl border border-violet-500/20">
                                        <Globe size={60} className="mx-auto mb-4 text-slate-600" />
                                        <h3 className="text-xl font-bold text-white mb-2">No Public Challenges Yet</h3>
                                        <p className="text-slate-400 mb-6">Be the first to create a public challenge!</p>
                                        <button
                                            onClick={() => setShowCreateChallengeModal(true)}
                                            className="bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-3 rounded-xl text-white font-bold hover:scale-105 transition-transform"
                                        >
                                            Create Public Challenge
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {publicChallenges
                                            .filter(c => challengeFilterCategory === 'all' || c.category === challengeFilterCategory)
                                            .map(challenge => {
                                                const participantCount = challenge.participants?.length || 0;
                                                const isParticipant = challenge.participants?.some(p =>
                                                    (p.user?._id || p.user) === currentUserId
                                                );
                                                const deadline = new Date(challenge.deadline);
                                                const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));

                                                return (
                                                    <div
                                                        key={challenge._id || challenge.id}
                                                        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-violet-500/20 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group"
                                                    >
                                                        {/* Public Badge */}
                                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 rounded-full text-xs font-bold text-emerald-400">
                                                            <Globe size={12} />
                                                            PUBLIC
                                                        </div>

                                                        {/* Icon & Title */}
                                                        <div className="mb-4">
                                                            <div className="text-4xl mb-3">{challenge.icon || '🎯'}</div>
                                                            <h3 className="text-xl font-bold text-white mb-2 pr-16">{challenge.title}</h3>
                                                            <p className="text-sm text-slate-400 line-clamp-2">{challenge.description}</p>
                                                        </div>

                                                        {/* Category & Creator */}
                                                        <div className="flex gap-2 mb-4 flex-wrap">
                                                            <span className="px-3 py-1.5 bg-violet-500/20 rounded-lg text-xs font-semibold text-violet-400">
                                                                {challenge.category || 'General'}
                                                            </span>
                                                            <span className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-xs text-slate-300">
                                                                by {challenge.creator?.name || 'Unknown'}
                                                            </span>
                                                        </div>

                                                        {/* Progress Bar */}
                                                        <div className="mb-4">
                                                            <div className="flex justify-between mb-1.5 text-sm">
                                                                <span className="text-slate-400">Target: {challenge.target} {challenge.unit}</span>
                                                                <span className="text-amber-400 font-bold flex items-center gap-1">
                                                                    <Zap size={14} />
                                                                    {challenge.reward?.xp || 100} XP
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Stats */}
                                                        <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-white/5">
                                                            <div className="text-center">
                                                                <div className="text-lg font-black text-white">{participantCount}</div>
                                                                <div className="text-xs text-slate-400">Joined</div>
                                                            </div>
                                                            <div className="text-center border-l border-r border-white/5">
                                                                <div className={`text-lg font-black ${daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                                    {daysLeft > 0 ? daysLeft : 0}
                                                                </div>
                                                                <div className="text-xs text-slate-400">Days Left</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-lg font-black text-violet-400">{challenge.totalViews || 0}</div>
                                                                <div className="text-xs text-slate-400">Views</div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex gap-2">
                                                            {isParticipant ? (
                                                                <button
                                                                    onClick={() => handleViewLeaderboard(challenge)}
                                                                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                                                                >
                                                                    <Trophy size={18} />
                                                                    View Leaderboard
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleJoinChallenge(challenge._id || challenge.id)}
                                                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                                                                >
                                                                    <Plus size={18} />
                                                                    Join Challenge
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleViewLeaderboard(challenge)}
                                                                className="p-3 bg-slate-700/50 rounded-xl text-slate-300 hover:bg-violet-500/30 hover:text-white transition-all"
                                                                title="View Leaderboard"
                                                            >
                                                                <Medal size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Challenges */}
                        {challengeTab === 'my' && !loadingChallenges && (
                            <div>
                                {myChallenges.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-800/40 rounded-2xl border border-violet-500/20">
                                        <Target size={60} className="mx-auto mb-4 text-slate-600" />
                                        <h3 className="text-xl font-bold text-white mb-2">No Challenges Created Yet</h3>
                                        <p className="text-slate-400 mb-6">Create your first challenge and invite others to join!</p>
                                        <button
                                            onClick={() => setShowCreateChallengeModal(true)}
                                            className="bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-3 rounded-xl text-white font-bold hover:scale-105 transition-transform"
                                        >
                                            Create My First Challenge
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {myChallenges.map(challenge => {
                                            const participantCount = challenge.participants?.length || 0;
                                            const deadline = new Date(challenge.deadline);
                                            const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));

                                            return (
                                                <div
                                                    key={challenge._id || challenge.id}
                                                    className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/20 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                                                >
                                                    {/* Visibility Badge */}
                                                    <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${challenge.visibility === 'public'
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-amber-500/20 text-amber-400'
                                                        }`}>
                                                        {challenge.visibility === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                                                        {challenge.visibility?.toUpperCase() || 'PRIVATE'}
                                                    </div>

                                                    {/* Icon & Title */}
                                                    <div className="mb-4">
                                                        <div className="text-4xl mb-3">{challenge.icon || '🎯'}</div>
                                                        <h3 className="text-xl font-bold text-white mb-2 pr-16">{challenge.title}</h3>
                                                        <p className="text-sm text-slate-400 line-clamp-2">{challenge.description}</p>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-white/5">
                                                        <div className="text-center">
                                                            <div className="text-lg font-black text-white">{participantCount}</div>
                                                            <div className="text-xs text-slate-400">Participants</div>
                                                        </div>
                                                        <div className="text-center border-l border-r border-white/5">
                                                            <div className={`text-lg font-black ${daysLeft <= 3 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                                {daysLeft > 0 ? daysLeft : 0}
                                                            </div>
                                                            <div className="text-xs text-slate-400">Days Left</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-lg font-black text-amber-400">{challenge.reward?.xp || 100}</div>
                                                            <div className="text-xs text-slate-400">XP Reward</div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <button
                                                        onClick={() => handleViewLeaderboard(challenge)}
                                                        className="w-full bg-gradient-to-r from-violet-500 to-pink-500 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                                                    >
                                                        <Trophy size={18} />
                                                        View Leaderboard
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}




                {/* LEADERBOARD TAB */}
                {activeTab === 'leaderboard' && (
                    <div className="animate-fadeIn">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white mb-3">Group Leaderboard</h2>
                            <p className="text-slate-400">Top performers in your study groups</p>
                        </div>

                        <div className="max-w-2xl space-y-4">
                            {leaderboard.map((member) => (
                                <div
                                    key={member.rank}
                                    className={`bg-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border flex items-center gap-4 hover:-translate-y-1 transition-all ${member.rank === 1 ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent' :
                                        member.rank === 2 ? 'border-slate-400/30' :
                                            member.rank === 3 ? 'border-amber-700/30' : 'border-white/5'
                                        }`}
                                >
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-lg ${member.rank === 1 ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' :
                                        member.rank === 2 ? 'bg-slate-400 text-white' :
                                            member.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        {member.rank}
                                    </div>
                                    <div className="text-4xl">
                                        {(member.avatar && (member.avatar.startsWith('http') || member.avatar.startsWith('data:'))) ? (
                                            <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/10" />
                                        ) : (
                                            member.avatar || '👤'
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-white font-bold flex items-center gap-2">
                                            {member.name}
                                            <span className="text-xl">{member.badge}</span>
                                        </div>
                                        <div className="text-sm text-slate-400 flex items-center gap-2">
                                            <Flame size={14} className="text-amber-500" />
                                            {member.streak} day streak
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
                                            {member.points.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-slate-400">points</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Animations */}
                <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
                .animate-slideDown {
                    animation: slideDown 0.8s ease-out;
                }
            `}</style>
            </div>
        </div >
    );
}