import { getSocket, connectSocket } from './groupAPI';

class WebRTCService {
    constructor() {
        this.localStream = null;
        this.screenStream = null;
        this.currentRoomId = null;
        this.currentUserId = null;
        this.peerConnections = new Map(); // targetUserId -> RTCPeerConnection
        this.callbacks = {};
        this.iceServers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ];
    }

    // Initialize local media (camera + microphone)
    async initializeLocalMedia(constraints = { video: true, audio: true }) {
        try {
            if (this.localStream) {
                return this.localStream;
            }
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.localStream = stream;
            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            // Fallback: audio only if camera is blocked/busy
            try {
                const audioOnly = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                this.localStream = audioOnly;
                return audioOnly;
            } catch (err2) {
                console.error('Media devices completely unavailable:', err2);
                return null;
            }
        }
    }

    // Legacy helper to init WebRTC with callbacks
    async initWebRTC(userId, roomId, callbacks = {}) {
        this.callbacks = callbacks;
        const stream = await this.initializeLocalMedia();
        if (callbacks.onLocalStream && stream) {
            callbacks.onLocalStream(stream);
        }
        await this.joinRoom(roomId, userId, true);
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
                video: { cursor: 'always' },
                audio: false
            });
            this.screenStream = screenStream;

            // Replace video track for all active peer connections
            const screenTrack = screenStream.getVideoTracks()[0];
            this.peerConnections.forEach((pc) => {
                const senders = pc.getSenders();
                const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(screenTrack);
                }
            });

            screenTrack.onended = () => {
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
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }

        // Revert back to camera track
        if (this.localStream) {
            const cameraTrack = this.localStream.getVideoTracks()[0];
            if (cameraTrack) {
                this.peerConnections.forEach((pc) => {
                    const senders = pc.getSenders();
                    const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(cameraTrack);
                    }
                });
            }
        }
    }

    // Create RTCPeerConnection for a target user
    createPeerConnection(targetUserId) {
        if (this.peerConnections.has(targetUserId)) {
            return this.peerConnections.get(targetUserId);
        }

        console.log(`🔌 WebRTC: Creating PeerConnection for target user ${targetUserId}`);
        const pc = new RTCPeerConnection({ iceServers: this.iceServers });

        // Add local tracks to peer connection
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                pc.addTrack(track, this.localStream);
            });
        }

        // Handle incoming remote tracks
        pc.ontrack = (event) => {
            console.log(`📹 WebRTC: Received remote stream track from ${targetUserId}`);
            const remoteStream = event.streams[0] || new MediaStream([event.track]);

            if (this.callbacks.onRemoteStream) {
                this.callbacks.onRemoteStream(targetUserId, remoteStream);
            }

            // Dispatch global CustomEvent for UI components
            window.dispatchEvent(new CustomEvent('webrtc:remoteStream', {
                detail: { userId: targetUserId, stream: remoteStream }
            }));
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const socket = getSocket();
                if (socket) {
                    socket.emit('webrtc:iceCandidate', {
                        from: this.currentUserId,
                        to: targetUserId,
                        candidate: event.candidate,
                        roomId: this.currentRoomId
                    });
                }
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`📡 PeerConnection state with ${targetUserId}: ${pc.connectionState}`);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                this.removePeer(targetUserId);
            }
        };

        this.peerConnections.set(targetUserId, pc);
        return pc;
    }

    // Join a room and bind Socket.io WebRTC signaling events
    async joinRoom(roomId, userId, shouldPublish = true) {
        this.currentRoomId = roomId;
        this.currentUserId = userId;

        console.log(`🎥 WebRTC Mesh: Joining room ${roomId} as user ${userId}`);

        // Ensure local media is initialized
        if (shouldPublish && !this.localStream) {
            await this.initializeLocalMedia();
        }

        const socket = connectSocket();

        // 1. Existing users in room handler
        socket.off('webrtc:existingUsers');
        socket.on('webrtc:existingUsers', async (existingUserIds) => {
            console.log(`👥 Existing users in room:`, existingUserIds);
            for (const peerId of existingUserIds) {
                if (peerId !== userId) {
                    await this.initiateOffer(peerId);
                }
            }
        });

        // 2. New user joined handler
        socket.off('webrtc:userJoined');
        socket.on('webrtc:userJoined', async (data) => {
            const peerId = data.userId;
            console.log(`👤 New user joined WebRTC room: ${peerId}`);
            if (peerId !== userId) {
                await this.initiateOffer(peerId);
            }
        });

        // 3. WebRTC Offer handler
        socket.off('webrtc:offer');
        socket.on('webrtc:offer', async (data) => {
            if (data.to === userId) {
                console.log(`📡 Received WebRTC offer from ${data.from}`);
                const pc = this.createPeerConnection(data.from);
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.emit('webrtc:answer', {
                    from: userId,
                    to: data.from,
                    answer,
                    roomId
                });
            }
        });

        // 4. WebRTC Answer handler
        socket.off('webrtc:answer');
        socket.on('webrtc:answer', async (data) => {
            if (data.to === userId) {
                console.log(`📡 Received WebRTC answer from ${data.from}`);
                const pc = this.peerConnections.get(data.from);
                if (pc) {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                }
            }
        });

        // 5. ICE Candidate handler
        socket.off('webrtc:iceCandidate');
        socket.on('webrtc:iceCandidate', async (data) => {
            if (data.to === userId) {
                const pc = this.peerConnections.get(data.from);
                if (pc && data.candidate) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                    } catch (e) {
                        console.error('Error adding ICE candidate:', e);
                    }
                }
            }
        });

        // 6. User Left handler
        socket.off('webrtc:userLeft');
        socket.on('webrtc:userLeft', (data) => {
            console.log(`👤 User left room: ${data.userId}`);
            this.removePeer(data.userId);
        });

        // Emit join event to room
        socket.emit('webrtc:join', { roomId, userId });
    }

    // Initiate WebRTC offer to a peer
    async initiateOffer(peerId) {
        try {
            const pc = this.createPeerConnection(peerId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const socket = getSocket();
            if (socket) {
                socket.emit('webrtc:offer', {
                    from: this.currentUserId,
                    to: peerId,
                    offer,
                    roomId: this.currentRoomId
                });
            }
        } catch (err) {
            console.error(`Error initiating offer to ${peerId}:`, err);
        }
    }

    // Remove single peer connection
    removePeer(userId) {
        if (this.peerConnections.has(userId)) {
            const pc = this.peerConnections.get(userId);
            pc.close();
            this.peerConnections.delete(userId);
        }
        window.dispatchEvent(new CustomEvent('webrtc:userLeft', { detail: { userId } }));
    }

    // Leave room and cleanup all connections
    leaveRoom() {
        const socket = getSocket();
        if (socket && this.currentRoomId && this.currentUserId) {
            socket.emit('webrtc:leave', { roomId: this.currentRoomId, userId: this.currentUserId });
        }

        // Close all peer connections
        this.peerConnections.forEach((pc) => pc.close());
        this.peerConnections.clear();

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
        return new Map();
    }

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

const webrtcService = new WebRTCService();
export default webrtcService;
