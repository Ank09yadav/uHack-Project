"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';

interface AttentionMonitorProps {
    onAttentionLoss?: () => void;
    onAttentionGain?: () => void;
    isActive: boolean;
}

export const AttentionMonitor: React.FC<AttentionMonitorProps> = ({
    onAttentionLoss,
    onAttentionGain,
    isActive
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isAttentive, setIsAttentive] = useState(true);
    const [status, setStatus] = useState<'initializing' | 'active' | 'error'>('initializing');
    const [isLookingAway, setIsLookingAway] = useState(false);
    const lookingAwayTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isActive || !videoRef.current) return;

        const FaceMesh = (window as any).FaceMesh;
        if (!FaceMesh) {
            console.error("MediaPipe FaceMesh not found");
            setStatus('error');
            return;
        }

        const mesh = new FaceMesh({
            locateFile: (file: string) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        mesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        mesh.onResults((results: any) => {
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                const landmarks = results.multiFaceLandmarks[0];
                const noseTip = landmarks[1];
                const isCentered = noseTip.x > 0.2 && noseTip.x < 0.8 && noseTip.y > 0.2 && noseTip.y < 0.8;

                if (!isCentered) {
                    handleAttentionLoss();
                } else {
                    handleAttentionGain();
                }
            } else {
                handleAttentionLoss();
            }
        });

        const Camera = (window as any).Camera;
        if (!Camera) {
            console.error("MediaPipe Camera not found");
            setStatus('error');
            return;
        }

        const camera = new Camera(videoRef.current, {
            onFrame: async () => {
                await mesh.send({ image: videoRef.current! });
            },
            width: 640,
            height: 480
        });

        camera.start()
            .then(() => setStatus('active'))
            .catch((err: any) => {
                console.error("Camera failed", err);
                setStatus('error');
            });

        return () => {
            camera.stop();
            mesh.close();
        };
    }, [isActive]);

    const handleAttentionLoss = () => {
        if (!isLookingAway) {
            setIsLookingAway(true);
            lookingAwayTimer.current = setTimeout(() => {
                setIsAttentive(false);
                onAttentionLoss?.();
            }, 7000);
        }
    };

    const handleAttentionGain = () => {
        if (isLookingAway) {
            setIsLookingAway(false);
            if (lookingAwayTimer.current) {
                clearTimeout(lookingAwayTimer.current);
            }
        }
        if (!isAttentive) {
            setIsAttentive(true);
            onAttentionGain?.();
        }
    };

    if (!isActive) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="relative group">
                <motion.div
                    animate={{
                        scale: isAttentive ? 1 : 1.1,
                        backgroundColor: isAttentive ? '#10B981' : '#EF4444'
                    }}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-xl cursor-help"
                >
                    {isAttentive ? (
                        <Eye size={18} className="animate-pulse" />
                    ) : (
                        <EyeOff size={18} />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider">
                        {status === 'initializing' ? 'Initializing AI...' :
                            status === 'error' ? 'Camera Error' :
                                isAttentive ? 'Attentive' : 'Focus Lost'}
                    </span>
                </motion.div>

                <video
                    ref={videoRef}
                    className="hidden"
                    playsInline
                    muted
                />

                <AnimatePresence>
                    {!isAttentive && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="absolute bottom-full right-0 mb-4 w-64 rounded-2xl bg-white p-4 shadow-2xl border border-red-100"
                        >
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-red-100 p-2 text-red-600">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Break Suggested!</p>
                                    <p className="text-sm text-gray-600">You seem distracted. Should we pause the lesson?</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
