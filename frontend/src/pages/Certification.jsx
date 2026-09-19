import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    Award, ArrowLeft, Upload, ExternalLink, X, FileText, Calendar,
    Trash2, Eye, Plus, Search, Filter, GraduationCap, Link2
} from 'lucide-react';

export default function Certification() {
    const { user } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('my-certificates');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Load initial certificates from localStorage or defaults
    const [certificates, setCertificates] = useState(() => {
        const defaultCerts = [
            {
                id: 1,
                name: 'Python for Data Science',
                platform: 'Coursera',
                issueDate: '2026-01-15',
                credentialId: 'ABC123XYZ',
                credentialUrl: 'https://coursera.org/verify/ABC123XYZ',
                image: null,
                category: 'programming'
            },
            {
                id: 2,
                name: 'AWS Cloud Practitioner',
                platform: 'AWS',
                issueDate: '2026-01-28',
                credentialId: 'AWS-CP-2026',
                credentialUrl: 'https://aws.amazon.com/verification',
                image: null,
                category: 'cloud'
            }
        ];
        try {
            const saved = JSON.parse(localStorage.getItem('studyspirit_certificates') || '[]');
            if (saved && saved.length > 0) {
                const ids = new Set(saved.map(s => s.credentialId));
                return [...saved, ...defaultCerts.filter(d => !ids.has(d.credentialId))];
            }
        } catch (e) {
            console.error(e);
        }
        return defaultCerts;
    });

    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        name: '',
        platform: '',
        issueDate: '',
        credentialId: '',
        credentialUrl: '',
        category: 'programming',
        image: null
    });

    // Popular certification platforms
    const platforms = [
        {
            id: 1,
            name: 'Coursera',
            description: 'Learn from top universities and companies worldwide',
            logo: '🎓',
            url: 'https://www.coursera.org',
            categories: ['Programming', 'Data Science', 'Business', 'AI/ML'],
            color: 'from-blue-500 to-blue-600'
        },
        {
            id: 2,
            name: 'Udemy',
            description: 'Affordable courses on any topic imaginable',
            logo: '📚',
            url: 'https://www.udemy.com',
            categories: ['Web Development', 'Design', 'Marketing', 'IT'],
            color: 'from-purple-500 to-pink-500'
        },
        {
            id: 3,
            name: 'Google Skillshop',
            description: 'Official Google product certifications',
            logo: '🔍',
            url: 'https://skillshop.google.com',
            categories: ['Google Ads', 'Analytics', 'Cloud', 'Marketing'],
            color: 'from-green-500 to-emerald-500'
        },
        {
            id: 4,
            name: 'AWS Training',
            description: 'Amazon Web Services cloud certifications',
            logo: '☁️',
            url: 'https://aws.amazon.com/training',
            categories: ['Cloud Architecture', 'DevOps', 'Security', 'ML'],
            color: 'from-orange-500 to-amber-500'
        },
        {
            id: 5,
            name: 'Microsoft Learn',
            description: 'Azure, Microsoft 365, and developer certifications',
            logo: '💼',
            url: 'https://learn.microsoft.com',
            categories: ['Azure', 'Power Platform', '.NET', 'Security'],
            color: 'from-cyan-500 to-blue-500'
        },
        {
            id: 6,
            name: 'LinkedIn Learning',
            description: 'Professional skills and career development',
            logo: '💡',
            url: 'https://www.linkedin.com/learning',
            categories: ['Business', 'Technology', 'Creative', 'Leadership'],
            color: 'from-blue-600 to-blue-700'
        },
        {
            id: 7,
            name: 'edX',
            description: 'University-level courses from Harvard, MIT, and more',
            logo: '🏛️',
            url: 'https://www.edx.org',
            categories: ['Computer Science', 'Data Science', 'Business', 'Humanities'],
            color: 'from-red-500 to-rose-600'
        },
        {
            id: 8,
            name: 'freeCodeCamp',
            description: 'Free coding bootcamp with verified certifications',
            logo: '🔥',
            url: 'https://www.freecodecamp.org',
            categories: ['Web Development', 'JavaScript', 'Python', 'APIs'],
            color: 'from-green-600 to-green-700'
        },
        {
            id: 9,
            name: 'Codecademy',
            description: 'Interactive coding courses and career paths',
            logo: '💻',
            url: 'https://www.codecademy.com',
            categories: ['Programming', 'Web Dev', 'Data Science', 'Cybersecurity'],
            color: 'from-indigo-500 to-violet-500'
        },
        {
            id: 10,
            name: 'HackerRank',
            description: 'Skill verification and coding certificates',
            logo: '🏆',
            url: 'https://www.hackerrank.com',
            categories: ['Problem Solving', 'Languages', 'Frameworks', 'SQL'],
            color: 'from-emerald-500 to-teal-500'
        },
        {
            id: 11,
            name: 'Udacity',
            description: 'Nanodegree programs in tech and business',
            logo: '🚀',
            url: 'https://www.udacity.com',
            categories: ['AI', 'Data Science', 'Cloud', 'Programming'],
            color: 'from-cyan- to-purple-600'
        },
        {
            id: 12,
            name: 'Simplilearn',
            description: 'Professional certification training programs',
            logo: '📖',
            url: 'https://www.simplilearn.com',
            categories: ['Project Management', 'Cyber Security', 'Cloud', 'AI/ML'],
            color: 'from-blue-400 to-cyan-500'
        }
    ];

    const categories = [
        { id: 'all', name: 'All' },
        { id: 'programming', name: 'Programming' },
        { id: 'cloud', name: 'Cloud' },
        { id: 'data-science', name: 'Data Science' },
        { id: 'web-dev', name: 'Web Development' },
        { id: 'cybersecurity', name: 'Cybersecurity' },
        { id: 'other', name: 'Other' }
    ];

    const handleUpload = (e) => {
        e.preventDefault();
        if (!uploadForm.name || !uploadForm.platform) return;

        const newCert = {
            id: Date.now(),
            ...uploadForm
        };
        setCertificates([newCert, ...certificates]);
        setUploadForm({
            name: '',
            platform: '',
            issueDate: '',
            credentialId: '',
            credentialUrl: '',
            category: 'programming',
            image: null
        });
        setShowUploadModal(false);
    };

    const handleDelete = (id) => {
        setCertificates(certificates.filter(c => c.id !== id));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadForm({ ...uploadForm, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredCertificates = certificates.filter(cert => {
        const matchesSearch = cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cert.platform.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || cert.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden font-sans selection:bg-cyan-500/30">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-amber-600/20 rounded-full blur-[80px] animate-float" />
                <div className="absolute bottom-[10%] right-[10%] w-[700px] h-[700px] bg-cyan-500/15 rounded-full blur-[80px] animate-float-reverse" />
                <div className="absolute top-1/2 right-[5%] w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[70px] animate-pulse-slow" />
            </div>

            {/* Grid Background */}
            <div
                className="fixed inset-0 w-full h-full opacity-30 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(251, 191, 36, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(251, 191, 36, 0.02) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                }}
            />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[var(--bg-primary)]/70 backdrop-blur-[30px] border-b border-amber-500/20 shadow-[0_10px_40px_rgba(251,191,36,0.15)]">
                <div className="max-w-[1400px] mx-auto px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all duration-300 hover:scale-110"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                                <Award className="w-6 h-6 text-[var(--text-primary)]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
                                    Certificates
                                </h1>
                                <p className="text-xs text-amber-300/70">Showcase Your Achievements</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-[var(--bg-primary)]/80 px-5 py-2 rounded-2xl border border-amber-500/20">
                            <GraduationCap className="w-5 h-5 text-amber-400" />
                            <span className="text-[var(--text-primary)] font-bold">{certificates.length}</span>
                            <span className="text-[var(--text-secondary)] text-sm">Certificates</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-8 py-10 relative z-10">
                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8">
                    {[
                        { id: 'my-certificates', label: 'My Certificates', icon: FileText },
                        { id: 'platforms', label: 'Get Certified', icon: GraduationCap },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-[var(--text-primary)] shadow-[0_10px_40px_rgba(251,191,36,0.4)]'
                                : 'bg-[var(--bg-primary)]/80 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* My Certificates Tab */}
                {activeTab === 'my-certificates' && (
                    <div>
                        {/* Search and Filter Bar */}
                        <div className="flex flex-wrap gap-4 mb-8">
                            <div className="flex-1 min-w-[300px] relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                                <input
                                    type="text"
                                    placeholder="Search certificates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] text-[var(--text-primary)] placeholder-slate-500 focus:border-amber-500/50 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-[var(--text-secondary)]" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-4 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] text-[var(--text-primary)] focus:border-amber-500/50 focus:outline-none transition-all cursor-pointer"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-[var(--text-primary)] font-bold hover:shadow-[0_10px_40px_rgba(251,191,36,0.4)] transition-all hover:scale-105"
                            >
                                <Plus className="w-5 h-5" />
                                Add Certificate
                            </button>
                        </div>

                        {/* Certificates Grid */}
                        {filteredCertificates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCertificates.map((cert, idx) => (
                                    <div
                                        key={cert.id}
                                        className="group bg-gradient-to-br /90 /70 rounded-2xl border border-amber-500/20 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/50 hover:shadow-[0_20px_50px_rgba(251,191,36,0.2)]"
                                        style={{ animationDelay: `${idx * 0.1}s` }}
                                    >
                                        {/* Certificate Preview */}
                                        <div className="relative h-40 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 flex items-center justify-center">
                                            {cert.image ? (
                                                <img src={cert.image} alt={cert.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Award className="w-16 h-16 text-amber-500/50" />
                                            )}
                                            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                                                {cert.platform}
                                            </div>
                                        </div>

                                        {/* Certificate Info */}
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-2">{cert.name}</h3>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Issued: {cert.issueDate || 'N/A'}</span>
                                                </div>
                                                {cert.credentialId && (
                                                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                                        <Link2 className="w-4 h-4" />
                                                        <span className="font-mono text-xs">{cert.credentialId}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                {cert.credentialUrl && (
                                                    <a
                                                        href={cert.credentialUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-500/20 text-amber-400 font-semibold hover:bg-amber-500/30 transition-all text-sm"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Verify
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(cert.id)}
                                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <Award className="w-20 h-20 text-[var(--text-primary)] mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-[var(--text-secondary)] mb-2">No certificates yet</h3>
                                <p className="text-[var(--text-muted)] mb-6">Start by adding your first certificate!</p>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-[var(--text-primary)] font-bold hover:shadow-[0_10px_40px_rgba(251,191,36,0.4)] transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Your First Certificate
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Platforms Tab */}
                {activeTab === 'platforms' && (
                    <div>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">🎓 Popular Certification Platforms</h2>
                            <p className="text-[var(--text-secondary)]">Complete courses and earn verified certificates from these trusted platforms</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {platforms.map((platform, idx) => (
                                <a
                                    key={platform.id}
                                    href={platform.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group bg-gradient-to-br /90 /70 rounded-2xl p-6 border border-[var(--border-color)] transition-all duration-500 hover:-translate-y-3 hover:border-amber-500/50 hover:shadow-[0_30px_60px_rgba(251,191,36,0.2)] block"
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    {/* Platform Header */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                                            {platform.logo}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-amber-400 transition-colors">
                                                {platform.name}
                                            </h3>
                                            <div className="flex items-center gap-1 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink className="w-3 h-3" />
                                                <span className="text-xs">Visit</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{platform.description}</p>

                                    {/* Categories */}
                                    <div className="flex flex-wrap gap-2">
                                        {platform.categories.slice(0, 3).map((cat, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                        {platform.categories.length > 3 && (
                                            <span className="px-2 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs">
                                                +{platform.categories.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg-secondary)]lack/80 backdrop-blur-sm p-4"
                    onClick={() => setShowUploadModal(false)}
                >
                    <div
                        className="bg-gradient-to-br   rounded-3xl p-8 max-w-lg w-full border border-amber-500/30 shadow-[0_30px_100px_rgba(251,191,36,0.3)] max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Add Certificate</h2>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-5">
                            {/* Certificate Name */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                    Certificate Name *
                                </label>
                                <input
                                    type="text"
                                    value={uploadForm.name}
                                    onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                                    placeholder="e.g., Python for Data Science"
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-slate-500 focus:border-amber-500/50 focus:outline-none transition-all"
                                    required
                                />
                            </div>

                            {/* Platform */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                    Platform *
                                </label>
                                <input
                                    type="text"
                                    value={uploadForm.platform}
                                    onChange={(e) => setUploadForm({ ...uploadForm, platform: e.target.value })}
                                    placeholder="e.g., Coursera, Udemy, Google"
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-slate-500 focus:border-amber-500/50 focus:outline-none transition-all"
                                    required
                                />
                            </div>

                            {/* Issue Date */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                    Issue Date
                                </label>
                                <input
                                    type="date"
                                    value={uploadForm.issueDate}
                                    onChange={(e) => setUploadForm({ ...uploadForm, issueDate: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-amber-500/50 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Credential ID */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                    Credential ID
                                </label>
                                <input
                                    type="text"
                                    value={uploadForm.credentialId}
                                    onChange={(e) => setUploadForm({ ...uploadForm, credentialId: e.target.value })}
                                    placeholder="e.g., ABC123XYZ"
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-slate-500 focus:border-amber-500/50 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Credential URL */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                    Verification URL
                                </label>
                                <input
                                    type="url"
                                    value={uploadForm.credentialUrl}
                                    onChange={(e) => setUploadForm({ ...uploadForm, credentialUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-slate-500 focus:border-amber-500/50 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                    Category
                                </label>
                                <select
                                    value={uploadForm.category}
                                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-amber-500/50 focus:outline-none transition-all cursor-pointer"
                                >
                                    {categories.filter(c => c.id !== 'all').map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Certificate Image */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                    Certificate Image (Optional)
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="cert-image"
                                    />
                                    <label
                                        htmlFor="cert-image"
                                        className="flex items-center justify-center gap-3 w-full px-4 py-8 rounded-xl bg-[var(--bg-primary)] border-2 border-dashed border-[var(--border-color)] text-[var(--text-secondary)] hover:border-amber-500/50 hover:text-amber-400 cursor-pointer transition-all"
                                    >
                                        <Upload className="w-6 h-6" />
                                        <span>{uploadForm.image ? 'Image Selected' : 'Click to upload certificate image'}</span>
                                    </label>
                                    {uploadForm.image && (
                                        <img src={uploadForm.image} alt="Preview" className="mt-3 rounded-lg max-h-32 mx-auto" />
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-[var(--text-primary)] font-bold hover:shadow-[0_10px_40px_rgba(251,191,36,0.4)] transition-all hover:scale-[1.02]"
                            >
                                Add Certificate
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                @keyframes float { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(40px, -40px) rotate(8deg); } 50% { transform: translate(-30px, 30px) rotate(-8deg); } 75% { transform: translate(30px, 15px) rotate(5deg); } }
                .animate-float { animation: float 25s ease-in-out infinite; }
                .animate-float-reverse { animation: float 30s ease-in-out infinite reverse; }
                
                @keyframes pulse-slow { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.2; transform: scale(1.15); } }
                .animate-pulse-slow { animation: pulse-slow 20s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
