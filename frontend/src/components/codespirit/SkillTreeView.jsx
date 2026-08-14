import React from 'react';
import { BarChart2, CheckCircle2, Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function SkillTreeView({ selectedSubject, onStartPractice }) {
    const skillTrees = {
        python: [
            { name: 'Basics & Syntax', mastery: 90, status: 'completed', desc: 'Variables, Types, IO' },
            { name: 'Control Flow', mastery: 85, status: 'completed', desc: 'If-else, loops' },
            { name: 'Functions & Modules', mastery: 76, status: 'active', desc: 'Def, Lambda, Scope' },
            { name: 'Object-Oriented Python', mastery: 64, status: 'active', desc: 'Classes & Inheritance' },
            { name: 'Exceptions & File I/O', mastery: 48, status: 'weak', desc: 'Try-except & Files' }
        ],
        cpp: [
            { name: 'C++ Fundamentals', mastery: 80, status: 'completed', desc: 'IOSTREAM & Primitive Types' },
            { name: 'Pointers & References', mastery: 74, status: 'active', desc: 'Memory pointers' },
            { name: 'Standard Template Library (STL)', mastery: 71, status: 'active', desc: 'Vectors, Maps, Sets' },
            { name: 'OOP Concepts', mastery: 76, status: 'active', desc: 'Virtual Functions' }
        ],
        dsa: [
            { name: 'Arrays & Hashing', mastery: 84, status: 'completed', desc: 'Static & Dynamic Arrays' },
            { name: 'Trees & BST', mastery: 52, status: 'active', desc: 'Binary Search Trees' },
            { name: 'Graphs & BFS/DFS', mastery: 34, status: 'weak', desc: 'Graph Traversals' }
        ]
    };

    const tree = skillTrees[selectedSubject?.toLowerCase()] || skillTrees.python;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 capitalize">{selectedSubject} Skill Tree</h2>
                    <p className="text-xs text-gray-500">Visual progress path for {selectedSubject} mastery</p>
                </div>
            </div>

            <div className="relative pl-6 border-l-2 border-purple-200 space-y-6">
                {tree.map((node, i) => (
                    <div key={i} className="relative group">
                        <div className={`absolute -left-[31px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            node.status === 'completed' ? 'bg-emerald-500 text-white' :
                            node.status === 'active' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                            {i + 1}
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-base text-gray-900">{node.name}</h3>
                                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                                        {node.mastery}%
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">{node.desc}</p>
                            </div>

                            <button
                                onClick={() => onStartPractice(selectedSubject, node.name)}
                                className="px-4 py-2 rounded-xl bg-purple-50 text-purple-600 font-bold text-xs hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1 shrink-0"
                            >
                                <span>Practice Node</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
