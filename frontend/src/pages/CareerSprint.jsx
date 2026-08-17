import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePageTracker } from '../hooks/usePageTracker';
import { API_BASE } from '../config';
import {
    Briefcase, Sparkles, ArrowRight, Clock, Star, Flame, CheckCircle2,
    Building, MapPin, DollarSign, Layers, Zap, UserCheck, Rocket, ChevronRight
} from 'lucide-react';

// Modular Light-Theme Components
import CareerSidebar from '../components/career/CareerSidebar';
import CareerHeader from '../components/career/CareerHeader';
import CareerReadinessWidget from '../components/career/CareerReadinessWidget';
import OpportunityCard from '../components/career/OpportunityCard';
import ApplicationTrackerKanban from '../components/career/ApplicationTrackerKanban';
import SkillPassportSnapshot from '../components/career/SkillPassportSnapshot';
import CareerToolsGrid from '../components/career/CareerToolsGrid';
import CareerRoadmapView from '../components/career/CareerRoadmapView';
import OpportunityDetailModal from '../components/career/OpportunityDetailModal';

export default function CareerSprint() {
    const { user } = useApp();
    const navigate = useNavigate();
    usePageTracker('CareerSprint', '/careersprint', '🚀');

    // Main Active Navigation View: 'overview', 'recommended', 'jobs', 'internships', 'hackathons', 'competitions', 'scholarships', 'campus', 'app-tracker', 'passport', 'my-skills', 'roadmap', 'resume-builder', 'resume-analyzer', 'cover-letter', 'interview-prep', 'salary-insights'
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);

    // Dynamic Readiness State
    const [readinessData, setReadinessData] = useState({
        overall: 72,
        skills: 82,
        projects: 76,
        resume: 68,
        communication: 71,
        interview: 64,
        coding: 81
    });

    // Fetch Opportunities
    useEffect(() => {
        const fetchListings = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_BASE}/career`);
                const data = await res.json();
                if (data && data.success) {
                    setListings(data.data || []);
                }
            } catch (err) {
                console.error('Failed fetching career listings:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListings();
    }, []);

    // Filter Logic
    const filteredListings = useMemo(() => {
        return listings.filter((item) => {
            if (activeTab === 'jobs' && item.type !== 'job') return false;
            if (activeTab === 'internships' && item.type !== 'internship') return false;
            if (activeTab === 'hackathons' && item.type !== 'hackathon') return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const titleMatch = (item.title || '').toLowerCase().includes(q);
                const companyMatch = (item.company || '').toLowerCase().includes(q);
                const locMatch = (item.location || '').toLowerCase().includes(q);
                const tagMatch = (item.tags || []).some(t => t.toLowerCase().includes(q));
                if (!titleMatch && !companyMatch && !locMatch && !tagMatch) return false;
            }

            return true;
        });
    }, [listings, activeTab, searchQuery]);

    // Handle Application Trigger
    const handleApplyOpportunity = (opp) => {
        alert(`Application initiated for ${opp.title} at ${opp.company}! Skill Passport attached.`);
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
            {/* Left Sidebar Navigation */}
            <CareerSidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    if (itemIsRoute(tab)) {
                        handleRouteSwitch(tab, navigate);
                    } else {
                        setActiveTab(tab);
                    }
                }}
            />

            {/* Main Stage Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Top Header */}
                <CareerHeader
                    user={user}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* Sub-View Stage Container */}
                <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
                    {/* Top Greeting */}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            Good morning, {user?.name ? user.name.split(' ')[0] : 'Abhishek'}! 👋
                        </h1>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            Let's take the next step in your career journey.
                        </p>
                    </div>

                    {/* Top 4 Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div
                            onClick={() => setActiveTab('passport')}
                            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition cursor-pointer flex items-center justify-between"
                        >
                            <div>
                                <span className="text-xs font-extrabold text-slate-500">Career Readiness</span>
                                <div className="text-2xl font-black text-slate-900 mt-1">72%</div>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mt-1 inline-block">
                                    Good Progress
                                </span>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                                <Zap className="w-5 h-5" />
                            </div>
                        </div>

                        <div
                            onClick={() => setActiveTab('app-applied')}
                            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition cursor-pointer flex items-center justify-between"
                        >
                            <div>
                                <span className="text-xs font-extrabold text-slate-500">Applications</span>
                                <div className="text-2xl font-black text-slate-900 mt-1">41</div>
                                <span className="text-[10px] font-bold text-cyan-600 flex items-center gap-1 mt-1">
                                    Total Applied <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center font-bold">
                                <Briefcase className="w-5 h-5" />
                            </div>
                        </div>

                        <div
                            onClick={() => setActiveTab('app-interview')}
                            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition cursor-pointer flex items-center justify-between"
                        >
                            <div>
                                <span className="text-xs font-extrabold text-slate-500">Interviews</span>
                                <div className="text-2xl font-black text-slate-900 mt-1">12</div>
                                <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1 mt-1">
                                    Upcoming <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
                                <UserCheck className="w-5 h-5" />
                            </div>
                        </div>

                        <div
                            onClick={() => setActiveTab('passport')}
                            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition cursor-pointer flex items-center justify-between"
                        >
                            <div>
                                <span className="text-xs font-extrabold text-slate-500">Profile Strength</span>
                                <div className="text-2xl font-black text-slate-900 mt-1">86%</div>
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 mt-1 inline-block">
                                    Strong Profile
                                </span>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
                                <Star className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* MAIN VIEW: OVERVIEW / DASHBOARD */}
                    {(activeTab === 'overview' || activeTab === 'recommended') && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Main Column (65%) */}
                            <div className="lg:col-span-8 space-y-8">
                                {/* Recommended for You Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Recommended for You</h2>
                                            <p className="text-xs font-semibold text-slate-500">Opportunities matching your verified StudySpirit skills</p>
                                        </div>

                                        <button
                                            onClick={() => setActiveTab('jobs')}
                                            className="text-xs font-extrabold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                                        >
                                            <span>View All</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(filteredListings.length > 0 ? filteredListings : defaultCuratedOpps).slice(0, 4).map((opp) => (
                                            <OpportunityCard
                                                key={opp.id}
                                                opportunity={opp}
                                                onOpenDetail={(o) => setSelectedOpportunity(o)}
                                                onApply={handleApplyOpportunity}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Application Tracker Snapshot / Full Pipeline */}
                                <ApplicationTrackerKanban />

                                {/* Skill Passport Snapshot */}
                                <SkillPassportSnapshot onViewPassport={() => setActiveTab('passport')} />

                                {/* Career Tools Section */}
                                <CareerToolsGrid onSelectTool={(tId) => handleToolClick(tId, navigate, setActiveTab)} />
                            </div>

                            {/* Right Sidebar Column (35%) */}
                            <div className="lg:col-span-4 space-y-8">
                                {/* Career Readiness Gauge Card */}
                                <CareerReadinessWidget
                                    readinessData={readinessData}
                                    onSeeRecommendations={() => setActiveTab('recommended')}
                                />

                                {/* Top Skills In Demand Card */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-extrabold text-slate-900">Top Skills In Demand</h3>
                                        <span className="text-xs font-extrabold text-purple-600">View All</span>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { title: 'Full Stack Development', demand: 'High Demand', color: 'bg-cyan-50 text-cyan-700' },
                                            { title: 'Cloud Computing (AWS/Azure)', demand: 'Very High', color: 'bg-purple-50 text-purple-700' },
                                            { title: 'AI / Machine Learning', demand: 'High Demand', color: 'bg-emerald-50 text-emerald-700' },
                                            { title: 'DevOps & Docker', demand: 'High Demand', color: 'bg-blue-50 text-blue-700' }
                                        ].map((sk) => (
                                            <div key={sk.title} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-800">
                                                <span>{sk.title}</span>
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${sk.color}`}>
                                                    {sk.demand}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Upcoming Deadlines Card */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-extrabold text-slate-900">Upcoming Deadlines</h3>
                                        <span className="text-xs font-extrabold text-cyan-600">View All</span>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { title: 'Google Backend Intern', sub: 'Apply by 25 Aug 2025', days: '5 days left', color: 'text-rose-600 bg-rose-50' },
                                            { title: 'Microsoft SWE Intern', sub: 'Apply by 28 Aug 2025', days: '8 days left', color: 'text-amber-600 bg-amber-50' },
                                            { title: 'Adobe Internship Program', sub: 'Apply by 01 Sep 2025', days: '12 days left', color: 'text-purple-600 bg-purple-50' }
                                        ].map((d, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-2xl">
                                                <div>
                                                    <h4 className="text-xs font-extrabold text-slate-900">{d.title}</h4>
                                                    <p className="text-[10px] font-semibold text-slate-400">{d.sub}</p>
                                                </div>
                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${d.color}`}>
                                                    {d.days}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUB-VIEW: APPLICATION TRACKER */}
                    {activeTab.startsWith('app-') && (
                        <ApplicationTrackerKanban />
                    )}

                    {/* SUB-VIEW: SKILL PASSPORT */}
                    {(activeTab === 'passport' || activeTab === 'my-skills') && (
                        <SkillPassportSnapshot onViewPassport={() => {}} />
                    )}

                    {/* SUB-VIEW: ROADMAP */}
                    {activeTab === 'roadmap' && (
                        <CareerRoadmapView />
                    )}

                    {/* SUB-VIEW: OPPORTUNITIES BROWSER */}
                    {['jobs', 'internships', 'hackathons', 'competitions', 'scholarships', 'campus'].includes(activeTab) && (
                        <div className="space-y-6">
                            <div className="mb-4">
                                <h2 className="text-xl font-black text-slate-900 capitalize">{activeTab} Opportunities</h2>
                                <p className="text-xs font-semibold text-slate-500">Explore active verified career listings</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(filteredListings.length > 0 ? filteredListings : defaultCuratedOpps).map((opp) => (
                                    <OpportunityCard
                                        key={opp.id}
                                        opportunity={opp}
                                        onOpenDetail={(o) => setSelectedOpportunity(o)}
                                        onApply={handleApplyOpportunity}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Career Action Plan Banner (Bottom) */}
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-extrabold text-emerald-950">Tip for you, {user?.name ? user.name.split(' ')[0] : 'Abhishek'}</h4>
                                <p className="text-xs font-semibold text-emerald-800">
                                    Complete 2 more projects and improve your communication score to get 15% better job matches.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/resources')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md shadow-emerald-600/20 transition shrink-0 flex items-center gap-2"
                        >
                            <span>View My Action Plan</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Opportunity Detail Modal */}
            {selectedOpportunity && (
                <OpportunityDetailModal
                    opportunity={selectedOpportunity}
                    onClose={() => setSelectedOpportunity(null)}
                    onApply={handleApplyOpportunity}
                />
            )}
        </div>
    );
}

// Helpers
function itemIsRoute(tab) {
    return ['interview-prep', 'resume-builder'].includes(tab);
}

function handleRouteSwitch(tab, navigate) {
    if (tab === 'interview-prep') navigate('/interview-prep');
    if (tab === 'resume-builder') navigate('/planner');
}

function handleToolClick(tId, navigate, setActiveTab) {
    if (tId === 'interview-prep') navigate('/interview-prep');
    else if (tId === 'resume-builder') navigate('/planner');
    else if (tId === 'roadmap') setActiveTab('roadmap');
    else setActiveTab('passport');
}

const defaultCuratedOpps = [
    {
        id: 'c1',
        title: 'Backend Developer Intern',
        company: 'Google Cloud',
        location: 'Bangalore, India',
        workMode: 'Hybrid',
        salary: '₹35K–₹50K / month',
        matchScore: 91,
        skills: ['Node.js', 'MongoDB', 'REST API', 'Git'],
        posted: 'Posted 2 days ago',
        logo: 'https://logo.clearbit.com/google.com',
        source: 'Company Careers'
    },
    {
        id: 'c2',
        title: 'Software Engineer Intern',
        company: 'Microsoft',
        location: 'Hyderabad, India',
        workMode: 'On-site',
        salary: '₹50K–₹70K / month',
        matchScore: 87,
        skills: ['C++', 'System Design', 'OOP', 'Azure'],
        posted: 'Posted 5 days ago',
        logo: 'https://logo.clearbit.com/microsoft.com',
        source: 'Microsoft Careers'
    },
    {
        id: 'c3',
        title: 'Full Stack Developer Intern',
        company: 'Zoho Corporation',
        location: 'Chennai, India',
        workMode: 'Remote',
        salary: '₹25K–₹35K / month',
        matchScore: 82,
        skills: ['React', 'Node.js', 'MySQL', 'Express'],
        posted: 'Posted 1 day ago',
        logo: 'https://logo.clearbit.com/zoho.com',
        source: 'Unstop'
    }
];
