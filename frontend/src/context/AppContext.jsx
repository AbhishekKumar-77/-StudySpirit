
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
        const fetchUser = async () => {
            try {
                // Try to get user from backend session first (real database)
                const response = await api.get('/auth/me');
                if (response.data?.user) {
                    const userData = response.data.user;
                    setUser(userData);
                    localStorage.setItem('studySpiritUser', JSON.stringify(userData));
                } else {
                    // No session, clear everything
                    setUser(null);
                    localStorage.removeItem('studySpiritUser');
                }
            } catch (err) {
                // 401 or network error — no valid session
                console.log('No active session, user needs to login');
                setUser(null);
                localStorage.removeItem('studySpiritUser');
            } finally {
                setLoading(false);
            }
        };

        // Immediately show cached user to prevent flicker
        const storedUser = localStorage.getItem('studySpiritUser');
        if (storedUser && storedUser !== 'undefined') {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                localStorage.removeItem('studySpiritUser');
            }
        }

        // Then verify with backend (source of truth)
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
