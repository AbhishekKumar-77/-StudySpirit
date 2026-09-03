import React, { useState, useEffect, useRef } from 'react';
import {
    Mic, MicOff, Volume2, Sparkles, Bot, RefreshCw, Send, CheckCircle2,
    AlertCircle, ArrowRight, RotateCcw, UserCheck, GraduationCap, Briefcase, Users
} from 'lucide-react';
import englishLabApi from '../../services/englishLabApi';
import AriaAvatar from '../AriaAvatar';

export default function AIConversationView({ profile = {}, onSessionEnd }) {
    const [selectedPersona, setSelectedPersona] = useState('aria');
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            text: "Hello! I'm Aria, your English and soft skills coach. Today let's talk about your college project or career goals. What are you working on right now?",
            correction: null
        }
    ]);

    const [isRecording, setIsRecording] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [inputText, setInputText] = useState('');
    const [voices, setVoices] = useState([]);
    const [speakingTime, setSpeakingTime] = useState(0);

    const recognitionRef = useRef(null);
    const messagesEndRef = useRef(null);

    const personas = [
        { id: 'aria', name: 'Aria (Communication Coach)', icon: Bot, desc: 'Warm & encouraging English coach. Corrects grammar gently.' },
        { id: 'professor', name: 'Prof. Vance (Academic Advisor)', icon: GraduationCap, desc: 'Formal academic discussions, project viva defense & coursework.' },
        { id: 'tech_lead', name: 'Marcus (Tech Lead / Mentor)', icon: Briefcase, desc: 'Agile daily standups, technical blockers, architecture discussions.' },
        { id: 'recruiter', name: 'Rachel (Tech Recruiter)', icon: Users, desc: 'Initial screening, behavioral questions, culture fit.' }
    ];

    useEffect(() => {
        const loadVoices = () => {
            if ('speechSynthesis' in window) setVoices(window.speechSynthesis.getVoices());
        };
        loadVoices();
        if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, interimTranscript]);

    // Timer for speaking session
    useEffect(() => {
        let timer;
        if (isRecording) {
            timer = setInterval(() => setSpeakingTime(t => t + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [isRecording]);

    // Speech Recognition setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let interim = '';
                let final = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) final += event.results[i][0].transcript;
                    else interim += event.results[i][0].transcript;
                }
                setInterimTranscript(interim);
                if (final) {
                    handleSendMessage(final);
                    setInterimTranscript('');
                }
            };

            recognitionRef.current.onend = () => {
                if (isRecording && !window.speechSynthesis.speaking) {
                    try { recognitionRef.current.start(); } catch (e) { }
                }
            };
        }
    }, [isRecording, selectedPersona]);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsRecording(true);
                window.speechSynthesis.cancel();
            } catch (e) { console.error('Mic start error', e); }
        }
    };

    const handleSendMessage = async (textToSend) => {
        const query = textToSend || inputText;
        if (!query.trim()) return;

        setInputText('');
        setMessages(prev => [...prev, { role: 'user', text: query }]);

        setIsAiSpeaking(true);
        try {
            const res = await englishLabApi.softSkillsAIChat(query, messages, { persona: selectedPersona });
            const replyText = res.reply || res.response || "That is an excellent point! How do you plan to take it further?";

            setMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    text: replyText,
                    correction: res.correction || null
                }
            ]);

            speakText(replyText);

            // Log session data in background
            englishLabApi.saveSession({
                type: 'conversation',
                topic: `${selectedPersona.toUpperCase()} Spoken Practice`,
                transcript: query,
                durationSeconds: speakingTime || 30,
                scores: { fluency: 72, pronunciation: 68, grammar: 75, vocabulary: 65, confidence: 74, overall: 71 }
            }).catch(() => {});
        } catch (e) {
            console.error('Conversation AI error:', e);
            setIsAiSpeaking(false);
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
            const preferred = availableVoices.find(v => v.name.includes('Google US English') || v.lang.startsWith('en-'));
            if (preferred) utterance.voice = preferred;

            utterance.onstart = () => setIsAiSpeaking(true);
            utterance.onend = () => setIsAiSpeaking(false);
            utterance.onerror = () => setIsAiSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    };

    const handleResetChat = () => {
        window.speechSynthesis.cancel();
        setMessages([
            {
                role: 'ai',
                text: `Hello! I'm ready for our conversation as ${personas.find(p => p.id === selectedPersona)?.name}. What would you like to discuss?`,
                correction: null
            }
        ]);
        setSpeakingTime(0);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
            {/* Header: Persona Selector & Level info */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full border-2 border-purple-400 overflow-hidden shadow-2xs flex-shrink-0">
                        <AriaAvatar isSpeaking={isAiSpeaking} className="w-full h-full" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-slate-900 text-sm">Spoken Coach & Conversation Partner</h2>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold text-[10px] rounded-md">
                                CEFR: {profile.cefrLevel || 'B1'}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                            {isRecording ? `🔴 Live Recording (${speakingTime}s)` : 'Speak using microphone or type message below'}
                        </p>
                    </div>
                </div>

                {/* Persona Switcher Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                    {personas.map(p => {
                        const Icon = p.icon;
                        const isSelected = selectedPersona === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => {
                                    setSelectedPersona(p.id);
                                    handleResetChat();
                                }}
                                title={p.desc}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    isSelected
                                        ? 'bg-purple-600 text-white shadow-2xs'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">{p.name.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                    <button
                        onClick={handleResetChat}
                        title="Restart Conversation"
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-all"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Chat Conversation Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {/* Gentle Correction Box */}
                        {msg.correction && (
                            <div className="max-w-md p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 shadow-2xs">
                                <div className="font-bold text-amber-800 flex items-center gap-1 text-[11px]">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                    Gentle Grammar / Vocab Feedback:
                                </div>
                                <p className="text-slate-700 leading-snug">{msg.correction}</p>
                            </div>
                        )}

                        <div className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed ${
                            msg.role === 'user'
                                ? 'bg-purple-600 text-white rounded-br-none font-medium shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-2xs'
                        }`}>
                            {msg.role === 'ai' && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700 mb-1.5">
                                    <Bot className="w-3 h-3 text-purple-600" />
                                    <span>{personas.find(p => p.id === selectedPersona)?.name}</span>
                                </div>
                            )}
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}

                {/* Interim Live Transcript */}
                {interimTranscript && (
                    <div className="flex flex-col items-end gap-1">
                        <div className="max-w-md p-3 rounded-2xl bg-purple-100 text-purple-900 text-xs italic opacity-80 border border-purple-300">
                            🎤 "{interimTranscript}..."
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Controls Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
                <button
                    onClick={toggleRecording}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                        isRecording
                            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20'
                    }`}
                >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={isRecording ? 'Listening to your speech...' : 'Type or click the microphone to talk...'}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        className="px-4 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 shadow-2xs"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
