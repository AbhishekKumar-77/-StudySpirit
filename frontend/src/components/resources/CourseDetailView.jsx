import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BookOpen, PlayCircle, FileText, CheckCircle2, ChevronDown, ChevronUp,
    Sparkles, ArrowRight, Layers, HelpCircle, FileCheck, Award, Zap, Download,
    GraduationCap, Terminal, Code2, Database, ShieldCheck, ListOrdered, BookMarked, X
} from 'lucide-react';
import ResourceCard from './ResourceCard';
import CourseCertificateModal from './CourseCertificateModal';
import { NOSQL_COURSE_INFO } from '../../data/nosqlMongoModulesData';
import { NOSQL_MONGO_ASSESSMENT_QUESTIONS } from '../../data/nosqlMongoQuestions';

export default function CourseDetailView({
    course,
    onBack,
    onOpenResource,
    onSaveToggle,
    savedResourceIds = []
}) {
    const navigate = useNavigate();
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
    const [expandedTopics, setExpandedTopics] = useState({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true });
    const [showOutcomesModal, setShowOutcomesModal] = useState(false);
    const [showCertificateModal, setShowCertificateModal] = useState(false);

    const isMongoCourse = course?.id === 'course-int-nosql' ||
        course?.code === 'INT252' ||
        (course?.name && course.name.toLowerCase().includes('nosql'));

    const effectiveCourse = isMongoCourse ? { ...NOSQL_COURSE_INFO, ...course } : course;

    const resourceTypes = [
        'All', 'Notes', 'Assignments', 'Question Banks', 'Previous Papers', 'PDFs', 'Videos'
    ];

    const toggleTopic = (index) => {
        setExpandedTopics(prev => ({ ...prev, [index]: !prev[index] }));
    };

    // Filter resources by type filter
    const filterResource = (res) => {
        if (selectedTypeFilter === 'All') return true;
        const resType = (res.type || res.resourceType || '').toUpperCase();
        if (selectedTypeFilter === 'Notes') return resType.includes('NOTE');
        if (selectedTypeFilter === 'Assignments' || selectedTypeFilter === 'Practicals') return resType.includes('ASSIGNMENT');
        if (selectedTypeFilter === 'Question Banks') return resType.includes('QUESTION_BANK');
        if (selectedTypeFilter === 'Previous Papers') return resType.includes('PREVIOUS_PAPER');
        if (selectedTypeFilter === 'PDFs') return resType.includes('PDF');
        if (selectedTypeFilter === 'Videos') return resType.includes('VIDEO');
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

    const currentTopics = effectiveCourse?.topics || pythonTopics;

    // Launch Assessment Quiz
    const handleLaunchQuiz = () => {
        if (isMongoCourse) {
            navigate('/quiz', {
                state: {
                    subject: 'Intelligent NoSQL Databases with MongoDB',
                    course: 'INT252',
                    title: 'FINAL ASSESSMENT : INTELLIGENT NOSQL DATABASES',
                    questions: NOSQL_MONGO_ASSESSMENT_QUESTIONS
                }
            });
        } else {
            navigate('/quiz', {
                state: {
                    subject: effectiveCourse?.name || 'Python Programming',
                    course: effectiveCourse?.code || 'CSE105'
                }
            });
        }
    };

    return (
        <div className="flex-1 bg-slate-50 text-slate-800 p-6 md:p-8 min-h-screen overflow-y-auto">
            
            {/* Header Navigation & Course Meta */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-200/70 rounded-full text-slate-600 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                {effectiveCourse?.code || 'INT252'}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-xs font-semibold text-slate-500">
                                {effectiveCourse?.topicTag || 'INTELLIGENT NOSQL DATABASES'}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                ⏱️ {effectiveCourse?.duration || '16 Hours'}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                            {effectiveCourse?.name || 'Intelligent NoSQL Databases with MongoDB'}
                        </h1>
                    </div>
                </div>

                {/* Header Action Badges */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowOutcomesModal(true)}
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
                    >
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <span>Syllabus & Outcomes (CO1–CO6)</span>
                    </button>

                    <button
                        onClick={() => setShowCertificateModal(true)}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition transform hover:scale-105"
                    >
                        <Award className="w-4 h-4" />
                        <span>Generate Certificate</span>
                    </button>
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
                                className={isMongoCourse ? "text-emerald-600" : "text-[#ff5733]"}
                                strokeDasharray={`${effectiveCourse?.progress || 85}, 100`}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-lg font-black text-slate-900">{effectiveCourse?.progress || 85}%</span>
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter">Progress</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {isMongoCourse ? 'NoSQL Database Engineering Mastery' : 'Curriculum Mastery'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {effectiveCourse?.resourceBreakdown || '13 Modules · 9 Practicals · Mini Project · Assessment'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" /> 13 Modules Ready
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="flex items-center gap-1 text-teal-600">
                                <Terminal className="w-4 h-4" /> 9 Practicals Included
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-amber-600 font-bold">16 Hours Academic Workload</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={handleLaunchQuiz}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition"
                    >
                        <Zap className="w-4 h-4" />
                        <span>Course Quiz (20 MCQs)</span>
                    </button>

                    <button
                        onClick={() => {
                            const firstRes = currentTopics[0]?.resources[0];
                            if (firstRes) onOpenResource(firstRes);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md transition"
                    >
                        <span>Start Learning</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Quick Overview Badges for Course Outcomes */}
            {isMongoCourse && (
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 rounded-3xl p-6 border border-emerald-900/60 shadow-lg text-white mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <span className="text-[10px] font-black tracking-wider text-emerald-400 uppercase bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
                                Verified Learning Matrix
                            </span>
                            <h3 className="text-base font-extrabold text-white mt-2">
                                Course Outcomes (CO1 to CO6) Competency Roadmap
                            </h3>
                            <p className="text-xs text-slate-300 mt-0.5">
                                Students demonstrate mastery in non-relational modeling, aggregation pipelines, full-stack integration, and AI analytics.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCertificateModal(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shrink-0"
                        >
                            <Award className="w-4 h-4" />
                            <span>Claim 16-Hour Certificate</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                        {NOSQL_COURSE_INFO.courseOutcomes.map((co) => (
                            <div key={co.code} className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-xs space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded text-[11px] border border-emerald-800/60">
                                        {co.code}
                                    </span>
                                    <span className="font-bold text-slate-100 text-xs truncate">{co.title}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                                    {co.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Resource Type Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
                <span className="text-xs font-bold text-slate-400 mr-2 shrink-0">Filter Materials:</span>
                {resourceTypes.map(t => (
                    <button
                        key={t}
                        onClick={() => setSelectedTypeFilter(t)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                            selectedTypeFilter === t
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Topic-Based Organization Accordion */}
            <div className="space-y-6">
                {currentTopics.map((topicGroup, index) => {
                    const isExpanded = expandedTopics[index] ?? true;
                    const filteredResources = (topicGroup.resources || []).filter(filterResource);

                    if (filteredResources.length === 0 && selectedTypeFilter !== 'All') return null;

                    return (
                        <div key={index} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                            {/* Topic Header Accordion Toggle */}
                            <button
                                onClick={() => toggleTopic(index)}
                                className="w-full p-5 bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between transition border-b border-slate-200/60 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                                        isMongoCourse ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-[#ff5733]'
                                    }`}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                                            {topicGroup.title}
                                        </h3>
                                        <span className="text-xs text-slate-500 font-medium">
                                            {filteredResources.length} Items Available
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold shrink-0">
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
                                            resource={{
                                                ...res,
                                                courseCode: effectiveCourse?.code || 'INT252',
                                                unit: topicGroup.title
                                            }}
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

            {/* Academic References Footer */}
            {isMongoCourse && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs mt-8">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                        <BookMarked className="w-4 h-4 text-emerald-600" />
                        <span>Recommended Academic Textbooks & References</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                        {NOSQL_COURSE_INFO.references.map((ref, idx) => (
                            <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                                <span className="font-bold text-slate-900 block">{idx + 1}. {ref.title}</span>
                                <p className="text-slate-500 text-[11px]">By {ref.authors}</p>
                                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                    {ref.publisher}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Course Outcomes & Syllabus Detailed Modal */}
            {showOutcomesModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                                    🎓
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">
                                        Academic Curriculum & Course Outcomes (CO)
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Intelligent NoSQL Databases with MongoDB (INT252) — 16 Hours
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowOutcomesModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Outcomes List */}
                        <div className="space-y-4 mb-8">
                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800">
                                Program Learning Outcomes:
                            </h4>
                            {NOSQL_COURSE_INFO.courseOutcomes.map((co) => (
                                <div key={co.code} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                                    <span className="font-mono font-black text-xs text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md shrink-0">
                                        {co.code}
                                    </span>
                                    <div>
                                        <h5 className="text-xs font-bold text-slate-900">{co.title}</h5>
                                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{co.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 6 Units Breakdown */}
                        <div className="space-y-3 mb-6">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                6 Academic Syllabus Units (16 Hours Total):
                            </h4>
                            {NOSQL_COURSE_INFO.units.map((u) => (
                                <div key={u.unit} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-slate-900">{u.unit}: {u.title}</span>
                                        <p className="text-[11px] text-slate-500">{u.summary}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 block">
                                            {u.hours}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">{u.co}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-end">
                            <button
                                onClick={() => setShowOutcomesModal(false)}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Official 16-Hour Course Certificate Generator Modal */}
            {showCertificateModal && (
                <CourseCertificateModal
                    course={effectiveCourse}
                    studentName="Abhishek Kumar"
                    onClose={() => setShowCertificateModal(false)}
                />
            )}
        </div>
    );
}
