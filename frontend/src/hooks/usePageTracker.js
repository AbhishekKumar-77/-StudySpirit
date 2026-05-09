// usePageTracker.js
// Call this hook inside any feature page to record "last visited" in localStorage
// Usage: usePageTracker('Solo Mode', '/solo-mode', '📖')

import { useEffect } from 'react';

const MAX_RECENTS = 3;

export function usePageTracker(name, path, icon = '📌') {
    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('ss_recent_pages') || '[]');
            // Remove duplicate if exists
            const filtered = stored.filter(p => p.path !== path);
            // Prepend current page
            const updated = [{ name, path, icon, visitedAt: Date.now() }, ...filtered].slice(0, MAX_RECENTS);
            localStorage.setItem('ss_recent_pages', JSON.stringify(updated));
        } catch (e) {
            // Silently fail — never break the page
        }
    }, [name, path, icon]);
}

// Read the recent pages list (used by Dashboard)
export function getRecentPages() {
    try {
        return JSON.parse(localStorage.getItem('ss_recent_pages') || '[]');
    } catch {
        return [];
    }
}
