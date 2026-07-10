import { useState, useEffect, useRef } from 'react';

/**
 * useSpeechRecognition - Custom hook for managing Web Speech API Speech Recognition,
 * counting filler words, and tracking spoken words.
 */
export default function useSpeechRecognition(onFinalResult) {
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [fillerWordCount, setFillerWordCount] = useState(0);
    const [wordsSpoken, setWordsSpoken] = useState(0);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setSpeechSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;

                        // Count filler words
                        const lowerTranscript = transcript.toLowerCase();
                        const words = lowerTranscript.split(/\s+/);
                        const singleFillers = ['um', 'uh', 'like', 'literally', 'basically', 'actually'];
                        const phraseFillers = ['sort of', 'you know', 'kind of', 'i mean', 'you see'];
                        let fillers = 0;
                        words.forEach(w => {
                            if (singleFillers.includes(w.replace(/[^a-z]/g, ''))) fillers++;
                        });
                        phraseFillers.forEach(phrase => {
                            const regex = new RegExp(phrase, 'g');
                            const matches = lowerTranscript.match(regex);
                            if (matches) fillers += matches.length;
                        });
                        setFillerWordCount(prev => prev + fillers);

                        // Accumulate total words spoken
                        setWordsSpoken(prev => prev + words.length);
                    }
                }
                if (finalTranscript && onFinalResult) {
                    onFinalResult(finalTranscript);
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, [onFinalResult]);

    const startListening = () => {
        if (!speechSupported) return;
        recognitionRef.current?.start();
        setIsListening(true);
    };

    const stopListening = () => {
        if (!speechSupported) return;
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const resetSpeechStats = () => {
        setFillerWordCount(0);
        setWordsSpoken(0);
    };

    return {
        isListening,
        speechSupported,
        fillerWordCount,
        wordsSpoken,
        startListening,
        stopListening,
        resetSpeechStats
    };
}
