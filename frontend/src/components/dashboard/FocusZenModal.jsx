import React, { useState, useEffect } from 'react';
import {
    Clock, Play, Pause, RotateCcw, Maximize2, Minimize2, X,
    Sparkles, Volume2, VolumeX, Flame, Target, Settings, CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FocusZenModal({
    isOpen,
    onClose,
    timerSeconds,
    setTimerSeconds,
    isTimerRunning,
    setIsTimerRunning,
    initialDuration,
    setInitialDuration
}) {
    const [mode, setMode] = useState('focus'); // 'focus' | 'short_break' | 'long_break'
    const [customMinutesInput, setCustomMinutesInput] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [ambientAudio, setAmbientAudio] = useState(null); // 'rain' | 'white_noise' | 'lofi' | null
    const [audioContext, setAudioContext] = useState(null);

    const quotes = [
        "Focus is a muscle. The more you practice, the stronger your mind becomes.",
        "Deep work is the superpower of the 21st century.",
        "Small daily improvements over time lead to stunning results.",
        "Stay present with this single task. Great things take undivided attention.",
        "Disconnect from distractions. Connect with your potential."
    ];
    const [quoteIndex, setQuoteIndex] = useState(0);

    // Rotate quotes every 45s
    useEffect(() => {
        const quoteInterval = setInterval(() => {
            setQuoteIndex(prev => (prev + 1) % quotes.length);
        }, 45000);
        return () => clearInterval(quoteInterval);
    }, [quotes.length]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // When timer reaches 0, trigger celebration
    useEffect(() => {
        if (timerSeconds === 0 && isTimerRunning) {
            setIsTimerRunning(false);
            setCompletedSessions(prev => prev + 1);
            try {
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            } catch (e) {}
        }
    }, [timerSeconds, isTimerRunning, setIsTimerRunning]);

    if (!isOpen) return null;

    const formatTimer = (sec) => {
        const mins = Math.floor(sec / 60);
        const remainingSec = sec % 60;
        return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
    };

    const handleSelectPreset = (mins, modeName = 'focus') => {
        setMode(modeName);
        setIsTimerRunning(false);
        const secs = mins * 60;
        setInitialDuration(secs);
        setTimerSeconds(secs);
        setShowCustomInput(false);
    };

    const handleApplyCustomMinutes = (e) => {
        e.preventDefault();
        const mins = parseInt(customMinutesInput, 10);
        if (!isNaN(mins) && mins > 0 && mins <= 240) {
            handleSelectPreset(mins, 'focus');
            setCustomMinutesInput('');
        }
    };

    const handleReset = () => {
        setIsTimerRunning(false);
        setTimerSeconds(initialDuration || 1500);
    };

    // Calculate progress fraction
    const progressPercent = initialDuration > 0
        ? Math.max(0, Math.min(100, ((initialDuration - timerSeconds) / initialDuration) * 100))
        : 0;

    return (
        <div className="zen-focus-overlay">
            {/* Top Bar Navigation */}
            <div className="zen-top-bar">
                <div className="zen-brand">
                    <div className="zen-brand-icon"><Flame size={20} color="#ff5733" /></div>
                    <div>
                        <h2>Deep Focus Zen Mode</h2>
                        <span>StudySpirit Pomodoro Station</span>
                    </div>
                </div>

                <div className="zen-top-actions">
                    <button
                        className="zen-mode-preset-btn"
                        onClick={() => setShowCustomInput(prev => !prev)}
                        title="Set Custom Minutes"
                    >
                        <Settings size={16} />
                        <span>Custom Duration</span>
                    </button>
                    <button className="zen-close-btn" onClick={onClose} title="Exit Fullscreen (Esc)">
                        <Minimize2 size={20} />
                    </button>
                </div>
            </div>

            {/* Custom Input Dropdown Bar */}
            {showCustomInput && (
                <form onSubmit={handleApplyCustomMinutes} className="zen-custom-time-form">
                    <span>Set Custom Focus Time:</span>
                    <input
                        type="number"
                        min="1"
                        max="240"
                        placeholder="Minutes (e.g. 35)"
                        value={customMinutesInput}
                        onChange={e => setCustomMinutesInput(e.target.value)}
                        autoFocus
                    />
                    <button type="submit">Apply & Reset</button>
                </form>
            )}

            {/* Mode Switcher Tabs */}
            <div className="zen-mode-tabs">
                <button
                    className={`zen-tab-btn ${mode === 'focus' ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(25, 'focus')}
                >
                    🔥 Deep Focus (25m)
                </button>
                <button
                    className={`zen-tab-btn ${mode === 'short_break' ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(5, 'short_break')}
                >
                    ☕ Short Break (5m)
                </button>
                <button
                    className={`zen-tab-btn ${mode === 'long_break' ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(15, 'long_break')}
                >
                    🌴 Long Break (15m)
                </button>
                <button
                    className={`zen-tab-btn ${mode === 'power_60' ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(60, 'power_60')}
                >
                    ⚡ Power Hour (60m)
                </button>
            </div>

            {/* Giant Center Circular Timer */}
            <div className="zen-timer-centerpiece">
                <div className="zen-circular-wrapper">
                    {/* SVG Circular Progress Ring */}
                    <svg className="zen-progress-svg" viewBox="0 0 280 280">
                        <circle
                            className="zen-svg-bg"
                            cx="140"
                            cy="140"
                            r="120"
                        />
                        <circle
                            className="zen-svg-fill"
                            cx="140"
                            cy="140"
                            r="120"
                            style={{
                                strokeDasharray: 754,
                                strokeDashoffset: 754 - (754 * progressPercent) / 100
                            }}
                        />
                    </svg>

                    <div className="zen-timer-content">
                        <div className="zen-digital-digits">
                            {formatTimer(timerSeconds)}
                        </div>
                        <div className="zen-session-tag">
                            {mode === 'focus' ? '🎯 Focus Session' : mode === 'short_break' ? '☕ Relaxing Break' : '🌴 Recharge Break'}
                        </div>
                        <div className="zen-completed-count">
                            {completedSessions > 0 ? `🍅 ${completedSessions} Completed` : 'Ready to begin'}
                        </div>
                    </div>
                </div>

                {/* Primary Control Buttons */}
                <div className="zen-controls-bar">
                    <button
                        className="zen-play-toggle-btn"
                        onClick={() => setIsTimerRunning(prev => !prev)}
                        title={isTimerRunning ? "Pause Timer" : "Start Timer"}
                    >
                        {isTimerRunning ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: '4px' }} />}
                    </button>
                    <button className="zen-reset-secondary-btn" onClick={handleReset} title="Reset Session">
                        <RotateCcw size={22} />
                    </button>
                </div>
            </div>

            {/* Bottom Rotating Quote */}
            <div className="zen-bottom-footer">
                <div className="zen-quote-pill">
                    <Sparkles size={16} color="#f59e0b" />
                    <span>"{quotes[quoteIndex]}"</span>
                </div>
            </div>
        </div>
    );
}
