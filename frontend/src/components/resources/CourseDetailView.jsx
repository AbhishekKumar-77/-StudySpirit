import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BookOpen, PlayCircle, FileText, CheckCircle2, ChevronDown, ChevronUp,
    Sparkles, ArrowRight, Layers, HelpCircle, FileCheck, Award, Zap
} from 'lucide-react';
import ResourceCard from './ResourceCard';

export default function CourseDetailView({ course, onBack, onOpenResource, onSaveToggle, savedResourceIds = [] }) {
    const navigate = useNavigate();
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
    const [expandedTopics, setExpandedTopics] = useState({ 0: true, 1: true, 2: true });

    const resourceTypes = [
        'All', 'Notes', 'Videos', 'PDFs', 'Slides', 'Question Banks', 'Previous Papers', 'Assignments'
    ];

    const toggleTopic = (index) => {
        setExpandedTopics(prev => ({ ...prev, [index]: !prev[index] }));
    };

    // Filter resources by type filter
    const filterResource = (res) => {
        if (selectedTypeFilter === 'All') return true;
        const resType = (res.type || res.resourceType || '').toUpperCase();
        if (selectedTypeFilter === 'Notes') return resType.includes('NOTE');
        if (selectedTypeFilter === 'Videos') return resType.includes('VIDEO');
        if (selectedTypeFilter === 'PDFs') return resType.includes('PDF');
        if (selectedTypeFilter === 'Slides') return resType.includes('SLIDE');
        if (selectedTypeFilter === 'Question Banks') return resType.includes('QUESTION_BANK');
        if (selectedTypeFilter === 'Previous Papers') return resType.includes('PREVIOUS_PAPER');
        if (selectedTypeFilter === 'Assignments') return resType.includes('ASSIGNMENT');
        return true;
    };

    const pythonTopics = [
        {
            title: 'Module 1 — Introduction to Programming',
            resources: [
                { id: 'py-mod-1', title: 'Module 1 — Introduction to Programming & Thinking Like a Programmer', type: 'NOTE', pageCount: 18, readTime: '12 min', verified: true, verificationBadge: 'Official Curriculum' },
                { id: 'py-quiz-1', title: 'Module 1 Practice Quiz — Fundamentals', type: 'QUESTION_BANK', questionCount: 15, verified: true, verificationBadge: 'Self-Assessment' }
            ]
        },
        {
            title: 'Module 2 — Variables',
            resources: [
                { id: 'py-mod-2', title: 'Module 2 — Variables, Objects & Memory Model', type: 'NOTE', pageCount: 16, readTime: '10 min', verified: true, verificationBadge: 'Official Curriculum' },
                { id: 'py-quiz-2', title: 'Module 2 Practice Quiz — Variables', type: 'QUESTION_BANK', questionCount: 15, verified: true, verificationBadge: 'Self-Assessment' }
            ]
        },
        {
            title: 'Module 3 — Data Types',
            resources: [
                { id: 'py-mod-3', title: 'Module 3 — Data Types & Python Collections', type: 'NOTE', pageCount: 22, readTime: '15 min', verified: true, verificationBadge: 'Official Curriculum' },
                { id: 'py-quiz-3', title: 'Module 3 Practice Quiz — Data Types', type: 'QUESTION_BANK', questionCount: 20, verified: true, verificationBadge: 'Self-Assessment' }
            ]
        }
    ];

    return (
        <div className="flex-1 bg-slate-50 text-slate-800 p-6 md:p-8 min-h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-slate-200/60 rounded-full text-slate-600 transition">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#ff5733] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                            {course?.code || 'CSE105'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-500">Enrolled Academic Course</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                        {course?.name || 'Python Programming'}
                    </h1>
                </div>
            </div>

            {/* Course Progress Banner */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    {/* Circular Progress Gauge */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-100"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-[#ff5733]"
                                strokeDasharray={`${course?.progress || 55}, 100`}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-lg font-black text-slate-900">{course?.progress || 55}%</span>
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter">Progress</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Python Curriculum Mastery</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            3 Core Modules organized with detailed & short revision notes
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" /> Module 1 Completed
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-[#ff5733]">Module 2 In Progress</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/quiz', { state: { subject: 'Python Programming', course: 'CSE105' } })}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition shrink-0"
                    >
                        <Zap className="w-4 h-4" />
                        <span>Course Quiz</span>
                    </button>

                    <button
                        onClick={() => {
                            const firstRes = pythonTopics[0]?.resources[0];
                            if (firstRes) onOpenResource(firstRes);
                        }}
                        className="bg-[#ff5733] hover:bg-orange-600 text-white font-bold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md transition shrink-0"
                    >
                        <span>Start Learning</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Resource Type Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
                <span className="text-xs font-bold text-slate-400 mr-2 shrink-0">Filter Resources:</span>
                {resourceTypes.map(t => (
                    <button
                        key={t}
                        onClick={() => setSelectedTypeFilter(t)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                            selectedTypeFilter === t
                                ? 'bg-[#ff5733] text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Topic-Based Organization Accordion */}
            <div className="space-y-6">
                {(course?.topics || pythonTopics).map((topicGroup, index) => {
                    const isExpanded = expandedTopics[index];
                    const filteredResources = topicGroup.resources.filter(filterResource);

                    if (filteredResources.length === 0 && selectedTypeFilter !== 'All') return null;

                    return (
                        <div key={index} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                            {/* Topic Header Accordion Toggle */}
                            <button
                                onClick={() => toggleTopic(index)}
                                className="w-full p-5 bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between transition border-b border-slate-200/60"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-xl bg-orange-100 text-[#ff5733] flex items-center justify-center font-extrabold text-xs">
                                        {index + 1}
                                    </span>
                                    <h3 className="text-base font-extrabold text-slate-900">{topicGroup.title}</h3>
                                    <span className="text-xs text-slate-500 font-medium">({filteredResources.length} Items)</span>
                                </div>

                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                    <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </button>

                            {/* Resource Cards Grid */}
                            {isExpanded && (
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredResources.map((res) => (
                                        <ResourceCard
                                            key={res.id}
                                            resource={{ ...res, courseCode: course?.code || 'CSE105', unit: topicGroup.title }}
                                            onOpen={onOpenResource}
                                            onSaveToggle={onSaveToggle}
                                            isSaved={savedResourceIds.includes(res.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
