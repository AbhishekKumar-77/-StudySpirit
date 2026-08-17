import React, { useState } from 'react';
import { Volume2, Mic, MicOff, CheckCircle2, AlertCircle, RotateCcw, PlayCircle } from 'lucide-react';

export default function PronunciationCoachView() {
    const [selectedSound, setSelectedSound] = useState('/r/');
    const [selectedWord, setSelectedWord] = useState('software');
    const [recording, setRecording] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [result, setResult] = useState(null);

    const targetSounds = [
        { sound: '/r/', words: ['software', 'architecture', 'resource', 'strategy'] },
        { sound: '/th/', words: ['method', 'algorithm', 'authenticity', 'theory'] },
        { sound: '/v/', words: ['development', 'value', 'evaluate', 'environment'] }
    ];

    const currentSoundObj = targetSounds.find(s => s.sound === selectedSound) || targetSounds[0];

    const handleRecord = () => {
        if (recording) {
            setRecording(false);
            setEvaluating(true);
            setTimeout(() => {
                setEvaluating(false);
                setResult({
                    overallScore: 82,
                    accuracy: 78,
                    stress: 84,
                    clarity: 81,
                    intonation: 76,
                    wordScores: [
                        { word: selectedWord, score: 72, issue: 'R sound was slightly flat. Roll tongue further back.' },
                        { word: 'architecture', score: 88, issue: 'Good stress on third syllable.' }
                    ]
                });
            }, 1200);
        } else {
            setRecording(true);
            setResult(null);
        }
    };

    const speakWord = (word) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-purple-600" />
                    Pronunciation Coach
                </h2>
                <p className="text-xs text-slate-500">Perfect your English pronunciation sound by sound.</p>
            </div>

            {/* Target Sound Selector */}
            <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Target Sounds Today</label>
                <div className="flex gap-2">
                    {targetSounds.map(s => (
                        <button
                            key={s.sound}
                            onClick={() => { setSelectedSound(s.sound); setSelectedWord(s.words[0]); setResult(null); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedSound === s.sound
                                    ? 'bg-purple-600 text-white border-purple-600'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            Sound {s.sound}
                        </button>
                    ))}
                </div>
            </div>

            {/* Word Selection */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">Practice Word</label>
                <div className="flex flex-wrap gap-2">
                    {currentSoundObj.words.map(w => (
                        <button
                            key={w}
                            onClick={() => { setSelectedWord(w); setResult(null); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selectedWord === w
                                    ? 'bg-purple-100 text-purple-700 border-purple-300 font-bold'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                        >
                            {w}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        onClick={() => speakWord(selectedWord)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-50"
                    >
                        <PlayCircle className="w-4 h-4 text-purple-600" /> Listen to Native Example
                    </button>
                </div>
            </div>

            {/* Record Mic */}
            <div className="text-center space-y-3 py-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                <div className="text-xs font-bold text-slate-700">Speak "{selectedWord}" out loud</div>
                <button
                    onClick={handleRecord}
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all ${recording
                            ? 'bg-red-500 text-white animate-pulse shadow-lg'
                            : 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
                        }`}
                >
                    {recording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <p className="text-[11px] text-slate-500">{recording ? 'Click to finish recording...' : 'Click mic to record your pronunciation'}</p>
            </div>

            {/* Evaluation Results */}
            {result && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm">Pronunciation Breakdown</h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                            <div className="text-xs text-slate-500 font-medium">Overall Score</div>
                            <div className="text-xl font-black text-emerald-700">{result.overallScore}/100</div>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                            <div className="text-xs text-slate-500 font-medium">Accuracy</div>
                            <div className="text-xl font-black text-slate-900">{result.accuracy}%</div>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                            <div className="text-xs text-slate-500 font-medium">Stress</div>
                            <div className="text-xl font-black text-slate-900">{result.stress}%</div>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                            <div className="text-xs text-slate-500 font-medium">Clarity</div>
                            <div className="text-xl font-black text-slate-900">{result.clarity}%</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {result.wordScores.map((ws, i) => (
                            <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                    <span className="font-bold text-slate-900">{ws.word}</span>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{ws.issue}</p>
                                </div>
                                <span className="font-bold text-emerald-600">{ws.score}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
