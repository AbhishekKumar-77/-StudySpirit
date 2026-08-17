import React, { useState } from 'react';
import {
    Briefcase, Code, MessageSquare, Award, ArrowLeft, Upload, Link, CheckCircle2,
    Sparkles, ArrowRight, Layers, FileText, Bot, Loader2
} from 'lucide-react';
import soloApi from '../../services/soloApi';

export default function GuidedInterviewWizard({ onCancel, onLaunchInterview, onJoinExam }) {
    const [step, setStep] = useState(1); // 1: Preparation Goal, 2: Specific Job Details, 3: Round Selection
    const [goalType, setGoalType] = useState('specific-job'); // 'specific-job', 'skill-practice', 'general', 'teacher'
    
    // Form Inputs
    const [targetRole, setTargetRole] = useState('Backend Developer');
    const [targetCompany, setTargetCompany] = useState('Google');
    const [jobDescription, setJobDescription] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [examCode, setExamCode] = useState('');
    const [regNumber, setRegNumber] = useState('');

    // AI Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState({
        detectedSkills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'DSA', 'System Design'],
        recommendedRound: 'Technical',
        explanation: 'High relevance to this job description based on technical requirements.'
    });

    // Handle Goal Selection
    const handleSelectGoal = (type) => {
        setGoalType(type);
        if (type === 'teacher') {
            // Stay on step 1 with exam code input expanded
            return;
        }
        if (type === 'specific-job') {
            setStep(2);
        } else {
            // Direct to round selection for General / Skill Practice
            setStep(3);
        }
    };

    // Analyze JD with Backend AI
    const handleAnalyzeJob = async () => {
        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('role', targetRole);
            formData.append('company', targetCompany);
            formData.append('jobDescription', jobDescription);
            if (resumeFile) {
                formData.append('resume', resumeFile);
            }

            const data = await soloApi.analyzeJobContext(formData);
            if (data && data.success) {
                setAiAnalysis({
                    detectedSkills: data.detectedSkills || ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'DSA', 'System Design'],
                    recommendedRound: data.recommendedRound || 'Technical',
                    explanation: data.explanation || 'High relevance to this job description'
                });
            }
        } catch (err) {
            console.error('JD analysis error:', err);
        } finally {
            setIsAnalyzing(false);
            setStep(3);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl my-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900">Prepare for your next interview</h2>
                        <p className="text-xs text-slate-500">Step {step} of 3</p>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-2 rounded-full ${step >= 1 ? 'bg-purple-600' : 'bg-slate-200'}`} />
                    <div className={`w-8 h-2 rounded-full ${step >= 2 ? 'bg-purple-600' : 'bg-slate-200'}`} />
                    <div className={`w-8 h-2 rounded-full ${step >= 3 ? 'bg-purple-600' : 'bg-slate-200'}`} />
                </div>
            </div>

            {/* STEP 1: What are you preparing for? */}
            {step === 1 && (
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">What are you preparing for?</h3>
                    <p className="text-xs text-slate-500 mb-6">Select a path to personalize your interview practice session</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Option 1: Specific Job */}
                        <button
                            onClick={() => handleSelectGoal('specific-job')}
                            className="p-5 rounded-2xl border-2 border-purple-200 hover:border-purple-600 bg-purple-50/30 text-left transition group flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md shadow-purple-500/20">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <h4 className="text-base font-extrabold text-slate-900">Specific Job</h4>
                                <p className="text-xs text-slate-500 mt-1">Prepare for a real job using Role, Company, JD & Resume</p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition">
                                <span>Get Started</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>

                        {/* Option 2: Skill Practice */}
                        <button
                            onClick={() => handleSelectGoal('skill-practice')}
                            className="p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 bg-slate-50/50 text-left transition group flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center mb-3 shadow-md shadow-cyan-500/20">
                                    <Code className="w-5 h-5" />
                                </div>
                                <h4 className="text-base font-extrabold text-slate-900">Skill Practice</h4>
                                <p className="text-xs text-slate-500 mt-1">Practice a specific area like DSA, System Design, or SQL</p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-cyan-600 group-hover:translate-x-1 transition">
                                <span>Get Started</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>

                        {/* Option 3: General Interview */}
                        <button
                            onClick={() => handleSelectGoal('general')}
                            className="p-5 rounded-2xl border-2 border-slate-200 hover:border-pink-500 bg-slate-50/50 text-left transition group flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center mb-3 shadow-md shadow-pink-500/20">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <h4 className="text-base font-extrabold text-slate-900">General Interview</h4>
                                <p className="text-xs text-slate-500 mt-1">Practice general interview fundamentals and self-introduction</p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-pink-600 group-hover:translate-x-1 transition">
                                <span>Get Started</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>

                        {/* Option 4: Teacher Assessment */}
                        <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-left flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20">
                                    <Award className="w-5 h-5" />
                                </div>
                                <h4 className="text-base font-extrabold text-slate-900">Teacher Assessment</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-3">Join an assigned interview exam created by your professor</p>

                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Exam Code (e.g. EXAM-884)"
                                        value={examCode}
                                        onChange={(e) => setExamCode(e.target.value.toUpperCase())}
                                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Roll / Registration Number"
                                        value={regNumber}
                                        onChange={(e) => setRegNumber(e.target.value)}
                                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => onJoinExam(examCode, regNumber)}
                                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition"
                            >
                                Join Assessment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: Job Context Inputs */}
            {step === 2 && (
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Target Job Information</h3>
                    <p className="text-xs text-slate-500 mb-6">StudySpirit's AI will parse this information to personalize your interview rounds.</p>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Target Role</label>
                                <input
                                    type="text"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    placeholder="e.g. Backend Developer"
                                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Target Company</label>
                                <input
                                    type="text"
                                    value={targetCompany}
                                    onChange={(e) => setTargetCompany(e.target.value)}
                                    placeholder="e.g. Google"
                                    className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Job Description</label>
                            <textarea
                                rows={4}
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Resume (PDF)</label>
                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition">
                                    <Upload className="w-4 h-4 text-purple-600" />
                                    <span>{resumeFile ? resumeFile.name : 'Upload New Resume PDF'}</span>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={(e) => setResumeFile(e.target.files[0])}
                                    />
                                </label>
                                {resumeFile && (
                                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> Loaded
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            onClick={() => setStep(1)}
                            className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleAnalyzeJob}
                            disabled={isAnalyzing}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Analyzing Job Description...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Analyze Job & Suggest Rounds</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: AI Detected Skills & Round Selection */}
            {step === 3 && (
                <div>
                    {goalType === 'specific-job' && (
                        <div className="mb-6 bg-purple-50/60 border border-purple-100 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-900">AI Analysis Complete</h4>
                            </div>

                            <p className="text-xs font-bold text-slate-700 mb-2">Detected Key Required Skills:</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {aiAnalysis.detectedSkills.map((skill, idx) => (
                                    <span key={idx} className="bg-white border border-purple-200 text-purple-800 text-xs font-bold px-3 py-1 rounded-full shadow-2xs flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <div className="text-xs text-slate-600">
                                <strong>Likely Interview Stages:</strong> Technical Round • System Design • Behavioral Round
                            </div>
                        </div>
                    )}

                    <h3 className="text-lg font-bold text-slate-900 mb-1">Choose your interview round</h3>
                    <p className="text-xs text-slate-500 mb-6">Select the round you want to practice right now</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Technical */}
                        <button
                            onClick={() => onLaunchInterview('technical', { targetRole, targetCompany, jobDescription, resumeFile })}
                            className={`p-5 rounded-2xl border-2 text-left transition flex flex-col justify-between relative ${
                                aiAnalysis.recommendedRound === 'Technical'
                                    ? 'border-purple-600 bg-purple-50/40 shadow-md'
                                    : 'border-slate-200 hover:border-purple-300'
                            }`}
                        >
                            {aiAnalysis.recommendedRound === 'Technical' && (
                                <span className="absolute -top-3 right-4 bg-purple-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-xs">
                                    Recommended for you
                                </span>
                            )}
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3 font-bold">
                                    <Code className="w-5 h-5" />
                                </div>
                                <h4 className="text-base font-extrabold text-slate-900">Technical Interview</h4>
                                <p className="text-xs text-slate-500 mt-1">DSA + CS Fundamentals + Backend</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-xs font-bold text-purple-600">
                                <span>Start Round</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>

                        {/* System Design */}
                        <button
                            onClick={() => onLaunchInterview('system-design', { targetRole, targetCompany, jobDescription, resumeFile })}
                            className="p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-400 text-left transition flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-3 font-bold">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <h4 className="text-base font-extrabold text-slate-900">System Design</h4>
                                <p className="text-xs text-slate-500 mt-1">Architecture + Scalability + Databases</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-xs font-bold text-cyan-600">
                                <span>Start Round</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>

                        {/* Behavioral */}
                        <button
                            onClick={() => onLaunchInterview('behavioral', { targetRole, targetCompany, jobDescription, resumeFile })}
                            className="p-5 rounded-2xl border-2 border-slate-200 hover:border-pink-400 text-left transition flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-3 font-bold">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <h4 className="text-base font-extrabold text-slate-900">Behavioral (HR)</h4>
                                <p className="text-xs text-slate-500 mt-1">HR + STAR Methodology + Soft Skills</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-xs font-bold text-pink-600">
                                <span>Start Round</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>

                        {/* Full Mock Interview */}
                        <button
                            onClick={() => onLaunchInterview('full-mock', { targetRole, targetCompany, jobDescription, resumeFile })}
                            className="p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 text-left transition flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 font-bold">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <h4 className="text-base font-extrabold text-slate-900">Full Mock Interview</h4>
                                <p className="text-xs text-slate-500 mt-1">Complete multi-round interview simulation with Aria</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-xs font-bold text-emerald-600">
                                <span>Start Simulation</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>
                    </div>

                    <div className="mt-8 flex justify-start">
                        <button
                            onClick={() => setStep(goalType === 'specific-job' ? 2 : 1)}
                            className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50"
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
