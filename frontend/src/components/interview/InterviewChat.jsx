import React, { useRef, useEffect } from 'react';
import { 
    Mic, MicOff, Send, Cpu, User, Users, Camera, Sparkles, MessageSquare
} from 'lucide-react';
import AriaAvatar from '../AriaAvatar';

export default function InterviewChat({
    messages,
    input,
    setInput,
    sendMessage,
    handleKeyDown,
    isLoading,
    mode,
    isSpeaking,
    currentSpeaker,
    targetRole,
    isListening,
    toggleListening,
    cameraEnabled,
    videoRef,
    vocalVolume,
    elapsedTime,
    wpm,
    fillerWordCount,
    currentQuestionNum,
    totalQuestionsConfig
}) {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="w-full flex flex-col lg:flex-row gap-6 overflow-hidden max-h-[80vh]">
            {/* Participants Sidebar (GD Mode Only) */}
            {mode === 'gd' && (
                <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0 animate-fade-in-right">
                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] flex-1 overflow-y-auto">
                        <h4 className="text-sm font-bold text-cyan-400 mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5"/> Group Participants
                        </h4>
                        <div className="space-y-4">
                            {[
                                { name: 'Aria', role: 'Moderator', color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-500/5' },
                                { name: 'Alex', role: 'Analytical Peer', color: 'text-blue-400', border: 'border-blue-500/50', bg: 'bg-blue-500/5' },
                                { name: 'Sarah', role: 'Creative Peer', color: 'text-pink-400', border: 'border-pink-500/50', bg: 'bg-pink-500/5' },
                                { name: 'You', role: 'Candidate', color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/5' }
                            ].map(p => (
                                <div 
                                    key={p.name} 
                                    className={`p-4 rounded-xl border transition-all duration-500 ${
                                        currentSpeaker === p.name || (p.name === 'You' && !isSpeaking) 
                                            ? `${p.border} ${p.bg} scale-105 shadow-xl` 
                                            : 'border-transparent opacity-60'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${currentSpeaker === p.name ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                                        <div>
                                            <div className={`text-sm font-bold ${p.color}`}>{p.name}</div>
                                            <div className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest">{p.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-[var(--border-color)]">
                            <div className="text-[10px] font-black uppercase text-[var(--text-muted)] mb-4 tracking-[0.2em]">Discussion Topic</div>
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] leading-relaxed italic">
                                "{targetRole || 'Software Engineer'}"
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Left side: Avatar and Camera */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    {/* Aria / Speaker Video */}
                    <div className="aspect-[4/3] md:aspect-auto bg-black/40 rounded-2xl border border-[var(--border-color)] relative overflow-hidden flex items-center justify-center min-h-[250px] shadow-2xl">
                        <AriaAvatar isSpeaking={isSpeaking} currentSpeaker={currentSpeaker} />
                        <div className="absolute top-4 left-4 z-20 flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-black/60 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> Interviewer
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent">
                            <h3 className="text-xl font-bold text-white mb-0.5">
                                {mode === 'gd' && isSpeaking ? currentSpeaker : 'Aria'}
                            </h3>
                            <p className="text-xs text-violet-300">
                                {mode === 'gd' && isSpeaking 
                                    ? (currentSpeaker === 'Alex' ? 'Analytical Peer' : currentSpeaker === 'Sarah' ? 'Creative Peer' : 'Moderator')
                                    : 'Senior Recruiter'}
                            </p>
                        </div>
                    </div>

                    {/* Candidate Camera Stream */}
                    <div className="aspect-[4/3] md:aspect-auto bg-black/20 rounded-2xl border border-[var(--border-color)] relative overflow-hidden flex items-center justify-center min-h-[250px]">
                        {cameraEnabled ? (
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                        ) : (
                            <div className="text-center text-[var(--text-muted)]">
                                <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">Webcam is disabled</p>
                            </div>
                        )}
                        <div className="absolute top-4 left-4 z-20">
                            <span className="px-3 py-1 rounded-full bg-black/60 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> Candidate
                            </span>
                        </div>

                        {/* Real-time speech statistics overlay */}
                        <div className="absolute bottom-4 left-4 right-4 z-20 grid grid-cols-3 gap-2 bg-black/65 backdrop-blur-md p-3.5 rounded-xl border border-white/5">
                            <div className="text-center">
                                <div className="text-xs text-[var(--text-muted)] font-black uppercase tracking-wider mb-0.5">Time</div>
                                <div className="text-sm font-black text-white font-mono">{formatTime(elapsedTime)}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-[var(--text-muted)] font-black uppercase tracking-wider mb-0.5">WPM</div>
                                <div className="text-sm font-black text-white font-mono">{wpm || '--'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-[var(--text-muted)] font-black uppercase tracking-wider mb-0.5">Fillers</div>
                                <div className="text-sm font-black text-rose-400 font-mono">{fillerWordCount}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat transcript / feed */}
                <div className="flex-[1.5] bg-[var(--bg-secondary)]/25 rounded-2xl border border-[var(--border-color)] flex flex-col overflow-hidden min-h-[250px]">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                {msg.role !== 'user' && (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shrink-0 shadow-lg">
                                        <Cpu className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[75%] p-4 rounded-2xl ${
                                    msg.role === 'user' 
                                        ? 'bg-cyan-500 text-white rounded-tr-none' 
                                        : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-none'
                                }`}>
                                    {/* Speaker labels in dialogues */}
                                    {msg.speakers && msg.speakers.map((sp, idx) => (
                                        <div key={idx} className="mb-2 last:mb-0">
                                            <span className={`font-black text-xs block mb-0.5 ${
                                                sp.name === 'Alex' ? 'text-blue-400' : sp.name === 'Sarah' ? 'text-pink-400' : 'text-cyan-400'
                                            }`}>{sp.name}:</span>
                                            <p className="text-sm leading-relaxed">{sp.text}</p>
                                        </div>
                                    ))}
                                    {!msg.speakers && <p className="text-sm leading-relaxed">{msg.content}</p>}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-4 animate-pulse">
                                <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                                    <Loader className="animate-spin text-[var(--text-muted)]" />
                                </div>
                                <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] p-4 rounded-2xl w-40 text-xs text-[var(--text-muted)]">
                                    Aria is processing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Speech visualizer waveform */}
                    {isListening && (
                        <div className="h-6 bg-cyan-500/10 border-t border-cyan-500/20 px-6 flex items-center justify-between">
                            <span className="text-[10px] text-cyan-400 uppercase font-black tracking-widest animate-pulse flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Listening to candidate...
                            </span>
                            <div className="flex gap-0.5 items-end h-3">
                                {[...Array(12)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="w-[2px] bg-cyan-500 rounded-full transition-all"
                                        style={{ height: `${Math.max(15, Math.min(100, vocalVolume * (1 + Math.sin(i))))}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom controls panel */}
                    <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-md flex items-center gap-3">
                        <button
                            onClick={toggleListening}
                            className={`p-3.5 rounded-xl transition-all shadow-lg shrink-0 ${
                                isListening 
                                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/25' 
                                    : 'bg-[var(--bg-secondary)] hover:bg-white/10 text-cyan-400 border border-[var(--border-color)]'
                            }`}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isListening ? "Listening... or type your response here..." : "Type your response here..."}
                            className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50"
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            className="p-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
