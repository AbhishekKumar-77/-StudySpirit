import axios from 'axios';
import { API_BASE } from '../config';

const BASE_URL = API_BASE;

// Create axios instance with default config
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't redirect for session-check calls (auth/me) — those are expected to fail if not logged in
            const requestUrl = error.config?.url || '';
            if (!requestUrl.includes('/auth/me') && !requestUrl.includes('/auth/logout')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// Legacy exports for backward compatibility
export const login = async (email, password) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
};

export const register = async (name, email, password, role, university, course) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, email, password, role, university, course })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
};

export const verifyEmail = async (email, code) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, code })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
};

export const socialLogin = async (provider, email, name, providerId) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ provider, email, name, providerId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    } catch (error) {
        throw error;
    }
};
