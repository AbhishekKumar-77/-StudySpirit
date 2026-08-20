import React, { useEffect } from 'react';

export default function ThemeToggle() {
    useEffect(() => {
        document.documentElement.classList.add('light');
        localStorage.setItem('studySpiritTheme', 'light');
    }, []);

    return null;
}

