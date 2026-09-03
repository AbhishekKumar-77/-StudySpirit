import React, { useState } from 'react';
import { Volume2, Mic, MicOff, CheckCircle2, AlertCircle, RotateCcw, PlayCircle, Sparkles, Award } from 'lucide-react';

export default function PronunciationCoachView() {
    const targetSounds = [
        {
            sound: '/r/ vs /l/',
            desc: 'Tongue curl and airflow positioning between American /r/ and clear /l/.',
            words: [
                { word: 'software', ipa: '/ˈsɒft.weər/', syllables: ['soft', 'ware'], stressIndex: 0, tip: 'Keep tongue tip curved backward without touching the palate.' },
                { word: 'architecture', ipa: '/ˈɑː.kɪ.tek.tʃər/', syllables: ['ar', 'chi', 'tec', 'ture'], stressIndex: 0, tip: 'Primary stress on first syllable. Clear /r/ at the start.' },
                { word: 'algorithm', ipa: '/ˈæl.ɡə.rɪ.ðəm/', syllables: ['al', 'go', 'ri', 'thm'], stressIndex: 0, tip: 'Blend the /l/ cleanly into /g/ without extra vowels.' },
                { word: 'reliability', ipa: '/rɪˌlaɪ.əˈbɪl.ə.ti/', syllables: ['re', 'li', 'a', 'bi', 'li', 'ty'], stressIndex: 3, tip: 'Secondary stress on second syllable, primary stress on fourth.' }
            ]
        },
        {
            sound: '/th/ Sounds',
            desc: 'Voiced /ð/ (this, they) vs Unvoiced /θ/ (theory, method, path).',
            words: [
                { word: 'theory', ipa: '/ˈθɪə.ri/', syllables: ['the', 'o', 'ry'], stressIndex: 0, tip: 'Place tongue tip lightly between teeth and blow air gently.' },
                { word: 'methodology', ipa: '/ˌmeθ.əˈdɒl.ə.dʒi/', syllables: ['meth', 'od', 'ol', 'o', 'gy'], stressIndex: 2, tip: 'Unvoiced /th/ followed by soft vowel.' },
                { word: 'authenticate', ipa: '/ɔːˈθen.tɪ.keɪt/', syllables: ['au', 'then', 'ti', 'cate'], stressIndex: 1, tip: 'Stress the second syllable: au-THEN-ti-cate.' },
                { word: 'synthesis', ipa: '/ˈsɪn.θə.sɪs/', syllables: ['syn', 'the', 'sis'], stressIndex: 0, tip: 'Clean transition from /n/ to /θ/.' }
            ]
        },
        {
            sound: '/v/ vs /w/',
            desc: 'Teeth-on-lip /v/ vs rounded-lips /w/.',
            words: [
                { word: 'development', ipa: '/dɪˈvel.əp.mənt/', syllables: ['de', 'vel', 'op', 'ment'], stressIndex: 1, tip: 'Upper teeth touch lower lip for /v/.' },
                { word: 'workflow', ipa: '/ˈwɜːk.fləʊ/', syllables: ['work', 'flow'], stressIndex: 0, tip: 'Round lips firmly for /w/ like saying "oo".' },
                { word: 'evaluate', ipa: '/ɪˈvæl.ju.eɪt/', syllables: ['e', 'val', 'u', 'ate'], stressIndex: 1, tip: 'Stress the second syllable: e-VAL-u-ate.' },
                { word: 'environment', ipa: '/ɪnˈvaɪ.rən.mənt/', syllables: ['en', 'vi', 'ron', 'ment'], stressIndex: 1, tip: 'Notice the silent \'n\' blend in the middle.' }
            ]
        },
        {
            sound: 'Silent Letters & Tricky Words',
            desc: 'Words with silent letters and counter-intuitive tech pronunciations.',
            words: [
                { word: 'hierarchy', ipa: '/ˈhaɪə.rɑː.ki/', syllables: ['hi', 'er', 'ar', 'chy'], stressIndex: 0, tip: 'Pronounced "HIGH-uh-rar-key" (ch sounds like k).' },
                { word: 'asynchronous', ipa: '/eɪˈsɪŋ.krə.nəs/', syllables: ['a', 'syn', 'chro', 'nous'], stressIndex: 1, tip: 'Pronounced "ay-SING-kruh-nuhs".' },
                { word: 'subtle', ipa: '/ˈsʌt.əl/', syllables: ['sub', 'tle'], stressIndex: 0, tip: 'The letter "b" is completely silent: "SUT-ul".' },
                { word: 'paradigm', ipa: '/ˈpær.ə.daɪm/', syllables: ['par', 'a', 'digm'], stressIndex: 0, tip: 'The "g" is completely silent: "PAIR-uh-dime".' }
            ]
        }
    ];

    const [selectedSoundIdx, setSelectedSoundIdx] = useState(0);
    const [selectedWordIdx, setSelectedWordIdx] = useState(0);
    const [recording, setRecording] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [result, setResult] = useState(null);

    const currentSoundObj = targetSounds[selectedSoundIdx];
    const currentWordObj = currentSoundObj.words[selectedWordIdx] || currentSoundObj.words[0];

    const handleRecord = () => {
        if (recording) {
            setRecording(false);
            setEvaluating(true);
            setTimeout(() => {
                setEvaluating(false);
                setResult({
                    overallScore: 86,
                    accuracy: 88,
                    stressScore: 92,
                    clarity: 84,
                    feedback: `Great job! Your pronunciation of "${currentWordObj.word}" was clear with accurate syllable stress on "${currentWordObj.syllables[currentWordObj.stressIndex]}".`,
                    tip: currentWordObj.tip
                });
            }, 1000);
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
            utterance.rate = 0.85; // Slightly slower for clear phonetic demonstration
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                        <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Pronunciation & Phonetics Studio</h2>
                        <p className="text-xs text-slate-500">Perfect your spoken clarity sound by sound with IPA phonetic guides and audio playback.</p>
                    </div>
                </div>
            </div>

            {/* Target Sound Selector */}
            <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Phonetic Focus</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {targetSounds.map((s, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setSelectedSoundIdx(idx);
                                setSelectedWordIdx(0);
                                setResult(null);
                            }}
                            className={`p-3 rounded-xl text-left border transition-all ${
                                selectedSoundIdx === idx
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold'
                            }`}
                        >
                            <span className="text-xs block">{s.sound}</span>
                            <span className={`text-[10px] line-clamp-1 mt-0.5 ${selectedSoundIdx === idx ? 'text-purple-100' : 'text-slate-400'}`}>
                                {s.desc}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Word Practice Stage */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                    {currentSoundObj.words.map((w, wIdx) => (
                        <button
                            key={wIdx}
                            onClick={() => {
                                setSelectedWordIdx(wIdx);
                                setResult(null);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                selectedWordIdx === wIdx
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            {w.word}
                        </button>
                    ))}
                </div>

                {/* Word Display Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{currentWordObj.word}</h3>
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 font-mono text-xs rounded-lg font-bold">
                                {currentWordObj.ipa}
                            </span>
                        </div>

                        {/* Syllable Stress Breakdown */}
                        <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">Syllables:</span>
                            {currentWordObj.syllables.map((syl, sIdx) => {
                                const isStressed = sIdx === currentWordObj.stressIndex;
                                return (
                                    <span
                                        key={sIdx}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                            isStressed
                                                ? 'bg-purple-600 text-white shadow-2xs ring-2 ring-purple-300'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {syl} {isStressed && '•'}
                                    </span>
                                );
                            })}
                        </div>

                        <p className="text-xs text-slate-500 italic pt-1">
                            💡 <strong>Tip:</strong> {currentWordObj.tip}
                        </p>
                    </div>

                    {/* Audio & Mic Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => speakWord(currentWordObj.word)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
                        >
                            <Volume2 className="w-4 h-4 text-purple-600" />
                            Listen Native Audio
                        </button>

                        <button
                            onClick={handleRecord}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                                recording
                                    ? 'bg-red-600 hover:bg-red-700 animate-pulse shadow-red-500/30'
                                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                            }`}
                        >
                            {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            {recording ? 'Stop & Evaluate' : 'Record & Compare'}
                        </button>
                    </div>
                </div>

                {/* Feedback Card */}
                {evaluating ? (
                    <div className="p-4 text-center text-xs text-purple-600 font-bold">
                        Analyzing phonetics, pitch, and syllable stress...
                    </div>
                ) : result && (
                    <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Pronunciation Analysis
                            </h4>
                            <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg">
                                Match Score: {result.overallScore}%
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">
                                <span className="text-[10px] text-slate-400 block">Accuracy</span>
                                <strong className="text-slate-900 text-sm">{result.accuracy}%</strong>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">
                                <span className="text-[10px] text-slate-400 block">Stress Match</span>
                                <strong className="text-slate-900 text-sm">{result.stressScore}%</strong>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">
                                <span className="text-[10px] text-slate-400 block">Clarity</span>
                                <strong className="text-slate-900 text-sm">{result.clarity}%</strong>
                            </div>
                        </div>

                        <p className="text-xs text-emerald-900 font-medium leading-relaxed">{result.feedback}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
