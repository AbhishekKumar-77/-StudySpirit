import React from 'react';
import { FileText, FileSearch, MessageSquare, UserCheck, Map, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CareerToolsGrid({ onSelectTool }) {
    const navigate = useNavigate();

    const tools = [
        { id: 'resume-builder', title: 'Resume Builder', desc: 'Create ATS-friendly resume', icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-100', route: '/planner' },
        { id: 'resume-analyzer', title: 'Resume Analyzer', desc: 'Check your resume score', icon: FileSearch, color: 'text-cyan-600 bg-cyan-50 border-cyan-100', route: '/interview-prep' },
        { id: 'cover-letter', title: 'Cover Letter', desc: 'AI-powered cover letters', icon: MessageSquare, color: 'text-blue-600 bg-blue-50 border-blue-100', route: '/careersprint' },
        { id: 'interview-prep', title: 'Interview Prep', desc: 'Practice with AI Interviewer', icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', route: '/interview-prep' },
        { id: 'roadmap', title: 'Career Roadmap', desc: 'Plan your career path', icon: Map, color: 'text-amber-600 bg-amber-50 border-amber-100', route: '/planner' },
        { id: 'salary-insights', title: 'Salary Insights', desc: 'Know your market value', icon: DollarSign, color: 'text-pink-600 bg-pink-50 border-pink-100', route: '/careersprint' }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Career Tools</h3>
                    <p className="text-xs font-semibold text-slate-500">Accelerate your career preparation</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                        <div
                            key={tool.id}
                            onClick={() => {
                                if (onSelectTool) onSelectTool(tool.id);
                                else navigate(tool.route);
                            }}
                            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition cursor-pointer flex items-center justify-between gap-4 group"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className={`w-11 h-11 rounded-2xl border p-2.5 flex items-center justify-center shrink-0 ${tool.color}`}>
                                    <IconComponent className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-cyan-700 transition leading-snug">
                                        {tool.title}
                                    </h4>
                                    <p className="text-xs font-semibold text-slate-500">{tool.desc}</p>
                                </div>
                            </div>

                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition shrink-0" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
