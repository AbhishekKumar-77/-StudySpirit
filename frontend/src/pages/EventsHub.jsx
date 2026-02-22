import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as soloApi from '../services/soloApi';
import {
    Calendar, MapPin, Users, Globe, ExternalLink, Bell,
    Search, Filter, Clock, CheckCircle, ChevronLeft
} from 'lucide-react';

export default function EventsHub() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [monitoredEvents, setMonitoredEvents] = useState(new Set());

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await soloApi.getEvents();
            if (data.success) {
                setEvents(data.events);
                // Also fetch monitored status
                const monitoredData = await soloApi.getMonitoredEvents();
                if (monitoredData.success) {
                    const ids = new Set(monitoredData.events.map(e => e._id));
                    setMonitoredEvents(ids);
                }
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonitorToggle = async (eventId) => {
        try {
            const data = await soloApi.toggleEventMonitor(eventId);
            if (data.success) {
                setMonitoredEvents(prev => {
                    const newSet = new Set(prev);
                    if (data.isMonitoring) newSet.add(eventId);
                    else newSet.delete(eventId);
                    return newSet;
                });
            }
        } catch (error) {
            console.error('Failed to toggle monitor:', error);
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesFilter = filter === 'All' || event.type === filter;
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.platform.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const categories = ['All', 'Hackathon', 'Webinar', 'Contest', 'Conference', 'Workshop'];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans p-8 pb-20">
            {/* Header */}
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-fade-in-up">
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-[var(--text-primary)] transition-colors mb-4 group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 bg-clip-text text-transparent mb-2 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                        global_events_hub
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Discover & track hackathons, contests, and tech talks worldwide. 🌍
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1e1e2d] border border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-primary)] focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-slate-500"
                        />
                    </div>
                </div>
            </header>

            {/* Categories */}
            <div className="max-w-7xl mx-auto mb-10 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-3">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${filter === cat
                                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-[var(--text-primary)] border-transparent shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                                    : 'bg-[#1e1e2d] text-slate-400 border-[var(--border-color)] hover:border-white/20 hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // Skeletons
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-[#1e1e2d] h-[350px] rounded-2xl animate-pulse" />
                    ))
                ) : filteredEvents.length > 0 ? (
                    filteredEvents.map((event, idx) => (
                        <EventCard
                            key={event._id}
                            event={event}
                            isMonitored={monitoredEvents.has(event._id)}
                            onMonitor={() => handleMonitorToggle(event._id)}
                            index={idx}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 text-slate-500">
                        <Globe className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-xl font-medium">No events found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function EventCard({ event, isMonitored, onMonitor, index }) {
    const isUpcoming = new Date(event.date) > new Date();
    const dateStr = new Date(event.date).toLocaleDateString(undefined, {
        weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
    });

    // Determine color based on platform/type
    let colorClass = 'from-blue-500 to-cyan-500';
    if (event.platform === 'Unstop') colorClass = 'from-blue-600 to-indigo-600';
    if (event.platform === 'LinkedIn') colorClass = 'from-blue-500 to-sky-500';
    if (event.type === 'Hackathon') colorClass = 'from-purple-500 to-pink-500';
    if (event.type === 'Contest') colorClass = 'from-emerald-500 to-teal-500';

    return (
        <div
            className="group bg-[#161622] border border-[var(--border-color)] rounded-2xl overflow-hidden hover:border-[var(--border-color)] hover:-translate-y-2 transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col h-full animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            {/* Image Banner */}
            <div className="relative h-48 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-t from-[#161622] via-transparent to-transparent z-10`} />
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${colorClass}`} />
                )}

                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <span className="bg-[var(--bg-secondary)]lack/60 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full text-[var(--text-primary)] border border-[var(--border-color)] flex items-center gap-1">
                        {event.platform}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full text-[var(--text-primary)] flex items-center gap-1 shadow-lg bg-gradient-to-r ${colorClass}`}>
                        {event.type}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {event.title}
                </h3>

                <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                    {event.description}
                </p>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-rose-400" />
                            <span>{dateStr}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                        <button
                            onClick={onMonitor}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${isMonitored
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-[#1e1e2d] text-slate-300 hover:bg-[#252536] border border-[var(--border-color)]'
                                }`}
                        >
                            {isMonitored ? <><CheckCircle className="w-4 h-4" /> Monitoring</> : <><Bell className="w-4 h-4" /> Monitor</>}
                        </button>

                        <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold bg-white text-black hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            Participate <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
