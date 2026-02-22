import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Briefcase, MapPin, DollarSign, ExternalLink,
    Search, Star, Clock, Zap, RefreshCw, Building2,
    Code2, Trophy, Laptop, Globe, BookOpen, TrendingUp
} from 'lucide-react';
import { API_BASE } from '../config';

const STORAGE_KEY = 'careersprint_bookmarks';
function loadJSON(key, fallback) {
    try { return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : fallback; }
    catch { return fallback; }
}
function saveJSON(key, obj) { localStorage.setItem(key, JSON.stringify(obj)); }

const TYPE_CONFIG = {
    job: { label: 'Full-time Job', color: 'from-blue-500 to-cyan-500', bg: 'bg-[var(--bg-secondary)]lue-500/15 text-blue-400 border-blue-500/30', icon: Briefcase },
    internship: { label: 'Internship', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: BookOpen },
    hackathon: { label: 'Hackathon', color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: Trophy },
};

export default function CareerSprint() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [bookmarks, setBookmarks] = useState(() => loadJSON(STORAGE_KEY, []));
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sources, setSources] = useState([]);
    const [error, setError] = useState(null);

    const fetchData = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        try {
            const url = forceRefresh
                ? `${API_BASE}/career?forceRefresh=true`
                : `${API_BASE}/career`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setListings(data.data || []);
                setSources(data.sources || []);
            } else {
                setError('Failed to load listings.');
            }
        } catch (err) {
            console.error('Failed to fetch jobs:', err);
            setError('Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { saveJSON(STORAGE_KEY, bookmarks); }, [bookmarks]);

    const toggleBookmark = (id) => {
        setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
    };

    const filteredListings = useMemo(() => {
        return listings.filter(item => {
            if (activeTab === 'bookmarks') return bookmarks.includes(item.id);
            if (activeTab !== 'all' && item.type !== activeTab) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (
                    (item.title || '').toLowerCase().includes(q) ||
                    (item.company || '').toLowerCase().includes(q) ||
                    (item.location || '').toLowerCase().includes(q) ||
                    (item.tags || []).some(t => t.toLowerCase().includes(q))
                );
            }
            return true;
        });
    }, [listings, activeTab, searchQuery, bookmarks]);

    const tabs = [
        { id: 'all', label: 'All', icon: Globe, count: listings.length },
        { id: 'job', label: 'Jobs', icon: Briefcase, count: listings.filter(l => l.type === 'job').length },
        { id: 'internship', label: 'Internships', icon: BookOpen, count: listings.filter(l => l.type === 'internship').length },
        { id: 'hackathon', label: 'Hackathons', icon: Trophy, count: listings.filter(l => l.type === 'hackathon').length },
        { id: 'bookmarks', label: 'Saved', icon: Star, count: bookmarks.length },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-16 font-sans text-[var(--text-primary)] relative overflow-x-hidden">
            {/* BG blobs */}
            <div className="absolute top-[5%] left-[5%] w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[5%] right-[5%] w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-[120px] pointer-events-none" />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-cyan-500/10 px-6 py-4">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-2.5 rounded-xl text-cyan-300 font-semibold transition-all text-sm">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="text-lg font-bold flex items-center gap-2">
                        <Briefcase className="text-cyan-400" size={20} /> CareerSprint
                    </div>
                    <button
                        onClick={() => fetchData(true)}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${loading ? 'bg-[var(--border-color)] cursor-wait text-[var(--text-secondary)]' : 'bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-primary)]'}`}
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin text-cyan-400' : 'text-cyan-400'} />
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-6 py-8">

                {/* Hero */}
                <div className="relative bg-gradient-to-br from-cyan-500/15 to-teal-500/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-cyan-500/20 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="bg-gradient-to-br from-cyan-500 to-teal-600 p-5 rounded-2xl shadow-lg shadow-cyan-500/30 flex-shrink-0">
                            <RocketIcon size={44} className="text-[var(--text-primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-cyan-400 font-bold tracking-widest uppercase mb-1">Real Opportunities · Updated Live</div>
                            <h1 className="text-3xl font-black mb-1">CareerSprint Hub</h1>
                            <p className="text-[var(--text-secondary)]">Jobs, internships & hackathons from top Indian tech companies + global remote roles.</p>
                        </div>
                        {/* Stats */}
                        <div className="flex gap-4 flex-wrap">
                            {[
                                { label: 'Total', value: listings.length, icon: TrendingUp, color: 'text-cyan-400' },
                                { label: 'Jobs', value: listings.filter(l => l.type === 'job').length, icon: Briefcase, color: 'text-blue-400' },
                                { label: 'Internships', value: listings.filter(l => l.type === 'internship').length, icon: BookOpen, color: 'text-purple-400' },
                            ].map(stat => (
                                <div key={stat.label} className="bg-[var(--glass-bg)] rounded-2xl px-5 py-3 text-center border border-[var(--border-color)]">
                                    <stat.icon size={18} className={`${stat.color} mx-auto mb-1`} />
                                    <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                                    <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Source badges */}
                    {sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
                            <span className="text-xs text-[var(--text-muted)] self-center">Sources:</span>
                            {sources.map(s => (
                                <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]">{s}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-center bg-[var(--glass-bg)] backdrop-blur-xl p-3 rounded-2xl border border-[var(--border-color)]">
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto flex-shrink-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-[var(--text-primary)] shadow-lg shadow-cyan-500/20'
                                    : 'bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                                    }`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? 'bg-white/20' : 'bg-[var(--border-color)]'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-3 text-[var(--text-muted)]" size={16} />
                        <input
                            type="text"
                            placeholder="Search by title, company, skills..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-cyan-500/50 focus:outline-none transition-all placeholder:text-[var(--text-primary)] text-sm"
                        />
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-[var(--glass-bg)] rounded-2xl p-6 border border-[var(--border-color)] animate-pulse">
                                <div className="flex gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--border-color)]" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-[var(--border-color)] rounded mb-2 w-3/4" />
                                        <div className="h-3 bg-[var(--border-color)] rounded w-1/2" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-[var(--border-color)] rounded w-full" />
                                    <div className="h-3 bg-[var(--border-color)] rounded w-4/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p className="text-[var(--text-secondary)] mb-4">{error}</p>
                        <button onClick={() => fetchData()} className="px-6 py-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all font-semibold">
                            Try Again
                        </button>
                    </div>
                )}

                {/* Job Cards */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredListings.length > 0 ? filteredListings.map(item => {
                            const typeConf = TYPE_CONFIG[item.type] || TYPE_CONFIG.job;
                            const TypeIcon = typeConf.icon;
                            const isBookmarked = bookmarks.includes(item.id);

                            return (
                                <div
                                    key={item.id}
                                    className="group relative bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-5 border border-[var(--border-color)] hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 flex flex-col"
                                >
                                    {/* Top gradient line on hover */}
                                    <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${typeConf.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Company Logo */}
                                            <div className="w-12 h-12 rounded-xl bg-[var(--border-color)]/80 border border-[var(--border-color)] flex items-center justify-center overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.logo}
                                                    alt={item.company}
                                                    className="w-10 h-10 object-contain"
                                                    onError={e => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="hidden w-full h-full items-center justify-center text-lg font-black text-[var(--text-secondary)]">
                                                    {(item.company || '?')[0].toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-base leading-tight group-hover:text-cyan-400 transition-colors truncate">{item.title}</h3>
                                                <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 truncate">
                                                    <Building2 size={12} className="flex-shrink-0" /> {item.company}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Bookmark */}
                                        <button
                                            onClick={() => toggleBookmark(item.id)}
                                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[var(--border-color)] transition-all"
                                        >
                                            <Star size={18} fill={isBookmarked ? 'currentColor' : 'none'} className={isBookmarked ? 'text-yellow-400' : 'text-[var(--text-muted)]'} />
                                        </button>
                                    </div>

                                    {/* Type Badge */}
                                    <div className="mb-3">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${typeConf.bg}`}>
                                            <TypeIcon size={11} /> {typeConf.label}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-1.5 mb-4 text-sm text-[var(--text-secondary)]">
                                        {item.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin size={13} className="text-cyan-500 flex-shrink-0" />
                                                <span className="truncate">{item.location}</span>
                                                {item.isRemote && <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md flex-shrink-0">Remote</span>}
                                            </div>
                                        )}
                                        {(item.salary && item.salary !== 'Not Disclosed') && (
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={13} className="text-emerald-500 flex-shrink-0" />
                                                <span className="text-emerald-400 font-semibold">{item.salary}</span>
                                            </div>
                                        )}
                                        {item.posted && (
                                            <div className="flex items-center gap-2">
                                                <Clock size={13} className="text-orange-400 flex-shrink-0" />
                                                <span>{item.posted}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {item.description && (
                                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
                                    )}

                                    {/* Tags */}
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {item.tags.slice(0, 4).map(tag => (
                                                <span key={tag} className="text-xs px-2 py-0.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                                                    {tag}
                                                </span>
                                            ))}
                                            {item.tags.length > 4 && (
                                                <span className="text-xs px-2 py-0.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)]">
                                                    +{item.tags.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-color)]">
                                        <span className="text-xs text-[var(--text-primary)] bg-[var(--glass-bg)] px-2 py-1 rounded-lg">via {item.source}</span>
                                        <button
                                            onClick={() => window.open(item.link, '_blank', 'noopener')}
                                            className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-r ${typeConf.color} text-[var(--text-primary)] hover:opacity-90 transition-all shadow-lg`}
                                        >
                                            Apply <ExternalLink size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full py-20 text-center">
                                <Search size={48} className="mx-auto mb-4 text-[var(--text-primary)]" />
                                <p className="text-[var(--text-secondary)] text-lg mb-2">No results found</p>
                                <p className="text-[var(--text-primary)] text-sm mb-6">Try a different search or filter</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                                    className="px-6 py-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all font-semibold"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function RocketIcon({ size = 24, className = '' }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-rocket ${className}`}>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    );
}
