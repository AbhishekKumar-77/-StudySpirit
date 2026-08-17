import React, { useState } from 'react';
import { FileText, Sparkles, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import englishLabApi from '../../services/englishLabApi';

export default function WritingLabView() {
    const [selectedCategory, setSelectedCategory] = useState('Professional');
    const [topic, setTopic] = useState('Write a professional email requesting a meeting with your project advisor.');
    const [essay, setEssay] = useState('');
    const [evaluating, setEvaluating] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const categories = [
        { name: 'Academic', topics: ['Email professor', 'Assignment explanation', 'Lab report summary'] },
        { name: 'Professional', topics: ['Leave request', 'Team update email', 'Client project status'] },
        { name: 'Career', topics: ['LinkedIn introduction', 'Cover letter snippet', 'Recruiter message'] },
        { name: 'General', topics: ['Opinion essay', 'Short story', 'Technology impact essay'] }
    ];

    const handleEvaluate = async () => {
        if (!essay.trim() || essay.length < 10) return alert('Writing sample is too short.');
        setEvaluating(true);
        try {
            const res = await englishLabApi.evaluateWriting(topic, essay);
            setFeedback(res);
        } catch (e) {
            console.error('Writing evaluation error', e);
        } finally {
            setEvaluating(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Professional Writing Lab
                </h2>
                <p className="text-xs text-slate-500">Improve your writing grammar, structure, tone, and professional clarity.</p>
            </div>

            {/* Categories */}
            <div className="flex gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
                {categories.map(cat => (
                    <button
                        key={cat.name}
                        onClick={() => { setSelectedCategory(cat.name); setTopic(cat.topics[0]); setFeedback(null); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat.name
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Topic Selector */}
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Writing Topic Prompt</label>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                />
            </div>

            {/* Essay Input */}
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Response</label>
                <textarea
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    placeholder="Write your email, essay, or response here..."
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 leading-relaxed focus:bg-white focus:border-purple-500 focus:outline-none resize-none"
                />
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleEvaluate}
                    disabled={evaluating || essay.length < 10}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
                >
                    {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Evaluate Writing
                </button>
            </div>

            {/* Feedback */}
            {feedback && (
                <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm">AI Writing Assessment</h3>
                        <span className="text-xs font-black text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
                            Overall Score: {feedback.score}/100
                        </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{feedback.feedback}</p>

                    {feedback.improvements && feedback.improvements.length > 0 && (
                        <div className="space-y-1 pt-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Specific Improvements:</span>
                            <ul className="space-y-1 text-xs text-slate-600">
                                {feedback.improvements.map((imp, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                        <span className="text-purple-600 font-bold">•</span> {imp}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
