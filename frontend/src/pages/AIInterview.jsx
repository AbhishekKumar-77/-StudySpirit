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
    ChevronRight, Star, Sparkles, Clock, Activity, Type, Printer
} from 'lucide-react';

const ResumeTemplate = ({ data, template }) => {
    if (!data || !data.personalInfo) return <div className="text-red-500 p-4">Error loading resume data. Please try again.</div>;

    if (template === 'Creative Tech') {
        return (
            <div className="bg-[#0a0a0f] text-gray-300 p-0 font-sans min-h-full flex flex-col md:flex-row border border-cyan-500/20 shadow-2xl mx-auto w-full max-w-[850px] overflow-hidden rounded-xl">
                {/* Sidebar */}
                <div className="md:w-1/3 bg-[#13151f] p-8 border-r border-cyan-500/10 flex flex-col gap-8">
                    <div>
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white mb-6 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                            {data.personalInfo.name.charAt(0)}
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">{data.personalInfo.name}</h1>
                        <p className="text-cyan-400 font-medium text-sm">Tech Professional</p>
                    </div>

                    <div className="space-y-3 text-sm">
                        {data.personalInfo.email && <div className="flex items-center gap-3"><span className="p-2 rounded-lg bg-white/5 text-cyan-400">📧</span> <span className="truncate">{data.personalInfo.email}</span></div>}
                        {data.personalInfo.phone && <div className="flex items-center gap-3"><span className="p-2 rounded-lg bg-white/5 text-cyan-400">📱</span> {data.personalInfo.phone}</div>}
                        {data.personalInfo.links && <div className="flex items-center gap-3"><span className="p-2 rounded-lg bg-white/5 text-cyan-400">🔗</span> <span className="truncate">{data.personalInfo.links}</span></div>}
                    </div>

                    <div>
                        <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-4 pb-2 border-b border-white/10">Tech Stack</h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills?.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 bg-cyan-500/10 text-cyan-300 text-xs font-semibold rounded-lg border border-cyan-500/20">{skill}</span>
                            ))}
                        </div>
                    </div>

                    {data.education && data.education.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-4 pb-2 border-b border-white/10">Education</h2>
                            <div className="space-y-4">
                                {data.education.map((edu, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="font-bold text-white">{edu.degree}</div>
                                        <div className="text-gray-400 text-xs mt-1">{edu.institution}</div>
                                        <div className="text-cyan-500 text-xs font-mono mt-1">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="md:w-2/3 p-8 bg-[#0a0a0f]">
                    <div className="mb-10">
                        <p className="text-gray-300 leading-relaxed text-sm font-light">{data.summary}</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <span className="w-8 h-px bg-cyan-500"></span> Experience
                        </h2>
                        <div className="space-y-8">
                            {data.experience?.map((exp, i) => (
                                <div key={i} className="relative pl-6 border-l border-white/10">
                                    <div className="absolute w-2.5 h-2.5 bg-cyan-500 rounded-full -left-[5px] top-1.5 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                                    <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                                    <div className="flex justify-between items-center text-sm mb-3 mt-1">
                                        <span className="text-cyan-400 font-medium">{exp.company}</span>
                                        <span className="text-gray-500 font-mono text-xs">{exp.duration}</span>
                                    </div>
                                    <ul className="list-none space-y-2 text-sm text-gray-400 font-light">
                                        {exp.description?.map((desc, j) => (
                                            <li key={j} className="relative pl-4">
                                                <span className="absolute left-0 top-2 w-1 h-1 bg-cyan-500/50 rounded-full"></span>
                                                {desc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {data.additionalInfo && data.additionalInfo.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <span className="w-8 h-px bg-cyan-500"></span> Awards & Extras
                            </h2>
                            <ul className="space-y-2 text-sm text-gray-400 font-light pl-4">
                                {data.additionalInfo.map((info, i) => (
                                    <li key={i} className="relative pl-4">
                                        <span className="absolute left-0 top-2 w-1 h-1 bg-cyan-500/50 rounded-full"></span>
                                        {info}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (template === 'Executive Minimalist') {
        return (
            <div className="bg-white text-gray-800 p-0 font-serif min-h-full flex flex-col md:flex-row shadow-xl mx-auto w-full max-w-[850px] overflow-hidden border border-gray-100">
                {/* Dark Sidebar */}
                <div className="md:w-[32%] bg-slate-900 p-8 text-slate-300 flex flex-col gap-8">
                    <div>
                        <h1 className="text-3xl font-normal text-white mb-2 leading-tight">{data.personalInfo.name.split(' ').map((n, i) => i === 0 ? <span key={i} className="font-bold">{n} </span> : <span key={i}>{n} </span>)}</h1>
                    </div>

                    <div className="space-y-4 text-xs font-sans tracking-wide">
                        {data.personalInfo.email && <div className="break-words">{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                        {data.personalInfo.links && <div className="text-slate-400">{data.personalInfo.links}</div>}
                    </div>

                    <div className="w-full h-px bg-slate-700/50"></div>

                    <div>
                        <h2 className="text-xs font-bold text-white uppercase tracking-[0.15em] mb-4 font-sans">Skills & Expertise</h2>
                        <ul className="space-y-2 text-sm">
                            {data.skills?.map((skill, i) => (
                                <li key={i} className="font-light">{skill}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="w-full h-px bg-slate-700/50"></div>

                    {data.education && data.education.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold text-white uppercase tracking-[0.15em] mb-4 font-sans">Education</h2>
                            <div className="space-y-5">
                                {data.education.map((edu, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="font-semibold text-white mb-1">{edu.degree}</div>
                                        <div className="text-slate-400 font-light text-xs leading-relaxed">{edu.institution}</div>
                                        <div className="text-slate-500 text-xs font-sans mt-2">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* White Main Content */}
                <div className="md:w-[68%] p-10 bg-white">
                    <div className="mb-10">
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em] mb-4 font-sans border-b-2 border-slate-900 inline-block pb-1">Profile</h2>
                        <p className="text-sm leading-relaxed text-slate-700 text-justify">{data.summary}</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em] mb-6 font-sans border-b-2 border-slate-900 inline-block pb-1">Professional Experience</h2>
                        <div className="space-y-8">
                            {data.experience?.map((exp, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="text-lg font-bold text-slate-900">{exp.role}</h3>
                                        <span className="text-xs font-sans text-slate-500 tracking-wider whitespace-nowrap ml-4 border border-slate-200 px-2 py-1 rounded">{exp.duration}</span>
                                    </div>
                                    <div className="text-sm font-semibold text-slate-600 mb-4">{exp.company}</div>
                                    <ul className="list-none space-y-2 text-sm text-slate-700 text-justify">
                                        {exp.description?.map((desc, j) => (
                                            <li key={j} className="relative pl-4 leading-relaxed before:content-['•'] before:absolute before:left-0 before:text-slate-400">
                                                {desc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {data.additionalInfo && data.additionalInfo.length > 0 && (
                        <div className="mb-0">
                            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em] mb-6 font-sans border-b-2 border-slate-900 inline-block pb-1">Additional Information</h2>
                            <ul className="list-none space-y-2 text-sm text-slate-700">
                                {data.additionalInfo.map((info, i) => (
                                    <li key={i} className="relative pl-4 leading-relaxed before:content-['•'] before:absolute before:left-0 before:text-slate-400">
                                        {info}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Modern Professional (Default 2026 Style)
    return (
        <div className="bg-white text-gray-900 p-8 md:p-12 font-sans min-h-full max-w-[850px] mx-auto shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 border-b-4 border-indigo-600 pb-8 gap-6">
                <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">{data.personalInfo.name}</h1>
                </div>
                <div className="md:text-right text-sm text-gray-600 space-y-1.5 font-medium flex flex-col items-start md:items-end">
                    {data.personalInfo.email && <div className="flex items-center gap-2"><span className="text-indigo-600">✉</span> {data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div className="flex items-center gap-2"><span className="text-indigo-600">☎</span> {data.personalInfo.phone}</div>}
                    {data.personalInfo.links && <div className="flex items-center gap-2 text-indigo-600"><span className="text-gray-400">🔗</span> {data.personalInfo.links}</div>}
                </div>
            </div>

            <div className="mb-10 max-w-3xl">
                <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium">{data.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-10">
                {/* Left Column */}
                <div className="space-y-10">
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Core Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills?.map((skill, i) => (
                                <span key={i} className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-md">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {data.education && data.education.length > 0 && (
                        <div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Education</h2>
                            <div className="space-y-6">
                                {data.education.map((edu, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="font-bold text-gray-900">{edu.degree}</div>
                                        <div className="text-indigo-600 font-bold mb-1">{edu.institution}</div>
                                        <div className="text-gray-500 text-xs font-bold tracking-wider">{edu.year}</div>
                                        {edu.details && <div className="text-gray-600 text-xs mt-2 leading-relaxed">{edu.details}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {data.additionalInfo && data.additionalInfo.length > 0 && (
                        <div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Awards</h2>
                            <ul className="space-y-3">
                                {data.additionalInfo.map((info, i) => (
                                    <li key={i} className="text-sm text-gray-700 font-medium leading-relaxed border-l-2 border-indigo-200 pl-3">
                                        {info}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Experience</h2>
                        <div className="space-y-10">
                            {data.experience?.map((exp, i) => (
                                <div key={i} className="group">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2 gap-2">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{exp.role}</h3>
                                        <span className="text-gray-500 text-sm font-bold tracking-wide">{exp.duration}</span>
                                    </div>
                                    <div className="text-indigo-600 font-bold mb-4">{exp.company}</div>
                                    <ul className="space-y-2.5 text-sm text-gray-700 marker:text-indigo-400">
                                        {exp.description?.map((desc, j) => (
                                            <li key={j} className="relative pl-5 leading-relaxed before:content-[''] before:w-1.5 before:h-1.5 before:bg-indigo-400 before:absolute before:left-0 before:top-2 before:rounded-sm">
                                                {desc}
                                            </li>
                                        ))}
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
    const [totalQuestionsConfig, setTotalQuestionsConfig] = useState(10); 
    const [targetRole, setTargetRole] = useState('Software Engineer');
    const [targetCompany, setTargetCompany] = useState('General Tech');
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

    // Bug #2 fix: use a ref to hold latest sendMessage to avoid stale closure in auto-submit
    const sendMessageRef = useRef(null);

    // Auto submit mechanic when listening
    useEffect(() => {
        if (isListening && input.trim()) {
            if (autoSubmitTimeoutRef.current) clearTimeout(autoSubmitTimeoutRef.current);
            autoSubmitTimeoutRef.current = setTimeout(() => {
                // Use ref to always call the latest version of sendMessage
                if (sendMessageRef.current) sendMessageRef.current();
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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
            microphoneRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setVocalVolume(average);
                volIntervalRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();
        } catch (err) {
            console.error("Volume meter error:", err);
        }
    };

    const stopVolumeMeter = () => {
        if (volIntervalRef.current) cancelAnimationFrame(volIntervalRef.current);
        if (microphoneRef.current) microphoneRef.current.disconnect();
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
        }
        analyserRef.current = null;
        setVocalVolume(0);
    };

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setSpeechSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;

                        // Bug #9 fix: filler words — check both single words AND multi-word phrases
                        const lowerTranscript = transcript.toLowerCase();
                        const words = lowerTranscript.split(/\s+/);
                        const singleFillers = ['um', 'uh', 'like', 'literally', 'basically', 'actually'];
                        const phraseFillers = ['sort of', 'you know', 'kind of', 'i mean', 'you see'];
                        let fillers = 0;
                        words.forEach(w => {
                            if (singleFillers.includes(w.replace(/[^a-z]/g, ''))) fillers++;
                        });
                        phraseFillers.forEach(phrase => {
                            const regex = new RegExp(phrase, 'g');
                            const matches = lowerTranscript.match(regex);
                            if (matches) fillers += matches.length;
                        });
                        setFillerWordCount(prev => prev + fillers);

                        // Advanced Analytics: WPM
                        wordsSpokenRef.current += words.length;
                    }
                }
                if (finalTranscript) {
                    setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    // Load History
    const loadHistory = async () => {
        try {
            setIsLoading(true);
            const data = await soloApi.getInterviewHistory();
            if (data.success) {
                setInterviewHistory(data.sessions);
            }
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Bug #6 fix: removed selectedVoiceURI from dep array — was causing infinite re-render loop
    useEffect(() => {
        const loadVoices = () => {
            let voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                let engVoices = voices.filter(v => v.lang.startsWith('en'));
                engVoices.sort((a, b) => {
                    const aNat = a.name.includes('Natural') || a.name.includes('Online') || a.name.includes('Google') || a.name.includes('Microsoft');
                    const bNat = b.name.includes('Natural') || b.name.includes('Online') || b.name.includes('Google') || b.name.includes('Microsoft');
                    return (aNat === bNat) ? 0 : aNat ? -1 : 1;
                });
                setAvailableVoices(engVoices);
                // Only set default once — don't overwrite user's manual choice
                setSelectedVoiceURI(prev => {
                    if (prev) return prev;
                    const best = engVoices.find(v => v.name.includes('Aria') || v.name.includes('Jenny') || v.name.includes('Google')) || engVoices[0];
                    return best?.voiceURI || '';
                });
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []); // Bug #6: empty dep array — only load voices once

    const speak = (text) => {
        if (!autoSpeak) return;
        window.speechSynthesis.cancel();

        // Clean markdown formatting
        const cleanText = text.replace(/[*_`#]/g, '').replace(/\n+/g, '. ').trim();

        // Split into sentences for natural pauses
        const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.voiceURI === selectedVoiceURI) || voices[0];

        setIsSpeaking(true);
        speechStoppedRef.current = false;

        let index = 0;
        const speakNext = () => {
            if (speechStoppedRef.current || index >= sentences.length) {
                setIsSpeaking(false);
                return;
            }

            const sentence = sentences[index].trim();
            if (!sentence) {
                index++;
                speakNext();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(sentence);

            if (voice) utterance.voice = voice;
            utterance.rate = 0.92;   // Slightly slower = more natural
            utterance.pitch = 1.05;  // Slightly higher = warmer female voice
            utterance.volume = 1.0;

            utterance.onend = () => {
                index++;
                // Natural pause between sentences (200-400ms)
                setTimeout(speakNext, 200 + Math.random() * 200);
            };
            utterance.onerror = () => {
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        };

        speakNext();
    };

    const stopSpeaking = () => {
        speechStoppedRef.current = true;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const toggleListening = () => {
        if (!speechSupported) {
            alert("Speech recognition is not supported in your browser. Please use Chrome.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            stopVolumeMeter();
        } else {
            stopSpeaking();
            recognitionRef.current?.start();
            setIsListening(true);
            startVolumeMeter();
        }
    };

    // Cleanup intervals
    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            stopVolumeMeter();
        };
    }, []);

    const startInterview = async () => {
        if (!resumeText.trim() && !resumeFile && mode === 'resume') {
            alert("Please paste your resume content OR upload a PDF first.");
            return;
        }

        setView('interview');
        setMessages([]);
        setIsLoading(true);
        setCurrentQuestionNum(1);
        setSessionId(null);
        setFillerWordCount(0);
        setWpm(0);
        wordsSpokenRef.current = 0;
        setElapsedTime(0);

        // Start Timer
        startTimeRef.current = Date.now();
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setElapsedTime(elapsed);
            if (elapsed > 10) {
                const mins = elapsed / 60;
                setWpm(Math.round(wordsSpokenRef.current / mins));
            }
        }, 1000);

        try {
            let response;
            // Bug #3 fix: use configurable totalQuestionsConfig instead of hardcoded 999
            const payload = {
                mode,
                role: targetRole,
                company: targetCompany,
                totalQuestions: totalQuestionsConfig,
                questionNumber: 1
            };

            if (resumeFile) {
                const formData = new FormData();
                formData.append('resume', resumeFile);
                formData.append('mode', mode);
                formData.append('role', targetRole);
                formData.append('company', targetCompany);
                formData.append('totalQuestions', totalQuestionsConfig);
                formData.append('questionNumber', 1);
                response = await soloApi.startInterview(formData);
            } else {
                response = await soloApi.startInterview({
                    ...payload,
                    resumeText
                });
            }

            if (response && response.response) {
                if (response.resumeTextParsed) {
                    setResumeText(response.resumeTextParsed);
                }
                setSessionId(response.sessionId);
                const aiMsg = { role: 'ai', content: response.response, score: 0 };
                setMessages([aiMsg]);
                speak(response.response);
            }
        } catch (error) {
            console.error('Failed to start interview:', error);
            setMessages([{ role: 'ai', content: "Error connecting to AI Interviewer. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return; // Bug #7 fix: guard against rapid double-sends

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }
        stopSpeaking();

        const userMsg = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const context = messages.slice(-10).map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.content
            }));

            const nextQNum = currentQuestionNum + 1;

            const response = await soloApi.startInterview({
                mode,
                role: targetRole,
                company: targetCompany,
                message: userMsg.content,
                context: context,
                sessionId,
                totalQuestions: totalQuestionsConfig, 
                questionNumber: nextQNum
            });

            if (response && response.response) {
                setCurrentQuestionNum(nextQNum);
                const score = response.parsedResponse?.score || 0;
                const feedback = response.parsedResponse?.feedback || "";

                const aiMsg = {
                    role: 'ai',
                    content: response.response,
                    score: score,
                    feedback: feedback
                };
                setMessages(prev => [...prev, aiMsg]);
                speak(response.response);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, { role: 'ai', content: "Connection error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Bug #2 fix: keep ref in sync so auto-submit always uses latest sendMessage
    useEffect(() => { sendMessageRef.current = sendMessage; });

    const finishInterview = async (lastAnswer, lastQuestion) => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        stopVolumeMeter();
        if (isListening) recognitionRef.current?.stop();
        setIsListening(false);

        setIsLoading(true);
        try {
            const response = await soloApi.endInterview({
                sessionId,
                lastAnswer,
                lastQuestion: lastQuestion || "Final Question",
                lastQuestionNumber: currentQuestionNum
            });

            if (response.success) {
                setSessionReport(response.report);
                setView('report');
                stopSpeaking();
            }
        } catch (error) {
            console.error("Failed to end interview:", error);
            alert("Error generating report. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                setResumeFile(file);
            } else {
                alert("Please upload a PDF file.");
                e.target.value = null;
            }
        }
    };

    const viewTranscript = async (sessionParam) => {
        try {
            setIsLoading(true);
            const { session } = await soloApi.getInterviewSession(sessionParam._id);
            // Re-create the structure that endInterview returns to use the 'report' view
            setSessionReport({
                ...session,
                strengths: session.strengths || [],
                improvements: session.improvements || [],
                finalFeedback: session.finalFeedback || "Session was not fully completed.",
                overallScore: session.overallScore || 0,
                mode: session.mode,
                totalQuestions: session.exchanges ? session.exchanges.length : 0,
                duration: session.duration || 0,
            });
            setView('report');
        } catch (error) {
            console.error("Failed to load transcript:", error);
            alert("Could not load full transcript. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateResume = async () => {
        if (!resumeForm.experience && !resumeForm.education) {
            alert("Please fill in at least Experience or Education.");
            return;
        }
        setIsGeneratingResume(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/solo/ai/resume/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    personalInfo: {
                        name: resumeForm.name,
                        email: resumeForm.email,
                        phone: resumeForm.phone,
                        links: resumeForm.links
                    },
                    experience: resumeForm.experience,
                    education: resumeForm.education,
                    skills: resumeForm.skills,
                    additionalInfo: resumeForm.additionalInfo,
                    template: resumeForm.template
                })
            });
            const data = await res.json();
            if (data.resume) {
                setGeneratedResume(data.resume);
            }
        } catch (err) {
            console.error(err);
            alert("Error generating resume");
        } finally {
            setIsGeneratingResume(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans relative overflow-y-auto overflow-x-hidden">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border-color)] px-6 py-4 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/10 rounded-lg">
                        <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2 rounded-lg">
                            <Mic className="w-6 h-6 text-[var(--text-primary)]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AI Interview Prep</h1>
                            <p className="text-xs text-[var(--text-secondary)]">Mock Interview with Aria</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (view === 'history') setView('setup');
                            else {
                                loadHistory();
                                setView('history');
                            }
                        }}
                        className={`p-2 rounded-lg transition-all ${view === 'history' ? 'bg-cyan-500/20 text-cyan-500' : 'hover:bg-white/5 text-[var(--text-secondary)]'}`}
                    >
                        <History className="w-5 h-5" />
                    </button>
                    {view === 'interview' && (
                        <button
                            onClick={() => setCameraEnabled(!cameraEnabled)}
                            className={`p-2 rounded-lg transition-all ${cameraEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
                        >
                            {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                        </button>
                    )}
                    <button
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        className={`p-2 rounded-lg transition-all ${autoSpeak ? 'bg-cyan-500/20 text-cyan-500' : 'bg-white/5 text-[var(--text-muted)]'}`}
                    >
                        {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                    {view === 'interview' && (
                        <button
                            onClick={() => {
                                stopSpeaking();
                                if (sessionId && messages.length > 1) {
                                    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                                    // Bug #4 fix: lastQuestion should be the AI's question, not its follow-up response
                                    // Find the last AI message BEFORE the last user message
                                    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
                                    const msgsBeforeLastUser = messages.slice(0, messages.length - lastUserIdx);
                                    const lastAiQuestion = [...msgsBeforeLastUser].reverse().find(m => m.role === 'ai');
                                    finishInterview(lastUserMsg?.content || '', lastAiQuestion?.content || '');
                                } else {
                                    setView('setup');
                                }
                            }}
                            className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30"
                        >
                            End Session
                        </button>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 flex gap-6 min-h-[calc(100vh-80px)]">

                {/* SETUP VIEW */}
                {view === 'setup' && (
                    <div className="w-full flex flex-col md:flex-row gap-8 animate-fade-in-up">
                        <div className="flex-1 space-y-8">
                            <div>
                                <h2 className="text-4xl font-bold mb-4">Master Your Interview Skills</h2>
                                <p className="text-[var(--text-secondary)] text-lg">Practice with Aria, our AI interviewer. Get real-time feedback, scoring, and confidence analysis.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className={`p-6 rounded-2xl border cursor-pointer transition-all ${mode === 'technical' ? 'bg-cyan-500/10 border-cyan-500' : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-cyan-500/50'}`} onClick={() => setMode('technical')}>
                                    <Cpu className={`w-8 h-8 mb-4 ${mode === 'technical' ? 'text-cyan-500' : 'text-[var(--text-muted)]'}`} />
                                    <h3 className="text-xl font-bold mb-2">Technical Round</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">DSA, System Design, and coding concepts. Strict and focused.</p>
                                </div>
                                <div className={`p-6 rounded-2xl border cursor-pointer transition-all ${mode === 'behavioral' ? 'bg-pink-600/10 border-pink-500' : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-pink-500/50'}`} onClick={() => setMode('behavioral')}>
                                    <User className={`w-8 h-8 mb-4 ${mode === 'behavioral' ? 'text-pink-400' : 'text-[var(--text-muted)]'}`} />
                                    <h3 className="text-xl font-bold mb-2">HR / Behavioral</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Soft skills, STAR method, and cultural fit evaluation.</p>
                                </div>
                                <div className={`p-6 rounded-2xl border cursor-pointer transition-all ${view === 'resume-builder' ? 'bg-cyan-600/10 border-cyan-500' : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-cyan-500/50'}`} onClick={() => setView('resume-builder')}>
                                    <FileText className={`w-8 h-8 mb-4 ${view === 'resume-builder' ? 'text-cyan-400' : 'text-[var(--text-muted)]'}`} />
                                    <h3 className="text-xl font-bold mb-2">AI Resume Builder</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Craft a perfect ATS-friendly resume with AI assistance.</p>
                                </div>
                            </div>

                            <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)]">
                                <h3 className="font-semibold mb-4">Interview Configuration</h3>
                                <div className="space-y-4">

                                    {/* Bug #3 fix: let user choose number of questions */}
                                    <div>
                                        <label className="block text-sm text-[var(--text-secondary)] mb-2">Number of Questions</label>
                                        <div className="flex gap-2">
                                            {[5, 10, 15, 20].map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => setTotalQuestionsConfig(n)}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                                                        totalQuestionsConfig === n
                                                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-500/40'
                                                    }`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Additional Targeting */}
                                    {(mode === 'technical' || mode === 'behavioral') && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-[var(--text-secondary)] mb-2">Target Role</label>
                                                <select
                                                    value={targetRole}
                                                    onChange={e => setTargetRole(e.target.value)}
                                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-[var(--text-secondary)] focus:border-cyan-500/50 focus:outline-none"
                                                >
                                                    <option value="Software Engineer">Software Engineer (SWE)</option>
                                                    <option value="Frontend Developer">Frontend Developer</option>
                                                    <option value="Backend Developer">Backend Developer</option>
                                                    <option value="Data Scientist">Data Scientist</option>
                                                    <option value="Product Manager">Product Manager (PM)</option>
                                                    <option value="DevOps Engineer">DevOps Engineer</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-[var(--text-secondary)] mb-2">Target Company</label>
                                                <select
                                                    value={targetCompany}
                                                    onChange={e => setTargetCompany(e.target.value)}
                                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-[var(--text-secondary)] focus:border-cyan-500/50 focus:outline-none"
                                                >
                                                    <option value="General Tech">General Tech</option>
                                                    <option value="Google">Google (FAANG style)</option>
                                                    <option value="Amazon">Amazon (Leadership principles)</option>
                                                    <option value="Startup">High-Growth Startup</option>
                                                    <option value="Finance">FinTech / Trading</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm text-[var(--text-secondary)] mb-2">Interviewer Voice</label>
                                        <select
                                            value={selectedVoiceURI}
                                            onChange={e => {
                                                setSelectedVoiceURI(e.target.value);
                                                // Test voice
                                                const u = new SpeechSynthesisUtterance("Hi! I will be your interviewer.");
                                                const v = availableVoices.find(voice => voice.voiceURI === e.target.value);
                                                if (v) u.voice = v;
                                                window.speechSynthesis.speak(u);
                                            }}
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 text-sm text-[var(--text-secondary)] focus:border-cyan-500/50 focus:outline-none mb-4"
                                        >
                                            <option value="" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Select a natural human voice...</option>
                                            {availableVoices.map((v, i) => (
                                                <option key={i} value={v.voiceURI} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                                                    {v.name} ({v.lang})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-[var(--text-secondary)] mb-2">Resume (Optional)</label>
                                        <div className="flex gap-4 items-center">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 bg-white/5 border border-[var(--border-color)] rounded-lg text-sm hover:bg-white/10 flex items-center gap-2"
                                            >
                                                <UploadCloud className="w-4 h-4" />
                                                {resumeFile ? resumeFile.name : "Upload PDF"}
                                            </button>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
                                            {resumeFile && <button onClick={() => setResumeFile(null)}><X className="w-4 h-4 text-[var(--text-muted)]" /></button>}
                                        </div>
                                        <textarea
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                            placeholder="Or paste resume text here..."
                                            className="w-full mt-3 h-24 bg-[var(--bg-secondary)] rounded-lg p-3 text-sm text-[var(--text-secondary)] border border-[var(--border-color)] focus:border-cyan-500/50 focus:outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={startInterview}
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-pink-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-violet-500/25 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader className="animate-spin" /> : <Play />} Start Interview
                            </button>
                        </div>

                        {/* Right Side - Avatar Preview */}
                        <div className="hidden md:flex w-1/3 flex-col gap-4">
                            <div className="aspect-[3/4] rounded-2xl border border-[var(--border-color)] relative overflow-hidden">
                                <AriaAvatar isSpeaking={false} />
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent">
                                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">Aria</h3>
                                    <p className="text-violet-300">Senior Tech Recruiter</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* INTERVIEW VIEW */}
                {view === 'interview' && (
                    <div className="w-full flex gap-6">
                        {/* Left Main Interface */}
                        <div className="flex-1 flex flex-col bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] overflow-hidden relative">
                            {/* Header / Question Progress */}
                            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-primary)]">
                                <span className="font-mono text-cyan-500 font-bold">Question {currentQuestionNum}</span>
                                <div className="text-xs text-[var(--text-muted)]">Click "End Session" when done</div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-cyan-500/90 text-white rounded-tr-sm' : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-sm'}`}>
                                            {msg.content}
                                            {msg.role === 'ai' && msg.feedback && (
                                                <div className="mt-3 pt-3 border-t border-[var(--border-color)] text-xs text-yellow-500/80 italic">
                                                    Feedback: "{msg.feedback}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-2 items-center text-[var(--text-muted)] text-sm ml-4">
                                        <Loader className="w-4 h-4 animate-spin" /> Aria is thinking...
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Controls */}
                            <div className="p-4 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={toggleListening}
                                        className={`p-4 rounded-full shadow-lg transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-cyan-500 to-pink-600 hover:scale-105'}`}
                                    >
                                        {isListening ? <MicOff className="w-6 h-6 text-[var(--text-primary)]" /> : <Mic className="w-6 h-6 text-[var(--text-primary)]" />}
                                    </button>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={isListening ? "Listening..." : "Type your answer..."}
                                            className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 pr-12 rounded-xl border border-[var(--border-color)] focus:border-cyan-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!input.trim() || isLoading}
                                            className="absolute right-2 top-2 p-2 bg-white/10 hover:bg-cyan-500 rounded-lg transition-colors text-[var(--text-primary)] disabled:opacity-50"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Visuals */}
                        <div className="hidden lg:flex w-80 flex-col gap-4">
                            {/* AI Avatar */}
                            <div className="aspect-video rounded-xl overflow-hidden relative border border-[var(--border-color)]">
                                <AriaAvatar isSpeaking={isSpeaking} />
                            </div>

                            {/* User Camera */}
                            <div className="aspect-video bg-[var(--bg-secondary)] rounded-xl overflow-hidden relative border border-[var(--border-color)]">
                                {cameraEnabled ? (
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[var(--bg-primary)]">
                                        <CameraOff className="w-8 h-8 text-[var(--text-primary)]" />
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-bold text-white">You</div>
                            </div>

                            {/* Status Card */}
                            <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-color)] space-y-3">
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <span className="text-[var(--text-secondary)] flex items-center gap-2"><Clock className="w-4 h-4" /> Time</span>
                                    <span className="font-mono text-[var(--text-primary)]">{String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:{String(elapsedTime % 60).padStart(2, '0')}</span>
                                </div>
                                <div className="space-y-2 pt-3 border-t border-[var(--border-color)]">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[var(--text-secondary)] flex items-center gap-2" title="Avoid filler words like 'um', 'uh', 'like'"><Type className="w-4 h-4" /> Filler Words</span>
                                        <span className={`font-bold ${fillerWordCount > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>{fillerWordCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[var(--text-secondary)] flex items-center gap-2" title="Optimal pacing is ~120 WPM"><Activity className="w-4 h-4" /> Pace (WPM)</span>
                                        <span className="font-bold text-[var(--text-primary)]">{wpm || '--'}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-[var(--border-color)]">
                                    <span className="text-[var(--text-secondary)] text-xs mb-2 block">Vocal Confidence</span>
                                    <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-75"
                                            style={{ width: `${Math.min(100, (vocalVolume / 128) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* REPORT VIEW */}
                {view === 'report' && sessionReport && (
                    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">Interview Analysis</h2>
                            <p className="text-[var(--text-secondary)]">Here's how you performed with Aria.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Score Card */}
                            <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden text-center flex flex-col items-center justify-center">
                                <div className="absolute inset-0 bg-cyan-500/10 blur-xl" />
                                <div className="relative">
                                    <div className="text-5xl font-black text-[var(--text-primary)] mb-2">{sessionReport.overallScore}<span className="text-xl text-[var(--text-muted)]">/10</span></div>
                                    <div className="text-sm px-3 py-1 rounded-full bg-cyan-500/20 text-violet-300 inline-block font-semibold">Overall Score</div>
                                </div>
                            </div>

                            {/* Strengths */}
                            <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] relative md:col-span-2">
                                <h3 className="flex items-center gap-2 font-bold mb-4 text-emerald-400"><CheckCircle className="w-5 h-5" /> Key Strengths</h3>
                                <ul className="space-y-2">
                                    {sessionReport.strengths.map((s, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" /> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Improvements */}
                            <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] relative">
                                <h3 className="flex items-center gap-2 font-bold mb-4 text-amber-400"><AlertCircle className="w-5 h-5" /> Areas for Improvement</h3>
                                <ul className="space-y-2">
                                    {sessionReport.improvements.map((s, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" /> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Final Feedback */}
                            <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] relative">
                                <h3 className="flex items-center gap-2 font-bold mb-4 text-cyan-500"><Trophy className="w-5 h-5" /> Coach's Feedback</h3>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
                                    "{sessionReport.finalFeedback}"
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button onClick={() => setView('setup')} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">
                                Back to Menu
                            </button>
                            <button onClick={() => { setMode(sessionReport.mode); setView('setup'); }} className="px-8 py-3 bg-cyan-500 hover:bg-violet-700 rounded-xl font-bold transition-all shadow-lg shadow-violet-500/20">
                                Try Again
                            </button>
                        </div>

                        {/* DETAILED TRANSCRIPT */}
                        {sessionReport.exchanges && sessionReport.exchanges.length > 0 && (
                            <div className="mt-12 bg-[var(--bg-primary)] p-8 rounded-2xl border border-[var(--border-color)]">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <FileText className="text-cyan-500" /> Detailed Transcript Log
                                </h3>
                                <div className="space-y-8">
                                    {sessionReport.exchanges.map((exchange, idx) => (
                                        <div key={idx} className="pb-6 border-b border-[var(--border-color)] last:border-0 last:pb-0">
                                            <div className="flex gap-4 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shrink-0">
                                                    <Mic className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="w-full">
                                                    <div className="text-sm font-bold text-[var(--text-secondary)] mb-1">Aria (Question {exchange.questionNumber})</div>
                                                    <div className="text-[var(--text-primary)] font-medium bg-[var(--bg-secondary)]lack/20 p-4 rounded-lg border border-[var(--border-color)]">
                                                        {exchange.question}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 ml-8">
                                                <div className="w-full">
                                                    <div className="text-sm font-bold text-[var(--text-secondary)] mb-1 text-right">You</div>
                                                    <div className="bg-cyan-500/10 text-[var(--text-primary)] p-4 rounded-lg border border-cyan-500/20">
                                                        {exchange.answer}
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-4 bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 ml-12">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-yellow-500 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" /> AI Evaluation</h4>
                                                    <p className="text-sm text-[var(--text-secondary)] mt-1">{exchange.feedback}</p>
                                                    {exchange.idealAnswer && (
                                                        <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                                            <h5 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Ideal Answer Concept</h5>
                                                            <p className="text-sm text-[var(--text-secondary)]">{exchange.idealAnswer}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center justify-center shrink-0 pr-4">
                                                    <div className="text-2xl font-black text-yellow-500">{exchange.score}</div>
                                                    <div className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-widest">Score</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* RESUME BUILDER VIEW */}
                {view === 'resume-builder' && (
                    <div className="w-full h-full flex flex-col md:flex-row gap-6 animate-fade-in-up">
                        {/* Left: Input Form */}
                        <div className="w-full md:w-1/2 bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] overflow-y-auto print:hidden">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <FileText className="text-cyan-400" /> AI Resume Builder
                            </h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Full Name</label>
                                        <input
                                            value={resumeForm.name}
                                            onChange={e => setResumeForm({ ...resumeForm, name: e.target.value })}
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Email</label>
                                        <input
                                            value={resumeForm.email}
                                            onChange={e => setResumeForm({ ...resumeForm, email: e.target.value })}
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Phone</label>
                                        <input
                                            value={resumeForm.phone}
                                            onChange={e => setResumeForm({ ...resumeForm, phone: e.target.value })}
                                            placeholder="+1 234..."
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">LinkedIn / Portfolio</label>
                                        <input
                                            value={resumeForm.links}
                                            onChange={e => setResumeForm({ ...resumeForm, links: e.target.value })}
                                            placeholder="linkedin.com/in/..."
                                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Design Template</label>
                                    <select
                                        value={resumeForm.template}
                                        onChange={e => setResumeForm({ ...resumeForm, template: e.target.value })}
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50"
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
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] h-20 resize-none focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Experience (Paste raw details)</label>
                                    <textarea
                                        value={resumeForm.experience}
                                        onChange={e => setResumeForm({ ...resumeForm, experience: e.target.value })}
                                        placeholder="Software Engineer at Google (2020-Present). Built X feature..."
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] h-32 resize-none focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Education</label>
                                    <textarea
                                        value={resumeForm.education}
                                        onChange={e => setResumeForm({ ...resumeForm, education: e.target.value })}
                                        placeholder="B.Tech in CS, XYZ University (2018-2022), GPA 3.8"
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] h-24 resize-none focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Additional Info (Awards, Certs)</label>
                                    <textarea
                                        value={resumeForm.additionalInfo}
                                        onChange={e => setResumeForm({ ...resumeForm, additionalInfo: e.target.value })}
                                        placeholder="Certified AWS Sol Arch, Won Hackathon 2024..."
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 mt-1 text-[var(--text-primary)] h-24 resize-none focus:outline-none focus:border-cyan-500/50"
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
                        <div className="hidden md:flex w-1/2 bg-white text-[var(--text-primary)] rounded-2xl overflow-hidden flex-col shadow-2xl relative print:flex print:w-full print:absolute print:inset-0 print:border-none print:shadow-none print:z-50 print:bg-white print:m-0 print:p-0">
                            <div className="bg-[var(--bg-secondary)] p-4 border-b flex justify-between items-center z-10 print:hidden">
                                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <FileText size={18} /> Live Preview
                                </h3>
                                {generatedResume && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => window.print()}
                                            className="text-xs flex items-center gap-1 font-bold text-violet-600 hover:text-violet-700 hover:bg-violet-50 px-3 py-1.5 rounded border border-violet-200 bg-white transition-colors"
                                        >
                                            <Printer size={14} /> Export PDF
                                        </button>
                                        {/* Bug #5 fix: copy formatted readable text, not raw JSON */}
                                        <button
                                            onClick={() => {
                                                const r = generatedResume;
                                                const lines = [
                                                    r.personalInfo?.name, r.personalInfo?.email, r.personalInfo?.phone, r.personalInfo?.links,
                                                    '', r.summary || '',
                                                    '', 'SKILLS:', (r.skills || []).join(', '),
                                                    '', 'EXPERIENCE:',
                                                    ...(r.experience || []).flatMap(e => [`${e.role} @ ${e.company} (${e.duration})`, ...(e.description || []).map(d => `  • ${d}`), '']),
                                                    'EDUCATION:',
                                                    ...(r.education || []).map(e => `${e.degree} — ${e.institution} (${e.year})`),
                                                ];
                                                navigator.clipboard.writeText(lines.filter(Boolean).join('\n'));
                                                alert('Resume copied as plain text!');
                                            }}
                                            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 px-3 py-1.5 rounded border border-cyan-200 bg-white transition-colors"
                                        >
                                            Copy Text
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 p-6 overflow-y-auto bg-slate-100/10 backdrop-blur-sm print:overflow-visible print:bg-white print:p-0 flex justify-center items-start">
                                {generatedResume ? (
                                    <div className="w-full h-auto transition-all bg-white shadow-2xl overflow-hidden">
                                        <ResumeTemplate data={generatedResume} template={resumeForm.template} />
                                    </div>
                                ) : (
                                    <div className="h-full w-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50 select-none pt-20">
                                        <FileText size={48} className="mb-4 text-[var(--text-secondary)]" />
                                        <p className="font-medium">Fill details and click Generate</p>
                                        <p className="text-xs mt-2">AI will format it professionally</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* HISTORY VIEW */}
                {view === 'history' && (
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
                                    <button onClick={() => viewTranscript(session)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-opacity opacity-0 group-hover:opacity-100 flex items-center gap-2 text-cyan-500">
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
                )}

            </main>
        </div>
    );
}
