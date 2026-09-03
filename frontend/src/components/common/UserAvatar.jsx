import React from 'react';
import { getAvatarUrl, handleAvatarError, DEFAULT_AVATAR } from '../../utils/avatarHelper';

/**
 * Reusable User Avatar Component
 * Ensures proper image rendering, smooth rounded borders, and automatic fallback.
 */
export default function UserAvatar({
    user,
    src,
    alt = 'User Avatar',
    className = 'w-8 h-8 rounded-full object-cover',
    style = {},
    size,
    onClick,
    title
}) {
    const avatarSrc = getAvatarUrl(src || user?.avatar);
    const userName = user?.name || alt;

    const sizeStyle = size ? { width: size, height: size } : {};

    return (
        <img
            src={avatarSrc}
            alt={userName}
            className={`object-cover rounded-full select-none ${className}`}
            style={{ ...sizeStyle, ...style }}
            onError={handleAvatarError}
            onClick={onClick}
            title={title || userName}
            loading="lazy"
        />
    );
}
