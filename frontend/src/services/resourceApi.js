import axios from 'axios';
import { API_BASE } from '../config';

const api = axios.create({
    baseURL: `${API_BASE}/resources`,
    withCredentials: true
});

const resourceApi = {
    // Folders
    getFolders: () => api.get('/folders').then(res => res.data),
    createFolder: (data) => api.post('/folders', data).then(res => res.data),
    deleteFolder: (id) => api.delete(`/folders/${id}`).then(res => res.data),

    // Personal Resources
    getMyResources: (folderId) => api.get('/my', { params: { folderId } }).then(res => res.data),
    saveResource: (data) => api.post('/save', data).then(res => res.data),
    deleteResource: (id) => api.delete(`/${id}`).then(res => res.data),

    // File Upload
    uploadFile: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),

    // AI Features (Keeping existing but wrapped)
    generateNotes: (data) => api.post('/generate-notes', data).then(res => res.data),
    explainConcept: (data) => api.post('/explain', data).then(res => res.data),
    searchYoutube: (query) => api.post('/search-youtube', { query }).then(res => res.data),
    generateFlashcards: (data) => api.post('/generate-flashcards', data).then(res => res.data)
};

export default resourceApi;
