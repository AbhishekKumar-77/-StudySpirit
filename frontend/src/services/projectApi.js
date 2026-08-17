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

// Core
export const getMyProjects = async () => fetchWithAuth('/projects/my');
export const exploreProjects = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/projects/explore${query ? '?' + query : ''}`);
};
export const getProject = async (projectId) => fetchWithAuth(`/projects/${projectId}`);
export const createProject = async (projectData) => fetchWithAuth('/projects', { method: 'POST', body: JSON.stringify(projectData) });
export const updateProject = async (projectId, updates) => fetchWithAuth(`/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify(updates) });
export const deleteProject = async (projectId) => fetchWithAuth(`/projects/${projectId}`, { method: 'DELETE' });

// Files
export const addFile = async (projectId, fileData) => fetchWithAuth(`/projects/${projectId}/files`, { method: 'POST', body: JSON.stringify(fileData) });
export const deleteFile = async (projectId, filePath) => fetchWithAuth(`/projects/${projectId}/files/${encodeURIComponent(filePath)}`, { method: 'DELETE' });

// Actions
export const toggleStar = async (projectId) => fetchWithAuth(`/projects/${projectId}/star`, { method: 'POST' });
export const forkProject = async (projectId) => fetchWithAuth(`/projects/${projectId}/fork`, { method: 'POST' });
export const getUserProjects = async (userId) => fetchWithAuth(`/projects/user/${userId}`);
export const generateReadme = async (projectId) => fetchWithAuth(`/projects/${projectId}/generate-readme`, { method: 'POST' });

// New features
export const getProjectStats = async () => fetchWithAuth('/projects/stats');
export const toggleFeatured = async (projectId) => fetchWithAuth(`/projects/${projectId}/featured`, { method: 'POST' });
export const addBuildLog = async (projectId, logData) => fetchWithAuth(`/projects/${projectId}/build-log`, { method: 'POST', body: JSON.stringify(logData) });
export const getPortfolio = async (userId) => fetchWithAuth(`/projects/portfolio/${userId}`);
export const importGithub = async (projectId, githubUrl) => fetchWithAuth(`/projects/${projectId}/import-github`, { method: 'POST', body: JSON.stringify({ githubUrl }) });
export const generateProjectSummary = async (projectId) => fetchWithAuth(`/projects/${projectId}/ai-summary`, { method: 'POST' });
export const searchProjects = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/projects/search${query ? '?' + query : ''}`);
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
    generateReadme,
    getProjectStats,
    toggleFeatured,
    addBuildLog,
    getPortfolio,
    importGithub,
    generateProjectSummary,
    searchProjects
};
