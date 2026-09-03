import { API_BASE } from '../config';
const BASE_URL = API_BASE;

const fetchWithAuth = async (endpoint, options = {}) => {
    try {
        const token = localStorage.getItem('token');
        const headers = { ...options.headers };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
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

export const getProfile = async () => fetchWithAuth('/english/profile');
export const submitAssessment = async (answers, speakingSampleScore) => fetchWithAuth('/english/assessment', { method: 'POST', body: JSON.stringify({ answers, speakingSampleScore }) });
export const getRecommendations = async () => fetchWithAuth('/english/recommendations');
export const saveSession = async (sessionData) => fetchWithAuth('/english/session', { method: 'POST', body: JSON.stringify(sessionData) });
export const getSessionHistory = async () => fetchWithAuth('/english/sessions/history');
export const saveWordToBank = async (wordData) => fetchWithAuth('/english/vocabulary/save', { method: 'POST', body: JSON.stringify(wordData) });
export const getVocabBank = async () => fetchWithAuth('/english/vocabulary/bank');

// Existing SoftSkills solo APIs wrapped cleanly
export const softSkillsAIChat = async (message, previousMessages = [], options = {}) => {
    return fetchWithAuth('/solo/ai/softskills', {
        method: 'POST',
        body: JSON.stringify({ message, previousMessages, persona: options.persona, scenario: options.scenario })
    });
};

export const fetchVocabulary = async () => fetchWithAuth('/solo/vocabulary');
export const fetchWritingTopic = async () => fetchWithAuth('/solo/writing/topic');
export const evaluateWriting = async (topic, essay, tone = 'Professional') => fetchWithAuth('/solo/writing/evaluate', { method: 'POST', body: JSON.stringify({ topic, essay, tone }) });
export const fetchSpeakingTopic = async () => fetchWithAuth('/solo/speaking/topic');
export const evaluateSpeech = async (topic, transcript, durationSeconds = 120) => fetchWithAuth('/solo/speaking/evaluate', { method: 'POST', body: JSON.stringify({ topic, transcript, durationSeconds }) });

export default {
    getProfile,
    submitAssessment,
    getRecommendations,
    saveSession,
    getSessionHistory,
    saveWordToBank,
    getVocabBank,
    softSkillsAIChat,
    fetchVocabulary,
    fetchWritingTopic,
    evaluateWriting,
    fetchSpeakingTopic,
    evaluateSpeech
};
