/**
 * Avatar Helper Utility for StudySpirit
 * =====================================
 * Ensures all user profile avatars resolve safely and cleanly to '/AbhishekImage.jpg'
 * without broken image icon placeholders.
 */

export const DEFAULT_AVATAR = '/AbhishekImage.jpg';

/**
 * Returns a valid URL for a user avatar or falls back to DEFAULT_AVATAR.
 * @param {string|object} avatarOrUser - Either the avatar string or user object
 * @returns {string} - Clean image URL
 */
export function getAvatarUrl(avatarOrUser) {
    let avatar = typeof avatarOrUser === 'object' && avatarOrUser !== null ? avatarOrUser.avatar : avatarOrUser;
    
    if (!avatar || typeof avatar !== 'string') {
        return DEFAULT_AVATAR;
    }
    
    const trimmed = avatar.trim();
    if (!trimmed) return DEFAULT_AVATAR;

    // Handle legacy emoji avatars (e.g. '👨‍🎓', '👤', '💼', '👨‍💻')
    if (trimmed.length <= 4 && !trimmed.startsWith('/') && !trimmed.startsWith('http')) {
        return DEFAULT_AVATAR;
    }

    // Handle standard relative and absolute URLs
    if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
        return trimmed;
    }

    return DEFAULT_AVATAR;
}

/**
 * Image error handler that replaces broken image sources with DEFAULT_AVATAR.
 * @param {Event} event 
 */
export function handleAvatarError(event) {
    if (event && event.currentTarget) {
        event.currentTarget.onerror = null; // Prevent infinite loop if fallback fails
        event.currentTarget.src = DEFAULT_AVATAR;
    }
}
