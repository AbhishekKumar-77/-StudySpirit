import { Room, RoomEvent } from 'livekit-client';
import { webrtcAPI } from './groupAPI';

class WebRTCService {
    constructor() {
        this.room = null;
        this.localStream = null;
        this.screenStream = null;
        this.currentRoomId = null;
        this.currentUserId = null;
    }

    // Initialize local media (camera + microphone)
    async initializeLocalMedia(constraints = { video: true, audio: true }) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.localStream = stream;
            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }

    // Get local stream
    getLocalStream() {
        return this.localStream;
    }

    // Toggle microphone
    toggleMicrophone(enabled) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
        if (this.room && this.room.localParticipant) {
            this.room.localParticipant.setMicrophoneEnabled(enabled).catch(err => {
                console.error('Error toggling microphone in LiveKit:', err);
            });
        }
    }

    // Toggle camera
    toggleCamera(enabled) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
        if (this.room && this.room.localParticipant) {
            this.room.localParticipant.setCameraEnabled(enabled).catch(err => {
                console.error('Error toggling camera in LiveKit:', err);
            });
        }
    }

    // Start screen sharing
    async startScreenShare() {
        try {
            if (this.room && this.room.localParticipant) {
                // Enable screen share track in LiveKit SFU
                const screenShareTracks = await this.room.localParticipant.setScreenShareEnabled(true);
                // Return a MediaStream from the track to keep return type contract intact
                const track = screenShareTracks?.track;
                if (track) {
                    this.screenStream = new MediaStream([track.mediaStreamTrack]);
                    return this.screenStream;
                }
            }

            // Fallback for demo/unconfigured rooms
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: false
            });
            this.screenStream = screenStream;
            return screenStream;
        } catch (error) {
            console.error('Error starting screen share:', error);
            throw error;
        }
    }

    // Stop screen sharing
    stopScreenShare() {
        if (this.room && this.room.localParticipant) {
            this.room.localParticipant.setScreenShareEnabled(false).catch(err => {
                console.error('Error stopping screen share in LiveKit:', err);
            });
        }
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }
    }

    // Join a room and connect to LiveKit SFU
    async joinRoom(roomId, userId, shouldPublish = true) {
        this.currentRoomId = roomId;
        this.currentUserId = userId;

        try {
            console.log(`🎥 LiveKit: Joining room ${roomId} (user: ${userId})`);

            // Fetch token from our backend API
            const tokenRes = await webrtcAPI.getToken(roomId, userId, userId);
            if (!tokenRes.success) {
                throw new Error(tokenRes.message || 'Failed to generate token');
            }

            const { token, serverUrl, isMock } = tokenRes;

            if (isMock) {
                console.warn('⚠️ LiveKit credentials are not configured. Standard mock connections only.');
                return;
            }

            // Create LiveKit Room
            this.room = new Room({
                adaptiveStream: true, // Optimizes bandwidth dynamically based on video tile size
                dynacast: true       // Automatically pauses publishing when video is off-screen
            });

            // Track subscribed handler
            this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                if (track.kind === 'video' || track.kind === 'audio') {
                    console.log(`📡 LiveKit: Subscribed to track (${track.kind}) from ${participant.identity}`);

                    // Build a unified MediaStream for the participant (or reuse track stream)
                    const stream = new MediaStream([track.mediaStreamTrack]);

                    // Dispatch event matching the existing interface to update GroupMode.jsx UI
                    const event = new CustomEvent('webrtc:remoteStream', {
                        detail: { userId: participant.identity, stream }
                    });
                    window.dispatchEvent(event);

                    const trackEvent = new CustomEvent('webrtc:remoteTrack', {
                        detail: { userId: participant.identity, stream, track }
                    });
                    window.dispatchEvent(trackEvent);
                }
            });

            // Track unsubscribed handler
            this.room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
                console.log(`📡 LiveKit: Unsubscribed track (${track.kind}) from ${participant.identity}`);
                // Trigger left event to clean up player
                const event = new CustomEvent('webrtc:userLeft', {
                    detail: { userId: participant.identity }
                });
                window.dispatchEvent(event);
            });

            // Participant connected/disconnected events
            this.room.on(RoomEvent.ParticipantConnected, (participant) => {
                console.log(`👤 Participant connected to SFU: ${participant.identity}`);
            });

            this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
                console.log(`👤 Participant left SFU: ${participant.identity}`);
                const event = new CustomEvent('webrtc:userLeft', {
                    detail: { userId: participant.identity }
                });
                window.dispatchEvent(event);
            });

            // Connect to LiveKit server
            await this.room.connect(serverUrl, token);
            console.log('✅ Connected to LiveKit Room successfully!');

            // If we have an existing localStream from initializeLocalMedia and shouldPublish is true, publish those tracks
            if (this.localStream && shouldPublish) {
                console.log('📡 LiveKit: Publishing existing media tracks...');
                for (const track of this.localStream.getTracks()) {
                    if (track.kind === 'video') {
                        await this.room.localParticipant.publishTrack(track, { name: 'camera' });
                    } else if (track.kind === 'audio') {
                        await this.room.localParticipant.publishTrack(track, { name: 'microphone' });
                    }
                }
            } else if (shouldPublish) {
                // Otherwise fallback to enabling directly
                await this.room.localParticipant.enableCameraAndMicrophone();
            } else {
                console.log('📡 LiveKit: Joined as viewer (no media published)');
            }

        } catch (error) {
            console.error('❌ LiveKit connection error:', error);
            // Fallback for development if local node-server or token generation errors out
            console.warn('⚠️ Could not establish LiveKit SFU connection. Falling back to local/demo streaming.');
        }
    }

    // Leave room
    leaveRoom() {
        if (this.room) {
            try {
                this.room.disconnect();
            } catch (err) {
                console.error('Error disconnecting from LiveKit room:', err);
            }
            this.room = null;
        }

        // Stop local streams
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }

        this.currentRoomId = null;
        this.currentUserId = null;
    }

    // Get all remote streams
    getRemoteStreams() {
        const streams = new Map();
        if (this.room) {
            this.room.participants.forEach((participant, identity) => {
                const videoPub = participant.getTrackPublication('camera');
                const audioPub = participant.getTrackPublication('microphone');
                
                const tracks = [];
                if (videoPub && videoPub.track?.mediaStreamTrack) {
                    tracks.push(videoPub.track.mediaStreamTrack);
                }
                if (audioPub && audioPub.track?.mediaStreamTrack) {
                    tracks.push(audioPub.track.mediaStreamTrack);
                }

                if (tracks.length > 0) {
                    streams.set(identity, new MediaStream(tracks));
                }
            });
        }
        return streams;
    }

    // Check if media devices are available
    static async checkMediaDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return {
                hasCamera: devices.some(device => device.kind === 'videoinput'),
                hasMicrophone: devices.some(device => device.kind === 'audioinput'),
                devices
            };
        } catch (error) {
            console.error('Error checking media devices:', error);
            return { hasCamera: false, hasMicrophone: false, devices: [] };
        }
    }
}

// Export singleton instance
const webrtcService = new WebRTCService();
export default webrtcService;
