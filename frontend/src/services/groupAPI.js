import axios from 'axios';
import { io } from 'socket.io-client';
import { API_URL, API_BASE } from '../config';

const API_BASE_GROUP = `${API_BASE}/group`;

// Create axios instance with credentials
const api = axios.create({
    baseURL: API_BASE_GROUP,
    withCredentials: true
});

// Socket connection
let socket = null;
let currentGroupId = null; // Track current group for auto-rejoin

export const connectSocket = () => {
    if (!socket) {
        socket = io(API_URL, {
            withCredentials: true,
            transports: ['websocket'], // Force WebSocket (fixes Render/Vercel polling drops)
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });

        // Handle connection events
        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket.id);
            // Rejoin group room if we were in one
            if (currentGroupId) {
                console.log('🔄 Rejoining group after reconnect:', currentGroupId);
                socket.emit('group:join', currentGroupId);
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('🔌 Socket connection error:', error);
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('🔌 Socket reconnected after', attemptNumber, 'attempts');
        });
    }
    return socket;
};

export const getSocket = () => socket;

export const isSocketConnected = () => socket?.connected ?? false;

// Wait for socket to connect (useful for ensuring connection before emitting)
export const ensureSocketConnected = (timeout = 5000) => {
    return new Promise((resolve, reject) => {
        if (!socket) {
            connectSocket();
        }

        if (socket.connected) {
            resolve(socket);
            return;
        }

        const timeoutId = setTimeout(() => {
            socket.off('connect', onConnect);
            reject(new Error('Socket connection timeout'));
        }, timeout);

        const onConnect = () => {
            clearTimeout(timeoutId);
            resolve(socket);
        };

        socket.once('connect', onConnect);
    });
};

export const setCurrentGroupId = (groupId) => {
    currentGroupId = groupId;
    console.log('📍 Current group set to:', groupId);
};

export const getCurrentGroupId = () => currentGroupId;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        currentGroupId = null;
    }
};

// ============== GROUP API ==============
export const groupAPI = {
    // Get all groups
    getAll: async (params = {}) => {
        const response = await api.get('/groups', { params });
        return response.data;
    },

    // Get my groups
    getMyGroups: async () => {
        const response = await api.get('/groups/my');
        return response.data;
    },

    // Get single group
    getById: async (groupId) => {
        const response = await api.get(`/groups/${groupId}`);
        return response.data;
    },

    // Create group
    create: async (groupData) => {
        const response = await api.post('/groups', groupData);
        return response.data;
    },

    // Update group
    update: async (groupId, updates) => {
        const response = await api.put(`/groups/${groupId}`, updates);
        return response.data;
    },

    // Delete group
    delete: async (groupId) => {
        const response = await api.delete(`/groups/${groupId}`);
        return response.data;
    },

    // Join group
    join: async (groupId) => {
        const response = await api.post(`/groups/${groupId}/join`);
        return response.data;
    },

    // Join via invite code
    joinByCode: async (inviteCode) => {
        const response = await api.post('/groups/join-code', { inviteCode });
        return response.data;
    },

    // Leave group
    leave: async (groupId) => {
        const response = await api.post(`/groups/${groupId}/leave`);
        return response.data;
    },

    // Get leaderboard
    getLeaderboard: async (groupId) => {
        const response = await api.get(`/groups/${groupId}/leaderboard`);
        return response.data;
    },

    // Update member role
    updateMemberRole: async (groupId, memberId, role) => {
        const response = await api.put(`/groups/${groupId}/members/${memberId}/role`, { role });
        return response.data;
    },

    // Remove member
    removeMember: async (groupId, memberId) => {
        const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
        return response.data;
    },

    // Get Join Requests
    getJoinRequests: async (groupId) => {
        const response = await api.get(`/groups/${groupId}/requests`);
        return response.data;
    },

    // Handle Join Request
    handleJoinRequest: async (groupId, requestId, action) => {
        const response = await api.post(`/groups/${groupId}/requests/${requestId}`, { action });
        return response.data;
    }
};

// ============== STUDY ROOM API ==============
export const roomAPI = {
    // Get live rooms
    getLive: async (params = {}) => {
        const response = await api.get('/rooms/live', { params });
        return response.data;
    },

    // Get group rooms
    getGroupRooms: async (groupId, status) => {
        const response = await api.get(`/rooms/group/${groupId}`, { params: { status } });
        return response.data;
    },

    // Get single room
    getById: async (roomId) => {
        const response = await api.get(`/rooms/${roomId}`);
        return response.data;
    },

    // Create room
    create: async (roomData) => {
        const response = await api.post('/rooms', roomData);
        return response.data;
    },

    // Join room
    join: async (roomId) => {
        const response = await api.post(`/rooms/${roomId}/join`);
        return response.data;
    },

    // Leave room
    leave: async (roomId) => {
        const response = await api.post(`/rooms/${roomId}/leave`);
        return response.data;
    },

    // Update participant status
    updateStatus: async (roomId, status) => {
        const response = await api.put(`/rooms/${roomId}/status`, status);
        return response.data;
    },

    // Update pomodoro
    updatePomodoro: async (roomId, pomodoroSettings) => {
        const response = await api.put(`/rooms/${roomId}/pomodoro`, pomodoroSettings);
        return response.data;
    },

    // End room
    end: async (roomId) => {
        const response = await api.post(`/rooms/${roomId}/end`);
        return response.data;
    }
};

// ============== CHALLENGE API ==============
export const challengeAPI = {
    // Get all active challenges
    getAll: async (params = {}) => {
        const response = await api.get('/challenges', { params });
        return response.data;
    },

    // Get public challenges (visible to all users)
    getPublicChallenges: async (params = {}) => {
        const response = await api.get('/challenges/public', { params });
        return response.data;
    },

    // Get my created challenges
    getMyChallenges: async () => {
        const response = await api.get('/challenges/my');
        return response.data;
    },

    // Get group challenges
    getGroupChallenges: async (groupId, status) => {
        const response = await api.get(`/challenges/group/${groupId}`, { params: { status } });
        return response.data;
    },

    // Get single challenge
    getById: async (challengeId) => {
        const response = await api.get(`/challenges/${challengeId}`);
        return response.data;
    },

    // Get challenge leaderboard
    getLeaderboard: async (challengeId) => {
        const response = await api.get(`/challenges/${challengeId}/leaderboard`);
        return response.data;
    },

    // Create challenge
    create: async (challengeData) => {
        const response = await api.post('/challenges', challengeData);
        return response.data;
    },

    // Join challenge
    join: async (challengeId) => {
        const response = await api.post(`/challenges/${challengeId}/join`);
        return response.data;
    },

    // Update progress
    updateProgress: async (challengeId, progress) => {
        const response = await api.put(`/challenges/${challengeId}/progress`, { progress });
        return response.data;
    },

    // Delete challenge
    delete: async (challengeId) => {
        const response = await api.delete(`/challenges/${challengeId}`);
        return response.data;
    }
};


// ============== RESOURCE API ==============
export const resourceAPI = {
    // Get group resources
    getGroupResources: async (groupId, params = {}) => {
        const response = await api.get(`/resources/group/${groupId}`, { params });
        return response.data;
    },

    // Create resource
    create: async (resourceData) => {
        const response = await api.post('/resources', resourceData);
        return response.data;
    },

    // Download resource
    download: async (resourceId) => {
        const response = await api.post(`/resources/${resourceId}/download`);
        return response.data;
    },

    // Like resource
    toggleLike: async (resourceId) => {
        const response = await api.post(`/resources/${resourceId}/like`);
        return response.data;
    },

    // Delete resource
    delete: async (resourceId) => {
        const response = await api.delete(`/resources/${resourceId}`);
        return response.data;
    }
};

// ============== MESSAGE API ==============
export const messageAPI = {
    // Get messages
    getMessages: async (params = {}) => {
        const response = await api.get('/messages', { params });
        return response.data;
    },

    // Send message
    send: async (messageData) => {
        const response = await api.post('/messages', messageData);
        return response.data;
    },

    // Add reaction
    addReaction: async (messageId, emoji) => {
        const response = await api.post(`/messages/${messageId}/reaction`, { emoji });
        return response.data;
    },

    // Delete message
    delete: async (messageId) => {
        const response = await api.delete(`/messages/${messageId}`);
        return response.data;
    }
};

// ============== ACTIVITY API ==============
export const activityAPI = {
    // Get group activity
    getGroupActivity: async (groupId, params = {}) => {
        const response = await api.get(`/activity/group/${groupId}`, { params });
        return response.data;
    },

    // Get user activity
    getUserActivity: async (params = {}) => {
        const response = await api.get('/activity/user', { params });
        return response.data;
    }
};

export default {
    groupAPI,
    roomAPI,
    challengeAPI,
    resourceAPI,
    messageAPI,
    activityAPI,
    connectSocket,
    getSocket,
    disconnectSocket
};
