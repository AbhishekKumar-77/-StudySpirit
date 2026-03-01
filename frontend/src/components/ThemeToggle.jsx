import React, { useEffect, useState } from 'react';
import { Moon, Sun, Gamepad2 } from 'lucide-react';

export default function ThemeToggle() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showPulse, setShowPulse] = useState(false);

    useEffect(() => {
        const storedTheme = localStorage.getItem('studySpiritTheme');
        if (storedTheme === 'light') {
            setIsDarkMode(false);
            document.documentElement.classList.add('light');
        } else {
            setIsDarkMode(true);
            document.documentElement.classList.remove('light');
        }
    }, []);

    const toggleTheme = () => {
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), 600);

        setIsDarkMode(prev => {
            const nextIsDark = !prev;
            if (nextIsDark) {
                document.documentElement.classList.remove('light');
                localStorage.setItem('studySpiritTheme', 'dark');
            } else {
                document.documentElement.classList.add('light');
                localStorage.setItem('studySpiritTheme', 'light');
            }
            return nextIsDark;
        });
    };

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-6 left-6 z-[9999] group"
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
        >
            {/* Pulse ring on click */}
            {showPulse && (
                <div className="absolute inset-0 rounded-2xl border-2 border-[var(--neon-primary)] animate-ping opacity-50" />
            )}

            {/* Button body */}
            <div className={`
                relative p-3.5 rounded-2xl backdrop-blur-xl border overflow-hidden
                transition-all duration-500 
                ${isDarkMode
                    ? 'bg-[#0d1117]/80 border-[#00ff88]/30 shadow-[0_0_25px_rgba(0,255,136,0.2)] hover:shadow-[0_0_35px_rgba(0,255,136,0.4)] hover:border-[#00ff88]/60'
                    : 'bg-white/80 border-indigo-400/30 shadow-[0_4px_20px_rgba(99,102,241,0.15)] hover:shadow-[0_4px_30px_rgba(99,102,241,0.3)] hover:border-indigo-400/60'
                }
                hover:scale-110 active:scale-95
            `}>
                {/* Scanning line effect */}
                <div className={`absolute inset-0 pointer-events-none overflow-hidden rounded-2xl`}>
                    <div className={`absolute top-0 left-0 right-0 h-[1px] ${isDarkMode ? 'bg-[#00ff88]/40' : 'bg-indigo-500/30'} animate-[scanline_3s_linear_infinite]`} />
                </div>

                {/* Icon */}
                <div className="relative z-10 transition-transform duration-300 group-hover:rotate-12">
                    {isDarkMode
                        ? <Sun className="w-5 h-5 text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]" />
                        : <Moon className="w-5 h-5 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    }
                </div>

                {/* Corner accent */}
                <div className={`absolute top-0 right-0 w-2 h-2 ${isDarkMode ? 'bg-[#00ff88]' : 'bg-indigo-500'} rounded-bl-md rounded-tr-2xl opacity-60`} />
            </div>
        </button>
    );
}
