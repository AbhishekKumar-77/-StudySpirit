import { useState, useEffect, useRef } from 'react';

/**
 * useCamera - Custom hook for managing camera permission, starting/stopping webcam stream.
 * Automatically starts stream and continuously binds stream to videoRef.current across all session rooms.
 */
export default function useCamera(enabled = true, videoRef) {
    const [cameraEnabled, setCameraEnabled] = useState(enabled);
    const streamRef = useRef(null);

    useEffect(() => {
        if (cameraEnabled) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [cameraEnabled]);

    // Continuously ensure videoRef.current has the active stream attached when components switch
    useEffect(() => {
        let timer;
        if (cameraEnabled && streamRef.current) {
            timer = setInterval(() => {
                if (videoRef && videoRef.current && videoRef.current.srcObject !== streamRef.current) {
                    videoRef.current.srcObject = streamRef.current;
                }
            }, 300);
        }
        return () => clearInterval(timer);
    }, [cameraEnabled, videoRef]);

    const startCamera = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('Camera not supported or requires HTTPS.');
                setCameraEnabled(false);
                return;
            }
            // Request video stream automatically
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: { ideal: 640 }, height: { ideal: 480 } }, 
                audio: false 
            });
            streamRef.current = stream;

            if (videoRef && videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraEnabled(true);
        } catch (err) {
            console.error("Camera access error:", err);
            setCameraEnabled(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const toggleCamera = () => {
        setCameraEnabled(prev => !prev);
    };

    return {
        cameraEnabled,
        toggleCamera,
        startCamera,
        stopCamera
    };
}
