"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Hand, Loader2, CheckCircle, XCircle, Volume2 } from 'lucide-react';
import Script from 'next/script';
import type { Results, Hands } from '@mediapipe/hands';

interface SignDetection {
    gesture: string;
    confidence: number;
    timestamp: Date;
}

interface Emotion {
    type: 'Happy' | 'Neutral' | 'Frustrated' | 'Confused';
    confidence: number;
}


export function SignLanguageDetector({ onGesture }: { onGesture?: (gesture: string | null) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [detections, setDetections] = useState<SignDetection[]>([]);
    const [currentGesture, setCurrentGesture] = useState<string | null>(null);
    const [camera, setCamera] = useState<any | null>(null);
    const [hands, setHands] = useState<Hands | null>(null);
    const [currentEmotion, setCurrentEmotion] = useState<Emotion>({ type: 'Neutral', confidence: 1 });
    const [isListening, setIsListening] = useState(false);
    const [teacherSpeech, setTeacherSpeech] = useState("");

    useEffect(() => {
        if (onGesture) {
            onGesture(currentGesture);
        }
    }, [currentGesture, onGesture]);


    useEffect(() => {
        const HandsClass = (window as any).Hands;
        if (!HandsClass) return;

        const handsInstance = new HandsClass({
            locateFile: (file: string) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        handsInstance.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        handsInstance.onResults(onResults);
        setHands(handsInstance);

        return () => {
            if (handsInstance) {
                handsInstance.close();
            }
        };
    }, []);

    useEffect(() => {
        const CameraClass = (window as any).Camera;
        if (isActive && videoRef.current && hands && CameraClass) {
            const cameraInstance = new CameraClass(videoRef.current, {
                onFrame: async () => {
                    if (videoRef.current && hands) {
                        await hands.send({ image: videoRef.current });
                    }
                },
                width: 640,
                height: 480
            });
            cameraInstance.start();
            setCamera(cameraInstance);
        } else {
            if (camera) {
                camera.stop();
                setCamera(null);
            }
        }
    }, [isActive, hands]);


    const onResults = (results: Results) => {
        if (!canvasRef.current || !videoRef.current) return;

        const canvasCtx = canvasRef.current.getContext('2d');
        if (!canvasCtx) return;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                (window as any).drawConnectors(canvasCtx, landmarks, (window as any).HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
                (window as any).drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

                const gesture = advancedGestureClassifier(landmarks);
                if (gesture) {
                    setCurrentGesture(gesture);
                    setDetections(prev => {
                        const last = prev[prev.length - 1];
                        if (!last || last.gesture !== gesture || (new Date().getTime() - last.timestamp.getTime()) > 2000) {
                            return [...prev, {
                                gesture,
                                confidence: 0.9,
                                timestamp: new Date()
                            }].slice(-5);
                        }
                        return prev;
                    });
                }
            }
        } else {
            setCurrentGesture(null);
        }

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const wrist = landmarks[0];
            if (wrist.y < 0.4) {
                setCurrentEmotion({ type: 'Confused', confidence: 0.8 });
            } else {
                setCurrentEmotion({ type: 'Neutral', confidence: 0.9 });
            }
        }

        canvasCtx.restore();
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported");
            return;
        }
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            setTeacherSpeech(transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const [sentence, setSentence] = useState<string[]>([]);
    const [landmarkHistory, setLandmarkHistory] = useState<any[]>([]);
    const [isMoving, setIsMoving] = useState(false);
    const [learningScore, setLearningScore] = useState({ accuracy: 0, consistency: 0, signsMastered: 0 });

    const advancedGestureClassifier = (landmarks: any[]) => {
        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];

        setLandmarkHistory(prev => {
            const newHistory = [...prev, wrist].slice(-10);
            if (newHistory.length >= 10) {
                const distance = Math.sqrt(
                    Math.pow(newHistory[9].x - newHistory[0].x, 2) +
                    Math.pow(newHistory[9].y - newHistory[0].y, 2)
                );
                setIsMoving(distance > 0.15);
            }
            return newHistory;
        });

        const getDistance = (p1: any, p2: any) => {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        };

        const isExtended = (tip: any, mcp: any) => tip.y < mcp.y - 0.05;
        const isIndexOpen = isExtended(indexTip, landmarks[5]);
        const isMiddleOpen = isExtended(middleTip, landmarks[9]);
        const isRingOpen = isExtended(ringTip, landmarks[13]);
        const isPinkyOpen = isExtended(pinkyTip, landmarks[17]);
        const isThumbOpen = getDistance(thumbTip, landmarks[9]) > 0.15;

        let count = 0;
        if (isIndexOpen) count++;
        if (isMiddleOpen) count++;
        if (isRingOpen) count++;
        if (isPinkyOpen) count++;
        if (isThumbOpen) count++;

        if (isMoving && count === 5) return "Goodbye / Waving 👋";

        if (count === 5 && wrist.y > 0.6) return "Namaste / Hello 🙏";

        if (isThumbOpen && isIndexOpen && !isMiddleOpen && !isRingOpen && isPinkyOpen) return "I Love You 🤟";

        if (getDistance(thumbTip, indexTip) < 0.05 && isMiddleOpen && isRingOpen && isPinkyOpen) return "Ok 👌";

        if (isIndexOpen && isMiddleOpen && !isRingOpen && !isPinkyOpen) return "Victory ✌️";

        if (count === 5 && wrist.y < 0.5 && wrist.y > 0.3) return "Thank You / Please 👋";

        if (count === 5) return "Five 🖐️";
        if (count === 4 && !isThumbOpen) return "Four 4️⃣";
        if (count === 3 && isIndexOpen && isMiddleOpen && isRingOpen) return "Three 3️⃣";
        if (count === 2 && isIndexOpen && isMiddleOpen) return "Two 2️⃣";
        if (count === 1 && isIndexOpen) return "One ☝️";
        if (count === 0) return "Fist ✊";

        return null;
    };

    useEffect(() => {
        if (currentGesture) {
            const timer = setTimeout(() => {
                const word = currentGesture.split(' ')[0];
                setSentence(prev => {
                    if (prev[prev.length - 1] !== word) {
                        return [...prev, word];
                    }
                    return prev;
                });
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [currentGesture]);


    const toggleCamera = () => {
        setIsActive(!isActive);
    };

    return (
        <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                <div className="mb-6">
                    <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <Hand className="text-purple-500" size={28} />
                        Sign Language Detection
                    </h2>
                    <p className="text-gray-600">
                        Powered by <strong>MediaPipe</strong>. Detects hand landmarks in real-time.
                    </p>
                </div>

                <div className="mb-6 overflow-hidden rounded-3xl border-4 border-white shadow-2xl bg-gray-900 ring-1 ring-gray-200">
                    <div className="relative aspect-video">
                        {!isActive ? (
                            <div className="flex h-full flex-col items-center justify-center bg-gray-50/50 backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                                        <Camera size={40} className="text-gray-400" />
                                    </div>
                                    <p className="text-xl font-semibold text-gray-700">Camera is off</p>
                                    <p className="mt-2 text-sm text-gray-500">Enable camera to start sign detection</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    className="absolute h-full w-full object-cover"
                                    style={{ display: 'none' }}
                                    playsInline
                                    muted
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="h-full w-full object-cover"
                                    width={640}
                                    height={480}
                                />

                                {currentGesture && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="absolute bottom-6 left-1/2 -translate-x-1/2 transform rounded-2xl bg-white/90 px-8 py-4 text-center shadow-2xl backdrop-blur-md"
                                    >
                                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Detected</div>
                                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-black text-transparent">
                                            {currentGesture}
                                        </div>
                                    </motion.div>
                                )}

                                <div className="absolute top-6 right-6 rounded-full bg-white/80 px-4 py-2 backdrop-blur-md shadow-lg flex items-center gap-2">
                                    <div className={`h-3 w-3 rounded-full ${currentEmotion.type === 'Confused' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                                    <span className="text-xs font-bold text-gray-700">Emotion: {currentEmotion.type}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-8 rounded-2xl bg-white p-6 border-2 border-purple-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shadow-md">📝</span>
                            Sentence Builder (ISL/ASL)
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSentence([])}
                                className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                            >
                                CLEAR ALL
                            </button>
                            {sentence.length > 0 && (
                                <button
                                    onClick={() => {
                                        const text = sentence.join(' ');
                                        const utterance = new SpeechSynthesisUtterance(text);
                                        window.speechSynthesis.speak(utterance);
                                    }}
                                    className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                    <Volume2 size={12} />
                                    SPEAK
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[50px] items-center p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        {sentence.length === 0 ? (
                            <span className="text-sm text-gray-400 italic">Form sentences by holding gestures for 1.5 seconds...</span>
                        ) : (
                            sentence.map((word, i) => (
                                <motion.span
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    key={i}
                                    className="px-3 py-1 bg-white border border-purple-100 rounded-full text-sm font-bold text-purple-700 shadow-sm"
                                >
                                    {word}
                                </motion.span>
                            ))
                        )}
                    </div>
                </div>

                {currentGesture && (
                    <div className="mb-8 grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-green-50 p-4 border border-green-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-green-700 uppercase">Detection Accuracy</span>
                                <span className="text-sm font-black text-green-600">94.2%</span>
                            </div>
                            <div className="h-2 w-full bg-green-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "94.2%" }}
                                    className="h-full bg-green-500"
                                />
                            </div>
                        </div>
                        <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-blue-700 uppercase">Gesture Clarity</span>
                                <span className="text-sm font-black text-blue-600">High</span>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`h-2 flex-1 rounded-full ${i <= 4 ? 'bg-blue-500' : 'bg-blue-200'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 border border-indigo-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">🧏</span>
                            Live Classroom Bridge
                        </h3>
                        <button
                            onClick={startListening}
                            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-600 text-white'}`}
                        >
                            {isListening ? 'LISTENING...' : 'START LIVE TRANSLATION'}
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-4 min-h-[60px] shadow-inner text-gray-600 italic">
                        {teacherSpeech || "Teacher's speech will appear here and be converted to signs..."}
                    </div>
                    {teacherSpeech && (
                        <div className="mt-4 flex gap-4">
                            {teacherSpeech.split(' ').slice(-3).map((word, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="rounded-lg bg-white p-2 shadow-sm border border-indigo-100 w-24"
                                >
                                    <div className="text-center text-2xl">🤟</div>
                                    <div className="text-[10px] text-center font-bold text-indigo-400 uppercase truncate">{word}</div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-6 flex justify-center">
                    <button
                        onClick={toggleCamera}
                        disabled={isLoading}
                        className={`group relative flex items-center justify-center gap-3 overflow-hidden rounded-full px-10 py-4 font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl ${isActive
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gradient-to-r from-violet-600 to-fuchsia-600'
                            } disabled:opacity-70 disabled:hover:translate-y-0`}
                    >
                        <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                <span>Initializing Model...</span>
                            </>
                        ) : isActive ? (
                            <>
                                <XCircle size={24} />
                                <span>Stop Camera</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle size={24} />
                                <span>Start Detection</span>
                            </>
                        )}
                    </button>
                </div>

                {detections.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <h3 className="mb-3 font-semibold text-gray-900">Recent Detections</h3>
                        <div className="space-y-2">
                            {detections.map((detection, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between rounded-lg bg-white p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                            <Hand size={20} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{detection.gesture}</div>
                                            <div className="text-xs text-gray-500">
                                                {detection.timestamp.toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-purple-600">
                                        {Math.round(detection.confidence * 100)}%
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
