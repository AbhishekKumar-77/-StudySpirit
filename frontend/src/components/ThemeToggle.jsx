import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // Check local storage or system preference
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
            className="fixed bottom-6 left-6 z-[9999] p-3 rounded-full bg-cyan-500/10 backdrop-blur-md border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 hover:scale-110 hover:bg-cyan-500/20 active:scale-95"
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
        >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
    );
}
