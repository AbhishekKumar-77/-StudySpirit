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
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:openrelay.metered.ca:80' },
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turns:openrelay.metered.ca:443?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            }
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

    // Toggle camera with dynamic track acquisition if track missing
    async toggleCamera(enabled) {
        if (!this.localStream) {
            if (enabled) {
                const s = await this.initializeLocalMedia({ video: true, audio: true });
                return s;
            }
            return;
        }

        let videoTrack = this.localStream.getVideoTracks()[0];

        // If user wants camera ON, but had no video track or it ended, request camera from browser
        if (enabled && (!videoTrack || videoTrack.readyState === 'ended')) {
            try {
                const newMedia = await navigator.mediaDevices.getUserMedia({ video: true });
                const newTrack = newMedia.getVideoTracks()[0];
                if (newTrack) {
                    if (videoTrack) {
                        this.localStream.removeTrack(videoTrack);
                    }
                    this.localStream.addTrack(newTrack);
                    videoTrack = newTrack;

                    // Update track in all active RTCPeerConnections
                    this.peerConnections.forEach((pc, peerId) => {
                        const senders = pc.getSenders();
                        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                        if (videoSender) {
                            videoSender.replaceTrack(newTrack);
                        } else {
                            pc.addTrack(newTrack, this.localStream);
                            this.initiateOffer(peerId).catch(e => console.warn("Renegotiation failed:", e));
                        }
                    });
                }
            } catch (err) {
                console.error('Error acquiring new video track on camera toggle:', err);
            }
        }

        if (videoTrack) {
            videoTrack.enabled = enabled;
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

        console.log(`🔌 WebRTC Mesh: Creating PeerConnection for peer ${targetUserId}`);
        const pc = new RTCPeerConnection({ iceServers: this.iceServers });
        pc._candidateQueue = [];

        // Add local tracks to peer connection
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                pc.addTrack(track, this.localStream);
            });
        }

        // Handle incoming remote tracks
        pc.ontrack = (event) => {
            console.log(`📹 WebRTC Mesh: Received remote stream track from ${targetUserId}, kind: ${event.track.kind}`);
            const remoteStream = event.streams[0] || new MediaStream([event.track]);

            if (!remoteStream.getTracks().some(t => t.id === event.track.id)) {
                remoteStream.addTrack(event.track);
            }

            const dispatchStream = () => {
                window.dispatchEvent(new CustomEvent('webrtc:remoteStream', {
                    detail: { userId: targetUserId, stream: remoteStream }
                }));
            };

            event.track.onmute = () => {
                console.log(`Track muted from ${targetUserId}: ${event.track.kind}`);
                dispatchStream();
            };
            event.track.onunmute = () => {
                console.log(`Track unmuted from ${targetUserId}: ${event.track.kind}`);
                dispatchStream();
            };

            if (this.callbacks.onRemoteStream) {
                this.callbacks.onRemoteStream(targetUserId, remoteStream);
            }

            dispatchStream();
        };

        // Handle local ICE candidates
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

    // Flush queued ICE candidates after remote description is set
    async processCandidateQueue(pc) {
        if (pc._candidateQueue && pc._candidateQueue.length > 0) {
            console.log(`📦 Flushing ${pc._candidateQueue.length} queued ICE candidates`);
            for (const cand of pc._candidateQueue) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (e) {
                    console.error('Error adding queued ICE candidate:', e);
                }
            }
            pc._candidateQueue = [];
        }
    }

    // Join room & setup Socket.io WebRTC signaling events
    async joinRoom(roomId, userId, shouldPublish = true) {
        this.currentRoomId = roomId;
        this.currentUserId = userId;

        console.log(`🎥 WebRTC Mesh: Joining room ${roomId} as user ${userId}`);

        // Ensure local media is initialized
        if (shouldPublish && !this.localStream) {
            await this.initializeLocalMedia();
        }

        const socket = connectSocket();

        // 1. Existing users in room handler (Receiver of event is the NEW JOINER -> initiates offers to existing users)
        socket.off('webrtc:existingUsers');
        socket.on('webrtc:existingUsers', async (existingUserIds) => {
            console.log(`👥 Existing users in room:`, existingUserIds);
            for (const peerId of existingUserIds) {
                if (peerId && peerId !== userId) {
                    await this.initiateOffer(peerId);
                }
            }
        });

        // 2. New user joined handler (Receiver of event is EXISTING USER -> prepares peer connection, awaits offer)
        socket.off('webrtc:userJoined');
        socket.on('webrtc:userJoined', (data) => {
            const peerId = data.userId;
            console.log(`👤 New user joined WebRTC room: ${peerId}`);
            if (peerId && peerId !== userId) {
                this.createPeerConnection(peerId);
            }
        });

        // 3. WebRTC Offer handler
        socket.off('webrtc:offer');
        socket.on('webrtc:offer', async (data) => {
            if (data.to === userId) {
                console.log(`📡 Received WebRTC offer from ${data.from}`);
                const pc = this.createPeerConnection(data.from);
                
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                    await this.processCandidateQueue(pc);

                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    socket.emit('webrtc:answer', {
                        from: userId,
                        to: data.from,
                        answer,
                        roomId
                    });
                } catch (err) {
                    console.error('Error handling WebRTC offer:', err);
                }
            }
        });

        // 4. WebRTC Answer handler
        socket.off('webrtc:answer');
        socket.on('webrtc:answer', async (data) => {
            if (data.to === userId) {
                console.log(`📡 Received WebRTC answer from ${data.from}`);
                const pc = this.peerConnections.get(data.from);
                if (pc) {
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                        await this.processCandidateQueue(pc);
                    } catch (err) {
                        console.error('Error setting remote answer:', err);
                    }
                }
            }
        });

        // 5. ICE Candidate handler
        socket.off('webrtc:iceCandidate');
        socket.on('webrtc:iceCandidate', async (data) => {
            if (data.to === userId) {
                const pc = this.peerConnections.get(data.from);
                if (pc && data.candidate) {
                    if (pc.remoteDescription) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                        } catch (e) {
                            console.error('Error adding ICE candidate:', e);
                        }
                    } else {
                        pc._candidateQueue.push(data.candidate);
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

    // Initiate WebRTC offer to a target peer
    async initiateOffer(peerId) {
        try {
            console.log(`🚀 Initiating WebRTC offer to ${peerId}`);
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
