import React, { useState } from 'react';
import {
    FileText, Sparkles, CheckCircle2, Loader2, ArrowRight,
    Copy, Check, RefreshCw, Send, Sliders
} from 'lucide-react';
import englishLabApi from '../../services/englishLabApi';

export default function WritingLabView() {
    const [selectedCategory, setSelectedCategory] = useState('Professional');
    const [selectedTone, setSelectedTone] = useState('Formal & Professional');
    const [topic, setTopic] = useState('Write a professional email requesting a 1-on-1 meeting with your project lead to discuss architecture changes.');
    const [essay, setEssay] = useState('');
    const [evaluating, setEvaluating] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [copied, setCopied] = useState(false);

    const categories = [
        {
            name: 'Professional',
            topics: [
                'Write a professional email requesting a meeting with your project advisor.',
                'Send a sprint update email summarizing 3 resolved bugs and upcoming tasks.',
                'Politely follow up on an unanswered email after 4 business days.'
            ]
        },
        {
            name: 'Career & LinkedIn',
            topics: [
                'Draft a LinkedIn connection request message to a senior software engineer.',
                'Write a concise cover letter opening paragraph highlighting your full stack projects.',
                'Post a 3-paragraph LinkedIn update announcing the launch of your open-source tool.'
            ]
        },
        {
            name: 'Academic & College',
            topics: [
                'Request an assignment deadline extension due to technical hardware issues.',
                'Write a formal request to your professor seeking a letter of recommendation.',
                'Draft a summary abstract for your final year engineering capstone project.'
            ]
        },
        {
            name: 'Technical Docs',
            topics: [
                'Write a clear Pull Request description explaining why you refactored authentication middleware.',
                'Draft a clean bug report detailing steps to reproduce an intermittent API timeout.'
            ]
        }
    ];

    const tones = ['Formal & Professional', 'Collaborative & Friendly', 'Direct & Concise', 'Assertive & Confident'];

    const handleEvaluate = async () => {
        if (!essay.trim() || essay.length < 15) return alert('Writing submission is too short to evaluate.');
        setEvaluating(true);
        setFeedback(null);
        try {
            const res = await englishLabApi.evaluateWriting(topic, essay, selectedTone);
            setFeedback(res);
        } catch (e) {
            console.error('Writing evaluation error', e);
        } finally {
            setEvaluating(false);
        }
    };

    const copyRewrite = () => {
        if (feedback?.improvedRewrite) {
            navigator.clipboard.writeText(feedback.improvedRewrite);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Professional Writing Lab</h2>
                        <p className="text-xs text-slate-500">Draft emails, technical docs, and career messages with AI tone analysis and polished rewrites.</p>
                    </div>
                </div>
            </div>

            {/* Category Selector */}
            <div className="flex gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
                {categories.map(cat => (
                    <button
                        key={cat.name}
                        onClick={() => {
                            setSelectedCategory(cat.name);
                            setTopic(cat.topics[0]);
                            setFeedback(null);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedCategory === cat.name
                                ? 'bg-purple-600 text-white shadow-2xs'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Topic & Tone Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Writing Prompt / Topic
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-purple-600" /> Target Tone
                    </label>
                    <select
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-purple-500 focus:outline-none"
                    >
                        {tones.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Writing Input Stage */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Your Draft Submission
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                        {essay.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                </div>
                <textarea
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    placeholder="Type or paste your email, message, PR description, or proposal here..."
                    rows={7}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 leading-relaxed focus:bg-white focus:border-purple-500 focus:outline-none resize-none font-sans"
                />
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleEvaluate}
                    disabled={evaluating || essay.trim().length < 15}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-purple-600/20 transition-all"
                >
                    {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Evaluate Draft with AI
                </button>
            </div>

            {/* AI Evaluation Results */}
            {evaluating ? (
                <div className="p-8 text-center text-xs text-purple-600 font-bold flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Evaluating grammar, tone alignment, clarity, and phrasing...
                </div>
            ) : feedback && (
                <div className="p-6 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">AI Writing Assessment & Scores</h3>
                        <span className="px-3 py-1 bg-purple-600 text-white font-bold text-xs rounded-lg shadow-2xs self-start sm:self-auto">
                            Overall Score: {feedback.score || 80}/100
                        </span>
                    </div>

                    {/* Metric Bars */}
                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                        <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-medium block">Grammar</span>
                            <strong className="text-slate-900 text-sm">{feedback.grammarScore || 82}%</strong>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-medium block">Clarity</span>
                            <strong className="text-slate-900 text-sm">{feedback.clarityScore || 85}%</strong>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-medium block">Tone Match</span>
                            <strong className="text-slate-900 text-sm">{feedback.toneScore || 88}%</strong>
                        </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-purple-100">
                        {feedback.feedback}
                    </p>

                    {/* Improved Rewrite Box */}
                    {feedback.improvedRewrite && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5" /> Polished Professional Rewrite:
                                </span>
                                <button
                                    onClick={copyRewrite}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-purple-200 hover:bg-purple-50 text-purple-700 rounded-lg text-xs font-bold transition-all shadow-2xs"
                                >
                                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                    {copied ? 'Copied!' : 'Copy Rewrite'}
                                </button>
                            </div>
                            <div className="p-4 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 font-medium leading-relaxed shadow-2xs">
                                {feedback.improvedRewrite}
                            </div>
                        </div>
                    )}

                    {/* Specific Actionable Improvements */}
                    {feedback.improvements && feedback.improvements.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Specific Recommendations:</span>
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
