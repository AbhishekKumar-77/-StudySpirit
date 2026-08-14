import React, { useState } from 'react';
import { Search, Filter, Sparkles, ChevronRight, CheckCircle, Code } from 'lucide-react';

export default function ProblemsView({ selectedSubject, onOpenProblem }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const sampleProblems = [
        { id: 'p1', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays & Hashing', acceptance: '49.2%', status: 'solved', subject: 'python' },
        { id: 'p2', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stacks', acceptance: '40.3%', status: 'solved', subject: 'python' },
        { id: 'p3', title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked Lists', acceptance: '62.1%', status: 'unsolved', subject: 'cpp' },
        { id: 'p4', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Sliding Window', acceptance: '33.8%', status: 'unsolved', subject: 'dsa' },
        { id: 'p5', title: 'Container With Most Water', difficulty: 'Medium', topic: 'Two Pointers', acceptance: '54.1%', status: 'unsolved', subject: 'java' },
        { id: 'p6', title: '3Sum', difficulty: 'Medium', topic: 'Two Pointers', acceptance: '32.4%', status: 'unsolved', subject: 'python' },
        { id: 'p7', title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Two Pointers / Stack', acceptance: '59.0%', status: 'unsolved', subject: 'dsa' },
        { id: 'p8', title: 'Merge k Sorted Lists', difficulty: 'Hard', topic: 'Heap / Priority Queue', acceptance: '48.5%', status: 'unsolved', subject: 'cpp' }
    ];

    const filtered = sampleProblems.filter(p => {
        if (difficultyFilter !== 'all' && p.difficulty.toLowerCase() !== difficultyFilter) return false;
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (searchQuery.trim() && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header & Filter Bar */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Problem Explorer</h2>
                    <p className="text-xs text-gray-500">Filter and solve problems for active subject context</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 w-48"
                        />
                    </div>

                    {/* Difficulty Filter */}
                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                        <option value="all">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                        <option value="all">All Statuses</option>
                        <option value="solved">Solved</option>
                        <option value="unsolved">Unsolved</option>
                    </select>
                </div>
            </div>

            {/* Problems List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {filtered.map(p => (
                        <div
                            key={p.id}
                            onClick={() => onOpenProblem(p)}
                            className="p-4 sm:px-6 hover:bg-purple-50/40 transition-colors cursor-pointer flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                                    p.status === 'solved' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {p.status === 'solved' ? <CheckCircle size={16} /> : <Code size={16} />}
                                </div>

                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-purple-600 transition-colors">
                                        {p.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                        <span>{p.topic}</span>
                                        <span>•</span>
                                        <span>Acceptance: {p.acceptance}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                    p.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                                    p.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                                    'bg-rose-50 text-rose-600'
                                }`}>
                                    {p.difficulty}
                                </span>
                                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
