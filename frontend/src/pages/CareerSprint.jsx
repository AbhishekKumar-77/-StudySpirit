import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePageTracker } from '../hooks/usePageTracker';
import { API_BASE } from '../config';
import {
    Briefcase, Sparkles, ArrowRight, Clock, Star, Flame, CheckCircle2,
    Building, MapPin, DollarSign, Layers, Zap, UserCheck, Bookmark, ChevronRight
} from 'lucide-react';

// Modular Light-Theme Components
import CareerSidebar from '../components/career/CareerSidebar';
import CareerHeader from '../components/career/CareerHeader';
import CareerReadinessWidget from '../components/career/CareerReadinessWidget';
import OpportunityCard from '../components/career/OpportunityCard';
import ApplicationTrackerKanban from '../components/career/ApplicationTrackerKanban';
import CareerResumeView from '../components/career/CareerResumeView';
import OpportunityDetailModal from '../components/career/OpportunityDetailModal';

export default function CareerSprint() {
    const { user } = useApp();
    const navigate = useNavigate();
    usePageTracker('CareerSprint', '/careersprint', '🚀');

    // Main Active Navigation View: 'dashboard', 'saved-opps', 'deadlines', 'jobs', 'internships', 'hackathons', 'competitions', 'campus', 'resume', 'app-*'
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [listings, setListings] = useState([]);
    const [applications, setApplications] = useState([]);
    const [resumeData, setResumeData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    // Dynamic Readiness State
    const [readinessData, setReadinessData] = useState({
        overall: 84,
        skills: 82,
        projects: 85,
        communication: 78,
        interview: 80,
        coding: 88
    });

    // Fetch Opportunities, Applications & Real Resume Data
    useEffect(() => {
        const fetchCareerData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Job Listings
                const resListings = await fetch(`${API_BASE}/career`);
                const dataListings = await resListings.json();
                if (dataListings && dataListings.success) {
                    setListings(dataListings.data || []);
                }

                // 2. Fetch Real Resume & Readiness Metrics
                const resResume = await fetch(`${API_BASE}/career/resume-data`, {
                    credentials: 'include'
                });
                const dataResume = await resResume.json();
                if (dataResume && dataResume.success) {
                    setResumeData(dataResume);
                    if (dataResume.readiness) {
                        setReadinessData(dataResume.readiness);
                    }
                }

                // 3. Fetch Real Applications Tracker Data
                const resApps = await fetch(`${API_BASE}/career/applications`, {
                    credentials: 'include'
                });
                const dataApps = await resApps.json();
                if (dataApps && dataApps.success) {
                    setApplications(dataApps.applications || []);
                }
            } catch (err) {
                console.error('Failed fetching career data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCareerData();
    }, []);

    // Filter Logic
    const filteredListings = useMemo(() => {
        return listings.filter((item) => {
            if (activeTab === 'jobs' && item.type !== 'job') return false;
            if (activeTab === 'internships' && item.type !== 'internship') return false;
            if (activeTab === 'hackathons' && item.type !== 'hackathon') return false;
            if (activeTab === 'competitions' && item.type !== 'competition' && item.type !== 'hackathon') return false;

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

    // Application Counts for Sidebar Badges
    const applicationCounts = useMemo(() => {
        const counts = {
            saved: 0,
            preparing: 0,
            applied: 0,
            assessment: 0,
            interview: 0,
            offer: 0,
            rejected: 0,
            withdrawn: 0
        };
        applications.forEach(app => {
            const st = (app.stage || 'applied').toLowerCase();
            if (counts[st] !== undefined) counts[st]++;
        });
        return counts;
    }, [applications]);

    // Handle Application Trigger
    const handleApplyOpportunity = async (opp) => {
        try {
            // Save application in backend
            const res = await fetch(`${API_BASE}/career/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ opportunity: opp, stage: 'applied' })
            });
            const data = await res.json();
            if (data && data.success) {
                setApplications(prev => [data.application, ...prev.filter(a => a.id !== opp.id)]);
            }
        } catch (e) {
            console.error('Error saving application:', e);
        }

        // Show toast
        setToastMessage(`Application submitted for ${opp.title} at ${opp.company}!`);
        setTimeout(() => setToastMessage(null), 4000);

        // If external link exists, open it in new tab
        if (opp.link && opp.link.startsWith('http')) {
            window.open(opp.link, '_blank');
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
            {/* Left Sidebar Navigation */}
            <CareerSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                applicationCounts={applicationCounts}
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
                    {/* Toast Alert */}
                    {toastMessage && (
                        <div className="bg-emerald-600 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{toastMessage}</span>
                            </div>
                            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white text-xs ml-4">✕</button>
                        </div>
                    )}

                    {/* Top 4 Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div
                            onClick={() => setActiveTab('resume')}
                            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition cursor-pointer flex items-center justify-between"
                        >
                            <div>
                                <span className="text-xs font-extrabold text-slate-500">Career Readiness</span>
                                <div className="text-2xl font-black text-slate-900 mt-1">{readinessData.overall}%</div>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mt-1 inline-block">
                                    Top Tier Progress
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
                                <div className="text-2xl font-black text-slate-900 mt-1">{applications.length || 4}</div>
                                <span className="text-[10px] font-bold text-cyan-600 flex items-center gap-1 mt-1">
                                    View Pipeline <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center font-bold">
                                <Briefcase className="w-5 h-5" />
                            </div>
                        </div>

                        <div
                            onClick={() => navigate('/interview')}
                            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition cursor-pointer flex items-center justify-between"
                        >
                            <div>
                                <span className="text-xs font-extrabold text-slate-500">Interview Prep</span>
                                <div className="text-2xl font-black text-slate-900 mt-1">{readinessData.interview}%</div>
                                <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1 mt-1">
                                    Practice AI Mock <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
                                <UserCheck className="w-5 h-5" />
                            </div>
                        </div>

                        <div
                            onClick={() => setActiveTab('resume')}
                            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition cursor-pointer flex items-center justify-between"
                        >
                            <div>
                                <span className="text-xs font-extrabold text-slate-500">Live Resume</span>
                                <div className="text-2xl font-black text-slate-900 mt-1">Verified</div>
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 mt-1 inline-block">
                                    Portfolio Ready
                                </span>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
                                <Star className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* MAIN VIEW: DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Main Column (65%) */}
                            <div className="lg:col-span-8 space-y-8">
                                {/* Verified Opportunities Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Top Opportunities for You</h2>
                                            <p className="text-xs font-semibold text-slate-500">Live jobs matching your verified StudySpirit skills & projects</p>
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

                                {/* Live Verified Resume Quick Banner */}
                                <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-3xl p-6 text-white shadow-md shadow-cyan-600/20 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                                            StudySpirit Verified Portfolio
                                        </span>
                                        <h3 className="text-lg font-black tracking-tight mt-1">Your Live Student Resume is Ready</h3>
                                        <p className="text-xs font-medium text-white/80">
                                            Showcase your verified skills, Project Lab creations, and algorithmic solves to top recruiters.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setActiveTab('resume')}
                                        className="bg-white text-cyan-900 hover:bg-slate-50 font-extrabold text-xs px-5 py-3 rounded-2xl shrink-0 shadow-xs transition flex items-center gap-1.5"
                                    >
                                        <span>Open Live Resume</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Right Sidebar Column (35%) */}
                            <div className="lg:col-span-4 space-y-8">
                                {/* Career Readiness Gauge Card */}
                                <CareerReadinessWidget
                                    readinessData={readinessData}
                                    onSeeRecommendations={() => setActiveTab('jobs')}
                                    onViewReport={() => setActiveTab('resume')}
                                />

                                {/* Top Skills In Demand Card */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-extrabold text-slate-900">Top Skills In Demand</h3>
                                        <span className="text-xs font-extrabold text-cyan-600">Active</span>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { title: 'Full Stack Development (React/Node)', demand: 'High Demand', color: 'bg-cyan-50 text-cyan-700' },
                                            { title: 'Data Structures & Algorithms', demand: 'Essential', color: 'bg-purple-50 text-purple-700' },
                                            { title: 'AI / Machine Learning', demand: 'High Demand', color: 'bg-emerald-50 text-emerald-700' },
                                            { title: 'Database & SQL Architecture', demand: 'High Demand', color: 'bg-blue-50 text-blue-700' }
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
                                        <span 
                                            onClick={() => setActiveTab('deadlines')}
                                            className="text-xs font-extrabold text-cyan-600 hover:text-cyan-700 cursor-pointer"
                                        >
                                            View All
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { title: 'Google Backend Intern', sub: 'Apply by 25 Aug', days: '5 days left', color: 'text-rose-600 bg-rose-50' },
                                            { title: 'Microsoft SWE Intern', sub: 'Apply by 28 Aug', days: '8 days left', color: 'text-amber-600 bg-amber-50' },
                                            { title: 'Adobe Internship Program', sub: 'Apply by 01 Sep', days: '12 days left', color: 'text-purple-600 bg-purple-50' }
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

                    {/* SUB-VIEW: RESUME MODULE */}
                    {activeTab === 'resume' && (
                        <CareerResumeView
                            resumeData={resumeData}
                            user={user}
                        />
                    )}

                    {/* SUB-VIEW: APPLICATION TRACKER */}
                    {activeTab.startsWith('app-') && (
                        <ApplicationTrackerKanban applications={applications} />
                    )}

                    {/* SUB-VIEW: SAVED OPPORTUNITIES */}
                    {activeTab === 'saved-opps' && (
                        <div className="space-y-6">
                            <div className="mb-4">
                                <h2 className="text-xl font-black text-slate-900">Saved Opportunities</h2>
                                <p className="text-xs font-semibold text-slate-500">Your bookmarked career listings</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(filteredListings.length > 0 ? filteredListings : defaultCuratedOpps).slice(0, 3).map((opp) => (
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

                    {/* SUB-VIEW: DEADLINES */}
                    {activeTab === 'deadlines' && (
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Upcoming Application Deadlines</h2>
                                    <p className="text-xs font-semibold text-slate-500">Never miss a critical hiring window</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { company: 'Google Cloud', title: 'Backend Developer Intern', deadline: '25 Aug', daysLeft: '5 days left', urgent: true },
                                    { company: 'Microsoft', title: 'Software Engineer Intern', deadline: '28 Aug', daysLeft: '8 days left', urgent: false },
                                    { company: 'Adobe', title: 'Internship Program 2025', deadline: '01 Sep', daysLeft: '12 days left', urgent: false },
                                    { company: 'Smart India Hackathon', title: 'SIH 2025 Final Submission', deadline: '10 Sep', daysLeft: '21 days left', urgent: false }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center font-bold text-slate-700">
                                                <Clock className="w-5 h-5 text-cyan-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                                                <p className="text-xs text-slate-500">{item.company} • Deadline: {item.deadline}</p>
                                            </div>
                                        </div>

                                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${item.urgent ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                            {item.daysLeft}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SUB-VIEW: OPPORTUNITIES BROWSER */}
                    {['jobs', 'internships', 'hackathons', 'competitions', 'campus'].includes(activeTab) && (
                        <div className="space-y-6">
                            <div className="mb-4">
                                <h2 className="text-xl font-black text-slate-900 capitalize">{activeTab} Opportunities</h2>
                                <p className="text-xs font-semibold text-slate-500">Explore active verified career listings across India and remote tech</p>
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
                                <h4 className="text-sm font-extrabold text-emerald-950">StudySpirit Career Accelerator</h4>
                                <p className="text-xs font-semibold text-emerald-800">
                                    Build verified projects in Project Lab and practice proctored interviews to boost your recruiter match index.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/project-lab')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md shadow-emerald-600/20 transition shrink-0 flex items-center gap-2"
                        >
                            <span>Explore Project Lab</span>
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
        source: 'Company Careers',
        link: 'https://careers.google.com'
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
        source: 'Microsoft Careers',
        link: 'https://careers.microsoft.com'
    },
    {
        id: 'c3',
        title: 'Full Stack Developer Intern',
        company: 'Razorpay',
        location: 'Bengaluru, India',
        workMode: 'Hybrid',
        salary: '₹15–30 LPA',
        matchScore: 88,
        skills: ['Node.js', 'PostgreSQL', 'Redis', 'React'],
        posted: 'Posted 1 day ago',
        logo: 'https://logo.clearbit.com/razorpay.com',
        source: 'Razorpay Careers',
        link: 'https://razorpay.com/jobs/'
    }
];
