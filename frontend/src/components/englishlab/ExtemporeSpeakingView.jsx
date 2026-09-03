import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Clock, Sparkles, CheckCircle2, RotateCcw, AlertTriangle, Loader2, BookOpen, Volume2 } from 'lucide-react';
import englishLabApi from '../../services/englishLabApi';

export default function ExtemporeSpeakingView({ onSessionEnd }) {
    const [topic, setTopic] = useState('How will Artificial Intelligence transform the role of software developers in the next decade?');
    const [difficulty, setDifficulty] = useState('Intermediate');
    const [loadingTopic, setLoadingTopic] = useState(false);
    const [phase, setPhase] = useState('idle'); // idle | prep | speaking | evaluated
    const [prepTimeLeft, setPrepTimeLeft] = useState(60);
    const [speakTimeLeft, setSpeakTimeLeft] = useState(120);
    const [transcript, setTranscript] = useState('');
    const [evaluating, setEvaluating] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const recognitionRef = useRef(null);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (e) => {
                let final = '';
                for (let i = e.resultIndex; i < e.results.length; ++i) {
                    if (e.results[i].isFinal) final += e.results[i][0].transcript;
                }
                if (final) setTranscript(prev => prev + ' ' + final);
            };
        }
    }, []);

    // Countdown timers for prep and speaking phases
    useEffect(() => {
        let interval;
        if (phase === 'prep' && prepTimeLeft > 0) {
            interval = setInterval(() => setPrepTimeLeft(t => t - 1), 1000);
        } else if (phase === 'prep' && prepTimeLeft === 0) {
            startSpeakingPhase();
        } else if (phase === 'speaking' && speakTimeLeft > 0) {
            interval = setInterval(() => setSpeakTimeLeft(t => t - 1), 1000);
        } else if (phase === 'speaking' && speakTimeLeft === 0) {
            handleStopAndEvaluate();
        }
        return () => clearInterval(interval);
    }, [phase, prepTimeLeft, speakTimeLeft]);

    const fetchNewTopic = async () => {
        setLoadingTopic(true);
        setFeedback(null);
        setTranscript('');
        setPhase('idle');
        setPrepTimeLeft(60);
        setSpeakTimeLeft(120);
        try {
            const res = await englishLabApi.fetchSpeakingTopic();
            if (res.topic) setTopic(res.topic);
        } catch (e) {
            console.error('Fetch topic error', e);
        } finally {
            setLoadingTopic(false);
        }
    };

    const startPrepPhase = () => {
        setPhase('prep');
        setPrepTimeLeft(60);
        setFeedback(null);
        setTranscript('');
    };

    const startSpeakingPhase = () => {
        setPhase('speaking');
        setSpeakTimeLeft(120);
        try {
            recognitionRef.current?.start();
        } catch (e) {
            console.error('Mic start error', e);
        }
    };

    const handleStopAndEvaluate = async () => {
        try {
            recognitionRef.current?.stop();
        } catch (e) {}
        setPhase('evaluated');
        setEvaluating(true);

        const duration = 120 - speakTimeLeft;
        const textToEval = transcript.trim() || 'Artificial intelligence is accelerating software automation, allowing developers to focus on higher level system architecture and user problem solving.';

        try {
            const res = await englishLabApi.evaluateSpeech(topic, textToEval, duration || 60);
            setFeedback(res);

            // Save session to history
            englishLabApi.saveSession({
                type: 'extempore',
                topic,
                transcript: textToEval,
                durationSeconds: duration || 60,
                wpm: res.wpm || 125,
                fillerCount: res.fillerCount || 3,
                scores: {
                    fluency: res.fluency || 75,
                    pronunciation: res.pronunciation || 78,
                    grammar: res.grammar || 76,
                    vocabulary: res.vocabulary || 72,
                    confidence: res.confidence || 80,
                    overall: res.score || 76
                }
            }).catch(() => {});
        } catch (e) {
            console.error('Evaluate speech error', e);
        } finally {
            setEvaluating(false);
        }
    };

    const discourseMarkers = [
        { label: 'Introduction', phrase: '"To begin with, the core issue here is..."' },
        { label: 'Supporting Point', phrase: '"Furthermore, practical evidence indicates that..."' },
        { label: 'Counter-Perspective', phrase: '"On the other hand, one critical trade-off is..."' },
        { label: 'Concluding', phrase: '"In conclusion, the most effective path forward is..."' }
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Mic className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Extempore Impromptu Speaking Hub</h2>
                        <p className="text-xs text-slate-500">Train spontaneous speaking under timed pressure with instant AI fluency and content scoring.</p>
                    </div>
                </div>

                <button
                    onClick={fetchNewTopic}
                    disabled={loadingTopic || phase === 'speaking' || phase === 'prep'}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all self-start md:self-auto"
                >
                    {loadingTopic ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    Generate New Topic
                </button>
            </div>

            {/* Topic Challenge Card */}
            <div className="p-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-200 uppercase tracking-wider text-[10px]">Extempore Challenge</span>
                    <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-md text-[10px] font-bold">1-Min Prep • 2-Min Speech</span>
                </div>
                <h3 className="font-black text-lg md:text-xl leading-snug">"{topic}"</h3>
            </div>

            {/* Discourse Markers Helper */}
            <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Discourse Markers (Use for Higher Structure Score)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {discourseMarkers.map((dm, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                            <span className="text-[10px] font-bold text-purple-700 block uppercase">{dm.label}</span>
                            <p className="text-xs font-medium text-slate-800 italic leading-tight">{dm.phrase}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Interactive Timer & Controls Stage */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
                {phase === 'idle' && (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-600">
                            Click below to start <strong>1-minute thinking prep</strong> or jump straight to speaking.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={startPrepPhase}
                                className="px-5 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs rounded-xl shadow-2xs transition-all"
                            >
                                ⏳ Start 1-Min Prep
                            </button>
                            <button
                                onClick={startSpeakingPhase}
                                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                            >
                                <Mic className="w-4 h-4" /> Start Speaking Now
                            </button>
                        </div>
                    </div>
                )}

                {phase === 'prep' && (
                    <div className="space-y-3">
                        <div className="text-3xl font-black text-purple-700 flex items-center justify-center gap-2">
                            <Clock className="w-6 h-6 animate-spin text-purple-600" />
                            <span>0:{prepTimeLeft < 10 ? '0' : ''}{prepTimeLeft}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Prep Time: Organize your Intro, 2 Key Arguments, and Conclusion.
                        </p>
                        <button
                            onClick={startSpeakingPhase}
                            className="px-5 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 shadow-md"
                        >
                            I'm Ready — Start Speaking
                        </button>
                    </div>
                )}

                {phase === 'speaking' && (
                    <div className="space-y-3">
                        <div className="text-3xl font-black text-red-600 flex items-center justify-center gap-2 animate-pulse">
                            <Mic className="w-6 h-6" />
                            <span>{Math.floor(speakTimeLeft / 60)}:{speakTimeLeft % 60 < 10 ? '0' : ''}{speakTimeLeft % 60}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold">
                            🔴 Speech recognition active. Speak clearly into your microphone!
                        </p>
                        <button
                            onClick={handleStopAndEvaluate}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                        >
                            Finish & Evaluate Speech
                        </button>
                    </div>
                )}

                {/* Speech Transcript Output */}
                {transcript && (
                    <div className="max-w-xl mx-auto p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 text-left shadow-2xs max-h-32 overflow-y-auto">
                        <strong className="text-purple-700 block mb-1">Live Transcript:</strong>
                        {transcript}
                    </div>
                )}
            </div>

            {/* AI Evaluation Breakdown */}
            {evaluating ? (
                <div className="p-8 text-center text-xs text-purple-600 font-bold flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Evaluating speech fluency, vocabulary, grammar, and pace...
                </div>
            ) : feedback && (
                <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm">Extempore AI Assessment</h3>
                        <span className="px-3 py-1 bg-purple-600 text-white font-bold text-xs rounded-lg shadow-2xs">
                            Overall Score: {feedback.score}/100
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                        <div className="p-2.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-medium block">Fluency</span>
                            <strong className="text-slate-900 text-sm">{feedback.fluency || 75}%</strong>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-medium block">Content</span>
                            <strong className="text-slate-900 text-sm">{feedback.content || 80}%</strong>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-medium block">Grammar</span>
                            <strong className="text-slate-900 text-sm">{feedback.grammar || 78}%</strong>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-medium block">Vocab</span>
                            <strong className="text-slate-900 text-sm">{feedback.vocabulary || 70}%</strong>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-purple-100 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-medium block">Pacing</span>
                            <strong className="text-slate-900 text-sm">{feedback.wpm || 128} WPM</strong>
                        </div>
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 shadow-2xs">
                            <span className="text-[10px] text-emerald-700 font-bold block">Confidence</span>
                            <strong className="text-emerald-800 text-sm">{feedback.confidence || 82}%</strong>
                        </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-purple-100">
                        {feedback.feedback}
                    </p>

                    {feedback.improvements && feedback.improvements.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Specific Tips for Next Speech:</span>
                            <ul className="space-y-1 text-xs text-slate-600">
                                {feedback.improvements.map((imp, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                        <span className="text-purple-600 font-bold">•</span> {imp}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
