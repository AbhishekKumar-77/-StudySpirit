import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, Mic, MicOff, Send, Award, MessageSquare, Bot, Camera, CameraOff, Volume2, VolumeX, Sparkles, Loader2 } from 'lucide-react';
import { API_BASE } from '../../config';

export default function GDPanelRoom({
    targetRole = 'Software Engineer',
    user,
    cameraEnabled = false,
    onToggleCamera,
    videoRef,
    onEndInterview,
    onBack
}) {
    const topic = 'The Impact of Artificial Intelligence on Software Engineering Jobs';
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(true);
    const messagesEndRef = useRef(null);

    // Multi-participant live transcript
    const [messages, setMessages] = useState([
        {
            id: 'm-1',
            speaker: 'MODERATOR (Aria)',
            avatarBg: 'bg-purple-600',
            personality: 'Moderator',
            text: `Welcome everyone to today's Group Discussion panel. Our topic is: "${topic}". Let's start the discussion. What are your perspectives on how LLMs and agentic AI are transforming the engineering ecosystem?`
        },
        {
            id: 'm-2',
            speaker: 'Alex',
            avatarBg: 'bg-blue-600',
            personality: 'Analytical & Data-Driven',
            text: 'I believe AI will automate repetitive boilerplate code, but high-level system architecture, distributed concurrency, and business domain logic will still require deep human expertise.'
        },
        {
            id: 'm-3',
            speaker: 'Sarah',
            avatarBg: 'bg-pink-600',
            personality: 'Competitive & Direct',
            text: 'While that is true, developer productivity is multiplying tenfold. Engineering teams will become much leaner, meaning candidates must master full-stack AI orchestration to stay competitive.'
        }
    ]);

    // Speech synthesis helper
    const speakText = (text) => {
        if (!autoSpeak || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send candidate thought to real backend AI
    const handleSendMessage = async () => {
        if (!input.trim() || isLoadingAI) return;

        const candidateText = input.trim();
        const userMsg = {
            id: `msg-${Date.now()}`,
            speaker: user?.name ? user.name.toUpperCase() : 'CANDIDATE (You)',
            avatarBg: 'bg-emerald-600',
            personality: 'Candidate',
            text: candidateText
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoadingAI(true);

        try {
            const historyContext = messages.map(m => ({
                role: m.speaker.includes('CANDIDATE') || m.speaker.includes(user?.name || '') ? 'user' : 'assistant',
                content: `${m.speaker}: ${m.text}`
            }));

            // Call real backend AI with mode: 'gd'
            const response = await fetch(`${API_BASE}/solo/ai/interview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({
                    message: candidateText,
                    mode: 'gd',
                    role: topic,
                    context: historyContext,
                    questionNumber: messages.length + 1,
                    totalQuestions: 10
                })
            });

            const data = await response.json();
            const parsed = data.parsedResponse || {};

            if (parsed.speakers && Array.isArray(parsed.speakers) && parsed.speakers.length > 0) {
                const newSpeakerMsgs = parsed.speakers.map((s, idx) => ({
                    id: `ai-${Date.now()}-${idx}`,
                    speaker: s.name || 'AI Participant',
                    avatarBg: s.name === 'Alex' ? 'bg-blue-600' : s.name === 'Sarah' ? 'bg-pink-600' : s.name === 'Rohan' ? 'bg-amber-600' : 'bg-purple-600',
                    personality: s.name === 'Alex' ? 'Analytical' : s.name === 'Sarah' ? 'Competitive' : s.name === 'Rohan' ? 'Collaborative' : 'Moderator',
                    text: s.text
                }));

                setMessages(prev => [...prev, ...newSpeakerMsgs]);
                speakText(newSpeakerMsgs.map(m => m.text).join(' '));
            } else if (data.response) {
                const fallbackMsg = {
                    id: `ai-${Date.now()}`,
                    speaker: 'Rohan (AI Candidate C)',
                    avatarBg: 'bg-amber-600',
                    personality: 'Collaborative Peer',
                    text: data.response
                };
                setMessages(prev => [...prev, fallbackMsg]);
                speakText(data.response);
            }
        } catch (err) {
            console.error('GD Panel AI error:', err);
            // Intelligent fallback response
            const fallbackMsg = {
                id: `ai-${Date.now()}`,
                speaker: 'Rohan (AI Candidate C)',
                avatarBg: 'bg-amber-600',
                personality: 'Collaborative Peer',
                text: `I strongly agree with ${user?.name ? user.name.split(' ')[0] : 'your'} perspective. Blending developer judgment with AI automation is definitely the optimal path forward.`
            };
            setMessages(prev => [...prev, fallbackMsg]);
        } finally {
            setIsLoadingAI(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans select-none">
            {/* Header */}
            <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">AI Group Discussion Panel</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-sm font-bold text-white">Topic: {topic}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        className={`p-2 rounded-xl border transition ${
                            autoSpeak ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                        title="Toggle Multi-Voice Output"
                    >
                        {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>

                    {/* Live Student Webcam Preview Tile */}
                    <div className="relative w-28 h-14 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-md flex items-center justify-center">
                        {cameraEnabled ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <CameraOff className="w-4 h-4 text-slate-600" />
                        )}
                        <button
                            onClick={onToggleCamera}
                            className="absolute bottom-1 right-1 p-1 rounded-full bg-slate-950/80 text-slate-400 hover:text-white"
                            title="Toggle Camera"
                        >
                            {cameraEnabled ? <Camera className="w-3 h-3 text-emerald-400" /> : <CameraOff className="w-3 h-3 text-rose-400" />}
                        </button>
                    </div>

                    <button
                        onClick={onEndInterview}
                        className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs px-4 py-2 rounded-xl transition"
                    >
                        END DISCUSSION
                    </button>
                </div>
            </header>

            {/* Virtual Round Table Display */}
            <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-xs font-bold text-purple-300">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>MODERATOR (Aria)</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-xs font-bold text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Alex (Analytical)</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-800 text-xs font-bold text-pink-300">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>Sarah (Competitive)</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-xs font-bold text-emerald-300 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>{user?.name ? user.name.toUpperCase() : 'CANDIDATE'} (You)</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-xs font-bold text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Rohan (Supportive)</span>
                </div>
            </div>

            {/* Discussion Stream */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 overflow-y-auto space-y-4">
                {messages.map((m) => (
                    <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 shadow-lg">
                        <div className={`w-10 h-10 rounded-2xl ${m.avatarBg} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md`}>
                            {m.speaker.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="text-xs font-extrabold text-white">{m.speaker}</h4>
                                <span className="text-[10px] font-semibold text-slate-500">{m.personality}</span>
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed">{m.text}</p>
                        </div>
                    </div>
                ))}
                {isLoadingAI && (
                    <div className="flex items-center gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>AI Panel members are deliberating and formulating counter-points...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Controls Bar */}
            <footer className="p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <button
                        onClick={() => setIsListening(!isListening)}
                        className={`p-3 rounded-xl border transition ${
                            isListening ? 'bg-rose-500 text-white border-rose-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                        title="Toggle Mic"
                    >
                        {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Contribute your thought to the Group Discussion..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />

                    <button
                        onClick={handleSendMessage}
                        disabled={isLoadingAI || !input.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
                    >
                        <span>Speak</span>
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
