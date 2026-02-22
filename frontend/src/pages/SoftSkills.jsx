import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';
import {
    ArrowLeft, Mic, MicOff, Brain, BookOpen, Volume2,
    Video, Sparkles, MessageSquare, TrendingUp, Bot,
    PlayCircle, Award, Star, Trophy, Crown, Activity,
    Target, Flame, CheckCircle, Clock, Zap, FileText,
    Users, Heart, Send, RefreshCw, ChevronRight, Lock,
    Briefcase, GraduationCap, BarChart3, Headphones
} from 'lucide-react';

// Storage helpers
const STORAGE_KEY = 'softskills_progress_v1';
const loadProgress = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
            streak: 0,
            xp: 0,
            badges: [],
            completedChallenges: [],
            interviewsCompleted: 0,
            speechMinutes: 0,
            speakingScores: [],
            writingScores: [],
            vocabSets: 0
        };
    } catch { return { streak: 0, xp: 0, badges: [], completedChallenges: [], interviewsCompleted: 0, speechMinutes: 0, speakingScores: [], writingScores: [], vocabSets: 0 }; }
};
const saveProgress = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

export default function SoftSkills() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('speech');
    const [isRecording, setIsRecording] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [messages, setMessages] = useState([{ role: 'ai', text: "Hello! I'm your AI speaking partner. Let's talk about your day. How are you?" }]);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [progress, setProgress] = useState(loadProgress); // Restored
    const [vocabList, setVocabList] = useState([]);
    const [isLoadingVocab, setIsLoadingVocab] = useState(false);

    // Writing State
    const [writingTopic, setWritingTopic] = useState('');
    const [writingInput, setWritingInput] = useState('');
    const [isWriting, setIsWriting] = useState(false);
    const [writingTimeLeft, setWritingTimeLeft] = useState(0); // in seconds
    const [writingFeedback, setWritingFeedback] = useState(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    // Speaking State
    const [speakingTopic, setSpeakingTopic] = useState('');
    const [speechTranscript, setSpeechTranscript] = useState('');
    const [speechTimeLeft, setSpeechTimeLeft] = useState(0);
    const [speechFeedback, setSpeechFeedback] = useState(null);
    const [isEvaluatingSpeech, setIsEvaluatingSpeech] = useState(false);

    const messagesEndRef = React.useRef(null);
    const recognitionRef = React.useRef(null);
    const isRecordingRef = React.useRef(false);
    const activeTabRef = React.useRef('speech'); // Track active tab for mic routing

    // Sync activeTabRef
    useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, interimTranscript]);

    // Speech Recognition Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interim = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }

                setInterimTranscript(interim);
                if (finalTranscript) {
                    if (activeTabRef.current === 'speaking' || activeTabRef.current === 'vocab_speaking_mode') {
                        setSpeechTranscript(prev => prev + ' ' + finalTranscript + '.');
                    } else if (activeTabRef.current === 'speech') {
                        handleUserMessage(finalTranscript);
                    }
                    setInterimTranscript('');
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    alert('Microphone access denied. Please allow microphone access.');
                    setIsRecording(false);
                    isRecordingRef.current = false;
                }
            };

            recognitionRef.current.onend = () => {
                // Auto restart if supposed to be recording AND AI is NOT speaking
                // We use ref because state in this closure is stale
                if (isRecordingRef.current && !window.speechSynthesis.speaking) {
                    try {
                        recognitionRef.current.start();
                    } catch (e) {
                        console.log("Recognition restart suppressed:", e);
                    }
                }
            };
        } else {
            console.error('Speech Recognition API not supported in this browser.');
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    // Toggle Recording
    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            isRecordingRef.current = false;
        } else {
            try {
                recognitionRef.current?.start();
                setIsRecording(true);
                isRecordingRef.current = true;
                window.speechSynthesis.cancel();
            } catch (err) {
                console.error("Failed to start recording:", err);
            }
        }
    };

    // Handle User Message
    const handleUserMessage = async (text) => {
        if (!text.trim()) return;

        // Add user message
        const newMsg = { role: 'user', text };
        setMessages(prev => [...prev, newMsg]);

        // Call Backend AI
        setIsAiSpeaking(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/solo/ai/softskills`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: text,
                    previousMessages: messages.slice(-6).map(m => ({ role: m.role, text: m.text }))
                })
            });

            const data = await response.json();

            // Backend now returns { correction: string|null, reply: string }
            const correction = data.correction;
            const reply = data.reply || data.response; // Fallback

            // Add AI response
            setMessages(prev => [...prev, {
                role: 'ai',
                text: reply,
                correction: correction
            }]);

            // Speak only the AI conversational reply (do not speak the correction verbally to improve flow)
            const fullSpeech = reply;
            speakText(fullSpeech);

        } catch (error) {
            console.error('Error getting AI response:', error);
            setIsAiSpeaking(false);
        }
    };

    // Text to Speech
    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onstart = () => {
                setIsAiSpeaking(true);
                // Pause recording while AI speaks to avoid listening to itself
                if (isRecordingRef.current && recognitionRef.current) {
                    recognitionRef.current.stop();
                }
            };

            utterance.onend = () => {
                setIsAiSpeaking(false);
                // Resume recording if it was active
                if (isRecordingRef.current && recognitionRef.current) {
                    try {
                        recognitionRef.current.start();
                    } catch (e) { console.log("Mic already started"); }
                }
            };

            utterance.onerror = () => setIsAiSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    };

    // Fetch Vocabulary
    const fetchVocabulary = async () => {
        setIsLoadingVocab(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/solo/vocabulary`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.words && Array.isArray(data.words)) {
                setVocabList(data.words);
                setProgress(prev => ({
                    ...prev,
                    vocabSets: (prev.vocabSets || 0) + 1,
                    xp: prev.xp + 20
                }));
            }
        } catch (error) {
            console.error('Error fetching vocabulary:', error);
        } finally {
            setIsLoadingVocab(false);
        }
    };

    // Initial load for vocab (optional, or wait for user)
    // useEffect(() => { if(activeTab === 'vocabulary' && vocabList.length === 0) fetchVocabulary(); }, [activeTab]);

    // Writing Timer
    useEffect(() => {
        let interval;
        if (isWriting && writingTimeLeft > 0) {
            interval = setInterval(() => setWritingTimeLeft(t => t - 1), 1000);
        } else if (writingTimeLeft === 0 && isWriting) {
            setIsWriting(false); // Time up logic could submit automatically or just pause
        }
        return () => clearInterval(interval);
    }, [isWriting, writingTimeLeft]);

    const fetchWritingTopic = async () => {
        setIsEvaluating(true);
        setWritingFeedback(null);
        setWritingInput('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/solo/writing/topic`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setWritingTopic(data.topic);
            setWritingTimeLeft(300); // 5 minutes default
            setIsWriting(true);
        } catch (error) {
            console.error('Error fetching topic:', error);
        } finally {
            setIsEvaluating(false);
        }
    };

    const submitEssay = async () => {
        setIsEvaluating(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/solo/writing/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic: writingTopic, essay: writingInput })
            });
            const data = await response.json();
            setWritingFeedback(data);
            setIsWriting(false);
            setProgress(prev => ({
                ...prev,
                writingScores: [...(prev.writingScores || []), data.score || 0],
                xp: prev.xp + 50
            }));
        } catch (error) {
            console.error('Error evaluating essay:', error);
        } finally {
            setIsEvaluating(false);
        }
    };

    // Speaking Functions
    const fetchSpeakingTopic = async () => {
        setIsEvaluatingSpeech(true);
        setSpeechFeedback(null);
        setSpeechTranscript('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/solo/speaking/topic`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setSpeakingTopic(data.topic);
            setSpeechTimeLeft(120); // 2 minutes
        } catch (error) {
            console.error('Error fetching topic:', error);
        } finally {
            setIsEvaluatingSpeech(false);
        }
    };

    const submitSpeech = async () => {
        setIsEvaluatingSpeech(true);
        // Stop recording if active
        if (isRecording) toggleRecording();

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/solo/speaking/evaluate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic: speakingTopic, transcript: speechTranscript })
            });
            const data = await response.json();
            setSpeechFeedback(data);
            setProgress(prev => ({
                ...prev,
                speakingScores: [...(prev.speakingScores || []), data.score || 0],
                speechMinutes: (prev.speechMinutes || 0) + ((120 - speechTimeLeft) / 60),
                interviewsCompleted: (prev.interviewsCompleted || 0) + 1,
                xp: prev.xp + 100
            }));
        } catch (error) {
            console.error('Error evaluating speech:', error);
        } finally {
            setIsEvaluatingSpeech(false);
        }
    };

    // Speech Timer
    useEffect(() => {
        let interval;
        if (isRecording && activeTab === 'speaking' && speechTimeLeft > 0) {
            interval = setInterval(() => setSpeechTimeLeft(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording, activeTab, speechTimeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Save progress on change
    useEffect(() => { saveProgress(progress); }, [progress]);



    // Stats Helper
    const getStats = () => {
        const p = progress;
        const avgSpeech = p.speakingScores?.length ? Math.round(p.speakingScores.reduce((a, b) => a + b, 0) / p.speakingScores.length) : 0;
        const avgWriting = p.writingScores?.length ? Math.round(p.writingScores.reduce((a, b) => a + b, 0) / p.writingScores.length) : 0;
        const growth = Math.min(100, Math.round((p.xp / 5000) * 100)); // 5k XP goal based
        const vocabProg = Math.min(100, (p.vocabSets || 0) * 10);
        const interviewReady = Math.round((avgSpeech * 0.4) + (avgWriting * 0.3) + (vocabProg * 0.3));

        return {
            speechScore: avgSpeech,
            vocabularyLevel: (p.vocabSets || 0) > 10 ? 'Expert' : (p.vocabSets || 0) > 5 ? 'Advanced' : (p.vocabSets || 0) > 2 ? 'Intermediate' : 'Beginner',
            interviewReady: Math.min(100, interviewReady),
            overallGrowth: `${growth}%`,
            vocabProgress: vocabProg
        };
    };
    const realStats = getStats();

    // Stats
    const stats = {
        speechScore: realStats.speechScore,
        vocabularyLevel: realStats.vocabularyLevel,
        interviewReady: realStats.interviewReady,
        overallGrowth: realStats.overallGrowth,
        vocabProgress: realStats.vocabProgress
    };

    // AI Speech Analysis Mock Data


    // Interview Scenarios
    const interviewScenarios = [];

    // Daily Challenges
    const dailyChallenges = [];

    // Vocabulary words


    // Writing templates
    const writingTemplates = [];

    // Complete challenge
    const completeChallenge = (id, xp) => {
        if (!progress.completedChallenges.includes(id)) {
            setProgress(prev => ({
                ...prev,
                xp: prev.xp + xp,
                completedChallenges: [...prev.completedChallenges, id]
            }));
        }
    };



    const tabs = [
        { id: 'speech', label: '🗣️ AI Conversation Partner', icon: Mic },
        { id: 'speaking', label: '📢 Extempore', icon: Volume2 },
        { id: 'vocabulary', label: '📚 Vocabulary', icon: BookOpen },
        { id: 'writing', label: '✍️ Writing', icon: FileText }
    ];

    // Progress bar component
    const ProgressBar = ({ value, color = 'violet' }) => (
        <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${color === 'violet' ? 'from-cyan- to-purple-600' :
                    color === 'cyan' ? 'from-cyan-500 to-blue-600' :
                        color === 'green' ? 'from-emerald-500 to-green-600' :
                            color === 'amber' ? 'from-amber-500 to-orange-600' :
                                color === 'pink' ? 'from-pink-500 to-rose-600' :
                                    'from-cyan- to-purple-600'
                    }`}
                style={{ width: `${value}%` }}
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-16 font-sans text-[var(--text-primary)] relative">
            {/* Background Effects */}
            <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-cyan-/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-cyan-500/10 px-8 py-5">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-3 bg-cyan-/10 hover:bg-cyan-/20 px-5 py-3 rounded-xl text-violet-300 font-semibold transition-all"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>

                    <div className="text-xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-cyan- to-pink-500 rounded-xl">
                            <Brain size={24} />
                        </div>
                        <span>Soft Skills Lab</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-xl border border-amber-500/30">
                            <Flame className="text-amber-500" size={18} />
                            <span className="text-amber-300 font-bold">{progress.streak} day streak</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-/10 rounded-xl border border-cyan-500/30">
                            <Star className="text-cyan-" size={18} />
                            <span className="text-violet-300 font-bold">{progress.xp} XP</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-8 py-10">
                {/* Header */}
                <div className="bg-gradient-to-br from-cyan-/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-10 mb-8 border border-cyan-500/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent animate-pulse" />

                    <div className="flex items-center justify-between flex-wrap gap-6">
                        <div className="flex items-center gap-6">
                            <div className="bg-gradient-to-br from-cyan- to-pink-600 p-6 rounded-2xl shadow-lg shadow-violet-500/30">
                                <Mic size={48} />
                            </div>
                            <div>
                                <div className="text-sm text-violet-300 font-bold tracking-widest uppercase mb-2">AI-Powered Training</div>
                                <h1 className="text-4xl font-black mb-2">Communication & Interview Skills</h1>
                                <p className="text-[var(--text-secondary)] text-lg">Master speaking, ace interviews, and build professional vocabulary</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="text-center p-4 bg-[var(--glass-bg)] rounded-xl border border-[var(--border-color)] min-w-[100px]">
                                <div className="text-2xl font-black text-cyan-">{progress.interviewsCompleted}</div>
                                <div className="text-xs text-[var(--text-secondary)]">Interviews</div>
                            </div>
                            <div className="text-center p-4 bg-[var(--glass-bg)] rounded-xl border border-[var(--border-color)] min-w-[100px]">
                                <div className="text-2xl font-black text-cyan-400">
                                    {Math.floor(progress.speechMinutes / 60)}h {Math.round(progress.speechMinutes % 60)}m
                                </div>
                                <div className="text-xs text-[var(--text-secondary)]">Speech Time</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                    {[
                        { icon: Volume2, label: 'Speech Score', value: `${stats.speechScore}%`, color: 'violet', bg: 'bg-cyan-/20' },
                        { icon: BookOpen, label: 'Vocabulary', value: stats.vocabularyLevel, color: 'cyan', bg: 'bg-cyan-500/20' },
                        { icon: Briefcase, label: 'Interview Ready', value: `${stats.interviewReady}%`, color: 'amber', bg: 'bg-amber-500/20' },
                        { icon: TrendingUp, label: 'Growth', value: stats.overallGrowth, color: 'green', bg: 'bg-emerald-500/20' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-6 border border-[var(--border-color)] hover:border-cyan-500/30 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={24} className={`text-${stat.color}-500`} />
                                </div>
                                <div>
                                    <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
                                    <div className="text-2xl font-black">{stat.value}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mb-8 flex-wrap">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-cyan- to-pink-600 shadow-lg shadow-violet-500/30'
                                : 'bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                    {/* Main Content */}
                    <div>
                        {/* AI Conversation Partner */}
                        {activeTab === 'speech' && (
                            <div className="flex flex-col h-[600px] animate-fade-in relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-[var(--glass-bg)] backdrop-blur-xl shadow-2xl">
                                {/* Avatar Section */}
                                <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none">
                                    {/* AI Avatar Animation */}
                                    <div className={`relative transition-all duration-500 ${isAiSpeaking ? 'scale-110' : 'scale-100'}`}>
                                        <div className={`w-64 h-64 rounded-full bg-gradient-to-br from-cyan- to-pink-500 blur-3xl animate-pulse ${isAiSpeaking ? 'opacity-80' : 'opacity-30'}`} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className={`w-40 h-40 rounded-full border-4 border-cyan-400 shadow-[0_0_50px_rgba(139,92,246,0.5)] bg-[var(--bg-secondary)] flex items-center justify-center relative overflow-hidden transition-all duration-300 ${isAiSpeaking ? 'shadow-[0_0_80px_rgba(139,92,246,0.8)] border-cyan-300' : ''}`}>
                                                {/* Eyes */}
                                                <div className="flex gap-8 z-10">
                                                    <div className={`w-3 h-8 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] transition-all duration-100 ${isAiSpeaking ? 'h-4 animate-bounce' : 'h-8'}`} style={{ animationDelay: '0ms' }} />
                                                    <div className={`w-3 h-8 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] transition-all duration-100 ${isAiSpeaking ? 'h-4 animate-bounce' : 'h-8'}`} style={{ animationDelay: '100ms' }} />
                                                </div>
                                                {/* Mouth Activity Visualization */}
                                                {isAiSpeaking && (
                                                    <div className="absolute bottom-8 flex gap-1">
                                                        <div className="w-1 h-3 bg-violet-400 rounded-full animate-pulse" />
                                                        <div className="w-1 h-5 bg-violet-400 rounded-full animate-pulse delay-75" />
                                                        <div className="w-1 h-3 bg-violet-400 rounded-full animate-pulse delay-150" />
                                                    </div>
                                                )}
                                                {/* Scanlines */}
                                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,27,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Area */}
                                <div className="flex-1 overflow-y-auto p-6 z-10 space-y-6 scroll-smooth custom-scrollbar">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

                                            {/* Correction Bubble (Only for AI) */}
                                            {msg.correction && (
                                                <div className="max-w-[80%] p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                                                    <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider text-amber-400">
                                                        <Activity size={14} />
                                                        Correction
                                                    </div>
                                                    <p className="text-sm">{msg.correction}</p>
                                                </div>
                                            )}

                                            <div className={`max-w-[80%] p-5 rounded-3xl ${msg.role === 'user'
                                                ? 'bg-gradient-to-br from-cyan- to-pink-600 rounded-br-none shadow-lg shadow-violet-500/20 text-[var(--text-primary)]'
                                                : 'bg-[var(--glass-bg)] backdrop-blur-md rounded-bl-none border border-[var(--border-color)] text-[var(--text-primary)] shadow-xl'
                                                }`}>
                                                {msg.role === 'ai' && (
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Bot size={16} className="text-cyan-400" />
                                                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">AI Mentor</span>
                                                    </div>
                                                )}
                                                <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isAiSpeaking && (
                                        <div className="flex justify-start">
                                            <div className="bg-[var(--glass-bg)] p-4 rounded-3xl rounded-bl-none border border-[var(--border-color)] flex gap-1 items-center">
                                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Controls */}
                                <div className="p-6 bg-[var(--glass-bg)] border-t border-[var(--border-color)] backdrop-blur-xl z-20 flex items-center justify-center gap-6 relative">
                                    {/* Live Transcription */}
                                    {interimTranscript && (
                                        <div className="absolute -top-16 left-0 right-0 flex justify-center">
                                            <div className="bg-[var(--bg-secondary)]lack/60 backdrop-blur-md px-6 py-2 rounded-full text-[var(--text-primary)] border border-[var(--border-color)] animate-pulse">
                                                {interimTranscript}...
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={toggleRecording}
                                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all bg-gradient-to-br shadow-2xl ${isRecording
                                            ? 'from-red-500 to-rose-600 shadow-red-500/50 scale-110 animate-pulse ring-4 ring-red-500/20'
                                            : 'from-cyan- to-pink-600 shadow-violet-500/40 hover:scale-105 hover:from-violet-400 hover:to-pink-500'
                                            }`}
                                    >
                                        {isRecording ? <MicOff size={32} className="text-[var(--text-primary)]" /> : <Mic size={32} className="text-[var(--text-primary)]" />}
                                    </button>

                                    <div className="absolute right-8 text-xs text-[var(--text-muted)] font-mono">
                                        {isRecording ? "Listening..." : "Click Mic to Speak"}
                                    </div>
                                </div>
                            </div>
                        )}



                        {/* Vocabulary */}
                        {activeTab === 'vocabulary' && (
                            <div className="space-y-6 animate-fade-in pb-20">
                                <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-8 border border-[var(--border-color)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <div>
                                            <h3 className="text-3xl font-black flex items-center gap-3 mb-2">
                                                <div className="p-3 bg-cyan-500/20 rounded-xl">
                                                    <BookOpen className="text-cyan-400" size={32} />
                                                </div>
                                                Power Vocabulary
                                            </h3>
                                            <p className="text-[var(--text-secondary)] text-lg">Master 50 advanced words to elevate your professional presence.</p>
                                        </div>

                                        <button
                                            onClick={fetchVocabulary}
                                            disabled={isLoadingVocab}
                                            className={`px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg transition-all ${isLoadingVocab
                                                ? 'bg-[var(--border-color)] text-[var(--text-secondary)] cursor-not-allowed'
                                                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/30 hover:-translate-y-1'
                                                }`}
                                        >
                                            <RefreshCw size={20} className={isLoadingVocab ? 'animate-spin' : ''} />
                                            {isLoadingVocab ? 'Generating...' : 'Generate New 50 Words'}
                                        </button>
                                    </div>

                                    {vocabList.length === 0 && !isLoadingVocab ? (
                                        <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] rounded-2xl">
                                            <BookOpen size={64} className="text-[var(--text-primary)] mx-auto mb-4" />
                                            <h4 className="text-xl font-bold text-[var(--text-secondary)]">Ready to learn?</h4>
                                            <p className="text-[var(--text-muted)] mb-6">Click the button above to generate 50 advanced words tailored for you.</p>
                                            <button onClick={fetchVocabulary} className="px-6 py-2 bg-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-lg font-semibold transition-all">Start Learning</button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {vocabList.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group p-6 bg-[var(--glass-bg)] rounded-2xl border border-[var(--border-color)] hover:border-cyan-500/50 hover:bg-[var(--bg-secondary)] transition-all hover:shadow-lg hover:shadow-cyan-500/10 flex flex-col h-full relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <div className="text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">{item.context || 'General'}</div>
                                                            <h4 className="text-2xl font-black text-cyan-400 group-hover:text-cyan-300">{item.word}</h4>
                                                        </div>
                                                        <button
                                                            onClick={() => speakText(item.word)}
                                                            className="p-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors"
                                                        >
                                                            <Volume2 size={18} />
                                                        </button>
                                                    </div>

                                                    <div className="flex-1">
                                                        <p className="text-[var(--text-primary)] font-medium mb-4 leading-relaxed">{item.meaning}</p>
                                                        <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-xl border border-[var(--border-color)]">
                                                            <p className="text-sm text-[var(--text-secondary)] italic">"{item.usage}"</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {isLoadingVocab && (
                                        <div className="absolute inset-0 bg-[var(--glass-bg)] backdrop-blur-sm flex flex-col items-center justify-center z-20">
                                            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                                            <h4 className="text-xl font-bold animate-pulse">Curating your customized list...</h4>
                                            <p className="text-[var(--text-secondary)]">Consulting AI Linguist</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Writing */}
                        {activeTab === 'writing' && (
                            <div className="space-y-6 animate-fade-in pb-20">
                                <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-8 border border-[var(--border-color)] relative overflow-hidden">
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

                                    <h3 className="text-3xl font-black flex items-center gap-3 mb-6 relative z-10">
                                        <div className="p-3 bg-pink-500/20 rounded-xl">
                                            <FileText className="text-pink-500" size={32} />
                                        </div>
                                        Professional Writing Lab
                                    </h3>

                                    {!writingTopic && !writingFeedback && (
                                        <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] rounded-2xl">
                                            <Sparkles size={64} className="text-[var(--text-primary)] mx-auto mb-4" />
                                            <h4 className="text-xl font-bold text-[var(--text-secondary)]">Ready to write?</h4>
                                            <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">Get an AI-generated professional topic, write for 5 minutes, and receive instant expert feedback.</p>
                                            <button
                                                onClick={fetchWritingTopic}
                                                disabled={isEvaluating}
                                                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-bold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all flex items-center gap-2 mx-auto"
                                            >
                                                {isEvaluating ? <RefreshCw className="animate-spin" /> : <PlayCircle />}
                                                Start Writing Session
                                            </button>
                                        </div>
                                    )}

                                    {(writingTopic || writingFeedback) && (
                                        <div className="space-y-6 relative z-10">
                                            {/* Topic & Timer */}
                                            <div className="bg-[var(--glass-bg)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col md:flex-row gap-4 items-center justify-between">
                                                <div>
                                                    <div className="text-sm text-pink-400 font-bold uppercase tracking-wider mb-1">Your Topic</div>
                                                    <h4 className="text-xl font-bold">{writingTopic}</h4>
                                                </div>
                                                {isWriting && (
                                                    <div className={`px-4 py-2 rounded-xl border font-mono font-bold text-xl flex items-center gap-2 ${writingTimeLeft < 60 ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'}`}>
                                                        <Clock size={20} />
                                                        {formatTime(writingTimeLeft)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Writing Area */}
                                            {!writingFeedback && (
                                                <div className="space-y-4">
                                                    <textarea
                                                        value={writingInput}
                                                        onChange={(e) => setWritingInput(e.target.value)}
                                                        disabled={!isWriting || isEvaluating}
                                                        placeholder="Start writing here..."
                                                        className="w-full h-80 p-6 rounded-2xl bg-[var(--glass-bg)] border border-[var(--border-color)] focus:border-pink-500/50 outline-none text-lg leading-relaxed resize-none"
                                                    />
                                                    <div className="flex justify-end gap-4">
                                                        <button
                                                            onClick={() => setWritingFeedback(null) || setWritingTopic('')}
                                                            className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] font-bold"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={submitEssay}
                                                            disabled={isEvaluating || writingInput.length < 10}
                                                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 font-bold shadow-lg hover:shadow-pink-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isEvaluating ? <RefreshCw className="animate-spin" /> : <Send size={18} />}
                                                            Submit for Evaluation
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Feedback Result */}
                                            {writingFeedback && (
                                                <div className="animate-fade-in space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        {/* Score Card */}
                                                        <div className="bg-[var(--glass-bg)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col items-center justify-center text-center">
                                                            <div className="relative w-32 h-32 mb-4 flex items-center justify-center">
                                                                <svg className="w-full h-full transform -rotate-90">
                                                                    <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                                                                    <circle cx="64" cy="64" r="56" stroke={writingFeedback.score > 70 ? '#10b981' : writingFeedback.score > 40 ? '#f59e0b' : '#ef4444'} strokeWidth="8" fill="transparent" strokeDasharray="351.86" strokeDashoffset={351.86 - (351.86 * writingFeedback.score) / 100} className="transition-all duration-1000 ease-out" />
                                                                </svg>
                                                                <div className="absolute text-3xl font-black">{writingFeedback.score}</div>
                                                            </div>
                                                            <div className="text-[var(--text-secondary)] font-bold">Overall Score</div>
                                                        </div>

                                                        {/* Feedback Text */}
                                                        <div className="md:col-span-2 bg-[var(--glass-bg)] p-6 rounded-2xl border border-[var(--border-color)]">
                                                            <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-pink-400">
                                                                <Sparkles size={20} />
                                                                Analysis
                                                            </h4>
                                                            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">{writingFeedback.feedback}</p>

                                                            <h5 className="font-bold text-[var(--text-secondary)] mb-3 uppercase text-xs tracking-wider">Key Improvements</h5>
                                                            <ul className="space-y-2">
                                                                {writingFeedback.improvements?.map((imp, idx) => (
                                                                    <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                                                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-pink-500" />
                                                                        {imp}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => { setWritingTopic(''); setWritingFeedback(null); }}
                                                        className="w-full py-4 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] font-bold border border-[var(--border-color)] transition-all"
                                                    >
                                                        Start New Session
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Speaking / Extempore */}
                        {activeTab === 'speaking' && (
                            <div className="space-y-6 animate-fade-in pb-20">
                                <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl p-8 border border-[var(--border-color)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-/10 rounded-full blur-3xl pointer-events-none" />

                                    <h3 className="text-3xl font-black flex items-center gap-3 mb-6 relative z-10">
                                        <div className="p-3 bg-cyan-/20 rounded-xl">
                                            <Mic className="text-cyan-" size={32} />
                                        </div>
                                        Extempore Speaking
                                    </h3>

                                    {!speakingTopic && !speechFeedback && (
                                        <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] rounded-2xl">
                                            <TrendingUp size={64} className="text-[var(--text-primary)] mx-auto mb-4" />
                                            <h4 className="text-xl font-bold text-[var(--text-secondary)]">Ready for a Challenge?</h4>
                                            <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">Get a surprise engineering/tech topic, speak for 2 minutes, and get evaluated on your delivery.</p>
                                            <button
                                                onClick={fetchSpeakingTopic}
                                                disabled={isEvaluatingSpeech}
                                                className="px-8 py-3 bg-gradient-to-r from-cyan- to-indigo-600 rounded-xl font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all flex items-center gap-2 mx-auto"
                                            >
                                                {isEvaluatingSpeech ? <RefreshCw className="animate-spin" /> : <PlayCircle />}
                                                Generate Topic
                                            </button>
                                        </div>
                                    )}

                                    {(speakingTopic || speechFeedback) && (
                                        <div className="space-y-6 relative z-10">
                                            {/* Topic & Controls */}
                                            <div className="bg-[var(--glass-bg)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col items-center text-center gap-4">
                                                <div className="text-sm text-cyan- font-bold uppercase tracking-wider">Your Topic</div>
                                                <h4 className="text-2xl font-black max-w-2xl">{speakingTopic}</h4>

                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className={`text-3xl font-mono font-black ${speechTimeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-[var(--text-primary)]'}`}>
                                                        {formatTime(speechTimeLeft)}
                                                    </div>
                                                </div>

                                                {!speechFeedback && (
                                                    <div className="flex gap-4 mt-4">
                                                        <button
                                                            onClick={toggleRecording}
                                                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording
                                                                ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse scale-110'
                                                                : 'bg-cyan- shadow-lg shadow-violet-500/30 hover:bg-cyan-'
                                                                }`}
                                                        >
                                                            {isRecording ? <MicOff className="text-[var(--text-primary)]" /> : <Mic className="text-[var(--text-primary)]" />}
                                                        </button>
                                                        {speechTranscript.length > 20 && (
                                                            <button
                                                                onClick={submitSpeech}
                                                                disabled={isEvaluatingSpeech}
                                                                className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400 transition-all font-bold flex items-center gap-2"
                                                            >
                                                                {isEvaluatingSpeech ? <RefreshCw className="animate-spin" /> : <CheckCircle />}
                                                                Finish & Evaluate
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Transcript Display */}
                                            <div className="bg-[var(--bg-secondary)]/30 p-4 rounded-xl border border-[var(--border-color)] min-h-[100px] max-h-[200px] overflow-y-auto font-mono text-sm text-[var(--text-secondary)]">
                                                {speechTranscript || (isRecording ? "Listening..." : "Your speech transcript will appear here...")}
                                                {interimTranscript && <span className="text-[var(--text-muted)] animate-pulse"> {interimTranscript}</span>}
                                            </div>

                                            {/* Evaluation Result */}
                                            {speechFeedback && (
                                                <div className="animate-fade-in bg-[var(--glass-bg)] p-6 rounded-2xl border border-[var(--border-color)]">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div className="flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)]/50 rounded-xl">
                                                            <div className="text-4xl font-black text-cyan- mb-2">{speechFeedback.score}/100</div>
                                                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Speaking Score</div>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <h5 className="font-bold text-cyan- mb-2 flex items-center gap-2"><Sparkles size={16} /> Feedback</h5>
                                                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">{speechFeedback.feedback}</p>
                                                            <ul className="space-y-1">
                                                                {speechFeedback.improvements?.map((imp, idx) => (
                                                                    <li key={idx} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                                                                        <div className="w-1 h-1 rounded-full bg-cyan- mt-1.5" />
                                                                        {imp}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => { setSpeakingTopic(''); setSpeechFeedback(null); setSpeechTranscript(''); }}
                                                        className="w-full mt-6 py-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] font-bold transition-all text-sm uppercase tracking-wide"
                                                    >
                                                        Try Another Topic
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {/* Daily Challenges */}
                        <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-6 border border-[var(--border-color)]">
                            <div className="font-bold mb-4 flex items-center gap-2">
                                <Flame className="text-amber-500" />
                                Daily Challenges
                            </div>
                            <div className="space-y-3">
                                {dailyChallenges.map(challenge => (
                                    <div
                                        key={challenge.id}
                                        className={`p-4 rounded-xl border transition-all ${challenge.completed
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : 'bg-[var(--glass-bg)] border-[var(--border-color)] hover:border-amber-500/30 cursor-pointer'
                                            }`}
                                        onClick={() => !challenge.completed && completeChallenge(challenge.id, challenge.xp)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {challenge.completed ? (
                                                    <CheckCircle className="text-emerald-500" size={20} />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-amber-500/50" />
                                                )}
                                                <span className={`text-sm ${challenge.completed ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>
                                                    {challenge.title}
                                                </span>
                                            </div>
                                            <span className={`text-xs font-bold ${challenge.completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                +{challenge.xp} XP
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Progress Stats */}
                        <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-6 border border-[var(--border-color)]">
                            <div className="font-bold mb-4 flex items-center gap-2">
                                <BarChart3 className="text-cyan-" />
                                Your Progress
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[var(--text-secondary)]">Speech Confidence</span>
                                        <span className="font-bold text-cyan-">{stats.speechScore}%</span>
                                    </div>
                                    <ProgressBar value={stats.speechScore} color="violet" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[var(--text-secondary)]">Interview Readiness</span>
                                        <span className="font-bold text-cyan-400">{stats.interviewReady}%</span>
                                    </div>
                                    <ProgressBar value={stats.interviewReady} color="cyan" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-[var(--text-secondary)]">Vocabulary</span>
                                        <span className="font-bold text-pink-400">{stats.vocabProgress}%</span>
                                    </div>
                                    <ProgressBar value={stats.vocabProgress} color="pink" />
                                </div>
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="bg-[var(--glass-bg)] backdrop-blur-xl rounded-2xl p-6 border border-[var(--border-color)]">
                            <div className="font-bold mb-4 flex items-center gap-2">
                                <Trophy className="text-amber-500" />
                                Achievements
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[].map((badge, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-xl text-center ${badge.unlocked
                                            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30'
                                            : 'bg-[var(--glass-bg)] border border-[var(--border-color)] opacity-50'
                                            }`}
                                    >
                                        <badge.icon size={24} className={badge.unlocked ? 'text-amber-400 mx-auto' : 'text-[var(--text-muted)] mx-auto'} />
                                        <div className="text-xs mt-2 text-[var(--text-secondary)]">{badge.label}</div>
                                        {!badge.unlocked && <Lock size={12} className="mx-auto mt-1 text-[var(--text-primary)]" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-gradient-to-br from-cyan-/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
                            <div className="font-bold mb-3 flex items-center gap-2">
                                <Sparkles className="text-cyan-" />
                                Pro Tip
                            </div>
                            <p className="text-sm text-violet-200 leading-relaxed">
                                Use the STAR method (Situation, Task, Action, Result) when answering behavioral interview questions. This structure helps you deliver clear, impactful responses.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fade-in animation */}
            <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
      `}</style>
        </div>
    );
}
