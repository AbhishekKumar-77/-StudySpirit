import React from 'react';
import { BookOpen, Play, CheckCircle2, ChevronRight } from 'lucide-react';

export default function TopicsView({ selectedSubject, onStartPractice }) {
    const topicSyllabus = {
        python: [
            { title: 'Python Fundamentals', desc: 'Variables, Data Types, Type Casting & Input/Output', problems: 15, mastery: 90 },
            { title: 'Control Flow & Loops', desc: 'If-else conditions, For loops, While loops & break/continue', problems: 18, mastery: 85 },
            { title: 'Functions & Modules', desc: 'Parameters, Return values, Lambda functions & Built-in modules', problems: 14, mastery: 76 },
            { title: 'Data Structures (Lists, Tuples, Dicts)', desc: 'List comprehensions, Dictionary methods, Sets & Operations', problems: 25, mastery: 68 },
            { title: 'Object-Oriented Programming', desc: 'Classes, Objects, Inheritance, Encapsulation & Polymorphism', problems: 12, mastery: 64 },
            { title: 'Exception Handling & File I/O', desc: 'Try-except blocks, Custom exceptions & File read/write', problems: 10, mastery: 48 }
        ],
        cpp: [
            { title: 'C++ Basics & Syntax', desc: 'IOSTREAM, Variables, Data Types & Operators', problems: 14, mastery: 88 },
            { title: 'Pointers & Memory Management', desc: 'Pointers, References, Dynamic Memory Allocation (new/delete)', problems: 16, mastery: 72 },
            { title: 'Standard Template Library (STL)', desc: 'Vectors, Maps, Sets, Iterators, Pairs & Algorithms', problems: 30, mastery: 71 },
            { title: 'Object Oriented Programming', desc: 'Classes, Virtual Functions, Abstract Classes & Constructors', problems: 18, mastery: 76 }
        ],
        dsa: [
            { title: 'Arrays & Hashing', desc: 'Static/Dynamic arrays, HashMaps, Frequency counting & Prefix sum', problems: 35, mastery: 84 },
            { title: 'Two Pointers & Sliding Window', desc: 'Subarrays, Substrings, Fast & Slow pointers', problems: 22, mastery: 75 },
            { title: 'Trees & Binary Search Trees', desc: 'Tree traversals, BST operations, Height & Diameter', problems: 28, mastery: 52 },
            { title: 'Graph Algorithms', desc: 'BFS, DFS, Topological sort, Dijkstra & Connected components', problems: 25, mastery: 34 },
            { title: 'Dynamic Programming', desc: '1D/2D DP, Memoization, Tabulation & Knapsack variants', problems: 30, mastery: 28 }
        ],
        java: [
            { title: 'Java Core & JVM Basics', desc: 'Syntax, Data Types, Control Statements & Memory', problems: 15, mastery: 80 },
            { title: 'Object-Oriented Java', desc: 'Classes, Interfaces, Abstract Classes & Packages', problems: 20, mastery: 72 },
            { title: 'Java Collections Framework', desc: 'ArrayList, HashMap, HashSet, Queue & Stack', problems: 24, mastery: 61 }
        ],
        sql: [
            { title: 'Basic SQL Queries', desc: 'SELECT, WHERE, ORDER BY, GROUP BY & HAVING', problems: 12, mastery: 85 },
            { title: 'Joins & Subqueries', desc: 'INNER, LEFT, RIGHT, FULL OUTER JOIN & Correlated Subqueries', problems: 16, mastery: 69 },
            { title: 'Window Functions & Aggregates', desc: 'ROW_NUMBER, RANK, DENSE_RANK & PARTITION BY', problems: 10, mastery: 55 }
        ]
    };

    const activeSyllabus = topicSyllabus[selectedSubject?.toLowerCase()] || topicSyllabus.python;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 capitalize">{selectedSubject} Syllabus & Topics</h2>
                    <p className="text-xs text-gray-500">Structured topic path for mastering {selectedSubject}</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold capitalize">
                    {activeSyllabus.length} Topics Available
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSyllabus.map((t, idx) => (
                    <div
                        key={idx}
                        className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                                    {idx + 1}
                                </div>
                                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                                    {t.mastery}% Mastery
                                </span>
                            </div>

                            <h3 className="font-bold text-base text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                                {t.title}
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">{t.desc}</p>
                        </div>

                        <div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                                <div 
                                    className="h-full bg-purple-600 rounded-full"
                                    style={{ width: `${t.mastery}%` }}
                                />
                            </div>

                            <button
                                onClick={() => onStartPractice(selectedSubject, t.title)}
                                className="w-full py-2.5 rounded-xl bg-purple-50 text-purple-600 font-bold text-xs hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-1"
                            >
                                <Play size={14} className="fill-current" />
                                <span>Practice Topic ({t.problems} Problems)</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
