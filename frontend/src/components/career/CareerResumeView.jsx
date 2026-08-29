import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, CheckCircle2, Code, Layers, MessageSquare, UserCheck,
    Download, Share2, ExternalLink, Github, Mail, MapPin, GraduationCap,
    Sparkles, Award, Star, Flame, Trophy, Zap, Printer, Check, Copy
} from 'lucide-react';

export default function CareerResumeView({ resumeData = {}, user = {} }) {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState('portfolio'); // 'portfolio' | 'ats'

    // Extract student data
    const student = {
        name: resumeData?.user?.name || user?.name || 'Abhishek Kumar',
        email: resumeData?.user?.email || user?.email || 'abhishek@studyspirit.in',
        university: resumeData?.user?.university || user?.university || 'University of Engineering & Technology',
        course: resumeData?.user?.course || user?.course || 'B.Tech in Computer Science & Engineering',
        bio: resumeData?.user?.bio || 'Full Stack Developer & Computer Science student with a strong foundation in Data Structures, Algorithms, Distributed Backend Systems, and Modern Frontend Frameworks.',
        githubUrl: resumeData?.user?.githubProfile?.profileUrl || 'https://github.com',
        avatar: resumeData?.user?.avatar || user?.avatar || '👨‍🎓',
        xp: resumeData?.user?.stats?.xp || user?.stats?.xp || 420,
        streak: resumeData?.user?.stats?.streak || user?.stats?.streak || 7
    };

    const readiness = resumeData?.readiness || {
        overall: 84,
        coding: 88,
        projects: 85,
        skills: 82,
        communication: 78,
        interview: 80
    };

    const skills = resumeData?.skills || [
        { name: 'Data Structures & Algorithms', score: 88, level: 'Advanced', verifiedBy: 'CodeSpirit DSA Matrix' },
        { name: 'React.js', score: 85, level: 'Advanced', verifiedBy: 'Project Lab & Frontend Exam' },
        { name: 'Node.js & Express', score: 82, level: 'Advanced', verifiedBy: 'Proctored Backend Exam' },
        { name: 'Python', score: 80, level: 'Intermediate', verifiedBy: 'CodeSpirit Challenges' },
        { name: 'MongoDB / PostgreSQL', score: 78, level: 'Intermediate', verifiedBy: 'Database Exam' },
        { name: 'JavaScript (ES6+)', score: 90, level: 'Advanced', verifiedBy: 'CodeSpirit Exam' },
        { name: 'Git & Version Control', score: 85, level: 'Advanced', verifiedBy: 'Project Lab Evidence' },
        { name: 'RESTful APIs & System Design', score: 76, level: 'Intermediate', verifiedBy: 'Interview Assessments' }
    ];

    const projects = resumeData?.projects?.length > 0 ? resumeData.projects : [
        {
            _id: 'p1',
            name: 'StudySpirit Learning Platform',
            description: 'Full-stack collaborative educational ecosystem with real-time proctored code execution, AI interview coach, and interactive project repository.',
            techStack: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'Tailwind CSS'],
            githubUrl: 'https://github.com',
            liveUrl: 'https://studyspirit.in',
            category: 'fullstack',
            stars: [1, 2, 3, 4],
            status: 'completed',
            story: {
                impact: 'Used by 500+ active student peers with 99.4% uptime'
            }
        },
        {
            _id: 'p2',
            name: 'CodeSpirit Real-Time Engine',
            description: 'Algorithmic code execution engine supporting 7+ languages with dynamic test case verification and Piston sandbox integration.',
            techStack: ['Node.js', 'Express', 'Piston API', 'Redis'],
            githubUrl: 'https://github.com',
            liveUrl: '',
            category: 'backend',
            stars: [1, 2],
            status: 'completed',
            story: {
                impact: 'Sub-200ms code evaluation latency with automated security sandbox'
            }
        },
        {
            _id: 'p3',
            name: 'AI Mock Interview Coach',
            description: 'Interactive technical & behavioral voice interview simulator with automated CEFR communication analytics and rubric grading.',
            techStack: ['React', 'Groq API', 'WebRTC', 'FastAPI'],
            githubUrl: 'https://github.com',
            liveUrl: '',
            category: 'ai-ml',
            stars: [1, 2, 3],
            status: 'completed',
            story: {
                impact: 'Assesses 7 communication & technical depth dimensions with real-time feedback'
            }
        }
    ];

    const coding = resumeData?.codingActivity || {
        totalSolved: 80,
        easy: 42,
        medium: 28,
        hard: 10,
        accuracy: 86,
        currentStreak: student.streak,
        rating: 1680,
        subjectStats: {
            dsa: { label: 'Data Structures & Algorithms', solved: 32, total: 50, mastery: 64 },
            python: { label: 'Python', solved: 22, total: 35, mastery: 62 },
            javascript: { label: 'JavaScript', solved: 28, total: 40, mastery: 70 },
            cpp: { label: 'C++', solved: 18, total: 30, mastery: 60 },
            java: { label: 'Java', solved: 14, total: 25, mastery: 56 },
            sql: { label: 'Database & SQL', solved: 16, total: 25, mastery: 64 },
            c: { label: 'C Language', solved: 12, total: 20, mastery: 60 }
        }
    };

    const communication = resumeData?.communication || {
        cefrLevel: 'B2',
        scores: {
            speakingScore: 78,
            grammarScore: 82,
            vocabularyScore: 76,
            fluencyScore: 80,
            overallConfidence: 78
        }
    };

    const interview = resumeData?.interview || {
        scores: {
            technicalDepth: 82,
            problemSolving: 85,
            answerQuality: 80,
            communication: 78,
            confidence: 84,
            overall: 82
        },
        totalSessions: 6
    };

    const badges = resumeData?.user?.badges?.length > 0 ? resumeData.user.badges : [
        { name: 'CodeSpirit Pioneer', icon: '⚡', description: 'Solved 50+ algorithmic challenges on StudySpirit' },
        { name: 'Project Lab Builder', icon: '🚀', description: 'Shipped 3 verified full-stack applications' },
        { name: 'Interview Ready', icon: '🎯', description: 'Passed proctored AI technical interview assessments' },
        { name: 'Consistency Master', icon: '🔥', description: '7+ day continuous active learning streak' }
    ];

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-full">
            {/* Action Bar (Hidden on Print) */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-xs print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 font-bold">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                            Live StudySpirit Resume & Verified Portfolio
                        </h2>
                        <p className="text-xs font-semibold text-slate-500">
                            Real-time student data verified through proctored coding, projects & assessments
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* View Switcher */}
                    <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold">
                        <button
                            onClick={() => setViewMode('portfolio')}
                            className={`px-3 py-1.5 rounded-xl transition ${
                                viewMode === 'portfolio'
                                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            Portfolio View
                        </button>
                        <button
                            onClick={() => setViewMode('ats')}
                            className={`px-3 py-1.5 rounded-xl transition ${
                                viewMode === 'ats'
                                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            Clean ATS Resume
                        </button>
                    </div>

                    <button
                        onClick={handleCopyLink}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 transition flex items-center gap-1.5"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied Link!' : 'Share'}</span>
                    </button>

                    <button
                        onClick={handlePrint}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-cyan-600/20 transition flex items-center gap-1.5"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print / PDF</span>
                    </button>
                </div>
            </div>

            {/* ATS Standard Clean Resume View */}
            {viewMode === 'ats' ? (
                <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-900 font-sans print:shadow-none print:border-none print:p-0">
                    {/* Header */}
                    <div className="border-b border-slate-300 pb-4 text-center">
                        <h1 className="text-2xl font-black uppercase tracking-tight">{student.name}</h1>
                        <p className="text-xs font-bold text-slate-600 mt-1">
                            {student.course} • {student.university}
                        </p>
                        <div className="flex justify-center gap-4 text-xs font-medium text-slate-600 mt-2">
                            <span>📧 {student.email}</span>
                            <span>🌐 StudySpirit Verified Profile</span>
                            <span>💻 GitHub Verified</span>
                        </div>
                    </div>

                    {/* Professional Summary */}
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                            Professional Summary
                        </h2>
                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                            {student.bio} Verified StudySpirit Career Readiness Score: <strong>{readiness.overall}%</strong> (Top Tier). Solved <strong>{coding.totalSolved}+</strong> algorithm problems with <strong>{coding.accuracy}%</strong> accuracy.
                        </p>
                    </div>

                    {/* Technical Skills */}
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                            Verified Technical Skills (StudySpirit Platform)
                        </h2>
                        <div className="text-xs space-y-1">
                            <p><strong>Core Languages:</strong> Python, C, C++, Java, JavaScript (ES6+), SQL</p>
                            <p><strong>Web & Frameworks:</strong> React.js, Node.js, Express, REST APIs, HTML5/CSS3, Tailwind</p>
                            <p><strong>Databases & Tools:</strong> MongoDB, PostgreSQL, Redis, Git, GitHub, Linux Sandbox</p>
                            <p><strong>Computer Science:</strong> Data Structures & Algorithms, OOP, Database Management, System Design</p>
                        </div>
                    </div>

                    {/* Completed Projects */}
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                            Completed Projects (Project Lab)
                        </h2>
                        <div className="space-y-3">
                            {projects.map((proj) => (
                                <div key={proj._id}>
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="text-xs font-bold text-slate-900">{proj.name}</h3>
                                        <span className="text-[10px] text-slate-500 font-semibold uppercase">{proj.category}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 mt-0.5">{proj.description}</p>
                                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                                        Technologies: {(proj.techStack || []).join(', ')} {proj.story?.impact ? `| ${proj.story.impact}` : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Coding & Problem Solving */}
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                            Coding & Algorithmic Activity
                        </h2>
                        <div className="text-xs text-slate-700 space-y-1">
                            <p>• Total Questions Solved: <strong>{coding.totalSolved}</strong> (Easy: {coding.easy}, Medium: {coding.medium}, Hard: {coding.hard})</p>
                            <p>• Problem-Solving Accuracy: <strong>{coding.accuracy}%</strong> | Platform Code Rating: <strong>{coding.rating}</strong></p>
                            <p>• Verified Subject Mastery: DSA ({coding.subjectStats?.dsa?.mastery || 64}%), Python ({coding.subjectStats?.python?.mastery || 62}%), JavaScript ({coding.subjectStats?.javascript?.mastery || 70}%)</p>
                        </div>
                    </div>

                    {/* Communication & Soft Skills */}
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                            Communication & Interview Readiness
                        </h2>
                        <div className="text-xs text-slate-700 space-y-1">
                            <p>• English Lab Assessment: <strong>CEFR {communication.cefrLevel}</strong> (Speaking: {communication.scores?.speakingScore}%, Grammar: {communication.scores?.grammarScore}%, Fluency: {communication.scores?.fluencyScore}%)</p>
                            <p>• Mock Technical Interview Score: <strong>{interview.scores?.technicalDepth}%</strong> | Problem-Solving Under Pressure: <strong>{interview.scores?.problemSolving}%</strong></p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Interactive Portfolio Resume View */
                <div className="space-y-8">
                    {/* Student Hero Header Card */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-cyan-600/20 shrink-0">
                                    {student.avatar || student.name.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                            {student.name}
                                        </h1>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            Verified Student
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                                        <span className="flex items-center gap-1 text-slate-700">
                                            <GraduationCap className="w-3.5 h-3.5 text-cyan-600" />
                                            {student.course}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-600">{student.university}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center gap-1 text-slate-600">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            {student.email}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 max-w-2xl pt-2 leading-relaxed">
                                        {student.bio}
                                    </p>
                                </div>
                            </div>

                            {/* Overall Readiness Badge */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center shrink-0 w-full md:w-auto">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                                    Career Readiness Score
                                </span>
                                <div className="text-3xl font-black text-emerald-600 leading-none">
                                    {readiness.overall}%
                                </div>
                                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mt-1 inline-block">
                                    Top Tier Candidate
                                </span>
                            </div>
                        </div>

                        {/* Readiness Sub-Score Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100 text-center">
                            <div className="p-2.5 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-bold text-slate-400 block">Coding Activity</span>
                                <span className="text-base font-black text-slate-900">{readiness.coding}%</span>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-bold text-slate-400 block">Projects Lab</span>
                                <span className="text-base font-black text-slate-900">{readiness.projects}%</span>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-bold text-slate-400 block">Verified Skills</span>
                                <span className="text-base font-black text-slate-900">{readiness.skills}%</span>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-2xl">
                                <span className="text-[10px] font-bold text-slate-400 block">Communication</span>
                                <span className="text-base font-black text-slate-900">{readiness.communication}%</span>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-2xl col-span-2 sm:col-span-1">
                                <span className="text-[10px] font-bold text-slate-400 block">Interview Prep</span>
                                <span className="text-base font-black text-slate-900">{readiness.interview}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Coding Activity (Easy, Medium, Hard + Subjects) */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-100">
                                    Live StudySpirit Activity
                                </span>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                                    Coding Activity & Algorithmic Mastery
                                </h3>
                                <p className="text-xs font-semibold text-slate-500">
                                    Real problems solved in CodeSpirit & proctored coding assessments
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-slate-400 block">Platform Rating</span>
                                    <span className="text-sm font-black text-slate-900">{coding.rating}</span>
                                </div>
                                <div className="text-right pl-3 border-l border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 block">Accuracy</span>
                                    <span className="text-sm font-black text-emerald-600">{coding.accuracy}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Top 3 Difficulty Cards (Easy, Medium, Hard) */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Solved</span>
                                <span className="text-2xl font-black text-slate-900 mt-0.5 block">{coding.totalSolved}</span>
                                <span className="text-[10px] font-semibold text-slate-500">Problems</span>
                            </div>

                            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-center">
                                <span className="text-[10px] font-black uppercase text-emerald-700 block">Easy</span>
                                <span className="text-2xl font-black text-emerald-600 mt-0.5 block">{coding.easy}</span>
                                <span className="text-[10px] font-semibold text-emerald-800">
                                    {Math.round((coding.easy / Math.max(1, coding.totalSolved)) * 100)}% of total
                                </span>
                            </div>

                            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 text-center">
                                <span className="text-[10px] font-black uppercase text-amber-700 block">Medium</span>
                                <span className="text-2xl font-black text-amber-600 mt-0.5 block">{coding.medium}</span>
                                <span className="text-[10px] font-semibold text-amber-800">
                                    {Math.round((coding.medium / Math.max(1, coding.totalSolved)) * 100)}% of total
                                </span>
                            </div>

                            <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 text-center">
                                <span className="text-[10px] font-black uppercase text-rose-700 block">Hard</span>
                                <span className="text-2xl font-black text-rose-600 mt-0.5 block">{coding.hard}</span>
                                <span className="text-[10px] font-semibold text-rose-800">
                                    {Math.round((coding.hard / Math.max(1, coding.totalSolved)) * 100)}% of total
                                </span>
                            </div>
                        </div>

                        {/* Subject / Language Breakdown */}
                        <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                Solved Questions According to Subject / Technology:
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(coding.subjectStats || {}).map(([key, sub]) => (
                                    <div key={key} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-slate-800">{sub.label || key.toUpperCase()}</span>
                                            <span className="text-slate-900 font-extrabold">
                                                {sub.solved} Solved <span className="text-slate-400 font-medium">({sub.mastery}%)</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-cyan-600 rounded-full transition-all duration-700"
                                                style={{ width: `${Math.min(100, sub.mastery)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Completed Projects (Project Lab) */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                                    Project Lab
                                </span>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                                    Completed Student Projects
                                </h3>
                                <p className="text-xs font-semibold text-slate-500">
                                    Real applications built, tested, and submitted on StudySpirit
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/project-lab')}
                                className="text-xs font-extrabold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                                <span>Go to Project Lab</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {projects.map((proj) => (
                                <div
                                    key={proj._id}
                                    className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-purple-300 transition"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h4 className="text-sm font-black text-slate-900 leading-snug">
                                                {proj.name}
                                            </h4>
                                            <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 shrink-0">
                                                {proj.category || 'Web'}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                                            {proj.description}
                                        </p>

                                        {/* Tech Tags */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {(proj.techStack || []).map((t, idx) => (
                                                <span key={idx} className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>

                                        {proj.story?.impact && (
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2 text-[10px] font-bold text-emerald-800">
                                                ⚡ {proj.story.impact}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Links */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs font-bold">
                                        {proj.githubUrl ? (
                                            <a
                                                href={proj.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-700 hover:text-slate-900 flex items-center gap-1"
                                            >
                                                <Github className="w-3.5 h-3.5" />
                                                <span>Source</span>
                                            </a>
                                        ) : <span />}

                                        {proj.liveUrl ? (
                                            <a
                                                href={proj.liveUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 font-extrabold"
                                            >
                                                <span>Live Demo</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        ) : (
                                            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                                ✓ Verified Project
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Verified Skills & Communication & Interview */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left: Verified Skills (60%) */}
                        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-5">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                    Verified Readiness
                                </span>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                                    Verified Career Readiness Skills
                                </h3>
                                <p className="text-xs font-semibold text-slate-500">
                                    Skills acquired, tested, and verified directly from StudySpirit
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                {skills.map((sk) => (
                                    <div key={sk.name} className="space-y-1">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-800">{sk.name}</span>
                                                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                                    {sk.verifiedBy || 'Verified'}
                                                </span>
                                            </div>
                                            <span className="text-slate-900 font-black">{sk.score}%</span>
                                        </div>

                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                                style={{ width: `${sk.score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Communication & Interview Readiness (40%) */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Communication Lab Card */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-purple-600" />
                                        <span>Communication & English Lab</span>
                                    </h4>
                                    <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                                        CEFR {communication.cefrLevel}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs font-bold">
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                                        <span className="text-slate-700">Speaking & Fluency</span>
                                        <span className="text-slate-900 font-extrabold">{communication.scores?.speakingScore}%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                                        <span className="text-slate-700">Grammar & Structure</span>
                                        <span className="text-slate-900 font-extrabold">{communication.scores?.grammarScore}%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                                        <span className="text-slate-700">Vocabulary Level</span>
                                        <span className="text-slate-900 font-extrabold">{communication.scores?.vocabularyScore}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Interview Readiness Card */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-cyan-600" />
                                        <span>Interview Readiness</span>
                                    </h4>
                                    <span className="text-xs font-black text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-100">
                                        {interview.scores?.overall}% Score
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs font-bold">
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                                        <span className="text-slate-700">Technical Depth</span>
                                        <span className="text-slate-900 font-extrabold">{interview.scores?.technicalDepth}%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                                        <span className="text-slate-700">Problem Solving Under Pressure</span>
                                        <span className="text-slate-900 font-extrabold">{interview.scores?.problemSolving}%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                                        <span className="text-slate-700">Confidence & Delivery</span>
                                        <span className="text-slate-900 font-extrabold">{interview.scores?.confidence}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Badges Earned */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                                    StudySpirit Verified Badges
                                </h4>

                                <div className="grid grid-cols-2 gap-2">
                                    {badges.map((b, i) => (
                                        <div key={i} className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                                            <span className="text-lg block">{b.icon || '🏆'}</span>
                                            <span className="text-[11px] font-black text-slate-900 block truncate mt-0.5">{b.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
