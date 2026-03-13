import { API_BASE } from '../config';
const BASE_URL = API_BASE;

const fetchWithAuth = async (endpoint, options = {}) => {
    try {
        const headers = { ...options.headers };

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            credentials: 'include',
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

// Get my projects
export const getMyProjects = async () => {
    return fetchWithAuth('/projects/my');
};

// Explore public projects
export const exploreProjects = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/projects/explore${query ? '?' + query : ''}`);
};

// Get single project
export const getProject = async (projectId) => {
    return fetchWithAuth(`/projects/${projectId}`);
};

// Create project
export const createProject = async (projectData) => {
    return fetchWithAuth('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
    });
};

// Update project
export const updateProject = async (projectId, updates) => {
    return fetchWithAuth(`/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
    });
};

// Delete project
export const deleteProject = async (projectId) => {
    return fetchWithAuth(`/projects/${projectId}`, {
        method: 'DELETE'
    });
};

// Add/Update file
export const addFile = async (projectId, fileData) => {
    return fetchWithAuth(`/projects/${projectId}/files`, {
        method: 'POST',
        body: JSON.stringify(fileData)
    });
};

// Delete file
export const deleteFile = async (projectId, filePath) => {
    return fetchWithAuth(`/projects/${projectId}/files/${encodeURIComponent(filePath)}`, {
        method: 'DELETE'
    });
};

// Toggle star
export const toggleStar = async (projectId) => {
    return fetchWithAuth(`/projects/${projectId}/star`, {
        method: 'POST'
    });
};

// Fork project
export const forkProject = async (projectId) => {
    return fetchWithAuth(`/projects/${projectId}/fork`, {
        method: 'POST'
    });
};

// Get user's public projects
export const getUserProjects = async (userId) => {
    return fetchWithAuth(`/projects/user/${userId}`);
};

// Generate AI README
export const generateReadme = async (projectId) => {
    return fetchWithAuth(`/projects/${projectId}/generate-readme`, {
        method: 'POST'
    });
};

export default {
    getMyProjects,
    exploreProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    addFile,
    deleteFile,
    toggleStar,
    forkProject,
    getUserProjects,
    generateReadme
};
