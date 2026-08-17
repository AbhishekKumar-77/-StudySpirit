import React, { useState, useEffect } from 'react';
import {
    Search, Filter, ShieldCheck, Github, ExternalLink, Globe,
    Building2, UserCheck, Sparkles, CheckCircle2, Bookmark, ArrowUpRight
} from 'lucide-react';
import projectApi from '../../services/projectApi';
import { useNavigate } from 'react-router-dom';

export default function ExplorePanel({ isRecruiter = false }) {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [domainFilter, setDomainFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [hasGithub, setHasGithub] = useState(false);
    const [hasDemo, setHasDemo] = useState(false);

    useEffect(() => {
        handleSearch();
    }, [domainFilter, typeFilter, hasGithub, hasDemo]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await projectApi.searchProjects({
                q: searchQuery,
                domain: domainFilter !== 'all' ? domainFilter : undefined,
                projectType: typeFilter !== 'all' ? typeFilter : undefined,
                hasGithub: hasGithub ? 'true' : undefined,
                hasDemo: hasDemo ? 'true' : undefined
            });
            setProjects(res.projects || []);
        } catch (e) {
            console.error('Explore search error:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Search & Filter Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                            Discover Student Projects
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Search projects as verifiable evidence of student technical skills & engineering depth.
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search by keywords, technologies (e.g. React MongoDB Node.js AI)..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm"
                    >
                        Search
                    </button>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                    <select
                        value={domainFilter}
                        onChange={(e) => setDomainFilter(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none"
                    >
                        <option value="all">All Domains</option>
                        <option value="AI / ML">AI / ML</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Cloud">Cloud</option>
                        <option value="Blockchain">Blockchain</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none"
                    >
                        <option value="all">All Project Types</option>
                        <option value="Personal">Personal</option>
                        <option value="Academic">Academic</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Capstone">Capstone</option>
                    </select>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                            type="checkbox"
                            checked={hasGithub}
                            onChange={(e) => setHasGithub(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        GitHub Repository
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                            type="checkbox"
                            checked={hasDemo}
                            onChange={(e) => setHasDemo(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        Live Demo
                    </label>
                </div>
            </div>

            {/* Recruiter Projects Grid */}
            {loading ? (
                <div className="p-12 text-center text-xs text-slate-400">Loading student projects...</div>
            ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(project => {
                        const ownerName = project.owner?.name || 'Student';
                        const score = project.strengthScore || 85;

                        return (
                            <div
                                key={project._id}
                                onClick={() => navigate(`/project-lab/${project._id}`)}
                                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                                                {project.name}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                                {project.description || 'No description'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tech Pills */}
                                    <div className="flex flex-wrap gap-1 my-3">
                                        {(project.techStack || []).slice(0, 3).map((t, idx) => (
                                            <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]">
                                            {ownerName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-[11px]">{ownerName}</div>
                                            <div className="text-[9px] text-slate-400">Score: {score}/100</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/project-lab/${project._id}`); }}
                                        className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold text-[11px] rounded-lg hover:bg-emerald-100"
                                    >
                                        View Evidence
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
                    No public student projects found matching criteria.
                </div>
            )}
        </div>
    );
}
