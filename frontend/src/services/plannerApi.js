import api from './api';

// ================== TASKS API ==================

export const taskAPI = {
    // Get all tasks
    getAll: async () => {
        const response = await api.get('/planner/tasks');
        return response.data;
    },

    // Create new task
    create: async (taskData) => {
        const response = await api.post('/planner/tasks', taskData);
        return response.data;
    },

    // Update task
    update: async (id, taskData) => {
        const response = await api.put(`/planner/tasks/${id}`, taskData);
        return response.data;
    },

    // Delete task
    delete: async (id) => {
        const response = await api.delete(`/planner/tasks/${id}`);
        return response.data;
    },

    // Toggle task completion
    toggle: async (id, completed) => {
        const response = await api.put(`/planner/tasks/${id}`, { completed });
        return response.data;
    }
};

// ================== GOALS API ==================

export const goalAPI = {
    // Get all goals
    getAll: async () => {
        const response = await api.get('/planner/goals');
        return response.data;
    },

    // Create new goal
    create: async (goalData) => {
        const response = await api.post('/planner/goals', goalData);
        return response.data;
    },

    // Update goal
    update: async (id, goalData) => {
        const response = await api.put(`/planner/goals/${id}`, goalData);
        return response.data;
    },

    // Delete goal
    delete: async (id) => {
        const response = await api.delete(`/planner/goals/${id}`);
        return response.data;
    },

    // Update goal progress
    updateProgress: async (id, progress) => {
        const response = await api.put(`/planner/goals/${id}`, { progress });
        return response.data;
    }
};

// ================== ANALYTICS API ==================

export const analyticsAPI = {
    // Get planner overview (weekly activity, performance, insights)
    getOverview: async () => {
        const response = await api.get('/planner/overview');
        return response.data;
    }
};

export default { taskAPI, goalAPI, analyticsAPI };
