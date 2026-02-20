import Peer from 'simple-peer';
import { getSocket } from './groupAPI';

class WebRTCService {
    constructor() {
        this.localStream = null;
        this.screenStream = null;
        this.peers = new Map(); // Map of userId -> Peer instance
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
    }

    // Toggle camera
    toggleCamera(enabled) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    // Start screen sharing
    async startScreenShare() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always'
                },
                audio: false
            });

            this.screenStream = screenStream;

            // Add screen stream to all peer connections instead of replacing
            this.peers.forEach((peer) => {
                peer.addStream(screenStream);
            });

            // Listen for screen share stop
            const videoTrack = screenStream.getVideoTracks()[0];
            videoTrack.onended = () => {
                this.stopScreenShare();
            };

            return screenStream;
        } catch (error) {
            console.error('Error starting screen share:', error);
            throw error;
        }
    }

    // Stop screen sharing
    stopScreenShare() {
        if (this.screenStream) {
            this.peers.forEach((peer) => {
                try {
                    peer.removeStream(this.screenStream);
                } catch (e) {
                    console.error('Error removing screen stream:', e);
                }
            });

            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }
    }

    // Join a room and set up WebRTC connections
    joinRoom(roomId, userId) {
        this.currentRoomId = roomId;
        this.currentUserId = userId;

        const socket = getSocket();
        if (!socket) {
            console.error('Socket not connected');
            return;
        }

        // Request to join room
        socket.emit('webrtc:join', { roomId, userId });

        // Listen for existing users in the room
        socket.on('webrtc:existingUsers', (userIds) => {
            console.log('Existing users in room:', userIds);
            // Create peer connections to existing users (we initiate)
            userIds.forEach(existingUserId => {
                if (existingUserId !== userId) {
                    this.createPeer(existingUserId, true);
                }
            });
        });

        // Listen for new user joining
        socket.on('webrtc:userJoined', (data) => {
            console.log('New user joined:', data.userId);
            if (data.userId !== userId) {
                // Don't create peer yet, wait for them to send offer
            }
        });

        // Listen for WebRTC offer
        socket.on('webrtc:offer', async (data) => {
            console.log('Received offer from:', data.from);
            if (data.to === userId) {
                this.handleOffer(data.from, data.offer);
            }
        });

        // Listen for WebRTC answer
        socket.on('webrtc:answer', (data) => {
            console.log('Received answer from:', data.from);
            if (data.to === userId) {
                this.handleAnswer(data.from, data.answer);
            }
        });

        // Listen for ICE candidate
        socket.on('webrtc:iceCandidate', (data) => {
            if (data.to === userId) {
                this.handleIceCandidate(data.from, data.candidate);
            }
        });

        // Listen for user leaving
        socket.on('webrtc:userLeft', (data) => {
            console.log('User left:', data.userId);
            this.removePeer(data.userId);
        });
    }

    // Create a peer connection
    createPeer(userId, initiator) {
        console.log(`Creating peer for ${userId}, initiator: ${initiator}`);

        const peer = new Peer({
            initiator,
            stream: this.localStream,
            trickle: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' },
                    {
                        urls: "turn:openrelay.metered.ca:80",
                        username: "openrelayproject",
                        credential: "openrelayproject"
                    },
                    {
                        urls: "turn:openrelay.metered.ca:443",
                        username: "openrelayproject",
                        credential: "openrelayproject"
                    },
                    {
                        urls: "turn:openrelay.metered.ca:443?transport=tcp",
                        username: "openrelayproject",
                        credential: "openrelayproject"
                    }
                ]
            }
        });

        // Handle signals (offer/answer/ice candidates)
        peer.on('signal', (signal) => {
            const socket = getSocket();
            if (signal.type === 'offer') {
                socket.emit('webrtc:offer', {
                    from: this.currentUserId,
                    to: userId,
                    offer: signal,
                    roomId: this.currentRoomId
                });
            } else if (signal.type === 'answer') {
                socket.emit('webrtc:answer', {
                    from: this.currentUserId,
                    to: userId,
                    answer: signal,
                    roomId: this.currentRoomId
                });
            } else {
                // ICE candidate
                socket.emit('webrtc:iceCandidate', {
                    from: this.currentUserId,
                    to: userId,
                    candidate: signal,
                    roomId: this.currentRoomId
                });
            }
        });

        // Handle incoming stream
        peer.on('stream', (stream) => {
            console.log('Received stream from:', userId);
            // Emit event for UI to handle
            const event = new CustomEvent('webrtc:remoteStream', {
                detail: { userId, stream }
            });
            window.dispatchEvent(event);
        });

        // Some modern browsers fire track events instead of populating stream beforehand
        peer.on('track', (track, stream) => {
            console.log(`Received track (${track.kind}) from:`, userId);
            const event = new CustomEvent('webrtc:remoteTrack', {
                detail: { userId, stream, track }
            });
            window.dispatchEvent(event);
        });

        // Handle connection
        peer.on('connect', () => {
            console.log('Peer connected:', userId);
        });

        // Handle errors
        peer.on('error', (err) => {
            console.error('Peer error:', userId, err);
        });

        // Handle close
        peer.on('close', () => {
            console.log('Peer closed:', userId);
            this.removePeer(userId);
        });

        this.peers.set(userId, peer);
        return peer;
    }

    // Handle incoming offer
    handleOffer(fromUserId, offer) {
        console.log('Handling offer from:', fromUserId);

        // Create peer if doesn't exist (we are not initiator)
        if (!this.peers.has(fromUserId)) {
            const peer = this.createPeer(fromUserId, false);
            peer.signal(offer);
        } else {
            this.peers.get(fromUserId).signal(offer);
        }
    }

    // Handle incoming answer
    handleAnswer(fromUserId, answer) {
        console.log('Handling answer from:', fromUserId);
        const peer = this.peers.get(fromUserId);
        if (peer) {
            peer.signal(answer);
        }
    }

    // Handle ICE candidate
    handleIceCandidate(fromUserId, candidate) {
        const peer = this.peers.get(fromUserId);
        if (peer) {
            peer.signal(candidate);
        }
    }

    // Remove peer
    removePeer(userId) {
        const peer = this.peers.get(userId);
        if (peer) {
            peer.destroy();
            this.peers.delete(userId);

            // Emit event for UI to remove video element
            const event = new CustomEvent('webrtc:userLeft', {
                detail: { userId }
            });
            window.dispatchEvent(event);
        }
    }

    // Leave room
    leaveRoom() {
        const socket = getSocket();
        if (socket && this.currentRoomId) {
            socket.emit('webrtc:leave', {
                roomId: this.currentRoomId,
                userId: this.currentUserId
            });
        }

        // Clean up all peers
        this.peers.forEach((peer, userId) => {
            peer.destroy();
        });
        this.peers.clear();

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

        // Remove socket listeners
        if (socket) {
            socket.off('webrtc:existingUsers');
            socket.off('webrtc:userJoined');
            socket.off('webrtc:offer');
            socket.off('webrtc:answer');
            socket.off('webrtc:iceCandidate');
            socket.off('webrtc:userLeft');
        }
    }

    // Get all remote streams
    getRemoteStreams() {
        const streams = new Map();
        this.peers.forEach((peer, userId) => {
            if (peer.streams && peer.streams.length > 0) {
                streams.set(userId, peer.streams[0]);
            }
        });
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
