
import { API_BASE } from '../config';
const BASE_URL = API_BASE;

// Helper for authenticated requests
const fetchWithAuth = async (endpoint, options = {}) => {
    try {
        const headers = { ...options.headers };

        // Only set Content-Type to application/json if body is NOT FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            credentials: 'include', // Important for session cookies
            headers,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'API Error');
        return data;
    } catch (error) {
        console.error(`API Error at ${endpoint}:`, error);
        throw error;
    }
};


// Get all Solo Mode dashboard data
export const getStats = async () => {
    return fetchWithAuth('/solo/stats');
};

export const logHeartbeat = async () => {
    return fetchWithAuth('/solo/heartbeat', { method: 'POST' });
};

// Study Session Management
export const startStudySession = async (sessionType = 'focus') => {
    return fetchWithAuth('/solo/session/start', {
        method: 'POST',
        body: JSON.stringify({ sessionType })
    });
};

export const endStudySession = async (sessionId, problemsSolved = 0) => {
    return fetchWithAuth('/solo/session/end', {
        method: 'POST',
        body: JSON.stringify({ sessionId, problemsSolved })
    });
};

// Learning Path
export const updateLearningPath = async (topicName, problemsCompleted = 1) => {
    return fetchWithAuth('/solo/learning-path/update', {
        method: 'POST',
        body: JSON.stringify({ topicName, problemsCompleted })
    });
};

// Contest Reminders
export const addContestReminder = async (contestName, platform, startTime) => {
    return fetchWithAuth('/solo/contest/reminder', {
        method: 'POST',
        body: JSON.stringify({ contestName, platform, startTime })
    });
};

// Activity Logging
export const logActivity = async (problemsSolved = 0, studyTime = 0, xpEarned = 0) => {
    return fetchWithAuth('/solo/activity/log', {
        method: 'POST',
        body: JSON.stringify({ problemsSolved, studyTime, xpEarned })
    });
};

// Task Management
export const createTask = async (taskData) => {
    return fetchWithAuth('/solo/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
    });
};

export const toggleTask = async (taskId) => {
    return fetchWithAuth(`/solo/tasks/${taskId}/toggle`, {
        method: 'PATCH'
    });
};

// AI Chat
export const sendAIMessage = async (message) => {
    return fetchWithAuth('/solo/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message })
    });
};

// Platform Connection with username
export const connectPlatform = async (platform, username) => {
    return fetchWithAuth('/solo/platform/connect', {
        method: 'POST',
        body: JSON.stringify({ platform, username })
    });
};

// Disconnect platform
export const disconnectPlatform = async (platform) => {
    return fetchWithAuth('/solo/platform/disconnect', {
        method: 'POST',
        body: JSON.stringify({ platform })
    });
};

// Refresh platform data
export const refreshPlatformData = async (platform) => {
    return fetchWithAuth(`/solo/platform/refresh/${platform}`);
};

// Get upcoming contests (real-time from multiple platforms)
export const getUpcomingContests = async () => {
    return fetchWithAuth('/solo/contests');
};

// Get personalized study suggestions based on workload, days, and pressure
export const getStudySuggestions = async (studyParams) => {
    return fetchWithAuth('/solo/ai/study-suggestions', {
        method: 'POST',
        body: JSON.stringify(studyParams)
    });
};

// Generate Skill Tree
export const generateSkillTree = async (topic) => {
    return fetchWithAuth('/solo/learning-path/generate', {
        method: 'POST',
        body: JSON.stringify({ topic })
    });
};

// Complete Onboarding (first-time setup + AI roadmap)
export const completeOnboarding = async (data) => {
    return fetchWithAuth('/solo/onboarding', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export default {
    getStats,
    startStudySession,
    endStudySession,
    updateLearningPath,
    addContestReminder,
    logActivity,
    createTask,
    toggleTask,
    sendAIMessage,
    connectPlatform,
    disconnectPlatform,
    refreshPlatformData,
    getUpcomingContests,
    getStudySuggestions,
    generateSkillTree,
    startInterview: async (data) => {
        const isFormData = data instanceof FormData;
        return fetchWithAuth('/solo/ai/interview', {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data)
        });
    },
    endInterview: async (data) => {
        return fetchWithAuth('/solo/ai/interview/end', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    getInterviewHistory: async () => {
        return fetchWithAuth('/solo/ai/interview/history');
    },
    getInterviewSession: async (sessionId) => {
        return fetchWithAuth(`/solo/ai/interview/${sessionId}`);
    },
    // Events Hub
    getEvents: async () => {
        return fetchWithAuth('/events'); // This maps to /api/events automatically if BASE_URL handles it? 
        // Wait, BASE_URL is http://localhost:3000/api
        // So fetchWithAuth('/events') -> http://localhost:3000/api/events. Correct.
    },
    toggleEventMonitor: async (eventId) => {
        return fetchWithAuth('/events/monitor', {
            method: 'POST',
            body: JSON.stringify({ eventId })
        });
    },
    getMonitoredEvents: async () => {
        return fetchWithAuth('/events/monitored');
    },
    checkATS: async (formData) => {
        return fetchWithAuth('/solo/ai/ats/check', {
            method: 'POST',
            body: formData
        });
    }
};

