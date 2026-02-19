import React, { useEffect, useState, useRef } from 'react';

/**
 * AriaAvatar - Animated AI interviewer avatar
 * Features:
 * - Mouth animation synced to speech
 * - Natural eye blinking
 * - Subtle head movement when speaking
 * - Idle breathing animation
 * - Audio wave visualizer when speaking
 */
export default function AriaAvatar({ isSpeaking = false, className = '' }) {
    const [blinkState, setBlinkState] = useState(false);
    const [mouthOpen, setMouthOpen] = useState(0);
    const mouthInterval = useRef(null);

    // Natural blinking
    useEffect(() => {
        const blink = () => {
            setBlinkState(true);
            setTimeout(() => setBlinkState(false), 150);
        };

        const interval = setInterval(() => {
            blink();
            // Sometimes double-blink
            if (Math.random() > 0.7) {
                setTimeout(blink, 300);
            }
        }, 2500 + Math.random() * 2000);

        return () => clearInterval(interval);
    }, []);

    // Mouth animation synced to speaking
    useEffect(() => {
        if (isSpeaking) {
            mouthInterval.current = setInterval(() => {
                setMouthOpen(Math.random() * 0.8 + 0.2);
            }, 120);
        } else {
            clearInterval(mouthInterval.current);
            setMouthOpen(0);
        }
        return () => clearInterval(mouthInterval.current);
    }, [isSpeaking]);

    const eyeHeight = blinkState ? 1 : 10;
    const eyeRy = blinkState ? 0.5 : 5;
    const mouthHeight = 2 + mouthOpen * 10;
    const mouthRy = 1 + mouthOpen * 5;

    return (
        <div className={`aria-avatar-container ${className}`}>
            <style>{`
                .aria-avatar-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    overflow: hidden;
                    border-radius: inherit;
                }
                
                .aria-bg-glow {
                    position: absolute;
                    width: 200px;
                    height: 200px;
                    border-radius: 50%;
                    filter: blur(60px);
                    opacity: 0.3;
                    animation: bgFloat 8s ease-in-out infinite;
                }
                .aria-bg-glow.glow1 {
                    background: #7c3aed;
                    top: 10%;
                    left: 20%;
                }
                .aria-bg-glow.glow2 {
                    background: #ec4899;
                    bottom: 10%;
                    right: 20%;
                    animation-delay: -4s;
                }
                
                @keyframes bgFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(20px, -15px) scale(1.1); }
                }
                
                .aria-avatar-body {
                    position: relative;
                    z-index: 2;
                    transition: transform 0.3s ease;
                }
                
                .aria-avatar-body.speaking {
                    animation: headBob 0.6s ease-in-out infinite;
                }
                
                .aria-avatar-body.idle {
                    animation: idleBreathe 4s ease-in-out infinite;
                }
                
                @keyframes headBob {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-2px) rotate(0.5deg); }
                    75% { transform: translateY(1px) rotate(-0.5deg); }
                }
                
                @keyframes idleBreathe {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                
                /* Audio wave visualizer */
                .aria-audio-waves {
                    position: absolute;
                    bottom: 15%;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 3px;
                    align-items: flex-end;
                    height: 30px;
                    z-index: 3;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .aria-audio-waves.active {
                    opacity: 1;
                }
                .aria-wave-bar {
                    width: 3px;
                    border-radius: 2px;
                    background: linear-gradient(to top, #7c3aed, #ec4899);
                    transition: height 0.1s ease;
                }
                
                /* Name badge */
                .aria-name-badge {
                    position: absolute;
                    bottom: 8px;
                    left: 8px;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(10px);
                    padding: 4px 10px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    z-index: 5;
                }
                .aria-name-badge span {
                    font-size: 11px;
                    font-weight: 700;
                    color: white;
                    letter-spacing: 0.5px;
                }
                .aria-speaking-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #22c55e;
                    animation: pulseDot 1.5s ease-in-out infinite;
                }
                .aria-speaking-dot.idle {
                    background: #64748b;
                    animation: none;
                }
                @keyframes pulseDot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
                
                /* Status ring */
                .aria-status-ring {
                    position: absolute;
                    inset: -2px;
                    border-radius: inherit;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                    z-index: 1;
                }
                .aria-status-ring.active {
                    opacity: 1;
                    border: 2px solid transparent;
                    background: linear-gradient(135deg, #7c3aed, #ec4899) border-box;
                    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: destination-out;
                    mask-composite: exclude;
                    animation: ringPulse 2s ease-in-out infinite;
                }
                @keyframes ringPulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>

            {/* Background glows */}
            <div className="aria-bg-glow glow1" />
            <div className="aria-bg-glow glow2" />

            {/* Status ring when speaking */}
            <div className={`aria-status-ring ${isSpeaking ? 'active' : ''}`} />

            {/* Avatar SVG */}
            <svg
                viewBox="0 0 200 280"
                className={`aria-avatar-body ${isSpeaking ? 'speaking' : 'idle'}`}
                style={{ width: '75%', maxHeight: '85%' }}
            >
                {/* Hair back */}
                <ellipse cx="100" cy="85" rx="62" ry="70" fill="#2d1b0e" />
                <path d="M 38 85 Q 30 140 45 180 L 55 160 Q 45 120 50 85 Z" fill="#2d1b0e" />
                <path d="M 162 85 Q 170 140 155 180 L 145 160 Q 155 120 150 85 Z" fill="#2d1b0e" />

                {/* Neck */}
                <rect x="85" y="148" width="30" height="30" rx="5" fill="#f0c9a6" />

                {/* Shoulders / Top */}
                <path
                    d="M 50 178 Q 50 168 85 168 L 115 168 Q 150 168 150 178 L 160 230 Q 160 245 140 248 L 60 248 Q 40 245 40 230 Z"
                    fill="#e8e0f0"
                    stroke="#d4c8e8"
                    strokeWidth="0.5"
                />
                {/* Collar detail */}
                <path d="M 88 168 L 100 190 L 112 168" fill="none" stroke="#c4b8d8" strokeWidth="1.5" />

                {/* Face */}
                <ellipse cx="100" cy="100" rx="48" ry="55" fill="#f5d5b8" />

                {/* Ears */}
                <ellipse cx="53" cy="100" rx="7" ry="10" fill="#f0c9a6" />
                <ellipse cx="147" cy="100" rx="7" ry="10" fill="#f0c9a6" />
                {/* Earrings */}
                <circle cx="53" cy="113" r="3" fill="#c084fc" opacity="0.8" />
                <circle cx="147" cy="113" r="3" fill="#c084fc" opacity="0.8" />

                {/* Hair front */}
                <path
                    d="M 52 80 Q 55 40 100 35 Q 145 40 148 80 Q 140 55 100 50 Q 60 55 52 80 Z"
                    fill="#3d2517"
                />
                {/* Side bangs */}
                <path d="M 52 80 Q 48 60 58 50 Q 55 70 60 85 Z" fill="#3d2517" />
                <path d="M 148 80 Q 152 60 142 50 Q 145 70 140 85 Z" fill="#3d2517" />

                {/* Eyebrows */}
                <path d="M 72 80 Q 80 75 90 78" stroke="#4a3020" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 128 80 Q 120 75 110 78" stroke="#4a3020" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Eyes */}
                <g>
                    {/* Eye whites */}
                    <ellipse cx="82" cy="92" rx="10" ry="8" fill="white" />
                    <ellipse cx="118" cy="92" rx="10" ry="8" fill="white" />

                    {/* Iris */}
                    <ellipse cx="82" cy="92" rx="5" ry={eyeRy} fill="#5B4A3F">
                        <animate attributeName="ry" values={`${eyeRy}`} dur="0.1s" />
                    </ellipse>
                    <ellipse cx="118" cy="92" rx="5" ry={eyeRy} fill="#5B4A3F">
                        <animate attributeName="ry" values={`${eyeRy}`} dur="0.1s" />
                    </ellipse>

                    {/* Pupils */}
                    {!blinkState && (
                        <>
                            <circle cx="83" cy="91" r="2.5" fill="#1a1a1a" />
                            <circle cx="119" cy="91" r="2.5" fill="#1a1a1a" />
                            {/* Eye shine */}
                            <circle cx="84.5" cy="89.5" r="1" fill="white" opacity="0.9" />
                            <circle cx="120.5" cy="89.5" r="1" fill="white" opacity="0.9" />
                        </>
                    )}

                    {/* Eyelids (blink) */}
                    <ellipse
                        cx="82" cy="92" rx="11" ry={blinkState ? 9 : 0}
                        fill="#f5d5b8"
                        style={{ transition: 'ry 0.08s ease' }}
                    />
                    <ellipse
                        cx="118" cy="92" rx="11" ry={blinkState ? 9 : 0}
                        fill="#f5d5b8"
                        style={{ transition: 'ry 0.08s ease' }}
                    />

                    {/* Eyelashes */}
                    <path d="M 72 90 Q 77 84 82 83" stroke="#2d1b0e" strokeWidth="1.5" fill="none" />
                    <path d="M 128 90 Q 123 84 118 83" stroke="#2d1b0e" strokeWidth="1.5" fill="none" />
                </g>

                {/* Nose */}
                <path d="M 98 102 Q 96 108 94 112 Q 98 114 102 114 Q 106 112 104 108 Z" fill="#e8c4a0" opacity="0.6" />

                {/* Mouth */}
                <g>
                    {mouthOpen > 0.1 ? (
                        <>
                            {/* Open mouth */}
                            <ellipse
                                cx="100"
                                cy="126"
                                rx={8 + mouthOpen * 3}
                                ry={mouthRy}
                                fill="#a03040"
                                style={{ transition: 'ry 0.08s ease, rx 0.08s ease' }}
                            />
                            {/* Teeth hint */}
                            <rect
                                x="94"
                                y={124 - mouthOpen * 1}
                                width="12"
                                height={Math.min(mouthOpen * 4, 3)}
                                rx="1"
                                fill="white"
                                opacity={mouthOpen > 0.3 ? 0.8 : 0}
                                style={{ transition: 'opacity 0.08s ease' }}
                            />
                            {/* Upper lip */}
                            <path
                                d={`M ${90 - mouthOpen * 2} 124 Q 95 ${122 - mouthOpen * 1} 100 ${122 - mouthOpen * 2} Q 105 ${122 - mouthOpen * 1} ${110 + mouthOpen * 2} 124`}
                                fill="none"
                                stroke="#c06070"
                                strokeWidth="1.5"
                            />
                        </>
                    ) : (
                        <>
                            {/* Closed mouth - slight smile */}
                            <path
                                d="M 88 125 Q 94 130 100 130 Q 106 130 112 125"
                                fill="none"
                                stroke="#c06070"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </>
                    )}
                </g>

                {/* Blush */}
                <ellipse cx="72" cy="112" rx="10" ry="5" fill="#ff9999" opacity="0.15" />
                <ellipse cx="128" cy="112" rx="10" ry="5" fill="#ff9999" opacity="0.15" />
            </svg>

            {/* Audio wave bars */}
            <div className={`aria-audio-waves ${isSpeaking ? 'active' : ''}`}>
                {Array.from({ length: 7 }).map((_, i) => (
                    <div
                        key={i}
                        className="aria-wave-bar"
                        style={{
                            height: isSpeaking
                                ? `${8 + Math.random() * 22}px`
                                : '3px',
                            transition: `height ${0.1 + Math.random() * 0.1}s ease`,
                            animationDelay: `${i * 0.05}s`
                        }}
                    />
                ))}
            </div>

            {/* Name badge */}
            <div className="aria-name-badge">
                <div className={`aria-speaking-dot ${isSpeaking ? '' : 'idle'}`} />
                <span>Aria (AI)</span>
            </div>
        </div>
    );
}
