import axios from 'axios';
import { API_BASE } from '../config';

const BASE_URL = `${API_BASE}/discuss`;

// Create axios instance with credentials support
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

// Add request interceptor to attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getPosts = async (channelId) => {
    try {
        const response = await api.get('/posts', { params: { channelId } });
        return response.data;
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
};

export const createPost = async (postData) => {
    try {
        const response = await api.post('/posts', postData);
        return response.data;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};

export const toggleUpvote = async (postId) => {
    try {
        const response = await api.post(`/posts/${postId}/upvote`);
        return response.data;
    } catch (error) {
        // If 401, user needs to login
        if (error.response && error.response.status === 401) {
            console.warn('User not authenticated');
        }
        throw error;
    }
};

export const getDirectMessages = async (userId) => {
    try {
        const response = await api.get(`/dms/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

export const sendDirectMessage = async (recipientId, content) => {
    try {
        const response = await api.post('/dms', { recipientId, content });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

export const getUsers = async () => {
    try {
        const response = await api.get('/users');
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const getOnlineUsers = async () => {
    try {
        const response = await api.get('/users/online');
        return response.data;
    } catch (error) {
        console.error('Error fetching online users:', error);
        return [];
    }
};

export const getComments = async (postId) => {
    try {
        const response = await api.get(`/posts/${postId}/comments`);
        return response.data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
};

export const postComment = async (postId, content) => {
    try {
        const response = await api.post(`/posts/${postId}/comments`, { content });
        return response.data;
    } catch (error) {
        console.error('Error posting comment:', error);
        throw error;
    }
};

export const getTrendingTopics = async () => {
    try {
        const response = await api.get('/trending');
        return response.data;
    } catch (error) {
        console.error('Error fetching trending topics:', error);
        throw error;
    }
};

export const getChannelStats = async () => {
    try {
        const response = await api.get('/channels/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching channel stats:', error);
        throw error;
    }
};

export const sendConnectionRequest = async (userId) => {
    try {
        const response = await api.post('/connections/request', { userId });
        return response.data;
    } catch (error) {
        console.error('Error sending connection request:', error);
        throw error;
    }
};

export const acceptConnectionRequest = async (userId) => {
    try {
        const response = await api.post('/connections/accept', { userId });
        return response.data;
    } catch (error) {
        console.error('Error accepting connection request:', error);
        throw error;
    }
};

export const rejectConnectionRequest = async (userId) => {
    try {
        const response = await api.post('/connections/reject', { userId });
        return response.data;
    } catch (error) {
        console.error('Error rejecting connection request:', error);
        throw error;
    }
};

export const getNetwork = async () => {
    try {
        const response = await api.get('/network');
        return response.data;
    } catch (error) {
        console.error('Error fetching network:', error);
        throw error;
    }
};

export const toggleDownvote = async (postId) => {
    try {
        const response = await api.post(`/posts/${postId}/downvote`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const markSolved = async (postId) => {
    try {
        const response = await api.patch(`/posts/${postId}/solve`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const aiAnswer = async (postId) => {
    try {
        const response = await api.post(`/posts/${postId}/ai-answer`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const clearChannel = async (channelId) => {
    try {
        const response = await api.delete(`/channels/${channelId}/clear`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
