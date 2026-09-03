import React, { useState } from 'react';
import {
    Presentation, Video, Sparkles, Mic, MicOff, CheckCircle2,
    Eye, Shield, Volume2, Award, ArrowRight, Play, Loader2, BookOpen
} from 'lucide-react';
import englishLabApi from '../../services/englishLabApi';

export default function PresentationCoachView() {
    const [activeSection, setActiveSection] = useState('frameworks'); // frameworks | delivery | body_language | pitch_practice
    const [selectedFramework, setSelectedFramework] = useState('STAR');
    const [pitchTopic, setPitchTopic] = useState('Introduce your major project in 45 seconds to an engineering manager.');
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const frameworks = [
        {
            id: 'STAR',
            title: 'STAR Method (Projects & Behavior)',
            desc: 'Best for answering behavioral questions & explaining past technical projects.',
            steps: [
                { step: 'Situation', text: 'Set the context, company/college, project scope.' },
                { step: 'Task', text: 'What challenge or goal needed to be achieved?' },
                { step: 'Action', text: 'What specific technical steps did YOU execute?' },
                { step: 'Result', text: 'What was the quantifiable outcome or impact (e.g. 35% faster)?' }
            ],
            example: '"In my final year semester project (Situation), our web app suffered from slow query performance (Task). I refactored our database indexes and introduced Redis caching (Action). As a result, API response times dropped by 60% (Result)."'
        },
        {
            id: 'PAS',
            title: 'Problem - Agitation - Solution (PAS)',
            desc: 'Ideal for pitching new ideas, product proposals, or architectural changes.',
            steps: [
                { step: 'Problem', text: 'State the core pain point clearly.' },
                { step: 'Agitate', text: 'Highlight what happens if the problem goes unaddressed.' },
                { step: 'Solution', text: 'Introduce your project/tool as the definitive fix.' }
            ],
            example: '"College students waste 2 hours daily searching scattered study notes (Problem). This leads to exam cramming and poor retention (Agitation). StudySpirit solves this with an AI-curated academic roadmap and instant mentor chat (Solution)."'
        },
        {
            id: 'HOOK',
            title: 'Hook - Story - Call to Action (Hook-Story-CTA)',
            desc: 'Captivating structure for tech talks, conference demos, and seminar presentations.',
            steps: [
                { step: 'Hook (0-15s)', text: 'Surprising statistic, relatable question, or bold statement.' },
                { step: 'Story (15-60s)', text: 'The journey of how you built or discovered the solution.' },
                { step: 'Call to Action', text: 'Next step: demo the app, ask questions, or collaborate.' }
            ],
            example: '"Did you know 70% of engineering students struggle with technical communication? Here is how we designed Aria to bridge that gap."'
        }
    ];

    const bodyLanguageTips = [
        {
            title: 'Camera & Eye Contact',
            icon: Eye,
            tag: 'Virtual Meetings & Interviews',
            tips: [
                'Position your webcam at eye-level using a laptop stand or books.',
                'Look directly into the camera lens when making key points, not down at the screen.',
                'Ensure soft front-lighting so your face and expressions are clear.'
            ]
        },
        {
            title: 'Vocal Modulation & Cadence',
            icon: Volume2,
            tag: 'Spoken Impact',
            tips: [
                'Vary your speaking pace: slow down when introducing key concepts, speed up during lively stories.',
                'Embrace purposeful 1-second pauses instead of saying "umm", "like", or "basically".',
                'End declarative statements on a confident downward pitch rather than question intonation.'
            ]
        },
        {
            title: 'Posture & Hand Gestures',
            icon: Shield,
            tag: 'Non-Verbal Confidence',
            tips: [
                'Keep your shoulders relaxed and back straight to open up your diaphragm.',
                'Use open hand gestures within the camera frame to emphasize bullet points or scale.',
                'Avoid folding arms, touching your face, or swiveling on rotating chairs.'
            ]
        }
    ];

    const transitionPhrases = [
        { category: 'Starting & Hook', phrases: ['"Let me begin by asking a simple question..."', '"Today, I want to walk you through how we tackled..."', '"The main objective of this presentation is..."'] },
        { category: 'Moving Between Slides', phrases: ['"Now that we have covered the architecture, let us examine the results..."', '"Turning our attention to the frontend implementation..."', '"This directly brings us to our next key metric..."'] },
        { category: 'Handling Tough Questions', phrases: ['"That is an insightful question, let me break it down into two parts..."', '"Thank you for pointing that out. Based on our benchmarks..."', '"I would be happy to dive deeper into the edge cases..."'] }
    ];

    const handleStartRecording = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;

            rec.onresult = (e) => {
                let final = '';
                for (let i = e.resultIndex; i < e.results.length; ++i) {
                    if (e.results[i].isFinal) final += e.results[i][0].transcript;
                }
                if (final) setTranscript(prev => prev + ' ' + final);
            };

            rec.start();
            setIsRecording(true);
            setFeedback(null);
            window._pitchRec = rec;
        } else {
            alert('Speech recognition is not supported in this browser. Please use Google Chrome.');
        }
    };

    const handleStopAndEvaluate = async () => {
        if (window._pitchRec) {
            window._pitchRec.stop();
            window._pitchRec = null;
        }
        setIsRecording(false);
        setEvaluating(true);

        try {
            const textToEval = transcript || 'In our project we built a real-time web application to solve latency bottlenecks using React and Node.js.';
            const res = await englishLabApi.evaluateSpeech(pitchTopic, textToEval, 45);
            setFeedback(res);
        } catch (e) {
            console.error('Pitch evaluate error', e);
        } finally {
            setEvaluating(false);
        }
    };

    const currentFwObj = frameworks.find(f => f.id === selectedFramework) || frameworks[0];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                        <Presentation className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Presentation & Body Language Coach</h2>
                        <p className="text-xs text-slate-500">Master presentation structures, video body language, transition phrases, and pitch delivery.</p>
                    </div>
                </div>
            </div>

            {/* Sub-navigation */}
            <div className="flex gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
                {[
                    { id: 'frameworks', label: 'Storytelling Frameworks (STAR / PAS)' },
                    { id: 'pitch_practice', label: '🎙️ Live Pitch Practice' },
                    { id: 'body_language', label: 'Camera & Body Language Guide' },
                    { id: 'delivery', label: 'Slide Transition Phrases' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeSection === tab.id
                                ? 'bg-purple-600 text-white shadow-2xs'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* SECTION 1: Storytelling Frameworks */}
            {activeSection === 'frameworks' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {frameworks.map(fw => (
                            <button
                                key={fw.id}
                                onClick={() => setSelectedFramework(fw.id)}
                                className={`p-4 rounded-xl border text-left transition-all space-y-1.5 ${
                                    selectedFramework === fw.id
                                        ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-600/20'
                                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                                }`}
                            >
                                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">{fw.id} Method</span>
                                <h4 className="font-bold text-slate-900 text-xs">{fw.title}</h4>
                                <p className="text-[11px] text-slate-500 leading-snug">{fw.desc}</p>
                            </button>
                        ))}
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            {currentFwObj.title} Breakdown
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {currentFwObj.steps.map((s, idx) => (
                                <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                                    <span className="w-6 h-6 rounded-md bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                                        {idx + 1}
                                    </span>
                                    <h5 className="font-bold text-slate-900 text-xs mt-2">{s.step}</h5>
                                    <p className="text-[11px] text-slate-500 leading-snug">{s.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1 text-xs">
                            <strong className="text-purple-800 font-bold block text-[11px] uppercase tracking-wide">
                                💡 Real Engineering Example:
                            </strong>
                            <p className="text-slate-700 italic leading-relaxed">{currentFwObj.example}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 2: Live Pitch Practice */}
            {activeSection === 'pitch_practice' && (
                <div className="space-y-6">
                    <div className="p-5 bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl shadow-sm space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-purple-200 uppercase tracking-wider text-[10px]">Challenge Prompt</span>
                            <span className="px-2 py-0.5 bg-white/20 text-white rounded-md text-[10px] font-bold">45 Seconds</span>
                        </div>
                        <h3 className="font-bold text-base leading-snug">{pitchTopic}</h3>
                        <p className="text-xs text-purple-200">
                            Apply the STAR or Hook-Story framework. Introduce the problem, your architecture, and the impact.
                        </p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
                        <div className="flex justify-center">
                            {!isRecording ? (
                                <button
                                    onClick={handleStartRecording}
                                    className="px-6 py-3 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-purple-700 flex items-center gap-2"
                                >
                                    <Mic className="w-4 h-4" /> Start Spoken Pitch (45s)
                                </button>
                            ) : (
                                <button
                                    onClick={handleStopAndEvaluate}
                                    className="px-6 py-3 bg-red-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-red-700 animate-pulse flex items-center gap-2"
                                >
                                    <MicOff className="w-4 h-4" /> Stop & Evaluate Pitch
                                </button>
                            )}
                        </div>

                        {transcript && (
                            <div className="max-w-xl mx-auto p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 text-left">
                                <strong className="text-purple-700 block mb-1">Your Speech Transcript:</strong>
                                {transcript}
                            </div>
                        )}
                    </div>

                    {evaluating ? (
                        <div className="p-8 text-center text-xs text-purple-600 font-bold flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" /> Evaluating pitch structure, confidence, and pacing...
                        </div>
                    ) : feedback && (
                        <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 text-sm">AI Pitch Evaluation</h3>
                                <span className="px-3 py-1 bg-purple-600 text-white font-bold text-xs rounded-lg">
                                    Overall Score: {feedback.score}/100
                                </span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">{feedback.feedback}</p>
                            {feedback.improvements && feedback.improvements.length > 0 && (
                                <div className="space-y-1 pt-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Actionable Suggestions:</span>
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
            )}

            {/* SECTION 3: Camera & Body Language Guide */}
            {activeSection === 'body_language' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {bodyLanguageTips.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-xs">{card.title}</h4>
                                        <span className="text-[10px] font-bold text-purple-600">{card.tag}</span>
                                    </div>
                                </div>

                                <ul className="space-y-2 text-xs text-slate-600 pt-1">
                                    {card.tips.map((tip, tIdx) => (
                                        <li key={tIdx} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* SECTION 4: Slide Transition Phrases */}
            {activeSection === 'delivery' && (
                <div className="space-y-4">
                    {transitionPhrases.map((cat, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                            <h4 className="font-bold text-purple-700 text-xs uppercase tracking-wider">{cat.category}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {cat.phrases.map((phrase, pIdx) => (
                                    <div key={pIdx} className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 shadow-2xs">
                                        {phrase}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
