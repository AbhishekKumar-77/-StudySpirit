import React, { useState, useEffect, useRef } from 'react';
import {
    Mic, MicOff, Volume2, Sparkles, Bot, RefreshCw, Send, CheckCircle2,
    AlertCircle, ArrowRight, RotateCcw
} from 'lucide-react';
import englishLabApi from '../../services/englishLabApi';
import AriaAvatar from '../AriaAvatar';

export default function AIConversationView({ profile = {}, onSessionEnd }) {
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            text: "Hello Abhishek! I'm Aria, your English coach. Today let's talk about your college project. What topic are you working on?",
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

    useEffect(() => {
        const loadVoices = () => {
            if ('speechSynthesis' in window) setVoices(window.speechSynthesis.getVoices());
        };
        loadVoices();
        if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

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
    }, [isRecording]);

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
            const res = await englishLabApi.softSkillsAIChat(query, messages);
            setMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    text: res.reply || res.response || "That's very interesting! Tell me more about that.",
                    correction: res.correction || null
                }
            ]);

            speakText(res.reply || res.response);

            // Log session data
            englishLabApi.saveSession({
                type: 'conversation',
                topic: 'College Project Discussion',
                transcript: query,
                durationSeconds: 30,
                scores: { fluency: 68, pronunciation: 65, grammar: 72, vocabulary: 60, confidence: 70, overall: 67 }
            });
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

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[640px] overflow-hidden">
            {/* Session Goal & Level Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="font-bold text-slate-900 text-sm">Speak with Aria</h2>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold text-[10px] rounded-md">
                            Level: {profile.cefrLevel || 'B1'}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">Goal: Speak for 3 minutes without switching languages.</p>
                </div>

                <div className="w-10 h-10 rounded-full border-2 border-purple-300 overflow-hidden shadow-2xs">
                    <AriaAvatar isSpeaking={isAiSpeaking} className="w-full h-full" />
                </div>
            </div>

            {/* Chat Conversation Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {/* Gentle Correction Box */}
                        {msg.correction && (
                            <div className="max-w-md p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                                <div className="font-bold text-amber-800 flex items-center gap-1 text-[11px]">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                    Quick Feedback
                                </div>
                                <p className="text-slate-700">{msg.correction}</p>
                            </div>
                        )}

                        <div className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed ${msg.role === 'user'
                                ? 'bg-purple-600 text-white rounded-br-none font-medium shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-2xs'
                            }`}>
                            {msg.role === 'ai' && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-purple-700 mb-1">
                                    <Bot className="w-3 h-3 text-purple-600" /> Aria Coach
                                </div>
                            )}
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Controls Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
                <button
                    onClick={toggleRecording}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording
                            ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
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
                        placeholder={isRecording ? 'Listening to your speech...' : 'Type or click mic to talk to Aria...'}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        className="px-4 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
