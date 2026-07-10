import { useState, useEffect, useRef } from 'react';

/**
 * useTextToSpeech - Custom hook for managing Web SpeechSynthesis API, voice selection,
 * and multi-speaker dialogue pacing (especially for GD moderator and peers).
 */
export default function useTextToSpeech(autoSpeak, selectedVoiceURI, setSelectedVoiceURI) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState('Aria');
    const [availableVoices, setAvailableVoices] = useState([]);
    const speechStoppedRef = useRef(false);

    useEffect(() => {
        const loadVoices = () => {
            let voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                let engVoices = voices.filter(v => v.lang.startsWith('en'));
                engVoices.sort((a, b) => {
                    const aNat = a.name.includes('Natural') || a.name.includes('Online') || a.name.includes('Google') || a.name.includes('Microsoft');
                    const bNat = b.name.includes('Natural') || b.name.includes('Online') || b.name.includes('Google') || b.name.includes('Microsoft');
                    return (aNat === bNat) ? 0 : aNat ? -1 : 1;
                });
                setAvailableVoices(engVoices);
                if (setSelectedVoiceURI) {
                    setSelectedVoiceURI(prev => {
                        if (prev) return prev;
                        const best = engVoices.find(v => v.name.includes('Aria') || v.name.includes('Jenny') || v.name.includes('Google')) || engVoices[0];
                        return best?.voiceURI || '';
                    });
                }
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [setSelectedVoiceURI]);

    const speak = (text, speakers = null) => {
        if (!autoSpeak) return;
        window.speechSynthesis.cancel();

        let sentenceQueue = [];

        if (speakers && Array.isArray(speakers) && speakers.length > 0) {
            speakers.forEach(sp => {
                const clean = sp.text.replace(/[*_`#]/g, '').replace(/\n+/g, '. ').trim();
                const parts = clean.match(/[^.!?]+[.!?]+/g) || [clean];
                parts.forEach(p => {
                    if (p.trim()) sentenceQueue.push({ text: p.trim(), speaker: sp.name });
                });
            });
        } else {
            const cleanText = text.replace(/[*_`#]/g, '').replace(/\n+/g, '. ').trim();
            const parts = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
            parts.forEach(p => {
                if (p.trim()) sentenceQueue.push({ text: p.trim(), speaker: 'Aria' });
            });
        }

        const voices = window.speechSynthesis.getVoices();
        const baseVoice = voices.find(v => v.voiceURI === selectedVoiceURI) || voices[0];
        const maleVoice = voices.find(v => v.name.toLowerCase().includes('guy') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('mark') || v.name.toLowerCase().includes('male')) || baseVoice;
        const femaleVoice2 = voices.find(v => v.voiceURI !== baseVoice?.voiceURI && (v.name.toLowerCase().includes('girl') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('female'))) || baseVoice;

        setIsSpeaking(true);
        speechStoppedRef.current = false;

        let index = 0;
        const speakNext = () => {
            if (speechStoppedRef.current || index >= sentenceQueue.length) {
                setIsSpeaking(false);
                return;
            }

            const current = sentenceQueue[index];
            setCurrentSpeaker(current.speaker || 'Aria');
            const utterance = new SpeechSynthesisUtterance(current.text);

            if (current.speaker === 'Alex') {
                utterance.voice = maleVoice;
                utterance.pitch = 0.8;
                utterance.rate = 1.0;
            } else if (current.speaker === 'Sarah') {
                utterance.voice = femaleVoice2;
                utterance.pitch = 1.2;
                utterance.rate = 1.05;
            } else {
                if (baseVoice) utterance.voice = baseVoice;
                utterance.rate = 0.92;
                utterance.pitch = 1.05;
            }

            utterance.volume = 1.0;

            utterance.onend = () => {
                index++;
                setTimeout(speakNext, 200 + Math.random() * 200);
            };
            utterance.onerror = () => {
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        };

        speakNext();
    };

    const stopSpeaking = () => {
        speechStoppedRef.current = true;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    return {
        isSpeaking,
        currentSpeaker,
        availableVoices,
        speak,
        stopSpeaking
    };
}
