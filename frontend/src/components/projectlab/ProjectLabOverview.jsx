import React from 'react';
import {
    Plus, Github, ChevronDown, ChevronRight, Briefcase, Monitor,
    Code, Star, BarChart3, ExternalLink, ShieldCheck, CheckCircle2,
    FileText, Lightbulb, Beaker, Rocket, ArrowRight, MoreVertical,
    Upload, Camera, Video, Award, AlertCircle
} from 'lucide-react';
import AriaAvatar from '../AriaAvatar';

export default function ProjectLabOverview({
    user = {},
    stats = {},
    projects = [],
    onOpenBuilder,
    onOpenGithubImport,
    onNavigateTab
}) {
    const studentName = user?.name ? user.name.split(' ')[0] : 'Abhishek';

    // Sample/real featured projects matching reference image
    const defaultFeatured = [
        {
            _id: '1',
            name: 'StudySpirit',
            description: 'AI-powered learning and placement platform',
            techStack: ['React', 'Node.js', 'MongoDB', '+3'],
            liveUrl: 'https://studyspirit.in',
            githubUrl: 'https://github.com/AbhishekKumar-77/-StudySpirit',
            strengthScore: 87,
            featured: true,
            imageBg: 'bg-gradient-to-br from-emerald-50 to-teal-100 border border-teal-200'
        },
        {
            _id: '2',
            name: 'CodeSpirit',
            description: 'Online coding platform with AI assistance',
            techStack: ['React', 'Node.js', 'Socket.io'],
            liveUrl: 'https://studyspirit.in/codespirit',
            githubUrl: 'https://github.com/AbhishekKumar-77/-StudySpirit',
            strengthScore: 82,
            featured: true,
            imageBg: 'bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 text-white'
        },
        {
            _id: '3',
            name: 'AI Interview System',
            description: 'AI-based interview preparation platform',
            techStack: ['Next.js', 'Python', 'OpenAI', '+2'],
            liveUrl: 'https://studyspirit.in/interview',
            githubUrl: 'https://github.com/AbhishekKumar-77/-StudySpirit',
            strengthScore: 78,
            featured: true,
            imageBg: 'bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200'
        }
    ];

    const displayFeatured = projects.filter(p => p.featured).length > 0
        ? projects.filter(p => p.featured)
        : defaultFeatured;

    return (
        <div className="space-y-6">

            {/* Top Greeting & Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Good evening, {studentName} 👋
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Build amazing projects. Showcase your skills. Get discovered.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenBuilder}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-600/20 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Project</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                    </button>

                    <button
                        onClick={onOpenGithubImport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200/90 shadow-2xs transition-all"
                    >
                        <Github className="w-4 h-4 text-slate-900" />
                        <span>Import from GitHub</span>
                    </button>
                </div>
            </div>

            {/* 5 Summary Stat Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {/* Card 1 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-slate-900 leading-none">{stats.totalProjects || 12}</div>
                        <div className="text-[11px] font-bold text-slate-500 mt-0.5">Total Projects</div>
                        <div className="text-[10px] font-bold text-emerald-600 mt-0.5">8 Published</div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-slate-900 leading-none">{stats.liveDemos || 6}</div>
                        <div className="text-[11px] font-bold text-slate-500 mt-0.5">Live Demos</div>
                        <div className="text-[10px] font-bold text-emerald-600 mt-0.5">5 Online</div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Code className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-slate-900 leading-none">{stats.totalTechnologies || 14}</div>
                        <div className="text-[11px] font-bold text-slate-500 mt-0.5">Technologies</div>
                        <div className="text-[10px] font-bold text-blue-600 mt-0.5">8 Actively Used</div>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-slate-900 leading-none">{stats.featuredCount || 3}</div>
                        <div className="text-[11px] font-bold text-slate-500 mt-0.5">Featured Projects</div>
                        <div className="text-[10px] font-bold text-amber-600 mt-0.5">High Visibility</div>
                    </div>
                </div>

                {/* Card 5 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-slate-900 leading-none">{stats.avgStrength || 82}%</div>
                        <div className="text-[11px] font-bold text-slate-500 mt-0.5">Portfolio Strength</div>
                        <div className="text-[10px] font-bold text-pink-600 mt-0.5">Great Progress</div>
                    </div>
                </div>
            </div>

            {/* Main Layout Grid: Left (2 Cols) | Right (1 Col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT CONTENT (2 COLUMNS) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Featured Projects Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-black text-slate-900 text-base">Featured Projects</h2>
                            <button
                                onClick={() => onNavigateTab && onNavigateTab('my-projects')}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                                View all projects →
                            </button>
                        </div>

                        {/* 3 Featured Cards Horizontal Carousel */}
                        <div className="relative">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {displayFeatured.slice(0, 3).map((proj, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs flex flex-col justify-between group hover:border-emerald-300 transition-all">
                                        {/* Card Image Thumbnail */}
                                        <div className={`h-28 ${proj.imageBg || 'bg-slate-100'} p-3 relative flex items-center justify-center`}>
                                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white font-bold text-[9px] rounded-md shadow-2xs">
                                                Featured
                                            </span>
                                            <div className="text-center font-bold text-xs opacity-70">
                                                {proj.name} Preview
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                                                        {proj.name}
                                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                                    </h3>
                                                </div>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                                                    {proj.description}
                                                </p>

                                                {/* Tech Stack Pills */}
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {proj.techStack?.map((t, i) => (
                                                        <span key={i} className="text-[9px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Links Row */}
                                            <div className="flex items-center gap-3 pt-2 text-[10px] font-bold text-slate-500">
                                                <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-600">
                                                    <Monitor className="w-3 h-3 text-emerald-500" /> Live Demo
                                                </a>
                                                <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-slate-900">
                                                    <Github className="w-3 h-3" /> GitHub
                                                </a>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="px-3.5 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Strength: {proj.strengthScore || 85}/100</span>
                                            </div>
                                            <button className="text-slate-400 hover:text-slate-700">
                                                <MoreVertical className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Carousel Next Button Arrow */}
                            <button className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-50 z-10 hidden md:flex">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Middle Row 3 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Card 1: Project Health Overview */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                            <h3 className="font-bold text-slate-900 text-xs tracking-tight">Project Health Overview</h3>

                            <div className="flex flex-col gap-3">
                                {/* SVG Pentagon Radar Chart */}
                                <div className="h-32 flex items-center justify-center relative">
                                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                                        {/* Background Grid Hexagon */}
                                        <polygon points="50,10 90,32 90,78 50,90 10,78 10,32" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                                        <polygon points="50,25 75,38 75,68 50,75 25,68 25,38" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                                        {/* Green Filled Active Polygon */}
                                        <polygon points="50,16 84,35 80,72 50,83 18,72 16,35" fill="#10b98120" stroke="#10b981" strokeWidth="2" />
                                    </svg>
                                </div>

                                {/* Category Progress Bars */}
                                <div className="space-y-1.5 text-[10px] font-semibold text-slate-600">
                                    <div className="flex justify-between"><span>Documentation</span><span className="font-bold text-teal-600">84%</span></div>
                                    <div className="w-full bg-slate-100 h-1 rounded-full"><div className="bg-teal-500 h-1 rounded-full" style={{ width: '84%' }} /></div>

                                    <div className="flex justify-between"><span>GitHub</span><span className="font-bold text-emerald-600">100%</span></div>
                                    <div className="w-full bg-slate-100 h-1 rounded-full"><div className="bg-emerald-500 h-1 rounded-full" style={{ width: '100%' }} /></div>

                                    <div className="flex justify-between"><span>Live Demo</span><span className="font-bold text-blue-600">90%</span></div>
                                    <div className="w-full bg-slate-100 h-1 rounded-full"><div className="bg-blue-500 h-1 rounded-full" style={{ width: '90%' }} /></div>

                                    <div className="flex justify-between"><span>Screenshots</span><span className="font-bold text-amber-600">70%</span></div>
                                    <div className="w-full bg-slate-100 h-1 rounded-full"><div className="bg-amber-500 h-1 rounded-full" style={{ width: '70%' }} /></div>

                                    <div className="flex justify-between"><span>Technical Details</span><span className="font-bold text-purple-600">76%</span></div>
                                    <div className="w-full bg-slate-100 h-1 rounded-full"><div className="bg-purple-500 h-1 rounded-full" style={{ width: '76%' }} /></div>

                                    <div className="flex justify-between"><span>Impact & Value</span><span className="font-bold text-pink-600">62%</span></div>
                                    <div className="w-full bg-slate-100 h-1 rounded-full"><div className="bg-pink-500 h-1 rounded-full" style={{ width: '62%' }} /></div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Recent Activity */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between space-y-3">
                            <h3 className="font-bold text-slate-900 text-xs tracking-tight">Recent Activity</h3>

                            <div className="space-y-3">
                                {[
                                    { text: 'Added new screenshot to StudySpirit', time: '2 hours ago', icon: '🖼️', color: 'bg-blue-50 text-blue-600' },
                                    { text: 'Deployed CodeSpirit v2.1', time: '5 hours ago', icon: '🚀', color: 'bg-emerald-50 text-emerald-600' },
                                    { text: 'Updated project documentation', time: '1 day ago', icon: '📝', color: 'bg-purple-50 text-purple-600' },
                                    { text: 'Connected GitHub repository', time: '2 days ago', icon: '🐙', color: 'bg-indigo-50 text-indigo-600' }
                                ].map((act, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${act.color} flex-shrink-0 mt-0.5`}>
                                            {act.icon}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-slate-800 leading-snug">{act.text}</div>
                                            <div className="text-[9px] font-medium text-slate-400">{act.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-xl border border-slate-200 transition-all text-center">
                                View All Activity
                            </button>
                        </div>

                        {/* Card 3: AI Project Analyzer */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 text-xs">AI Project Analyzer</h3>
                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold text-[9px] rounded-md border border-purple-200">
                                    Beta
                                </span>
                            </div>

                            <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl space-y-1 text-center">
                                <div className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span>Overall Project Strength</span>
                                </div>
                                <div className="text-xl font-black text-emerald-700">82/100</div>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                    Great work! Your project shows strong technical implementation.
                                </p>
                                <button className="text-[10px] font-bold text-blue-600 hover:underline pt-1 block mx-auto">
                                    View Detailed Analysis →
                                </button>
                            </div>

                            <div className="space-y-1 text-[10px]">
                                <span className="font-bold text-slate-400 uppercase tracking-wider">Top Suggestions</span>
                                <div className="space-y-0.5 text-slate-700 font-medium">
                                    <div className="flex items-center gap-1 text-emerald-600">✓ Add architecture diagram</div>
                                    <div className="flex items-center gap-1 text-emerald-600">✓ Improve README documentation</div>
                                    <div className="flex items-center gap-1 text-emerald-600">✓ Add API documentation</div>
                                </div>
                                <button className="text-[10px] font-bold text-indigo-600 hover:underline pt-1">
                                    See all suggestions →
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Left Card: Build Progress */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
                            <h3 className="font-bold text-slate-900 text-xs">Build Progress</h3>

                            {/* Stepper */}
                            <div className="flex items-center justify-between text-center overflow-x-auto pb-1">
                                {[
                                    { title: 'Idea', status: 'Completed', icon: Lightbulb, color: 'bg-emerald-100 text-emerald-700' },
                                    { title: 'Planning', status: 'Completed', icon: FileText, color: 'bg-blue-100 text-blue-700' },
                                    { title: 'Development', status: 'In Progress', icon: Code, color: 'bg-purple-100 text-purple-700 ring-2 ring-purple-400' },
                                    { title: 'Testing', status: 'Pending', icon: Beaker, color: 'bg-slate-100 text-slate-400' },
                                    { title: 'Deployment', status: 'Pending', icon: Rocket, color: 'bg-slate-100 text-slate-400' }
                                ].map((stg, i) => (
                                    <div key={i} className="flex flex-col items-center flex-1 min-w-[60px]">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${stg.color} mb-1`}>
                                            <stg.icon className="w-4 h-4" />
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-900">{stg.title}</div>
                                        <div className="text-[8px] font-semibold text-slate-400">{stg.status}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full" style={{ width: '68%' }} />
                                </div>
                                <span className="text-[10px] font-bold text-purple-600">68% Complete</span>
                            </div>
                        </div>

                        {/* Right Card: Top Technologies */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                            <h3 className="font-bold text-slate-900 text-xs">Top Technologies</h3>

                            <div className="flex items-center gap-6">
                                {/* SVG Donut Chart */}
                                <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                                        {/* JS 35% */}
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="5" strokeDasharray="35 100" strokeDashoffset="0" />
                                        {/* React 25% */}
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#06b6d4" strokeWidth="5" strokeDasharray="25 100" strokeDashoffset="-35" />
                                        {/* Node.js 20% */}
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="5" strokeDasharray="20 100" strokeDashoffset="-60" />
                                        {/* MongoDB 10% */}
                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="5" strokeDasharray="10 100" strokeDashoffset="-80" />
                                    </svg>
                                </div>

                                {/* Legend */}
                                <div className="space-y-1 text-[10px] font-bold text-slate-700 flex-1">
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> JavaScript</span><span>35%</span></div>
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500" /> React</span><span>25%</span></div>
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Node.js</span><span>20%</span></div>
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> MongoDB</span><span>10%</span></div>
                                    <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" /> Others</span><span>10%</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (1 COLUMN - SIDEBAR WIDGETS) */}
                <div className="space-y-6">

                    {/* Widget 1: AI Project Coach [Aria] */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-200/80 rounded-2xl p-4 shadow-2xs relative overflow-hidden space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-indigo-900 text-xs">AI Project Coach</span>
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-[9px] rounded-md">
                                    Aria
                                </span>
                            </div>
                        </div>

                        {/* Speech Bubble + Waving Avatar */}
                        <div className="flex items-start gap-2">
                            <div className="flex-1 bg-white p-3 rounded-xl border border-purple-100 shadow-2xs text-[11px] text-slate-700 leading-snug">
                                Hi {studentName}! I analyzed your projects and found some ways to make them even better.
                            </div>
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-300 shadow-sm flex-shrink-0">
                                <AriaAvatar isSpeaking={false} className="w-full h-full" />
                            </div>
                        </div>

                        <button
                            onClick={onOpenBuilder}
                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                        >
                            View Suggestions →
                        </button>
                    </div>

                    {/* Widget 2: Project Completion Tips */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                        <div>
                            <h3 className="font-bold text-slate-900 text-xs">Project Completion Tips</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Complete these to improve your portfolio</p>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                <span className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Add project documentation
                                </span>
                                <span className="font-bold text-emerald-600 text-[11px]">90%</span>
                            </div>

                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="flex items-center gap-1.5 font-semibold text-slate-700 text-[11px]">
                                    <Camera className="w-3.5 h-3.5 text-amber-500" /> Upload more screenshots
                                </span>
                                <span className="font-bold text-amber-600 text-[11px]">70%</span>
                            </div>

                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="flex items-center gap-1.5 font-semibold text-slate-700 text-[11px]">
                                    <Video className="w-3.5 h-3.5 text-amber-500" /> Add demo video
                                </span>
                                <span className="font-bold text-amber-600 text-[11px]">40%</span>
                            </div>

                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="flex items-center gap-1.5 font-semibold text-slate-700 text-[11px]">
                                    <FileText className="w-3.5 h-3.5 text-amber-500" /> Write project impact
                                </span>
                                <span className="font-bold text-amber-600 text-[11px]">60%</span>
                            </div>

                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="flex items-center gap-1.5 font-semibold text-slate-700 text-[11px]">
                                    <Award className="w-3.5 h-3.5 text-pink-500" /> Get code quality badge
                                </span>
                                <span className="font-bold text-pink-600 text-[11px]">30%</span>
                            </div>
                        </div>

                        <button className="text-[10px] font-bold text-indigo-600 hover:underline pt-1 block">
                            View all tips →
                        </button>
                    </div>

                    {/* Widget 3: Suggested for You */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                        <h3 className="font-bold text-slate-900 text-xs">Suggested for You</h3>

                        <div className="space-y-2.5">
                            {[
                                { title: 'Add Unit Tests', desc: 'Improve code reliability', icon: Beaker },
                                { title: 'Deploy to Production', desc: 'Make your project live', icon: ShieldCheck },
                                { title: 'Write Technical Blog', desc: 'Share your learnings', icon: FileText }
                            ].map((sug, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                                            <sug.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-[11px]">{sug.title}</div>
                                            <div className="text-[9px] text-slate-400">{sug.desc}</div>
                                        </div>
                                    </div>
                                    <button className="px-2 py-1 bg-white hover:bg-slate-100 text-indigo-600 font-bold text-[9px] rounded-md border border-slate-200">
                                        Learn More
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button className="text-[10px] font-bold text-indigo-600 hover:underline pt-1 block">
                            View more resources →
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}
