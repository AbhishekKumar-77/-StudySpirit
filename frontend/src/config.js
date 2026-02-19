/**
 * Central API Configuration
 * All backend URLs are defined here using environment variables.
 * In development: uses http://localhost:3000 (from .env)
 * In production:  uses your deployed backend URL (from .env)
 *
 * To change the backend URL, just update VITE_API_URL in .env
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export default API_BASE;
