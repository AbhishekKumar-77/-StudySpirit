import React, { useState } from 'react';
import { BookOpen, ChevronRight, ChevronDown, Play, Sparkles, Folder, FileText } from 'lucide-react';

export default function TopicPracticeView({ onStartSession }) {
    const [expandedSubjects, setExpandedSubjects] = useState({ 'Python': true });
    const [expandedChapters, setExpandedChapters] = useState({ 'OOP': true });

    const topicTree = [
        {
            subject: "Python Programming",
            chapters: [
                {
                    name: "Basics & Fundamentals",
                    topics: [
                        { name: "Variables & Data Types", questionsCount: 15, mastery: 96 },
                        { name: "Control Flow (if, loops)", questionsCount: 12, mastery: 88 }
                    ]
                },
                {
                    name: "Functions & Modules",
                    topics: [
                        { name: "Function Definitions & Arguments", questionsCount: 18, mastery: 91 },
                        { name: "Lambda & Higher Order Functions", questionsCount: 10, mastery: 72 }
                    ]
                },
                {
                    name: "Object Oriented Programming (OOP)",
                    topics: [
                        { name: "Classes & Objects", questionsCount: 20, mastery: 85 },
                        { name: "Inheritance & Method Overriding", questionsCount: 15, mastery: 64 },
                        { name: "Polymorphism & MRO", questionsCount: 14, mastery: 58 },
                        { name: "Encapsulation & Private Members", questionsCount: 12, mastery: 70 }
                    ]
                },
                {
                    name: "Exception Handling",
                    topics: [
                        { name: "try-except Blocks & Custom Exceptions", questionsCount: 10, mastery: 58 }
                    ]
                }
            ]
        },
        {
            subject: "Database Management Systems (DBMS)",
            chapters: [
                {
                    name: "Relational Concepts",
                    topics: [
                        { name: "ER Model & Relational Algebra", questionsCount: 16, mastery: 78 },
                        { name: "Normalization (1NF to BCNF)", questionsCount: 22, mastery: 62 }
                    ]
                },
                {
                    name: "SQL Queries",
                    topics: [
                        { name: "Basic SELECT & WHERE", questionsCount: 25, mastery: 95 },
                        { name: "SQL Joins (Inner, Left, Outer)", questionsCount: 18, mastery: 68 }
                    ]
                }
            ]
        }
    ];

    const toggleSubject = (sub) => {
        setExpandedSubjects(prev => ({ ...prev, [sub]: !prev[sub] }));
    };

    const toggleChapter = (chap) => {
        setExpandedChapters(prev => ({ ...prev, [chap]: !prev[chap] }));
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-black text-slate-800">Choose a Topic to Practice</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                    Browse courses, subjects, chapters, and topics for targeted practice.
                </p>
            </div>

            <div className="space-y-4">
                {topicTree.map((subItem, sIdx) => {
                    const isSubOpen = expandedSubjects[subItem.subject] !== false;

                    return (
                        <div key={sIdx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Subject Header */}
                            <button 
                                onClick={() => toggleSubject(subItem.subject)}
                                className="w-full p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                        🐍
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800">{subItem.subject}</h3>
                                </div>
                                {isSubOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                            </button>

                            {/* Chapters & Topics list */}
                            {isSubOpen && (
                                <div className="p-4 space-y-4">
                                    {subItem.chapters.map((chap, cIdx) => {
                                        const isChapOpen = expandedChapters[chap.name] !== false;

                                        return (
                                            <div key={cIdx} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                                                <button 
                                                    onClick={() => toggleChapter(chap.name)}
                                                    className="w-full flex items-center justify-between text-xs font-bold text-slate-700 py-1"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Folder className="w-4 h-4 text-indigo-500" />
                                                        <span>{chap.name}</span>
                                                    </div>
                                                    {isChapOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                                                </button>

                                                {isChapOpen && (
                                                    <div className="mt-3 pl-6 space-y-2 border-l-2 border-slate-200 ml-2">
                                                        {chap.topics.map((top, tIdx) => (
                                                            <div 
                                                                key={tIdx} 
                                                                className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all"
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                                    <div>
                                                                        <p className="text-xs font-semibold text-slate-800">{top.name}</p>
                                                                        <p className="text-[10px] text-slate-400">{top.questionsCount} Questions available</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-4">
                                                                    <div className="text-right">
                                                                        <span className="text-[10px] font-bold text-indigo-600">{top.mastery}% Mastery</span>
                                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                                                                            <div style={{ width: `${top.mastery}%` }} className="h-full bg-indigo-600 rounded-full" />
                                                                        </div>
                                                                    </div>

                                                                    <button 
                                                                        onClick={() => onStartSession({
                                                                            mode: 'topic',
                                                                            topic: top.name,
                                                                            subject: subItem.subject
                                                                        })}
                                                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1"
                                                                    >
                                                                        <Play className="w-3 h-3 fill-current" />
                                                                        Practice
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
