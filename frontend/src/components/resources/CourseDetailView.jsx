import React, { useState } from 'react';
import {
    ArrowLeft, BookOpen, PlayCircle, FileText, CheckCircle2, ChevronDown, ChevronUp,
    Sparkles, ArrowRight, Layers, HelpCircle, FileCheck, Award
} from 'lucide-react';
import ResourceCard from './ResourceCard';

export default function CourseDetailView({ course, onBack, onOpenResource, onSaveToggle, savedResourceIds = [] }) {
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
    const [expandedTopics, setExpandedTopics] = useState({ 0: true, 1: true, 2: true, 3: true });

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

    return (
        <div className="flex-1 bg-slate-50 text-slate-800 p-6 md:p-8 min-h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-slate-200/60 rounded-full text-slate-600 transition">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                            {course?.code || 'CSE101'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-500">Enrolled Academic Course</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                        {course?.name || 'Database Management Systems'}
                    </h1>
                </div>
            </div>

            {/* Course Progress Banner */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
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
                                className="text-purple-600"
                                strokeDasharray={`${course?.progress || 68}, 100`}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-lg font-black text-slate-900">{course?.progress || 68}%</span>
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter">Progress</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Course Resource Mastery</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {course?.resourceCount || 24} Verified Resources organized by Units & Topics
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" /> Unit 1 & 2 Completed
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-purple-600">Unit 3 In Progress (72%)</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        const firstRes = course?.topics?.[0]?.resources?.[0];
                        if (firstRes) onOpenResource(firstRes);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-500/25 transition shrink-0"
                >
                    <span>Continue Learning</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
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
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Topic-Based Organization Accordion */}
            <div className="space-y-6">
                {(course?.topics || [
                    {
                        title: '01 Introduction',
                        resources: [
                            { id: 'c1-r1', title: 'DBMS Introduction & Architecture Notes', type: 'PDF', pageCount: 16, readTime: '5 min', verified: true },
                            { id: 'c1-r2', title: 'Introduction to DBMS Lecture', type: 'VIDEO', duration: '22:15', uploadedBy: 'Prof. Sharma', verified: true },
                            { id: 'c1-r3', title: 'DBMS Fundamentals Practice Questions', type: 'QUESTION_BANK', questionCount: 25, verified: true }
                        ]
                    },
                    {
                        title: '02 ER Model',
                        resources: [
                            { id: 'c2-r1', title: 'Entity-Relationship Model Complete Notes', type: 'PDF', pageCount: 20, readTime: '7 min', verified: true },
                            { id: 'c2-r2', title: 'ER Diagram Design & Cardinality Lecture', type: 'VIDEO', duration: '28:40', uploadedBy: 'Prof. Sharma', verified: true },
                            { id: 'c2-r3', title: 'ER Diagram Practice Question Bank', type: 'QUESTION_BANK', questionCount: 30, verified: true }
                        ]
                    },
                    {
                        title: '03 Normalization',
                        resources: [
                            { id: 'c3-r1', title: 'Database Normalization Notes (1NF to BCNF)', type: 'PDF', pageCount: 24, readTime: '8 min', verified: true },
                            { id: 'c3-r2', title: 'Understanding 1NF, 2NF & 3NF Lecture', type: 'VIDEO', duration: '18:42', uploadedBy: 'Prof. Sharma', verified: true },
                            { id: 'c3-r3', title: 'Functional Dependency & Normalization Practice', type: 'QUESTION_BANK', questionCount: 40, verified: true },
                            { id: 'c3-r4', title: 'Normalization Previous Exam Questions (2020-2025)', type: 'PREVIOUS_PAPER', pageCount: 12, verified: true }
                        ]
                    },
                    {
                        title: '04 NoSQL & Transaction Management',
                        resources: [
                            { id: 'c4-r1', title: 'MongoDB & NoSQL Architecture Notes', type: 'PDF', pageCount: 18, readTime: '6 min', verified: true },
                            { id: 'c4-r2', title: 'CAP Theorem & Distributed Databases', type: 'VIDEO', duration: '19:10', uploadedBy: 'Prof. Singh', verified: true },
                            { id: 'c4-r3', title: 'ACID Properties & Concurrency Control Practice', type: 'QUESTION_BANK', questionCount: 35, verified: true }
                        ]
                    }
                ]).map((topicGroup, index) => {
                    const isExpanded = expandedTopics[index];
                    const filteredResources = topicGroup.resources.filter(filterResource);

                    if (filteredResources.length === 0 && selectedTypeFilter !== 'All') return null;

                    return (
                        <div key={index} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Topic Header Accordion Toggle */}
                            <button
                                onClick={() => toggleTopic(index)}
                                className="w-full p-5 bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between transition border-b border-slate-200/60"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                                        {index + 1}
                                    </span>
                                    <h3 className="text-base font-extrabold text-slate-900">{topicGroup.title}</h3>
                                    <span className="text-xs text-slate-500 font-medium">({filteredResources.length} Resources)</span>
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
                                            resource={{ ...res, courseCode: course?.code || 'CSE101', unit: topicGroup.title }}
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
