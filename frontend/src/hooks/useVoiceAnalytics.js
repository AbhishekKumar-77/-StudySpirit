import { useState, useEffect, useRef } from 'react';

/**
 * useVoiceAnalytics - Custom hook for managing volume metering (Web Audio API)
 * and session timers (WPM computation, elapsed session duration).
 */
export default function useVoiceAnalytics(isListening, wordsSpoken) {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [vocalVolume, setVocalVolume] = useState(0);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const microphoneRef = useRef(null);
    const volIntervalRef = useRef(null);
    const startTimeRef = useRef(null);
    const timerIntervalRef = useRef(null);

    // Timing tracking
    const startTimer = () => {
        startTimeRef.current = Date.now();
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(() => {
            const sec = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setElapsedTime(sec);
            if (sec > 60) {
                const mins = sec / 60;
                setWpm(Math.round(wordsSpoken / mins));
            }
        }, 1000);
    };

    const stopTimer = () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };

    const resetTimer = () => {
        setElapsedTime(0);
        setWpm(0);
        startTimeRef.current = Date.now();
    };

    // Volume tracking
    const startVolumeMeter = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('Audio not supported or requires HTTPS');
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
            microphoneRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setVocalVolume(average);
                volIntervalRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();
        } catch (err) {
            console.error("Volume meter error:", err);
        }
    };

    const stopVolumeMeter = () => {
        if (volIntervalRef.current) cancelAnimationFrame(volIntervalRef.current);
        if (microphoneRef.current) microphoneRef.current.disconnect();
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
        }
        analyserRef.current = null;
        setVocalVolume(0);
    };

    // Sync volume meter with listening status
    useEffect(() => {
        if (isListening) {
            startVolumeMeter();
        } else {
            stopVolumeMeter();
        }
        return () => stopVolumeMeter();
    }, [isListening]);

    useEffect(() => {
        return () => {
            stopTimer();
            stopVolumeMeter();
        };
    }, []);

    return {
        elapsedTime,
        wpm,
        vocalVolume,
        startTimer,
        stopTimer,
        resetTimer
    };
}
