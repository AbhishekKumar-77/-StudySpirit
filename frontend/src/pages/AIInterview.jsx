import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import soloApi from '../services/soloApi';
import AriaAvatar from '../components/AriaAvatar';
import { API_BASE } from '../config';
import {
    Mic, MicOff, Send, StopCircle, User, Cpu, FileText,
    Settings, Play, ArrowLeft, Loader,
    Volume2, VolumeX, UploadCloud, Camera, CameraOff,
    Trophy, History, BarChart2, CheckCircle, AlertCircle, X,
    ChevronRight, Star, Sparkles, Clock, Activity, Type
} from 'lucide-react';

const ResumeTemplate = ({ data, template }) => {
    if (!data || !data.personalInfo) return <div className="text-red-500 p-4">Error loading resume data. Please try again.</div>;

    if (template === 'Creative Tech') {
        return (
            <div className="bg-[var(--bg-primary)] text-[var(--text-secondary)] p-8 rounded-lg font-sans min-h-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <div className="border-b border-cyan-500/30 pb-6 mb-6">
                    <h1 className="text-4xl font-bold text-cyan-400 mb-2 tracking-tight">{data.personalInfo.name}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                        {data.personalInfo.email && <span className="flex items-center gap-1">✉ {data.personalInfo.email}</span>}
                        {data.personalInfo.phone && <span className="flex items-center gap-1">☎ {data.personalInfo.phone}</span>}
                        {data.personalInfo.links && <span className="flex items-center gap-1">🔗 {data.personalInfo.links}</span>}
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-[var(--text-secondary)] leading-relaxed text-sm bg-cyan-950/20 p-4 rounded-lg border border-cyan-500/10 italic">"{data.summary}"</p>
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-widest border-l-4 border-cyan-500 pl-3 mb-4">Core Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills?.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-cyan-500/10 text-cyan-300 text-xs font-medium rounded-full border border-cyan-500/20">{skill}</span>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-widest border-l-4 border-cyan-500 pl-3 mb-4">Experience</h2>
                    <div className="space-y-6">
                        {data.experience?.map((exp, i) => (
                            <div key={i} className="relative pl-4 border-l border-[var(--border-color)]">
                                <div className="absolute w-2 h-2 bg-cyan-500 rounded-full -left-[5px] top-2 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">{exp.role}</h3>
                                <div className="text-cyan-400 font-medium text-sm mb-2">{exp.company} <span className="text-[var(--text-muted)] mx-2">|</span> {exp.duration}</div>
                                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
                                    {exp.description?.map((desc, j) => <li key={j}>{desc}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-widest border-l-4 border-cyan-500 pl-3 mb-4">Education</h2>
                    <div className="space-y-4">
                        {data.education?.map((edu, i) => (
                            <div key={i} className="bg-[var(--glass-bg)] p-4 rounded-lg border border-[var(--border-color)]">
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">{edu.degree}</h3>
                                <div className="text-cyan-400 text-sm mb-1">{edu.institution} • {edu.year}</div>
                                {edu.details && <p className="text-sm text-[var(--text-secondary)]">{edu.details}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                {data.additionalInfo && data.additionalInfo.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-widest border-l-4 border-cyan-500 pl-3 mb-4">Awards & Certifications</h2>
                        <ul className="list-inside list-disc space-y-1 text-sm text-[var(--text-secondary)]">
                            {data.additionalInfo.map((info, i) => <li key={i}>{info}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    if (template === 'Executive Minimalist') {
        return (
            <div className="bg-[var(--bg-primary)] text-gray-800 p-10 font-serif min-h-full max-w-3xl border border-gray-200 shadow-sm mx-auto">
                <div className="text-center mb-10 border-b-2 border-gray-800 pb-8">
                    <h1 className="text-4xl uppercase tracking-[0.2em] text-gray-900 mb-3">{data.personalInfo.name}</h1>
                    <div className="flex flex-wrap justify-center gap-3 text-xs uppercase tracking-wider text-gray-500">
                        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                        {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
                        {data.personalInfo.links && <span>• {data.personalInfo.links}</span>}
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-sm leading-relaxed text-gray-700 text-justify">{data.summary}</p>
                </div>

                <div className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4 pb-2 border-b border-gray-200">Expertise</h2>
                    <p className="text-sm text-gray-800 leading-relaxed font-sans">{data.skills?.join('   •   ')}</p>
                </div>

                <div className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-6 pb-2 border-b border-gray-200">Professional Experience</h2>
                    <div className="space-y-8">
                        {data.experience?.map((exp, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-2">
                                    <h3 className="text-base font-bold text-gray-900">{exp.role}</h3>
                                    <span className="text-xs font-sans text-gray-500 uppercase tracking-widest whitespace-nowrap ml-4">{exp.duration}</span>
                                </div>
                                <div className="text-sm italic text-gray-600 mb-3">{exp.company}</div>
                                <ul className="list-disc pl-4 space-y-1.5 text-sm text-gray-700 text-justify marker:text-gray-300">
                                    {exp.description?.map((desc, j) => <li key={j}>{desc}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4 pb-2 border-b border-gray-200">Education</h2>
                    <div className="space-y-4">
                        {data.education?.map((edu, i) => (
                            <div key={i} className="flex justify-between items-baseline text-sm">
                                <div>
                                    <strong className="text-gray-900">{edu.degree}</strong>, <i className="text-gray-600">{edu.institution}</i>
                                    {edu.details && <div className="text-gray-500 mt-1">{edu.details}</div>}
                                </div>
                                <span className="text-xs font-sans text-gray-500 uppercase tracking-widest ml-4">{edu.year}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Modern Professional (Default)
    return (
        <div className="bg-white text-[var(--text-primary)] p-8 font-sans min-h-full max-w-3xl mx-auto shadow-md border-t-8 border-cyan-600">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 border-b-2 border-[var(--border-color)] pb-6 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-1">{data.personalInfo.name}</h1>
                    <h3 className="text-lg text-violet-600 font-medium">Professional Profile</h3>
                </div>
                <div className="md:text-right text-sm text-[var(--text-muted)] space-y-1 font-medium">
                    {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                    {data.personalInfo.links && <div className="text-cyan-">{data.personalInfo.links}</div>}
                </div>
            </div>

            <div className="mb-6">
                <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">{data.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-8">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Skills</h2>
                        <ul className="space-y-2">
                            {data.skills?.map((skill, i) => (
                                <li key={i} className="text-sm text-[var(--text-primary)] flex items-center gap-2 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-/80"></span> {skill}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {data.education && data.education.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 mt-8">Education</h2>
                            <div className="space-y-4">
                                {data.education.map((edu, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="font-bold text-[var(--text-primary)]">{edu.degree}</div>
                                        <div className="text-violet-600 font-bold mb-1">{edu.institution}</div>
                                        <div className="text-[var(--text-muted)] text-xs mb-1 uppercase tracking-wider font-semibold">{edu.year}</div>
                                        {edu.details && <div className="text-[var(--text-muted)] text-xs mt-1">{edu.details}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6 md:border-l-2 md:border-[var(--border-color)] md:pl-8">
                    <div>
                        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">Experience</h2>
                        <div className="space-y-6">
                            {data.experience?.map((exp, i) => (
                                <div key={i}>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{exp.role}</h3>
                                    <div className="flex flex-wrap gap-2 justify-between items-center text-sm mb-2">
                                        <span className="text-violet-600 font-bold">{exp.company}</span>
                                        <span className="text-[var(--text-muted)] text-xs bg-[var(--bg-secondary)] px-2 py-1 rounded uppercase tracking-wider font-semibold">{exp.duration}</span>
                                    </div>
                                    <ul className="list-disc list-outside ml-4 space-y-1.5 text-sm text-[var(--text-primary)] marker:text-[var(--text-secondary)]">
                                        {exp.description?.map((desc, j) => <li key={j} className="pl-1 leading-relaxed">{desc}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AIInterview() {
    const { user } = useApp();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('technical'); // technical, behavioral, resume
    const [view, setView] = useState('setup'); // setup, interview, report, history
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);

    // Advanced Analysers State
    const [availableVoices, setAvailableVoices] = useState([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
    const [fillerWordCount, setFillerWordCount] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [vocalVolume, setVocalVolume] = useState(0);

    // Resume Builder State
    const [resumeForm, setResumeForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        links: '',
        experience: '',
        education: '',
        skills: '',
        additionalInfo: '',
        template: 'Modern Professional'
    });
    const [generatedResume, setGeneratedResume] = useState('');
    const [isGeneratingResume, setIsGeneratingResume] = useState(false);

    // Interview Config
    const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
    const [sessionId, setSessionId] = useState(null);
    const [sessionReport, setSessionReport] = useState(null);
    const [interviewHistory, setInterviewHistory] = useState([]);

    // Speech-to-Text states
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const recognitionRef = useRef(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const speechStoppedRef = useRef(false);

    // Advanced Analysers Refs
                        <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-widest border-l-4 border-cyan-500 pl-3 mb-4">Awards & Certifications</h2>
                        <ul className="list-inside list-disc space-y-1 text-sm text-[var(--text-secondary)]">
                            {data.additionalInfo.map((info, i) => <li key={i}>{info}</li>)}
                        </ul>
                    </div >
                )
}
            </div >
        );
    }

if (template === 'Executive Minimalist') {
    return (
        <div className="bg-[var(--bg-primary)] text-gray-800 p-10 font-serif min-h-full max-w-3xl border border-gray-200 shadow-sm mx-auto">
            <div className="text-center mb-10 border-b-2 border-gray-800 pb-8">
                <h1 className="text-4xl uppercase tracking-[0.2em] text-gray-900 mb-3">{data.personalInfo.name}</h1>
                <div className="flex flex-wrap justify-center gap-3 text-xs uppercase tracking-wider text-gray-500">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
                    {data.personalInfo.links && <span>• {data.personalInfo.links}</span>}
                </div>
            </div>

            <div className="mb-8">
                <p className="text-sm leading-relaxed text-gray-700 text-justify">{data.summary}</p>
            </div>

            <div className="mb-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4 pb-2 border-b border-gray-200">Expertise</h2>
                <p className="text-sm text-gray-800 leading-relaxed font-sans">{data.skills?.join('   •   ')}</p>
            </div>

            <div className="mb-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-6 pb-2 border-b border-gray-200">Professional Experience</h2>
                <div className="space-y-8">
                    {data.experience?.map((exp, i) => (
                        <div key={i}>
                            <div className="flex justify-between items-baseline mb-2">
                                <h3 className="text-base font-bold text-gray-900">{exp.role}</h3>
                                <span className="text-xs font-sans text-gray-500 uppercase tracking-widest whitespace-nowrap ml-4">{exp.duration}</span>
                            </div>
                            <div className="text-sm italic text-gray-600 mb-3">{exp.company}</div>
                            <ul className="list-disc pl-4 space-y-1.5 text-sm text-gray-700 text-justify marker:text-gray-300">
                                {exp.description?.map((desc, j) => <li key={j}>{desc}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4 pb-2 border-b border-gray-200">Education</h2>
                <div className="space-y-4">
                    {data.education?.map((edu, i) => (
                        <div key={i} className="flex justify-between items-baseline text-sm">
                            <div>
                                <strong className="text-gray-900">{edu.degree}</strong>, <i className="text-gray-600">{edu.institution}</i>
                                {edu.details && <div className="text-gray-500 mt-1">{edu.details}</div>}
                            </div>
                            <span className="text-xs font-sans text-gray-500 uppercase tracking-widest ml-4">{edu.year}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Modern Professional (Default)
return (
    <div className="bg-white text-[var(--text-primary)] p-8 font-sans min-h-full max-w-3xl mx-auto shadow-md border-t-8 border-cyan-600">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 border-b-2 border-[var(--border-color)] pb-6 gap-4">
            <div>
                <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-1">{data.personalInfo.name}</h1>
                <h3 className="text-lg text-violet-600 font-medium">Professional Profile</h3>
            </div>
            <div className="md:text-right text-sm text-[var(--text-muted)] space-y-1 font-medium">
                {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                {data.personalInfo.links && <div className="text-cyan-">{data.personalInfo.links}</div>}
            </div>
        </div>

        <div className="mb-6">
            <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">{data.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-8">
            <div className="space-y-6">
                <div>
                    <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Skills</h2>
                    <ul className="space-y-2">
                        {data.skills?.map((skill, i) => (
                            <li key={i} className="text-sm text-[var(--text-primary)] flex items-center gap-2 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-/80"></span> {skill}
                            </li>
                        ))}
                    </ul>
                </div>

                {data.education && data.education.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 mt-8">Education</h2>
                        <div className="space-y-4">
                            {data.education.map((edu, i) => (
                                <div key={i} className="text-sm">
                                    <div className="font-bold text-[var(--text-primary)]">{edu.degree}</div>
                                    <div className="text-violet-600 font-bold mb-1">{edu.institution}</div>
                                    <div className="text-[var(--text-muted)] text-xs mb-1 uppercase tracking-wider font-semibold">{edu.year}</div>
                                    {edu.details && <div className="text-[var(--text-muted)] text-xs mt-1">{edu.details}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-6 md:border-l-2 md:border-[var(--border-color)] md:pl-8">
                <div>
                    <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">Experience</h2>
                    <div className="space-y-6">
                        {data.experience?.map((exp, i) => (
                            <div key={i}>
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">{exp.role}</h3>
                                <div className="flex flex-wrap gap-2 justify-between items-center text-sm mb-2">
                                    <span className="text-violet-600 font-bold">{exp.company}</span>
                                    <span className="text-[var(--text-muted)] text-xs bg-[var(--bg-secondary)] px-2 py-1 rounded uppercase tracking-wider font-semibold">{exp.duration}</span>
                                </div>
                                <ul className="list-disc list-outside ml-4 space-y-1.5 text-sm text-[var(--text-primary)] marker:text-[var(--text-secondary)]">
                                    {exp.description?.map((desc, j) => <li key={j} className="pl-1 leading-relaxed">{desc}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

export default function AIInterview() {
    const { user } = useApp();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('technical'); // technical, behavioral, resume
    const [view, setView] = useState('setup'); // setup, interview, report, history
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);

    // Advanced Analysers State
    const [availableVoices, setAvailableVoices] = useState([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
    const [fillerWordCount, setFillerWordCount] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [vocalVolume, setVocalVolume] = useState(0);

    // Resume Builder State
    const [resumeForm, setResumeForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        links: '',
        experience: '',
        education: '',
        skills: '',
        additionalInfo: '',
        template: 'Modern Professional'
    });
    const [generatedResume, setGeneratedResume] = useState('');
    const [isGeneratingResume, setIsGeneratingResume] = useState(false);

    // Interview Config
    const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
    const [sessionId, setSessionId] = useState(null);
    const [sessionReport, setSessionReport] = useState(null);
    const [interviewHistory, setInterviewHistory] = useState([]);

    // Speech-to-Text states
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const recognitionRef = useRef(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const speechStoppedRef = useRef(false);

    // Advanced Analysers Refs
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const microphoneRef = useRef(null);
    const volIntervalRef = useRef(null);
    const startTimeRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const wordsSpokenRef = useRef(0);
    const autoSubmitTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto submit mechanic when listening
    useEffect(() => {
        if (isListening && input.trim()) {
            if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
            autoSubmitTimeoutRef.current = setTimeout(() => {
                sendMessage();
            }, 3500); // Wait 3.5 seconds of silence
        }
        return () => {
            if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
        }
    }, [input, isListening]);

    // Initialize Camera
    useEffect(() => {
        if (view === 'interview' && cameraEnabled) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [view, cameraEnabled]);

    const startCamera = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { alert('Camera not supported or requires HTTPS.'); setCameraEnabled(false); return; }
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
        } catch (err) {
            console.error("Camera error:", err);
            setCameraEnabled(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const startVolumeMeter = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { console.warn('Audio not supported or requires HTTPS'); return; }
                            </button >
                        </div >
                    </div >
                )
}

{/* RESUME BUILDER VIEW */ }
{
    view === 'resume-builder' && (
        <div className="w-full h-full flex flex-col md:flex-row gap-6 animate-fade-in-up">
            {/* Left: Input Form */}
            <div className="w-full md:w-1/2 bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FileText className="text-cyan-400" /> Build Your Resume
                </h2>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Full Name</label>
                            <input
                                value={resumeForm.name}
                                onChange={e => setResumeForm({ ...resumeForm, name: e.target.value })}
                                className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Email</label>
                            <input
                                value={resumeForm.email}
                                onChange={e => setResumeForm({ ...resumeForm, email: e.target.value })}
                                className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Phone</label>
                            <input
                                value={resumeForm.phone}
                                onChange={e => setResumeForm({ ...resumeForm, phone: e.target.value })}
                                placeholder="+1 234..."
                                className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase">LinkedIn / Portfolio</label>
                            <input
                                value={resumeForm.links}
                                onChange={e => setResumeForm({ ...resumeForm, links: e.target.value })}
                                placeholder="linkedin.com/in/..."
                                className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Design Template</label>
                        <select
                            value={resumeForm.template}
                            onChange={e => setResumeForm({ ...resumeForm, template: e.target.value })}
                            className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50"
                        >
                            <option value="Modern Professional" className="bg-[var(--bg-primary)]">Modern Professional</option>
                            <option value="Creative Tech" className="bg-[var(--bg-primary)]">Creative Tech</option>
                            <option value="Executive Minimalist" className="bg-[var(--bg-primary)]">Executive Minimalist</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Professional Skills (comma separated)</label>
                        <textarea
                            value={resumeForm.skills}
                            onChange={e => setResumeForm({ ...resumeForm, skills: e.target.value })}
                            placeholder="React, Node.js, Python, Leadership, Public Speaking..."
                            className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] h-20 resize-none focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Experience (Paste raw details)</label>
                        <textarea
                            value={resumeForm.experience}
                            onChange={e => setResumeForm({ ...resumeForm, experience: e.target.value })}
                            placeholder="Software Engineer at Google (2020-Present). Built X feature..."
                            className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] h-32 resize-none focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Education</label>
                        <textarea
                            value={resumeForm.education}
                            onChange={e => setResumeForm({ ...resumeForm, education: e.target.value })}
                            placeholder="B.Tech in CS, XYZ University (2018-2022), GPA 3.8"
                            className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] h-24 resize-none focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Additional Info (Awards, Certs)</label>
                        <textarea
                            value={resumeForm.additionalInfo}
                            onChange={e => setResumeForm({ ...resumeForm, additionalInfo: e.target.value })}
                            placeholder="Certified AWS Sol Arch, Won Hackathon 2024..."
                            className="w-full bg-[var(--bg-secondary)]lack/20 border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] h-24 resize-none focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>

                    <button
                        onClick={handleGenerateResume}
                        disabled={isGeneratingResume}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                    >
                        {isGeneratingResume ? <Loader className="animate-spin" /> : <Sparkles />} Generate Magic Resume
                    </button>
                </div>
            </div>

            {/* Right: Preview */}
            <div className="hidden md:flex w-1/2 bg-white text-[var(--text-primary)] rounded-2xl overflow-hidden flex-col shadow-2xl relative">
                <div className="bg-[var(--bg-secondary)] p-4 border-b flex justify-between items-center z-10">
                    <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <FileText size={18} /> Live Preview
                    </h3>
                    {generatedResume && (
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(generatedResume, null, 2));
                                alert("Raw Resume JSON data copied to clipboard!");
                            }}
                            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline px-3 py-1 rounded border border-cyan-200 bg-white"
                        >
                            Copy Raw JSON
                        </button>
                    )}
                </div>
                <div className="flex-1 p-0 overflow-y-auto bg-[var(--bg-secondary)]/50">
                    {generatedResume ? (
                        <ResumeTemplate data={generatedResume} template={resumeForm.template} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50 select-none">
                            <FileText size={48} className="mb-4 text-[var(--text-secondary)]" />
                            <p className="font-medium">Fill details and click Generate</p>
                            <p className="text-xs mt-2">AI will format it professionally</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

{/* HISTORY VIEW */ }
{
    view === 'history' && (
        <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Interview History</h2>
                <div className="text-sm text-[var(--text-secondary)]">{interviewHistory.length} Sessions</div>
            </div>

            <div className="grid gap-4">
                {interviewHistory.map((session, i) => (
                    <div key={i} className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] hover:border-cyan-500/30 transition-all flex justify-between items-center group">
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${session.overallScore >= 7 ? 'bg-emerald-500/20 text-emerald-400' : session.overallScore >= 4 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                                {session.overallScore}
                            </div>
                            <div>
                                <div className="font-bold text-lg capitalize flex items-center gap-2">
                                    {session.mode} Interview
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-secondary)] border border-[var(--border-color)] normal-case">{new Date(session.startedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-sm text-[var(--text-secondary)] mt-1 flex gap-4">
                                    <span>{session.questionsAsked} Questions</span>
                                    <span>{session.duration ? Math.floor(session.duration / 60) + ' mins' : 'Incomplete'}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => viewTranscript(session)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-opacity opacity-0 group-hover:opacity-100 flex items-center gap-2 text-cyan-">
                            View Details <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            {interviewHistory.length === 0 && (
                <div className="text-center py-20 text-[var(--text-muted)]">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    No past interviews found. Start your first session!
                </div>
            )}
        </div>
    )
}

            </main >
        </div >
    );
}
