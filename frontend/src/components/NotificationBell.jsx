import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { API_BASE } from '../config';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        
        // Close dropdown when clicking outside
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const res = await fetch(`${API_BASE}/auth/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE}/auth/notifications/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark notifications read', error);
        }
    };

    const toggleDropdown = () => {
        if (!isOpen) markAsRead();
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleDropdown}
                className="relative p-2 rounded-full hover:bg-[var(--glass-bg)] transition-all flex items-center justify-center"
                style={{ color: 'var(--text-secondary)' }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/50 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 backdrop-blur-xl">
                    <div className="sticky top-0 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] p-4 flex justify-between items-center backdrop-blur-md z-10">
                        <h3 className="font-bold text-[var(--text-primary)]">Notifications</h3>
                        <span className="text-xs bg-[var(--glass-bg)] px-2 py-1 rounded-full text-[var(--text-secondary)]">
                            {notifications.length} Total
                        </span>
                    </div>
                    
                    <div className="p-2 space-y-1">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-[var(--text-muted)] text-sm">
                                You're all caught up!
                            </div>
                        ) : (
                            notifications.map((n, i) => (
                                <div 
                                    key={i} 
                                    className={`p-3 rounded-lg text-sm border-l-2 transition-all ${
                                        n.read 
                                            ? 'bg-transparent border-transparent hover:bg-[var(--glass-bg)]' 
                                            : 'bg-[var(--glass-bg)] border-cyan-500'
                                    }`}
                                >
                                    <p className="text-[var(--text-primary)]">{n.message}</p>
                                    <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
