import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Users, Mic, MicOff, VideoOff, Maximize2, Minimize2, Pin, PinOff } from 'lucide-react';

// Single video component
const VideoPlayer = ({ stream, userId, userName, userAvatar, isMuted, isCameraOn, isLocal, isSpotlight, onSpotlightClick, onPinClick, isPinned }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

    // For both local and remote users: respect the isCameraOn toggle and track validity
    const hasActiveVideoTrack = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].readyState !== 'ended';
    const showVideo = Boolean(isCameraOn && hasActiveVideoTrack);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            // Explicitly call play() to ensure video starts rendering (fixes occasional black screens)
            videoRef.current.play().catch(e => console.error("Video auto-play failed:", e));
        }
    }, [stream, stream?.getVideoTracks()[0]?.id, stream?.getVideoTracks()[0]?.readyState]);

    // Listen for fullscreen change to update icon
    useEffect(() => {
        const handleFSChange = () => {
            setIsBrowserFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFSChange);
        document.addEventListener('webkitfullscreenchange', handleFSChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFSChange);
            document.removeEventListener('webkitfullscreenchange', handleFSChange);
        };
    }, []);

    // Enter true browser fullscreen on the tile container
    const enterFullscreen = useCallback(async (e) => {
        e.stopPropagation();
        try {
            const el = containerRef.current;
            if (!el) return;
            if (document.fullscreenElement) {
                // Already fullscreen — exit
                await document.exitFullscreen();
            } else {
                if (el.requestFullscreen) {
                    await el.requestFullscreen();
                } else if (el.webkitRequestFullscreen) {
                    await el.webkitRequestFullscreen();
                } else if (el.msRequestFullscreen) {
                    await el.msRequestFullscreen();
                }
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative bg-[var(--bg-secondary)] rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 ${isSpotlight
                ? 'col-span-full row-span-2 aspect-video'
                : 'aspect-video hover:ring-2 hover:ring-violet-500/50'
                } ${isBrowserFullscreen ? 'fixed inset-0 z-[999999] rounded-none w-screen h-screen' : ''}`}
            onClick={onSpotlightClick}
        >
            {/* Video element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className={`w-full h-full object-cover ${showVideo ? 'block' : 'hidden'}`}
            />

            {/* Avatar overlay — shown only when no active video */}
            {!showVideo && (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 absolute inset-0">
                    <div className="text-center">
                        <div className={`mb-2 ${isBrowserFullscreen ? 'text-[12rem]' : isSpotlight ? 'text-9xl' : 'text-6xl'}`}>{userAvatar || '👤'}</div>
                        <div className={`text-[var(--text-primary)] font-semibold ${isBrowserFullscreen ? 'text-4xl' : isSpotlight ? 'text-2xl' : 'text-base'}`}>{userName || 'User'}</div>
                    </div>
                </div>
            )}

            {/* User info bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`text-[var(--text-primary)] font-semibold ${isBrowserFullscreen ? 'text-xl' : isSpotlight ? 'text-lg' : 'text-sm'}`}>
                            {userName || 'User'} {isLocal && '(You)'}
                        </span>
                        {isSpotlight && !isBrowserFullscreen && (
                            <span className="bg-cyan- text-[var(--text-primary)] text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                                PRESENTING
                            </span>
                        )}
                        {isBrowserFullscreen && (
                            <span className="bg-red-500 text-[var(--text-primary)] text-sm px-3 py-1 rounded-full font-bold animate-pulse">
                                ● FULLSCREEN
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isMuted
                            ? <MicOff size={isBrowserFullscreen ? 24 : isSpotlight ? 20 : 16} className="text-red-400" />
                            : <Mic size={isBrowserFullscreen ? 24 : isSpotlight ? 20 : 16} className="text-emerald-400" />
                        }
                        {!showVideo && <VideoOff size={isBrowserFullscreen ? 24 : isSpotlight ? 20 : 16} className="text-red-400" />}
                    </div>
                </div>
            </div>

            {/* Speaking indicator */}
            {!isMuted && (
                <div className={`absolute top-3 right-3 bg-emerald-500 rounded-full animate-pulse ${isBrowserFullscreen ? 'w-5 h-5' : isSpotlight ? 'w-4 h-4' : 'w-3 h-3'}`} />
            )}

            {/* Controls — show on hover */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                {/* TRUE FULLSCREEN button — opens full PC screen */}
                <button
                    onClick={enterFullscreen}
                    className="p-2 bg-[var(--bg-secondary)]lack/70 rounded-lg text-[var(--text-primary)] hover:bg-cyan- transition-all"
                    title={isBrowserFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen (Full PC Screen)'}
                >
                    {isBrowserFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                {/* Pin button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPinClick && onPinClick();
                    }}
                    className={`p-2 rounded-lg transition-all ${isPinned
                        ? 'bg-amber-500 text-[var(--text-primary)]'
                        : 'bg-[var(--bg-secondary)]lack/70 text-[var(--text-primary)] hover:bg-amber-500/80'
                        }`}
                    title={isPinned ? 'Unpin' : 'Pin'}
                >
                    {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
            </div>

            {/* Pinned badge */}
            {isPinned && !isSpotlight && (
                <div className="absolute top-2 right-10 bg-amber-500 text-[var(--text-primary)] text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                    <Pin size={12} /> Pinned
                </div>
            )}

            {/* Fullscreen hint overlay — shown when in fullscreen */}
            {isBrowserFullscreen && (
                <div className="absolute top-4 right-4 text-[var(--text-primary)]/50 text-sm">
                    Press <kbd className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono">Esc</kbd> to exit fullscreen
                </div>
            )}
        </div>
    );
};

// Video grid component
const VideoGrid = ({
    localStream,
    remoteStreams,
    participants,
    currentUserId,
    currentUserName,
    currentUserAvatar,
    spotlightUserId,
    onSpotlightChange,
    screenShareStream,
    localIsCameraOn,
    localIsMicMuted
}) => {
    const [pinnedUsers, setPinnedUsers] = useState(new Set());

    const handlePinClick = (userId) => {
        setPinnedUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    // Build video list
    const allVideos = [];
    const addedUserIds = new Set();

    // Add local stream
    if (localStream) {
        allVideos.push({
            userId: currentUserId,
            stream: localStream,
            userName: currentUserName || 'You',
            userAvatar: currentUserAvatar || '👤',
            isMuted: localIsMicMuted !== undefined ? localIsMicMuted : !localStream.getAudioTracks()[0]?.enabled,
            isCameraOn: localIsCameraOn !== undefined ? localIsCameraOn : localStream.getVideoTracks()[0]?.enabled !== false,
            isLocal: true
        });
        addedUserIds.add(currentUserId);
    }

    // Add remote participants from the participants list
    participants.forEach(participant => {
        if (participant.id === currentUserId) return;

        let streams = remoteStreams.get(participant.id);
        if (!streams) return;

        // Convert to array if it's a single stream
        if (!Array.isArray(streams)) {
            streams = [streams];
        }

        streams.forEach((stream, index) => {
            // Usually the second stream or one without active camera track is the screen share
            const isScreen = index > 0 || (stream && stream.getVideoTracks()[0]?.label.toLowerCase().includes('screen'));
            const isStudent = participant.role === 'student' || participant.role !== 'teacher';
            const hasCamPerm = participant.permissions?.camera === true;
            const camVisible = isScreen ? true : (isStudent ? hasCamPerm : (participant.isCameraOn ?? true));

            allVideos.push({
                userId: `${participant.id}_${index}`,
                stream,
                userName: participant.name + (isScreen ? ' (Screen)' : ''),
                userAvatar: participant.avatar || '👤',
                isMuted: isScreen ? true : (participant.isMuted ?? false),
                isCameraOn: camVisible,
                isLocal: false
            });
        });

        addedUserIds.add(participant.id);
    });

    // Also add any remote streams not in the participants list
    if (remoteStreams && remoteStreams.size > 0) {
        remoteStreams.forEach((streams, peerId) => {
            if (!addedUserIds.has(peerId)) {
                if (!Array.isArray(streams)) {
                    streams = [streams];
                }

                streams.forEach((stream, index) => {
                    const isScreen = index > 0;
                    allVideos.push({
                        userId: `${peerId}_${index}`,
                        stream,
                        userName: `Participant${isScreen ? ' (Screen)' : ''}`,
                        userAvatar: '👤',
                        isMuted: isScreen ? true : false,
                        isCameraOn: isScreen ? true : false, // Default remote student stream to camera OFF
                        isLocal: false
                    });
                });
                addedUserIds.add(peerId);
            }
        });
    }

    // Sort: pinned first, then others
    const sortedVideos = [...allVideos].sort((a, b) => {
        if (pinnedUsers.has(a.userId) && !pinnedUsers.has(b.userId)) return -1;
        if (!pinnedUsers.has(a.userId) && pinnedUsers.has(b.userId)) return 1;
        return 0;
    });

    // Grid layout based on count
    const getGridClass = () => {
        const count = sortedVideos.length;
        if (count === 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-2';
        if (count <= 4) return 'grid-cols-2';
        if (count <= 6) return 'grid-cols-3';
        return 'grid-cols-4';
    };

    return (
        <div className={`grid ${getGridClass()} gap-4 w-full h-full`}>
            {sortedVideos.map(video => (
                <VideoPlayer
                    key={video.userId}
                    stream={video.stream}
                    userId={video.userId}
                    userName={video.userName}
                    userAvatar={video.userAvatar}
                    isMuted={video.isMuted}
                    isCameraOn={video.isCameraOn}
                    isLocal={video.isLocal}
                    isSpotlight={false}
                    onSpotlightClick={() => { }}
                    onPinClick={() => handlePinClick(video.userId)}
                    isPinned={pinnedUsers.has(video.userId)}
                />
            ))}

            {/* Empty state */}
            {sortedVideos.length === 0 && (
                <div className="col-span-full flex items-center justify-center h-full">
                    <div className="text-center">
                        <Users size={64} className="text-[var(--text-primary)] mx-auto mb-4" />
                        <p className="text-[var(--text-secondary)] text-lg">No participants yet</p>
                        <p className="text-[var(--text-muted)] text-sm">Waiting for others to join...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoGrid;
