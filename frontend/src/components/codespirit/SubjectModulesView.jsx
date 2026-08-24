import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Folder, Play } from 'lucide-react';

export default function SubjectModulesView({ selectedSubject, dashboardData, onStartPractice }) {
    // Subject curricula definitions
    const subjectCurricula = {
        python: {
            title: "Python Programming",
            icon: "🐍",
            modules: [
                {
                    id: 'm1',
                    name: "Module 1 : Introduction to Programming",
                    topics: [
                        { id: 't1_1', name: "Module 1 : Introduction to Python & Syntax", totalQuestions: 20, solved: 0 },
                        { id: 't1_2', name: "Module 1 : Basic Input & Output Operations", totalQuestions: 20, solved: 0 }
                    ]
                },
                {
                    id: 'm2',
                    name: "Module 2 : Variables & Core Concepts",
                    topics: [
                        { id: 't2_1', name: "Module 2 : Variables & Type Conversion", totalQuestions: 20, solved: 0 },
                        { id: 't2_2', name: "Module 2 : Data Types & Operators", totalQuestions: 20, solved: 0 }
                    ]
                },
                {
                    id: 'm3',
                    name: "Module 3 : Control Flow & Loops",
                    topics: [
                        { id: 't3_1', name: "Module 3 : Conditional Logic & Branching", totalQuestions: 20, solved: 0 },
                        { id: 't3_2', name: "Module 3 : Loops & Iterations", totalQuestions: 20, solved: 0 }
                    ]
                },
                {
                    id: 'm4',
                    name: "Module 4 : Functions & Recursion",
                    topics: [
                        { id: 't4_1', name: "Module 4 : Functions & Arguments", totalQuestions: 20, solved: 0 },
                        { id: 't4_2', name: "Module 4 : Recursion & Scope", totalQuestions: 20, solved: 0 }
                    ]
                }
            ]
        },
        c: {
            title: "C Programming",
            icon: "⚡",
            modules: [
                {
                    id: 'm1',
                    name: "Module 1 : Fundamentals of C",
                    topics: [
                        { id: 't1_1', name: "Module 1 : Basics of C & Compilers", totalQuestions: 20, solved: 0 },
                        { id: 't1_2', name: "Module 1 : Data Types & Format Specifiers", totalQuestions: 20, solved: 0 }
                    ]
                },
                {
                    id: 'm2',
                    name: "Module 2 : Pointers & Memory",
                    topics: [
                        { id: 't2_1', name: "Module 2 : Pointers & Addresses", totalQuestions: 20, solved: 0 },
                        { id: 't2_2', name: "Module 2 : Dynamic Memory Allocation (malloc/calloc)", totalQuestions: 20, solved: 0 }
                    ]
                }
            ]
        },
        cpp: {
            title: "C++ Programming",
            icon: "🔷",
            modules: [
                {
                    id: 'm1',
                    name: "Module 1 : Object Oriented C++",
                    topics: [
                        { id: 't1_1', name: "Module 1 : Classes & Objects", totalQuestions: 20, solved: 0 },
                        { id: 't1_2', name: "Module 1 : Constructors & Inheritance", totalQuestions: 20, solved: 0 }
                    ]
                },
                {
                    id: 'm2',
                    name: "Module 2 : C++ STL Library",
                    topics: [
                        { id: 't2_1', name: "Module 2 : Vectors & Maps", totalQuestions: 20, solved: 0 },
                        { id: 't2_2', name: "Module 2 : Iterators & Algorithms", totalQuestions: 20, solved: 0 }
                    ]
                }
            ]
        },
        java: {
            title: "Java Programming",
            icon: "☕",
            modules: [
                {
                    id: 'm1',
                    name: "Module 1 : Java Fundamentals",
                    topics: [
                        { id: 't1_1', name: "Module 1 : JVM & Basic Syntax", totalQuestions: 20, solved: 0 },
                        { id: 't1_2', name: "Module 1 : Scanner & Console I/O", totalQuestions: 20, solved: 0 }
                    ]
                },
                {
                    id: 'm2',
                    name: "Module 2 : OOP & Collections",
                    topics: [
                        { id: 't2_1', name: "Module 2 : Polymorphism & Interfaces", totalQuestions: 20, solved: 0 },
                        { id: 't2_2', name: "Module 2 : Java Collections Framework", totalQuestions: 20, solved: 0 }
                    ]
                }
            ]
        },
        dsa: {
            title: "Data Structures & Algorithms",
            icon: "🌳",
            modules: [
                {
                    id: 'm1',
                    name: "Module 1 : Linear Data Structures",
                    topics: [
                        { id: 't1_1', name: "Module 1 : Arrays & Hash Maps", totalQuestions: 20, solved: 0 },
                        { id: 't1_2', name: "Module 1 : Linked Lists & Stacks", totalQuestions: 20, solved: 0 }
                    ]
                },
                {
                    id: 'm2',
                    name: "Module 2 : Non-Linear & Advanced",
                    topics: [
                        { id: 't2_1', name: "Module 2 : Binary Trees & BST", totalQuestions: 20, solved: 0 },
                        { id: 't2_2', name: "Module 2 : Graph Traversals (BFS/DFS)", totalQuestions: 20, solved: 0 }
                    ]
                }
            ]
        }
    };

    const currentSubjKey = (selectedSubject || 'python').toLowerCase();
    const currData = subjectCurricula[currentSubjKey] || subjectCurricula.python;

    // Track collapse state for modules
    const [collapsedModules, setCollapsedModules] = useState({});
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

    const toggleModule = (modId) => {
        setCollapsedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
    };

    // Calculate solved questions count from dashboard stats
    const solvedTotal = dashboardData?.subjectStats?.[currentSubjKey]?.solved || 0;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Main Outer Container Card matching Image 2 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
                
                {/* Subject Header Bar */}
                <div 
                    onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                    className="flex items-center justify-between p-6 cursor-pointer bg-slate-50/50 hover:bg-slate-50 border-b border-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl shadow-inner">
                            {currData.icon}
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">{currData.title}</h1>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                        {isHeaderCollapsed ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
                    </button>
                </div>

                {/* Modules List */}
                {!isHeaderCollapsed && (
                    <div className="p-6 space-y-6">
                        {currData.modules.map((mod, modIdx) => {
                            const isCollapsed = collapsedModules[mod.id];
                            return (
                                <div key={mod.id} className="border border-indigo-50 rounded-2xl overflow-hidden bg-slate-50/30">
                                    {/* Module Group Header */}
                                    <div 
                                        onClick={() => toggleModule(mod.id)}
                                        className="flex items-center justify-between p-4 bg-indigo-50/40 cursor-pointer hover:bg-indigo-50/70 transition-colors border-b border-indigo-50"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Folder size={18} className="text-indigo-600" />
                                            <h3 className="font-bold text-sm text-gray-900">{mod.name}</h3>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                                        </button>
                                    </div>

                                    {/* Submodules / Topics */}
                                    {!isCollapsed && (
                                        <div className="p-4 space-y-3 bg-white">
                                            {mod.topics.map((topic, topIdx) => {
                                                const solvedCount = modIdx === 0 && topIdx === 0 ? Math.min(topic.totalQuestions, solvedTotal) : 0;
                                                return (
                                                    <div 
                                                        key={topic.id}
                                                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/60 border border-slate-100 hover:border-indigo-200 transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                                                                <FileText size={18} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                                    {topic.name}
                                                                </h4>
                                                                <p className="text-xs text-gray-400 font-medium">
                                                                    {topic.totalQuestions} Questions available
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            {/* Display Done / Total questions in place of % Mastery */}
                                                            <div className="text-right">
                                                                <span className="text-xs font-bold text-indigo-600 block">
                                                                    {solvedCount} / {topic.totalQuestions} Done
                                                                </span>
                                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                                    <div 
                                                                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                                                        style={{ width: `${Math.round((solvedCount / topic.totalQuestions) * 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Practice Button */}
                                                            <button
                                                                onClick={() => onStartPractice(currentSubjKey, topic.name, 'medium', 5)}
                                                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 transform hover:scale-105 active:scale-95"
                                                            >
                                                                <Play size={13} className="fill-current" />
                                                                <span>Practice</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
