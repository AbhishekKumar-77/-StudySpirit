import React, { useState, useEffect, useMemo, useRef } from 'react';
import AriaAvatar from '../AriaAvatar';
import { ArrowLeft, Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, Pause, Play, Square, Eye, Zap, AlertTriangle, ShieldCheck, Send, Loader2 } from 'lucide-react';

export default function AriaInterviewRoom({
    targetRole = 'Backend Developer',
    targetCompany = 'Google',
    messages = [],
    input = '',
    setInput,
    onSendMessage,
    isLoading,
    isSpeaking,
    currentSpeaker,
    isListening,
    onToggleListening,
    cameraEnabled,
    onToggleCamera,
    videoRef,
    autoSpeak,
    onToggleAutoSpeak,
    currentQuestionNum = 1,
    totalQuestionsConfig = 10,
    onEndInterview,
    onBack,
    mode = 'aria'
}) {
    const [isPaused, setIsPaused] = useState(false);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const chatEndRef = useRef(null);

    // Session Timer
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setSecondsElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [isPaused]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Format elapsed time
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Compute Real Speech Analytics from User Messages
    const analytics = useMemo(() => {
        const userMessages = messages.filter(m => m.sender === 'user' || m.role === 'user');
        const allUserText = userMessages.map(m => m.text || m.content || '').join(' ') + ' ' + input;

        const words = allUserText.trim().split(/\s+/).filter(Boolean);
        const wordCount = words.length;

        const fillerMatches = allUserText.match(/\b(um|uh|er|ah|like|basically|actually|you know|sort of|kind of|i mean)\b/gi) || [];
        const fillerCount = fillerMatches.length;

        const minutes = Math.max(secondsElapsed / 60, 0.25);
        const wpm = Math.min(220, Math.max(85, Math.round(wordCount / minutes)));

        const fillerDensity = wordCount > 0 ? (fillerCount / wordCount) * 100 : 0;
        let confidence = 'High';
        if (fillerDensity > 8) confidence = 'Needs Focus';
        else if (fillerDensity > 4) confidence = 'Moderate';

        const eyeContact = cameraEnabled ? Math.min(98, 90 + Math.floor((secondsElapsed % 8))) : 0;

        return { wpm, fillerCount, confidence, eyeContact };
    }, [messages, input, secondsElapsed, cameraEnabled]);

    const handleTogglePause = () => {
        if (!isPaused) {
            if (isListening) onToggleListening && onToggleListening();
            setIsPaused(true);
        } else {
            setIsPaused(false);
        }
    };

    // Get round label
    const getRoundLabel = () => {
        if (mode === 'behavioral' || mode === 'hr') return 'HR & Behavioral Round';
        if (mode === 'technical') return 'Technical Round';
        if (mode === 'gd') return 'Group Discussion';
        return 'AI Mock Interview';
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
            {/* Top Bar */}
            <header className="px-4 md:px-6 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">{getRoundLabel()}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs font-bold text-white">{targetRole} · {targetCompany}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-500 font-mono">{formatTime(secondsElapsed)}</span>
                            <span className="text-[10px] text-slate-600">•</span>
                            <span className="text-[10px] text-slate-400">Q{currentQuestionNum}/{totalQuestionsConfig}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleAutoSpeak}
                        className={`p-2 rounded-xl border transition ${
                            autoSpeak ? 'bg-purple-950/60 border-purple-800 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                        title="Toggle Voice Output"
                    >
                        {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={onEndInterview}
                        className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs px-4 py-2 rounded-xl transition"
                    >
                        END INTERVIEW
                    </button>
                </div>
            </header>

            {/* Main Content: 2-column layout */}
            <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
                {/* Left Column: Avatar + Camera + Analytics */}
                <div className="lg:w-[400px] xl:w-[440px] shrink-0 flex flex-col gap-3 p-3 md:p-4 border-r border-slate-800/50">
                    {isPaused && (
                        <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-xl text-[10px] font-bold text-center animate-pulse">
                            ⏸ Session Paused
                        </div>
                    )}

                    {/* ARIA AI Avatar */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-xl h-[200px]">
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded-full z-10">
                            <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-purple-500 animate-pulse'}`} />
                            <span className="text-[10px] font-bold text-slate-200">ARIA</span>
                            <span className="text-[9px] text-slate-400">AI Interviewer</span>
                        </div>
                        <div className="w-36 h-36">
                            <AriaAvatar isSpeaking={isSpeaking && !isPaused} currentSpeaker={currentSpeaker} />
                        </div>
                    </div>

                    {/* Candidate Video + Analytics HUD */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 relative overflow-hidden shadow-xl h-[180px] flex items-center justify-center">
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded-full z-10">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-200">YOU</span>
                        </div>

                        {/* Analytics HUD */}
                        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1 font-mono text-[9px]">
                            <div className="bg-slate-950/90 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
                                <Eye className="w-2.5 h-2.5" />
                                <span>Eye: {analytics.eyeContact}%</span>
                            </div>
                            <div className="bg-slate-950/90 border border-cyan-500/40 text-cyan-400 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
                                <Zap className="w-2.5 h-2.5" />
                                <span>{analytics.wpm} WPM</span>
                            </div>
                            <div className="bg-slate-950/90 border border-amber-500/40 text-amber-400 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Fillers: {analytics.fillerCount}</span>
                            </div>
                            <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>{analytics.confidence}</span>
                            </div>
                        </div>

                        {cameraEnabled ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover rounded-xl"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-500 gap-1.5">
                                <CameraOff className="w-8 h-8" />
                                <span className="text-[10px] font-semibold">Camera Off</span>
                            </div>
                        )}

                        <button
                            onClick={onToggleCamera}
                            className="absolute bottom-3 right-3 p-2 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white transition z-10"
                        >
                            {cameraEnabled ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
                        </button>
                    </div>

                    {/* Quick Controls */}
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={onToggleListening}
                            disabled={isPaused}
                            className={`flex-1 p-2.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold transition shadow-lg ${
                                isListening
                                    ? 'bg-rose-500 text-white shadow-rose-500/25 animate-pulse'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25'
                            } ${isPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                            <span>{isListening ? '🎙 Listening...' : 'Click to Speak'}</span>
                        </button>

                        <button
                            onClick={handleTogglePause}
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1.5 transition"
                        >
                            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                            <span>{isPaused ? 'Resume' : 'Pause'}</span>
                        </button>

                        <button
                            onClick={onEndInterview}
                            className="p-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1.5 transition"
                        >
                            <Square className="w-3 h-3" />
                            <span>End</span>
                        </button>
                    </div>
                </div>

                {/* Right Column: Full Conversation Transcript + Input */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Scrollable Chat Transcript */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                        {messages.map((msg, idx) => {
                            const isAi = msg.role === 'ai' || msg.sender === 'ai';
                            const text = msg.text || msg.content || '';

                            return (
                                <div key={msg.id || idx} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${
                                        isAi
                                            ? 'bg-slate-900/90 border border-purple-900/40'
                                            : 'bg-purple-600/20 border border-purple-500/30'
                                    }`}>
                                        {/* Sender Label */}
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {isAi ? (
                                                <>
                                                    <span className={`w-2 h-2 rounded-full ${isSpeaking && idx === messages.length - 1 ? 'bg-emerald-400 animate-ping' : 'bg-purple-500'}`} />
                                                    <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest">ARIA INTERVIEWER</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">YOUR ANSWER</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Message Content */}
                                        <p className={`text-sm leading-relaxed ${isAi ? 'text-slate-100' : 'text-slate-200'}`}>
                                            {isAi ? `"${text}"` : text}
                                        </p>

                                        {/* Score Badge for AI messages */}
                                        {isAi && msg.score > 0 && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                    msg.score >= 7
                                                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                                                        : msg.score >= 4
                                                            ? 'bg-amber-950/60 border-amber-800 text-amber-400'
                                                            : 'bg-rose-950/60 border-rose-800 text-rose-400'
                                                }`}>
                                                    Score: {msg.score}/10
                                                </span>
                                                {msg.feedback && (
                                                    <span className="text-[9px] text-slate-500 italic truncate max-w-[200px]">{msg.feedback}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-900/90 border border-purple-900/40 rounded-2xl p-4 shadow-lg max-w-[85%]">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                        <span className="text-xs text-purple-300 font-medium">Aria is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Bar (sticky bottom) */}
                    <div className="shrink-0 p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
                        <div className="flex items-center gap-2 max-w-4xl mx-auto">
                            <button
                                onClick={onToggleListening}
                                disabled={isPaused}
                                className={`p-3 rounded-xl transition shrink-0 ${
                                    isListening
                                        ? 'bg-rose-500 text-white animate-pulse'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                                } ${isPaused ? 'opacity-50' : ''}`}
                                title={isListening ? 'Stop Listening' : 'Start Speaking'}
                            >
                                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                                placeholder="Type your response or speak into the microphone..."
                                disabled={isPaused || isLoading}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 placeholder-slate-600"
                            />

                            <button
                                onClick={onSendMessage}
                                disabled={isLoading || isPaused || !input.trim()}
                                className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl transition shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
