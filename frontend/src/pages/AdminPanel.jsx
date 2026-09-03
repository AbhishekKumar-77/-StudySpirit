import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../config';
import {
    ArrowLeft, Shield, Users, BarChart3, Search, Filter,
    Ban, CheckCircle, Trash2, Crown, Eye, RefreshCw,
    ChevronLeft, ChevronRight, UserX, UserCheck, Mail,
    Clock, TrendingUp, Globe, AlertTriangle, X, Settings,
    ShieldCheck, ShieldOff, GraduationCap, Briefcase, BookOpen
} from 'lucide-react';
import { getAvatarUrl, handleAvatarError } from '../utils/avatarHelper';

export default function AdminPanel() {
    const navigate = useNavigate();
    const { user } = useApp();

    // State
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users'
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [actionLoading, setActionLoading] = useState('');
    const [blockReason, setBlockReason] = useState('');
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockTargetId, setBlockTargetId] = useState(null);

    // Redirect if not admin
    useEffect(() => {
        if (user && !user.isAdmin) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/stats`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setStats(data.stats);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, []);

    // Fetch users
    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search }),
                ...(roleFilter && { role: roleFilter }),
                ...(statusFilter && { status: statusFilter })
            });
            const res = await fetch(`${API_BASE}/admin/users?${params}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
                setPagination(data.pagination);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter, statusFilter]);

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, [fetchStats, fetchUsers]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(1), 400);
        return () => clearTimeout(timer);
    }, [search, roleFilter, statusFilter]);

    // View user detail
    const viewUserDetail = async (userId) => {
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setSelectedUser(data.user);
                setShowUserModal(true);
            }
        } catch (err) {
            console.error('Failed to fetch user detail:', err);
        }
    };

    // Block user
    const handleBlock = async () => {
        if (!blockTargetId) return;
        setActionLoading('block');
        try {
            const res = await fetch(`${API_BASE}/admin/users/${blockTargetId}/block`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reason: blockReason })
            });
            const data = await res.json();
            if (data.success) {
                setShowBlockModal(false);
                setBlockReason('');
                setBlockTargetId(null);
                fetchUsers(pagination.page);
                fetchStats();
            }
        } catch (err) {
            console.error('Failed to block user:', err);
        } finally {
            setActionLoading('');
        }
    };

    // Unblock user
    const handleUnblock = async (userId) => {
        setActionLoading(`unblock-${userId}`);
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}/unblock`, {
                method: 'PATCH', credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers(pagination.page);
                fetchStats();
            }
        } catch (err) {
            console.error('Failed to unblock user:', err);
        } finally {
            setActionLoading('');
        }
    };

    // Change role
    const handleChangeRole = async (userId, newRole) => {
        setActionLoading(`role-${userId}`);
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();
            if (data.success) fetchUsers(pagination.page);
        } catch (err) {
            console.error('Failed to change role:', err);
        } finally {
            setActionLoading('');
        }
    };

    // Make / Remove admin
    const handleToggleAdmin = async (userId, makeAdmin) => {
        setActionLoading(`admin-${userId}`);
        try {
            const endpoint = makeAdmin ? 'make-admin' : 'remove-admin';
            const res = await fetch(`${API_BASE}/admin/users/${userId}/${endpoint}`, {
                method: 'PATCH', credentials: 'include'
            });
            const data = await res.json();
            if (data.success) fetchUsers(pagination.page);
        } catch (err) {
            console.error('Failed to toggle admin:', err);
        } finally {
            setActionLoading('');
        }
    };

    // Delete user
    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`⚠️ Permanently delete "${userName}"? This cannot be undone.`)) return;
        setActionLoading(`delete-${userId}`);
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
                method: 'DELETE', credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers(pagination.page);
                fetchStats();
            }
        } catch (err) {
            console.error('Failed to delete user:', err);
        } finally {
            setActionLoading('');
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';
    const roleIcon = (role) => role === 'teacher' ? <BookOpen size={14} /> : role === 'recruiter' ? <Briefcase size={14} /> : <GraduationCap size={14} />;
    const providerBadge = (p) => p === 'google' ? '🔵 Google' : p === 'github' ? '⚫ GitHub' : '📧 Email';

    if (!user?.isAdmin) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: 'white', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <Shield size={64} style={{ color: '#ef4444', marginBottom: 16 }} />
                    <h2 style={{ fontSize: 24, fontWeight: 800 }}>Access Denied</h2>
                    <p style={{ opacity: 0.7, marginTop: 8 }}>You need admin privileges to access this page.</p>
                    <button onClick={() => navigate('/dashboard')} style={{ marginTop: 20, padding: '12px 32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: 'white', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

            {/* Navbar */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)', background: 'rgba(15,12,41,0.85)', borderBottom: '1px solid rgba(139,92,246,0.15)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(139,92,246,0.1)', color: '#c4b5fd', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                        <ArrowLeft size={18} /> Dashboard
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Shield size={28} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Panel</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, opacity: 0.6 }}>Logged in as</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>{user?.name || 'Admin'}</span>
                </div>
            </nav>

            {/* Tab Switcher */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 32px 0' }}>
                <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 4, width: 'fit-content' }}>
                    {[
                        { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
                        { key: 'users', label: 'All Users', icon: <Users size={16} /> }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
                                borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                                background: activeTab === tab.key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                                color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.5)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 32px 48px' }}>

                {/* ═══════════ DASHBOARD TAB ═══════════ */}
                {activeTab === 'dashboard' && stats && (
                    <div>
                        {/* Stat Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
                            {[
                                { label: 'Total Users', value: stats.totalUsers, icon: <Users size={24} />, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
                                { label: 'Active Users', value: stats.activeUsers, icon: <UserCheck size={24} />, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                                { label: 'Blocked Users', value: stats.blockedUsers, icon: <Ban size={24} />, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
                                { label: 'Verified Users', value: stats.verifiedUsers, icon: <CheckCircle size={24} />, color: '#22d3ee', bg: 'rgba(34,211,238,0.15)' },
                                { label: 'New This Week', value: stats.newUsersThisWeek, icon: <TrendingUp size={24} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                                { label: 'Logged In Today', value: stats.loggedInToday, icon: <Clock size={24} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' }
                            ].map((card, i) => (
                                <div key={i} style={{ background: card.bg, border: `1px solid ${card.color}33`, borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${card.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 30, fontWeight: 800, color: card.color }}>{card.value}</div>
                                        <div style={{ fontSize: 13, opacity: 0.7, fontWeight: 600 }}>{card.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Breakdown Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                            {/* By Role */}
                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <GraduationCap size={18} style={{ color: '#6366f1' }} /> Users by Role
                                </h3>
                                {[
                                    { label: 'Students', value: stats.byRole.students, color: '#6366f1' },
                                    { label: 'Teachers', value: stats.byRole.teachers, color: '#f59e0b' },
                                    { label: 'Recruiters', value: stats.byRole.recruiters, color: '#10b981' }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        <span style={{ fontSize: 14, opacity: 0.8 }}>{item.label}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 100, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                                <div style={{ width: `${stats.totalUsers ? (item.value / stats.totalUsers * 100) : 0}%`, height: '100%', borderRadius: 3, background: item.color, transition: 'width 0.5s' }} />
                                            </div>
                                            <span style={{ fontSize: 16, fontWeight: 800, color: item.color, minWidth: 30, textAlign: 'right' }}>{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* By Provider */}
                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Globe size={18} style={{ color: '#22d3ee' }} /> Login Provider
                                </h3>
                                {[
                                    { label: '📧 Email/Password', value: stats.byProvider.email, color: '#6366f1' },
                                    { label: '🔵 Google OAuth', value: stats.byProvider.google, color: '#ef4444' },
                                    { label: '⚫ GitHub OAuth', value: stats.byProvider.github, color: '#a78bfa' }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        <span style={{ fontSize: 14, opacity: 0.8 }}>{item.label}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 100, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                                <div style={{ width: `${stats.totalUsers ? (item.value / stats.totalUsers * 100) : 0}%`, height: '100%', borderRadius: 3, background: item.color, transition: 'width 0.5s' }} />
                                            </div>
                                            <span style={{ fontSize: 16, fontWeight: 800, color: item.color, minWidth: 30, textAlign: 'right' }}>{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════ USERS TAB ═══════════ */}
                {activeTab === 'users' && (
                    <div>
                        {/* Search & Filters Bar */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: '1 1 300px' }}>
                                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, university..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ width: '100%', padding: '12px 16px 12px 44px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', fontSize: 14, outline: 'none' }}
                                />
                            </div>
                            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', fontSize: 14 }}>
                                <option value="">All Roles</option>
                                <option value="student">Students</option>
                                <option value="teacher">Teachers</option>
                                <option value="recruiter">Recruiters</option>
                            </select>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', fontSize: 14 }}>
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="blocked">Blocked</option>
                                <option value="unverified">Unverified</option>
                            </select>
                            <button onClick={() => { fetchUsers(pagination.page); fetchStats(); }} style={{ padding: '12px 20px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
                                <RefreshCw size={16} /> Refresh
                            </button>
                        </div>

                        {/* Results count */}
                        <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 12, fontWeight: 600 }}>
                            Showing {users.length} of {pagination.total} users · Page {pagination.page} of {pagination.pages || 1}
                        </div>

                        {/* Users Table */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 60 }}>
                                <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#6366f1', marginBottom: 12 }} />
                                <p style={{ opacity: 0.6 }}>Loading users...</p>
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
                                    <thead>
                                        <tr>
                                            {['User', 'Email', 'Role', 'Status', 'Provider', 'Last Login', 'Joined', 'Actions'].map(h => (
                                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} style={{ background: u.isBlocked ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)', transition: 'background 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.background = u.isBlocked ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)'}
                                            >
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <img
                                                            src={getAvatarUrl(u.avatar)}
                                                            alt={u.name}
                                                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                                                            onError={handleAvatarError}
                                                        />
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, color: 'white' }}>
                                                                {u.name}
                                                                {u.isAdmin && <Crown size={14} style={{ color: '#f59e0b' }} />}
                                                            </div>
                                                            {u.university && <div style={{ fontSize: 11, opacity: 0.5 }}>{u.university}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: 13, opacity: 0.8 }}>{u.email}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, textTransform: 'capitalize', background: u.role === 'teacher' ? 'rgba(245,158,11,0.15)' : u.role === 'recruiter' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)', color: u.role === 'teacher' ? '#f59e0b' : u.role === 'recruiter' ? '#10b981' : '#818cf8' }}>
                                                        {roleIcon(u.role)} {u.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    {u.isBlocked ? (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                                                            <Ban size={12} /> Blocked
                                                        </span>
                                                    ) : !u.isVerified ? (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                                            <AlertTriangle size={12} /> Unverified
                                                        </span>
                                                    ) : (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                                            <CheckCircle size={12} /> Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: 12, opacity: 0.7 }}>{providerBadge(u.loginProvider)}</td>
                                                <td style={{ padding: '12px 16px', fontSize: 12, opacity: 0.6 }}>{formatDate(u.lastLogin)}</td>
                                                <td style={{ padding: '12px 16px', fontSize: 12, opacity: 0.6 }}>{formatDate(u.joinedAt)}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                        {/* View Detail */}
                                                        <button title="View Details" onClick={() => viewUserDetail(u.id)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(99,102,241,0.15)', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Eye size={14} />
                                                        </button>
                                                        {/* Block / Unblock */}
                                                        {!u.isAdmin && (
                                                            u.isBlocked ? (
                                                                <button title="Unblock" onClick={() => handleUnblock(u.id)} disabled={actionLoading === `unblock-${u.id}`} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <UserCheck size={14} />
                                                                </button>
                                                            ) : (
                                                                <button title="Block" onClick={() => { setBlockTargetId(u.id); setBlockReason(''); setShowBlockModal(true); }} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <UserX size={14} />
                                                                </button>
                                                            )
                                                        )}
                                                        {/* Delete */}
                                                        {!u.isAdmin && (
                                                            <button title="Delete" onClick={() => handleDeleteUser(u.id, u.name)} disabled={actionLoading === `delete-${u.id}`} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
                                <button disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer', opacity: pagination.page <= 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                    <ChevronLeft size={16} /> Prev
                                </button>
                                <span style={{ fontSize: 14, fontWeight: 700, padding: '8px 16px', background: 'rgba(99,102,241,0.15)', borderRadius: 10, color: '#818cf8' }}>
                                    {pagination.page} / {pagination.pages}
                                </span>
                                <button disabled={pagination.page >= pagination.pages} onClick={() => fetchUsers(pagination.page + 1)} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer', opacity: pagination.page >= pagination.pages ? 0.3 : 1, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ═══════════ BLOCK REASON MODAL ═══════════ */}
            {showBlockModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, padding: 32, width: '90%', maxWidth: 440 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Ban size={20} style={{ color: '#ef4444' }} /> Block User
                            </h3>
                            <button onClick={() => setShowBlockModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 16 }}>Provide a reason for blocking this user (optional):</p>
                        <textarea
                            value={blockReason}
                            onChange={e => setBlockReason(e.target.value)}
                            rows={3}
                            placeholder="e.g., Spam, Abusive behavior, Violation of terms..."
                            style={{ width: '100%', padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', fontSize: 14, resize: 'none', outline: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            <button onClick={() => setShowBlockModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', borderRadius: 12, color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                                Cancel
                            </button>
                            <button onClick={handleBlock} disabled={actionLoading === 'block'} style={{ flex: 1, padding: '12px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: 12, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                                {actionLoading === 'block' ? 'Blocking...' : '🚫 Block User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ USER DETAIL MODAL ═══════════ */}
            {showUserModal && selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overflow: 'auto', padding: 20 }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, padding: 32, width: '90%', maxWidth: 600, maxHeight: '85vh', overflowY: 'auto' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <img
                                    src={getAvatarUrl(selectedUser.avatar)}
                                    alt={selectedUser.name}
                                    style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(139,92,246,0.5)' }}
                                    onError={handleAvatarError}
                                />
                                <div>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {selectedUser.name}
                                        {selectedUser.isAdmin && <Crown size={18} style={{ color: '#f59e0b' }} />}
                                    </h3>
                                    <p style={{ fontSize: 13, opacity: 0.6 }}>{selectedUser.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}>
                                <X size={22} />
                            </button>
                        </div>

                        {/* User Info Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                            {[
                                { label: 'Role', value: selectedUser.role, icon: '🎓' },
                                { label: 'Status', value: selectedUser.isBlocked ? '🚫 Blocked' : selectedUser.isVerified !== false ? '✅ Active' : '⚠️ Unverified' },
                                { label: 'University', value: selectedUser.university || '—' },
                                { label: 'Course', value: selectedUser.course || '—' },
                                { label: 'Login Provider', value: providerBadge(selectedUser.loginProvider) },
                                { label: 'Reputation', value: selectedUser.reputation || 0 },
                                { label: 'Connections', value: selectedUser.connections || 0 },
                                { label: 'XP', value: selectedUser.stats?.xp || 0 },
                                { label: 'Level', value: selectedUser.stats?.level || 1 },
                                { label: 'Streak', value: `🔥 ${selectedUser.stats?.streak || 0} days` },
                                { label: 'Last Login', value: formatDate(selectedUser.lastLogin) },
                                { label: 'Joined', value: formatDate(selectedUser.joinedAt) }
                            ].map((item, i) => (
                                <div key={i} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 12, padding: '10px 14px' }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.5, marginBottom: 2 }}>{item.label}</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Block reason */}
                        {selectedUser.isBlocked && selectedUser.blockReason && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 14, marginBottom: 20 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>Block Reason</div>
                                <div style={{ fontSize: 14 }}>{selectedUser.blockReason}</div>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {/* Role Change */}
                            {!selectedUser.isAdmin && (
                                <select
                                    value={selectedUser.role}
                                    onChange={e => { handleChangeRole(selectedUser.id, e.target.value); setSelectedUser({ ...selectedUser, role: e.target.value }); }}
                                    style={{ padding: '8px 14px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, color: '#818cf8', fontWeight: 600, fontSize: 13 }}
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="recruiter">Recruiter</option>
                                </select>
                            )}

                            {/* Admin Toggle */}
                            {!selectedUser.isAdmin ? (
                                <button onClick={() => handleToggleAdmin(selectedUser.id, true)} style={{ padding: '8px 16px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, color: '#f59e0b', fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ShieldCheck size={14} /> Make Admin
                                </button>
                            ) : selectedUser.id !== user?.id && (
                                <button onClick={() => handleToggleAdmin(selectedUser.id, false)} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ShieldOff size={14} /> Remove Admin
                                </button>
                            )}

                            {/* Block/Unblock */}
                            {!selectedUser.isAdmin && (
                                selectedUser.isBlocked ? (
                                    <button onClick={() => { handleUnblock(selectedUser.id); setSelectedUser({ ...selectedUser, isBlocked: false }); }} style={{ padding: '8px 16px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <UserCheck size={14} /> Unblock
                                    </button>
                                ) : (
                                    <button onClick={() => { setBlockTargetId(selectedUser.id); setBlockReason(''); setShowBlockModal(true); }} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <UserX size={14} /> Block
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
