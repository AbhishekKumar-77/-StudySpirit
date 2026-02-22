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
            <div className="bg-[#0b0f19] text-slate-300 p-8 rounded-lg font-sans min-h-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <div className="border-b border-cyan-500/30 pb-6 mb-6">
                    <h1 className="text-4xl font-bold text-cyan-400 mb-2 tracking-tight">{data.personalInfo.name}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        {data.personalInfo.email && <span className="flex items-center gap-1">✉ {data.personalInfo.email}</span>}
                        {data.personalInfo.phone && <span className="flex items-center gap-1">☎ {data.personalInfo.phone}</span>}
                        {data.personalInfo.links && <span className="flex items-center gap-1">🔗 {data.personalInfo.links}</span>}
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-slate-300 leading-relaxed text-sm bg-cyan-950/20 p-4 rounded-lg border border-cyan-500/10 italic">"{data.summary}"</p>
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-bold text-white uppercase tracking-widest border-l-4 border-cyan-500 pl-3 mb-4">Core Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills?.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-cyan-500/10 text-cyan-300 text-xs font-medium rounded-full border border-cyan-500/20">{skill}</span>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-bold text-white uppercase tracking-widest border-l-4 border-cyan-500 pl-3 mb-4">Experience</h2>
                    <div className="space-y-6">
                        {data.experience?.map((exp, i) => (
                            <div key={i} className="relative pl-4 border-l border-slate-700">
                                <div className="absolute w-2 h-2 bg-cyan-500 rounded-full -left-[5px] top-2 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                                <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                                <div className="text-cyan-400 font-medium text-sm mb-2">{exp.company} <span className="text-slate-500 mx-2">|</span> {exp.duration}</div>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
                                    {exp.description?.map((desc, j) => <li key={j}>{desc}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-bold text-white uppercase tracking-widest border-l-4 border-cyan-500 pl-3 mb-4">Education</h2>
                    <div className="space-y-4">
                        {data.education?.map((edu, i) => (
                            <div key={i} className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                                <h3 className="text-lg font-bold text-white">{edu.degree}</h3>
                                <div className="text-cyan-400 text-sm mb-1">{edu.institution} • {edu.year}</div>
                                {edu.details && <p className="text-sm text-slate-400">{edu.details}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                {data.additionalInfo && data.additionalInfo.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-widest border-l-4 border-cyan-500 pl-3 mb-4">Awards & Certifications</h2>
                        <ul className="list-inside list-disc space-y-1 text-sm text-slate-400">
                            {data.additionalInfo.map((info, i) => <li key={i}>{info}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    if (template === 'Executive Minimalist') {
        return (
            <div className="bg-[#fdfdfd] text-gray-800 p-10 font-serif min-h-full max-w-3xl border border-gray-200 shadow-sm mx-auto">
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
        <div className="bg-white text-slate-800 p-8 font-sans min-h-full max-w-3xl mx-auto shadow-md border-t-8 border-cyan-600">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 border-b-2 border-slate-100 pb-6 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-1">{data.personalInfo.name}</h1>
                    <h3 className="text-lg text-violet-600 font-medium">Professional Profile</h3>
                </div>
                <div className="md:text-right text-sm text-slate-500 space-y-1 font-medium">
                    {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                    {data.personalInfo.links && <div className="text-cyan-">{data.personalInfo.links}</div>}
                </div>
            </div>

            <div className="mb-6">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{data.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] gap-8">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Skills</h2>
                        <ul className="space-y-2">
                            {data.skills?.map((skill, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-center gap-2 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-/80"></span> {skill}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {data.education && data.education.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 mt-8">Education</h2>
                            <div className="space-y-4">
                                {data.education.map((edu, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="font-bold text-slate-800">{edu.degree}</div>
                                        <div className="text-violet-600 font-bold mb-1">{edu.institution}</div>
                                        <div className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">{edu.year}</div>
                                        {edu.details && <div className="text-slate-500 text-xs mt-1">{edu.details}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6 md:border-l-2 md:border-slate-100 md:pl-8">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Experience</h2>
                        <div className="space-y-6">
                            {data.experience?.map((exp, i) => (
                                <div key={i}>
                                    <h3 className="text-lg font-bold text-slate-800">{exp.role}</h3>
                                    <div className="flex flex-wrap gap-2 justify-between items-center text-sm mb-2">
                                        <span className="text-violet-600 font-bold">{exp.company}</span>
                                        <span className="text-slate-500 text-xs bg-slate-100 px-2 py-1 rounded uppercase tracking-wider font-semibold">{exp.duration}</span>
                                    </div>
                                    <ul className="list-disc list-outside ml-4 space-y-1.5 text-sm text-slate-600 marker:text-slate-300">
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

                        // Advanced Analytics: Filler Words
                        const words = transcript.toLowerCase().split(/\s+/);
                        const fillerWords = ['um', 'uh', 'like', 'literally', 'basically', 'actually', 'sort of'];
                        let fillers = 0;
                        words.forEach(w => {
                            if (fillerWords.includes(w.replace(/[^a-z]/g, ''))) fillers++;
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

    // Load Human-like voices
    useEffect(() => {
        const loadVoices = () => {
            let voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                let engVoices = voices.filter(v => v.lang.startsWith('en'));
                engVoices.sort((a, b) => {
                    const aNat = a.name.includes('Natural') || a.name.includes('Online') || a.name.includes('Google') || a.name.includes('Microsoft');
                    const bNat = b.name.includes('Natural') || b.name.includes('Online') || b.name.includes('Google') || a.name.includes('Microsoft');
                    return (aNat === bNat) ? 0 : aNat ? -1 : 1;
                });
                setAvailableVoices(engVoices);
                if (!selectedVoiceURI) {
                    // Default to Aria/Jenny natural if available
                    const best = engVoices.find(v => v.name.includes('Aria') || v.name.includes('Jenny')) || engVoices[0];
                    setSelectedVoiceURI(best?.voiceURI || '');
                }
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, [selectedVoiceURI]);

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
            const payload = {
                mode,
                totalQuestions: 999,
                questionNumber: 1
            };

            if (resumeFile) {
                const formData = new FormData();
                formData.append('resume', resumeFile);
                formData.append('mode', mode);
                formData.append('totalQuestions', 999);
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
        if (!input.trim()) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }
        stopSpeaking();

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Interview continues indefinitely — user manually ends it via "End Session" button

        try {
            const context = messages.slice(-10).map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.content
            }));

            const nextQNum = currentQuestionNum + 1;

            const response = await soloApi.startInterview({
                mode,
                message: userMsg.content,
                context: context,
                sessionId,
                totalQuestions: 999,
                questionNumber: nextQNum
            });

            if (response && response.response) {
                setCurrentQuestionNum(nextQNum);
                const score = response.parsedResponse?.score || 0;
                const feedback = response.parsedResponse?.feedback || "";

                // Add score/feedback to previous user message in local state for display if needed
                // (In a real app, strict message mapping would be better)

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

    const viewTranscript = (session) => {
        // Simple alert or modal for now
        alert("Transcript view coming soon! ID: " + session._id);
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
        <div className="min-h-screen bg-[#09090b] text-white font-sans relative overflow-y-auto overflow-x-hidden">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-cyan-/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/10 rounded-lg">
                        <ArrowLeft className="w-6 h-6 text-slate-300" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2 rounded-lg">
                            <Mic className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AI Interview Prep</h1>
                            <p className="text-xs text-slate-400">Mock Interview with Aria</p>
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
                        className={`p-2 rounded-lg transition-all ${view === 'history' ? 'bg-cyan-/20 text-cyan-' : 'hover:bg-white/5 text-slate-400'}`}
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
                        className={`p-2 rounded-lg transition-all ${autoSpeak ? 'bg-cyan-/20 text-cyan-' : 'bg-white/5 text-slate-500'}`}
                    >
                        {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                    {view === 'interview' && (
                        <button
                            onClick={() => {
                                stopSpeaking();
                                if (sessionId && messages.length > 1) {
                                    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                                    const lastAiMsg = [...messages].reverse().find(m => m.role === 'ai');
                                    finishInterview(lastUserMsg?.content || '', lastAiMsg?.content || '');
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
                                <p className="text-slate-400 text-lg">Practice with Aria, our AI interviewer. Get real-time feedback, scoring, and confidence analysis.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className={`p-6 rounded-2xl border cursor-pointer transition-all ${mode === 'technical' ? 'bg-cyan-/10 border-cyan-500' : 'bg-[#1e1e2d] border-white/5 hover:border-cyan-500/50'}`} onClick={() => setMode('technical')}>
                                    <Cpu className={`w-8 h-8 mb-4 ${mode === 'technical' ? 'text-cyan-' : 'text-slate-500'}`} />
                                    <h3 className="text-xl font-bold mb-2">Technical Round</h3>
                                    <p className="text-sm text-slate-400">DSA, System Design, and coding concepts. Strict and focused.</p>
                                </div>
                                <div className={`p-6 rounded-2xl border cursor-pointer transition-all ${mode === 'behavioral' ? 'bg-pink-600/10 border-pink-500' : 'bg-[#1e1e2d] border-white/5 hover:border-pink-500/50'}`} onClick={() => setMode('behavioral')}>
                                    <User className={`w-8 h-8 mb-4 ${mode === 'behavioral' ? 'text-pink-400' : 'text-slate-500'}`} />
                                    <h3 className="text-xl font-bold mb-2">HR / Behavioral</h3>
                                    <p className="text-sm text-slate-400">Soft skills, STAR method, and cultural fit evaluation.</p>
                                </div>
                                <div className={`p-6 rounded-2xl border cursor-pointer transition-all ${view === 'resume-builder' ? 'bg-cyan-600/10 border-cyan-500' : 'bg-[#1e1e2d] border-white/5 hover:border-cyan-500/50'}`} onClick={() => setView('resume-builder')}>
                                    <FileText className={`w-8 h-8 mb-4 ${view === 'resume-builder' ? 'text-cyan-400' : 'text-slate-500'}`} />
                                    <h3 className="text-xl font-bold mb-2">AI Resume Builder</h3>
                                    <p className="text-sm text-slate-400">Craft a perfect ATS-friendly resume with AI assistance.</p>
                                </div>
                            </div>

                            <div className="bg-[#1e1e2d] p-6 rounded-2xl border border-white/5">
                                <h3 className="font-semibold mb-4">Interview Configuration</h3>
                                <div className="space-y-4">

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Interviewer Voice</label>
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
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-slate-300 focus:border-cyan-500/50 focus:outline-none mb-4"
                                        >
                                            <option value="" className="bg-[#1e1e2d] text-white">Select a natural human voice...</option>
                                            {availableVoices.map((v, i) => (
                                                <option key={i} value={v.voiceURI} className="bg-[#1e1e2d] text-white">
                                                    {v.name} ({v.lang})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Resume (Optional)</label>
                                        <div className="flex gap-4 items-center">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 flex items-center gap-2"
                                            >
                                                <UploadCloud className="w-4 h-4" />
                                                {resumeFile ? resumeFile.name : "Upload PDF"}
                                            </button>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
                                            {resumeFile && <button onClick={() => setResumeFile(null)}><X className="w-4 h-4 text-slate-500" /></button>}
                                        </div>
                                        <textarea
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                            placeholder="Or paste resume text here..."
                                            className="w-full mt-3 h-24 bg-black/20 rounded-lg p-3 text-sm text-slate-300 border border-white/5 focus:border-cyan-500/50 focus:outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={startInterview}
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-cyan- to-pink-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-violet-500/25 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader className="animate-spin" /> : <Play />} Start Interview
                            </button>
                        </div>

                        {/* Right Side - Avatar Preview */}
                        <div className="hidden md:flex w-1/3 flex-col gap-4">
                            <div className="aspect-[3/4] rounded-2xl border border-white/10 relative overflow-hidden">
                                <AriaAvatar isSpeaking={false} />
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent">
                                    <h3 className="text-2xl font-bold text-white">Aria</h3>
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
                        <div className="flex-1 flex flex-col bg-[#151520] rounded-2xl border border-white/5 overflow-hidden relative">
                            {/* Header / Question Progress */}
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1e1e2d]">
                                <span className="font-mono text-cyan- font-bold">Question {currentQuestionNum}</span>
                                <div className="text-xs text-slate-500">Click "End Session" when done</div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-cyan-/90 text-white rounded-tr-sm' : 'bg-[#1e1e2d] text-slate-200 border border-white/10 rounded-tl-sm'}`}>
                                            {msg.content}
                                            {msg.role === 'ai' && msg.feedback && (
                                                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-yellow-500/80 italic">
                                                    Feedback: "{msg.feedback}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-2 items-center text-slate-500 text-sm ml-4">
                                        <Loader className="w-4 h-4 animate-spin" /> Aria is thinking...
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Controls */}
                            <div className="p-4 bg-[#1e1e2d] border-t border-white/5">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={toggleListening}
                                        className={`p-4 rounded-full shadow-lg transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-cyan- to-pink-600 hover:scale-105'}`}
                                    >
                                        {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                                    </button>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={isListening ? "Listening..." : "Type your answer..."}
                                            className="w-full bg-[#09090b] text-white p-4 pr-12 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!input.trim() || isLoading}
                                            className="absolute right-2 top-2 p-2 bg-white/10 hover:bg-cyan- rounded-lg transition-colors text-white disabled:opacity-50"
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
                            <div className="aspect-video rounded-xl overflow-hidden relative border border-white/10">
                                <AriaAvatar isSpeaking={isSpeaking} />
                            </div>

                            {/* User Camera */}
                            <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-white/10">
                                {cameraEnabled ? (
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#1e1e2d]">
                                        <CameraOff className="w-8 h-8 text-slate-600" />
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-bold text-white">You</div>
                            </div>

                            {/* Status Card */}
                            <div className="bg-[#1e1e2d] p-4 rounded-xl border border-white/5 space-y-3">
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <span className="text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Time</span>
                                    <span className="font-mono text-white">{String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:{String(elapsedTime % 60).padStart(2, '0')}</span>
                                </div>
                                <div className="space-y-2 pt-3 border-t border-white/5">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 flex items-center gap-2" title="Avoid filler words like 'um', 'uh', 'like'"><Type className="w-4 h-4" /> Filler Words</span>
                                        <span className={`font-bold ${fillerWordCount > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>{fillerWordCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 flex items-center gap-2" title="Optimal pacing is ~120 WPM"><Activity className="w-4 h-4" /> Pace (WPM)</span>
                                        <span className="font-bold text-slate-200">{wpm || '--'}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-white/5">
                                    <span className="text-slate-400 text-xs mb-2 block">Vocal Confidence</span>
                                    <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden flex">
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
                            <p className="text-slate-400">Here's how you performed with Aria.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Score Card */}
                            <div className="bg-[#1e1e2d] p-6 rounded-2xl border border-white/5 relative overflow-hidden text-center flex flex-col items-center justify-center">
                                <div className="absolute inset-0 bg-cyan-/10 blur-xl" />
                                <div className="relative">
                                    <div className="text-5xl font-black text-white mb-2">{sessionReport.overallScore}<span className="text-xl text-slate-500">/10</span></div>
                                    <div className="text-sm px-3 py-1 rounded-full bg-cyan-/20 text-violet-300 inline-block font-semibold">Overall Score</div>
                                </div>
                            </div>

                            {/* Strengths */}
                            <div className="bg-[#1e1e2d] p-6 rounded-2xl border border-white/5 relative md:col-span-2">
                                <h3 className="flex items-center gap-2 font-bold mb-4 text-emerald-400"><CheckCircle className="w-5 h-5" /> Key Strengths</h3>
                                <ul className="space-y-2">
                                    {sessionReport.strengths.map((s, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" /> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Improvements */}
                            <div className="bg-[#1e1e2d] p-6 rounded-2xl border border-white/5 relative">
                                <h3 className="flex items-center gap-2 font-bold mb-4 text-amber-400"><AlertCircle className="w-5 h-5" /> Areas for Improvement</h3>
                                <ul className="space-y-2">
                                    {sessionReport.improvements.map((s, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" /> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Final Feedback */}
                            <div className="bg-[#1e1e2d] p-6 rounded-2xl border border-white/5 relative">
                                <h3 className="flex items-center gap-2 font-bold mb-4 text-cyan-"><Trophy className="w-5 h-5" /> Coach's Feedback</h3>
                                <p className="text-sm text-slate-300 leading-relaxed italic">
                                    "{sessionReport.finalFeedback}"
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button onClick={() => setView('setup')} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">
                                Back to Menu
                            </button>
                            <button onClick={() => { setMode(sessionReport.mode); setView('setup'); }} className="px-8 py-3 bg-cyan- hover:bg-violet-700 rounded-xl font-bold transition-all shadow-lg shadow-violet-500/20">
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* RESUME BUILDER VIEW */}
                {view === 'resume-builder' && (
                    <div className="w-full h-full flex flex-col md:flex-row gap-6 animate-fade-in-up">
                        {/* Left: Input Form */}
                        <div className="w-full md:w-1/2 bg-[#1e1e2d] p-6 rounded-2xl border border-white/5 overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <FileText className="text-cyan-400" /> Build Your Resume
                            </h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                        <input
                                            value={resumeForm.name}
                                            onChange={e => setResumeForm({ ...resumeForm, name: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 mt-1 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                        <input
                                            value={resumeForm.email}
                                            onChange={e => setResumeForm({ ...resumeForm, email: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 mt-1 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                        <input
                                            value={resumeForm.phone}
                                            onChange={e => setResumeForm({ ...resumeForm, phone: e.target.value })}
                                            placeholder="+1 234..."
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 mt-1 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">LinkedIn / Portfolio</label>
                                        <input
                                            value={resumeForm.links}
                                            onChange={e => setResumeForm({ ...resumeForm, links: e.target.value })}
                                            placeholder="linkedin.com/in/..."
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 mt-1 text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Design Template</label>
                                    <select
                                        value={resumeForm.template}
                                        onChange={e => setResumeForm({ ...resumeForm, template: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 mt-1 text-white focus:outline-none focus:border-cyan-500/50"
                                    >
                                        <option value="Modern Professional" className="bg-[#1e1e2d]">Modern Professional</option>
                                        <option value="Creative Tech" className="bg-[#1e1e2d]">Creative Tech</option>
                                        <option value="Executive Minimalist" className="bg-[#1e1e2d]">Executive Minimalist</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Professional Skills (comma separated)</label>
                                    <textarea
                                        value={resumeForm.skills}
                                        onChange={e => setResumeForm({ ...resumeForm, skills: e.target.value })}
                                        placeholder="React, Node.js, Python, Leadership, Public Speaking..."
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 mt-1 text-white h-20 resize-none focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Experience (Paste raw details)</label>
                                    <textarea
                                        value={resumeForm.experience}
                                        onChange={e => setResumeForm({ ...resumeForm, experience: e.target.value })}
                                        placeholder="Software Engineer at Google (2020-Present). Built X feature..."
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 mt-1 text-white h-32 resize-none focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Education</label>
                                    <textarea
                                        value={resumeForm.education}
                                        onChange={e => setResumeForm({ ...resumeForm, education: e.target.value })}
                                        placeholder="B.Tech in CS, XYZ University (2018-2022), GPA 3.8"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 mt-1 text-white h-24 resize-none focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Additional Info (Awards, Certs)</label>
                                    <textarea
                                        value={resumeForm.additionalInfo}
                                        onChange={e => setResumeForm({ ...resumeForm, additionalInfo: e.target.value })}
                                        placeholder="Certified AWS Sol Arch, Won Hackathon 2024..."
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 mt-1 text-white h-24 resize-none focus:outline-none focus:border-cyan-500/50"
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
                        <div className="hidden md:flex w-1/2 bg-white text-slate-900 rounded-2xl overflow-hidden flex-col shadow-2xl relative">
                            <div className="bg-slate-100 p-4 border-b flex justify-between items-center z-10">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">
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
                            <div className="flex-1 p-0 overflow-y-auto bg-slate-200/50">
                                {generatedResume ? (
                                    <ResumeTemplate data={generatedResume} template={resumeForm.template} />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 select-none">
                                        <FileText size={48} className="mb-4 text-slate-300" />
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
                            <div className="text-sm text-slate-400">{interviewHistory.length} Sessions</div>
                        </div>

                        <div className="grid gap-4">
                            {interviewHistory.map((session, i) => (
                                <div key={i} className="bg-[#1e1e2d] p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all flex justify-between items-center group">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${session.overallScore >= 7 ? 'bg-emerald-500/20 text-emerald-400' : session.overallScore >= 4 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {session.overallScore}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg capitalize flex items-center gap-2">
                                                {session.mode} Interview
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5 normal-case">{new Date(session.startedAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-sm text-slate-400 mt-1 flex gap-4">
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
                            <div className="text-center py-20 text-slate-500">
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
