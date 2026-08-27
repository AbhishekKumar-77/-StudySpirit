import React, { useState } from 'react';
import { ArrowLeft, Users, Mic, MicOff, Send, Award, MessageSquare, Bot, Camera, CameraOff } from 'lucide-react';

export default function GDPanelRoom({
    targetRole = 'Backend Developer',
    user,
    cameraEnabled = true,
    onToggleCamera,
    videoRef,
    onEndInterview,
    onBack
}) {
    const [topic] = useState('The Impact of Artificial Intelligence on Software Engineering Jobs');
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);

    // Multi-participant transcript
    const [messages, setMessages] = useState([
        {
            id: 1,
            speaker: 'MODERATOR (Aria)',
            avatarBg: 'bg-purple-600',
            personality: 'Moderator',
            text: `Welcome to the Group Discussion. Our topic today is: "${topic}". Let's start the discussion. Who would like to initiate?`
        },
        {
            id: 2,
            speaker: 'Alex',
            avatarBg: 'bg-blue-600',
            personality: 'Analytical & Data-Driven',
            text: 'I think AI will automate boilerplate coding, but complex system design and architecture will still require deep human domain expertise.'
        },
        {
            id: 3,
            speaker: 'Sarah',
            avatarBg: 'bg-pink-600',
            personality: 'Competitive & Direct',
            text: 'I respectfully disagree with Alex. Developer productivity is doubling with LLMs, meaning smaller teams will ship entire products faster.'
        }
    ]);

    const handleSendMessage = () => {
        if (!input.trim()) return;
        const userMsg = {
            id: Date.now(),
            speaker: user?.name || 'ABHISHEK',
            avatarBg: 'bg-emerald-600',
            personality: 'Student Candidate',
            text: input.trim()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI Panel participant reaction
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    speaker: 'Rohan (AI Candidate C)',
                    avatarBg: 'bg-amber-600',
                    personality: 'Supportive & Collaborative',
                    text: `I agree with ${user?.name ? user.name.split(' ')[0] : 'Abhishek'}'s point. Collaboration between human developers and AI assistants is the real competitive advantage.`
                }
            ]);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
            {/* Header */}
            <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Group Discussion Panel</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-sm font-bold text-white">Topic: {topic}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Live Student Webcam Small Preview Tile */}
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
            <div className="px-6 py-4 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-800 text-xs font-bold text-purple-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>MODERATOR (Aria)</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-800 text-xs font-bold text-blue-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Alex (Analytical)</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-950/80 border border-pink-800 text-xs font-bold text-pink-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                    <span>Sarah (Competitive)</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-xs font-bold text-emerald-300 shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>{user?.name ? user.name.toUpperCase() : 'ABHISHEK'} (You)</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-800 text-xs font-bold text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Rohan (Supportive)</span>
                </div>
            </div>

            {/* Discussion Stream */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 overflow-y-auto space-y-4">
                {messages.map((m) => (
                    <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 shadow-lg">
                        <div className={`w-10 h-10 rounded-2xl ${m.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md`}>
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
            </main>

            {/* Controls Bar */}
            <footer className="p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <button
                        onClick={() => setIsListening(!isListening)}
                        className={`p-3 rounded-xl border transition ${
                            isListening ? 'bg-rose-500 text-white border-rose-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
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
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
                    >
                        <span>Speak</span>
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
