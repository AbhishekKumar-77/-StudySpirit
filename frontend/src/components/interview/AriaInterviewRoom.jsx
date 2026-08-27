import React, { useState } from 'react';
import AriaAvatar from '../AriaAvatar';
import { ArrowLeft, Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, Pause, Play, Square, Eye, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

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
    onBack
}) {
    const [isPaused, setIsPaused] = useState(false);

    // Module 3: Live Interview Real-Time HUD State
    const [eyeContactPercent, setEyeContactPercent] = useState(94);
    const [speechWpm, setSpeechWpm] = useState(128);
    const [fillerWordCount, setFillerWordCount] = useState(1);
    const [confidenceLevel, setConfidenceLevel] = useState('High');

    const handleTogglePause = () => {
        if (!isPaused) {
            if (isListening) onToggleListening && onToggleListening();
            setIsPaused(true);
        } else {
            setIsPaused(false);
        }
    };

    const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai' || m.role === 'ai')?.text || 
        `Welcome to your ${targetRole} interview for ${targetCompany}. Tell me about yourself and your technical background.`;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
            {/* Top Bar */}
            <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">Interview Prep</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-sm font-bold text-white">{targetRole} · {targetCompany}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
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

            {/* Main Center Video / Avatar Workspace */}
            <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 justify-center">
                {isPaused && (
                    <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-2xl text-xs font-bold text-center animate-pulse">
                        ⏸ Interview Session Paused. Click "Resume" below to continue.
                    </div>
                )}

                {/* 2-Column AI & Candidate Stage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[340px] md:h-[400px]">
                    {/* ARIA AI Avatar Box */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/70 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-full z-10">
                            <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-purple-500 animate-pulse'}`} />
                            <span className="text-xs font-bold text-slate-200">ARIA</span>
                            <span className="text-[10px] text-slate-400">AI Interviewer</span>
                        </div>

                        <div className="w-48 h-48 md:w-56 md:h-56">
                            <AriaAvatar isSpeaking={isSpeaking && !isPaused} currentSpeaker={currentSpeaker} />
                        </div>
                    </div>

                    {/* YOU Candidate Video Box + Module 3 HUD Overlay */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-2 relative overflow-hidden shadow-2xl flex items-center justify-center">
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-full z-10">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold text-slate-200">YOU</span>
                            <span className="text-[10px] text-slate-400">Candidate</span>
                        </div>

                        {/* Module 3: Live Real-Time HUD Badges */}
                        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5 font-mono text-[10px]">
                            {/* Eye Contact Meter */}
                            <div className="bg-slate-950/90 border border-emerald-500/40 text-emerald-400 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                                <Eye className="w-3 h-3 text-emerald-400" />
                                <span>Eye Contact: {eyeContactPercent}%</span>
                            </div>

                            {/* Pacing WPM Meter */}
                            <div className="bg-slate-950/90 border border-cyan-500/40 text-cyan-400 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                                <Zap className="w-3 h-3 text-cyan-400" />
                                <span>Pacing: {speechWpm} WPM (Optimal)</span>
                            </div>

                            {/* Filler Word Counter */}
                            <div className="bg-slate-950/90 border border-amber-500/40 text-amber-400 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>Fillers: {fillerWordCount}</span>
                            </div>

                            {/* Confidence Level Badge */}
                            <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-md">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>Confidence: {confidenceLevel}</span>
                            </div>
                        </div>

                        {cameraEnabled ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover rounded-2xl"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                                <CameraOff className="w-10 h-10" />
                                <span className="text-xs font-semibold">Camera Off</span>
                            </div>
                        )}

                        <button
                            onClick={onToggleCamera}
                            className="absolute bottom-4 right-4 p-2.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white transition z-10"
                        >
                            {cameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* ARIA Live Question Display Box */}
                <div className="bg-slate-900/90 border border-purple-900/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-purple-400 uppercase tracking-widest mb-2">
                        <span>ARIA</span>
                    </div>

                    <p className="text-base md:text-lg font-medium text-slate-100 leading-relaxed">
                        "{lastAiMessage}"
                    </p>

                    {/* Candidate Text Backup Input */}
                    <div className="mt-4 flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                            placeholder="Type your response or speak into the microphone..."
                            disabled={isPaused || isLoading}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                        />
                        <button
                            onClick={onSendMessage}
                            disabled={isLoading || isPaused || !input.trim()}
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </main>

            {/* Bottom Controls Bar */}
            <footer className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between">
                {/* Listening Status */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleListening}
                        disabled={isPaused}
                        className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-bold transition shadow-lg ${
                            isListening
                                ? 'bg-rose-500 text-white shadow-rose-500/25 animate-pulse'
                                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25'
                        } ${isPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        <span>{isListening ? '🎙 Listening...' : 'Click to Speak'}</span>
                    </button>
                </div>

                {/* Center Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleTogglePause}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition"
                    >
                        {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                        <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>

                    <button
                        onClick={onEndInterview}
                        className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-bold border border-rose-500/30 flex items-center gap-2 transition"
                    >
                        <Square className="w-3.5 h-3.5" />
                        <span>End Interview</span>
                    </button>
                </div>

                {/* Question Counter */}
                <div className="text-xs font-bold text-slate-400">
                    Question <span className="text-white">{currentQuestionNum}</span> / {totalQuestionsConfig}
                </div>
            </footer>
        </div>
    );
}
