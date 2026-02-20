import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MessageCircle, Search, Plus, ThumbsUp, ThumbsDown,
    Star, Pin, Send, Tag, TrendingUp, Award, Users, Globe, Zap,
    BookOpen, Filter, Sparkles, Shield, ChevronDown, Heart, Share2,
    Eye, MessageSquare, User, Calendar, CheckCircle, Hash, Link2,
    FileText, Download, Bell, Settings, Mic, Video, Phone, Image,
    Smile, Paperclip, MoreVertical, Circle, X, ChevronRight, AtSign,
    Bookmark, Flag, Crown, Coffee, Code, Flame, UserPlus, UserCheck,
    Clock, ArrowRight, Volume2, VolumeX, LogOut, HelpCircle, Layers,
    Home, Compass, Trophy
} from 'lucide-react';
import * as discussAPI from '../services/discussAPI';
import { groupAPI, connectSocket, getSocket } from '../services/groupAPI';
import { useApp } from '../context/AppContext';


// Storage helpers - Removed in favor of real backend data
// const STORAGE_KEY = 'discussverse_data_v1';
// const loadData = () => ... (removed)

export default function DiscussVerse() {
    const { user, setUser } = useApp(); // Access global user context
    // Local state for discuss-specific features not yet in global context
    const [localData, setLocalData] = useState({
        bookmarkedPosts: [],
        joinedChannels: ['general', 'dsa', 'web-dev'],
        readPosts: []
    });

    const navigate = useNavigate();

    // UI State
    const [activeView, setActiveView] = useState('channels');
    const [activeChannel, setActiveChannel] = useState('general');
    const [activeDM, setActiveDM] = useState(null);
    const [showNewPost, setShowNewPost] = useState(false);

    // Inputs
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostTags, setNewPostTags] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals & Panels
    const [showUserProfile, setShowUserProfile] = useState(null);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Dynamic Data
    const [directMessages, setDirectMessages] = useState([]);
    const [connectionRequests, setConnectionRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [channelStats, setChannelStats] = useState({});
    // Real-time online presence: set of user IDs currently online
    const [onlineUserIds, setOnlineUserIds] = useState(new Set());

    // Dynamic Posts State
    const [posts, setPosts] = useState([]);
    // Comments & Active Post
    const [activePost, setActivePost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    // Dynamic Messages State
    const [messages, setMessages] = useState([]);
    const totalUnread = directMessages.reduce((acc, dm) => acc + (dm.unread || 0), 0);
    // Typing indicator
    const [typingUser, setTypingUser] = useState(null);
    const typingTimeoutRef = useRef(null);
    // Track activeDM via ref so socket callback always has latest value
    const activeDMRef = useRef(null);
    useEffect(() => { activeDMRef.current = activeDM; }, [activeDM]);

    const messagesEndRef = useRef(null);

    // Auto-scroll messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChannel, activeDM, messages]); // Added messages to dept

    // Channels — static definitions, real post counts come from channelStats
    const channels = [
        { id: 'general', name: 'General Discussion', icon: Hash, description: 'General chat for all topics' },
        { id: 'dsa', name: 'DSA & Algorithms', icon: Code, description: 'Data structures and algorithm problems' },
        { id: 'web-dev', name: 'Web Development', icon: Globe, description: 'Frontend, backend, and full-stack' },
        { id: 'placement', name: 'Placement Prep', icon: Award, description: 'Interview prep and job discussions' },
        { id: 'doubt-solving', name: 'Doubt Solving', icon: HelpCircle, description: 'Ask your study doubts here' },
        { id: 'project-collab', name: 'Project Collaboration', icon: Users, description: 'Find teammates for projects' },
        { id: 'resources', name: 'Resource Sharing', icon: BookOpen, description: 'Share useful study materials' },
        { id: 'off-topic', name: 'Off Topic', icon: Coffee, description: 'Casual conversations' }
    ];

    // Socket: announce presence + real-time DM
    useEffect(() => {
        if (!user?._id) return;
        const socket = connectSocket();
        const userId = String(user._id);

        // Announce online
        const announceOnline = () => socket.emit('user:online', userId);
        if (socket.connected) announceOnline();
        socket.on('connect', announceOnline);

        // Online users list
        const handleOnlineUsers = (userIds) => setOnlineUserIds(new Set(userIds.map(String)));
        socket.on('users:online', handleOnlineUsers);

        // ──── Real-time DM: receive incoming message ────
        const handleDMReceive = (data) => {
            const { senderId, senderName, message: msg } = data;
            // If we're currently chatting with this sender, push the message live
            const currentDM = activeDMRef.current;
            if (currentDM && String(currentDM.id) === String(senderId)) {
                setMessages(prev => {
                    // Prevent duplicates
                    if (prev.some(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            }
            // Update DM list sidebar — show last message + bump unread + move to top
            setDirectMessages(prev => {
                const isActive = currentDM && String(currentDM.id) === String(senderId);
                let senderDM = prev.find(dm => String(dm.id) === String(senderId));

                if (senderDM) {
                    senderDM = {
                        ...senderDM,
                        lastMessage: msg.content,
                        timestamp: msg.timestamp || 'Just now',
                        unread: isActive ? 0 : (senderDM.unread || 0) + 1
                    };
                    const others = prev.filter(dm => String(dm.id) !== String(senderId));
                    return [senderDM, ...others];
                }

                // If the user isn't in our DM list yet, we'll wait for them to be fetched or added 
                return prev;
            });
        };
        socket.on('dm:receive', handleDMReceive);

        // ──── Typing indicator ────
        const handleTyping = (data) => {
            const { senderId, senderName, isTyping } = data;
            const currentDM = activeDMRef.current;
            if (currentDM && String(currentDM.id) === String(senderId)) {
                setTypingUser(isTyping ? senderName : null);
                // Auto-clear after 3s
                if (isTyping) {
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
                }
            }
        };
        socket.on('dm:typing', handleTyping);

        return () => {
            socket.off('connect', announceOnline);
            socket.off('users:online', handleOnlineUsers);
            socket.off('dm:receive', handleDMReceive);
            socket.off('dm:typing', handleTyping);
        };
    }, [user?._id]);

    // Derive real-time status for a user ID
    const getOnlineStatus = (userId) => {
        if (!userId) return 'offline';
        return onlineUserIds.has(String(userId)) ? 'online' : 'offline';
    };





    useEffect(() => {
        if (!activeDM && activeChannel) {
            const fetchPosts = async () => {
                try {
                    const data = await discussAPI.getPosts(activeChannel);
                    setPosts(data);
                } catch (error) {
                    console.error("Error loading posts:", error);
                }
            };
            fetchPosts();
        }
    }, [activeChannel, activeDM]);




    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await discussAPI.getUsers();
                setDirectMessages(data.filter(d => d && d.user));
            } catch (error) {
                console.error("Failed to load users for DM", error);
            }
        };
        fetchUsers();
    }, []);

    // All platform members (derived from users fetched from backend)
    // Status is determined in real-time from onlineUserIds socket set
    const onlineMembers = directMessages.map(dm => ({
        id: String(dm.id),
        name: dm.user?.name || 'Unknown',
        avatar: dm.user?.avatar || '👤',
        // Real-time status: check socket presence, NOT stale DB field
        status: onlineUserIds.has(String(dm.id)) ? 'online' : 'offline',
        role: dm.user?.role || 'Member',
        reputation: dm.user?.reputation || 0
    }));



    useEffect(() => {
        if (activeDM) {
            const fetchMessages = async () => {
                try {
                    const data = await discussAPI.getDirectMessages(activeDM.id);
                    setMessages(data);
                } catch (error) {
                    console.error("Error loading messages:", error);
                }
            };
            fetchMessages();
        }
    }, [activeDM]);

    // Dynamic Stats State
    const [studyGroups, setStudyGroups] = useState([]);
    const [suggestedConnections, setSuggestedConnections] = useState([]);
    const [trendingTopics, setTrendingTopics] = useState([]);

    // Data Fetching
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Channel Stats
                const stats = await discussAPI.getChannelStats();
                setChannelStats(stats);

                // 2. Network (Connections & Requests)
                const network = await discussAPI.getNetwork();
                if (network.connections) {
                    setConnections(network.connections);
                }
                // Extract pending requests
                if (network.pending) {
                    setConnectionRequests(network.pending.map(req => ({
                        id: req._id,
                        name: req.name,
                        avatar: req.avatar,
                        status: req.status || 'offline',
                        role: req.role,
                        timestamp: 'New Request'
                    })));
                }

                // 3. Groups
                const groups = await groupAPI.getAll();
                const groupsArr = Array.isArray(groups) ? groups : [];
                setStudyGroups(groupsArr.map(g => ({
                    id: g._id,
                    name: g.name,
                    members: g.members?.length || 0,
                    // Real active count: how many group members are currently online
                    activeNow: (g.members || []).filter(m => {
                        const memberId = m._id || m;
                        return onlineUserIds.has(String(memberId));
                    }).length,
                    topic: g.description || 'Study Group',
                    nextSession: 'TBD'
                })));

                // 4. Trending
                const trends = await discussAPI.getTrendingTopics();
                setTrendingTopics(trends);

                // 5. Suggestions (Users not connected)
                const users = await discussAPI.getUsers();
                // Filter out existing connections and self (API already filters self)
                // Also update Direct Messages list with all users for now (or just connections)
                setDirectMessages(users.filter(u => u && u.user).map(u => ({
                    id: u.id,
                    user: u.user,
                    lastMessage: u.lastMessage,
                    timestamp: u.timestamp,
                    unread: u.unread,
                    connectionStatus: u.connectionStatus,
                    connectionCount: u.connectionCount || 0,
                    postCount: u.postCount || 0
                })));

                setSuggestedConnections(users
                    .filter(u => u.connectionStatus === 'none' && u.user)
                    .slice(0, 5)
                    .map(u => ({
                        id: u.id,
                        name: u.user?.name || 'Unknown',
                        avatar: u.user?.avatar || '👤',
                        role: u.user?.role || 'Student',
                        skills: ['Learner'],
                        mutualConnections: 0
                    }))
                );

            } catch (e) { console.error("Data load error", e); }
        };
        fetchInitialData();
    }, []);

    // Helper functions
    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-emerald-500';
            case 'away': return 'bg-amber-500';
            default: return 'bg-slate-500';
        }
    };

    // Get real-time status: check live socket presence first, fall back to DB status
    const getRealtimeStatus = (userId, dbStatus) => {
        if (userId && onlineUserIds.has(String(userId))) return 'online';
        return dbStatus || 'offline';
    };

    const renderAvatar = (avatar, sizeClass = "w-10 h-10", fontSizeClass = "text-3xl") => {
        if (typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('/'))) {
            return <img src={avatar} alt="User" className={`${sizeClass} rounded-full object-cover shadow-sm`} />;
        }
        return <span className={`${fontSizeClass} filter drop-shadow-md`}>{avatar || '👤'}</span>;
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeDM) return;
        const content = messageInput.trim();
        setMessageInput(''); // Clear immediately for snappy UX
        try {
            // 1. Save to DB via REST
            const newMsg = await discussAPI.sendDirectMessage(activeDM.id, content);
            setMessages(prev => [...prev, newMsg]);

            // 2. Forward to recipient via socket for real-time delivery
            // MOVED TO BACKEND: The controller automatically emits 'dm:receive' to the recipient
            // so we don't need to do it manually here. This is more robust.

            const socket = getSocket();
            if (socket?.connected) {
                // Stop typing indicator
                socket.emit('dm:typing', {
                    recipientId: String(activeDM.id),
                    senderId: String(user._id),
                    senderName: user.name,
                    isTyping: false
                });
            }

            // 3. Update sidebar last message and move to top
            setDirectMessages(prev => {
                let current = prev.find(dm => String(dm.id) === String(activeDM.id));
                if (current) {
                    current = { ...current, lastMessage: content, timestamp: 'Just now' };
                    const others = prev.filter(dm => String(dm.id) !== String(activeDM.id));
                    return [current, ...others];
                }
                return prev;
            });
        } catch (error) {
            console.error('Failed to send message', error);
            setMessageInput(content); // Restore on failure
        }
    };

    // Emit typing indicator on input change
    const handleMessageInputChange = (e) => {
        setMessageInput(e.target.value);
        if (!activeDM) return;
        const socket = getSocket();
        if (socket?.connected && e.target.value.trim()) {
            socket.emit('dm:typing', {
                recipientId: String(activeDM.id),
                senderId: String(user._id),
                senderName: user.name,
                isTyping: true
            });
        }
    };

    // Mock connection request removed
    // Real data is fetched in the useEffect above via getNetwork()

    const handleCreatePost = async () => {
        if (!newPostTitle.trim() || !newPostContent.trim()) return;
        try {
            await discussAPI.createPost({
                title: newPostTitle,
                content: newPostContent,
                channelId: activeChannel,
                tags: newPostTags.split(',').map(t => t.trim()).filter(Boolean)
            });

            // Refresh posts to ensure consistent state
            const updatedPosts = await discussAPI.getPosts(activeChannel);
            setPosts(updatedPosts);

            setShowNewPost(false);
            setNewPostTitle('');
            setNewPostContent('');
            setNewPostTags('');
            // Manually update reputation in local context or re-fetch user
            setUser(prev => ({ ...prev, reputation: (prev.reputation || 0) + 10 }));
            console.log('Post created successfully!');
        } catch (error) {
            console.error("Failed to create post:", error);
            alert(`Failed to create post: ${error.message || 'Please try again'}`);
        }
    };

    const handleUpvote = async (postId) => {
        try {
            const updated = await discussAPI.toggleUpvote(postId);
            setPosts(prev => prev.map(p =>
                (p._id === postId || p.id === postId)
                    ? { ...p, upvotes: updated.upvotes, isUpvoted: updated.isUpvoted }
                    : p
            ));
        } catch (error) {
            console.error("Upvote failed", error);
        }
    };

    const handleOpenPost = async (post) => {
        setActivePost(post);
        try {
            const data = await discussAPI.getComments(post._id || post.id);
            setComments(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !activePost) return;
        try {
            const postId = activePost._id || activePost.id;
            const added = await discussAPI.postComment(postId, newComment);
            setComments(prev => [...prev, added]);
            setNewComment('');

            setPosts(prev => prev.map(p =>
                (p._id === postId || p.id === postId)
                    ? { ...p, replies: (p.replies || 0) + 1 }
                    : p
            ));
        } catch (error) {
            console.error(error);
        }
    };

    const handleConnect = (userId) => {
        // Local update for immediate feedback
        setLocalData(prev => ({ ...prev }));
    };

    const handleAcceptConnection = async (userId, userName) => {
        try {
            await discussAPI.acceptConnectionRequest(userId);

            // UI Updates
            setConnectionRequests(prev => prev.filter(req => req.id !== userId));

            // Add notification
            setNotifications(prev => [...prev, {
                id: Date.now(),
                type: 'success',
                message: `You are now connected with ${userName}!`,
                timestamp: new Date().toLocaleTimeString()
            }]);

            // Refresh network
            const network = await discussAPI.getNetwork();
            if (network.connections) {
                setConnections(network.connections);
            }
            // ... could refresh detailed state here

        } catch (error) {
            console.error(error);
            alert("Failed to accept connection");
        }
    };

    const handleRejectConnection = async (userId) => {
        try {
            await discussAPI.rejectConnectionRequest(userId);
            setConnectionRequests(prev => prev.filter(req => req.id !== userId));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendConnectionRequest = async (user) => {
        try {
            await discussAPI.sendConnectionRequest(user.id || user._id);
            setNotifications(prev => [...prev, {
                id: Date.now(),
                type: 'info',
                message: `Connection request sent to ${user.name}`,
                timestamp: new Date().toLocaleTimeString()
            }]);

            // Update local state to show 'pending' or 'sent'
            setDirectMessages(prev => prev.map(dm =>
                (dm.id === (user.id || user._id)) ? { ...dm, connectionStatus: 'sent' } : dm
            ));
            setSuggestedConnections(prev => prev.filter(u => u.id !== (user.id || user._id)));

        } catch (error) {
            console.error(error);
            alert("Failed to send request: " + (error.response?.data?.error || error.message));
        }
    };

    const handleStartDM = (user) => {
        const userId = String(user.id || user._id);
        const existingDM = directMessages.find(d => String(d.id) === userId);

        let targetDM = existingDM;
        if (existingDM) {
            // Unread reset
            if (existingDM.unread > 0) {
                targetDM = { ...existingDM, unread: 0 };
                // Also update the list internally
                setDirectMessages(prev => prev.map(d => String(d.id) === userId ? targetDM : d));
            }
        } else {
            // Mock new DM
            targetDM = {
                id: userId,
                user: user, // user may have more properties like name, avatar
                lastMessage: '',
                timestamp: 'Now',
                unread: 0
            };
            setDirectMessages(prev => [targetDM, ...prev]);
        }

        setActiveDM(targetDM);
        setMessages([]); // clear current messages right away to avoid cross-flash
        setActiveView('dms');
        setActiveChannel(null); // Clear channel
        setShowUserProfile(null);
        setShowConnectModal(false);
    };

    const handleAttachment = () => {
        alert('File attachment feature - Coming soon!');
    };

    const handleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const handleSettings = () => {
        setShowSettings(!showSettings);
    };

    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    const handleBookmark = (postId) => {
        setLocalData(prev => ({
            ...prev,
            bookmarkedPosts: prev.bookmarkedPosts.includes(postId)
                ? prev.bookmarkedPosts.filter(id => id !== postId)
                : [...prev.bookmarkedPosts, postId]
        }));
    };

    const handleShare = (post) => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.content,
                url: window.location.href
            }).catch(() => console.log('Share cancelled'));
        } else {
            // Fallback: copy to clipboard
            const url = `${window.location.origin}/discuss/${post._id || post.id}`;
            navigator.clipboard.writeText(url);
            console.log('Link copied to clipboard!');
        }
    };

    const handleTrendingTopicClick = (tag) => {
        setSearchQuery(`#${tag}`);
        setActiveView('channels');
    };

    const handleJoinGroup = async (groupId) => {
        try {
            await groupAPI.join(groupId);
            console.log('Joined group successfully!');
            // Refresh groups list
            const groups = await groupAPI.getAll();
            setStudyGroups(groups.map(g => ({
                id: g._id,
                name: g.name,
                members: g.members?.length || 0,
                activeNow: (g.members || []).filter(m => {
                    const memberId = m._id || m;
                    return onlineUserIds.has(String(memberId));
                }).length,
                topic: g.description || 'Study Group',
                nextSession: 'TBD'
            })));
        } catch (error) {
            console.error('Failed to join group:', error);
        }
    };

    // Calculate channel post counts dynamically from backend stats
    const getChannelPostCount = (channelId) => {
        return channelStats[channelId]?.count || 0;
    };

    const currentChannel = channels.find(c => c.id === activeChannel);

    // Filter posts based on search query
    const currentPosts = searchQuery
        ? posts.filter(post =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : posts;

    // Guard: if user hasn't loaded yet, show loading
    if (!user) {
        return (
            <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">💬</div>
                    <div className="text-xl font-bold text-white">Loading DiscussVerse...</div>
                    <div className="text-slate-400 text-sm mt-2">Preparing your community hub</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-hidden font-[Inter,system-ui,sans-serif]">
            {/* Top Navbar - Enhanced */}
            <nav className="h-16 bg-slate-900/90 backdrop-blur-2xl border-b border-violet-500/20 px-6 flex items-center justify-between shrink-0 shadow-xl shadow-violet-500/5">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-pink-500/10 hover:from-violet-500/20 hover:to-pink-500/20 px-5 py-2.5 rounded-xl text-violet-300 font-semibold transition-all duration-300 border border-violet-500/20 hover:border-violet-500/40 shadow-lg shadow-violet-500/5"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-base">Dashboard</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-violet-500/30">
                            <MessageCircle size={24} className="text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-extrabold bg-gradient-to-r from-white via-violet-200 to-pink-200 bg-clip-text text-transparent">DiscussVerse</span>
                            <div className="text-xs text-slate-500 font-medium">Student Community Hub</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 max-w-xl mx-10">
                    <div className="relative group">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search discussions, members, channels..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-5 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-base placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-slate-800 transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleNotifications}
                        className="relative p-2.5 hover:bg-slate-800/80 rounded-xl transition-all duration-300 group"
                    >
                        <Bell size={22} className="text-slate-400 group-hover:text-violet-400 transition-colors" />
                        {totalUnread > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs font-bold flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
                                {totalUnread}
                            </span>
                        )}
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/15 to-yellow-500/15 rounded-xl border border-amber-500/30 shadow-lg shadow-amber-500/10">
                        <Star size={18} className="text-amber-400 fill-amber-400" />
                        <span className="text-amber-300 font-bold text-base">{user?.reputation || 0}</span>
                        <span className="text-amber-500/70 text-xs font-medium">XP</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-xl cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg shadow-violet-500/30 border-2 border-white/10">
                        👤
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Channels - Enhanced */}
                <div className="w-72 bg-slate-900/70 border-r border-slate-700/50 flex flex-col shrink-0 backdrop-blur-xl">
                    {/* View Switcher - Enhanced */}
                    <div className="p-4 border-b border-slate-700/50">
                        <div className="flex gap-1.5 p-1.5 bg-slate-800/80 rounded-xl">
                            {[
                                { id: 'channels', icon: Hash, label: 'Channels' },
                                { id: 'dms', icon: MessageSquare, label: 'DMs' },
                                { id: 'explore', icon: Globe, label: 'Explore' }
                            ].map(view => (
                                <button
                                    key={view.id}
                                    onClick={() => setActiveView(view.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeView === view.id
                                        ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    <view.icon size={16} />
                                    {view.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Channels List */}
                    {activeView === 'channels' && (
                        <div className="flex-1 overflow-y-auto p-3">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
                                <Zap size={12} className="text-violet-400" />
                                Study Channels
                            </div>
                            {channels.map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => { setActiveChannel(channel.id); setActiveDM(null); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1.5 transition-all duration-300 group ${activeChannel === channel.id
                                        ? 'bg-gradient-to-r from-violet-500/25 to-pink-500/15 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10'
                                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-white hover:border-slate-700/50 border border-transparent'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${activeChannel === channel.id ? 'bg-violet-500/30' : 'bg-slate-700/50 group-hover:bg-slate-600/50'} transition-all`}>
                                        <channel.icon size={18} className={activeChannel === channel.id ? 'text-violet-300' : 'text-slate-400 group-hover:text-slate-300'} />
                                    </div>
                                    <span className="flex-1 text-left text-sm font-medium truncate">{channel.name}</span>
                                    {getChannelPostCount(channel.id) > 0 && (
                                        <span className="min-w-[24px] h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs font-bold flex items-center justify-center px-2 shadow-lg shadow-red-500/30">
                                            {getChannelPostCount(channel.id)}
                                        </span>
                                    )}
                                </button>
                            ))}

                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mt-6 mb-3 flex items-center gap-2">
                                <Users size={12} className="text-emerald-400" />
                                Study Groups
                            </div>
                            {studyGroups.slice(0, 3).map(group => (
                                <button
                                    key={group.id}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1.5 text-slate-400 hover:bg-slate-800/70 hover:text-white transition-all duration-300 border border-transparent hover:border-slate-700/50 group"
                                >
                                    <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-all">
                                        <Users size={18} className="text-emerald-400" />
                                    </div>
                                    <span className="flex-1 text-left text-sm font-medium truncate">{group.name}</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs text-emerald-400 font-semibold">{group.activeNow}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* DMs List - Enhanced */}
                    {activeView === 'dms' && (
                        <div className="flex-1 overflow-y-auto p-3">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
                                <MessageSquare size={12} className="text-pink-400" />
                                Direct Messages
                            </div>
                            {directMessages
                                .filter(dm => dm.user && (!searchQuery || dm.user.name?.toLowerCase().includes(searchQuery.toLowerCase())))
                                .map(dm => (
                                    <button
                                        key={dm.id}
                                        onClick={() => handleStartDM(dm.user || dm)}
                                        className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl mb-1.5 transition-all duration-300 ${activeDM?.id === dm.id
                                            ? 'bg-gradient-to-r from-violet-500/20 to-pink-500/10 border border-violet-500/20 shadow-lg shadow-violet-500/10'
                                            : 'hover:bg-slate-800/60 border border-transparent'
                                            }`}
                                    >
                                        <div className="relative group-hover:scale-105 transition-transform">
                                            {renderAvatar(dm.user?.avatar, "w-10 h-10", "text-3xl")}
                                            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-slate-900 ${getStatusColor(getRealtimeStatus(dm.id, dm.user?.status))} shadow-sm`} />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center justify-between">
                                                <div className={`text-sm font-semibold truncate ${activeDM?.id === dm.id ? 'text-white' : 'text-slate-200'}`}>{dm.user?.name || 'Unknown'}</div>
                                                <div className="text-[10px] text-slate-500 font-medium">{dm.timestamp}</div>
                                            </div>
                                            <div className={`text-xs truncate mt-0.5 ${dm.unread > 0 ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>{dm.lastMessage}</div>
                                        </div>
                                        {dm.unread > 0 && (
                                            <span className="min-w-[20px] h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-md shadow-red-500/30">
                                                {dm.unread}
                                            </span>
                                        )}
                                    </button>
                                ))}

                            <button
                                onClick={() => setShowConnectModal(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 mt-4 rounded-xl border border-dashed border-slate-700/70 text-slate-400 hover:border-violet-500 hover:text-violet-300 hover:bg-violet-500/5 transition-all duration-300 group"
                            >
                                <div className="p-1 bg-slate-800 rounded-full group-hover:bg-violet-500/20 transition-colors">
                                    <UserPlus size={16} />
                                </div>
                                <span className="text-sm font-medium">Find Connections</span>
                            </button>
                        </div>
                    )}

                    {/* Explore - Enhanced */}
                    {activeView === 'explore' && (
                        <div className="flex-1 overflow-y-auto p-3">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
                                <TrendingUp size={12} className="text-amber-400" />
                                Trending Topics
                            </div>
                            {trendingTopics.map((topic, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleTrendingTopicClick(topic.tag)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1.5 text-slate-400 hover:bg-slate-800/80 hover:text-white transition-all duration-300 border border-transparent hover:border-slate-700/50 group"
                                >
                                    <div className="p-2 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/20 transition-all">
                                        <Hash size={16} className="text-pink-400" />
                                    </div>
                                    <span className="flex-1 text-left text-sm font-medium">#{topic.tag}</span>
                                    <span className="px-2 py-0.5 bg-slate-800 rounded-md text-[10px] font-bold text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-700 transition-all">{topic.posts} posts</span>
                                </button>
                            ))}

                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mt-6 mb-3 flex items-center gap-2">
                                <Zap size={12} className="text-violet-400" />
                                Featured Groups
                            </div>
                            {studyGroups.map(group => (
                                <div key={group.id} className="p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl mb-3 border border-slate-700/30 hover:border-violet-500/30 transition-all duration-300 group shadow-lg shadow-black/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-sm group-hover:text-violet-300 transition-colors">{group.name}</span>
                                        <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded text-xs text-emerald-400 font-medium border border-emerald-500/20">
                                            <Users size={10} />
                                            {group.members}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">{group.topic}</p>
                                    <button
                                        onClick={() => handleJoinGroup(group.id)}
                                        className="w-full py-2 bg-slate-700/50 hover:bg-violet-600/20 text-slate-300 hover:text-violet-300 text-xs font-semibold rounded-lg transition-all border border-slate-600/30 hover:border-violet-500/30"
                                    >
                                        Join Group
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* User Profile Section - Enhanced */}
                    <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
                        <div
                            onClick={handleProfileClick}
                            className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-slate-800/50 transition-all cursor-pointer group"
                        >
                            <div className="relative">
                                <span className="text-3xl filter drop-shadow-lg group-hover:scale-110 transition-transform block">👤</span>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[3px] border-slate-900 shadow-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-200 group-hover:text-white truncate">You</div>
                                <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Online
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSettings();
                                }}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-white"
                            >
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative z-0">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/40 via-slate-950 to-slate-950" />

                    {/* Channel/DM Header - Enhanced */}
                    <div className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 shadow-sm z-10 transition-all duration-300">
                        {activeDM ? (
                            <div className="flex items-center gap-4">
                                <div className="relative cursor-pointer transition-transform hover:scale-105">
                                    {renderAvatar(activeDM.user.avatar, "w-12 h-12", "text-4xl")}
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[3px] border-slate-900 ${getStatusColor(getRealtimeStatus(activeDM.id, activeDM.user.status))} shadow-md`} />
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-slate-100 flex items-center gap-2">
                                        {activeDM.user.name}
                                        {activeDM.user.reputation > 2000 && <Crown size={14} className="text-amber-400 fill-amber-400 animate-pulse" />}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium capitalize flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(getRealtimeStatus(activeDM.id, activeDM.user.status))}`} />
                                        {getRealtimeStatus(activeDM.id, activeDM.user.status)}
                                    </div>
                                </div>
                            </div>
                        ) : currentChannel ? (
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-slate-800/80 rounded-xl shadow-lg shadow-violet-500/5 group">
                                    <currentChannel.icon size={24} className="text-slate-400 group-hover:text-violet-400 transition-colors" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-slate-100 flex items-center gap-2">
                                        {currentChannel.name}
                                        {currentChannel.id === 'placement' && <Award size={16} className="text-amber-400" />}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                                        <span>{currentChannel.description}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            {onlineUserIds.size} online
                                        </span>
                                        {channelStats[currentChannel.id]?.count > 0 && (
                                            <span className="text-slate-500">{channelStats[currentChannel.id].count} posts</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="flex items-center gap-3">
                            {/* Only show New Post button when viewing a channel, not in DMs */}
                            {!activeDM && (
                                <button
                                    onClick={() => setShowNewPost(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5 transition-all duration-300 border border-white/10"
                                >
                                    <Plus size={18} />
                                    New Post
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden flex relative z-0">
                        {/* Posts/Messages */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {activeDM ? (
                                // Direct Messages Chat - Enhanced
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                                        {messages.map((msg, idx) => (
                                            <div
                                                key={msg._id || idx}
                                                className={`flex group ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[70%] ${msg.isMine ? 'order-2' : ''}`}>
                                                    <div className={`px-5 py-3.5 rounded-2xl shadow-md transition-all duration-300 ${msg.isMine
                                                        ? 'bg-gradient-to-br from-violet-600 to-pink-600 rounded-br-none text-white shadow-violet-500/10'
                                                        : 'bg-slate-800 text-slate-100 rounded-bl-none shadow-black/20 border border-slate-700/50'
                                                        }`}>
                                                        <p className="text-[15px] leading-relaxed tracking-wide">{msg.content}</p>
                                                    </div>
                                                    <div className={`text-[10px] text-slate-500 font-medium mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${msg.isMine ? 'text-right pr-1' : 'pl-1'}`}>
                                                        {msg.timestamp || new Date(msg.createdAt).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Typing indicator */}
                                        {typingUser && (
                                            <div className="flex items-center gap-2 px-2 animate-pulse">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                                <span className="text-xs text-violet-400 font-medium">{typingUser} is typing...</span>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input - Enhanced */}
                                    <div className="p-5 border-t border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
                                        <div className="flex items-end gap-3 bg-slate-800/80 rounded-2xl p-2 border border-slate-700/50 shadow-inner focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all duration-300">
                                            <button
                                                onClick={handleAttachment}
                                                className="p-2.5 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-violet-400"
                                            >
                                                <Paperclip size={20} />
                                            </button>
                                            <textarea
                                                placeholder={`Message @${activeDM.user.name}...`}
                                                value={messageInput}
                                                onChange={handleMessageInputChange}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                                className="flex-1 bg-transparent text-sm min-h-[44px] max-h-[120px] py-3 focus:outline-none resize-none placeholder:text-slate-500"
                                                rows={1}
                                            />
                                            <div className="flex items-center gap-1 pb-1">
                                                <button className="p-2 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-amber-400">
                                                    <Smile size={20} />
                                                </button>
                                                <button
                                                    onClick={handleSendMessage}
                                                    disabled={!messageInput.trim()}
                                                    className={`p-2.5 rounded-xl transition-all duration-300 ${messageInput.trim()
                                                        ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5'
                                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Channel Posts - Enhanced
                                <div className="p-8 space-y-6 max-w-5xl mx-auto">
                                    {/* New Post Form Modal - Handled by state, but styling in modal section */}
                                    {showNewPost && (
                                        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-violet-500/30 animate-fade-in shadow-2xl shadow-black/50 mb-8 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-pink-500/5 pointer-events-none" />
                                            <div className="flex items-center justify-between mb-6 relative z-10">
                                                <h3 className="font-bold text-xl flex items-center gap-2 text-white">
                                                    <div className="p-1.5 bg-violet-500/20 rounded-lg">
                                                        <Sparkles size={18} className="text-violet-400" />
                                                    </div>
                                                    Create New Post
                                                </h3>
                                                <button onClick={() => setShowNewPost(false)} className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="What's on your mind? (Title)"
                                                value={newPostTitle}
                                                onChange={(e) => setNewPostTitle(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-900/60 border border-slate-700/80 rounded-xl mb-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 text-lg font-medium placeholder:text-slate-600 transition-all shadow-inner"
                                            />
                                            <textarea
                                                placeholder="Share your question, problem, or thoughts in detail..."
                                                value={newPostContent}
                                                onChange={(e) => setNewPostContent(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-900/60 border border-slate-700/80 rounded-xl mb-6 min-h-[160px] resize-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 text-base placeholder:text-slate-600 transition-all shadow-inner"
                                            />
                                            <div className="flex justify-end gap-3 relative z-10">
                                                <button
                                                    onClick={() => setShowNewPost(false)}
                                                    className="px-6 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all font-medium"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleCreatePost}
                                                    className="px-8 py-2.5 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5 transition-all text-white flex items-center gap-2"
                                                >
                                                    <Send size={18} />
                                                    Post to #{channels.find(c => c.id === activeChannel)?.name}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Posts Feed */}
                                    {currentPosts.length === 0 ? (
                                        <div className="text-center py-24 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700 flex flex-col items-center justify-center">
                                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                                <MessageCircle size={40} className="text-slate-600" />
                                            </div>
                                            <h3 className="text-2xl font-bold mb-3 text-slate-300">No posts yet</h3>
                                            <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">This channel is waiting for its first spark. Be the pioneer and start a discussion!</p>
                                            <button
                                                onClick={() => setShowNewPost(true)}
                                                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/20 hover:-translate-y-0.5 transition-all"
                                            >
                                                Create First Post
                                            </button>
                                        </div>
                                    ) : (
                                        currentPosts.filter(post => post.author).map(post => (
                                            <div
                                                key={post._id || post.id}
                                                className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-black/20"
                                            >
                                                {/* Post Header */}
                                                <div className="flex items-start justify-between mb-5">
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className="relative cursor-pointer transition-transform hover:scale-105"
                                                            onClick={() => setShowUserProfile(post.author)}
                                                        >
                                                            {renderAvatar(post.author?.avatar, "w-12 h-12", "text-4xl")}
                                                            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-slate-800 ${getStatusColor(post.author?.status)}`} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="font-bold text-slate-200 hover:text-violet-400 cursor-pointer transition-colors text-base" onClick={() => setShowUserProfile(post.author)}>
                                                                    {post.author?.name || 'Anonymous'}
                                                                </span>
                                                                {(post.author?.reputation || 0) > 2000 && (
                                                                    <Crown size={14} className="text-amber-400 fill-amber-400" />
                                                                )}
                                                                <span className="px-2 py-0.5 bg-slate-700/50 rounded text-[10px] font-bold text-slate-400 flex items-center gap-1 border border-slate-600/30">
                                                                    <Star size={10} className="text-amber-400 fill-amber-400" />
                                                                    {post.author?.reputation || 0}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-500 font-medium mt-0.5">{post.timestamp}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {post.isPinned && (
                                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 shadow-sm shadow-amber-500/5">
                                                                <Pin size={12} className="fill-amber-400" />
                                                                Pinned
                                                            </span>
                                                        )}
                                                        {post.isSolved && (
                                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                                                                <CheckCircle size={12} className="fill-emerald-400" />
                                                                Solved
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Post Content */}
                                                <h3
                                                    onClick={() => handleOpenPost(post)}
                                                    className="text-xl font-bold mb-3 text-slate-100 group-hover:text-violet-300 cursor-pointer transition-colors leading-tight"
                                                >
                                                    {post.title}
                                                </h3>
                                                <p className="text-slate-400 mb-6 leading-relaxed text-[15px] font-normal">
                                                    {post.content}
                                                </p>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {post.tags.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/40 text-slate-400 text-xs font-medium rounded-lg cursor-pointer hover:bg-violet-500/20 hover:text-violet-300 hover:border-violet-500/30 border border-transparent transition-all"
                                                        >
                                                            <Hash size={12} className="opacity-50" />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Post Actions */}
                                                <div className="flex items-center justify-between pt-5 border-t border-slate-700/40">
                                                    <div className="flex items-center gap-5">
                                                        <button
                                                            onClick={() => handleUpvote(post._id || post.id)}
                                                            className={`flex items-center gap-2 transition-all group/btn ${post.isUpvoted ? 'text-violet-400' : 'text-slate-400 hover:text-violet-400'}`}
                                                        >
                                                            <div className="p-1.5 rounded-lg group-hover/btn:bg-violet-500/10 transition-colors">
                                                                <ThumbsUp size={18} />
                                                            </div>
                                                            <span className="text-sm font-semibold">{post.upvotes}</span>
                                                        </button>
                                                        <button className="flex items-center gap-2 text-slate-400 hover:text-pink-400 transition-all group/btn">
                                                            <div className="p-1.5 rounded-lg group-hover/btn:bg-pink-500/10 transition-colors">
                                                                <ThumbsDown size={18} />
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenPost(post)}
                                                            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-all group/btn"
                                                        >
                                                            <div className="p-1.5 rounded-lg group-hover/btn:bg-cyan-500/10 transition-colors">
                                                                <MessageSquare size={18} />
                                                            </div>
                                                            <span className="text-sm font-medium">{post.replies} replies</span>
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleBookmark(post._id || post.id)}
                                                            className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-amber-400 transition-all"
                                                            title="Bookmark"
                                                        >
                                                            <Bookmark size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleShare(post)}
                                                            className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-violet-400 transition-all"
                                                            title="Share"
                                                        >
                                                            <Share2 size={18} />
                                                        </button>
                                                        <button className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-all">
                                                            <MoreVertical size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar - Members - Enhanced */}
                        {!activeDM && (
                            <div className="w-72 border-l border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shrink-0 overflow-y-auto hidden lg:block">
                                <div className="p-5">
                                    {/* Channel Stats - Enhanced */}
                                    <div className="p-5 bg-gradient-to-br from-violet-600/10 via-slate-800/50 to-pink-600/10 rounded-2xl border border-violet-500/20 mb-6 shadow-lg shadow-violet-500/5 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-2.5 mb-4 relative z-10">
                                            <div className="p-1.5 bg-violet-500/20 rounded-lg">
                                                <Users size={16} className="text-violet-400" />
                                            </div>
                                            <span className="font-bold text-sm text-slate-200">Channel Activity</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 relative z-10">
                                            <div className="text-center p-2 bg-slate-900/40 rounded-xl border border-slate-700/30">
                                                {/* Total users on platform = all users fetched (excluding self) */}
                                                <div className="text-xl font-bold text-white mb-0.5">{directMessages.length}</div>
                                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Members</div>
                                            </div>
                                            <div className="text-center p-2 bg-slate-900/40 rounded-xl border border-slate-700/30">
                                                {/* Real-time online count from socket */}
                                                <div className="text-xl font-bold text-emerald-400 mb-0.5">{onlineMembers.filter(m => m.status === 'online').length}</div>
                                                <div className="text-[10px] uppercase font-bold text-emerald-500/70 tracking-wider">Online</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Online Members - Enhanced */}
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Online — {onlineMembers.filter(m => m.status === 'online').length}
                                        </div>
                                    </div>
                                    <div className="space-y-1 mb-6">
                                        {onlineMembers.filter(m => m.status === 'online').map(member => (
                                            <div
                                                key={member.id}
                                                onClick={() => setShowUserProfile(member)}
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-all group border border-transparent hover:border-slate-700/50"
                                            >
                                                <div className="relative transition-transform group-hover:scale-105">
                                                    {renderAvatar(member.avatar, "w-10 h-10", "text-3xl")}
                                                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[2.5px] border-slate-900 ${getStatusColor(member.status)} shadow-sm`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold text-slate-300 group-hover:text-white truncate flex items-center gap-1.5">
                                                        {member.name}
                                                        {member.reputation > 2000 && <Crown size={12} className="text-amber-400 fill-amber-400" />}
                                                    </div>
                                                    <div className="text-xs text-slate-500 group-hover:text-slate-400 truncate">{member.role}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Offline Members - Enhanced */}
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
                                        Offline — {onlineMembers.filter(m => m.status !== 'online').length}
                                    </div>
                                    <div className="space-y-1">
                                        {onlineMembers.filter(m => m.status !== 'online').map(member => (
                                            <div
                                                key={member.id}
                                                onClick={() => setShowUserProfile(member)}
                                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-all group opacity-60 hover:opacity-100 border border-transparent hover:border-slate-700/50"
                                            >
                                                <div className="relative grayscale group-hover:grayscale-0 transition-all">
                                                    {renderAvatar(member.avatar, "w-10 h-10", "text-3xl")}
                                                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[2.5px] border-slate-900 ${getStatusColor(member.status)}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold text-slate-400 group-hover:text-slate-200 truncate">{member.name}</div>
                                                    <div className="text-xs text-slate-600 group-hover:text-slate-500 truncate">{member.role}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div >
            </div >


            {/* User Profile Modal - Enhanced */}
            {
                showUserProfile && (() => {
                    const isMe = showUserProfile.isMe;
                    const memberId = showUserProfile.id || showUserProfile._id;
                    // Find the full DM entry for this user to get real stats
                    const dmEntry = directMessages.find(d => String(d.id) === String(memberId));
                    const profileData = isMe ? {
                        name: user?.name || 'You',
                        avatar: user?.avatar || '👤',
                        status: 'online',
                        role: user?.role || 'Student',
                        reputation: user?.reputation || 0,
                        posts: posts.filter(p => p.author?._id?.toString() === user?._id?.toString()).length,
                        connections: connections.length
                    } : {
                        ...showUserProfile,
                        id: memberId,
                        posts: dmEntry?.postCount ?? 0,
                        connections: dmEntry?.connectionCount ?? 0
                    };

                    return (
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all" onClick={() => setShowUserProfile(null)}>
                            <div
                                className="bg-slate-900/90 backdrop-blur-xl rounded-3xl w-full max-w-md overflow-hidden animate-fade-in border border-slate-700/50 shadow-2xl shadow-black/50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Profile Header */}
                                <div className="h-28 bg-gradient-to-br from-violet-600 to-pink-600 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                                    <button
                                        onClick={() => setShowUserProfile(null)}
                                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white/80 hover:text-white rounded-full transition-all backdrop-blur-sm"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="px-6 pb-8">
                                    {/* Avatar */}
                                    <div className="relative -mt-14 mb-4 flex justify-between items-end px-2">
                                        <div className="relative group cursor-pointer">
                                            <div className="w-28 h-28 bg-slate-800 rounded-3xl flex items-center justify-center text-6xl border-[6px] border-slate-900 shadow-xl overflow-hidden">
                                                {renderAvatar(profileData.avatar, "w-full h-full", "text-6xl")}
                                            </div>
                                            <span className={`absolute bottom-2 -right-1 w-6 h-6 rounded-full border-[4px] border-slate-900 ${getStatusColor(profileData.status)}`} />
                                        </div>
                                        <div className="mb-2 flex gap-2">
                                            <button className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700/50 transition-all shadow-lg shadow-black/20">
                                                <MoreVertical size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="mb-6 px-2">
                                        <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                            {profileData.name}
                                            {profileData.reputation > 2000 && <Crown size={20} className="text-amber-400 fill-amber-400" />}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-slate-400 font-medium">{profileData.role || 'Student'}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                            <span className="text-violet-400 font-medium flex items-center gap-1">
                                                <Award size={14} />
                                                Level {Math.floor(profileData.reputation / 100) + 1}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 p-5 bg-slate-800/40 rounded-2xl mb-6 border border-slate-700/30">
                                        <div className="text-center group cursor-pointer">
                                            <div className="text-xl font-bold text-amber-400 group-hover:scale-110 transition-transform">{profileData.reputation}</div>
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">Reputation</div>
                                        </div>
                                        <div className="text-center group cursor-pointer">
                                            <div className="text-xl font-bold text-violet-400 group-hover:scale-110 transition-transform">{profileData.posts}</div>
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">Posts</div>
                                        </div>
                                        <div className="text-center group cursor-pointer">
                                            <div className="text-xl font-bold text-emerald-400 group-hover:scale-110 transition-transform">{profileData.connections}</div>
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">Connections</div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {!isMe && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    handleSendConnectionRequest({ id: profileData.id, name: profileData.name });
                                                    setShowUserProfile(null);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all duration-300"
                                            >
                                                <UserPlus size={20} />
                                                Connect
                                            </button>
                                            <button
                                                onClick={() => handleStartDM(profileData)}
                                                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl font-bold text-slate-200 border border-slate-700 hover:border-slate-600 transition-all duration-300"
                                            >
                                                <MessageSquare size={20} />
                                                Message
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()
            }


            {/* Connect Modal - Enhanced */}
            {
                showConnectModal && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all" onClick={() => setShowConnectModal(false)}>
                        <div
                            className="bg-slate-900/95 backdrop-blur-xl rounded-3xl w-full max-w-lg overflow-hidden animate-fade-in border border-slate-700/50 shadow-2xl shadow-black/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Find Connections</h3>
                                    <p className="text-sm text-slate-400 mt-0.5">Discover students with similar interests</p>
                                </div>
                                <button onClick={() => setShowConnectModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Sparkles size={12} className="text-violet-400" />
                                    Recommended for you
                                </div>
                                {suggestedConnections.map(user => (
                                    <div key={user.id} className="flex items-start gap-4 p-4 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800/50 hover:border-violet-500/30 rounded-2xl mb-3 transition-all duration-300 group">
                                        <div className="group-hover:scale-110 transition-transform duration-300">
                                            {renderAvatar(user.avatar, "w-12 h-12", "text-4xl")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="font-bold text-slate-100 truncate">{user.name}</div>
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50 uppercase tracking-wide">
                                                    {user.role}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {user.skills.map((skill, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-violet-500/10 text-violet-300 text-[11px] font-medium rounded-md border border-violet-500/10">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handleSendConnectionRequest(user)}
                                                className="w-full py-2 bg-slate-900 hover:bg-violet-600 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all border border-slate-700 hover:border-violet-500/50 flex items-center justify-center gap-2 group/btn"
                                            >
                                                <UserPlus size={16} className="text-slate-500 group-hover/btn:text-white transition-colors" />
                                                Connect
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Post Details Modal */}
            {
                activePost && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all" onClick={() => setActivePost(null)}>
                        <div
                            className="bg-slate-900 w-full max-w-2xl h-[80vh] rounded-3xl overflow-hidden flex flex-col border border-slate-700/50 shadow-2xl animate-fade-in"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    {renderAvatar(activePost.author?.avatar, "w-10 h-10", "text-2xl")}
                                    <div>
                                        <div className="font-bold text-slate-100">{activePost.author?.name || 'Anonymous'}</div>
                                        <div className="text-xs text-slate-500">{activePost.timestamp}</div>
                                    </div>
                                </div>
                                <button onClick={() => setActivePost(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900/30">
                                <h2 className="text-xl font-bold text-white mb-4">{activePost.title}</h2>
                                <p className="text-slate-300 mb-6 leading-relaxed whitespace-pre-wrap">{activePost.content}</p>

                                <div className="flex items-center gap-6 py-3 border-y border-slate-800/50 mb-6">
                                    <button
                                        onClick={() => handleUpvote(activePost._id || activePost.id)}
                                        className={`flex items-center gap-2 ${activePost.isUpvoted ? 'text-violet-400' : 'text-slate-400 hover:text-violet-400'} font-medium transition-colors`}
                                    >
                                        <ThumbsUp size={18} /> {activePost.upvotes || 0}
                                    </button>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <MessageSquare size={18} /> {comments.length} replies
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div className="space-y-4">
                                    {comments.length === 0 ? (
                                        <div className="text-center text-slate-500 py-8">No replies yet. Be the first!</div>
                                    ) : (
                                        comments.map((comment, idx) => (
                                            <div key={idx} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {renderAvatar(comment.author?.avatar, "w-8 h-8", "text-lg")}
                                                        <span className="font-semibold text-sm text-slate-200">{comment.author?.name || 'Anonymous'}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-500">{comment.timestamp}</span>
                                                </div>
                                                <p className="text-slate-300 text-sm leading-relaxed">{comment.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Comment Input */}
                            <div className="p-4 bg-slate-900 border-t border-slate-800/80">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Write a reply..."
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        className="flex-1 bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500/50 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                        onKeyPress={e => e.key === 'Enter' && handlePostComment()}
                                    />
                                    <button
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim()}
                                        className="bg-violet-600 hover:bg-violet-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/20"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Notifications Panel */}
            {showNotifications && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="fixed top-20 right-6 w-96 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl z-50 animate-fade-in">
                        <div className="p-4 border-b border-slate-800/80">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Bell size={20} className="text-violet-400" />
                                    Notifications
                                </h3>
                                <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                            {notifications.length === 0 && connectionRequests.length === 0 ? (
                                <div className="text-center text-slate-500 py-8">
                                    <Bell size={48} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">No new notifications</p>
                                </div>
                            ) : (
                                <>
                                    {connectionRequests.map(req => (
                                        <div key={req.id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                                            <div className="flex items-center gap-3 mb-3">
                                                {renderAvatar(req.avatar, "w-10 h-10", "text-2xl")}
                                                <div className="flex-1">
                                                    <div className="text-sm font-semibold text-white">{req.name}</div>
                                                    <div className="text-xs text-slate-400">wants to connect</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAcceptConnection(req.id, req.name)}
                                                    className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:shadow-lg text-white text-xs font-bold rounded-lg transition-all"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectConnection(req.id)}
                                                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {notifications.map(notif => (
                                        <div key={notif.id} className="p-3 bg-slate-800/30 rounded-xl">
                                            <p className="text-sm text-slate-300">{notif.message}</p>
                                            <p className="text-xs text-slate-500 mt-1">{notif.timestamp}</p>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
                    <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl w-full max-w-md p-6 border border-slate-700/50 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Settings size={24} className="text-violet-400" />
                                Settings
                            </h3>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-800/50 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-200">Notifications</span>
                                    <input type="checkbox" className="w-5 h-5 rounded bg-slate-700 border-slate-600" defaultChecked />
                                </div>
                                <p className="text-xs text-slate-500">Receive updates about new posts and replies</p>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-200">Dark Mode</span>
                                    <input type="checkbox" className="w-5 h-5 rounded bg-slate-700 border-slate-600" defaultChecked />
                                </div>
                                <p className="text-xs text-slate-500">Use dark theme across the application</p>
                            </div>
                            <button className="w-full py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:shadow-lg hover:shadow-violet-500/25 text-white font-bold rounded-xl transition-all">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                    <div className="fixed bottom-20 left-6 w-64 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl z-50 animate-fade-in">
                        <div className="p-4 space-y-2">
                            <button
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    setShowUserProfile({ isMe: true });
                                }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/80 rounded-xl text-slate-300 hover:text-white transition-all"
                            >
                                <User size={18} />
                                <span className="text-sm font-medium">View Profile</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/80 rounded-xl text-slate-300 hover:text-white transition-all">
                                <Bookmark size={18} />
                                <span className="text-sm font-medium">Saved Posts</span>
                            </button>
                            <button
                                onClick={handleSettings}
                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/80 rounded-xl text-slate-300 hover:text-white transition-all"
                            >
                                <Settings size={18} />
                                <span className="text-sm font-medium">Settings</span>
                            </button>
                            <div className="border-t border-slate-800 my-2"></div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-xl text-red-400 hover:text-red-300 transition-all"
                            >
                                <LogOut size={18} />
                                <span className="text-sm font-medium">Back to Dashboard</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Animations */}
            <style>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
        </div >
    );
}
