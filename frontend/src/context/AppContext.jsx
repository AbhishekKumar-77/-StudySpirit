
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { connectSocket, getSocket } from '../services/groupAPI';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ dailyGoals: 3, completionRate: 0 });

    // On app load: fetch real user from backend session (database)
    useEffect(() => {
        const normalizeUser = (userData) => {
            if (!userData) return null;
            let normalized = { ...userData };
            // Ensure both _id and id are accessible
            if (normalized.id && !normalized._id) {
                normalized._id = normalized.id;
            }
            if (normalized._id && !normalized.id) {
                normalized.id = normalized._id;
            }
            // Ensure top-level stats are mapped from nested stats object
            if (normalized.stats) {
                if (normalized.streak === undefined && normalized.stats.streak !== undefined) {
                    normalized.streak = normalized.stats.streak;
                }
                if (normalized.level === undefined && normalized.stats.level !== undefined) {
                    normalized.level = normalized.stats.level;
                }
                if (normalized.xp === undefined && normalized.stats.xp !== undefined) {
                    normalized.xp = normalized.stats.xp;
                }
            }
            // Defaults for new accounts: streak 1, level 1, xp 0, reputation 0
            if (normalized.streak === undefined || normalized.streak === null) normalized.streak = 1;
            if (normalized.level === undefined || normalized.level === null) normalized.level = 1;
            if (normalized.xp === undefined || normalized.xp === null) normalized.xp = 0;
            if (normalized.reputation === undefined || normalized.reputation === null) normalized.reputation = 0;

            // Admins have isAdmin:true but role may be 'student'/'teacher' in DB
            // Normalize to role:'admin' so RoleGuard works correctly
            if (normalized.isAdmin === true) {
                normalized.role = 'admin';
            }
            // Ensure avatar is a clean image path
            if (!normalized.avatar || normalized.avatar === '👨‍🎓' || (typeof normalized.avatar === 'string' && normalized.avatar.length <= 4 && !normalized.avatar.startsWith('/'))) {
                normalized.avatar = '/AbhishekImage.jpg';
            }
            return normalized;
        };

        const fetchUser = async () => {
            try {
                // Try to get user from backend session first (real database)
                const response = await api.get('/auth/me');
                if (response.data?.user) {
                    const userData = normalizeUser(response.data.user);
                    setUser(userData);
                    localStorage.setItem('studySpiritUser', JSON.stringify(userData));
                } else {
                    // Check if we already have a valid cached user before clearing
                    const existing = localStorage.getItem('studySpiritUser');
                    if (!existing || existing === 'undefined') {
                        setUser(null);
                        localStorage.removeItem('studySpiritUser');
                    }
                }
            } catch (err) {
                // Network error or 401 — preserve cached user if already present from OAuth URL
                const existing = localStorage.getItem('studySpiritUser');
                if (!existing || existing === 'undefined') {
                    console.log('No active session, user needs to login');
                    setUser(null);
                    localStorage.removeItem('studySpiritUser');
                }
            } finally {
                setLoading(false);
            }
        };

        // 1. Immediately inspect URL search params for ?user= (passed after OAuth redirect)
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const userParam = urlParams.get('user');
            if (userParam) {
                const parsed = JSON.parse(decodeURIComponent(userParam));
                const normalized = normalizeUser(parsed);
                if (normalized?._id || normalized?.id) {
                    setUser(normalized);
                    localStorage.setItem('studySpiritUser', JSON.stringify(normalized));
                    // Clean URL query without reload
                    const cleanPath = window.location.pathname;
                    window.history.replaceState({}, document.title, cleanPath);
                }
            }
        } catch (urlErr) {
            console.warn('Could not parse user from URL search:', urlErr);
        }

        // 2. Immediately show cached user to prevent flicker
        const storedUser = localStorage.getItem('studySpiritUser');
        if (storedUser && storedUser !== 'undefined') {
            try {
                setUser(normalizeUser(JSON.parse(storedUser)));
            } catch (err) {
                localStorage.removeItem('studySpiritUser');
            }
        }

        // 3. Reconcile with backend
        fetchUser();
    }, []);

    const loginUser = (userData) => {
        setUser(userData);
        localStorage.setItem('studySpiritUser', JSON.stringify(userData));
        if (userData?._id) {
            const socket = connectSocket();
            if (socket.connected) {
                socket.emit('user:online', String(userData._id));
            } else {
                socket.once('connect', () => socket.emit('user:online', String(userData._id)));
            }
        }
    };

    const logoutUser = async () => {
        try {
            await api.get('/auth/logout');
        } catch (err) {
            // Ignore logout errors
        }
        setUser(null);
        localStorage.removeItem('studySpiritUser');
    };

    // Connect socket for presence when user is set
    useEffect(() => {
        if (user?._id) {
            const socket = connectSocket();
            const announceOnline = () => socket.emit('user:online', String(user._id));
            if (socket.connected) announceOnline();
            socket.on('connect', announceOnline);
            return () => {
                socket.off('connect', announceOnline);
            };
        }
    }, [user?._id]);

    return (
        <AppContext.Provider value={{ user, setUser, loginUser, logoutUser, stats, setStats, loading }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
