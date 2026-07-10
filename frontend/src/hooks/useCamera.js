import { useState, useEffect, useRef } from 'react';

/**
 * useCamera - Custom hook for managing camera permission, starting/stopping webcam stream.
 */
export default function useCamera(enabled, videoRef) {
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

    const startCamera = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('Camera not supported or requires HTTPS.');
                setCameraEnabled(false);
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
        } catch (err) {
            console.error("Camera error:", err);
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
