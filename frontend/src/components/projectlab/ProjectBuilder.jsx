import React, { useState } from 'react';
import {
    ArrowLeft, ArrowRight, CheckCircle2, Sparkles, FolderGit2,
    Github, Globe, Layers, Users, ShieldCheck, FileText, Plus, X,
    Loader2, AlertTriangle, Eye, Video, Image, Link, Code
} from 'lucide-react';
import projectApi from '../../services/projectApi';

const STEPS = [
    { id: 'basics', label: 'Basics' },
    { id: 'story', label: 'Story' },
    { id: 'tech', label: 'Technology' },
    { id: 'team', label: 'Team' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'review', label: 'AI Review' },
    { id: 'publish', label: 'Publish' }
];

const PROJECT_TYPES = [
    'Personal', 'Academic', 'Hackathon', 'Capstone', 'Team',
    'Open Source', 'Freelance', 'Research', 'Startup', 'Other'
];

const DOMAINS = [
    'AI / ML', 'Web Development', 'Mobile', 'Cloud', 'Cybersecurity',
    'Data Science', 'Blockchain', 'IoT', 'DevOps', 'Game Development', 'Other'
];

const CONTRIBUTION_ROLES = [
    'Frontend', 'Backend', 'Database', 'AI / ML', 'DevOps',
    'UI / UX', 'Research', 'Project Management', 'System Architecture'
];

export default function ProjectBuilder({ projectData = null, onCancel, onSuccess }) {
    const isEditing = Boolean(projectData?._id);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const [fetchingGithub, setFetchingGithub] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: projectData?.name || '',
        description: projectData?.description || '',
        projectType: projectData?.projectType || 'Personal',
        domain: projectData?.domain || 'Web Development',
        visibility: projectData?.visibility || 'public',

        // Story
        story: {
            problem: projectData?.story?.problem || '',
            solution: projectData?.story?.solution || '',
            implementation: projectData?.story?.implementation || '',
            impact: projectData?.story?.impact || ''
        },

        // Technologies (Structured)
        technologies: projectData?.technologies || [
            { category: 'Frontend', items: [] },
            { category: 'Backend', items: [] },
            { category: 'Database', items: [] },
            { category: 'AI / ML', items: [] }
        ],

        // Legacy flat stack
        techStack: projectData?.techStack || [],

        // Team
        teamMembers: projectData?.teamMembers || [],
        myContribution: {
            roles: projectData?.myContribution?.roles || [],
            description: projectData?.myContribution?.description || ''
        },

        // Evidence
        githubUrl: projectData?.githubUrl || '',
        liveUrl: projectData?.liveUrl || '',
        evidence: {
            screenshots: projectData?.evidence?.screenshots || [],
            demoVideoUrl: projectData?.evidence?.demoVideoUrl || '',
            documentationUrl: projectData?.evidence?.documentationUrl || '',
            presentationUrl: projectData?.evidence?.presentationUrl || '',
            figmaUrl: projectData?.evidence?.figmaUrl || ''
        },

        featured: projectData?.featured || false
    });

    // Temporary inputs
    const [techInputs, setTechInputs] = useState({});
    const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '' });
    const [newScreenshotUrl, setNewScreenshotUrl] = useState('');

    const currentStep = STEPS[currentStepIndex];

    const updateField = (path, value) => {
        setFormData(prev => {
            const keys = path.split('.');
            if (keys.length === 1) return { ...prev, [keys[0]]: value };
            if (keys.length === 2) return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } };
            return prev;
        });
    };

    // GitHub import helper
    const handleFetchGithub = async () => {
        if (!formData.githubUrl) return;
        setFetchingGithub(true);
        try {
            const res = await projectApi.importGithub(projectData?._id || 'preview', formData.githubUrl);
            if (res.meta) {
                if (res.meta.name && !formData.name) updateField('name', res.meta.name);
                if (res.meta.description && !formData.description) updateField('description', res.meta.description);
                if (res.meta.topics && res.meta.topics.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        techStack: [...new Set([...prev.techStack, ...res.meta.topics])]
                    }));
                }
            }
        } catch (e) {
            console.error('GitHub import failed:', e);
        } finally {
            setFetchingGithub(false);
        }
    };

    // Tech stack item add/remove
    const addTechItem = (catIndex, techName) => {
        if (!techName.trim()) return;
        setFormData(prev => {
            const updatedTechs = [...prev.technologies];
            if (!updatedTechs[catIndex].items.includes(techName.trim())) {
                updatedTechs[catIndex].items.push(techName.trim());
            }
            return { ...prev, technologies: updatedTechs };
        });
        setTechInputs(prev => ({ ...prev, [catIndex]: '' }));
    };

    const removeTechItem = (catIndex, techName) => {
        setFormData(prev => {
            const updatedTechs = [...prev.technologies];
            updatedTechs[catIndex].items = updatedTechs[catIndex].items.filter(t => t !== techName);
            return { ...prev, technologies: updatedTechs };
        });
    };

    // Team member add/remove
    const addTeamMember = () => {
        if (!newTeamMember.name.trim()) return;
        setFormData(prev => ({
            ...prev,
            teamMembers: [...prev.teamMembers, { ...newTeamMember }]
        }));
        setNewTeamMember({ name: '', role: '' });
    };

    const removeTeamMember = (index) => {
        setFormData(prev => ({
            ...prev,
            teamMembers: prev.teamMembers.filter((_, i) => i !== index)
        }));
    };

    // Contribution roles toggle
    const toggleContributionRole = (role) => {
        setFormData(prev => {
            const currentRoles = prev.myContribution.roles || [];
            const newRoles = currentRoles.includes(role)
                ? currentRoles.filter(r => r !== role)
                : [...currentRoles, role];
            return {
                ...prev,
                myContribution: { ...prev.myContribution, roles: newRoles }
            };
        });
    };

    // Submit / Save
    const handleSave = async () => {
        if (!formData.name.trim()) return alert('Project name is required');
        setSaving(true);
        try {
            let result;
            if (isEditing) {
                result = await projectApi.updateProject(projectData._id, formData);
            } else {
                result = await projectApi.createProject(formData);
            }
            if (onSuccess) onSuccess(result.project);
        } catch (e) {
            alert('Failed to save project: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="font-bold text-slate-900 text-lg">
                            {isEditing ? `Edit "${formData.name}"` : 'Project Builder'}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">Build → Document → Showcase → Get Discovered</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all border border-slate-200"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !formData.name.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all hover:shadow-md hover:shadow-emerald-600/20 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {isEditing ? 'Update Project' : 'Publish Project'}
                    </button>
                </div>
            </header>

            {/* Stepper Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    {STEPS.map((step, idx) => {
                        const isActive = idx === currentStepIndex;
                        const isCompleted = idx < currentStepIndex;
                        return (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStepIndex(idx)}
                                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${isActive
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : isCompleted
                                            ? 'text-slate-700 hover:bg-slate-100'
                                            : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isActive ? 'bg-emerald-600 text-white' : isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {isCompleted ? '✓' : idx + 1}
                                </span>
                                <span>{step.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Form Content */}
            <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6">

                {/* STEP 1: BASICS */}
                {currentStep.id === 'basics' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <h2 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">Project Basics</h2>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Project Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="e.g. StudySpirit AI Learning Platform"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Short Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="A concise 1-2 sentence overview of your project for recruiter cards..."
                                rows={3}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Project Type</label>
                                <select
                                    value={formData.projectType}
                                    onChange={(e) => updateField('projectType', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none"
                                >
                                    {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Domain</label>
                                <select
                                    value={formData.domain}
                                    onChange={(e) => updateField('domain', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none"
                                >
                                    {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Visibility</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                    { id: 'public', label: '🌐 Public', desc: 'Visible to everyone' },
                                    { id: 'recruiter-only', label: '💼 Recruiter Only', desc: 'Visible to verified recruiters' },
                                    { id: 'institution-only', label: '🎓 Institution Only', desc: 'Visible to teachers & classmates' },
                                    { id: 'private', label: '🔒 Private', desc: 'Visible only to you' }
                                ].map(vis => (
                                    <button
                                        key={vis.id}
                                        type="button"
                                        onClick={() => updateField('visibility', vis.id)}
                                        className={`p-3 rounded-xl border text-left transition-all ${formData.visibility === vis.id
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className="font-bold text-xs">{vis.label}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">{vis.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: STORY */}
                {currentStep.id === 'story' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="font-bold text-slate-900 text-lg">Project Storytelling</h2>
                            <p className="text-xs text-slate-500">
                                Structured storytelling makes your project clear and memorable for recruiters.
                            </p>
                        </div>

                        {[
                            { key: 'problem', label: 'What problem were you solving?', placeholder: 'Describe the challenge, pain point, or gap this project addresses...' },
                            { key: 'solution', label: 'What did you build?', placeholder: 'Describe your core application features and architectural solution...' },
                            { key: 'implementation', label: 'How did you solve it?', placeholder: 'Explain the technical choices, algorithms, APIs, database schemas used...' },
                            { key: 'impact', label: 'What was the outcome?', placeholder: 'Share quantifiable results, user feedback, performance gains, or learning outcomes...' }
                        ].map((field) => (
                            <div key={field.key}>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">{field.label}</label>
                                <textarea
                                    value={formData.story[field.key]}
                                    onChange={(e) => updateField(`story.${field.key}`, e.target.value)}
                                    placeholder={field.placeholder}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all resize-none"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* STEP 3: TECH */}
                {currentStep.id === 'tech' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="font-bold text-slate-900 text-lg">Structured Technology Data</h2>
                            <p className="text-xs text-slate-500">
                                Categorized technologies become searchable metadata for recruiters filtering candidate projects.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {formData.technologies.map((cat, cIdx) => (
                                <div key={cIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                    <h4 className="font-bold text-slate-800 text-xs">{cat.category}</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {cat.items.map((tech, tIdx) => (
                                            <span key={tIdx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
                                                {tech}
                                                <button onClick={() => removeTechItem(cIdx, tech)} className="text-slate-400 hover:text-red-500">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <input
                                            type="text"
                                            value={techInputs[cIdx] || ''}
                                            onChange={(e) => setTechInputs({ ...techInputs, [cIdx]: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechItem(cIdx, techInputs[cIdx] || ''))}
                                            placeholder={`Add ${cat.category} technology (e.g. ${cIdx === 0 ? 'React' : cIdx === 1 ? 'Node.js' : 'MongoDB'})...`}
                                            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addTechItem(cIdx, techInputs[cIdx] || '')}
                                            className="px-3 py-1.5 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 4: TEAM */}
                {currentStep.id === 'team' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="font-bold text-slate-900 text-lg">Team & Your Personal Contribution</h2>
                            <p className="text-xs text-slate-500">
                                Recruiters need to know what you specifically built versus what your teammates worked on.
                            </p>
                        </div>

                        {/* Owner Contribution Roles */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">Select Your Roles & Contributions</label>
                            <div className="flex flex-wrap gap-2">
                                {CONTRIBUTION_ROLES.map((role) => {
                                    const isSelected = formData.myContribution.roles?.includes(role);
                                    return (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => toggleContributionRole(role)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${isSelected
                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            {isSelected && '✓ '} {role}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Contribution Details</label>
                            <textarea
                                value={formData.myContribution.description}
                                onChange={(e) => updateField('myContribution.description', e.target.value)}
                                placeholder="Detail your individual responsibilities, code modules written, backend endpoints built, or UI components created..."
                                rows={3}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Team Members List */}
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                            <label className="block text-xs font-bold text-slate-700">Team Collaborators (Optional)</label>
                            {formData.teamMembers.length > 0 && (
                                <div className="space-y-1.5">
                                    {formData.teamMembers.map((member, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                            <div>
                                                <span className="font-bold text-slate-900">{member.name}</span>
                                                <span className="text-slate-500 ml-2">({member.role})</span>
                                            </div>
                                            <button onClick={() => removeTeamMember(idx)} className="text-slate-400 hover:text-red-500">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTeamMember.name}
                                    onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                                    placeholder="Teammate Name (e.g. Rahul Sharma)"
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                                />
                                <input
                                    type="text"
                                    value={newTeamMember.role}
                                    onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                                    placeholder="Role (e.g. Frontend)"
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={addTeamMember}
                                    className="px-4 py-2 bg-slate-800 text-white font-semibold text-xs rounded-xl hover:bg-slate-900"
                                >
                                    Add Teammate
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5: EVIDENCE */}
                {currentStep.id === 'evidence' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="font-bold text-slate-900 text-lg">Project Technical Evidence</h2>
                            <p className="text-xs text-slate-500">
                                Connect code repos, live demos, architecture docs, and design links to increase evidence strength.
                            </p>
                        </div>

                        {/* GitHub */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                                <span>GitHub Repository URL</span>
                                {formData.githubUrl && (
                                    <button
                                        type="button"
                                        onClick={handleFetchGithub}
                                        disabled={fetchingGithub}
                                        className="text-emerald-600 hover:underline flex items-center gap-1"
                                    >
                                        {fetchingGithub ? <Loader2 className="w-3 h-3 animate-spin" /> : <Github className="w-3 h-3" />}
                                        Fetch Repo Metadata
                                    </button>
                                )}
                            </label>
                            <input
                                type="url"
                                value={formData.githubUrl}
                                onChange={(e) => updateField('githubUrl', e.target.value)}
                                placeholder="https://github.com/username/repository"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>

                        {/* Live Demo */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Live Demo URL</label>
                            <input
                                type="url"
                                value={formData.liveUrl}
                                onChange={(e) => updateField('liveUrl', e.target.value)}
                                placeholder="https://my-app.vercel.app"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>

                        {/* Documentation / Figma / Video */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Documentation URL</label>
                                <input
                                    type="url"
                                    value={formData.evidence.documentationUrl}
                                    onChange={(e) => updateField('evidence.documentationUrl', e.target.value)}
                                    placeholder="https://docs.myproject.com or Notion link"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Figma Design Link</label>
                                <input
                                    type="url"
                                    value={formData.evidence.figmaUrl}
                                    onChange={(e) => updateField('evidence.figmaUrl', e.target.value)}
                                    placeholder="https://figma.com/file/..."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 6: REVIEW */}
                {currentStep.id === 'review' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <h2 className="font-bold text-slate-900 text-lg">AI Evidence Review & Strength Calculation</h2>
                            <p className="text-xs text-slate-500">
                                Here is how recruiters will evaluate your project evidence completeness.
                            </p>
                        </div>
                    </div>
                )}

                {/* STEP 7: PUBLISH */}
                {currentStep.id === 'publish' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h2 className="font-bold text-slate-900 text-xl">Ready to Publish</h2>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Your project is ready to be showcased on your StudySpirit Portfolio and discoverable by recruiters.
                        </p>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4">
                    <button
                        type="button"
                        onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentStepIndex === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
                    >
                        <ArrowLeft className="w-4 h-4" /> Previous Step
                    </button>

                    {currentStepIndex < STEPS.length - 1 ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStepIndex(prev => Math.min(STEPS.length - 1, prev + 1))}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-md hover:shadow-emerald-600/20"
                        >
                            Next Step <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-emerald-600/30"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Publish Now
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}
