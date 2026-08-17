import React from 'react';
import {
    FileText, Video, HelpCircle, FileCheck, Bookmark, Star, CheckCircle2,
    Clock, Eye, Play, Sparkles, BookOpen, Layers, ShieldCheck, Zap
} from 'lucide-react';

export default function ResourceCard({ resource, onOpen, onSaveToggle, isSaved = false }) {
    const type = resource.type || resource.resourceType || 'PDF';

    // Type Config: Icons & Color styling
    const getTypeBadge = () => {
        switch (type.toUpperCase()) {
            case 'PDF':
                return { label: '📄 PDF', bg: 'bg-rose-50 text-rose-700 border-rose-100', iconBg: 'bg-rose-500 text-white' };
            case 'VIDEO':
                return { label: '▶ VIDEO', bg: 'bg-purple-50 text-purple-700 border-purple-100', iconBg: 'bg-purple-600 text-white' };
            case 'QUESTION_BANK':
                return { label: '📝 QUESTION BANK', bg: 'bg-amber-50 text-amber-700 border-amber-100', iconBg: 'bg-amber-500 text-white' };
            case 'PREVIOUS_PAPER':
                return { label: '📑 PREVIOUS PAPER', bg: 'bg-blue-50 text-blue-700 border-blue-100', iconBg: 'bg-blue-600 text-white' };
            case 'ASSIGNMENT':
                return { label: '📌 ASSIGNMENT', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', iconBg: 'bg-emerald-600 text-white' };
            case 'FLASHCARDS':
                return { label: '⚡ FLASHCARDS', bg: 'bg-cyan-50 text-cyan-700 border-cyan-100', iconBg: 'bg-cyan-600 text-white' };
            default:
                return { label: '📄 NOTE', bg: 'bg-slate-100 text-slate-700 border-slate-200', iconBg: 'bg-slate-700 text-white' };
        }
    };

    const typeBadge = getTypeBadge();

    return (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-cyan-400 hover:shadow-md transition group flex flex-col justify-between relative overflow-hidden">
            <div>
                {/* Card Top Meta */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${typeBadge.bg}`}>
                        {typeBadge.label}
                    </span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSaveToggle && onSaveToggle(resource);
                        }}
                        className={`p-1.5 rounded-full border transition ${
                            isSaved
                                ? 'bg-amber-50 border-amber-200 text-amber-500'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                        }`}
                        title={isSaved ? 'Remove from Saved' : 'Save to My Resources'}
                    >
                        <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                    </button>
                </div>

                {/* Resource Title */}
                <h3 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-cyan-700 transition">
                    {resource.title || resource.name}
                </h3>

                {/* Course & Unit Context */}
                <p className="text-xs font-semibold text-slate-500 mb-3">
                    {resource.courseCode || 'CSE101'} · {resource.unit || 'Unit 3'}
                </p>

                {/* Details Meta (Pages, Duration, Questions) */}
                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 mb-4">
                    {resource.pageCount && (
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            {resource.pageCount} pages
                        </span>
                    )}
                    {resource.duration && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {resource.duration}
                        </span>
                    )}
                    {resource.readTime && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {resource.readTime}
                        </span>
                    )}
                    {resource.questionCount && (
                        <span className="flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            {resource.questionCount} Questions
                        </span>
                    )}
                </div>

                {/* Verification Badge */}
                {(resource.verified || resource.verificationBadge) && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 mb-4">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{resource.verificationBadge || 'Teacher Verified'}</span>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                <button
                    onClick={() => onOpen(resource)}
                    className="w-full bg-slate-900 hover:bg-cyan-600 text-white font-bold text-xs py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition transform hover:-translate-y-0.5"
                >
                    {type.toUpperCase() === 'VIDEO' ? <Play className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{type.toUpperCase() === 'VIDEO' ? 'Watch Video' : type.toUpperCase() === 'QUESTION_BANK' ? 'Practice' : 'Open Resource'}</span>
                </button>
            </div>
        </div>
    );
}
